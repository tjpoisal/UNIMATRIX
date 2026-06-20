import { EventEmitter } from 'events';
import Database from 'better-sqlite3';
import { Pool, QueryResult } from 'pg';
import { createId } from '@paralleldrive/cuid2';

interface DualWriteConfig {
  enableDualWrite: boolean;
  logShadowErrors: boolean;
  shadowWriteTimeoutMs: number;
}

export class DualWriteStorage extends EventEmitter {
  private sqlite: Database.Database;
  private pgPool: Pool | null;
  private config: DualWriteConfig;
  private shadowErrorCount = 0;

  constructor(
    sqlite: Database.Database,
    pgPool: Pool | null,
    config: Partial<DualWriteConfig> = {}
  ) {
    super();
    this.sqlite = sqlite;
    this.pgPool = pgPool;
    this.config = {
      enableDualWrite: config.enableDualWrite ?? process.env.ENABLE_DUAL_WRITE === 'true',
      logShadowErrors: config.logShadowErrors ?? true,
      shadowWriteTimeoutMs: config.shadowWriteTimeoutMs ?? 5000
    };
  }

  /**
   * Store memory with dual-write: SQLite (primary) + Neon (shadow)
   */
  async storeMemory(params: {
    locationId: string;
    content: string;
    tags: string[];
    importance?: number;
    semanticCat?: string;
  }) {
    // Primary write to SQLite (always blocking, always succeeds or throws)
    const result = this.sqlite
      .prepare(
        `INSERT INTO memory (id, location_id, content, tags, importance, semantic_cat, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        createId(),
        params.locationId,
        params.content,
        JSON.stringify(params.tags),
        params.importance ?? 0,
        params.semanticCat ?? null,
        Date.now(),
        Date.now()
      );

    // Shadow write to Neon (async, non-blocking, errors logged)
    if (this.config.enableDualWrite && this.pgPool) {
      this.shadowWriteMemory(params, result.lastInsertRowid as string).catch(err => {
        this.shadowErrorCount++;
        if (this.config.logShadowErrors) {
          console.error(
            `[dual-write] Shadow write failed for memory ${result.lastInsertRowid}:`,
            err.message
          );
        }
        this.emit('shadow-write-failed', {
          operation: 'storeMemory',
          error: err.message,
          timestamp: new Date()
        });
      });
    }

    return result;
  }

  /**
   * Log audit event with dual-write
   */
  async logAudit(params: {
    spaceId: string;
    userId: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'SHARE';
    targetType: string;
    targetId: string;
    metadata?: Record<string, any>;
    hmacSig: string;
  }) {
    const auditId = createId();
    const createdAt = Date.now();

    // Primary write to SQLite
    const result = this.sqlite
      .prepare(
        `INSERT INTO audit_log (id, space_id, user_id, action, target_type, target_id, metadata, hmac_sig, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        auditId,
        params.spaceId,
        params.userId,
        params.action,
        params.targetType,
        params.targetId,
        params.metadata ? JSON.stringify(params.metadata) : null,
        params.hmacSig,
        createdAt
      );

    // Shadow write to Neon
    if (this.config.enableDualWrite && this.pgPool) {
      this.shadowWriteAudit(params, auditId, createdAt).catch(err => {
        this.shadowErrorCount++;
        if (this.config.logShadowErrors) {
          console.error(`[dual-write] Audit shadow write failed:`, err.message);
        }
        this.emit('shadow-write-failed', {
          operation: 'logAudit',
          error: err.message,
          timestamp: new Date()
        });
      });
    }

    return result;
  }

  /**
   * Shadow write to Neon (non-blocking, with timeout)
   */
  private async shadowWriteMemory(
    params: {
      locationId: string;
      content: string;
      tags: string[];
      importance?: number;
      semanticCat?: string;
    },
    memoryId: string
  ) {
    if (!this.pgPool) return;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Shadow write timeout')),
        this.config.shadowWriteTimeoutMs
      )
    );

    try {
      await Promise.race([
        this.pgPool.query(
          `INSERT INTO "Memory" (id, location_id, content, tags, importance, semantic_cat, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            memoryId,
            params.locationId,
            params.content,
            params.tags,
            params.importance ?? 0,
            params.semanticCat ?? null,
            new Date(),
            new Date()
          ]
        ),
        timeoutPromise
      ]);

      this.emit('shadow-write-success', { operation: 'storeMemory' });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Shadow write audit log to Neon
   */
  private async shadowWriteAudit(
    params: {
      spaceId: string;
      userId: string;
      action: string;
      targetType: string;
      targetId: string;
      metadata?: Record<string, any>;
      hmacSig: string;
    },
    auditId: string,
    createdAt: number
  ) {
    if (!this.pgPool) return;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Shadow write timeout')),
        this.config.shadowWriteTimeoutMs
      )
    );

    try {
      await Promise.race([
        this.pgPool.query(
          `INSERT INTO audit_log (id, space_id, user_id, action, target_type, target_id, metadata, hmac_sig, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            auditId,
            params.spaceId,
            params.userId,
            params.action,
            params.targetType,
            params.targetId,
            params.metadata || null,
            params.hmacSig,
            new Date(createdAt)
          ]
        ),
        timeoutPromise
      ]);

      this.emit('shadow-write-success', { operation: 'logAudit' });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Synchronous checkpoint on export completion (Optimization 4)
   */
  async checkpointWAL() {
    try {
      this.sqlite.exec('PRAGMA wal_checkpoint(TRUNCATE)');
      this.emit('checkpoint-complete');
    } catch (error) {
      console.error('[dual-write] WAL checkpoint failed:', error);
    }
  }

  /**
   * Get dual-write statistics
   */
  getStats() {
    return {
      dualWriteEnabled: this.config.enableDualWrite,
      shadowErrorCount: this.shadowErrorCount,
      pgPoolConnected: !!this.pgPool
    };
  }

  /**
   * Reset error counter (for monitoring dashboards)
   */
  resetStats() {
    this.shadowErrorCount = 0;
  }
}