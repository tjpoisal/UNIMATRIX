/**
 * lib/db.ts
 *
 * Raw PostgreSQL pool for CSMTER routes that need direct SQL access
 * (pgvector HNSW, BM25 tsvector queries) that Prisma ORM can't express.
 *
 * Uses the same DATABASE_URL as Prisma. Pool is shared across requests
 * via module singleton (Next.js module caching keeps it alive across hot reloads).
 */

import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

// Singleton: reuse pool across Next.js hot reloads in development
export const pool: Pool =
  globalThis.__pgPool ?? (globalThis.__pgPool = createPool());
