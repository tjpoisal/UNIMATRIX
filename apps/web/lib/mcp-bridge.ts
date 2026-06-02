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
import { prisma as webPrisma } from './prisma'; // web's Prisma (now includes McpToken model via schema unification step)

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

  // Use typed Prisma (McpToken model was added to web schema as part of migration to @unimatrix/db)
  const created = await webPrisma.mcpToken.create({
    data: {
      userId,
      token: null, // per security best practice (only store hash)
      hashedToken,
      scope,
      expiresAt,
    },
    select: { id: true },
  });

  return {
    token: rawToken,
    tokenId: created.id,
    expiresAt,
  };
}

/**
 * List active MCP tokens for a user (for the settings page).
 */
export async function listMcpTokensForUser(userId: string) {
  return webPrisma.mcpToken.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      scope: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });
}

/**
 * Revoke a token.
 */
export async function revokeMcpToken(tokenId: string, userId: string) {
  await webPrisma.mcpToken.updateMany({
    where: { id: tokenId, userId },
    data: { revokedAt: new Date() },
  });
}
