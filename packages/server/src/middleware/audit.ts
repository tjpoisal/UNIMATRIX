/**
 * src/middleware/audit.ts
 *
 * MCP call audit logging.
 *
 * Every MCP tool call is timed and logged to mcp_audit_log before returning.
 * Uses pool.query() directly (not withUserContext) because:
 *   a) Audit writes must succeed even when the main query fails.
 *   b) Audit rows are not tenant-filtered — they need service-level access.
 *
 * Audit failure never surfaces to the user — fire-and-forget, logged to stderr.
 */

import { pool }        from '../db/client.js';
import { hashPayload } from '../security/sanitize.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type McpTool =
  | 'store_memory'
  | 'recall_context'
  | 'search_memories'
  | 'get_timeline'
  | 'supersede_memory'
  // Cross-LLM user-facing tool names
  | 'remember'
  | 'recall'
  | 'get_recent'
  | 'continue_from'
  | 'list_contexts';

export interface AuditEntry {
  userId:          string;
  tool:            McpTool;
  memoryId?:       string;
  /** Raw content/query — will be hashed before storage, never stored plaintext */
  payloadPreimage: string;
  success:         boolean;
  durationMs:      number;
  errorCode?:      string;
}

export async function auditLog(
  userId: string,
  action: 'CREATE' | 'READ' | 'DELETE' | 'SUPERSEDE' | 'EXPORT' | 'SHARE',
  memoryId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, memory_id, metadata)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [userId, action, memoryId ?? null, metadata ? JSON.stringify(metadata) : null],
    );
  } catch (err) {
    console.error('[auditLog] Failed to write audit log:', err);
  }
}

// ---------------------------------------------------------------------------
// Core write function
// ---------------------------------------------------------------------------

export async function writeAuditEntry(entry: AuditEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO mcp_audit_log
         (user_id, tool, memory_id, payload_hash, success, duration_ms, error_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.userId,
        entry.tool,
        entry.memoryId  ?? null,
        hashPayload(entry.payloadPreimage),
        entry.success,
        entry.durationMs,
        entry.errorCode ?? null,
      ],
    );
  } catch (err) {
    console.error('[audit] Failed to write entry:', {
      tool:   entry.tool,
      userId: entry.userId,
      error:  err instanceof Error ? err.message : String(err),
    });
  }
}

// ---------------------------------------------------------------------------
// withAudit wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps an MCP tool handler with timing and audit logging.
 *
 *   const handler = withAudit('store_memory', async (input, userId) => { ... });
 *
 * On success: logs { success: true, durationMs }
 * On failure: logs { success: false, errorCode }, then rethrows.
 */
export function withAudit<
  TInput,
  TOutput,
>(
  tool: McpTool,
  fn:   (input: TInput, userId: string) => Promise<TOutput & { memoryId?: string }>,
): (input: TInput, userId: string) => Promise<TOutput> {
  return async (input: TInput, userId: string): Promise<TOutput> => {
    const start           = Date.now();
    const i               = input as Record<string, unknown>;
    const payloadPreimage =
      (typeof i['content'] === 'string' ? i['content'] :
       typeof i['query']   === 'string' ? i['query']   :
       typeof i['topic']   === 'string' ? i['topic']   :
       JSON.stringify(input)) as string;

    try {
      const result    = await fn(input, userId);
      const durationMs = Date.now() - start;

      void writeAuditEntry({
        userId,
        tool,
        memoryId: result.memoryId,
        payloadPreimage,
        success:  true,
        durationMs,
      });

      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      const errorCode  =
        (err instanceof Error && (err as any).code)
          ? String((err as any).code)
          : err instanceof Error
            ? err.constructor.name
            : 'UnknownError';

      void writeAuditEntry({
        userId,
        tool,
        payloadPreimage,
        success:  false,
        durationMs,
        errorCode,
      });

      throw err;
    }
  };
}

// ---------------------------------------------------------------------------
// Anomaly detection queries (run on a schedule or in the management UI)
// ---------------------------------------------------------------------------

export async function getHighVolumeRecallUsers(
  thresholdPerHour = 200,
): Promise<Array<{ userId: string; callCount: number }>> {
  const result = await pool.query<{ user_id: string; call_count: string }>(
    `SELECT user_id, COUNT(*) AS call_count
       FROM mcp_audit_log
      WHERE tool = 'recall_context'
        AND created_at > NOW() - INTERVAL '1 hour'
      GROUP BY user_id
     HAVING COUNT(*) > $1
      ORDER BY call_count DESC`,
    [thresholdPerHour],
  );
  return result.rows.map((r) => ({
    userId:    r.user_id,
    callCount: parseInt(r.call_count, 10),
  }));
}

export async function getRecentApiKeyLeaks(
  limitHours = 24,
): Promise<Array<{ userId: string; memoryId: string; createdAt: Date }>> {
  const result = await pool.query<{
    user_id:    string;
    memory_id:  string;
    created_at: Date;
  }>(
    `SELECT user_id, memory_id, created_at
       FROM mcp_audit_log
      WHERE tool       = 'store_memory'
        AND error_code = 'ApiKeyDetected'
        AND created_at > NOW() - ($1 || ' hours')::INTERVAL
      ORDER BY created_at DESC`,
    [limitHours],
  );
  return result.rows.map((r) => ({
    userId:    r.user_id,
    memoryId:  r.memory_id,
    createdAt: r.created_at,
  }));
}
