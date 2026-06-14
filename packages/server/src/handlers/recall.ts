/**
 * src/handlers/recall.ts
 *
 * CSMTER 4-layer hybrid retrieval pipeline:
 *
 *   L1 — Vector ANN via pgvector HNSW (primary semantic channel)
 *   L2 — BM25/tsvector full-text cross-check (catches semantic drift on rare terms)
 *   L3 — Reciprocal Rank Fusion merge + float32 cosine rerank of top-K only
 *   L4 — Active semantic triple injection (zero vector cost, always appended)
 *
 * User-facing alias: recall_context (implicit/automatic recall).
 * For explicit user-controlled search, see searchMemories.ts.
 *
 * Cross-LLM by design: no filter on source LLM — Claude on iPad finds
 * what ChatGPT stored on desktop, etc.
 */

import { withUserContextRaw, withUserContextReadOnlyRaw as withUserContextReadOnly } from '../db/client.js';
import { withAudit }              from '../middleware/audit.js';
import { generateQueryEmbedding } from '../embeddings.js';
import { quantize2bit, cosineSim } from '../lib/quantize.js';
import { estimateTokenCount }     from '../utils/tokens.js';
import type { MemoryStatus, MemorySource, RecalledMemory } from '../types/domain.js';
import type { RecallInput, SearchMemoriesOutput, ClientProfile } from '../types/mcp.js';
import { TOKEN_BUDGET } from '../types/mcp.js';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TOP_K_CANDIDATES   = 40;    // fetch buffer before reranking
const MIN_VEC_SIM        = 0.55;  // below this cosine sim, BM25 rescue fires
const RRF_K              = 60;    // RRF constant (higher = softer rank blending)
const MAX_TRIPLES        = 20;    // active semantic triples to inject into context

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
  indexed_at:    Date | null;
  tags:          string[];
  // CSMTER fields
  embedding:     string | null;   // float32 for L3 reranking (may be null if not indexed yet)
  cosine_sim:    string;
  days_since:    string;
}

interface FtsRow {
  id:         string;
  summary:    string;
  bm25_rank:  string;
}

