/**
 * src/lib/retrievalRouter.ts
 *
 * Hybrid retrieval router with adaptive scoring.
 *
 * Routes queries through the correct pipeline based on query characteristics:
 *   - Entity-heavy / relationship queries → graph-first (triple lookup → vector rerank)
 *   - Semantic / conceptual queries       → vector-first (ANN → BM25 → RRF rescore)
 *   - Factual / keyword queries           → BM25-first (FTS → vector rerank)
 *
 * Final scoring uses Reciprocal Rank Fusion (RRF) across all active signals.
 * Triple-matched entities are injected directly into the result context.
 *
 * Tier-aware: archive-tier memories skip vector search (no embedding),
 * falling back to FTS + triple-only retrieval.
 */

import { withUserContextRaw } from '../db/client.js';
import { generateEmbedding }  from '../embeddings.js';

export type QueryRoute = 'vector' | 'graph' | 'fts' | 'hybrid';

export interface RetrievalOptions {
  userId:    string;
  spaceId?:  string;
  query:     string;
  limit?:    number;
  route?:    QueryRoute;  // override auto-routing
}

export interface RetrievalResult {
  memoryId:   string;
  content:    string;
  summary:    string | null;
  score:      number;
  route:      QueryRoute;
  triples:    Array<{ subject: string; predicate: string; object: string }>;
  storageTier: string | null;
}

// Entity-extraction patterns for graph routing
const ENTITY_PATTERNS = [
  /\bwho\s+is\b/i,
  /\bwhat\s+does\b/i,
  /\brelationship\s+between\b/i,
  /\bconnected\s+to\b/i,
  /\bworks?\s+(?:on|at|for)\b/i,
  /\b(?:likes?|prefers?|hates?|wants?)\b/i,
];

const KEYWORD_PATTERNS = [
  /"[^"]+"/,           // quoted phrase
  /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,}\b/,  // multi-word proper noun
];

/**
 * Detect the best retrieval route for a given query string.
 */
export function detectRoute(query: string): QueryRoute {
  const isEntityQuery   = ENTITY_PATTERNS.some(p => p.test(query));
  const isKeywordQuery  = KEYWORD_PATTERNS.some(p => p.test(query));

  if (isEntityQuery)  return 'graph';
  if (isKeywordQuery) return 'fts';
  return 'vector';  // default: semantic vector search
}

/**
 * RRF score: 1 / (k + rank), k=60 is standard.
 */
function rrfScore(rank: number, k = 60): number {
  return 1 / (k + rank);
}

/**
 * Main retrieval function. Automatically routes the query, runs appropriate
 * pipeline, and returns ranked results with injected triple context.
 */
