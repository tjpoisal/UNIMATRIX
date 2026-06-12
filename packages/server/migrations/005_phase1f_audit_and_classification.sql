-- Migration 005: Phase 1F — Audit log + Librarian classification columns
-- Run against the shared Neon Postgres database.
-- Idempotent: all statements use IF NOT EXISTS or DO $$ ... $$.

-- ── 1. mcp_audit_log ──────────────────────────────────────────────────────
--  Stores every MCP tool call (store_memory, recall_context, etc.) with:
--    - payload_hash  : HMAC-SHA256 of the sanitized content (not plaintext)
--    - success       : did the call succeed?
--    - duration_ms   : wall-clock latency
--    - error_code    : class of error if failed (never contains user content)
-- This table is append-only and never contains memory plaintext.

CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL,
  tool         TEXT        NOT NULL,
  memory_id    UUID,
  payload_hash TEXT,                    -- HMAC-SHA256 of sanitized content
  success      BOOLEAN     NOT NULL DEFAULT TRUE,
  duration_ms  INTEGER     NOT NULL DEFAULT 0,
  error_code   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_user_id    ON mcp_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_tool       ON mcp_audit_log (tool, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_memory_id  ON mcp_audit_log (memory_id) WHERE memory_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_error_code ON mcp_audit_log (error_code, created_at DESC) WHERE error_code IS NOT NULL;

-- Row-level security: users can only see their own audit rows
ALTER TABLE mcp_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mcp_audit_log_user_isolation ON mcp_audit_log;
CREATE POLICY mcp_audit_log_user_isolation ON mcp_audit_log
  USING (user_id = current_user_id()::uuid);

-- ── 2. memories — add Librarian classification columns ────────────────────
--  importance    : low | medium | high — set by local-model.ts Librarian
--  semantic_cat  : code | personal | learning | work | research | general
--  These are derived, not encrypted — used for filtering and smart recall.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'importance'
  ) THEN
    ALTER TABLE memories ADD COLUMN importance TEXT CHECK (importance IN ('low','medium','high'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'semantic_cat'
  ) THEN
    ALTER TABLE memories ADD COLUMN semantic_cat TEXT
      CHECK (semantic_cat IN ('code','personal','learning','work','research','general'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memories_importance    ON memories (user_id, importance)   WHERE importance IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_memories_semantic_cat  ON memories (user_id, semantic_cat) WHERE semantic_cat IS NOT NULL;

-- ── 3. integration_logs — for Ollama + future integrations ────────────────
CREATE TABLE IF NOT EXISTS integration_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  integration TEXT        NOT NULL,   -- 'ollama', 'chrome-extension', etc.
  action      TEXT        NOT NULL,   -- 'memory_saved', 'webhook_received', etc.
  memory_id   UUID,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_user    ON integration_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_source  ON integration_logs (integration, created_at DESC);
