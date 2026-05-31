/**
 * src/middleware/rls-guard.ts
 *
 * Development-time guard that catches any pg.PoolClient query on a
 * user-data table that runs WITHOUT app.current_user_id being set.
 *
 * Production: no-op.
 * Development/test: wraps pool.connect() so every query on a protected
 * table first checks that the session variable is set, throwing a loud
 * RlsGuardError rather than silently returning empty results.
 *
 * Call installRlsGuard() once at startup (before any DB queries).
 */

import type pg from 'pg';
import { pool }  from '../db/client.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PROTECTED_TABLES = new Set([
  'users',
  'spaces',
  'memories',
  'memory_tags',
]);

const EXEMPT_PATTERNS = [
  /^SET\s+LOCAL/i,
  /^BEGIN/i,
  /^COMMIT/i,
  /^ROLLBACK/i,
  /^INSERT\s+INTO\s+mcp_audit_log/i,
  /current_user_id\s*\(\s*\)/i,
];

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class RlsGuardError extends Error {
  constructor(table: string, query: string) {
    super(
      `[RLS Guard] Query on protected table "${table}" ran without ` +
      `app.current_user_id being set.\n` +
      `Use withUserContext() or withUserContextReadOnly() from src/db/client.ts.\n` +
      `Query preview: ${query.slice(0, 200)}`,
    );
    this.name = 'RlsGuardError';
  }
}

// ---------------------------------------------------------------------------
// Guard installation
// ---------------------------------------------------------------------------

let installed = false;

/**
 * Install the RLS guard on the global pool.
 * Idempotent — safe to call multiple times.
 * No-op in production (NODE_ENV === 'production').
 */
export function installRlsGuard(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (installed) return;
  installed = true;

  const originalConnect = pool.connect.bind(pool);

  pool.connect = async (): Promise<pg.PoolClient> => {
    const client = await originalConnect();
    return createGuardedClient(client);
  };

  console.log('[RLS Guard] Installed — will throw on unguarded user-table queries');
}

function createGuardedClient(client: pg.PoolClient): pg.PoolClient {
  const originalQuery = client.query.bind(client);

  const guardedQuery = async (...args: Parameters<typeof originalQuery>) => {
    const sql =
      typeof args[0] === 'string'
        ? args[0]
        : (args[0] as { text: string }).text;

    if (EXEMPT_PATTERNS.some((p) => p.test(sql.trim()))) {
      return originalQuery(...args);
    }

    const touchedTable = [...PROTECTED_TABLES].find((t) =>
      new RegExp(`\\b${t}\\b`, 'i').test(sql),
    );

    if (touchedTable) {
      const check = await originalQuery(
        `SELECT current_setting('app.current_user_id', true) AS uid`,
      );
      const uid = (check as any).rows?.[0]?.uid;
      if (!uid || uid.trim() === '') {
        throw new RlsGuardError(touchedTable, sql);
      }
    }

    return originalQuery(...args);
  };

  // @ts-expect-error — replacing query method on client
  client.query = guardedQuery;
  return client;
}
