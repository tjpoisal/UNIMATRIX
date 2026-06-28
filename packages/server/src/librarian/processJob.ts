/**
 * src/librarian/processJob.ts
 *
 * The Librarian — CSMTER-enhanced async semantic layer processor.
 *
 * Called after store_memory inserts the episodic row.
 * Runs fire-and-forget so it never blocks the MCP response to the caller.
 *
 * Pipeline per job (Phase 1F — CSMTER upgrade):
 *   1. generateEmbedding()    → 384-dim BGE-small vector (Xenova, on-device)
 *   2. quantize2bit()         → 2-bit Lloyd-Max + 1-bit QJL residual (96 + 48 bytes)
 *   3. classifyMemory()       → semanticCategory, importance, tags, supersession flag
 *   4. extractiveSummarize()  → top-2 sentences by TF × position × length
 *   5. classifySpace()        → pgvector cosine similarity against space embeddings
 *   6. extractTriplesHeuristic() → subject-predicate-object facts
 *   7. UPDATE memories        → all semantic fields + quantized columns + hierarchy_path
 *   8. INSERT memory_tags     → upsert combined tags (LLM + TF-IDF)
 *   9. UPSERT memory_triples  → supersede contradicting triples, insert new ones
 *  10. Poly-tag               → when altSpaceId is set (confidence < 0.80)
 *  11. Supersession           → soft-supersede prior memories when suggestsSupersession=true
 *  12. Importance decay       → async batch decay of stale memories (non-blocking)
 */

import { withUserContextRaw }            from '../db/client.js';
import { generateEmbedding }             from '../embeddings.js';
import { extractiveSummarize }           from './summarize.js';
import { extractTags }                   from './extractTags.js';
import { classifySpace }                 from './classifySpace.js';
import { classifyMemory }                from './local-model.js';
import { quantize2bit }                  from '../lib/quantize.js';
import type { LibrarianJob, LibrarianResult } from '../types/domain.js';

// ─────────────────────────────────────────────────────────────────────────────
// Triple extraction (heuristic, zero-cost, no LLM required)
// ─────────────────────────────────────────────────────────────────────────────

interface Triple {
  subject:   string;
  predicate: string;
  object:    string;
}

interface ContradictionResult {
  newTriple: Triple;
  existingTripleId: string;
  existingMemoryId: string | null;
  confidence: number;
  suggestedAction: 'supersede';
}

/**
 * Lightweight regex-based triple extractor.
 * Covers the most common first-person fact patterns without any LLM call.
 * Full NLI-based extraction is Phase 2.
 */
