/**
 * src/handlers/getRecent.ts
 *
 * MCP Tool: get_recent
 *
 * Returns the last N memories across ALL LLMs and ALL devices for this user.
 * Pure chronological order — no semantic scoring.
 *
 * This is the hero tool for cross-LLM continuity:
 *   1. User ends a ChatGPT session on iPhone
 *   2. Opens Claude on iPad
 *   3. Claude calls get_recent() at session start
 *   4. Claude sees exactly what ChatGPT stored — full context, no re-explaining
 *
 * No provider / LLM filter. Memories written by any AI are returned equally.
 */

import { withUserContextReadOnly } from '../db/client.js';
import { withAudit }               from '../middleware/audit.js';
import { estimateTokenCount }      from '../utils/tokens.js';
import type { MemoryStatus, MemorySource } from '../types/db.js';
import type { RecalledMemory }     from '../types/domain.js';
import type {
  GetRecentInput,
  SearchMemoriesOutput,
  ClientProfile,
} from '../types/mcp.js';
import { TOKEN_BUDGET } from '../types/mcp.js';

interface RecentRow {
  id:            string;
  user_id:       string;
  space_id:      string | null;
  org_id:        string | null;
  summary:       string;
  status:        string;
  superseded_by: string | null;
  superseded_at: Date   | null;
  confidence:    string | null;
  source:        string;
  hint:          string | null;
  created_at:    Date;
  indexed_at:    Date   | null;
  tags:          string[];
  days_since:    string;
}

export const getRecentHandler = withAudit(
  'get_recent',
  async (
    input:  GetRecentInput,
    userId: string,
  ): Promise<SearchMemoriesOutput> => {
    const profile: ClientProfile = input.profile ?? 'desktop';
    const maxTokens = profile === 'mobile'
      ? TOKEN_BUDGET.MOBILE
      : TOKEN_BUDGET.DESKTOP;

    const rows = await withUserContextReadOnly(userId, async (client) => {
      const res = await client.query<RecentRow>(
        `SELECT
           m.id,
           m.user_id,
           m.space_id,
           m.org_id,
           m.summary,
           m.status,
           m.superseded_by,
           m.superseded_at,
           m.confidence,
           m.source,
           m.hint,
           m.created_at,
           m.indexed_at,
           (
             SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
               FROM memory_tags t
              WHERE t.memory_id = m.id
           ) AS tags,
           EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
         FROM memories m
        WHERE m.user_id    = current_user_id()::uuid
          AND m.indexed_at IS NOT NULL
          AND m.status     = 'active'
        ORDER BY m.created_at DESC
        LIMIT $1`,
        [input.limit ?? 10],
      );
      return res.rows;
    });

    // Token-budget gating
    let tokenCount = 0;
    let truncated  = false;
    const final: RecalledMemory[] = [];
    let rank = 1;

    for (const r of rows) {
      const est = estimateTokenCount(r.summary);
      if (tokenCount + est > maxTokens) { truncated = true; break; }

      final.push({
        id:               r.id,
        userId:           r.user_id,
        spaceId:          r.space_id,
        orgId:            r.org_id,
        summary:          r.summary,
        status:           r.status as MemoryStatus,
        supersededBy:     r.superseded_by,
        supersededAt:     r.superseded_at,
        confidence:       r.confidence !== null ? parseFloat(r.confidence) : null,
        source:           r.source as MemorySource,
        hint:             r.hint,
        tags:             r.tags ?? [],
        createdAt:        r.created_at,
        indexedAt:        r.indexed_at,
        relevanceScore:   1 / rank++,   // rank-based pseudo-score (1, 0.5, 0.33…)
        cosineSimilarity: 0,            // not applicable for recency sort
        daysSinceCreated: parseFloat(r.days_since),
      });
      tokenCount += est;
    }

    return {
      memories:   final,
      tokenCount: Math.round(tokenCount),
      truncated,
      profile,
    };
  },
);
