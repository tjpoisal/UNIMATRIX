import { prisma as sharedPrisma } from "@unimatrix/db";
import type { LegacyPrisma } from "./prisma-legacy";

// Temporary: export the shared Prisma proxy with a legacy-bridging type that
// exposes old delegate names as `any`. This keeps the exported symbol typed
// (not a raw `any`) while avoiding a flood of compile errors. We'll replace
// this with the canonical PrismaClient type as files are migrated.
export const prisma = sharedPrisma as unknown as LegacyPrisma;

// (No global caching needed here — packages/db implements lazy singleton caching.)
