import { PrismaClient } from "@prisma/client";

// During schema unification (see packages/db + SCHEMA_ALIGNMENT.md) we keep the
// web-specific client for legacy Palace/Location models + NextAuth tables.
// New cross-cutting models like McpToken are now present in this client too.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
