/**
 * src/handlers/searchMemories.ts
 *
 * MCP Tool: search_memories
 *
 * Explicit search with user-controlled filters — vs recall_context which is
 * automatic/implicit. Use this when the LLM has a specific query to answer.
 *
 * Differences from recall_context:
 *   - query is required (not optional)
 *   - can filter by tags (array intersection)
 *   - can filter by status (active / superseded / archived)
 *   - no recency decay — pure relevance ranking
 *   - still token-budget gated, still returns summaries only (no content)
 */

import { withUserContextReadOnly } from '../db/client.js';
import { withAudit }               from '../middleware/audit.js';
import { generateQueryEmbedding }  from '../embeddings.js';
import { estimateTokenCount }      from '../utils/tokens.js';
import type { MemoryStatus, MemorySource, RecalledMemory } from '../types/domain.js';
import type {
  SearchMemoriesInput,
  SearchMemoriesOutput,
  ClientProfile,
} from '../types/mcp.js';
import { TOKEN_BUDGET } from '../types/mcp.js';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const searchMemoriesHandler = withAudit(
  'search_memories',
  async (
    input:  SearchMemoriesInput,
    userId: string,
  ): Promise<SearchMemoriesOutput> => {

    const profile: ClientProfile = input.profile ?? 'desktop';
    const maxTokens = profile === 'mobile'
      ? TOKEN_BUDGET.MOBILE
      : TOKEN_BUDGET.DESKTOP;

    // Generate query embedding
    const embedding = await generateQueryEmbedding(input.query);

    interface SearchRow {
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
      cosine_sim:    string;
      days_since:    string;
      score:         string;
    }

    const rows = await withUserContextReadOnly(userId, async (client) => {
      await client.query(`SET LOCAL hnsw.ef_search = 100`);
      const res = await client.query<SearchRow>(
        `WITH candidates AS (
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
             1.0 - (m.embedding <=> $1::vector)           AS cosine_sim,
             EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
           FROM memories m
          WHERE m.user_id    = current_user_id()::uuid
            AND m.indexed_at IS NOT NULL
            AND ($3::uuid IS NULL OR m.space_id = $3::uuid)
            AND ($4::text IS NULL OR m.status   = $4::memory_status)
            AND ($5::text IS NULL
                 OR m.search_vector @@ plainto_tsquery('english', $5::text))
            AND (
              $6::text[] IS NULL
              OR (
                SELECT COUNT(*)
                  FROM memory_tags t2
                 WHERE t2.memory_id = m.id
                   AND t2.tag = ANY($6::text[])
              ) > 0
            )
        )
        SELECT *, cosine_sim AS score
          FROM candidates
         ORDER BY cosine_sim DESC
         LIMIT $2`,
        [
          JSON.stringify(embedding),              // $1 — vector
          (input.limit ?? 10) + 5,               // $2 — fetch buffer
          input.spaceId ?? null,                  // $3
          input.status  ?? null,                  // $4
          input.query,                            // $5 — full-text (always set)
          input.tags && input.tags.length > 0
            ? input.tags
            : null,                              // $6 — tags filter
        ],
      );
      return res.rows;
    });

    // Dedup by id, keep highest cosine_sim
    const seen = new Map<string, RecalledMemory>();
    for (const r of rows) {
      const score = parseFloat(r.cosine_sim);
      const existing = seen.get(r.id);
      if (existing && existing.cosineSimilarity >= score) continue;

      seen.set(r.id, {
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
        relevanceScore:   score,
        cosineSimilarity: score,
        daysSinceCreated: parseFloat(r.days_since),
      });
    }

    // Token-budget gating
    let tokenCount = 0;
    let truncated  = false;
    const final: RecalledMemory[] = [];

    for (const m of seen.values()) {
      const est = estimateTokenCount(m.summary);
      if (tokenCount + est > maxTokens) { truncated = true; break; }
      final.push(m);
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
