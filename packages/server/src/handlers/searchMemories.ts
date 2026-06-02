/**
 * src/handlers/searchMemories.ts
 *
 * MCP Tool: search_memories
 *
 * Explicit search with user-controlled filters — vs recall_context which is
 * automatic/implicit. Use this when the LLM has a specific query to answer.
 *
 * Differences from recall_context:
 *   - query is required (not optional)
 *   - can filter by tags (array intersection)
 *   - can filter by status (active / superseded / archived)
 *   - no recency decay — pure relevance ranking
 *   - still token-budget gated, still returns summaries only (no content)
 *
 * Explorer APIs (REST):
 *   - GET /api/explorer/memories — paginated memory list with filters
 *   - GET /api/explorer/memories/:id — single memory with tags and space info
 *   - GET /api/explorer/spaces — user's spaces tree with memory counts
 *   - GET /api/explorer/tags — tag cloud with counts
 *   - GET /api/explorer/stats — aggregate stats (totalMemories, memoriesByDay, etc.)
 */

import { withUserContextRaw, withUserContextReadOnlyRaw as withUserContextReadOnly } from '../db/client.js';
import { withAudit }               from '../middleware/audit.js';
import { generateQueryEmbedding }  from '../embeddings.js';
import { estimateTokenCount }      from '../utils/tokens.js';
import type { MemoryStatus, MemorySource, RecalledMemory } from '../types/domain.js';
import type {
  SearchMemoriesInput,
  SearchMemoriesOutput,
  ClientProfile,
} from '../types/mcp.js';
import { TOKEN_BUDGET } from '../types/mcp.js';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const searchMemoriesHandler = withAudit(
  'search_memories',
  async (
    input:  SearchMemoriesInput,
    userId: string,
  ): Promise<SearchMemoriesOutput> => {

    const profile: ClientProfile = input.profile ?? 'desktop';
    const maxTokens = profile === 'mobile'
      ? TOKEN_BUDGET.MOBILE
      : TOKEN_BUDGET.DESKTOP;

    // Generate query embedding
    const embedding = await generateQueryEmbedding(input.query);

    interface SearchRow {
      id:            string;
      user_id:       string;
      space_id:      string | null;
      org_id:        string | null;
      summary:       string;
      status:        string;
      superseded_by: string | null;
      superseded_at: Date   | null;
      confidence:    string | null;
      source:        string;
      hint:          string | null;
      created_at:    Date;
      indexed_at:    Date   | null;
      tags:          string[];
      cosine_sim:    string;
      days_since:    string;
      score:         string;
    }

    const rows = await withUserContextReadOnly(userId, async (client) => {
      await client.query(`SET LOCAL hnsw.ef_search = 100`);
      const res = await client.query<SearchRow>(
        `WITH candidates AS (
           SELECT
             m.id,
             m.user_id,
             m.space_id,
             m.org_id,
             m.summary,
             m.status,
             m.superseded_by,
             m.superseded_at,
             m.confidence,
             m.source,
             m.hint,
             m.created_at,
             m.indexed_at,
             (
               SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
                 FROM memory_tags t
                WHERE t.memory_id = m.id
             ) AS tags,
             1.0 - (m.embedding <=> $1::vector)           AS cosine_sim,
             EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
           FROM memories m
          WHERE m.user_id    = current_user_id()::uuid
            AND m.indexed_at IS NOT NULL
            AND ($3::uuid IS NULL OR m.space_id = $3::uuid)
            AND ($4::text IS NULL OR m.status   = $4::memory_status)
            AND ($5::text IS NULL
                 OR m.search_vector @@ plainto_tsquery('english', $5::text))
            AND (
              $6::text[] IS NULL
              OR (
                SELECT COUNT(*)
                  FROM memory_tags t2
                 WHERE t2.memory_id = m.id
                   AND t2.tag = ANY($6::text[])
              ) > 0
            )
        )
        SELECT *, cosine_sim AS score
          FROM candidates
         ORDER BY cosine_sim DESC
         LIMIT $2`,
        [
          JSON.stringify(embedding),              // $1 — vector
          (input.limit ?? 10) + 5,               // $2 — fetch buffer
          input.spaceId ?? null,                  // $3
          input.status  ?? null,                  // $4
          input.query,                            // $5 — full-text (always set)
          input.tags && input.tags.length > 0
            ? input.tags
            : null,                              // $6 — tags filter
        ],
      );
      return res.rows;
    });

    // Dedup by id, keep highest cosine_sim
    const seen = new Map<string, RecalledMemory>();
    for (const r of rows) {
      const score = parseFloat(r.cosine_sim);
      const existing = seen.get(r.id);
      if (existing && existing.cosineSimilarity >= score) continue;

      seen.set(r.id, {
        id:               r.id,
        userId:           r.user_id,
        spaceId:          r.space_id,
        orgId:            r.org_id,
        summary:          r.summary,
        status:           r.status as MemoryStatus,
        supersededBy:     r.superseded_by,
        supersededAt:     r.superseded_at,
        confidence:       r.confidence !== null ? parseFloat(r.confidence) : null,
        source:           r.source as MemorySource,
        hint:             r.hint,
        tags:             r.tags ?? [],
        createdAt:        r.created_at,
        indexedAt:        r.indexed_at,
        relevanceScore:   score,
        cosineSimilarity: score,
        daysSinceCreated: parseFloat(r.days_since),
      });
    }

    // Token-budget gating
    let tokenCount = 0;
    let truncated  = false;
    const final: RecalledMemory[] = [];

    for (const m of seen.values()) {
      const est = estimateTokenCount(m.summary);
      if (tokenCount + est > maxTokens) { truncated = true; break; }
      final.push(m);
      tokenCount += est;
    }

    return {
      memories:   final,
      tokenCount: Math.round(tokenCount),
      truncated,
      profile,
    };
  },
);

