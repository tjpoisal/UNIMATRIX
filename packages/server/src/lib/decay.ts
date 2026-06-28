/**
 * src/lib/decay.ts
 *
 * Importance decay — exponential decay per semantic category.
 * Extracted from processJob.ts — this is its sole home.
 *
 * Batch decay runs as a non-blocking setImmediate after each Librarian job,
 * AND as a scheduled maintenance job in the worker (see worker.ts).
 */

import { withUserContextRaw } from '../db/client.js';

// Decay constants (λ) per semantic category.
// Lower λ → slower decay (stable facts fade less than episodic events).
export const DECAY_LAMBDA: Record<string, number> = {
  personal:  0.001,
  work:      0.002,
  research:  0.002,
  learning:  0.003,
  code:      0.003,
  general:   0.004,
  default:   0.004,
};

/**
 * Compute decayed importance score using exponential decay.
 * importance(t) = importance₀ × e^(−λ × days)
 */
export function decayedImportance(
  original:       number,
  semanticCat:    string | null,
  lastAccessedAt: Date,
): number {
  const λ         = DECAY_LAMBDA[semanticCat ?? 'default'] ?? DECAY_LAMBDA.default;
  const daysSince = (Date.now() - lastAccessedAt.getTime()) / 86_400_000;
  return Math.max(original * Math.exp(-λ * daysSince), 0.01);
}

/**
 * Run a batch decay pass for a single user.
 * Processes up to `limit` stale memories (default 200).
 * Safe to call from both setImmediate (post-job) and scheduled worker.
 */
export async function runDecayBatch(
  userId: string,
  options: { limit?: number; staleAfterDays?: number } = {},
): Promise<{ processed: number; updated: number }> {
  const limit         = options.limit         ?? 200;
  const staleAfterDays = options.staleAfterDays ?? 3;

  let processed = 0;
  let updated   = 0;

  await withUserContextRaw(userId, async (client) => {
    const stale = await client.query<{
      id:              string;
      importance:      string;
      semantic_cat:    string | null;
      last_accessed_at: string;
    }>(
      `SELECT id, importance, semantic_cat, last_accessed_at
         FROM memories
        WHERE user_id          = current_user_id()::uuid
          AND last_accessed_at < NOW() - ($1 || ' days')::interval
          AND importance        > 0.05
          AND deleted_at        IS NULL
          AND status           != 'superseded'
        ORDER BY last_accessed_at ASC
        LIMIT $2`,
      [staleAfterDays, limit],
    );

    processed = stale.rows.length;

    for (const row of stale.rows) {
      const newImp = decayedImportance(
        parseFloat(row.importance),
        row.semantic_cat,
        new Date(row.last_accessed_at),
      );
      if (newImp < parseFloat(row.importance) - 0.01) {
        await client.query(
          `UPDATE memories SET importance = $1 WHERE id = $2`,
          [newImp, row.id],
        );
        updated++;
      }
    }
  });

  return { processed, updated };
}

/**
 * Run a full-system decay pass across ALL users.
 * Used by the scheduled maintenance worker.
 */
export async function runGlobalDecayPass(
  db: { query: (sql: string, params?: unknown[]) => Promise<{ rows: { user_id: string }[] }> },
  options: { limit?: number; staleAfterDays?: number } = {},
): Promise<{ usersProcessed: number; totalUpdated: number }> {
  const users = await db.query(
    `SELECT DISTINCT user_id::text FROM memories
      WHERE last_accessed_at < NOW() - '3 days'::interval
        AND importance > 0.05
        AND deleted_at IS NULL`,
  );

  let totalUpdated = 0;

  for (const row of users.rows) {
    try {
      const { updated } = await runDecayBatch(row.user_id, options);
      totalUpdated += updated;
    } catch (err) {
      console.error(`[Decay] Error processing user ${row.user_id}:`, err);
    }
  }

  return { usersProcessed: users.rows.length, totalUpdated };
}
