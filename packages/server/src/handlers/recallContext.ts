/**
 * src/handlers/recallContext.ts
 *
 * MCP Tool: recall_context
 *
 * The "Return to Context" (RTX) hero tool. Called when an LLM client opens
 * and wants to know where the user left off — without the user doing anything.
 *
 * Query strategy:
 *   1. Generate a 512-dim query embedding from input.topic (or "current context")
 *   2. Hybrid score: α × cosine_similarity + (1-α) × recency_decay
 *   3. Full-text pre-filter if input.topic is provided (tsvector @@ query)
 *   4. Token-budget gating: stop adding memories once maxTokens is reached
 *
 * Security:
 *   - All queries run inside withUserContextReadOnly → RLS enforced via session var
 *   - withAudit wrapper logs every call (timing + success/failure)
 *   - No verbatim content returned — summaries only
 *
 * Token budgets (from TOKEN_BUDGET):
 *   - desktop: 4,000 tokens — rich context for IDE / web clients
 *   - mobile:    800 tokens — compact payload for cellular / SwiftUI clients
 */

import { withUserContextReadOnlyRaw as withUserContextReadOnly } from '../db/client.js';
import { withAudit }               from '../middleware/audit.js';
import { generateQueryEmbedding }  from '../embeddings.js';
import { estimateTokenCount }      from '../utils/tokens.js';
import type { MemoryStatus, MemorySource } from '../types/db.js';
import type { RecalledMemory }     from '../types/domain.js';
import type {
  RecallContextInput,
  RecallContextOutput,
  ClientProfile,
} from '../types/mcp.js';
import { TOKEN_BUDGET }            from '../types/mcp.js';

// ---------------------------------------------------------------------------
// Scoring constants
// ---------------------------------------------------------------------------

/** Weight given to semantic similarity vs. recency. 0.7 = 70% semantic. */
const ALPHA       = 0.7;
/** Half-life in days for the recency decay term. Score halves every 30 days. */
const HALF_LIFE   = 30;

// ---------------------------------------------------------------------------
// Raw DB row shape (what pg returns from the query below)
// ---------------------------------------------------------------------------