// ---------------------------------------------------------------------------
// Explorer API Types
// ---------------------------------------------------------------------------

export interface ExplorerMemory {
  id:           string;
  spaceId:      string | null;
  summary:      string;
  status:       MemoryStatus;
  source:       MemorySource;
  confidence:   number | null;
  tags:         string[];
  createdAt:    Date;
  indexedAt:    Date | null;
}

export interface ExplorerPaginationMeta {
  page:      number;
  limit:     number;
  total:     number;
  hasMore:   boolean;
  cursor?:   string;
}

export interface ExplorerMemoriesResponse {
  data:       ExplorerMemory[];
  pagination: ExplorerPaginationMeta;
}

export interface ExplorerSpace {
  id:           string;
  name:         string;
  description:  string | null;
  isScratchpad: boolean;
  memoryCount:  number;
  children?:    ExplorerSpace[];
}

export interface ExplorerSpacesResponse {
  data: ExplorerSpace[];
}

export interface ExplorerTag {
  tag:   string;
  count: number;
}

export interface ExplorerTagsResponse {
  data: ExplorerTag[];
}

export interface ExplorerStats {
  totalMemories:   number;
  totalSpaces:     number;
  memoriesByDay:   Array<{ date: string; count: number }>;
  tagsByFrequency: Array<{ tag: string; count: number }>;
}

export interface ExplorerStatsResponse {
  data: ExplorerStats;
}

// ---------------------------------------------------------------------------
// Explorer API Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/explorer/memories
 * Paginated memory list with filters and cursor-based pagination.
 *
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 *   - status: 'active' | 'superseded' | 'archived' (optional)
 *   - spaceId: uuid (optional)
 *   - source: string (optional)
 *   - tags: comma-separated string (optional)
 *   - from: ISO date string (optional)
 *   - to: ISO date string (optional)
 */
