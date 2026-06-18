/**
 * @unimatrix/db
 *
 * Shared database access layer.
 * Lazily instantiates PrismaClient on first access so that Next.js build-time
 * static analysis (page-data collection) does not throw when DATABASE_URL is
 * absent from the Docker build environment.  The error surfaces at request time.
 */

import { PrismaClient } from '../generated/prisma-client/index.js';

declare global {
  // eslint-disable-next-line no-var
  var __unimatrixPrisma: PrismaClient | undefined;
}

function getPrisma(): PrismaClient {
  if (global.__unimatrixPrisma) return global.__unimatrixPrisma;

  if (!process.env.DATABASE_URL) {
    // During `next build` the env var is absent — defer throw to request time.
    return new Proxy({} as PrismaClient, {
      get(_t, prop) {
        if (prop === 'then') return undefined; // not a thenable
        throw new Error(
          `[unimatrix/db] DATABASE_URL is not set. Refusing to execute "${String(prop)}" on PrismaClient.`
        );
      },
    });
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    global.__unimatrixPrisma = client;
  }

  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export { PrismaClient } from '../generated/prisma-client/index.js';
export type { Prisma }  from '../generated/prisma-client/index.js';
export * from '../generated/prisma-client/index.js';
