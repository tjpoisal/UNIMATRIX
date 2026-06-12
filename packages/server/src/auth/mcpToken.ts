/**
 * src/auth/mcpToken.ts
 *
 * MCP Token management for UNIMATRIX.
 *
 * Token format: umx_<prefix8>_<random56>
 *   - "umx_"    — product prefix (easy to identify in logs)
 *   - prefix8   — first 8 chars of random hex (stored plaintext for O(1) lookup)
 *   - random56  — remaining 56 chars (never stored; only bcrypt hash stored)
 *
 * Why the prefix pattern?
 *   The naive approach scans ALL active tokens + bcrypt-compares each one.
 *   For a user with 5 tokens that costs 5 bcrypt operations (~500ms).
 *   Storing the first 8 hex chars (32 bits of entropy) as a lookup key narrows
 *   the candidate set to ~1 row with overwhelmingly high probability, making
 *   validation effectively O(1) regardless of token count.
 *
 * Security properties:
 *   - Raw token never stored; only bcrypt hash (ROUNDS=12)
 *   - Prefix gives ~4 billion distinct lookup keys — safe to store plaintext
 *   - Token validated with bcrypt compare against hashed_token
 *   - Revocation and expiry checked before compare
 */

import { pool }  from '../db/client.js';
import crypto    from 'crypto';
import bcrypt    from 'bcryptjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS   = 12;
const TOKEN_RAND_BYTES = 32; // 256 bits = 64 hex chars
const TOKEN_PREFIX_LEN = 8;  // first 8 hex chars stored for lookup
const TOKEN_NAMESPACE  = 'umx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRawToken(randomHex: string): string {
  return `${TOKEN_NAMESPACE}_${randomHex.slice(0, TOKEN_PREFIX_LEN)}_${randomHex.slice(TOKEN_PREFIX_LEN)}`;
}

function extractPrefix(rawToken: string): string | null {
  // Format: umx_<prefix8>_<rest>
  const parts = rawToken.split('_');
  if (parts.length !== 3 || parts[0] !== TOKEN_NAMESPACE) return null;
  return parts[1] ?? null;
}

function stripFormatting(rawToken: string): string {
  // Reconstruct the original random hex for bcrypt compare
  const parts = rawToken.split('_');
  if (parts.length !== 3) return rawToken;
  return (parts[1] ?? '') + (parts[2] ?? '');
}

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

export async function generateMcpToken(
  userId: string,
  scope: 'full' | 'readonly' | 'memory_only' = 'full',
  expiresInDays?: number,
): Promise<{ token: string; tokenId: string; expiresAt: Date | null }> {
  if (!userId) throw new Error('userId is required');

  const randomHex  = crypto.randomBytes(TOKEN_RAND_BYTES).toString('hex'); // 64 hex chars
  const rawToken   = buildRawToken(randomHex);
  const prefix     = randomHex.slice(0, TOKEN_PREFIX_LEN);
  const hashedToken = await bcrypt.hash(randomHex, BCRYPT_ROUNDS); // hash the raw hex, not the formatted token

  let expiresAt: Date | null = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // token column stores the prefix for O(1) lookup (not the full raw token)
  const result = await pool.query<{ id: string }>(
    `INSERT INTO mcp_tokens (user_id, token, hashed_token, scope, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id`,
    [userId, prefix, hashedToken, scope, expiresAt],
  );

  return {
    token:    rawToken,    // Return full formatted token to caller (shown ONCE)
    tokenId:  result.rows[0].id,
    expiresAt,
  };
}

// ---------------------------------------------------------------------------
// Token validation — O(1) lookup via prefix
// ---------------------------------------------------------------------------

export interface ValidateMcpTokenResult {
  userId:  string;
  tokenId: string;
  scope:   'full' | 'readonly' | 'memory_only';
}

