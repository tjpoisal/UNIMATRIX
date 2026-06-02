/**
 * src/handlers/spaces.ts
 *
 * REST handlers for Space CRUD.
 *
 * Spaces are the Memory Palace hierarchy: Wings → Halls → Rooms.
 * Without at least one space, classifySpace() has nothing to route into
 * and every memory lands with space_id = NULL (unclassified).
 *
 * Routes (registered in index.ts):
 *   POST   /spaces          → createSpace
 *   GET    /spaces          → listSpaces
 *   GET    /spaces/:id      → getSpace
 *   PATCH  /spaces/:id      → updateSpace (re-indexes embedding if name/desc changed)
 *   DELETE /spaces/:id      → deleteSpace
 *
 * Auth: all routes require Clerk JWT (or x-user-id in dev mode).
 * RLS:  withUserContext ensures queries are scoped to the authenticated user.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { withUserContextRaw, withUserContextReadOnlyRaw as withUserContextReadOnly } from '../db/client.js';
import { indexSpace } from '../librarian/classifySpace.js';
import { verifyUser } from '../auth/verifyUser.js';
import type { Space } from '../types/domain.js';

// ---------------------------------------------------------------------------
// Helper — extract and verify user from request headers
// ---------------------------------------------------------------------------

async function authUser(request: FastifyRequest): Promise<string> {
  const headers = request.headers as Record<string, string | string[] | undefined>;
  const { userId } = await verifyUser(headers);
  return userId;
}

// ---------------------------------------------------------------------------
// DB row → domain type
// ---------------------------------------------------------------------------

interface SpaceRow {
  id:           string;
  user_id:      string;
  parent_id:    string | null;
  org_id:       string | null;
  name:         string;
  description:  string | null;
  is_scratchpad: boolean;
  created_at:   Date;
  updated_at:   Date;
}

function rowToSpace(r: SpaceRow): Space {
  return {
    id:           r.id,
    userId:       r.user_id,
    parentId:     r.parent_id,
    orgId:        r.org_id,
    name:         r.name,
    description:  r.description,
    isScratchpad: r.is_scratchpad,
    createdAt:    r.created_at,
    updatedAt:    r.updated_at,
  };
}

// ---------------------------------------------------------------------------
// POST /spaces
// ---------------------------------------------------------------------------

interface CreateSpaceBody {
  name:         string;
  description?: string;
  parentId?:    string;
  isScratchpad?: boolean;
}

export async function createSpace(
  request: FastifyRequest<{ Body: CreateSpaceBody }>,
  reply:   FastifyReply,
) {
  const userId = await authUser(request);
  const { name, description, parentId, isScratchpad } = request.body;

  if (!name?.trim()) {
    return reply.status(400).send({ error: 'name is required' });
  }

  const row = await withUserContextRaw(userId, async (client) => {
    const res = await client.query<SpaceRow>(
      `INSERT INTO spaces (user_id, parent_id, name, description, is_scratchpad)
       VALUES (current_user_id()::uuid, $1, $2, $3, $4)
       RETURNING *`,
      [
        parentId    ?? null,
        name.trim(),
        description ?? null,
        isScratchpad ?? false,
      ],
    );
    return res.rows[0];
  });

  // Generate and store embedding asynchronously — don't block the response.
  // classifySpace() will pick it up once indexed_at is set.
  indexSpace(row.id, userId).catch((err) =>
    console.error(`[spaces] Failed to index space ${row.id}:`, err),
  );

  return reply.status(201).send(rowToSpace(row));
}

// ---------------------------------------------------------------------------
// GET /spaces
// ---------------------------------------------------------------------------

interface ListSpacesQuery {
  parentId?:    string;
  scratchpad?:  string;   // "true" | "false"
}

export async function listSpaces(
  request: FastifyRequest<{ Querystring: ListSpacesQuery }>,
  reply:   FastifyReply,
) {
  const userId = await authUser(request);
  const { parentId, scratchpad } = request.query;

  const rows = await withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<SpaceRow>(
      `SELECT *
         FROM spaces
        WHERE user_id   = current_user_id()::uuid
          AND ($1::uuid IS NULL OR parent_id   = $1::uuid)
          AND ($2::boolean IS NULL OR is_scratchpad = $2::boolean)
        ORDER BY name ASC`,
      [
        parentId  ?? null,
        scratchpad !== undefined ? scratchpad === 'true' : null,
      ],
    );
    return res.rows;
  });

  return reply.send(rows.map(rowToSpace));
}

// ---------------------------------------------------------------------------
// GET /spaces/:id
// ---------------------------------------------------------------------------

export async function getSpace(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply:   FastifyReply,
) {
  const userId  = await authUser(request);
  const { id }  = request.params;

  const row = await withUserContextReadOnly(userId, async (client) => {
    const res = await client.query<SpaceRow>(
      `SELECT * FROM spaces WHERE id = $1 AND user_id = current_user_id()::uuid`,
      [id],
    );
    return res.rows[0] ?? null;
  });

  if (!row) return reply.status(404).send({ error: 'Space not found' });
  return reply.send(rowToSpace(row));
}

// ---------------------------------------------------------------------------
// PATCH /spaces/:id
// ---------------------------------------------------------------------------

interface UpdateSpaceBody {
  name?:        string;
  description?: string | null;
  parentId?:    string | null;
}

export async function updateSpace(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateSpaceBody }>,
  reply:   FastifyReply,
) {
  const userId = await authUser(request);
  const { id } = request.params;
  const { name, description, parentId } = request.body ?? {};

  // Build SET clause dynamically — only update provided fields
  const sets:   string[] = ['updated_at = NOW()'];
  const params: unknown[] = [id];   // $1 = id

  if (name !== undefined)        { params.push(name.trim());  sets.push(`name        = $${params.length}`); }
  if (description !== undefined) { params.push(description);  sets.push(`description = $${params.length}`); }
  if (parentId !== undefined)    { params.push(parentId);     sets.push(`parent_id   = $${params.length}`); }

  if (sets.length === 1) {
    return reply.status(400).send({ error: 'No updatable fields provided' });
  }

  const row = await withUserContextRaw(userId, async (client) => {
    const res = await client.query<SpaceRow>(
      `UPDATE spaces
          SET ${sets.join(', ')}
        WHERE id      = $1
          AND user_id = current_user_id()::uuid
        RETURNING *`,
      params,
    );
    return res.rows[0] ?? null;
  });

  if (!row) return reply.status(404).send({ error: 'Space not found' });

  // Re-index embedding if searchable fields changed
  const needsReindex = name !== undefined || description !== undefined;
  if (needsReindex) {
    indexSpace(id, userId).catch((err) =>
      console.error(`[spaces] Failed to re-index space ${id}:`, err),
    );
  }

  return reply.send(rowToSpace(row));
}

// ---------------------------------------------------------------------------
// DELETE /spaces/:id
// ---------------------------------------------------------------------------

export async function deleteSpace(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply:   FastifyReply,
) {
  const userId = await authUser(request);
  const { id } = request.params;

  const deleted = await withUserContextRaw(userId, async (client) => {
    const res = await client.query<{ id: string }>(
      `DELETE FROM spaces
        WHERE id      = $1
          AND user_id = current_user_id()::uuid
        RETURNING id`,
      [id],
    );
    return res.rows[0] ?? null;
  });

  if (!deleted) return reply.status(404).send({ error: 'Space not found' });

  // memories.space_id will go to NULL via ON DELETE SET NULL (defined in schema)
  return reply.status(204).send();
}
