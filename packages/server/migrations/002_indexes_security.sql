-- =============================================================================
-- Unimatrix — Indexes & Security Hardening
-- Migration: 002_indexes_security.sql
-- Source: Grok security + performance review 2026-05-11
-- =============================================================================
-- Run AFTER 001_initial_schema.sql
-- All indexes use CONCURRENTLY → safe on live database
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Hybrid search / recall_context (most critical)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS memories_user_status_space_created_idx
  ON memories (user_id, status, space_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 2. Tag filtering for search_memories
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS memory_tags_user_tag_memory_idx
  ON memory_tags (user_id, tag, memory_id);

-- ---------------------------------------------------------------------------
-- 3. Librarian queue (per-user)
-- ---------------------------------------------------------------------------
DROP INDEX CONCURRENTLY IF EXISTS memories_unindexed_idx;
CREATE INDEX CONCURRENTLY IF NOT EXISTS memories_unindexed_user_idx
  ON memories (user_id, created_at)
  WHERE indexed_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Active memories only (Librarian synthesis)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS memories_user_active_idx
  ON memories (user_id, created_at DESC)
  WHERE status = 'active';

-- ---------------------------------------------------------------------------
-- 5. Full-text search (summary + hint)
-- ---------------------------------------------------------------------------
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
      to_tsvector('english', COALESCE(summary, '') || ' ' || COALESCE(hint, ''))
    ) STORED;

CREATE INDEX CONCURRENTLY IF NOT EXISTS memories_search_vector_idx
  ON memories USING GIN (search_vector);

-- ---------------------------------------------------------------------------
-- 6. Spaces hierarchy (Phase 2)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS spaces_user_parent_idx
  ON spaces (user_id, parent_id);

-- ---------------------------------------------------------------------------
-- 7. MCP Audit Log Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  tool        TEXT        NOT NULL,
  memory_id   UUID,
  payload_hash TEXT       NOT NULL,
  success     BOOLEAN     NOT NULL,
  duration_ms INTEGER     NOT NULL,
  error_code  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_user_created_idx
  ON mcp_audit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_tool_created_idx
  ON mcp_audit_log (tool, created_at DESC);

-- ---------------------------------------------------------------------------
-- 8. HNSW tuning note (for recall_context)
-- ---------------------------------------------------------------------------
-- In recall_context handler, add before the query:
-- SET LOCAL hnsw.ef_search = 100;