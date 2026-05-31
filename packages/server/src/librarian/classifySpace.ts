/**
 * src/librarian/classifySpace.ts
 *
 * Embedding-based space classification — no external LLM.
 *
 * How it works:
 *   Each Space has a 512-dim Voyage AI embedding of its name + description.
 *   When classifying a memory, we compare the memory's embedding against all
 *   space embeddings using cosine similarity (handled in SQL by pgvector).
 *
 *   - Best match above MIN_CONFIDENCE → assigned as primary space
 *   - If best match is below POLY_TAG_THRESHOLD, second-best is returned
 *     as altSpaceId for poly-tagging
 *   - No match above MIN_CONFIDENCE → spaceId = null (unclassified)
 *
 * Space embeddings are generated once on create/update via indexSpace().
 * Call reindexAllSpaces(userId) to backfill existing spaces.
 */

import { pool }             from '../db/client.js';
import { generateEmbedding } from '../embeddings.js';

const MIN_CONFIDENCE      = 0.45;   // below this → unclassified
const POLY_TAG_THRESHOLD  = 0.80;   // below this → also assign alt space

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

interface ClassifyResult {
  spaceId:    string | null;
  confidence: number;
  altSpaceId: string | null;
}

/**
 * Classifies a memory into the best-matching space using cosine similarity.
 * All scoring happens inside pgvector — no embedding parsing in TypeScript.
 *
 * @param memoryEmbedding - 512-dim float array from generateEmbedding()
 * @param userId          - owner; only their spaces are considered
 */
export async function classifySpace(
  memoryEmbedding: number[],
  userId:          string,
): Promise<ClassifyResult> {
  // pgvector computes cosine distance; 1 - distance = similarity
  const result = await pool.query<{
    id:         string;
    similarity: string;   // pg numeric → string
  }>(
    `SELECT id,
            1.0 - (embedding <=> $1::vector) AS similarity
       FROM spaces
      WHERE user_id  = $2
        AND embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 3`,
    [JSON.stringify(memoryEmbedding), userId],
  );

  const rows = result.rows;
  if (rows.length === 0) {
    return { spaceId: null, confidence: 0, altSpaceId: null };
  }

  const best   = { id: rows[0].id, sim: parseFloat(rows[0].similarity) };
  const second = rows[1] ? { id: rows[1].id, sim: parseFloat(rows[1].similarity) } : null;

  const spaceId = best.sim >= MIN_CONFIDENCE ? best.id : null;
  const altSpaceId =
    spaceId !== null &&
    best.sim < POLY_TAG_THRESHOLD &&
    second &&
    second.sim >= MIN_CONFIDENCE
      ? second.id
      : null;

  return { spaceId, confidence: best.sim, altSpaceId };
}

// ---------------------------------------------------------------------------
// Space indexing (generate + store embeddings)
// ---------------------------------------------------------------------------

/**
 * Generates and persists the embedding for a single space.
 * Call this whenever a space is created or its name/description changes.
 *
 * @param spaceId - UUID of the space to index
 * @param userId  - owner (used for service-level update, not RLS)
 */
export async function indexSpace(spaceId: string, userId: string): Promise<void> {
  const row = await pool.query<{ name: string; description: string | null }>(
    `SELECT name, description FROM spaces WHERE id = $1 AND user_id = $2`,
    [spaceId, userId],
  );

  if (row.rows.length === 0) {
    throw new Error(`Space ${spaceId} not found for user ${userId}`);
  }

  const { name, description } = row.rows[0];
  const text      = description ? `${name}: ${description}` : name;
  const embedding = await generateEmbedding(text);

  await pool.query(
    `UPDATE spaces SET embedding = $1 WHERE id = $2`,
    [JSON.stringify(embedding), spaceId],
  );

  console.log(`[classifySpace] Indexed space "${name}" (${spaceId})`);
}

/**
 * Generates embeddings for all spaces belonging to userId that don't
 * have one yet. Use this to backfill after running migration 003.
 *
 * @param userId - owner whose spaces to reindex
 * @returns number of spaces indexed
 */
export async function reindexAllSpaces(userId: string): Promise<number> {
  const rows = await pool.query<{ id: string }>(
    `SELECT id FROM spaces WHERE user_id = $1 AND embedding IS NULL`,
    [userId],
  );

  // Voyage free tier: 3 RPM. Throttle to 1 request per 22s to stay safe.
  const THROTTLE_MS = 22_000;
  let count = 0;
  for (let i = 0; i < rows.rows.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, THROTTLE_MS));
    const { id } = rows.rows[i];
    try {
      await indexSpace(id, userId);
      count++;
    } catch (err) {
      console.error(`[classifySpace] Failed to index space ${id}:`, err);
    }
  }

  console.log(`[classifySpace] Reindexed ${count} spaces for user ${userId}`);
  return count;
}
