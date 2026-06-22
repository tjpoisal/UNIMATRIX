/**
 * lib/db.ts
 *
 * Raw PostgreSQL pool for CSMTER routes that need direct SQL access
 * (pgvector HNSW, BM25 tsvector queries) that Prisma ORM can't express.
 *
 * Lazily initialises the pool on first use so that Next.js build-time
 * static analysis / page-data collection does NOT throw when DATABASE_URL
 * is absent from the Docker build environment.  The error surfaces at
 * request time, not at module-import time.
 */

import { Pool } from 'pg';

declare global {
  // Lazily-initialized global Pool singleton used across the app
  var __pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (globalThis.__pgPool) return globalThis.__pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  globalThis.__pgPool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return globalThis.__pgPool;
}

/**
 * Proxy-based singleton: pool.connect() and all other Pool methods work
 * normally, but the underlying Pool is not created until first access.
 * This prevents module-import-time throws during `next build`.
 */
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const p = getPool();
    const val = (p as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(p) : val;
  },
});
