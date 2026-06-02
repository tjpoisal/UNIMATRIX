/**
 * src/librarian/processJob.ts
 *
 * The Librarian — async semantic layer processor.
 *
 * Called after store_memory inserts the episodic row. Runs fire-and-forget
 * so it never blocks the MCP response to the caller.
 *
 * What it does per job (fully self-contained, no external LLM):
 *   1. Generate a 512-dim Voyage AI embedding from the sanitized content
 *   2. extractiveSummarize()  → top-2 sentences by TF × position × length
 *   3. extractTags()          → TF-IDF + bigram keyword extraction
 *   4. classifySpace()        → pgvector cosine similarity against space embeddings
 *   5. UPDATE memories: summary, embedding, space_id, indexed_at = NOW()
 *   6. INSERT tags into memory_tags (upsert, ignore dupes)
 *   7. Poly-tag when altSpaceId is set (confidence < 0.80 inside classifySpace)
 *
 * Phase 2: replace the inline call with Inngest/Trigger.dev job dispatch.
 */

import { withUserContextRaw } from '../db/client.js';
import { generateEmbedding }      from '../embeddings.js';
import { extractiveSummarize }    from './summarize.js';
import { extractTags }            from './extractTags.js';
import { classifySpace }          from './classifySpace.js';
import type { LibrarianJob, LibrarianResult } from '../types/domain.js';

// ---------------------------------------------------------------------------
// Main job processor
// ---------------------------------------------------------------------------

export async function processLibrarianJob(job: LibrarianJob): Promise<LibrarianResult> {
  const { memoryId, userId, content } = job;

  // 1. Generate embedding from sanitized content.
  //    This same vector is used for:
  //      a) classifySpace — cosine similarity against space embeddings
  //      b) memories.embedding — powers future search_memories queries
  let embedding: number[];
  try {
    embedding = await generateEmbedding(content);
  } catch (err) {
    console.error(`[Librarian] Embedding failed for ${memoryId}:`, err);
    throw err;   // Bubble up — embedding is required for search to work
  }

  // 2. Extractive summary — no LLM, pure sentence scoring
  const summary = extractiveSummarize(content, 2, 300);

  // 3. TF-IDF keyword tags — no LLM, pure frequency + position scoring
  const tags = extractTags(content, 5);

  // 4. Space classification via pgvector cosine similarity
  //    classifySpace handles MIN_CONFIDENCE (0.45) and POLY_TAG_THRESHOLD (0.80)
  //    internally — returns altSpaceId pre-filled when confidence is in the
  //    poly-tag range.
  const { spaceId, confidence, altSpaceId } = await classifySpace(embedding, userId);

  // 5. Write back to memories + insert tags (within RLS context)
  await withUserContextRaw(userId, async (client) => {
    // UPDATE memories — set semantic layer fields
    await client.query(
      `UPDATE memories
          SET summary    = $1,
              embedding  = $2,
              space_id   = $3,
              confidence = $4,
              indexed_at = NOW()
        WHERE id      = $5
          AND user_id = current_user_id()::uuid`,
      [
        summary,
        JSON.stringify(embedding),
        spaceId,
        confidence,
        memoryId,
      ],
    );

    // INSERT keyword tags (ignore duplicates)
    if (tags.length > 0) {
      const tagValues = tags
        .map((_, i) => `($1, $2, $${i + 3})`)
        .join(', ');
      await client.query(
        `INSERT INTO memory_tags (memory_id, user_id, tag)
         VALUES ${tagValues}
         ON CONFLICT (memory_id, tag) DO NOTHING`,
        [memoryId, userId, ...tags],
      );
    }

    // Poly-tag: altSpaceId is non-null when classifySpace found a strong
    // second candidate (confidence < POLY_TAG_THRESHOLD inside classifySpace).
    // Tag the memory with a `space:<name>` marker so recall_context can
    // surface it in both spaces. Phase 2: dedicated memory_spaces join table.
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
  });

  console.log(
    `[Librarian] ✓ ${memoryId} — space: ${spaceId ?? 'unclassified'}, ` +
    `confidence: ${confidence.toFixed(2)}, tags: [${tags.join(', ')}]` +
    (altSpaceId ? `, alt-space: ${altSpaceId}` : ''),
  );

  return {
    memoryId,
    spaceId,
    additionalSpaceIds: altSpaceId ? [altSpaceId] : [],
    tags,
    summary,
    confidence,
  };
}
