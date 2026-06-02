/**
 * src/handlers/explorer.ts
 *
 * Explorer API handlers for the UNIMATRIX dashboard.
 * Provides paginated memory browsing, space tree navigation,
 * tag cloud, and aggregate statistics.
 */

import { withUserContextReadOnlyRaw as withUserContextReadOnly } from '../db/client.js';
import type { MemoryStatus, MemorySource } from '../types/domain.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExplorerMemory {
  id: string;
  spaceId: string | null;
  summary: string;
  status: MemoryStatus;
  source: MemorySource;
  confidence: number | null;
  tags: string[];
  createdAt: Date;
  indexedAt: Date | null;
}

export interface ExplorerPaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ExplorerMemoriesResponse {
  data: ExplorerMemory[];
  pagination: ExplorerPaginationMeta;
}

export interface ExplorerSpace {
  id: string;
  name: string;
  description: string | null;
  isScratchpad: boolean;
  memoryCount: number;
  children?: ExplorerSpace[];
}

export interface ExplorerSpacesResponse {
  data: ExplorerSpace[];
}

export interface ExplorerTag {
  tag: string;
  count: number;
}

export interface ExplorerTagsResponse {
  data: ExplorerTag[];
}

export interface ExplorerStats {
  totalMemories: number;
  totalSpaces: number;
  memoriesByDay: Array<{ date: string; count: number }>;
  tagsByFrequency: Array<{ tag: string; count: number }>;
}

export interface ExplorerStatsResponse {
  data: ExplorerStats;
}

// ---------------------------------------------------------------------------
// listMemories — paginated memory list with filters
// ---------------------------------------------------------------------------

export interface ListMemoriesParams {
  page?: number;
  limit?: number;
  status?: MemoryStatus;
  spaceId?: string;
  source?: MemorySource;
  tags?: string[];
  search?: string;
  from?: Date;
  to?: Date;
}

/**
 * GET /api/explorer/memories
 *
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 *   - status: 'active' | 'superseded' | 'archived' (optional)
 *   - spaceId: uuid (optional)
 *   - source: string (optional)
 *   - tags: string[] (optional)
 *   - search: string (optional) — full-text search query
 *   - from: ISO date string (optional)
 *   - to: ISO date string (optional)
 */