interface RecallRow {
  id:             string;
  user_id:        string;
  space_id:       string | null;
  org_id:         string | null;
  summary:        string;
  status:         string;
  superseded_by:  string | null;
  superseded_at:  Date   | null;
  confidence:     string | null;   // pg returns numeric as string
  source:         string;
  hint:           string | null;
  created_at:     Date;
  indexed_at:     Date   | null;
  tags:           string[];
  cosine_sim:     string;          // pg numeric → string
  days_since:     string;          // pg float → string
  score:          string;          // pg float → string
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const recallContextHandler = withAudit(
  'recall_context',
  async (
    input: RecallContextInput,
    userId: string,
  ): Promise<RecallContextOutput> => {

    // ------------------------------------------------------------------
    // 1. Resolve client profile → token budget
    //    profile is now a first-class field on RecallContextInput (not a cast)
    // ------------------------------------------------------------------
    const profile: ClientProfile = input.profile ?? 'desktop';
    const maxTokens = profile === 'mobile'
      ? TOKEN_BUDGET.MOBILE
      : TOKEN_BUDGET.DESKTOP;

    // ------------------------------------------------------------------
    // 2. Generate query embedding BEFORE opening a DB connection.
    //    This is a Voyage AI network round-trip (~200ms). Doing it inside
    //    withUserContextReadOnly would block a pg pool connection for that
    //    entire duration — a DoS vector under load.
    // ------------------------------------------------------------------
    const queryText = input.topic?.trim() || 'current context';
    const embedding = await generateQueryEmbedding(queryText);

    // ------------------------------------------------------------------
    // 3. Hybrid search query
    //
    //    Parameters (always 4 — consistent count regardless of topic):
    //      $1 — query embedding vector
    //      $2 — LIMIT (input.limit + small buffer for dedup)
    //      $3 — spaceId filter (uuid or NULL)
    //      $4 — topic for full-text filter (text or NULL)
    //
    //    Tags are fetched via correlated subquery from memory_tags —
    //    there is no `tags` column on the memories table itself.
    // ------------------------------------------------------------------
    const sql = `
      WITH candidates AS (
        SELECT
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
          (m.embedding <=> $1::vector)              AS cosine_distance,
          EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
        FROM memories m
        WHERE m.user_id      = current_user_id()::uuid
          AND m.indexed_at   IS NOT NULL
          AND m.status       = 'active'
          AND ($3::uuid IS NULL OR m.space_id = $3::uuid)
          -- topic is used only for embedding-based ranking above,
          -- not as a hard FTS filter here (that would miss semantically
          -- relevant memories whose text doesn't contain the exact words)
      ),
      scored AS (
        SELECT *,
          (1.0 - cosine_distance)                              AS cosine_sim,
          POWER(0.5, days_since / ${HALF_LIFE}.0)              AS recency,
          ${ALPHA} * (1.0 - cosine_distance)
            + ${1 - ALPHA} * POWER(0.5, days_since / ${HALF_LIFE}.0) AS score
        FROM candidates
      )
      SELECT * FROM scored
      ORDER BY score DESC
      LIMIT $2
    `;

    // Fetch slightly more than the limit to absorb any dedup losses
    const fetchLimit = (input.limit ?? 10) + 5;

    const rows = await withUserContextReadOnly(userId, async (client) => {
      // Raise HNSW beam width for this query — trades ~5ms for better recall
      // accuracy at the tail (default ef_search=40 misses ~8% of true neighbors)
      await client.query(`SET LOCAL hnsw.ef_search = 100`);
      const res = await client.query<RecallRow>(sql, [
        JSON.stringify(embedding),  // $1 — pgvector accepts JSON array
        fetchLimit,                 // $2
        input.spaceId ?? null,      // $3
      ]);
      return res.rows;
    });

    // ------------------------------------------------------------------
    // 4. Dedup by id (keep highest-scored row per memory)
    // ------------------------------------------------------------------
    const seen = new Map<string, RecalledMemory>();

    for (const r of rows) {
      const score = parseFloat(r.score);
      const existing = seen.get(r.id);
      if (existing && existing.relevanceScore >= score) continue;

      seen.set(r.id, {
        // ---- All Memory fields (minus content) ----
        id:            r.id,
        userId:        r.user_id,
        spaceId:       r.space_id,
        orgId:         r.org_id,
        summary:       r.summary,          // guaranteed non-null (indexed_at IS NOT NULL)
        status:        r.status as MemoryStatus,
        supersededBy:  r.superseded_by,
        supersededAt:  r.superseded_at,
        confidence:    r.confidence !== null ? parseFloat(r.confidence) : null,
        source:        r.source as MemorySource,
        hint:          r.hint,
        tags:          r.tags ?? [],
        createdAt:     r.created_at,
        indexedAt:     r.indexed_at,
        // ---- RecalledMemory-specific fields ----
        relevanceScore:    score,
        cosineSimilarity:  parseFloat(r.cosine_sim),
        daysSinceCreated:  parseFloat(r.days_since),
      });
    }

    // ------------------------------------------------------------------
    // 5. Token-budget gating — stop adding memories once we hit the limit
    // ------------------------------------------------------------------
    let tokenCount = 0;
    let truncated  = false;
    const final: RecalledMemory[] = [];

    for (const m of seen.values()) {
      const est = estimateTokenCount(m.summary);
      if (tokenCount + est > maxTokens) {
        truncated = true;
        break;
      }
      final.push(m);
      tokenCount += est;
    }

    return {
      memories:    final,
      tokenCount:  Math.round(tokenCount),
      truncated,
      profile,
      decayLambda: HALF_LIFE,
    };
  },
);
