import { EventEmitter } from 'events';

interface WriteOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface StorageConfig {
  remoteEnabled: boolean;
  circuitBreakerThreshold: number;
  maxRetries: number;
  retryDelayMs: number;
}

/**
 * DualWriteStorage - TODO: Complete implementation when @unimatrix/db is ready
 */
export class DualWriteStorage extends EventEmitter {
  private failedWriteQueue: WriteOperation[] = [];
  private circuitOpen = false;
  private lastRemoteLatency = 0;
  private syncJobInterval: NodeJS.Timeout | null = null;
  private config: StorageConfig;

  constructor(localDb: any, config: Partial<StorageConfig> = {}) {
    super();
    this.config = {
      remoteEnabled: config.remoteEnabled ?? true,
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 500,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 5000
    };
  }

  startSyncJob(intervalMs: number = 30000): void {
    if (this.syncJobInterval) return;

    this.syncJobInterval = setInterval(async () => {
      await this.processPendingWrites();
    }, intervalMs);

    this.emit('sync-job-started');
  }

  stopSyncJob(): void {
    if (this.syncJobInterval) {
      clearInterval(this.syncJobInterval);
      this.syncJobInterval = null;
      this.emit('sync-job-stopped');
    }
  }

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
        this.emit('write-retry-success', op);
      } catch (error) {
        op.retries++;
        this.failedWriteQueue.push(op);
        this.emit('write-retry-failed', { ...op, error });
      }
    }
  }

  getStats() {
    return {
      circuitOpen: this.circuitOpen,
      lastRemoteLatency: this.lastRemoteLatency,
      pendingWrites: this.failedWriteQueue.length
    };
  }
}