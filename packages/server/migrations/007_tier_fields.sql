-- Migration 007: Adaptive compression tier fields
-- Adds storage tier, compression versioning, and last-tiered timestamp
-- to the memories table. Also adds the global decay worker index.

BEGIN;

-- Add tier tracking columns to memories
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS storage_tier        TEXT    NOT NULL DEFAULT 'warm'
    CHECK (storage_tier IN ('hot', 'warm', 'cold', 'archive')),
  ADD COLUMN IF NOT EXISTS compression_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_tiered_at      TIMESTAMPTZ;

-- Ensure last_accessed_at exists (should from 006, but guard)
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS last_accessed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure access_count exists (should from 006, but guard)
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS access_count        INTEGER NOT NULL DEFAULT 0;

-- Index: fast tier-based queries for maintenance worker
CREATE INDEX IF NOT EXISTS idx_memory_tier
  ON memories (user_id, storage_tier, last_accessed_at)
  WHERE deleted_at IS NULL;

-- Index: fast decay worker scan
CREATE INDEX IF NOT EXISTS idx_memory_decay
  ON memories (user_id, last_accessed_at, importance)
  WHERE deleted_at IS NULL AND status != 'superseded';

-- Index: re-tier worker scan (low importance + old)
CREATE INDEX IF NOT EXISTS idx_memory_retier
  ON memories (user_id, last_tiered_at, importance)
  WHERE deleted_at IS NULL;

-- Backfill: set all existing active memories to 'warm' tier (safe default)
UPDATE memories
   SET storage_tier        = 'warm',
       compression_version = 1,
       last_tiered_at      = NOW()
 WHERE storage_tier IS NULL
    OR storage_tier = '';

COMMIT;
