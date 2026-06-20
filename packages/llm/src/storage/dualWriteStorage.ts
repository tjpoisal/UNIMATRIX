import { EventEmitter } from 'events';
import type { PrismaClient } from '@prisma/client';

interface WriteOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface StorageConfig {
  remoteEnabled: boolean;
  circuitBreakerThreshold: number; // ms
  maxRetries: number;
  retryDelayMs: number;
}

export class DualWriteStorage extends EventEmitter {
  private localDb: PrismaClient;
  private failedWriteQueue: WriteOperation[] = [];
  private circuitOpen = false;
  private lastRemoteLatency = 0;
  private syncJobInterval: NodeJS.Timeout | null = null;
  private config: StorageConfig;

  constructor(localDb: PrismaClient, config: Partial<StorageConfig> = {}) {
    super();
    this.localDb = localDb;
    this.config = {
      remoteEnabled: config.remoteEnabled ?? true,
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 500,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 5000
    };
  }

  /**
   * Start background sync job for failed writes
   */
  startSyncJob(intervalMs: number = 30000): void {
    if (this.syncJobInterval) return;

    this.syncJobInterval = setInterval(async () => {
      await this.processPendingWrites();
    }, intervalMs);

    this.emit('sync-job-started');
  }

  /**
   * Stop background sync job
   */
  stopSyncJob(): void {
    if (this.syncJobInterval) {
      clearInterval(this.syncJobInterval);
      this.syncJobInterval = null;
      this.emit('sync-job-stopped');
    }
  }

  /**
   * Create memory with dual-write
   */
  async createMemory(data: {
    locationId: string;
    content: string;
    tags: string[];
  }): Promise<any> {
    const startTime = Date.now();

    // Write to local SQLite first (always succeeds)
    const localResult = await this.localDb.memory.create({
      data: {
        locationId: data.locationId,
        content: data.content,
        tags: data.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Shadow write to remote (best effort)
    if (this.config.remoteEnabled && !this.circuitOpen) {
      const remoteLatency = Date.now() - startTime;
      this.lastRemoteLatency = remoteLatency;

      if (remoteLatency > this.config.circuitBreakerThreshold) {
        this.circuitOpen = true;
        this.emit('circuit-breaker-open', {
          latency: remoteLatency,
          threshold: this.config.circuitBreakerThreshold
        });
      }

      try {
        // TODO: Send to remote Neon endpoint
        // await this.writeToNeon(localResult);
        this.emit('remote-write-success', { memoryId: localResult.id });
      } catch (error) {
        // Queue for retry
        this.queueFailedWrite({
          id: localResult.id,
          type: 'create',
          data: localResult,
          timestamp: Date.now(),
          retries: 0
        });
        this.emit('remote-write-failed', { memoryId: localResult.id, error });
      }
    }

    return localResult;
  }

  /**
   * Update memory with dual-write
   */
  async updateMemory(id: string, data: Partial<any>): Promise<any> {
    // Local update first
    const localResult = await this.localDb.memory.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    // Remote update (best effort)
    if (this.config.remoteEnabled && !this.circuitOpen) {
      try {
        // TODO: Send to remote Neon endpoint
        // await this.updateInNeon(id, localResult);
        this.emit('remote-write-success', { memoryId: id });
      } catch (error) {
        this.queueFailedWrite({
          id,
          type: 'update',
          data: localResult,
          timestamp: Date.now(),
          retries: 0
        });
        this.emit('remote-write-failed', { memoryId: id, error });
      }
    }

    return localResult;
  }

  /**
   * Delete memory with dual-write
   */
  async deleteMemory(id: string): Promise<void> {
    // Local delete first
    await this.localDb.memory.delete({
      where: { id }
    });

    // Remote delete (best effort)
    if (this.config.remoteEnabled && !this.circuitOpen) {
      try {
        // TODO: Send to remote Neon endpoint
        // await this.deleteInNeon(id);
        this.emit('remote-write-success', { memoryId: id });
      } catch (error) {
        this.queueFailedWrite({
          id,
          type: 'delete',
          data: null,
          timestamp: Date.now(),
          retries: 0
        });
        this.emit('remote-write-failed', { memoryId: id, error });
      }
    }
  }

  /**
   * Queue failed write for retry
   */
  private queueFailedWrite(operation: WriteOperation): void {
    this.failedWriteQueue.push(operation);
    this.emit('write-queued', operation);
  }

  /**
   * Process pending writes from queue
   */
  private async processPendingWrites(): Promise<void> {
    if (this.failedWriteQueue.length === 0) return;

    const batch = [...this.failedWriteQueue];
    this.failedWriteQueue = [];

    for (const op of batch) {
      if (op.retries >= this.config.maxRetries) {
        this.emit('write-max-retries-exceeded', op);
        continue;
      }

      try {
        // TODO: Retry remote write
        this.emit('write-retry-success', op);
      } catch (error) {
        op.retries++;
        this.failedWriteQueue.push(op);
        this.emit('write-retry-failed', { ...op, error });
      }
    }
  }

  /**
   * Check circuit breaker status and attempt reset
   */
  async checkCircuitBreakerStatus(): Promise<boolean> {
    if (!this.circuitOpen) return true;

    try {
      // TODO: Ping Neon to check if back online
      // const latency = await this.pingNeon();
      const latency = this.lastRemoteLatency;

      if (latency < this.config.circuitBreakerThreshold) {
        this.circuitOpen = false;
        this.emit('circuit-breaker-closed');
        return true;
      }
    } catch (error) {
      this.emit('circuit-breaker-check-failed', error);
    }

    return false;
  }

  /**
   * Get pending writes queue
   */
  getPendingWrites(): WriteOperation[] {
    return [...this.failedWriteQueue];
  }

  /**
   * Get storage stats
   */
  getStats() {
    return {
      circuitOpen: this.circuitOpen,
      lastRemoteLatency: this.lastRemoteLatency,
      pendingWrites: this.failedWriteQueue.length,
      queuedOperations: this.failedWriteQueue
    };
  }
}