export async function listMemories(
  userId: string,
  params: ListMemoriesParams,
): Promise<ExplorerMemoriesResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const offset = (page - 1) * limit;

  return withUserContextReadOnly(userId, async (client) => {
    const whereClauses: string[] = [
      'm.user_id = $1',
      'm.deleted_at IS NULL',
    ];
    const queryParams: unknown[] = [userId];

    // status filter
    if (params.status) {
      whereClauses.push(`m.status = $${queryParams.length + 1}`);
      queryParams.push(params.status);
    }

    // spaceId filter
    if (params.spaceId) {
      whereClauses.push(`m.space_id = $${queryParams.length + 1}`);
      queryParams.push(params.spaceId);
    }

    // source filter
    if (params.source) {
      whereClauses.push(`m.source = $${queryParams.length + 1}`);
      queryParams.push(params.source);
    }

    // date range filter — created_at BETWEEN $4 AND $5
    if (params.from) {
      whereClauses.push(`m.created_at >= $${queryParams.length + 1}`);
      queryParams.push(params.from);
    }
    if (params.to) {
      whereClauses.push(`m.created_at <= $${queryParams.length + 1}`);
      queryParams.push(params.to);
    }

    // full-text search via to_tsvector on decoded BYTEA content
    if (params.search && params.search.trim().length > 0) {
      whereClauses.push(
        `to_tsvector('english', decode(m.content, 'utf8')) @@ plainto_tsquery('english', $${queryParams.length + 1})`,
      );
      queryParams.push(params.search.trim());
    }

    // tag filtering via IN (SELECT memory_id FROM memory_tags WHERE tag = ANY($tags))
    if (params.tags && params.tags.length > 0) {
      whereClauses.push(
        `m.id IN (SELECT memory_id FROM memory_tags WHERE tag = ANY($${queryParams.length + 1}))`,
      );
      queryParams.push(params.tags);
    }

    const whereClause = whereClauses.join(' AND ');

    // Count total
    const countRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM memories m WHERE ${whereClause}`,
      queryParams,
    );
    const total = parseInt(countRes.rows[0]?.count ?? '0', 10);

    // Fetch paginated results
    const dataRes = await client.query<{
      id: string;
      space_id: string | null;
      summary: string;
      status: string;
      source: string;
      confidence: string | null;
      tags: string[];
      created_at: Date;
      indexed_at: Date | null;
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
       ORDER BY m.created_at DESC, m.id DESC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset],
    );

    const data: ExplorerMemory[] = dataRes.rows.map((r) => ({
      id: r.id,
      spaceId: r.space_id,
      summary: r.summary,
      status: r.status as MemoryStatus,
      source: r.source as MemorySource,
      confidence: r.confidence !== null ? parseFloat(r.confidence) : null,
      tags: r.tags ?? [],
      createdAt: r.created_at,
      indexedAt: r.indexed_at,
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

// ---------------------------------------------------------------------------
// getMemory — single memory with tags and space info
// ---------------------------------------------------------------------------

/**
 * GET /api/explorer/memories/:id
 */
export async function getMemory(
  userId: string,
  memoryId: string,
): Promise<ExplorerMemory | null> {
  return withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<{
      id: string;
      space_id: string | null;
      summary: string;
      status: string;
      source: string;
      confidence: string | null;
      tags: string[];
      created_at: Date;
      indexed_at: Date | null;
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
       WHERE m.id = $1 AND m.user_id = $2 AND m.deleted_at IS NULL`,
      [memoryId, userId],
    );

    if (res.rows.length === 0) return null;

    const r = res.rows[0];
    return {
      id: r.id,
      spaceId: r.space_id,
      summary: r.summary,
      status: r.status as MemoryStatus,
      source: r.source as MemorySource,
      confidence: r.confidence !== null ? parseFloat(r.confidence) : null,
      tags: r.tags ?? [],
      createdAt: r.created_at,
      indexedAt: r.indexed_at,
    };
  });
}

// ---------------------------------------------------------------------------
// listSpaces — user's spaces tree with memory counts (recursive CTE)
// ---------------------------------------------------------------------------

/**
 * GET /api/explorer/spaces
 *
 * Returns a hierarchical tree of spaces using a recursive CTE on parent_id.
 */
export async function listSpaces(userId: string): Promise<ExplorerSpacesResponse> {
  return withUserContextReadOnly(userId, async (client) => {
    // Recursive CTE to build the space hierarchy
    const res = await client.query<{
      id: string;
      name: string;
      description: string | null;
      is_scratchpad: boolean;
      parent_id: string | null;
      memory_count: string;
      depth: number;
    }>(
      `WITH RECURSIVE space_tree AS (
         -- anchor: top-level spaces (no parent)
         SELECT
           s.id,
           s.name,
           s.description,
           s.is_scratchpad,
           s.parent_id,
           0 AS depth
         FROM spaces s
         WHERE s.user_id = $1
           AND s.parent_id IS NULL
           AND s.deleted_at IS NULL

         UNION ALL

         -- recursive: child spaces
         SELECT
           s.id,
           s.name,
           s.description,
           s.is_scratchpad,
           s.parent_id,
           st.depth + 1
         FROM spaces s
         INNER JOIN space_tree st ON s.parent_id = st.id
         WHERE s.user_id = $1
           AND s.deleted_at IS NULL
       )
       SELECT
         st.id,
         st.name,
         st.description,
         st.is_scratchpad,
         st.parent_id,
         COUNT(m.id)::text AS memory_count
       FROM space_tree st
       LEFT JOIN memories m ON m.space_id = st.id AND m.user_id = $1 AND m.deleted_at IS NULL
       GROUP BY st.id, st.name, st.description, st.is_scratchpad, st.parent_id, st.depth
       ORDER BY st.depth ASC, st.name ASC`,
      [userId],
    );

    // Build nested tree from flat rows
    const spaceMap = new Map<string, ExplorerSpace & { parentId: string | null }>();
    const roots: ExplorerSpace[] = [];

    for (const r of res.rows) {
      const space: ExplorerSpace & { parentId: string | null } = {
        id: r.id,
        name: r.name,
        description: r.description,
        isScratchpad: r.is_scratchpad,
        memoryCount: parseInt(r.memory_count, 10),
        parentId: r.parent_id,
        children: [],
      };
      spaceMap.set(r.id, space);
    }

    for (const space of spaceMap.values()) {
      if (space.parentId && spaceMap.has(space.parentId)) {
        const parent = spaceMap.get(space.parentId)!;
        parent.children = parent.children ?? [];
        parent.children.push(space);
      } else {
        roots.push(space);
      }
    }

    // Strip parentId from output
    const stripParentId = (s: ExplorerSpace & { parentId?: string | null }): ExplorerSpace => {
      const { parentId: _, ...rest } = s;
      if (rest.children && rest.children.length === 0) {
        delete rest.children;
      }
      if (rest.children) {
        rest.children = rest.children.map(stripParentId as any);
      }
      return rest;
    };

    return { data: roots.map(stripParentId) };
  });
}

