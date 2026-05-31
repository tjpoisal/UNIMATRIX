/**
 * src/handlers/recall.ts
 *
 * MCP Tool: recall
 *
 * User-facing alias for search_memories.
 * Performs semantic + full-text search across ALL memories for this user,
 * regardless of which LLM wrote them (Claude, ChatGPT, Gemini, Ollama, etc.).
 *
 * This is how Claude on iPad can find what ChatGPT wrote on iPhone —
 * the query is purely by content relevance, never filtered by LLM provider.
 */

import { searchMemoriesHandler } from './searchMemories.js';
import type { RecallInput, SearchMemoriesOutput } from '../types/mcp.js';

export async function recallHandler(
  input: RecallInput,
  userId: string,
): Promise<SearchMemoriesOutput> {
  return searchMemoriesHandler(
    {
      query:   input.query,
      limit:   input.limit,
      profile: input.profile,
      // No spaceId filter — search ALL contexts for cross-LLM recall
      // No tags filter — broadest possible cross-LLM search
      // No status filter — active memories only (default)
    },
    userId,
  );
}