export async function getExplorerMemories(
  userId: string,
  params: {
    page?: number;
    limit?: number;
    status?: MemoryStatus;
    spaceId?: string;
    source?: MemorySource;
    tags?: string[];
    from?: Date;
    to?: Date;
  },
): Promise<ExplorerMemoriesResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const offset = (page - 1) * limit;

  return withUserContextReadOnly(userId, async (client) => {
    // Build WHERE clause dynamically
    const whereClauses: string[] = [
      'm.user_id = current_user_id()::uuid',
      'm.indexed_at IS NOT NULL',
    ];
    const queryParams: unknown[] = [];

    if (params.status) {
      whereClauses.push(`m.status = $${queryParams.length + 1}::memory_status`);
      queryParams.push(params.status);
    }

    if (params.spaceId) {
      whereClauses.push(`m.space_id = $${queryParams.length + 1}::uuid`);
      queryParams.push(params.spaceId);
    }

    if (params.source) {
      whereClauses.push(`m.source = $${queryParams.length + 1}::memory_source`);
      queryParams.push(params.source);
    }

    if (params.from) {
      whereClauses.push(`m.created_at >= $${queryParams.length + 1}`);
      queryParams.push(params.from);
    }

    if (params.to) {
      whereClauses.push(`m.created_at <= $${queryParams.length + 1}`);
      queryParams.push(params.to);
    }

    if (params.tags && params.tags.length > 0) {
      whereClauses.push(
        `EXISTS (
          SELECT 1 FROM memory_tags t
          WHERE t.memory_id = m.id AND t.tag = ANY($${queryParams.length + 1}::text[])
        )`
      );
      queryParams.push(params.tags);
    }

    const whereClause = whereClauses.join(' AND ');

    // Get total count
    const countRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM memories m WHERE ${whereClause}`,
      queryParams,
    );
    const total = parseInt(countRes.rows[0]?.count ?? '0', 10);

    // Get paginated results
    const dataRes = await client.query<{
      id:           string;
      space_id:     string | null;
      summary:      string;
      status:       string;
      source:       string;
      confidence:   string | null;
      tags:         string[];
      created_at:   Date;
      indexed_at:   Date | null;
    }>(
      `SELECT
         m.id,
         m.space_id,
         m.summary,
         m.status,
         m.source,
         m.confidence,
         (
           SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
           FROM memory_tags t
           WHERE t.memory_id = m.id
         ) AS tags,
         m.created_at,
         m.indexed_at
       FROM memories m
       WHERE ${whereClause}
       ORDER BY m.indexed_at DESC, m.id DESC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset],
    );

    const data: ExplorerMemory[] = dataRes.rows.map((r) => ({
      id:         r.id,
      spaceId:    r.space_id,
      summary:    r.summary,
      status:     r.status as MemoryStatus,
      source:     r.source as MemorySource,
      confidence: r.confidence !== null ? parseFloat(r.confidence) : null,
      tags:       r.tags ?? [],
      createdAt:  r.created_at,
      indexedAt:  r.indexed_at,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    };
  });
}

/**
 * GET /api/explorer/memories/:id
 * Single memory with tags and space info.
 */
export async function getExplorerMemory(
  userId: string,
  memoryId: string,
): Promise<ExplorerMemory | null> {
  return withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<{
      id:           string;
      space_id:     string | null;
      summary:      string;
      status:       string;
      source:       string;
      confidence:   string | null;
      tags:         string[];
      created_at:   Date;
      indexed_at:   Date | null;
    }>(
      `SELECT
         m.id,
         m.space_id,
         m.summary,
         m.status,
         m.source,
         m.confidence,
         (
           SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
           FROM memory_tags t
           WHERE t.memory_id = m.id
         ) AS tags,
         m.created_at,
         m.indexed_at
       FROM memories m
       WHERE m.id = $1::uuid AND m.user_id = current_user_id()::uuid`,
      [memoryId],
    );

    if (res.rows.length === 0) return null;

    const r = res.rows[0];
    return {
      id:         r.id,
      spaceId:    r.space_id,
      summary:    r.summary,
      status:     r.status as MemoryStatus,
      source:     r.source as MemorySource,
      confidence: r.confidence !== null ? parseFloat(r.confidence) : null,
      tags:       r.tags ?? [],
      createdAt:  r.created_at,
      indexedAt:  r.indexed_at,
    };
  });
}

