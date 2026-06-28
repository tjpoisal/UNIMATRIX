/**
 * src/librarian/processJob.ts
 *
 * The Librarian — CSMTER-enhanced async semantic layer orchestrator.
 *
 * This file is now ORCHESTRATION ONLY. All logic has been extracted to:
 *   - src/lib/triples.ts         → triple extraction
 *   - src/lib/decay.ts           → importance decay
 *   - src/lib/tierManager.ts     → adaptive compression tiering
 *   - src/lib/retrievalRouter.ts → hybrid retrieval (used at read time)
 *   - src/librarian/summarize.ts → extractive summarization
 *   - src/librarian/extractTags.ts     → TF-IDF tag extraction
 *   - src/librarian/classifySpace.ts   → space classification
 *   - src/librarian/local-model.ts     → semantic classification
 *   - src/lib/quantize.ts        → 2-bit Lloyd-Max + QJL quantization
 *
 * Pipeline per job:
 *   1. generateEmbedding()       → 384-dim BGE-small vector
 *   2. quantize2bit()            → 2-bit Q2 + 1-bit QJL residual
 *   3. classifyMemory()          → semanticCategory, importance, tags, supersession
 *   4. extractiveSummarize()     → top-2 sentences
 *   5. extractTags()             → TF-IDF tags
 *   6. classifySpace()           → space routing + confidence
 *   7. extractTriplesHeuristic() → subject-predicate-object facts
 *   8. decideTier()              → adaptive storage tier
 *   9. DB write                  → all semantic fields in one round-trip
 *  10. INSERT memory_tags
 *  11. UPSERT memory_triples     → supersede contradictions
 *  12. applyTier()               → set storage_tier + compression_version
 *  13. Poly-tag if altSpaceId
 *  14. Supersession pass
 *  15. setImmediate decay batch  → non-blocking, via decay.ts
 */

import { withUserContextRaw }            from '../db/client.js';
import { generateEmbedding }             from '../embeddings.js';
import { extractiveSummarize }           from './summarize.js';
import { extractTags }                   from './extractTags.js';
import { classifySpace }                 from './classifySpace.js';
import { classifyMemory }                from './local-model.js';
import { quantize2bit }                  from '../lib/quantize.js';
import { extractTriplesHeuristic }       from '../lib/triples.js';
import { runDecayBatch }                 from '../lib/decay.js';
import { decideTier, applyTier }         from '../lib/tierManager.js';
import type { LibrarianJob, LibrarianResult } from '../types/domain.js';

export async function processLibrarianJob(job: LibrarianJob): Promise<LibrarianResult> {
  const { memoryId, userId, content, spaceId: jobSpaceId, sourceLlm } = job;

  // 1. Embedding
  const embedding = await generateEmbedding(content).catch(err => {
    console.error(`[Librarian] Embedding failed for ${memoryId}:`, err);
    throw err;
  });

  // 2. Quantize
  const { quantized: embQ2, scale: embScale, residual: embResidual } = quantize2bit(embedding);

  // 3. Classify
  const classification = await classifyMemory(content);

  // 4. Summarize
  const summary = extractiveSummarize(content, 2, 300);

  // 5. Tags
  const tfidfTags = extractTags(content, 5);
  const allTags   = [...new Set([...classification.tags, ...tfidfTags])].slice(0, 10);

  // 6. Space routing
  const { spaceId, confidence, altSpaceId } = await classifySpace(embedding, userId);
  const hierarchyPath = spaceId ?? null;

  // 7. Triples
  const triples = extractTriplesHeuristic(content, userId);

  // 8. Tier decision (uses accessCount=0 for new memories, importance from classification)
  const tierDecision = decideTier(
    classification.importance,
    0,
    new Date(),
  );

  // 9–11. DB write: memories + tags + triples
  await withUserContextRaw(userId, async (client) => {

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
              storage_tier     = $11,
              compression_version = $12,
              last_accessed_at = NOW(),
              last_tiered_at   = NOW(),
              indexed_at       = NOW()
        WHERE id      = $13
          AND user_id = current_user_id()::uuid`,
      [
        summary,
        `[${embedding.join(',')}]`,
        embQ2,
        embScale,
        embResidual,
        spaceId ?? null,
        confidence,
        classification.importance,
        classification.semanticCategory,
        hierarchyPath,
        tierDecision.tier,
        tierDecision.compressionVersion,
        memoryId,
      ],
    );

    if (allTags.length > 0) {
      const tagValues = allTags.map((_, i) => `($1, $2, $${i + 3})`).join(', ');
      await client.query(
        `INSERT INTO memory_tags (memory_id, user_id, tag)
         VALUES ${tagValues}
         ON CONFLICT (memory_id, tag) DO NOTHING`,
        [memoryId, userId, ...allTags],
      );
    }

    for (const triple of triples) {
      const existing = await client.query<{ id: string; object: string }>(
        `SELECT id, object FROM memory_triples
          WHERE user_id   = current_user_id()::uuid
            AND subject   = $1
            AND predicate = $2
            AND superseded_at IS NULL
          LIMIT 1`,
        [triple.subject, triple.predicate],
      );
      if (existing.rows.length > 0 && existing.rows[0].object !== triple.object) {
        await client.query(
          `UPDATE memory_triples SET superseded_at = NOW() WHERE id = $1`,
          [existing.rows[0].id],
        );
      }
      await client.query(
        `INSERT INTO memory_triples
           (user_id, space_id, subject, predicate, object, source_memory_id, source_llm)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [userId, spaceId ?? null, triple.subject, triple.predicate, triple.object, memoryId, sourceLlm ?? null],
      );
    }

    if (altSpaceId) {
      const altRow = await client.query<{ name: string }>(
        `SELECT name FROM spaces WHERE id = $1 AND user_id = current_user_id()::uuid`,
        [altSpaceId],
      );
      const altName = altRow.rows[0]?.name;
      if (altName) {
        await client.query(
          `INSERT INTO memory_tags (memory_id, user_id, tag) VALUES ($1, $2, $3)
           ON CONFLICT (memory_id, tag) DO NOTHING`,
          [memoryId, userId, `space:${altName.toLowerCase().replace(/\s+/g, '-')}`],
        );
      }
    }

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

  // 12. Apply tier (structural compression changes if cold/archive)
  await applyTier(userId, memoryId, tierDecision);

  // 15. Non-blocking decay batch
  setImmediate(() => {
    runDecayBatch(userId).catch(err =>
      console.error('[Librarian] Decay batch error (non-fatal):', err)
    );
  });

  console.log(
    `[Librarian] ✓ ${memoryId}` +
    ` space:${spaceId ?? 'unclassified'}` +
    ` cat:${classification.semanticCategory}` +
    ` imp:${classification.importance}` +
    ` tier:${tierDecision.tier}` +
    ` conf:${confidence.toFixed(2)}` +
    ` triples:${triples.length}` +
    ` tags:[${allTags.join(', ')}]`,
  );

  return {
    memoryId,
    spaceId,
    additionalSpaceIds: altSpaceId ? [altSpaceId] : [],
    tags:   allTags,
    summary,
    confidence,
  };
}
