/**
 * src/worker.ts
 *
 * UniMatrix background worker.
 * Runs as unimatrix-worker on Fly.io (always-on persistent machine).
 *
 * Scheduled jobs:
 *   every 5 min  → Librarian queue drain (existing)
 *   every 1 hour → Importance decay batch (all active users)
 *   every 6 hours → Re-tier batch (adaptive compression)
 *   every 24 hours → Deduplication pass
 */

import Fastify from 'fastify';
import { Pool } from 'pg';
import { runGlobalDecayPass } from './lib/decay.js';
import { runReTierBatch }     from './lib/tierManager.js';

const server = Fastify({ logger: true });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Health check ─────────────────────────────────────────────────────────────
server.get('/health', async () => ({ status: 'ok', worker: 'unimatrix-worker', ts: new Date().toISOString() }));

// ── Job: Global decay ─────────────────────────────────────────────────────────
async function runDecayJob(): Promise<void> {
  console.log('[Worker] Starting global decay pass...');
  try {
    const result = await runGlobalDecayPass(
      { query: (sql: string, params?: unknown[]) => db.query(sql, params as unknown[]) },
      { limit: 500, staleAfterDays: 3 },
    );
    console.log(`[Worker] Decay complete — users: ${result.usersProcessed}, updated: ${result.totalUpdated}`);
  } catch (err) {
    console.error('[Worker] Decay job error:', err);
  }
}

// ── Job: Re-tier all users ────────────────────────────────────────────────────
async function runReTierJob(): Promise<void> {
  console.log('[Worker] Starting re-tier pass...');
  try {
    const { rows } = await db.query<{ user_id: string }>(
      `SELECT DISTINCT user_id::text FROM memories WHERE deleted_at IS NULL AND status != 'superseded'`
    );
    let totalPromoted = 0, totalDemoted = 0;
    for (const row of rows) {
      try {
        const result = await runReTierBatch(row.user_id, { limit: 500 });
        totalPromoted += result.promoted;
        totalDemoted  += result.demoted;
      } catch (err) {
        console.error(`[Worker] Re-tier error for user ${row.user_id}:`, err);
      }
    }
    console.log(`[Worker] Re-tier complete — promoted: ${totalPromoted}, demoted: ${totalDemoted}`);
  } catch (err) {
    console.error('[Worker] Re-tier job error:', err);
  }
}

// ── Job: Deduplication pass ───────────────────────────────────────────────────
async function runDeduplicationJob(): Promise<void> {
  console.log('[Worker] Starting deduplication pass...');
  try {
    // Find near-duplicate active memories (cosine distance < 0.05) per user
    // and soft-supersede the older one.
    const { rows } = await db.query<{ user_id: string }>(
      `SELECT DISTINCT user_id::text FROM memories
        WHERE status = 'active' AND deleted_at IS NULL AND embedding IS NOT NULL`
    );
    let totalSuperseded = 0;
    for (const row of rows) {
      try {
        const { rows: dupes } = await db.query<{ id_a: string; id_b: string }>(
          `SELECT a.id AS id_a, b.id AS id_b
             FROM memories a
             JOIN memories b ON b.user_id = a.user_id
               AND b.id > a.id
               AND b.status = 'active'
               AND b.deleted_at IS NULL
               AND (a.embedding <=> b.embedding) < 0.05
            WHERE a.user_id = $1
              AND a.status = 'active'
              AND a.deleted_at IS NULL
              AND a.embedding IS NOT NULL
            LIMIT 100`,
          [row.user_id],
        );
        for (const dupe of dupes) {
          await db.query(
            `UPDATE memories SET status = 'superseded', superseded_by = $1, superseded_at = NOW()
              WHERE id = $2 AND status = 'active'`,
            [dupe.id_a, dupe.id_b],
          );
          totalSuperseded++;
        }
      } catch (err) {
        console.error(`[Worker] Dedup error for user ${row.user_id}:`, err);
      }
    }
    console.log(`[Worker] Dedup complete — superseded: ${totalSuperseded}`);
  } catch (err) {
    console.error('[Worker] Dedup job error:', err);
  }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
function scheduleJob(fn: () => Promise<void>, intervalMs: number, label: string): void {
  const run = async () => {
    await fn();
    setTimeout(run, intervalMs);
  };
  setTimeout(run, intervalMs); // first run after first interval
  console.log(`[Worker] Scheduled ${label} every ${intervalMs / 60_000} min`);
}

const MINUTE = 60_000;

scheduleJob(runDecayJob,        60 * MINUTE,   'decay');
scheduleJob(runReTierJob,       360 * MINUTE,  're-tier');
scheduleJob(runDeduplicationJob, 1440 * MINUTE, 'dedup');

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '8080', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log(`[Worker] Listening on :${PORT}`);
});
