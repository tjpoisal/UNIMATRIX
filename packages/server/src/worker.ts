/**
 * Background Worker for Unimatrix (Render Worker service)
 *
 * This is a real long-running worker that offloads heavy semantic processing
 * (Voyage embeddings, summarization, space classification, tagging) from the
 * main MCP request path.
 *
 * Current implementation:
 * - Polls AgentRun rows with task='librarian' + status='pending' (enqueued by store_memory / supersede_memory)
 * - Executes the real Librarian (embeddings + summarize + tag + classifySpace)
 * - Updates the AgentRun to completed/failed and marks memory indexedAt
 * - Designed to be run as dedicated Render Worker (see render.yaml) or sidecar.
 *
 * To run locally:
 *   pnpm --filter server build
 *   DATABASE_URL=... node dist/worker.js
 *
 * On Render: Use the worker service definition in render.yaml (Docker recommended).
 */

import { processLibrarianJob } from './librarian/processJob.js';
import type { LibrarianJob } from './types/domain.js';
import { pool } from './db/client.js';

const POLL_INTERVAL_MS = 15_000; // 15 seconds
const BATCH_SIZE = 10;

async function getPendingLibrarianAgentRuns(): Promise<Array<{ id: string; userId: string; job: LibrarianJob }>> {
  const { rows } = await pool.query<{
    id: string;
    user_id: string;
    result: any;
  }>(
    `SELECT id, user_id, result
     FROM agent_runs
     WHERE task = 'librarian'
       AND status = 'pending'
     ORDER BY created_at ASC
     LIMIT $1`,
    [BATCH_SIZE]
  );

  const out: Array<{ id: string; userId: string; job: LibrarianJob }> = [];
  for (const r of rows) {
    try {
      const payload = typeof r.result === 'string' ? JSON.parse(r.result) : r.result;
      if (payload?.job) {
        out.push({
          id: r.id,
          userId: r.user_id,
          job: payload.job as LibrarianJob,
        });
      }
    } catch (e) {
      console.warn('[Worker] Bad AgentRun result payload for', r.id);
    }
  }
  return out;
}

async function markAgentRunCompleted(runId: string, result: any, memoryId: string) {
  await pool.query(
    `UPDATE agent_runs
     SET status = 'completed', result = $1, memory_ids = $2, updated_at = NOW()
     WHERE id = $3`,
    [JSON.stringify(result), [memoryId], runId]
  );
}

async function markAgentRunFailed(runId: string, errMsg: string) {
  await pool.query(
    `UPDATE agent_runs SET status = 'failed', error_msg = $1, updated_at = NOW() WHERE id = $2`,
    [errMsg, runId]
  );
}

async function markMemoryIndexed(memoryId: string) {
  await pool.query(`UPDATE memories SET indexed_at = NOW() WHERE id = $1`, [memoryId]);
}

async function processBatch() {
  const pendingRuns = await getPendingLibrarianAgentRuns();

  for (const run of pendingRuns) {
    const { id: runId, job } = run;

    if (!job.content) {
      await markAgentRunFailed(runId, 'No content in job payload');
      continue;
    }

    try {
      console.log(`[Worker] Processing AgentRun ${runId} for memory ${job.memoryId}`);
      const libResult = await processLibrarianJob(job);
      await markAgentRunCompleted(runId, libResult, job.memoryId);
      await markMemoryIndexed(job.memoryId);
      console.log(`[Worker] AgentRun ${runId} completed → space ${libResult.spaceId}`);
    } catch (err: any) {
      console.error(`[Worker] AgentRun ${runId} failed:`, err);
      await markAgentRunFailed(runId, err?.message || String(err));
    }
  }
}

async function main() {
  console.log('[Worker] Unimatrix background worker starting...');
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms, batch: ${BATCH_SIZE}`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await processBatch();
    } catch (err) {
      console.error('[Worker] Batch error (will retry):', err);
    }
    await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
  }
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('[Worker] Fatal error:', err);
    process.exit(1);
  });
}

export { main as runWorker, processBatch };
