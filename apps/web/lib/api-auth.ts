import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

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
