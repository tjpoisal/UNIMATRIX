/**
 * src/types/domain.ts
 *
 * Application-layer domain types. These flow through business logic after
 * the db/ layer has: decrypted content, renamed fields to camelCase, and
 * joined related data. Nothing here touches the DB directly.
 */

import type { MemoryStatus, MemorySource } from './db.js';

export type { MemoryStatus, MemorySource };

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export interface User {
  id:        string;
  clerkId:   string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Space {
  id:           string;
  userId:       string;
  parentId:     string | null;
  orgId:        string | null;
  name:         string;
  description:  string | null;
  isScratchpad: boolean;
  createdAt:    Date;
  updatedAt:    Date;
}

export interface Memory {
  id:           string;
  userId:       string;
  spaceId:      string | null;
  orgId:        string | null;
  // Layer 1 — verbatim, decrypted at the db/ boundary
  content:      string;
  // Layer 2 — Librarian synthesis
  summary:      string | null;
  // Time-aware invalidation
  status:       MemoryStatus;
  supersededBy: string | null;
  supersededAt: Date   | null;
  // Librarian metadata
  confidence:   number | null;
  source:       MemorySource;
  hint:         string | null;
  tags:         string[];
  // Timestamps
  createdAt:    Date;
  indexedAt:    Date | null;
}

export interface MemoryTag {
  id:        string;
  memoryId:  string;
  userId:    string;
  tag:       string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Derived / projected types
// ---------------------------------------------------------------------------

/**
 * RecalledMemory — returned by recall_context and search_memories.
 * content omitted: callers receive summaries only.
 * get_timeline is the only tool that returns verbatim content.
 */
export interface RecalledMemory extends Omit<Memory, 'content'> {
  summary:          string;   // guaranteed non-null (indexed_at IS NOT NULL filter)
  relevanceScore:   number;
  cosineSimilarity: number;
  daysSinceCreated: number;
}

/**
 * TimelineEntry — returned by get_timeline.
 * Includes decrypted verbatim content for full historical recall.
 */
export interface TimelineEntry extends Memory {
  isSuperseded:        boolean;
  supersededByContent: string | null;
}

// ---------------------------------------------------------------------------
// Librarian async queue types
// ---------------------------------------------------------------------------

export interface LibrarianJob {
  memoryId:  string;
  userId:    string;
  content:   string;      // sanitized — no API keys or PII
  hint:      string | null;
  createdAt: Date;
}

export interface LibrarianResult {
  memoryId:          string;
  spaceId:           string | null;
  additionalSpaceIds: string[];    // poly-tagged when confidence < 0.85
  tags:              string[];
  summary:           string;
  confidence:        number;
}

/** Used internally by the Librarian when evaluating space candidates */
export interface SpaceCandidate {
  spaceId:    string;
  spaceName:  string;
  confidence: number;
}
