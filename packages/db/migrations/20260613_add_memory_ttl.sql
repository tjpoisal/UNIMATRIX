-- Migration: Add expires_at (TTL) to memories
-- Run: pnpm db:migrate (or psql < this file)

ALTER TABLE memories ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_memories_expires_at ON memories(expires_at)
  WHERE expires_at IS NOT NULL AND deleted_at IS NULL;

-- Comment for clarity
COMMENT ON COLUMN memories.expires_at IS
  'Optional TTL — memory is soft-deleted by the expiry worker after this timestamp. NULL = never expires.';