// ---------------------------------------------------------------------------
// getTagCloud — tag frequencies for the current user
// ---------------------------------------------------------------------------

/**
 * GET /api/explorer/tags
 *
 * Returns top 100 tags by frequency for the authenticated user.
 */
export async function getTagCloud(userId: string): Promise<ExplorerTagsResponse> {
  return withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<{
      tag: string;
      count: string;
    }>(
      `SELECT mt.tag, COUNT(*) as count
       FROM memory_tags mt
       JOIN memories m ON mt.memory_id = m.id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL
       GROUP BY mt.tag
       ORDER BY count DESC
       LIMIT 100`,
      [userId],
    );

    const data: ExplorerTag[] = res.rows.map((r) => ({
      tag: r.tag,
      count: parseInt(r.count, 10),
    }));

    return { data };
  });
}

// ---------------------------------------------------------------------------
// getStats — aggregate statistics
// ---------------------------------------------------------------------------

/**
 * GET /api/explorer/stats
 *
 * Returns:
 *   - totalMemories
 *   - totalSpaces
 *   - memoriesByDay (last 90 days)
 *   - tagsByFrequency (top 50)
 */
export async function getStats(userId: string): Promise<ExplorerStatsResponse> {
  return withUserContextReadOnly(userId, async (client) => {
    // Total memories
    const totalMemoriesRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM memories WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    const totalMemories = parseInt(totalMemoriesRes.rows[0]?.count ?? '0', 10);

    // Total spaces
    const totalSpacesRes = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM spaces WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    const totalSpaces = parseInt(totalSpacesRes.rows[0]?.count ?? '0', 10);

    // Memories by day — last 90 days
    const byDayRes = await client.query<{
      day: string;
      count: string;
    }>(
      `SELECT DATE(created_at) as day, COUNT(*) as count
       FROM memories
       WHERE user_id = $1
         AND deleted_at IS NULL
       GROUP BY day
       ORDER BY day DESC
       LIMIT 90`,
      [userId],
    );
    const memoriesByDay = byDayRes.rows.map((r) => ({
      date: r.day,
      count: parseInt(r.count, 10),
    }));

    // Tags by frequency — top 50
    const tagsRes = await client.query<{
      tag: string;
      count: string;
    }>(
      `SELECT t.tag, COUNT(*) as count
       FROM memory_tags mt
       JOIN memories m ON mt.memory_id = m.id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL
       GROUP BY t.tag
       ORDER BY count DESC
       LIMIT 50`,
      [userId],
    );
    const tagsByFrequency = tagsRes.rows.map((r) => ({
      tag: r.tag,
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
