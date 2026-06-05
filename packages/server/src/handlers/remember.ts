/**
 * src/handlers/remember.ts
 *
 * MCP Tool: remember
 *
 * User-facing alias for store_memory.
 * "context" parameter maps to "hint" in the underlying storeMemoryHandler.
 *
 * This is the primary tool an LLM calls to persist something from
 * the current conversation — works identically regardless of which LLM
 * (Claude, ChatGPT, Gemini, etc.) is calling it.
 */

import { storeMemoryHandler } from './storeMemory.js';
import type { RememberInput, StoreMemoryOutput } from '../types/mcp.js';

export async function rememberHandler(
  input: RememberInput & { sourceLlm?: string },
  userId: string,
): Promise<StoreMemoryOutput & { memoryId: string }> {
  const tags = [
    ...(input.sourceLlm ? [`llm-source:${input.sourceLlm}`] : []),
    ...(input.tags || []),
  ];

  // Map "context" → "hint" and delegate to the canonical handler
  // If sourceLlm provided (e.g. from the LLM client or wrapper), it will be auto-tagged
  // so memories are organized by the specific LLM that logged into Unimatrix.
  return storeMemoryHandler(
    { content: input.content, hint: input.context, tags: tags.length ? tags : undefined },
    userId,
  );
}
