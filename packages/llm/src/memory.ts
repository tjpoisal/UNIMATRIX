import { PrismaClient } from '@prisma/client';
import { Message, CompletionResult } from '@unimatrix/types';

const prisma = new PrismaClient();

/**
 * Configuration for Unimatrix memory logging.
 * Provide this to enable automatic storage of LLM interactions.
 */
export interface UnimatrixMemoryConfig {
  apiUrl: string;           // e.g. https://deployunimatrix.com/api or self-hosted
  apiKey: string;           // Unimatrix API key for the user (umx_...)
  userId?: string;          // For context / finding per-user spaces
  defaultPalaceId?: string; // Optional override
}

/**
 * Auto-logs an LLM interaction (user messages + assistant response) to Unimatrix.
 * It will try to find or create the appropriate per-LLM "History" location under "LLM Histories" palace
 * (which is auto-provisioned when you connect the provider via onboarding/settings).
 *
 * This enables automatic organization of memories based on which LLM generated the response.
 *
 * Usage:
 *   await autoLogInteraction('claude', messages, result, {
 *     apiUrl: process.env.UNIMATRIX_API_URL || 'https://deployunimatrix.com/api',
 *     apiKey: process.env.UNIMATRIX_API_KEY!,
 *     userId: 'user-123'
 *   });
 */
