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
  input: RememberInput,
  userId: string,
): Promise<StoreMemoryOutput & { memoryId: string }> {
  // Map "context" → "hint" and delegate to the canonical handler
  return storeMemoryHandler(
    { content: input.content, hint: input.context },
    userId,
  );
}
