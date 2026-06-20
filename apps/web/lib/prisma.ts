import { prisma as sharedPrisma } from "@unimatrix/db";

// Re-export the shared Prisma proxy from @unimatrix/db to avoid duplicate clients
// and version/hoisting mismatches during install/build.
export const prisma = sharedPrisma;

// (No global caching needed here — packages/db implements lazy singleton caching.)
