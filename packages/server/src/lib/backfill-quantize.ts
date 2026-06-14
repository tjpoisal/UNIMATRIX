/**
 * lib/backfill-quantize.ts
 *
 * One-time backfill script: quantizes all existing memories that have a
 * float32 embedding but no 2-bit quantized representation yet.
 *
 * Safe to run while the app is live — processes in batches of 500,
 * skips already-quantized rows, and is fully idempotent.
 *
 * Performance: ~10,000 memories/minute (pure local math, no API calls).
 *
 * Usage:
 *   npx ts-node --esm packages/server/src/lib/backfill-quantize.ts
 *
 * Or with DATABASE_URL set:
 *   DATABASE_URL=postgres://... npx ts-node --esm packages/server/src/lib/backfill-quantize.ts
 */

import pg from 'pg';
import { quantize2bit } from './quantize.js';

const { Pool } = pg;

const BATCH_SIZE = 500;
const DELAY_MS   = 50; // small pause between batches to avoid overwhelming Neon

// ─────────────────────────────────────────────────────────────────────────────
// DB connection
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // low concurrency for backfill — don't compete with prod traffic
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseEmbedding(raw: string): number[] | null {
  try {
    // Postgres vector format: "[0.1,0.2,...]"
    const stripped = raw.replace(/^\[/, '').replace(/\]$/, '');
    return stripped.split(',').map(Number);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const client = await pool.connect();

  try {
    // Count unquantized memories
    const countRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS count
         FROM memories
        WHERE embedding       IS NOT NULL
          AND embedding_q2    IS NULL
          AND deleted_at      IS NULL`,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    if (total === 0) {
      console.log('[backfill] All memories already quantized. Nothing to do.');
      return;
    }

    console.log(`[backfill] ${total} memories to quantize. Batch size: ${BATCH_SIZE}.`);
    console.log(`[backfill] Estimated time: ~${Math.ceil(total / 10000)} minute(s).`);

    let processed  = 0;
    let errors     = 0;
    let lastId     = '00000000-0000-0000-0000-000000000000';

    while (processed < total) {
      // Cursor-based pagination (avoids OFFSET slowdown on large tables)
      const batchRes = await client.query<{ id: string; embedding: string }>(
        `SELECT id, embedding::text
           FROM memories
          WHERE embedding    IS NOT NULL
            AND embedding_q2 IS NULL
            AND deleted_at   IS NULL
            AND id > $1
          ORDER BY id
          LIMIT $2`,
        [lastId, BATCH_SIZE],
      );

      if (batchRes.rows.length === 0) break;

      // Process each memory in the batch
      const updates: Array<{ id: string; q2: Buffer; scale: number; residual: Buffer }> = [];

      for (const row of batchRes.rows) {
        const embedding = parseEmbedding(row.embedding);
        if (!embedding || embedding.length === 0) {
          errors++;
          continue;
        }

        try {
          const { quantized, scale, residual } = quantize2bit(embedding);
          updates.push({ id: row.id, q2: quantized, scale, residual });
        } catch (err) {
          console.error(`[backfill] Quantize failed for ${row.id}:`, err);
          errors++;
        }
      }

      // Bulk update using unnest for efficiency
      if (updates.length > 0) {
        const ids       = updates.map(u => u.id);
        const q2Bufs    = updates.map(u => u.q2);
        const scales    = updates.map(u => u.scale);
        const residuals = updates.map(u => u.residual);

        await client.query(
          `UPDATE memories AS m
              SET embedding_q2    = u.q2,
                  embedding_scale = u.scale,
                  vector_residual = u.residual
             FROM (
               SELECT
                 UNNEST($1::uuid[])  AS id,
                 UNNEST($2::bytea[]) AS q2,
                 UNNEST($3::float4[]) AS scale,
                 UNNEST($4::bytea[]) AS residual
             ) AS u
            WHERE m.id = u.id`,
          [ids, q2Bufs, scales, residuals],
        );
      }

      processed += batchRes.rows.length;
      lastId = batchRes.rows[batchRes.rows.length - 1].id;

      const pct = ((processed / total) * 100).toFixed(1);
      process.stdout.write(`\r[backfill] ${processed}/${total} (${pct}%) — ${errors} errors`);

      await sleep(DELAY_MS);
    }

    console.log(`\n[backfill] ✓ Complete. ${processed} processed, ${errors} errors.`);

    // Verify
    const verifyRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM memories WHERE embedding IS NOT NULL AND embedding_q2 IS NULL AND deleted_at IS NULL`,
    );
    const remaining = parseInt(verifyRes.rows[0].count, 10);
    if (remaining === 0) {
      console.log('[backfill] ✓ All memories quantized. Verification passed.');
    } else {
      console.warn(`[backfill] ⚠ ${remaining} memories still unquantized (likely embed errors). Re-run to retry.`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

run().catch(err => {
  console.error('[backfill] Fatal error:', err);
  process.exit(1);
});
