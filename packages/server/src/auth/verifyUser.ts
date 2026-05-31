/**
 * src/auth/verifyUser.ts
 *
 * Multi-method authentication for UNIMATRIX:
 *   1. MCP Token (Bearer token for API routes) — validates against McpToken table
 *   2. Clerk JWT (for MCP tool paths /mcp) — verifies signature, expiry, issuer
 *   3. Dev shortcut (sk_test_ + x-user-id header) — skips verification for testing
 *
 * Flow:
 *   - For API routes (non-MCP): check Authorization: Bearer <mcp_token>
 *   - For MCP tool paths (/mcp): check Clerk JWT in Authorization header
 *   - Dev mode: if CLERK_SECRET_KEY starts with "sk_test_" AND x-user-id header present,
 *     use UUID directly (skips JWT verification)
 *   - Auto-provision user row on first login (clerk_id is the stable identity)
 */

import { verifyToken } from '@clerk/backend';
import { pool } from '../db/client.js';
import crypto from 'crypto';

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

/**
 * Hash a token using SHA-256 for comparison against stored hashed_token.
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ---------------------------------------------------------------------------
// MCP Token verification
// ---------------------------------------------------------------------------

export interface VerifyMcpTokenResult {
  userId: string;
  tokenId: string;
  scope: string;
}

/**
 * Verify an MCP token and return the associated user ID and token metadata.
 * Returns null if token is invalid, expired, or revoked.
 */
export async function verifyMcpToken(
  token: string,
): Promise<VerifyMcpTokenResult | null> {
  if (!token) return null;

  const hashedToken = hashToken(token);

  const result = await pool.query<{
    id: string;
    user_id: string;
    scope: string;
    expires_at: string | null;
    revoked_at: string | null;
  }>(
    `SELECT id, user_id, scope, expires_at, revoked_at
     FROM mcp_tokens
     WHERE hashed_token = $1`,
    [hashedToken],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  // Check if revoked
  if (row.revoked_at) return null;

  // Check if expired
  if (row.expires_at) {
    const expiresAt = new Date(row.expires_at);
    if (expiresAt < new Date()) return null;
  }

  // Update last_used_at
  await pool.query(
    `UPDATE mcp_tokens SET last_used_at = NOW() WHERE id = $1`,
    [row.id],
  ).catch((err) => {
    console.error('[auth] Failed to update last_used_at:', err);
  });

  return {
    userId: row.user_id,
    tokenId: row.id,
    scope: row.scope,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface AuthResult {
  userId: string; // internal UUID from users table
  authMethod: 'clerk' | 'mcp_token' | 'dev_shortcut';
}

/**
 * Verify a request and return the authenticated user's internal UUID.
 * Supports three auth methods:
 *   1. MCP Token (Bearer token for API routes)
 *   2. Clerk JWT (for MCP tool paths)
 *   3. Dev shortcut (sk_test_ + x-user-id header)
 *
 * Throws if verification fails.
 */
export async function verifyUser(
  headers: Record<string, string | string[] | undefined>,
  isMcpPath: boolean = false,
): Promise<AuthResult> {
  // ── Dev shortcut (sk_test_ only) ────────────────────────────────────────
  if (IS_DEV) {
    const devId = Array.isArray(headers['x-user-id'])
      ? headers['x-user-id'][0]
      : headers['x-user-id'];
    if (devId) {
      return { userId: devId, authMethod: 'dev_shortcut' };
    }
  }

  // ── Extract Authorization header ────────────────────────────────────────
  const authHeader = Array.isArray(headers['authorization'])
    ? headers['authorization'][0]
    : headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing Authorization header'), { statusCode: 401 });
  }

  const token = authHeader.slice(7);

  // ── Route-specific auth logic ───────────────────────────────────────────
  if (isMcpPath) {
    // MCP tool paths use Clerk JWT
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
    return { userId, authMethod: 'clerk' };
  } else {
    // API routes use MCP token
    const mcpResult = await verifyMcpToken(token);
    if (!mcpResult) {
      throw Object.assign(new Error('Invalid or expired MCP token'), { statusCode: 401 });
    }

    return { userId: mcpResult.userId, authMethod: 'mcp_token' };
  }
}
