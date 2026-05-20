-- migrations/003_space_embeddings.sql
--
-- Adds a 512-dim embedding to the spaces table so the Librarian can
-- classify memories by cosine similarity rather than asking an LLM.
--
-- Run: psql $DATABASE_URL -f migrations/003_space_embeddings.sql

ALTER TABLE spaces
  ADD COLUMN IF NOT EXISTS embedding VECTOR(512);

-- HNSW index on space embeddings (small table, but keeps query plans consistent)
CREATE INDEX IF NOT EXISTS spaces_user_embedding_idx
  ON spaces USING hnsw (embedding vector_cosine_ops)
  WITH (m = 8, ef_construction = 32);

COMMENT ON COLUMN spaces.embedding IS
  '512-dim Voyage AI MRL embedding of name || description. '
  'Generated on space create/update. Used by Librarian for zero-LLM classification.';
