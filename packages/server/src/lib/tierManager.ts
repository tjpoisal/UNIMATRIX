/**
 * src/lib/tierManager.ts
 *
 * Adaptive compression tier manager.
 *
 * Tiers:
 *   HOT   — accessed frequently or high importance → full float32 embedding retained
 *   WARM  — moderate access / medium importance → 2-bit Q2 + QJL residual (existing CSMTER)
 *   COLD  — rarely accessed, low importance → Q2 only, residual dropped, summary only
 *   ARCHIVE — stale + very low importance → content nulled, summary + triples retained
 *
 * Tier thresholds are evaluated on every Librarian job and on scheduled
 * maintenance passes. Tier transitions are logged in compression_version.
 */

import { withUserContextRaw } from '../db/client.js';

export type StorageTier = 'hot' | 'warm' | 'cold' | 'archive';

export interface TierDecision {
  tier:               StorageTier;
  compressionVersion: number;
  reason:             string;
}

// Thresholds — tune via env vars for easy production adjustment
const THRESHOLDS = {
  hotImportance:      parseFloat(process.env.TIER_HOT_IMPORTANCE      ?? '0.75'),
  hotAccessCount:     parseInt(process.env.TIER_HOT_ACCESS_COUNT       ?? '10', 10),
  warmImportance:     parseFloat(process.env.TIER_WARM_IMPORTANCE      ?? '0.35'),
  warmAccessCount:    parseInt(process.env.TIER_WARM_ACCESS_COUNT      ?? '3', 10),
  coldDaysStale:      parseInt(process.env.TIER_COLD_DAYS_STALE        ?? '30', 10),
  archiveDaysStale:   parseInt(process.env.TIER_ARCHIVE_DAYS_STALE     ?? '90', 10),
  archiveImportance:  parseFloat(process.env.TIER_ARCHIVE_IMPORTANCE   ?? '0.10'),
};

// Compression version per tier — bump when algorithm changes
const COMPRESSION_VERSION: Record<StorageTier, number> = {
  hot:     0,  // no extra compression beyond pgvector storage
  warm:    1,  // Q2 + QJL residual (CSMTER v1)
  cold:    2,  // Q2 only, residual nulled
  archive: 3,  // no embedding, summary + triples only
};

/**
 * Determine the correct storage tier for a memory given its current signals.
 */
export function decideTier(
  importance:      number,
  accessCount:     number,
  lastAccessedAt:  Date,
  currentTier?:    StorageTier,
): TierDecision {
  const daysSince = (Date.now() - lastAccessedAt.getTime()) / 86_400_000;

  // Archive: very old + very low importance
  if (daysSince >= THRESHOLDS.archiveDaysStale && importance <= THRESHOLDS.archiveImportance) {
    return { tier: 'archive', compressionVersion: COMPRESSION_VERSION.archive, reason: `stale ${Math.floor(daysSince)}d + imp ${importance.toFixed(2)}` };
  }

  // Hot: frequently accessed OR high importance
  if (importance >= THRESHOLDS.hotImportance || accessCount >= THRESHOLDS.hotAccessCount) {
    return { tier: 'hot', compressionVersion: COMPRESSION_VERSION.hot, reason: `imp ${importance.toFixed(2)} acc ${accessCount}` };
  }

  // Cold: stale + below warm thresholds
  if (daysSince >= THRESHOLDS.coldDaysStale) {
    return { tier: 'cold', compressionVersion: COMPRESSION_VERSION.cold, reason: `stale ${Math.floor(daysSince)}d` };
  }

  // Warm: default for active memories
  return { tier: 'warm', compressionVersion: COMPRESSION_VERSION.warm, reason: `active` };
}

/**
 * Apply a tier decision to a memory row.
 * Called inline during Librarian job and during scheduled re-tier passes.
 *
 * Tier transitions:
 *   → archive: nulls embedding and vector_residual, keeps summary + triples
 *   → cold:    nulls vector_residual only
 *   → warm:    no structural change (Q2 already present)
 *   → hot:     ensures full embedding is retained
 */
export async function applyTier(
  userId:    string,
  memoryId:  string,
  decision:  TierDecision,
): Promise<void> {
  await withUserContextRaw(userId, async (client) => {
    if (decision.tier === 'archive') {
      await client.query(
        `UPDATE memories
            SET storage_tier        = 'archive',
                compression_version = $1,
                embedding           = NULL,
                embedding_q2        = NULL,
                vector_residual     = NULL,
                last_tiered_at      = NOW()
          WHERE id = $2 AND user_id = current_user_id()::uuid`,
        [decision.compressionVersion, memoryId],
      );
    } else if (decision.tier === 'cold') {
      await client.query(
        `UPDATE memories
            SET storage_tier        = 'cold',
                compression_version = $1,
                vector_residual     = NULL,
                last_tiered_at      = NOW()
          WHERE id = $2 AND user_id = current_user_id()::uuid`,
        [decision.compressionVersion, memoryId],
      );
    } else {
      await client.query(
        `UPDATE memories
            SET storage_tier        = $1,
                compression_version = $2,
                last_tiered_at      = NOW()
          WHERE id = $3 AND user_id = current_user_id()::uuid`,
        [decision.tier, decision.compressionVersion, memoryId],
      );
    }
  });
}

/**
 * Batch re-tier pass for a single user.
 * Reads all non-archived memories, evaluates tier, applies if changed.
 * Safe to call from scheduled worker.
 */
export async function runReTierBatch(
  userId: string,
  options: { limit?: number } = {},
): Promise<{ evaluated: number; promoted: number; demoted: number }> {
  const limit = options.limit ?? 500;
  let evaluated = 0, promoted = 0, demoted = 0;

  await withUserContextRaw(userId, async (client) => {
    const rows = await client.query<{
      id:              string;
      importance:      string;
      access_count:    string;
      last_accessed_at: string;
      storage_tier:    StorageTier | null;
    }>(
      `SELECT id, importance, access_count, last_accessed_at, storage_tier
         FROM memories
        WHERE user_id  = current_user_id()::uuid
          AND status  != 'superseded'
          AND deleted_at IS NULL
        ORDER BY last_accessed_at ASC
        LIMIT $1`,
      [limit],
    );

    evaluated = rows.rows.length;

    for (const row of rows.rows) {
      const decision = decideTier(
        parseFloat(row.importance),
        parseInt(row.access_count, 10),
        new Date(row.last_accessed_at),
        row.storage_tier ?? undefined,
      );

      if (decision.tier === row.storage_tier) continue;

      const prev = row.storage_tier ?? 'warm';
      const tierOrder: StorageTier[] = ['hot', 'warm', 'cold', 'archive'];
      if (tierOrder.indexOf(decision.tier) < tierOrder.indexOf(prev)) promoted++;
      else demoted++;

      await applyTier(userId, row.id, decision);
    }
  });

  return { evaluated, promoted, demoted };
}