export async function autoLogInteraction(
  provider: string,
  messages: Message[],
  result: CompletionResult,
  config: UnimatrixMemoryConfig
): Promise<{ memoryId?: string; locationId?: string; error?: string }> {
  if (!config.apiKey || !config.apiUrl) {
    return { error: 'Unimatrix API key and URL required for auto-logging' };
  }

  const providerName = provider.toLowerCase();
  const capitalized = provider.charAt(0).toUpperCase() + provider.slice(1);
  const historyLocationName = `${capitalized} History`;

  try {
    // 1. Find the user's "LLM Histories" palace (auto-created on provider connect)
    let palaceId = config.defaultPalaceId;

    if (!palaceId && config.userId) {
      const palacesRes = await fetch(`${config.apiUrl}/palaces?userId=${config.userId}`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (palacesRes.ok) {
        const palaces = await palacesRes.json();
        const historiesPalace = (Array.isArray(palaces) ? palaces : []).find(
          (p: any) => p.name === 'LLM Histories'
        );
        if (historiesPalace) palaceId = historiesPalace.id;
      }
    }

    if (!palaceId) {
      // Fallback: try to find any palace, or let the store fail gracefully
      const res = await fetch(`${config.apiUrl}/palaces`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (res.ok) {
        const ps = await res.json();
        palaceId = (Array.isArray(ps) ? ps[0]?.id : null) || undefined;
      }
    }

    if (!palaceId) {
      return { error: 'No suitable palace found for auto-logging' };
    }

    // 2. Find or create the per-LLM history location
    let locationId: string | undefined;

    // List locations for the palace
    const locsRes = await fetch(`${config.apiUrl}/locations?palaceId=${palaceId}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });

    if (locsRes.ok) {
      const locations = await locsRes.json();
      const histLoc = (Array.isArray(locations) ? locations : []).find(
        (l: any) => l.name === historyLocationName
      );
      if (histLoc) locationId = histLoc.id;
    }

    if (!locationId) {
      // Create it (idempotent in practice)
      const createRes = await fetch(`${config.apiUrl}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          palaceId,
          name: historyLocationName,
          description: `Auto-stored conversation history from ${capitalized}. Populated automatically by Unimatrix LLM layer based on source provider.`,
        }),
      });
      if (createRes.ok) {
        const created = await prisma.location.create({
          data: { palaceId, name: 'memory-folder' }
        });
        locationId = (created as any).id;
      }
    }

    if (!locationId) {
      return { error: 'Could not find or create history location' };
    }

    // 3. Build the memory content from the interaction
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const content = `**LLM:** ${capitalized} (${result.model})\n**Timestamp:** ${new Date().toISOString()}\n\n**User:** ${lastUser}\n\n**Assistant:** ${result.content}`;

    const tags = ['llm-history', providerName, 'auto-stored', result.model];

    // 4. Store the memory
    const storeRes = await fetch(`${config.apiUrl}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        locationId,
        content,
        tags,
      }),
    });

    if (!storeRes.ok) {
      const err = await storeRes.text();
      return { error: `Failed to store memory: ${err}` };
    }

    const memory = await prisma.memory.create({
      data: { locationId, content, tags: [] }
    });
    return { memoryId: (memory as any).id, locationId };
  } catch (err: any) {
    return { error: err.message || 'Unknown error in autoLogInteraction' };
  }
}

/**
 * Helper to easily wrap any completion call with auto-logging.
 * Example:
 *   const result = await withAutoLog(
 *     () => provider.complete(messages),
 *     'claude',
 *     messages,
 *     { apiUrl: ..., apiKey: ... }
 *   );
 */
export async function withAutoLog<T extends CompletionResult>(
  fn: () => Promise<T>,
  provider: string,
  messages: Message[],
  config: UnimatrixMemoryConfig
): Promise<T> {
  const result = await fn();
  // Fire and forget the log (don't block the response)
  autoLogInteraction(provider, messages, result, config).catch(() => {});
  return result;
}

/**
 * Background / one-time import of recent history for a provider.
 * For providers/APIs that support listing past interactions (e.g. some assistant APIs),
 * this can pull and bulk-import into the per-LLM history location.
 *
 * Current support is limited (most Chat Completion APIs don't expose full server-side history easily).
 * For now, it seeds example history or can be extended per-provider.
 * Call this from onboarding/installer after connecting a provider for "import initial history".
 *
 * Supports non-MCP LLMs fully: the import seeds the history location (LLM Histories / XXX History)
 * so that even if the LLM is used via native web UI or other non-MCP clients, the organization is ready.
 * Future turns are captured either by:
 *   - the @unimatrix/llm package (withAutoLog / complete wrappers) when your host calls the LLM, or
 *   - the LLM itself calling back via REST tools + sourceLlm (use prepareUnimatrixToolCall in your agent host
 *     when turning function calls into /api/tools/call POSTs).
 */
export async function importRecentHistory(
  providerName: string,
  config: UnimatrixMemoryConfig & { limit?: number },
  options?: { recentMessages?: Message[] } // If the caller has recent context
): Promise<{ imported: number; location?: string; note?: string }> {
  const limit = config.limit || 5;
  const providerLower = providerName.toLowerCase();

  // For demo / when recentMessages provided (e.g. from current session or mobile capture)
  if (options?.recentMessages && options.recentMessages.length > 0) {
    const fakeResult: CompletionResult = {
      content: '[Imported previous context from non-MCP session]',
      tokensUsed: 0,
      latencyMs: 0,
      cost: 0,
      model: 'imported',
      provider: providerName,
    };
    const res = await autoLogInteraction(providerName, options.recentMessages.slice(0, limit), fakeResult, config);
    return { imported: 1, location: res.locationId, note: 'Seeded from provided recent messages (works for non-MCP too)' };
  }

  // Provider-specific stubs for background import.
  // These can be expanded with real API calls (e.g. list threads for OpenAI Assistants, list projects/messages for Claude if API allows, etc.).
  // Non-MCP LLMs are fully supported for *future* auto-capture via sourceLlm on /api/tools/call or via the llm package wrappers.
  let note = `Background import for ${providerName} is limited (standard chat completions keep history client-side only). History will be auto-captured on future uses via withAutoLog / direct complete() (llm package) or when the LLM calls remember/store_memory via REST /api/tools/call with sourceLlm (for non-MCP LLMs like ChatGPT web, Gemini, Grok). The per-LLM history location is already provisioned on connect. Hosts should use prepareUnimatrixToolCall (from this package) when proxying tool calls from the LLM.`;

  if (providerLower === 'openai' || providerLower === 'gpt') {
    // Example: if user is using OpenAI Assistants API, they can pass thread IDs or recent via options.
    // For now, seed a note that future assistant runs will auto-log.
    note = `For OpenAI: If using Assistants/threads, extend this to list messages from threads and bulk import. Standard completions are client-side; use the llm package with autoLog or pass sourceLlm="openai" (via prepareUnimatrixToolCall) when the LLM calls Unimatrix tools via REST /api/tools/call.`;
  } else if (providerLower === 'claude' || providerLower === 'anthropic') {
    note = `For Claude: Desktop/CLI via MCP auto-logs (using @unimatrix/mcp-server). For web/non-MCP, when clients call via /api/tools/call include sourceLlm="claude" at body root (or use prepareUnimatrixToolCall('...', 'claude') in your host). Extend import to use Claude API for projects if available.`;
  } else if (providerLower === 'gemini') {
    note = `For Gemini (non-MCP by default): Use prepareUnimatrixToolCall or include sourceLlm="gemini" at the root of /api/tools/call body for auto-tagging + auto-file into Gemini History. Background import can be extended with Gemini API list if using their conversation APIs.`;
  } else if (providerLower === 'groq') {
    note = `For Groq (non-MCP): same as above — pass sourceLlm="groq" on REST tool calls or wrap with the llm package + withAutoLog.`;
  }

  // Seed at least one "import note" memory so the location has content even without real history.
  try {
    // We can call autoLog with a synthetic message to seed the note.
    const seedMessages: Message[] = [
      { role: 'user', content: `Initial setup for ${providerName} history import.` },
      { role: 'assistant', content: `Note: ${note}` },
    ];
    const seedResult: CompletionResult = {
      content: note,
      tokensUsed: 0,
      latencyMs: 0,
      cost: 0,
      model: 'note',
      provider: providerName,
    };
    const res = await autoLogInteraction(providerName, seedMessages, seedResult, config);
    return { imported: 1, location: res.locationId, note };
  } catch {
    return { imported: 0, note };
  }
}

/**
 * Portable auto-inject helper for hosts, agents, or wrappers that build
 * payloads for the non-MCP REST surface (POST /api/tools or /api/tools/call).
 *
 * When you have initialized a provider via @unimatrix/llm (or know the source name
 * from the user's connected LLM logins), wrap tool call construction with this so that
 * any store/remember calls the LLM makes (via function calling against the dynamic
 * /api/tools schema) will carry sourceLlm at the transport root.
 *
 * This completes the "auto store + organize by LLM history" for non-MCP LLMs:
 *  - Onboarding connects the key → ensureLLMHistoryLocation creates "LLM Histories"/"Claude History" etc.
 *  - Your host calls the LLM with tools from GET /api/tools
 *  - LLM emits function call → host uses this helper (or prepareToolCall) to POST /api/tools/call with sourceLlm
 *  - Server tags + auto-files into the right history bucket (even if location_id was omitted).
 *
 * Example (in an agent loop using Gemini via the llm package + Unimatrix REST tools):
 *   const payload = prepareUnimatrixToolCall(
 *     'unimatrix_store_memory',
 *     { content: 'User prefers dark mode' },
 *     'gemini'
 *   );
 *   await fetch(`${apiUrl}/tools/call`, { method:'POST', headers:{Authorization:`Bearer ${umxKey}`}, body: JSON.stringify(payload) });
 */
export function prepareUnimatrixToolCall(
  toolName: string,
  args: Record<string, unknown>,
  sourceLlm: string
): { toolName: string; args: Record<string, unknown>; sourceLlm: string } {
  if (!toolName || !sourceLlm) {
    throw new Error("prepareUnimatrixToolCall requires toolName and sourceLlm");
  }
  return {
    toolName,
    args: { ...args },
    sourceLlm: sourceLlm.toLowerCase(),
  };
}
