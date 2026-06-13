/**
 * src/embeddings.ts
 *
 * Local embedding generation via Xenova/transformers (ONNX Runtime).
 * Zero API calls, zero cost, runs on CPU.
 *
 * Model: Xenova/bge-small-en-v1.5
 *   - 384 dims (vs. 512 in Voyage; acceptable trade-off)
 *   - Fast inference: ~200ms on CPU
 *   - Superior for semantic search over general text
 *
 * Migration: Drop-in replacement for Voyage AI embed().
 * Output dimension changed from 512 → 384; update DB schema if needed.
 */

import { pipeline, env } from '@huggingface/transformers';

// Suppress local file system warnings in Node.js
env.allowLocalModels = true;
env.allowRemoteModels = true;

const MODEL_ID = 'Xenova/bge-small-en-v1.5';
const OUTPUT_DIMS = 384;

let embeddingPipeline: any = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', MODEL_ID, {
      quantized: true,  // Use quantized version for speed
    });
  }
  return embeddingPipeline;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function embed(text: string): Promise<number[]> {
  try {
    const pipe = await getEmbeddingPipeline();
    const result = await pipe(text, {
      pooling: 'mean',
      normalize: true,
    });

    // result.data is Float32Array; convert to number[]
    const embedding = Array.from(result.data as Float32Array);

    if (embedding.length === 0) {
      throw new Error('Local embedding returned empty result');
    }

    return embedding;
  } catch (error) {
    throw new Error(
      `Local embedding failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an embedding for a short query string.
 * Use for recall_context and search_memories inputs.
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  return embed(text);
}

/**
 * Generate an embedding for a document (memory summary).
 * Use in the Librarian when indexing a processed memory.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return embed(text);
}
