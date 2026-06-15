/**
 * src/types/mcp.ts
 *
 * MCP tool input/output schemas and token budget constants.
 * All four tools defined here: store_memory, recall_context,
 * search_memories, get_timeline.
 */

import { z } from 'zod';
import type { RecalledMemory, TimelineEntry } from './domain.js';

export type { RecalledMemory, TimelineEntry };

// ---------------------------------------------------------------------------
// Token budgets
// ---------------------------------------------------------------------------

export const TOKEN_BUDGET = {
  DESKTOP: 4_000,
  MOBILE:    800,
} as const;

export type ClientProfile = 'desktop' | 'mobile';

// ---------------------------------------------------------------------------
// store_memory
// ---------------------------------------------------------------------------

export const StoreMemoryInputSchema = z.object({
  content: z.string().min(1).max(50_000),
  hint:    z.string().max(500).optional(),
  tags:    z.array(z.string()).optional(), // e.g. ['llm-source:claude'] for auto organization by LLM
});

export type StoreMemoryInput = z.infer<typeof StoreMemoryInputSchema>;

export interface StoreMemoryOutput {
  memoryId:            string;
  status:              'queued';
  estimatedIndexingMs: number;
}

// ---------------------------------------------------------------------------
// recall_context
// ---------------------------------------------------------------------------

export const RecallContextInputSchema = z.object({
  topic:   z.string().max(500).optional(),
  limit:   z.number().int().min(1).max(20).default(10),
  spaceId: z.string().uuid().optional(),
  profile: z.enum(['desktop', 'mobile']).default('desktop'),
});

export type RecallContextInput = z.infer<typeof RecallContextInputSchema>;

export interface RecallContextOutput {
  memories:    RecalledMemory[];
  tokenCount:  number;
  truncated:   boolean;
  profile:     ClientProfile;
  decayLambda: number;
}

// ---------------------------------------------------------------------------
// search_memories
// ---------------------------------------------------------------------------

export const SearchMemoriesInputSchema = z.object({
  query:   z.string().min(1).max(500),
  spaceId: z.string().uuid().optional(),
  tags:    z.array(z.string().max(100)).max(10).optional(),
  status:  z.enum(['active', 'superseded', 'archived']).optional(),
  limit:   z.number().int().min(1).max(50).default(10),
  profile: z.enum(['desktop', 'mobile']).default('desktop'),
});

export type SearchMemoriesInput = z.infer<typeof SearchMemoriesInputSchema>;

export interface SearchMemoriesOutput {
  memories:   RecalledMemory[];
  tokenCount: number;
  truncated:  boolean;
  profile:    ClientProfile;
}

// ---------------------------------------------------------------------------
// supersede_memory
// ---------------------------------------------------------------------------

export const SupersedeMemoryInputSchema = z.object({
  memoryId: z.string().uuid(),
  content:  z.string().min(1).max(50_000).optional(),
  hint:     z.string().max(500).optional(),
});

export type SupersedeMemoryInput = z.infer<typeof SupersedeMemoryInputSchema>;

export interface SupersedeMemoryOutput {
  supersededId:  string;
  replacementId: string | null;
  status:        'superseded';
}

// ---------------------------------------------------------------------------
// get_timeline
// ---------------------------------------------------------------------------

export const GetTimelineInputSchema = z.object({
  spaceId:           z.string().uuid().optional(),
  status:            z.enum(['active', 'superseded', 'archived']).optional(),
  limit:             z.number().int().min(1).max(50).default(20),
  offset:            z.number().int().min(0).default(0),
  includeSuperseded: z.boolean().default(false),
  startDate:         z.string().datetime().optional(),
  endDate:           z.string().datetime().optional(),
});

export type GetTimelineInput  = z.infer<typeof GetTimelineInputSchema>;

export interface GetTimelineOutput {
  entries: TimelineEntry[];
  total:   number;
}

// ---------------------------------------------------------------------------
// remember (alias for store_memory — user-facing name)
// ---------------------------------------------------------------------------

export const RememberInputSchema = z.object({
  content:  z.string().min(1).max(50_000),
  context:  z.string().max(500).optional(),  // maps to hint
  tags:     z.array(z.string()).optional(),
});

export type RememberInput = z.infer<typeof RememberInputSchema>;

// ---------------------------------------------------------------------------
// recall (alias for search_memories — user-facing name)
// ---------------------------------------------------------------------------

export const RecallInputSchema = z.object({
  query:   z.string().min(1).max(500),
  limit:   z.number().int().min(1).max(50).default(10),
  profile: z.enum(['desktop', 'mobile']).default('desktop'),
  spaceId: z.string().uuid().optional(),
});

export type RecallInput = z.infer<typeof RecallInputSchema>;

// ---------------------------------------------------------------------------
// get_recent — last N memories across all LLMs / devices
// ---------------------------------------------------------------------------

export const GetRecentInputSchema = z.object({
  limit:   z.number().int().min(1).max(50).default(10),
  profile: z.enum(['desktop', 'mobile']).default('desktop'),
});

export type GetRecentInput = z.infer<typeof GetRecentInputSchema>;

// ---------------------------------------------------------------------------
// continue_from — full context of a prior session
// ---------------------------------------------------------------------------

export const ContinueFromInputSchema = z.object({
  session_id: z.string().optional(),  // spaceId / context identifier
  limit:      z.number().int().min(1).max(50).default(20),
  profile:    z.enum(['desktop', 'mobile']).default('desktop'),
});

export type ContinueFromInput = z.infer<typeof ContinueFromInputSchema>;

// ---------------------------------------------------------------------------
// list_contexts — list all workspaces for this user
// ---------------------------------------------------------------------------

export const ListContextsInputSchema = z.object({});

export type ListContextsInput = z.infer<typeof ListContextsInputSchema>;
