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
 *   pnpm --filter @unimatrix/server build
 *   DATABASE_URL=... node dist/worker.js
 *
 * On Render: Use the worker service definition in render.yaml (Docker recommended).
 */

import { processLibrarianJob } from './librarian/processJob.js';
import type { LibrarianJob } from './types/domain.js';
import { prisma, pool } from './db/client.js';

const POLL_INTERVAL_MS = 15_000; // 15 seconds
const BATCH_SIZE = 10;

async function getPendingLibrarianAgentRuns(): Promise<Array<{ id: string; userId: string; job: LibrarianJob }>> {
  const runs = await prisma.agentRun.findMany({
    where: {
      task: 'librarian',
      status: 'pending',
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
    select: { id: true, userId: true, result: true },
  });

  const out: Array<{ id: string; userId: string; job: LibrarianJob }> = [];
  for (const r of runs) {
    try {
      const payload = r.result as any;
      if (payload?.job) {
        out.push({
          id: r.id,
          userId: r.userId,
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
  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      status: 'completed',
      result: result as any,
      memoryIds: [memoryId],
    },
  });
}

async function markAgentRunFailed(runId: string, errMsg: string) {
  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      status: 'failed',
      errorMsg: errMsg,
    },
  });
}

async function markMemoryIndexed(memoryId: string) {
  await prisma.memory.update({
    where: { id: memoryId },
    data: { indexedAt: new Date() },
  });
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

// ── TTL Expiry Cleanup ─────────────────────────────────────────────────────

const TTL_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // hourly

async function expireOldMemories(): Promise<void> {
  try {
    const result = await prisma.memory.updateMany({
      where: {
        expiresAt:  { lte: new Date() },
        deletedAt:  null,
        status:     { not: 'archived' },
      },
      data: {
        deletedAt: new Date(),
        status:    'archived',
      },
    });
    if (result.count > 0) {
      console.log(`[Worker] TTL expiry: soft-deleted ${result.count} expired memories`);
    }
  } catch (err: any) {
    console.error('[Worker] TTL expiry error:', err?.message);
  }
}

async function main() {
  console.log('[Worker] Unimatrix background worker starting...');
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms, batch: ${BATCH_SIZE}`);

  // Run TTL cleanup immediately on start, then hourly
  await expireOldMemories();
  setInterval(expireOldMemories, TTL_CLEANUP_INTERVAL_MS);

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
