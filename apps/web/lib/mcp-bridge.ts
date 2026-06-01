/**
 * Auth / Token Bridge between the Web app (NextAuth + its own ApiKeys)
 * and the Core MCP Server (Clerk + McpToken system).
 *
 * This layer allows users logged into the web UI to generate long-lived
 * tokens that work directly with the production MCP server at /mcp.
 *
 * Long-term: Unify on Clerk + shared @unimatrix/db.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma as webPrisma } from './prisma'; // web's current Prisma for user lookup
// In the future we can switch to: import { prisma } from '@unimatrix/db';

const BCRYPT_ROUNDS = 10;
const TOKEN_LENGTH = 32;

/**
 * Generate a token compatible with the MCP server's mcp_tokens table.
 * The web user must be authenticated.
 *
 * Returns the raw token (show once to the user).
 */
export async function generateMcpTokenForUser(
  userId: string,
  scope: 'full' | 'readonly' | 'memory_only' = 'full',
  expiresInDays = 365
): Promise<{ token: string; tokenId: string; expiresAt: Date | null }> {
  if (!userId) throw new Error('userId is required');

  // Verify the user exists in the system (web schema user)
  const user = await webPrisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const rawToken = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  const hashedToken = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);

  let expiresAt: Date | null = null;
  if (expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Insert directly into the mcp_tokens table (shared DB)
  // This works because we share the Postgres instance.
  // Note: uses raw query because web's Prisma schema may not yet include McpToken model.
  const result = await webPrisma.$queryRawUnsafe<{ id: string }[]>(
    `INSERT INTO mcp_tokens (user_id, token, hashed_token, scope, expires_at, created_at)
     VALUES ($1, NULL, $2, $3, $4, NOW())
     RETURNING id`,
    userId,
    hashedToken,
    scope,
    expiresAt
  );

  const tokenId = result[0].id;

  return {
    token: rawToken,
    tokenId,
    expiresAt,
  };
}

/**
 * List active MCP tokens for a user (for the settings page).
 */
export async function listMcpTokensForUser(userId: string) {
  return webPrisma.$queryRawUnsafe<any[]>(
    `SELECT id, scope, expires_at, last_used_at, created_at, revoked_at
     FROM mcp_tokens
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    userId
  );
}

/**
 * Revoke a token.
 */
export async function revokeMcpToken(tokenId: string, userId: string) {
  await webPrisma.$queryRawUnsafe(
    `UPDATE mcp_tokens SET revoked_at = NOW() WHERE id = $1 AND user_id = $2`,
    tokenId,
    userId
  );
}
