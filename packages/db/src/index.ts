/**
 * @unimatrix/db
 *
 * Shared database access layer.
 * This is intended to become the single source of truth for the Prisma schema.
 *
 * Currently the rich schema from the MCP server is used here.
 *
 * Usage:
 *   import { prisma } from '@unimatrix/db';
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __unimatrixPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__unimatrixPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__unimatrixPrisma = prisma;
}

export * from '@prisma/client';
export type { Prisma } from '@prisma/client';
