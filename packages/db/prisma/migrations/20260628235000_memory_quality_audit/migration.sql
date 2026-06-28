ALTER TABLE IF EXISTS memories
  ADD COLUMN IF NOT EXISTS mention_count INTEGER NOT NULL DEFAULT 1,
  ALTER COLUMN confidence SET DEFAULT 0.5;

ALTER TABLE IF EXISTS audit_logs
  ADD COLUMN IF NOT EXISTS memory_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_memory_id_fkey'
  ) THEN
    ALTER TABLE audit_logs
      ADD CONSTRAINT audit_logs_memory_id_fkey
      FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS audit_logs_user_id_created_at_idx ON audit_logs(user_id, created_at);

CREATE TABLE IF NOT EXISTS memory_shares (
  id TEXT PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  shared_with_id TEXT NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT TRUE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS memory_shares_memory_id_idx ON memory_shares(memory_id);
CREATE INDEX IF NOT EXISTS memory_shares_shared_with_id_idx ON memory_shares(shared_with_id);

CREATE TABLE IF NOT EXISTS memory_links (
  id TEXT PRIMARY KEY,
  memory_a_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  memory_b_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'entity_shared',
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(memory_a_id, memory_b_id)
);

CREATE INDEX IF NOT EXISTS memory_links_memory_a_id_idx ON memory_links(memory_a_id);
CREATE INDEX IF NOT EXISTS memory_links_memory_b_id_idx ON memory_links(memory_b_id);
