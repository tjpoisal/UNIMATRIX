import pg from 'pg';
import { PrismaClient } from '@unimatrix/db';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Raw pg Pool kept for complex cases / backward compat during migration to full Prisma.
// RLS is now primarily handled via Prisma transactions below.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err);
});

// ---------------------------------------------------------------------------
// RLS hygiene for raw pool (legacy path)
// ---------------------------------------------------------------------------
pool.on('connect', (client) => {
  client.query(`SELECT set_config('app.current_user_id', '', false)`).catch((err) => {
    console.error('[db] Failed to initialize RLS context on new connection:', err);
  });
});

// ---------------------------------------------------------------------------
// Prisma client (from unified @unimatrix/db)
// We use a singleton + $transaction for RLS to keep it isolated and safe.
// set_config(..., true) = transaction-local, auto-resets on COMMIT/ROLLBACK.
// ---------------------------------------------------------------------------
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// ===================================================================
// RLS-aware Prisma (PRIMARY API - we are using Prisma for real now)
// These wrap queries so RLS policies see the current user.
// Prefer these for all new code. Returns a Prisma transaction client.
// ===================================================================
export async function withUserContext<T>(
  userId: string,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error('withUserContext: userId is required');
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    return fn(tx as unknown as PrismaClient);
  });
}

export async function withUserContextReadOnly<T>(
  userId: string,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error('withUserContextReadOnly: userId is required');
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    return fn(tx as unknown as PrismaClient);
  });
}

// Raw pool fallbacks (only for complex hand-written SQL during full Prisma migration)
export async function withUserContextRaw<T>(
  userId: string,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error('withUserContextRaw: userId is required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function withUserContextReadOnlyRaw<T>(
  userId: string,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error('withUserContextReadOnlyRaw: userId is required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
  await prisma.$disconnect();
}
