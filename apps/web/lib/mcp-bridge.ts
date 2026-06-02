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
import { prisma as richPrisma } from '@unimatrix/db'; // rich schema client for cross-auth user stub + shared mcp_tokens targeting (with @@map)

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
  const webUser = await webPrisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!webUser) {
    throw new Error('User not found');
  }

  // Cross-auth bridge: ensure a stub row exists in the rich users table (lowercase, with clerk_id derived)
  // so that mcp_tokens.user_id satisfies FKs to users(id) and RLS / memory ownership works under this id.
  // This allows NextAuth web users to generate tokens usable by the Clerk-oriented MCP server.
  // clerk_id uses 'nextauth:' prefix to avoid collision with real Clerk subs; email unique is honored.
  await richPrisma.user.upsert({
    where: { id: userId },
    update: { email: webUser.email || undefined, name: webUser.name || undefined },
    create: {
      id: userId,
      clerk_id: `nextauth:${userId}`,
      email: webUser.email || `user-${userId}@unimatrix.local`,
      name: webUser.name || null,
      tier: 'free', // will be upgraded via other flows if needed
    },
  });

  const rawToken = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  const hashedToken = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);

  let expiresAt: Date | null = null;
  if (expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Write the token using the rich client (source of truth for mcp_tokens table via @@map + full model)
  // This keeps ownership with packages/db / server schema during hybrid auth migration.
  const created = await richPrisma.mcpToken.create({
    data: {
      id: undefined, // let cuid default
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
 * Uses rich client so it reads from the canonical mcp_tokens table (shared with MCP server).
 */
export async function listMcpTokensForUser(userId: string) {
  return richPrisma.mcpToken.findMany({
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
 * Uses rich client targeting the shared mcp_tokens table.
 */
export async function revokeMcpToken(tokenId: string, userId: string) {
  await richPrisma.mcpToken.updateMany({
    where: { id: tokenId, userId },
    data: { revokedAt: new Date() },
  });
}
