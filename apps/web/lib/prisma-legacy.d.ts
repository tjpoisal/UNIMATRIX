/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@unimatrix/db";

// Temporary legacy Prisma shape used to bridge older model names (palace/location/etc)
// to the canonical Prisma schema in packages/db. This file intentionally uses
// `any` for unknown legacy delegates so we can incrementally replace them with
// accurate types during the full typing cleanup.

export type LegacyPrisma = PrismaClient & {
  palace?: any;
  palaceShare?: any;
  location?: any;
  memory?: any;
  memoryTag?: any;
  friendship?: any;
  apiKey?: any;
  authAttempt?: any;
  organization?: any;
  organizationMember?: any;
  syncState?: any;
  collabRoom?: any;
  collabMessage?: any;
  webhookSubscription?: any;
  agentConfig?: any;
  tokenLog?: any;
  pendingAction?: any;
  mfaRecoveryRequest?: any;
  lLMProvider?: any;
  [k: string]: any;
};
