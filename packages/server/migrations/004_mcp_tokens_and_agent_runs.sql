-- =============================================================================
-- Migration: 004_mcp_tokens_and_agent_runs.sql
-- Adds: IVFFlat index on memories, HNSW index on spaces, GIN full-text index,
--       token_budgets table, mcp_audit_log table with auto-timestamp trigger.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. IVFFlat index on memories(embedding) for cosine-similarity retrieval
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS memories_embedding_ivfflat_idx
  ON memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- 2. HNSW index on spaces(embedding) for fast hierarchical space search
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS spaces_embedding_hnsw_idx
  ON spaces USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

-- ---------------------------------------------------------------------------
-- 3. GIN full-text index on decrypted memory content (English tsvector)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS memories_content_fts_idx
  ON memories USING gin (to_tsvector('english', convert_from(content, 'UTF8')));

-- ---------------------------------------------------------------------------
-- 4. token_budgets — per-platform token limits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_budgets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform    TEXT        NOT NULL UNIQUE,
  max_tokens  INT         NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default budgets
INSERT INTO token_budgets (platform, max_tokens)
VALUES
  ('desktop', 4000),
  ('mobile',  800)
ON CONFLICT (platform) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. mcp_audit_log — fine-grained audit trail for MCP tool calls
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id     UUID,
  action       TEXT        NOT NULL,   -- e.g. 'mcp.store_memory', 'mcp.recall'
  tool_name    TEXT,                   -- MCP tool name
  payload_size INT,                    -- bytes of request payload
  status       TEXT        NOT NULL DEFAULT 'success', -- success | error | blocked
  error_msg    TEXT,
  latency_ms   INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user-audit lookups
CREATE INDEX IF NOT EXISTS mcp_audit_log_user_created_idx
  ON mcp_audit_log (user_id, created_at DESC);

-- Auto-update updated_at trigger for mcp_audit_log
CREATE OR REPLACE FUNCTION mcp_audit_log_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mcp_audit_log_updated_at ON mcp_audit_log;
CREATE TRIGGER mcp_audit_log_updated_at
  BEFORE UPDATE ON mcp_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION mcp_audit_log_set_updated_at();