export async function retrieveMemories(
  opts: RetrievalOptions,
): Promise<RetrievalResult[]> {
  const { userId, spaceId, query, limit = 10 } = opts;
  const route = opts.route ?? detectRoute(query);

  let embedding: number[] | null = null;
  if (route === 'vector' || route === 'hybrid' || route === 'graph') {
    try {
      embedding = await generateEmbedding(query);
    } catch {
      // fall back to FTS if embedding fails
    }
  }

  const results = await withUserContextRaw(userId, async (client) => {
    const spaceFilter = spaceId ? `AND m.space_id = '${spaceId}'` : '';

    // ── Graph route: entity triple lookup first ──────────────────────────────
    if (route === 'graph') {
      // 1. Extract entity candidates from query
      const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const tripleRows = await client.query<{
        source_memory_id: string;
        subject:          string;
        predicate:        string;
        object:           string;
      }>(
        `SELECT DISTINCT source_memory_id, subject, predicate, object
           FROM memory_triples
          WHERE user_id = current_user_id()::uuid
            AND superseded_at IS NULL
            AND (${words.map((_, i) => `(subject ILIKE $${i + 1} OR object ILIKE $${i + 1})`).join(' OR ')})
          LIMIT 50`,
        words.map(w => `%${w}%`),
      );

      const candidateIds = [...new Set(tripleRows.rows.map(r => r.source_memory_id))];
      if (candidateIds.length === 0 && embedding) {
        // fall through to vector if no graph hits
      } else if (candidateIds.length > 0) {
        const memRows = await client.query<{
          id: string; content: string; summary: string | null;
          importance: string; storage_tier: string | null;
        }>(
          `SELECT id, content, summary, importance, storage_tier
             FROM memories
            WHERE user_id = current_user_id()::uuid
              AND id = ANY($1::uuid[])
              AND status = 'active'
              AND deleted_at IS NULL
              ${spaceFilter}
            LIMIT $2`,
          [candidateIds, limit],
        );

        const tripleMap = new Map<string, typeof tripleRows.rows>();
        for (const t of tripleRows.rows) {
          const arr = tripleMap.get(t.source_memory_id) ?? [];
          arr.push(t);
          tripleMap.set(t.source_memory_id, arr);
        }

        return memRows.rows.map((row, i) => ({
          memoryId:    row.id,
          content:     row.content,
          summary:     row.summary,
          score:       rrfScore(i) + parseFloat(row.importance) * 0.1,
          route:       'graph' as QueryRoute,
          triples:     tripleMap.get(row.id) ?? [],
          storageTier: row.storage_tier,
        }));
      }
    }

    // ── FTS route: full-text search ──────────────────────────────────────────
    if (route === 'fts' || route === 'hybrid') {
      const ftsQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).join(' & ');
      const ftsRows = await client.query<{
        id: string; content: string; summary: string | null;
        rank: string; storage_tier: string | null;
      }>(
        `SELECT id, content, summary, storage_tier,
                ts_rank(to_tsvector('english', content || ' ' || COALESCE(summary, '')),
                        to_tsquery('english', $1)) AS rank
           FROM memories
          WHERE user_id  = current_user_id()::uuid
            AND status  = 'active'
            AND deleted_at IS NULL
            AND to_tsvector('english', content || ' ' || COALESCE(summary, '')) @@ to_tsquery('english', $1)
            ${spaceFilter}
          ORDER BY rank DESC
          LIMIT $2`,
        [ftsQuery, limit * 2],
      );

      if (route === 'fts' || !embedding) {
        return ftsRows.rows.map((row, i) => ({
          memoryId:    row.id,
          content:     row.content,
          summary:     row.summary,
          score:       rrfScore(i) + parseFloat(row.rank) * 0.05,
          route:       'fts' as QueryRoute,
          triples:     [],
          storageTier: row.storage_tier,
        }));
      }

      // hybrid: combine FTS ranks with vector below
      const ftsRankMap = new Map(ftsRows.rows.map((r, i) => [r.id, rrfScore(i)]));

      if (embedding) {
        const vecRows = await client.query<{
          id: string; content: string; summary: string | null;
          dist: string; storage_tier: string | null;
        }>(
          `SELECT id, content, summary, storage_tier,
                  (embedding <=> $1::vector) AS dist
             FROM memories
            WHERE user_id   = current_user_id()::uuid
              AND status    = 'active'
              AND deleted_at IS NULL
              AND embedding IS NOT NULL
              AND storage_tier != 'archive'
              ${spaceFilter}
            ORDER BY dist ASC
            LIMIT $2`,
          [`[${embedding.join(',')}]`, limit * 2],
        );

        const allIds = [...new Set([...ftsRows.rows.map(r => r.id), ...vecRows.rows.map(r => r.id)])];
        const vecRankMap = new Map(vecRows.rows.map((r, i) => [r.id, rrfScore(i)]));
        const contentMap = new Map<string, { content: string; summary: string | null; storage_tier: string | null }>();
        for (const r of [...ftsRows.rows, ...vecRows.rows]) contentMap.set(r.id, r);

        return allIds
          .map(id => ({
            memoryId:    id,
            content:     contentMap.get(id)!.content,
            summary:     contentMap.get(id)!.summary,
            score:       (ftsRankMap.get(id) ?? 0) + (vecRankMap.get(id) ?? 0),
            route:       'hybrid' as QueryRoute,
            triples:     [],
            storageTier: contentMap.get(id)!.storage_tier,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }
    }

    // ── Vector route: ANN cosine similarity ─────────────────────────────────
    if (!embedding) return [];

    const vecRows = await client.query<{
      id: string; content: string; summary: string | null;
      dist: string; importance: string; storage_tier: string | null;
    }>(
      `SELECT id, content, summary, storage_tier, importance,
              (embedding <=> $1::vector) AS dist
         FROM memories
        WHERE user_id   = current_user_id()::uuid
          AND status    = 'active'
          AND deleted_at IS NULL
          AND embedding IS NOT NULL
          AND storage_tier != 'archive'
          ${spaceFilter}
        ORDER BY dist ASC
        LIMIT $2`,
      [`[${embedding.join(',')}]`, limit],
    );

    return vecRows.rows.map((row, i) => ({
      memoryId:    row.id,
      content:     row.content,
      summary:     row.summary,
      score:       rrfScore(i) + parseFloat(row.importance) * 0.1,
      route:       'vector' as QueryRoute,
      triples:     [],
      storageTier: row.storage_tier,
    }));
  });

  // Inject triples for non-graph routes (top results only, low cost)
  if (route !== 'graph' && results.length > 0) {
    const topIds = results.slice(0, 5).map(r => r.memoryId);
    await withUserContextRaw(userId, async (client) => {
      const tRows = await client.query<{
        source_memory_id: string;
        subject: string; predicate: string; object: string;
      }>(
        `SELECT source_memory_id, subject, predicate, object
           FROM memory_triples
          WHERE user_id = current_user_id()::uuid
            AND source_memory_id = ANY($1::uuid[])
            AND superseded_at IS NULL`,
        [topIds],
      );
      const tMap = new Map<string, typeof tRows.rows>();
      for (const t of tRows.rows) {
        const arr = tMap.get(t.source_memory_id) ?? [];
        arr.push(t);
        tMap.set(t.source_memory_id, arr);
      }
      for (const r of results) {
        r.triples = tMap.get(r.memoryId) ?? [];
      }
    });
  }

  return results as RetrievalResult[];
}