/**
 * GET /api/explorer/spaces
 * User's spaces tree with memory counts.
 */
export async function getExplorerSpaces(userId: string): Promise<ExplorerSpacesResponse> {
  return withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<{
      id:            string;
      name:          string;
      description:   string | null;
      is_scratchpad: boolean;
      memory_count:  string;
    }>(
      `SELECT
         s.id,
         s.name,
         s.description,
         s.is_scratchpad,
         COUNT(m.id) as memory_count
       FROM spaces s
       LEFT JOIN memories m ON m.space_id = s.id AND m.user_id = current_user_id()::uuid
       WHERE s.user_id = current_user_id()::uuid
       GROUP BY s.id, s.name, s.description, s.is_scratchpad
       ORDER BY s.name ASC`,
    );

    const data: ExplorerSpace[] = res.rows.map((r) => ({
      id:           r.id,
      name:         r.name,
      description:  r.description,
      isScratchpad: r.is_scratchpad,
      memoryCount:  parseInt(r.memory_count, 10),
    }));

    return { data };
  });
}

/**
 * GET /api/explorer/tags
 * Tag cloud with counts.
 */
export async function getExplorerTags(userId: string): Promise<ExplorerTagsResponse> {
  return withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<{
      tag:   string;
      count: string;
    }>(
      `SELECT t.tag, COUNT(*) as count
       FROM memory_tags t
       JOIN memories m ON m.id = t.memory_id
       WHERE m.user_id = current_user_id()::uuid
       GROUP BY t.tag
       ORDER BY count DESC, tag ASC`,
    );

    const data: ExplorerTag[] = res.rows.map((r) => ({
      tag:   r.tag,
      count: parseInt(r.count, 10),
    }));

    return { data };
  });
}

/**
 * GET /api/explorer/stats
 * Aggregate stats: totalMemories, totalSpaces, memoriesByDay, tagsByFrequency.
 */
export async function getExplorerStats(userId: string): Promise<ExplorerStatsResponse> {
  return withUserContextReadOnly(userId, async (client) => {
    // Total memories
    const totalRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM memories WHERE user_id = current_user_id()::uuid`,
    );
    const totalMemories = parseInt(totalRes.rows[0]?.count ?? '0', 10);

    // Total spaces
    const spacesRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM spaces WHERE user_id = current_user_id()::uuid`,
    );
    const totalSpaces = parseInt(spacesRes.rows[0]?.count ?? '0', 10);

    // Memories by day
    const byDayRes = await client.query<{
      date:  string;
      count: string;
    }>(
      `SELECT
         DATE(m.created_at) as date,
         COUNT(*) as count
       FROM memories m
       WHERE m.user_id = current_user_id()::uuid
       GROUP BY DATE(m.created_at)
       ORDER BY date DESC`,
    );
    const memoriesByDay = byDayRes.rows.map((r) => ({
      date:  r.date,
      count: parseInt(r.count, 10),
    }));

    // Tags by frequency
    const tagsRes = await client.query<{
      tag:   string;
      count: string;
    }>(
      `SELECT t.tag, COUNT(*) as count
       FROM memory_tags t
       JOIN memories m ON m.id = t.memory_id
       WHERE m.user_id = current_user_id()::uuid
       GROUP BY t.tag
       ORDER BY count DESC
       LIMIT 50`,
    );
    const tagsByFrequency = tagsRes.rows.map((r) => ({
      tag:   r.tag,
      count: parseInt(r.count, 10),
    }));

    return {
      data: {
        totalMemories,
        totalSpaces,
        memoriesByDay,
        tagsByFrequency,
      },
    };
  });
}