interface TripleRow {
  subject:   string;
  predicate: string;
  object:    string;
  confidence: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// recall handler (MCP tool: recall_context)
// ─────────────────────────────────────────────────────────────────────────────

export const recallHandler = withAudit(
  'recall_context',
  async (
    input:  RecallInput,
    userId: string,
  ): Promise<SearchMemoriesOutput & { knownFacts: string[] }> => {

    const profile: ClientProfile = input.profile ?? 'desktop';
    const maxTokens = profile === 'mobile' ? TOKEN_BUDGET.MOBILE : TOKEN_BUDGET.DESKTOP;
    const topK      = input.limit ?? 8;

    // ── Embed the query ───────────────────────────────────────────────────────
    const qEmbedding = await generateQueryEmbedding(input.query);
    const qFloat     = new Float32Array(qEmbedding);

    const hierarchyFilter = input.spaceId
      ? `AND (m.space_id = '${input.spaceId}'::uuid OR m.hierarchy_path LIKE '${input.spaceId}%')`
      : '';

    // ── L1: pgvector HNSW ANN ────────────────────────────────────────────────
    const vectorRows = await withUserContextReadOnly(userId, async (client) => {
      await client.query(`SET LOCAL hnsw.ef_search = 100`);
      const res = await client.query<SearchRow>(
        `SELECT
           m.id, m.user_id, m.space_id, m.org_id,
           m.summary, m.status, m.superseded_by, m.superseded_at,
           m.confidence, m.source, m.hint, m.created_at, m.indexed_at,
           m.embedding,
           (
             SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
               FROM memory_tags t WHERE t.memory_id = m.id
           ) AS tags,
           1.0 - (m.embedding <=> $1::vector) AS cosine_sim,
           EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
         FROM memories m
         WHERE m.user_id    = current_user_id()::uuid
           AND m.indexed_at IS NOT NULL
           AND m.status     = 'active'
           AND m.deleted_at IS NULL
           ${hierarchyFilter}
         ORDER BY m.embedding <=> $1::vector
         LIMIT $2`,
        [`[${qEmbedding.join(',')}]`, TOP_K_CANDIDATES],
      );
      return res.rows;
    });

    // ── L2: BM25 full-text cross-check ───────────────────────────────────────
    // Fires for all queries — catches cases where quantized vector drifts on
    // rare technical terms (code identifiers, proper nouns, abbreviations).
    const ftsRows = await withUserContextReadOnly(userId, async (client) => {
      const res = await client.query<FtsRow>(
        `SELECT m.id, m.summary,
                ts_rank(m.fts_vector, plainto_tsquery('english', $1)) AS bm25_rank
           FROM memories m
          WHERE m.user_id    = current_user_id()::uuid
            AND m.fts_vector @@ plainto_tsquery('english', $1)
            AND m.status     = 'active'
            AND m.deleted_at IS NULL
            ${hierarchyFilter}
          ORDER BY bm25_rank DESC
          LIMIT $2`,
        [input.query, TOP_K_CANDIDATES],
      );
      return res.rows;
    });

    // ── L3: RRF merge + float32 cosine rerank ────────────────────────────────
    // Reciprocal Rank Fusion: score = sum(1 / (K + rank)) across channels
    const rrf = new Map<string, {
      summary:   string;
      rrf_score: number;
      vec_sim?:  number;
      embedding: string | null;
      source:    string;
    }>();

    vectorRows.forEach((row, rank) => {
      rrf.set(row.id, {
        summary:   row.summary,
        rrf_score: 1 / (RRF_K + rank + 1),
        vec_sim:   parseFloat(row.cosine_sim),
        embedding: row.embedding,
        source:    'vector',
      });
    });

    ftsRows.forEach((row, rank) => {
      const existing = rrf.get(row.id);
      const addition = 1 / (RRF_K + rank + 1);
      if (existing) {
        existing.rrf_score += addition;
        // If vector sim was below threshold, credit BM25 for the rescue
        if ((existing.vec_sim ?? 1) < MIN_VEC_SIM) {
          existing.source = 'bm25_rescue';
        }
      } else {
        rrf.set(row.id, {
          summary:   row.summary,
          rrf_score: addition,
          embedding: null,
          source:    'bm25_only',
        });
      }
    });

    // Rescore using full float32 embedding for the top-K×3 candidates
    const rescore = Array.from(rrf.entries())
      .sort((a, b) => b[1].rrf_score - a[1].rrf_score)
      .slice(0, topK * 3)
      .map(([id, data]) => {
        let finalScore = data.rrf_score;

        if (data.embedding) {
          try {
            const storedVec = new Float32Array(
              data.embedding.replace(/[\[\]]/g, '').split(',').map(Number),
            );
            const cosine = cosineSim(qFloat, storedVec);
            // Weighted blend: 70% float32 cosine + 30% RRF (RRF adds diversity)
            finalScore = cosine * 0.7 + data.rrf_score * 0.3;
          } catch {
            // embedding parse failed (shouldn't happen) — fall back to RRF score
          }
        }

        return { id, summary: data.summary, score: finalScore, source: data.source };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // Fetch full metadata for the re-ranked IDs
    const finalIds = rescore.map(r => r.id);
    const metaMap  = new Map(vectorRows.map(r => [r.id, r]));

    // For any BM25-only hits missing from vectorRows, fetch their metadata
    const bm25OnlyIds = finalIds.filter(id => !metaMap.has(id));
    if (bm25OnlyIds.length > 0) {
      const extra = await withUserContextReadOnly(userId, async (client) => {
        const res = await client.query<SearchRow>(
          `SELECT
             m.id, m.user_id, m.space_id, m.org_id,
             m.summary, m.status, m.superseded_by, m.superseded_at,
             m.confidence, m.source, m.hint, m.created_at, m.indexed_at,
             m.embedding,
             (
               SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
                 FROM memory_tags t WHERE t.memory_id = m.id
             ) AS tags,
             0.0 AS cosine_sim,
             EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
           FROM memories m
           WHERE m.id = ANY($1::uuid[])
             AND m.user_id = current_user_id()::uuid`,
          [bm25OnlyIds],
        );
        return res.rows;
      });
      extra.forEach(r => metaMap.set(r.id, r));
    }

    // Assemble final RecalledMemory objects
    const memories: RecalledMemory[] = [];
    let tokenCount = 0;
    let truncated  = false;

    for (const { id, score, source } of rescore) {
      const r = metaMap.get(id);
      if (!r) continue;

      const est = estimateTokenCount(r.summary);
      if (tokenCount + est > maxTokens) { truncated = true; break; }

      memories.push({
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
        // @ts-ignore — extended field for observability
        retrievalChannel: source,
      });
      tokenCount += est;
    }

    // ── L4: Active semantic triple injection ──────────────────────────────────
    // Triples are injected alongside memories at zero vector cost.
    // They represent known facts (preferences, goals, projects) that the
    // LLM should treat as ground truth regardless of similarity score.
    const tripleRows = await withUserContextReadOnly(userId, async (client) => {
      const res = await client.query<TripleRow>(
        `SELECT subject, predicate, object, confidence
           FROM memory_triples
          WHERE user_id      = current_user_id()::uuid
            AND superseded_at IS NULL
          ORDER BY confidence DESC, created_at DESC
          LIMIT $1`,
        [MAX_TRIPLES],
      );
      return res.rows;
    });

    const knownFacts = tripleRows.map(t =>
      `${t.subject} ${t.predicate} ${t.object}`,
    );

    // ── Update access stats (fire-and-forget) ─────────────────────────────────
    if (memories.length > 0) {
      const ids = memories.map(m => m.id);
      withUserContextRaw(userId, async (client) => {
        await client.query(
          `UPDATE memories
              SET access_count     = access_count + 1,
                  last_accessed_at = NOW()
            WHERE id = ANY($1::uuid[])
              AND user_id = current_user_id()::uuid`,
          [ids],
        );
      }).catch(err => console.error('[recall] Access stat update failed (non-fatal):', err));
    }

    return {
      memories,
      tokenCount:  Math.round(tokenCount),
      truncated,
      profile,
      knownFacts,
    };
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Standalone triple recall (used by REST endpoints and MCP tool handler)
// ─────────────────────────────────────────────────────────────────────────────

export async function recallTriples(userId: string, limit = MAX_TRIPLES): Promise<string[]> {
  const rows = await withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<TripleRow>(
      `SELECT subject, predicate, object, confidence
         FROM memory_triples
        WHERE user_id      = current_user_id()::uuid
          AND superseded_at IS NULL
        ORDER BY confidence DESC, created_at DESC
        LIMIT $1`,
      [limit],
    );
    return res.rows;
  });
  return rows.map(t => `${t.subject} ${t.predicate} ${t.object}`);
}
