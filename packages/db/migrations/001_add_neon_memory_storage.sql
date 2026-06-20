-- Enable pgvector extension (PostgreSQL only)
-- The following statement is Postgres-specific and will cause syntax errors on SQL Server;
-- when running this migration against PostgreSQL, uncomment the line below to enable pgvector.
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create memory table optimized for pgvector
CREATE TABLE IF NOT EXISTS memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1024),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  
  -- Encryption tracking
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key_id UUID,
  
  -- Soft delete support
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_location FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE,
  CONSTRAINT fk_encryption_key FOREIGN KEY (encryption_key_id) REFERENCES encryption_key(id) ON DELETE SET NULL
);

-- Create HNSW index for high-concurrency vector similarity search
CREATE INDEX IF NOT EXISTS idx_memory_embedding_hnsw 
ON memory USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=64);

-- Create supporting indexes
CREATE INDEX IF NOT EXISTS idx_memory_location_id ON memory(location_id);
CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_tags ON memory USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_memory_deleted_at ON memory(deleted_at) WHERE deleted_at IS NULL;

-- Create audit log table
CREATE TABLE IF NOT EXISTS memory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_memory_audit FOREIGN KEY (memory_id) REFERENCES memory(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memory_audit_log_memory_id ON memory_audit_log(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_audit_log_changed_at ON memory_audit_log(changed_at DESC);

-- Create encryption key table
CREATE TABLE IF NOT EXISTS encryption_key (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(255) NOT NULL UNIQUE,
  algorithm VARCHAR(50) NOT NULL,
  rotation_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_algorithm CHECK (algorithm IN ('AES-256-GCM', 'ChaCha20-Poly1305'))
);

CREATE INDEX IF NOT EXISTS idx_encryption_key_is_active ON encryption_key(is_active);

-- Create sync status table for tracking dual-write operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'dual_write_sync_status'
      AND n.nspname = current_schema()
      AND c.relkind = 'r'
  ) THEN
    EXECUTE $create$
    CREATE TABLE dual_write_sync_status (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      memory_id UUID NOT NULL,
      operation VARCHAR(10) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      local_written_at TIMESTAMP WITH TIME ZONE,
      remote_written_at TIMESTAMP WITH TIME ZONE,
      last_retry_at TIMESTAMP WITH TIME ZONE,
      retry_count INT DEFAULT 0,
      error_message TEXT,
      
      CONSTRAINT fk_sync_memory FOREIGN KEY (memory_id) REFERENCES memory(id) ON DELETE CASCADE,
      CONSTRAINT check_sync_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'MAX_RETRIES'))
    );
    $create$;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_dual_write_sync_status ON dual_write_sync_status(status, memory_id);
CREATE INDEX IF NOT EXISTS idx_dual_write_pending ON dual_write_sync_status(status) WHERE status = 'PENDING';

-- Create migration function to populate embeddings from existing text
CREATE OR REPLACE FUNCTION populate_memory_embeddings()
RETURNS TABLE(memory_id UUID, status TEXT) AS $$
DECLARE
  v_memory RECORD;
BEGIN
  FOR v_memory IN 
    SELECT id, content FROM memory 
    WHERE embedding IS NULL AND deleted_at IS NULL
  LOOP
    -- TODO: Call VoyageAI API or embedding service
    -- UPDATE memory SET embedding = <result> WHERE id = v_memory.id;
    
    RETURN QUERY SELECT v_memory.id, 'processed'::TEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to log audit changes
CREATE OR REPLACE FUNCTION log_memory_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO memory_audit_log (memory_id, operation, new_values)
    VALUES (NEW.id, 'CREATE', row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO memory_audit_log (memory_id, operation, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO memory_audit_log (memory_id, operation, old_values)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_memory_audit
AFTER INSERT OR UPDATE OR DELETE ON memory
FOR EACH ROW
EXECUTE FUNCTION log_memory_audit();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON memory TO postgres;
GRANT SELECT, INSERT ON memory_audit_log TO postgres;
GRANT SELECT ON encryption_key TO postgres;
GRANT SELECT, INSERT, UPDATE ON dual_write_sync_status TO postgres;