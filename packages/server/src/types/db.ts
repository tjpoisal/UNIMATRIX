/**
 * src/types/db.ts
 *
 * Raw pg row shapes — exactly what node-postgres returns from queries.
 * Snake_case, Buffers for BYTEA, strings for NUMERIC (pg default).
 * Nothing outside src/db/ should ever use these types directly.
 */

export type MemoryStatus = 'active' | 'superseded' | 'archived';
export type MemorySource = 'mcp' | 'api' | 'import' | 'librarian';

export interface DbUser {
  id:         string;
  clerk_id:   string;
  created_at: Date;
  updated_at: Date;
}

export interface DbSpace {
  id:            string;
  user_id:       string;
  parent_id:     string | null;
  org_id:        string | null;
  name:          string;
  description:   string | null;
  is_scratchpad: boolean;
  created_at:    Date;
  updated_at:    Date;
}

export interface DbMemory {
  id:            string;
  user_id:       string;
  space_id:      string | null;
  org_id:        string | null;
  content:       Buffer;          // AES-256-GCM ciphertext blob
  content_iv:    Buffer;          // IV convenience copy (also packed in content)
  summary:       string | null;   // null until Librarian processes
  embedding:     number[] | null; // null until Librarian processes
  status:        MemoryStatus;
  superseded_by: string | null;
  superseded_at: Date   | null;
  confidence:    string | null;   // pg NUMERIC → string; parse with parseFloat
  source:        MemorySource;
  hint:          string | null;
  created_at:    Date;
  indexed_at:    Date   | null;   // null = pending Librarian
  updated_at:    Date;
}

export interface DbMemoryTag {
  id:         string;
  memory_id:  string;
  user_id:    string;
  tag:        string;
  created_at: Date;
}

/** DbMemory + aggregated tags array (from correlated subquery) */
export interface DbMemoryWithTags extends DbMemory {
  tags: string[];
}

/** DbMemory + search scoring fields (from hybrid search CTEs) */
export interface DbMemorySearchResult extends DbMemoryWithTags {
  relevance_score:    string;   // pg float → string
  cosine_similarity:  string;
  days_since_created: string;
}
