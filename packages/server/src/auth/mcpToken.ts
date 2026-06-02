/**
 * src/auth/mcpToken.ts
 *
 * MCP Token management for UNIMATRIX:
 *   - generateMcpToken(userId, scope, expiresInDays) -> { token, tokenId, expiresAt }
 *   - revokeMcpToken(tokenId, userId) -> sets revoked_at = NOW()
 *   - listMcpTokens(userId) -> returns all tokens with metadata
 *   - rotateMcpToken(oldTokenId) -> generates new, revokes old, returns new token
 *   - validateMcpToken(rawToken) -> { userId, tokenId, scope } or null
 *   - auto-set last_used_at on each validation
 *
 * Tokens are stored as bcrypt hashes in mcp_tokens.hashed_token for security.
 */

import { pool } from '../db/client.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 10;
const TOKEN_LENGTH = 32; // 256 bits / 8 = 32 bytes

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

/**
 * Generate a new MCP token for a user.
 * Returns the raw token (to be shared with user) and metadata.
 */
export async function generateMcpToken(
  userId: string,
  scope: 'full' | 'readonly' | 'memory_only' = 'full',
  expiresInDays?: number,
): Promise<{ token: string; tokenId: string; expiresAt: Date | null }> {
  if (!userId) throw new Error('userId is required');

  // Generate random token
  const rawToken = crypto.randomBytes(TOKEN_LENGTH).toString('hex');

  // Hash for storage
  const hashedToken = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);

  // Calculate expiration
  let expiresAt: Date | null = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Store in database
  // SECURITY: Do NOT store raw token in 'token' column (plaintext leak).
  // Only store the bcrypt hash. 'token' column should be NULL or dropped via migration.
  const result = await pool.query<{ id: string }>(
    `INSERT INTO mcp_tokens (user_id, token, hashed_token, scope, expires_at, created_at)
     VALUES ($1, NULL, $2, $3, $4, NOW())
     RETURNING id`,
    [userId, hashedToken, scope, expiresAt],
  );

  const tokenId = result.rows[0].id;

  return {
    token: rawToken,
    tokenId,
    expiresAt,
  };
}

// ---------------------------------------------------------------------------
// Token validation
// ---------------------------------------------------------------------------

export interface ValidateMcpTokenResult {
  userId: string;
  tokenId: string;
  scope: 'full' | 'readonly' | 'memory_only';
}

/**
 * Validate a raw MCP token and return user/token metadata.
 * Returns null if token is invalid, expired, or revoked.
 * Auto-updates last_used_at on successful validation.
 */
export async function validateMcpToken(
  rawToken: string,
): Promise<ValidateMcpTokenResult | null> {
  if (!rawToken) return null;

  // SECURITY: Scan active tokens + bcrypt compare (no reliance on plaintext 'token' column).
  // For production scale, add token prefix (first 8 chars) + hash, or embed token_id in a signed token.
  const result = await pool.query<{
    id: string;
    user_id: string;
    hashed_token: string;
    scope: string;
    expires_at: string | null;
    revoked_at: string | null;
  }>(
    `SELECT id, user_id, hashed_token, scope, expires_at, revoked_at
     FROM mcp_tokens
     WHERE revoked_at IS NULL
       AND (expires_at IS NULL OR expires_at > NOW())`,
  );

  let matchedRow: any = null;
  for (const row of result.rows) {
    try {
      if (await bcrypt.compare(rawToken, row.hashed_token)) {
        matchedRow = row;
        break;
      }
    } catch {}
  }

  if (!matchedRow) return null;

  const row = matchedRow;

  // Check if revoked (redundant but safe)
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
    scope: row.scope as 'full' | 'readonly' | 'memory_only',
  };
}

// ---------------------------------------------------------------------------
// Token revocation
// ---------------------------------------------------------------------------

/**
 * Revoke an MCP token by setting revoked_at = NOW().
 * Verifies ownership (tokenId belongs to userId) before revoking.
 */
export async function revokeMcpToken(
  tokenId: string,
  userId: string,
): Promise<void> {
  if (!tokenId || !userId) throw new Error('tokenId and userId are required');

  const result = await pool.query(
    `UPDATE mcp_tokens
     SET revoked_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [tokenId, userId],
  );

  if (result.rows.length === 0) {
    throw new Error('Token not found or does not belong to user');
  }
}

// ---------------------------------------------------------------------------
// Token rotation
// ---------------------------------------------------------------------------

/**
 * Rotate an MCP token: revoke the old one and generate a new one.
 * Returns the new token and metadata.
 */
export async function rotateMcpToken(
  oldTokenId: string,
  userId: string,
  scope?: 'full' | 'readonly' | 'memory_only',
  expiresInDays?: number,
): Promise<{ token: string; tokenId: string; expiresAt: Date | null }> {
  if (!oldTokenId || !userId) throw new Error('oldTokenId and userId are required');

  // Fetch old token to get scope if not provided
  const oldTokenResult = await pool.query<{
    scope: string;
  }>(
    `SELECT scope FROM mcp_tokens WHERE id = $1 AND user_id = $2`,
    [oldTokenId, userId],
  );

  if (oldTokenResult.rows.length === 0) {
    throw new Error('Old token not found or does not belong to user');
  }

  const oldScope = oldTokenResult.rows[0].scope as 'full' | 'readonly' | 'memory_only';

  // Revoke old token
  await revokeMcpToken(oldTokenId, userId);

  // Generate new token with same scope (or override if provided)
  const newToken = await generateMcpToken(
    userId,
    scope ?? oldScope,
    expiresInDays,
  );

  return newToken;
}

// ---------------------------------------------------------------------------
// Token listing
// ---------------------------------------------------------------------------

export interface ListMcpTokensResult {
  id: string;
  scope: 'full' | 'readonly' | 'memory_only';
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

/**
 * List all MCP tokens for a user (including revoked ones).
 * Returns tokens with metadata for management UI.
 */
export async function listMcpTokens(userId: string): Promise<ListMcpTokensResult[]> {
  if (!userId) throw new Error('userId is required');

  const result = await pool.query<{
    id: string;
    scope: string;
    expires_at: string | null;
    revoked_at: string | null;
    last_used_at: string | null;
    created_at: string;
  }>(
    `SELECT id, scope, expires_at, revoked_at, last_used_at, created_at
     FROM mcp_tokens
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    scope: row.scope as 'full' | 'readonly' | 'memory_only',
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    createdAt: new Date(row.created_at),
  }));
}
