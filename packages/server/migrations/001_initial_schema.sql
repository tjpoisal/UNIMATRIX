-- =============================================================================
-- Unimatrix — Initial Schema (v2 — Post-Grok Review)
-- Migration: 001_initial_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE memory_status AS ENUM ('active', 'superseded', 'archived');
CREATE TYPE memory_source AS ENUM ('mcp', 'api', 'import', 'librarian');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE spaces (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id     UUID        REFERENCES spaces(id) ON DELETE SET NULL,
  org_id        UUID,
  name          TEXT        NOT NULL,
  description   TEXT,
  is_scratchpad BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memories (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  space_id        UUID            REFERENCES spaces(id) ON DELETE SET NULL,
  org_id          UUID,

  content         BYTEA           NOT NULL,
  content_iv      BYTEA           NOT NULL,

  summary         TEXT,
  embedding       VECTOR(512),

  status          memory_status   NOT NULL DEFAULT 'active',
  superseded_by   UUID            REFERENCES memories(id) ON DELETE SET NULL,
  superseded_at   TIMESTAMPTZ,

  confidence      FLOAT           CHECK (confidence >= 0 AND confidence <= 1),
  source          memory_source   NOT NULL DEFAULT 'mcp',
  hint            TEXT,

  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  indexed_at      TIMESTAMPTZ
);

CREATE TABLE memory_tags (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id   UUID        NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag         TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (memory_id, tag)
);

-- ---------------------------------------------------------------------------
-- Indexes (Optimized for recall_context + Librarian)
-- ---------------------------------------------------------------------------
CREATE INDEX memories_embedding_idx
  ON memories USING hnsw (embedding vector_cosine_ops)
  WITH (m = 20, ef_construction = 80);

CREATE INDEX memories_user_status_space_created_idx
  ON memories (user_id, status, space_id, created_at DESC);

CREATE INDEX memories_user_status_created_idx
  ON memories (user_id, status, created_at DESC);

CREATE INDEX memories_user_created_idx
  ON memories (user_id, created_at DESC);

CREATE INDEX memories_user_active_idx
  ON memories (user_id) WHERE status = 'active';

CREATE INDEX memories_unindexed_user_idx
  ON memories (user_id, created_at) WHERE indexed_at IS NULL;

CREATE INDEX memory_tags_user_tag_memory_idx
  ON memory_tags (user_id, tag, memory_id);

CREATE INDEX spaces_user_parent_idx
  ON spaces (user_id, parent_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID;
$$;

ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces      ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users FOR SELECT USING (id = current_user_id());
CREATE POLICY users_update ON users FOR UPDATE USING (id = current_user_id());

CREATE POLICY spaces_select ON spaces FOR SELECT USING (user_id = current_user_id());
CREATE POLICY spaces_insert ON spaces FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY spaces_update ON spaces FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY spaces_delete ON spaces FOR DELETE USING (user_id = current_user_id());

CREATE POLICY memories_select ON memories FOR SELECT USING (user_id = current_user_id());
CREATE POLICY memories_insert ON memories FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY memories_update ON memories FOR UPDATE USING (user_id = current_user_id());

CREATE POLICY memory_tags_select ON memory_tags FOR SELECT USING (user_id = current_user_id());
CREATE POLICY memory_tags_insert ON memory_tags FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY memory_tags_delete ON memory_tags FOR DELETE USING (user_id = current_user_id());

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at  BEFORE UPDATE ON users  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION set_updated_at();