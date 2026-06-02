import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { getUserOrganizations } from './organizations';

/**
 * Auth context returned by the platform.
 * For multi-tenant collab, organizationId is REQUIRED for all room operations.
 * API keys should be created under a specific organization.
 */
export interface AuthContext {
  userId: string;
  organizationId: string; // Always resolved to a valid org for collab features
}

/**
 * Resolves a user from either:
 * - A NextAuth session (web UI)
 * - A Unimatrix API key (Bearer token: umx_...)
 *
 * Returns the userId if authenticated, otherwise null.
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // 1. Try API Key first (preferred for external LLMs and agents)
  const authHeader = req.headers.get('authorization') ?? '';
  
  if (authHeader.startsWith('Bearer umx_')) {
    const rawKey = authHeader.slice(7); // Remove "Bearer "
    const prefix = rawKey.slice(0, 12);

    const keys = await prisma.apiKey.findMany({
      where: {
        keyPrefix: prefix,
        revokedAt: null,
      },
      select: {
        id: true,
        userId: true,
        keyHash: true,
      },
    });

    for (const key of keys) {
      const isValid = await bcrypt.compare(rawKey, key.keyHash);
      if (isValid) {
        // Update last used timestamp (fire and forget)
        prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsed: new Date() },
        }).catch(() => {});

        return key.userId;
      }
    }
  }

  // 2. Fall back to NextAuth session (for web UI)
  // Note: For server-side routes, we usually use the `auth()` helper from next-auth.
  // This function is mainly useful for routes that need to support both.
  return null;
}

/**
 * Returns full auth context (user + organization).
 * 
 * Resolution order (for API keys and sessions):
 * 1. If the API key is explicitly linked to an organization → use it (preferred for agents)
 * 2. Otherwise, return the user's oldest (primary/personal) organization
 * 
 * For collab features, this **never returns null organizationId**.
 * If no org can be resolved, the caller must treat as 403.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return null;

  // Check if the API key being used is org-scoped
  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader.startsWith('Bearer umx_')) {
    const rawKey = authHeader.slice(7);
    const prefix = rawKey.slice(0, 12);

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        keyPrefix: prefix,
        revokedAt: null,
      },
      select: { organizationId: true },
    });

    if (apiKey?.organizationId) {
      return { userId, organizationId: apiKey.organizationId };
    }
  }

  // Fallback: Get the user's primary organization (personal workspace created on signup)
  const organizations = await getUserOrganizations(userId);

  if (organizations.length > 0) {
    const primaryOrg = organizations[0];
    return {
      userId,
      organizationId: primaryOrg.id,
    };
  }

  // No organization possible — caller should 403 for org-scoped ops
  return {
    userId,
    organizationId: '', // sentinel; callers must check truthiness
  };
}

/**
 * Helper for routes that want to require authentication.
 * Throws a 401 Response if not authenticated.
 */
export async function requireUser(req: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(req);
  
  if (!userId) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return userId;
}

/**
 * Require authenticated context with a valid organization.
 * Returns 401 for missing auth, 403 for authenticated but no org context.
 * Use this for all collaboration / multi-tenant routes.
 */
export async function requireAuthContext(req: NextRequest): Promise<AuthContext> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    throw new Response(JSON.stringify({ error: 'Unauthorized — missing or invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!ctx.organizationId) {
    throw new Response(JSON.stringify({ error: 'Forbidden — organization context required for this resource' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return ctx;
}
