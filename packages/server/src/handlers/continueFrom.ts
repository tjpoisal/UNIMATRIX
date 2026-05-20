/**
 * src/handlers/continueFrom.ts
 *
 * MCP Tool: continue_from
 *
 * Retrieve full context from a prior session (identified by spaceId/context
 * identifier), or fall back to the most recent N memories across all contexts.
 *
 * Hero use case: "I was working on X with ChatGPT — let me pick that up
 * in Claude". Claude calls continue_from({ session_id: 'project-x-space-uuid' })
 * and gets a full, ordered, verbatim history of everything stored in that context.
 *
 * When session_id is omitted: returns the most recent timeline entries across
 * all contexts (best-effort continuity when the user doesn't specify).
 */

import { getTimelineHandler } from './getTimeline.js';
import type { ContinueFromInput, GetTimelineOutput } from '../types/mcp.js';

export async function continueFromHandler(
  input: ContinueFromInput,
  userId: string,
): Promise<GetTimelineOutput> {
  return getTimelineHandler(
    {
      spaceId:            input.session_id,
      limit:              input.limit ?? 20,
      offset:             0,
      includeSuperseded:  false,   // only active memories
      // no date range — full history of this session
    },
    userId,
  );
}
