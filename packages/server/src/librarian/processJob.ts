/**
 * src/librarian/processJob.ts
 *
 * The Librarian — async semantic layer processor.
 *
 * Called after store_memory inserts the episodic row.
 * Runs fire-and-forget so it never blocks the MCP response to the caller.
 *
 * Pipeline per job (Phase 1D/E — fully local, zero external API calls):
 *   1. generateEmbedding()    → 512-dim BGE-small vector (Xenova, on-device)
 *   2. classifyMemory()       → semanticCategory, importance, tags, supersession flag
 *                               (local-model.ts: unimatrix-librarian LoRA → mistral → rule-based)
 *   3. extractiveSummarize()  → top-2 sentences by TF × position × length
 *   4. classifySpace()        → pgvector cosine similarity against space embeddings
 *   5. UPDATE memories        → summary, embedding, space_id, indexed_at = NOW()
 *   6. INSERT memory_tags     → upsert combined tags (LLM + TF-IDF)
 *   7. Poly-tag               → when altSpaceId is set (confidence < 0.80)
 *   8. Supersession           → soft-supersede prior memories when suggestsSupersession=true
 */

import { withUserContextRaw }      from '../db/client.js';
import { generateEmbedding }       from '../embeddings.js';
import { extractiveSummarize }     from './summarize.js';
import { extractTags }             from './extractTags.js';
import { classifySpace }           from './classifySpace.js';
import { classifyMemory }          from './local-model.js';
import type { LibrarianJob, LibrarianResult } from '../types/domain.js';

// ---------------------------------------------------------------------------
// Main job processor
// ---------------------------------------------------------------------------

export async function processLibrarianJob(job: LibrarianJob): Promise<LibrarianResult> {
  const { memoryId, userId, content } = job;

  // 1. Generate embedding from sanitized content.
  let embedding: number[];
  try {
    embedding = await generateEmbedding(content);
  } catch (err) {
    console.error(`[Librarian] Embedding failed for ${memoryId}:`, err);
    throw err;
  }

  // 2. Local Librarian classification (Phase 1D/E)
  //    unimatrix-librarian LoRA → mistral fallback → rule-based
  const classification = await classifyMemory(content);

  // 3. Extractive summary (no LLM, pure sentence scoring)
  const summary = extractiveSummarize(content, 2, 300);

  // 4. Merge LLM tags + TF-IDF tags (deduplicated)
  const tfidfTags = extractTags(content, 5);
  const allTags   = [...new Set([...classification.tags, ...tfidfTags])].slice(0, 10);

  // 5. Space classification via pgvector cosine similarity
  const { spaceId, confidence, altSpaceId } = await classifySpace(embedding, userId);

  // 6. Write back to memories + insert tags (within RLS context)
  await withUserContextRaw(userId, async (client) => {
    // UPDATE memories — set semantic layer fields
    await client.query(
      `UPDATE memories
          SET summary         = $1,
              embedding       = $2,
              space_id        = $3,
              confidence      = $4,
              importance      = $5,
              semantic_cat    = $6,
              indexed_at      = NOW()
        WHERE id      = $7
          AND user_id = current_user_id()::uuid`,
      [
        summary,
        JSON.stringify(embedding),
        spaceId,
        confidence,
        classification.importance,
        classification.semanticCategory,
        memoryId,
      ],
    );

    // INSERT combined tags (ignore duplicates)
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

    // Poly-tag: altSpaceId non-null → strong second candidate
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

    // Supersession: soft-supersede prior memories on same topic
    if (classification.suggestsSupersession && spaceId) {
      await client.query(
        `UPDATE memories
            SET status        = 'superseded',
                superseded_by = $1,
                superseded_at = NOW()
          WHERE user_id = current_user_id()::uuid
            AND space_id = $2
            AND id       != $3
            AND status   = 'active'
            AND indexed_at < NOW() - INTERVAL '1 minute'
            AND (
              embedding <=> $4::vector
            ) < 0.25`,   // very close vector distance = same topic
        [memoryId, spaceId, memoryId, JSON.stringify(embedding)],
      );
    }
  });

  console.log(
    `[Librarian] ✓ ${memoryId} — space: ${spaceId ?? 'unclassified'}, ` +
    `cat: ${classification.semanticCategory}, importance: ${classification.importance}, ` +
    `confidence: ${confidence.toFixed(2)}, tags: [${allTags.join(', ')}]` +
    (altSpaceId ? `, alt-space: ${altSpaceId}` : '') +
    (classification.suggestsSupersession ? ', [supersession]' : ''),
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
