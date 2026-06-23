import { prisma as sharedPrisma } from "@unimatrix/db";

// Re-export the shared Prisma proxy from @unimatrix/db to avoid duplicate clients
// and version/hoisting mismatches during install/build.
// NOTE: The generated Prisma client shapes may differ across packages (legacy palace vs new space).
// To keep the web app building while we align schemas, export a loose-typed prisma for now.
export const prisma: any = sharedPrisma as any;

// (No global caching needed here — packages/db implements lazy singleton caching.)
