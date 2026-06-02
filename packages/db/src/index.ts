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

import { PrismaClient } from '../generated/prisma-client/index.js';

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

// Re-export the rich models + PrismaClient from our isolated generated client (avoids polluting / conflicting with web's @prisma/client from legacy schema)
export { PrismaClient } from '../generated/prisma-client/index.js';
export type { Prisma } from '../generated/prisma-client/index.js';
export * from '../generated/prisma-client/index.js';  // brings in model types like User, McpToken, Space, etc. for richPrisma.mcpToken etc.