function extractTriplesHeuristic(content: string, userId: string): Triple[] {
  const triples: Triple[] = [];
  const c = content.toLowerCase();

  const patterns: Array<{ re: RegExp; pred: string }> = [
    { re: /\bi\s+prefer[s]?\s+(.+?)(?:[.,;]|$)/gi,    pred: 'prefers'   },
    { re: /\bi\s+like[s]?\s+(.+?)(?:[.,;]|$)/gi,       pred: 'likes'     },
    { re: /\bi\s+use[s]?\s+(.+?)(?:[.,;]|$)/gi,        pred: 'uses'      },
    { re: /\bi\s+am\s+(.+?)(?:[.,;]|$)/gi,             pred: 'is'        },
    { re: /\bi'?m\s+(.+?)(?:[.,;]|$)/gi,               pred: 'is'        },
    { re: /\bi\s+work\s+(?:on|at|for)\s+(.+?)(?:[.,;]|$)/gi, pred: 'works_on' },
    { re: /\bbuilding\s+(.+?)(?:[.,;]|$)/gi,            pred: 'building'  },
    { re: /\bdeveloping\s+(.+?)(?:[.,;]|$)/gi,          pred: 'developing'},
    { re: /\bmy\s+(?:name\s+is|name's)\s+(.+?)(?:[.,;]|$)/gi, pred: 'name_is' },
    { re: /\bmy\s+goal\s+is\s+(.+?)(?:[.,;]|$)/gi,     pred: 'goal_is'   },
  ];

  for (const { re, pred } of patterns) {
    let m: RegExpMatchArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(c)) !== null) {
      const obj = m[1]?.trim().slice(0, 140);
      if (obj && obj.length > 2) {
        triples.push({ subject: userId, predicate: pred, object: obj });
      }

      async function detectContradictions(
        client: import('pg').PoolClient,
        newTriples: Triple[],
        userId: string,
      ): Promise<ContradictionResult[]> {
        const contradictions: ContradictionResult[] = [];
        for (const triple of newTriples) {
          const existing = await client.query<{
            id: string;
            object: string;
            source_memory_id: string | null;
          }>(
            `SELECT id, object, source_memory_id
               FROM memory_triples
              WHERE user_id      = current_user_id()::uuid
                AND subject      = $1
                AND predicate    = $2
                AND superseded_at IS NULL`,
            [triple.subject, triple.predicate],
          );
          for (const ex of existing.rows) {
            if (ex.object !== triple.object) {
              contradictions.push({
                newTriple: triple,
                existingTripleId: ex.id,
                existingMemoryId: ex.source_memory_id,
                confidence: 0.8,
                suggestedAction: 'supersede',
              });
            }
          }
        }
        return contradictions;
      }
    }
  }

  return triples;
}

// ─────────────────────────────────────────────────────────────────────────────
// Importance decay
// ─────────────────────────────────────────────────────────────────────────────

// Exponential decay constants (λ) per semantic category.
// Lower λ → slower decay (preferences are stable; episodic events fade faster).
const DECAY_LAMBDA: Record<string, number> = {
  personal:  0.001,
  work:      0.002,
  research:  0.002,
  learning:  0.003,
  code:      0.003,
  general:   0.004,
  default:   0.004,
};

function decayedImportance(
  original:       number,
  semanticCat:    string | null,
  lastAccessedAt: Date,
): number {
  const λ          = DECAY_LAMBDA[semanticCat ?? 'default'] ?? DECAY_LAMBDA.default;
  const daysSince  = (Date.now() - lastAccessedAt.getTime()) / 86_400_000;
  return original * Math.exp(-λ * daysSince);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main job processor
// ─────────────────────────────────────────────────────────────────────────────

export async function processLibrarianJob(job: LibrarianJob): Promise<LibrarianResult> {
  const { memoryId, userId, content, spaceId: jobSpaceId, sourceLlm } = job;

  // ── 1. Generate embedding ──────────────────────────────────────────────────
  let embedding: number[];
  try {
    embedding = await generateEmbedding(content);
  } catch (err) {
    console.error(`[Librarian] Embedding failed for ${memoryId}:`, err);
    throw err;
  }

  // ── 2. Quantize to 2-bit + QJL residual ───────────────────────────────────
  const { quantized: embQ2, scale: embScale, residual: embResidual } = quantize2bit(embedding);

  // ── 3. Classify (importance, semantic category, tags, supersession) ────────
  const classification = await classifyMemory(content);

  // ── 4. Extractive summary ─────────────────────────────────────────────────
  const summary = extractiveSummarize(content, 2, 300);

  // ── 5. Merge tags ─────────────────────────────────────────────────────────
  const tfidfTags = extractTags(content, 5);
  const allTags   = [...new Set([...classification.tags, ...tfidfTags])].slice(0, 10);

  // ── 6. Space classification ───────────────────────────────────────────────
  const { spaceId, confidence, altSpaceId } = await classifySpace(embedding, userId);

  // Build hierarchy_path from space ancestry (best-effort)
  const hierarchyPath = spaceId ? spaceId : null;

  // ── 7. Extract semantic triples ───────────────────────────────────────────
  const triples = extractTriplesHeuristic(content, userId);

  // ── 8. Write back within RLS context ─────────────────────────────────────
  await withUserContextRaw(userId, async (client) => {
    const nearDuplicate = await client.query<{ id: string; confidence: string | null; mention_count: string | null }>(
      `SELECT id, confidence, mention_count
         FROM memories
        WHERE user_id = current_user_id()::uuid
          AND id != $1
          AND indexed_at IS NOT NULL
          AND status = 'active'
          AND (1.0 - (embedding <=> $2::vector)) > 0.92
        ORDER BY (embedding <=> $2::vector) ASC
        LIMIT 1`,
      [memoryId, `[${embedding.join(',')}]`],
    );
    if (nearDuplicate.rows.length > 0) {
      const winner = nearDuplicate.rows[0];
      await client.query(
        `UPDATE memories
            SET mention_count = COALESCE(mention_count, 1) + 1,
                confidence    = LEAST(1.0, COALESCE(confidence, 0.5) + 0.1),
                updated_at    = NOW()
          WHERE id = $1`,
        [winner.id],
      );
      await client.query(
        `UPDATE memories
            SET status = 'superseded',
                superseded_by = $1,
                superseded_at = NOW()
          WHERE id = $2`,
        [winner.id, memoryId],
      );
      await client.query(
        `INSERT INTO audit_logs (user_id, action, resource, resource_id, metadata)
         VALUES ($1, 'SUPERSEDE', 'memory', $2, $3::jsonb)`,
        [userId, memoryId, JSON.stringify({ reason: 'semantic_duplicate', similarTo: winner.id })],
      );
      return;
    }

    // UPDATE memories — all semantic + quantized fields in one round-trip
    await client.query(
      `UPDATE memories
          SET summary          = $1,
              embedding        = $2,
              embedding_q2     = $3,
              embedding_scale  = $4,
              vector_residual  = $5,
              space_id         = $6,
              confidence       = $7,
              importance       = $8,
              semantic_cat     = $9,
              hierarchy_path   = $10,
              last_accessed_at = NOW(),
              indexed_at       = NOW()
        WHERE id      = $11
          AND user_id = current_user_id()::uuid`,
      [
        summary,
        `[${embedding.join(',')}]`,       // full float32 for L3 reranking
        embQ2,                             // 96-byte quantized
        embScale,                          // float32 scale factor
        embResidual,                       // 48-byte QJL residual
        spaceId ?? null,
        confidence,
        classification.importance,
        classification.semanticCategory,
        hierarchyPath,
        memoryId,
      ],
    );

    // INSERT combined tags
    if (allTags.length > 0) {
      const tagValues = allTags
        .map((_, i) => `($1, $2, $${i + 3})`)
        .join(', ');
      await client.query(
        `INSERT INTO memory_tags (memory_id, user_id, tag)
         VALUES ${tagValues}
         ON CONFLICT (memory_id, tag) DO NOTHING`,
        [memoryId, userId, ...allTags],
      );
    }

    const contradictions = await detectContradictions(client, triples, userId);
    for (const contradiction of contradictions) {
      await client.query(
        `UPDATE memory_triples SET superseded_at = NOW() WHERE id = $1`,
        [contradiction.existingTripleId],
      );
      if (contradiction.existingMemoryId) {
        await client.query(
          `UPDATE memories
              SET status = 'superseded',
                  superseded_by = $1,
                  superseded_at = NOW()
            WHERE id = $2
              AND status = 'active'`,
          [memoryId, contradiction.existingMemoryId],
        );
        await client.query(
          `INSERT INTO audit_logs (user_id, action, resource, resource_id, metadata)
           VALUES ($1, 'SUPERSEDE', 'memory', $2, $3::jsonb)`,
          [
            userId,
            contradiction.existingMemoryId,
            JSON.stringify({
              reason: 'triple_contradiction',
              confidence: contradiction.confidence,
              triple: contradiction.newTriple,
            }),
          ],
        );
      }
    }

    // UPSERT semantic triples — supersede contradictions, insert new
    for (const triple of triples) {
      await client.query(
        `INSERT INTO memory_triples
           (user_id, space_id, subject, predicate, object, source_memory_id, source_llm)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [
          userId,
          spaceId ?? null,
          triple.subject,
          triple.predicate,
          triple.object,
          memoryId,
          sourceLlm ?? null,
        ],
      );

      const related = await client.query<{ source_memory_id: string }>(
        `SELECT DISTINCT source_memory_id
           FROM memory_triples
          WHERE user_id = current_user_id()::uuid
            AND source_memory_id IS NOT NULL
            AND source_memory_id != $1
            AND (
              subject = $2 OR object = $2 OR
              subject = $3 OR object = $3
            )
          LIMIT 10`,
        [memoryId, triple.subject, triple.object],
      );
      for (const rel of related.rows) {
        const [memoryAId, memoryBId] = memoryId < rel.source_memory_id
          ? [memoryId, rel.source_memory_id]
          : [rel.source_memory_id, memoryId];
        await client.query(
          `INSERT INTO memory_links (memory_a_id, memory_b_id, link_type, weight)
           VALUES ($1, $2, 'entity_shared', 1.0)
           ON CONFLICT (memory_a_id, memory_b_id)
           DO UPDATE SET weight = memory_links.weight + 0.1, updated_at = NOW()`,
          [memoryAId, memoryBId],
        );
      }
    }

    // Poly-tag when alt-space confidence is high enough
    if (altSpaceId) {
      const altSpaceRow = await client.query<{ name: string }>(
        `SELECT name FROM spaces WHERE id = $1 AND user_id = current_user_id()::uuid`,
        [altSpaceId],
      );
      const altSpaceName = altSpaceRow.rows[0]?.name;
      if (altSpaceName) {
        await client.query(
          `INSERT INTO memory_tags (memory_id, user_id, tag)
           VALUES ($1, $2, $3)
           ON CONFLICT (memory_id, tag) DO NOTHING`,
          [memoryId, userId, `space:${altSpaceName.toLowerCase().replace(/\s+/g, '-')}`],
        );
      }
    }

    // Supersession: soft-supersede prior very-similar memories
    if (classification.suggestsSupersession && spaceId) {
      await client.query(
        `UPDATE memories
            SET status        = 'superseded',
                superseded_by = $1,
                superseded_at = NOW()
          WHERE user_id  = current_user_id()::uuid
            AND space_id = $2
            AND id       != $3
            AND status   = 'active'
            AND indexed_at < NOW() - INTERVAL '1 minute'
            AND (embedding <=> $4::vector) < 0.25`,
        [memoryId, spaceId, memoryId, `[${embedding.join(',')}]`],
      );
    }
  });

  // ── 9. Async importance decay (non-blocking, runs after response) ──────────
  setImmediate(async () => {
    try {
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
              AND last_accessed_at < NOW() - INTERVAL '3 days'
              AND importance        > 0.05
              AND deleted_at        IS NULL
            LIMIT 200`,
          [],
        );

        for (const row of stale.rows) {
          const newImportance = decayedImportance(
            parseFloat(row.importance),
            row.semantic_cat,
            new Date(row.last_accessed_at),
          );
          if (newImportance < parseFloat(row.importance) - 0.01) {
            await client.query(
              `UPDATE memories SET importance = $1 WHERE id = $2`,
              [Math.max(newImportance, 0.01), row.id],
            );
          }
        }
      });
    } catch (err) {
      console.error('[Librarian] Decay batch error (non-fatal):', err);
    }
  });

  console.log(
    `[Librarian] ✓ ${memoryId}` +
    ` space:${spaceId ?? 'unclassified'}` +
    ` cat:${classification.semanticCategory}` +
    ` imp:${classification.importance}` +
    ` conf:${confidence.toFixed(2)}` +
    ` q2:${embQ2.length}B` +
    ` triples:${triples.length}` +
    ` tags:[${allTags.join(', ')}]` +
    (altSpaceId ? ` alt:${altSpaceId}` : '') +
    (classification.suggestsSupersession ? ' [supersession]' : ''),
  );

  return {
    memoryId,
    spaceId,
    additionalSpaceIds: altSpaceId ? [altSpaceId] : [],
    tags:               allTags,
    summary,
    confidence,
  };
}
