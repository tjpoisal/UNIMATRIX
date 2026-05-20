/**
 * src/auth/verifyUser.ts
 *
 * Clerk JWT verification for MCP tool calls.
 *
 * Flow:
 *   1. Extract Bearer token from Authorization header
 *   2. Verify with Clerk SDK (checks signature, expiry, issuer)
 *   3. Extract sub claim (Clerk user ID, e.g. "user_2abc...")
 *   4. Look up internal UUID in users table by clerk_id
 *   5. Auto-provision user row on first login (clerk_id is the stable identity)
 *
 * Dev mode: if CLERK_SECRET_KEY starts with "sk_test_" AND the request
 * carries an x-user-id header, skip JWT verification and use that UUID
 * directly. This lets curl/Postman testing work without a real Clerk token.
 * In production (sk_live_...) x-user-id is always ignored.
 */

import { verifyToken } from '@clerk/backend';
import { pool }        from '../db/client.js';

// ---------------------------------------------------------------------------
// Clerk config
// ---------------------------------------------------------------------------

const IS_DEV = process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') ?? false;

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function findOrCreateUser(clerkId: string): Promise<string> {
  // Try to find existing user first (fast path, no lock)
  const select = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE clerk_id = $1`,
    [clerkId],
  );
  if (select.rows.length > 0) return select.rows[0].id;

  // Auto-provision on first login
  const insert = await pool.query<{ id: string }>(
    `INSERT INTO users (clerk_id)
     VALUES ($1)
     ON CONFLICT (clerk_id) DO UPDATE SET clerk_id = EXCLUDED.clerk_id
     RETURNING id`,
    [clerkId],
  );
  return insert.rows[0].id;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface AuthResult {
  userId:   string;   // internal UUID from users table
  clerkId:  string;   // raw Clerk sub claim
  devMode:  boolean;  // true if JWT verification was skipped
}

/**
 * Verify a request and return the authenticated user's internal UUID.
 * Throws if verification fails in production.
 */
export async function verifyUser(
  headers: Record<string, string | string[] | undefined>,
): Promise<AuthResult> {
  // ── Dev shortcut (sk_test_ only) ────────────────────────────────────────
  if (IS_DEV) {
    const devId = Array.isArray(headers['x-user-id'])
      ? headers['x-user-id'][0]
      : headers['x-user-id'];
    if (devId) {
      return { userId: devId, clerkId: 'dev', devMode: true };
    }
  }

  // ── Production: require Bearer token ────────────────────────────────────
  const authHeader = Array.isArray(headers['authorization'])
    ? headers['authorization'][0]
    : headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing Authorization header'), { statusCode: 401 });
  }

  const token = authHeader.slice(7);

  let clerkId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY ?? '',
    });
    clerkId = payload.sub;
  } catch (err) {
    throw Object.assign(
      new Error(`Invalid Clerk token: ${err instanceof Error ? err.message : String(err)}`),
      { statusCode: 401 },
    );
  }

  const userId = await findOrCreateUser(clerkId);
  return { userId, clerkId, devMode: false };
}
