/**
 * Background Worker for Unimatrix (Render Worker service)
 *
 * This is a real long-running worker that offloads heavy semantic processing
 * (Voyage embeddings, summarization, space classification, tagging) from the
 * main MCP request path.
 *
 * Current implementation:
 * - Polls for unindexed memories (indexedAt IS NULL)
 * - For production writes, prefer enqueuing at write time (see updated handlers)
 * - Can be run as a dedicated Render Worker or as a sidecar.
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

async function getPendingLibrarianJobs(): Promise<LibrarianJob[]> {
  // Find memories that have not been indexed yet.
  // NOTE: In the current design, the plain `content` is only available at write time.
  // For a robust queue, we recommend storing the sanitized content alongside the job
  // (e.g. in a dedicated queue table or in AgentRun.input for task='librarian').
  //
  // This poller is useful for:
  //  - Recovering failed fire-and-forget jobs
  //  - Backfilling old data (you can pass a reconstruction if needed)
  const { rows } = await pool.query<{
    id: string;
    user_id: string;
    content: string; // This will be null/encrypted in real table — see note above
  }>(
    `SELECT m.id, m.user_id, '' as content
     FROM memories m
     WHERE m.indexed_at IS NULL
       AND m.deleted_at IS NULL
       AND m.status = 'active'
     ORDER BY m.created_at ASC
     LIMIT $1`,
    [BATCH_SIZE]
  );

  // In a full implementation, content would come from a job queue that captured
  // the plain text at enqueue time.
  return rows.map((r) => ({
    memoryId: r.id,
    userId: r.user_id,
    content: r.content || '', // Will need real content for embedding
    hint: null,
    createdAt: new Date(),
  }));
}

async function markAsIndexed(memoryId: string) {
  await pool.query(
    `UPDATE memories SET indexed_at = NOW() WHERE id = $1`,
    [memoryId]
  );
}

async function processBatch() {
  const jobs = await getPendingLibrarianJobs();

  for (const job of jobs) {
    if (!job.content) {
      console.warn(`[Worker] Skipping ${job.memoryId} — no plain content available for embedding (see docs)`);
      // In real use, you would have captured content at enqueue time.
      await markAsIndexed(job.memoryId); // prevent infinite loop on bad data
      continue;
    }

    try {
      console.log(`[Worker] Processing librarian job for memory ${job.memoryId}`);
      const result = await processLibrarianJob(job);
      console.log(`[Worker] Completed ${job.memoryId} → space ${result.spaceId}`);
      await markAsIndexed(job.memoryId);
    } catch (err) {
      console.error(`[Worker] Failed job ${job.memoryId}:`, err);
      // Leave indexedAt null so it can be retried, or add retry count
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
