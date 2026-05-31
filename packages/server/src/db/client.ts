import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

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
// RLS hygiene — on every fresh or recycled connection, wipe the user context
// at session level so a reused connection never leaks a previous user's ID.
// withUserContext sets it transaction-locally (is_local=true), which resets
// to this null at COMMIT/ROLLBACK, making cross-user leaks impossible.
// ---------------------------------------------------------------------------
pool.on('connect', (client) => {
  client.query(`SELECT set_config('app.current_user_id', '', false)`).catch((err) => {
    console.error('[db] Failed to initialize RLS context on new connection:', err);
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function withUserContext<T>(
  userId: string,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error('withUserContext: userId is required');

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

export async function withUserContextReadOnly<T>(
  userId: string,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error('withUserContextReadOnly: userId is required');

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
}
