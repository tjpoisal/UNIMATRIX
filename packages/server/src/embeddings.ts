/**
 * src/embeddings.ts
 *
 * Voyage AI embedding generation via REST API.
 *
 * Why fetch instead of the voyageai npm SDK?
 *   - The SDK wraps the same REST endpoint.
 *   - Fetch avoids SDK version/shape churn and keeps the dependency surface small.
 *   - Easier to mock in tests (intercept fetch, not a class constructor).
 *
 * Model: voyage-3.5
 *   Supports output_dimension truncation (MRL / Matryoshka Representation Learning).
 *   We use 512 dims, saving ~50% storage vs the full 1024-dim output while
 *   retaining >98% retrieval quality at our expected corpus size.
 *
 * Docs: https://docs.voyageai.com/reference/embeddings-api
 */

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL   = 'voyage-3.5';
const OUTPUT_DIMS    = 512;  // MRL truncation — matches VECTOR(512) in schema

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoyageEmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: { total_tokens: number };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function embed(
  text: string,
  inputType: 'query' | 'document',
): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY environment variable is required');
  }

  const res = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      input:            [text],
      model:            VOYAGE_MODEL,
      input_type:       inputType,
      output_dimension: OUTPUT_DIMS,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '<unreadable>');
    throw new Error(
      `Voyage AI embedding request failed — HTTP ${res.status}: ${body}`,
    );
  }

  const json = (await res.json()) as VoyageEmbeddingResponse;

  const embedding = json.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Voyage AI returned an empty or malformed embedding');
  }

  return embedding;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an embedding for a short query string.
 * Use for recall_context and search_memories inputs.
 */
export function generateQueryEmbedding(text: string): Promise<number[]> {
  return embed(text, 'query');
}

/**
 * Generate an embedding for a document (memory summary).
 * Use in the Librarian when indexing a processed memory.
 */
export function generateEmbedding(text: string): Promise<number[]> {
  return embed(text, 'document');
}
