# DualWriteStorage Integration Brief

## Overview
DualWriteStorage is a drop-in replacement for the current memory handler that enables safe dual-write operations to both SQLite (local) and Neon PostgreSQL (remote) with automatic failover and retry mechanisms.

## Architecture

### 1. Write Pattern
- **Local Write First**: All writes go to SQLite immediately (guarantees availability)
- **Shadow Remote Write**: Async best-effort write to Neon (non-blocking)
- **Queue on Failure**: Failed remote writes stored in local queue
- **Background Sync**: Periodic job retries failed operations

### 2. Circuit Breaker
- **Threshold**: 500ms latency
- **Open State**: Disables remote writes when latency exceeds threshold
- **Recovery**: Automatic check every 30s to attempt reset
- **Events**: Emitted on state changes for monitoring

### 3. Audit Log Integration
The `memory_audit_log` table tracks all operations:
- **Operation Type**: CREATE, UPDATE, DELETE
- **Timestamps**: Precise audit trail
- **Changed By**: User/system that made the change
- **Old/New Values**: Full JSON snapshots for compliance

Schema integrates with existing `encryption_key` table:
```sql
FOREIGN KEY (encryption_key_id) REFERENCES encryption_key(id)
```

### 4. Encryption Integration
- **Field**: `is_encrypted` boolean flag
- **Key Ref**: `encryption_key_id` points to encryption_key table
- **Algorithms Supported**: AES-256-GCM, ChaCha20-Poly1305
- **At-Rest**: Content field can be encrypted before remote sync

### 5. Vector Embedding Strategy
- **Provider**: VoyageAI (1024-dimensional vectors)
- **Index Type**: HNSW (Hierarchical Navigable Small World)
- **Configuration**: m=16, ef_construction=64 (tuned for concurrency)
- **Migration**: `populate_memory_embeddings()` function seeds existing memories
- **Cosine Similarity**: Used for semantic search queries

### 6. Index Strategy
| Index | Type | Purpose | Concurrency |
|-------|------|---------|-------------|
| idx_memory_embedding_hnsw | HNSW Vector | Semantic search | High |
| idx_memory_location_id | B-tree | Location filtering | High |
| idx_memory_created_at | B-tree DESC | Timeline queries | High |
| idx_memory_tags | GIN | Tag filtering | Medium |
| idx_memory_deleted_at | B-tree (partial) | Soft delete support | High |

### 7. Migration Path

**Phase 1: Local Testing**
```typescript
const storage = new DualWriteStorage(localDb, { 
  remoteEnabled: false 
});
// SQLite only, no remote writes
```

**Phase 2: Remote Testing (Circuit Breaker Enabled)**
```typescript
const storage = new DualWriteStorage(localDb, {
  remoteEnabled: true,
  circuitBreakerThreshold: 500
});
storage.startSyncJob(30000); // 30s retry interval
```

**Phase 3: Embeddings Population**
```sql
SELECT populate_memory_embeddings();
-- Calls VoyageAI API for each memory without embedding
```

**Phase 4: Vector Search Activation**
```sql
SELECT * FROM memory 
WHERE deleted_at IS NULL 
ORDER BY embedding <-> 'your_query_vector' 
LIMIT 10;
```

### 8. Monitoring

Listen to DualWriteStorage events:
```typescript
storage.on('circuit-breaker-open', (evt) => {
  logger.warn('Remote writes disabled', evt);
});

storage.on('remote-write-failed', (evt) => {
  logger.error('Shadow write failed, queued for retry', evt);
});

storage.on('write-max-retries-exceeded', (op) => {
  logger.critical('Failed write exhausted retries', op);
  // Alert ops team
});
```

Access stats:
```typescript
const stats = storage.getStats();
console.log(`Pending writes: ${stats.pendingWrites}`);
console.log(`Circuit open: ${stats.circuitOpen}`);
```

### 9. Deployment Checklist
- [ ] Deploy migration SQL to Neon
- [ ] Verify pgvector extension enabled
- [ ] Create encryption keys in production
- [ ] Deploy DualWriteStorage code with remoteEnabled: false
- [ ] Run integration tests against Neon
- [ ] Enable remoteEnabled: true after validation
- [ ] Run `populate_memory_embeddings()` for existing memories
- [ ] Monitor circuit breaker metrics for 48h
- [ ] Enable vector search features

### 10. Fallback Behavior
- If Neon is down: All writes succeed locally, queued for async retry
- If encryption key missing: Operation fails locally (prevents data loss)
- If retry queue exceeds 10k items: Alert team, suggest manual sync
- If circuit breaker open 24h+: Manual investigation required

## Performance Characteristics
- **Write Latency**: SQLite latency only (typically <5ms)
- **Read Latency**: Local SQLite (fast), optional remote shadowing
- **Vector Search**: HNSW optimized for <100ms @ 1M records
- **Sync Overhead**: Minimal, background job only
- **Storage Overhead**: ~33% (vector embeddings 1024-dim float)