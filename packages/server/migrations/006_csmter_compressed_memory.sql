-- Migration 006: CSMTER — Compressed Semantic Memory with Tiered Error Recovery
-- Adds 2-bit quantized embedding storage, QJL residual, semantic triples,
-- BM25/FTS, importance decay support, and positional hierarchy.
-- Idempotent: all statements use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

-- ── Tier 1: Quantized embeddings ─────────────────────────────────────────────
-- embedding_q2   : 2-bit Lloyd-Max quantized vector (96 bytes for 384-dim)
-- embedding_scale: per-vector scale factor needed for dequantization
-- vector_residual: 1-bit QJL residual for systematic error correction (~48 bytes)
-- last_accessed_at / access_count: temporal decay and popularity tracking

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS embedding_q2      BYTEA,
  ADD COLUMN IF NOT EXISTS embedding_scale   FLOAT4,
  ADD COLUMN IF NOT EXISTS vector_residual   BYTEA,
  ADD COLUMN IF NOT EXISTS last_accessed_at  TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS access_count      INTEGER     DEFAULT 0;

-- Decay index: efficiently find stale memories for importance decay
CREATE INDEX IF NOT EXISTS idx_memories_last_accessed
  ON memories (last_accessed_at, importance)
  WHERE deleted_at IS NULL;

-- ── Tier 2: Semantic triples (graph layer) ────────────────────────────────────
-- Stores subject-predicate-object facts extracted by the Librarian.
-- Superseded triples are preserved for temporal memory (audit trail).
CREATE TABLE IF NOT EXISTS memory_triples (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL,
  space_id         UUID        REFERENCES spaces(id)   ON DELETE CASCADE,
  subject          TEXT        NOT NULL,
  predicate        TEXT        NOT NULL,
  object           TEXT        NOT NULL,
  source_memory_id UUID        REFERENCES memories(id) ON DELETE SET NULL,
  source_llm       TEXT,
  confidence       FLOAT4      NOT NULL DEFAULT 1.0,
  valid_from       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at    TIMESTAMPTZ,          -- NULL = currently active
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Look up active triples by user + subject (most common recall path)
CREATE INDEX IF NOT EXISTS idx_triples_user_subject
  ON memory_triples (user_id, subject)
  WHERE superseded_at IS NULL;

-- Full active triple set per user (for context injection)
CREATE INDEX IF NOT EXISTS idx_triples_user_active
  ON memory_triples (user_id, created_at DESC)
  WHERE superseded_at IS NULL;

-- Source memory → triple mapping (for cascade updates on supersession)
CREATE INDEX IF NOT EXISTS idx_triples_source_memory
  ON memory_triples (source_memory_id)
  WHERE source_memory_id IS NOT NULL;

-- ── Tier 3: BM25 full-text search ─────────────────────────────────────────────
-- Generated tsvector column — automatically maintained by Postgres.
-- Used as L2 cross-check when quantized vector cosine sim < 0.6.
-- Only add if not already present (earlier migrations may have added it).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'fts_vector'
  ) THEN
    -- content is stored encrypted (Bytes) in the Prisma schema; summary is plaintext.
    -- We index summary + hint (both plaintext) for BM25.
    ALTER TABLE memories
      ADD COLUMN fts_vector TSVECTOR
        GENERATED ALWAYS AS (
          to_tsvector('english',
            coalesce(summary, '') || ' ' || coalesce(hint, '')
          )
        ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memories_fts
  ON memories USING GIN (fts_vector)
  WHERE deleted_at IS NULL;

-- ── Positional hierarchy ──────────────────────────────────────────────────────
-- Stores the space ancestry path for fast subtree-scoped search.
-- Format: '<root_space_id>/<child_space_id>/...' (slash-delimited UUIDs).
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS hierarchy_path TEXT;

CREATE INDEX IF NOT EXISTS idx_memories_hierarchy
  ON memories (user_id, hierarchy_path)
  WHERE hierarchy_path IS NOT NULL AND deleted_at IS NULL;

-- ── RLS passthrough for new table ─────────────────────────────────────────────
ALTER TABLE memory_triples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memory_triples_user_isolation ON memory_triples;
CREATE POLICY memory_triples_user_isolation ON memory_triples
  USING (user_id = current_user_id()::uuid);

-- Allow inserts for the current user
DROP POLICY IF EXISTS memory_triples_insert ON memory_triples;
CREATE POLICY memory_triples_insert ON memory_triples
  FOR INSERT WITH CHECK (user_id = current_user_id()::uuid);

COMMENT ON TABLE  memory_triples               IS 'Subject-predicate-object semantic graph extracted by the Librarian. Superseded rows preserved for temporal auditing.';
COMMENT ON COLUMN memories.embedding_q2        IS '2-bit Lloyd-Max quantized embedding (96 bytes for 384-dim). Used for fast ANN first-pass via Hamming distance.';
COMMENT ON COLUMN memories.embedding_scale     IS 'Per-vector L2 norm scale factor. Required to dequantize embedding_q2 back to float32 for reranking.';
COMMENT ON COLUMN memories.vector_residual     IS '1-bit QJL error-correction residual (~48 bytes). Corrects systematic quantization bias, recovering ~float16 fidelity.';
COMMENT ON COLUMN memories.last_accessed_at    IS 'Timestamp of last recall access. Used for exponential importance decay.';
COMMENT ON COLUMN memories.access_count        IS 'Cumulative recall count. High-access memories resist decay.';
COMMENT ON COLUMN memories.fts_vector          IS 'Auto-maintained tsvector index over summary + hint for BM25 cross-check.';
COMMENT ON COLUMN memories.hierarchy_path      IS 'Slash-delimited space ancestry (e.g. root_uuid/child_uuid). Enables subtree-scoped search via LIKE prefix.';
