/**
 * src/handlers/getTimeline.ts
 *
 * MCP Tool: get_timeline
 *
 * The only tool that returns VERBATIM decrypted content.
 * Used for deep historical recall — "show me everything I said about X".
 *
 * Returns memories in reverse-chronological order with supersession chain:
 *   - active memories first, then superseded if requested
 *   - if a memory has been superseded, supersededByContent contains the
 *     decrypted content of the memory that replaced it
 *
 * Security: all queries run under RLS via withUserContextReadOnly.
 *           content is decrypted with the user's derived key.
 */

import { withUserContextReadOnly } from '../db/client.js';
import { withAudit }               from '../middleware/audit.js';
import { decryptContent }          from '../security/encryption.js';
import type { TimelineEntry, MemoryStatus, MemorySource } from '../types/domain.js';
import type { GetTimelineInput, GetTimelineOutput } from '../types/mcp.js';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const getTimelineHandler = withAudit(
  'get_timeline',
  async (
    input:  GetTimelineInput,
    userId: string,
  ): Promise<GetTimelineOutput> => {

    interface TimelineRow {
      id:            string;
      user_id:       string;
      space_id:      string | null;
      org_id:        string | null;
      content:       Buffer;
      content_iv:    Buffer;
      summary:       string | null;
      status:        string;
      superseded_by: string | null;
      superseded_at: Date   | null;
      confidence:    string | null;
      source:        string;
      hint:          string | null;
      created_at:    Date;
      indexed_at:    Date   | null;
      tags:          string[];
      // superseding memory content (encrypted) — may be null
      superseding_content: Buffer | null;
    }

    const rows = await withUserContextReadOnly(userId, async (client) => {
      const res = await client.query<TimelineRow>(
        `SELECT
           m.id,
           m.user_id,
           m.space_id,
           m.org_id,
           m.content,
           m.content_iv,
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
           sup.content AS superseding_content
         FROM memories m
         LEFT JOIN memories sup ON sup.id = m.superseded_by
        WHERE m.user_id = current_user_id()::uuid
          AND ($1::uuid IS NULL OR m.space_id = $1::uuid)
          AND ($2::text IS NULL OR m.status   = $2::memory_status)
          AND ($3::timestamptz IS NULL OR m.created_at >= $3::timestamptz)
          AND ($4::timestamptz IS NULL OR m.created_at <= $4::timestamptz)
          AND (
            $5 = true
            OR m.status = 'active'
          )
        ORDER BY m.created_at DESC
        LIMIT  $6
        OFFSET $7`,
        [
          input.spaceId          ?? null,
          input.status           ?? null,
          input.startDate        ?? null,
          input.endDate          ?? null,
          input.includeSuperseded ?? false,
          input.limit            ?? 20,
          input.offset           ?? 0,
        ],
      );
      return res.rows;
    });

    // Decrypt content for each row in parallel (bounded by row count)
    const entries: TimelineEntry[] = await Promise.all(
      rows.map(async (r): Promise<TimelineEntry> => {
        const [content, supersededByContent] = await Promise.all([
          decryptContent(r.content, userId),
          r.superseding_content
            ? decryptContent(r.superseding_content, userId).catch(() => null)
            : Promise.resolve(null),
        ]);

        return {
          id:                  r.id,
          userId:              r.user_id,
          spaceId:             r.space_id,
          orgId:               r.org_id,
          content,
          summary:             r.summary,
          status:              r.status as MemoryStatus,
          supersededBy:        r.superseded_by,
          supersededAt:        r.superseded_at,
          confidence:          r.confidence !== null ? parseFloat(r.confidence) : null,
          source:              r.source as MemorySource,
          hint:                r.hint,
          tags:                r.tags ?? [],
          createdAt:           r.created_at,
          indexedAt:           r.indexed_at,
          isSuperseded:        r.status === 'superseded',
          supersededByContent: supersededByContent,
        };
      }),
    );

    return { entries, total: entries.length };
  },
);