export async function validateMcpToken(
  rawToken: string,
): Promise<ValidateMcpTokenResult | null> {
  if (!rawToken) return null;

  const prefix = extractPrefix(rawToken);
  if (!prefix) return null; // not a valid umx_ token

  // O(1) lookup: fetch only the row(s) matching this prefix
  const result = await pool.query<{
    id:           string;
    user_id:      string;
    hashed_token: string;
    scope:        string;
    expires_at:   string | null;
    revoked_at:   string | null;
  }>(
    `SELECT id, user_id, hashed_token, scope, expires_at, revoked_at
       FROM mcp_tokens
      WHERE token      = $1
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())`,
    [prefix],
  );

  if (result.rows.length === 0) return null;

  // bcrypt compare against the raw hex (not the formatted token)
  const rawHex = stripFormatting(rawToken);
  let matchedRow: typeof result.rows[0] | null = null;
  for (const row of result.rows) {
    if (await bcrypt.compare(rawHex, row.hashed_token)) {
      matchedRow = row;
      break;
    }
  }
  if (!matchedRow) return null;

  // Update last_used_at (fire-and-forget)
  pool.query(
    `UPDATE mcp_tokens SET last_used_at = NOW() WHERE id = $1`,
    [matchedRow.id],
  ).catch((err) => console.error('[auth] last_used_at update failed:', err));

  return {
    userId:  matchedRow.user_id,
    tokenId: matchedRow.id,
    scope:   matchedRow.scope as ValidateMcpTokenResult['scope'],
  };
}

// ---------------------------------------------------------------------------
// Revocation
// ---------------------------------------------------------------------------

export async function revokeMcpToken(tokenId: string, userId: string): Promise<void> {
  if (!tokenId || !userId) throw new Error('tokenId and userId are required');

  const result = await pool.query(
    `UPDATE mcp_tokens SET revoked_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id`,
    [tokenId, userId],
  );

  if (result.rows.length === 0) {
    throw new Error('Token not found or does not belong to user');
  }
}

// ---------------------------------------------------------------------------
// Rotation
// ---------------------------------------------------------------------------

export async function rotateMcpToken(
  oldTokenId: string,
  userId:     string,
  scope?:     'full' | 'readonly' | 'memory_only',
  expiresInDays?: number,
): Promise<{ token: string; tokenId: string; expiresAt: Date | null }> {
  if (!oldTokenId || !userId) throw new Error('oldTokenId and userId are required');

  const oldRow = await pool.query<{ scope: string }>(
    `SELECT scope FROM mcp_tokens WHERE id = $1 AND user_id = $2`,
    [oldTokenId, userId],
  );
  if (oldRow.rows.length === 0) {
    throw new Error('Old token not found or does not belong to user');
  }

  await revokeMcpToken(oldTokenId, userId);
  return generateMcpToken(userId, scope ?? (oldRow.rows[0].scope as any), expiresInDays);
}

// ---------------------------------------------------------------------------
// Listing
// ---------------------------------------------------------------------------

export interface ListMcpTokensResult {
  id:         string;
  scope:      'full' | 'readonly' | 'memory_only';
  expiresAt:  Date | null;
  revokedAt:  Date | null;
  lastUsedAt: Date | null;
  createdAt:  Date;
}

export async function listMcpTokens(userId: string): Promise<ListMcpTokensResult[]> {
  if (!userId) throw new Error('userId is required');

  const result = await pool.query<{
    id:           string;
    scope:        string;
    expires_at:   string | null;
    revoked_at:   string | null;
    last_used_at: string | null;
    created_at:   string;
  }>(
    `SELECT id, scope, expires_at, revoked_at, last_used_at, created_at
       FROM mcp_tokens WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows.map((row) => ({
    id:         row.id,
    scope:      row.scope as ListMcpTokensResult['scope'],
    expiresAt:  row.expires_at  ? new Date(row.expires_at)  : null,
    revokedAt:  row.revoked_at  ? new Date(row.revoked_at)  : null,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    createdAt:  new Date(row.created_at),
  }));
}
