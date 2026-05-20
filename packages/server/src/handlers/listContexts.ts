/**
 * src/handlers/listContexts.ts
 *
 * MCP Tool: list_contexts
 *
 * List all workspaces (Spaces / "palaces") for this user.
 * Lets an LLM understand what memory contexts are available before
 * calling recall() or continue_from().
 *
 * Returns: array of { id, name, description, createdAt }
 */

import { withUserContextReadOnly } from '../db/client.js';
import { withAudit }               from '../middleware/audit.js';
import type { Space } from '../types/domain.js';

interface SpaceRow {
  id:          string;
  user_id:     string;
  parent_id:   string | null;
  org_id:      string | null;
  name:        string;
  description: string | null;
  is_scratchpad: boolean;
  created_at:  Date;
  updated_at:  Date;
}

export interface ListContextsOutput {
  contexts: Array<{
    id:          string;
    name:        string;
    description: string | null;
    createdAt:   Date;
  }>;
  total: number;
}

export const listContextsHandler = withAudit(
  'list_contexts',
  async (
    _input: Record<string, never>,
    userId: string,
  ): Promise<ListContextsOutput> => {
    const rows = await withUserContextReadOnly(userId, async (client) => {
      const res = await client.query<SpaceRow>(
        `SELECT id, user_id, parent_id, org_id, name, description,
                is_scratchpad, created_at, updated_at
           FROM spaces
          WHERE user_id = current_user_id()::uuid
          ORDER BY created_at DESC`,
        [],
      );
      return res.rows;
    });

    return {
      contexts: rows.map(r => ({
        id:          r.id,
        name:        r.name,
        description: r.description,
        createdAt:   r.created_at,
      })),
      total: rows.length,
    };
  },
);
