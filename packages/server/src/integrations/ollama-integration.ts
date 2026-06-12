/**
 * src/integrations/ollama-integration.ts
 *
 * Captures memories from local Ollama instances via webhook on model completion.
 *
 * Flow:
 *  1. User installs Ollama: https://ollama.ai
 *  2. Configure Unimatrix MCP server URL as the webhook endpoint
 *  3. On each Ollama completion, Ollama POSTs to /api/integrations/ollama/webhook
 *  4. Memory is sanitized, encrypted, and stored
 *
 * Registration:
 *   POST /api/integrations/ollama/register  { userId, mcpToken, ollamaUrl? }
 *   → returns webhook URL + config snippet
 */

import { prisma, withUserContextRaw }  from '../db/client.js';
import { encryptContent }              from '../security/encryption.js';
import { checkForInjection, sanitizeForIndexing } from '../security/sanitize.js';
import { validateMcpToken }            from '../auth/mcpToken.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OllamaWebhookPayload {
  model:              string;
  created_at:         string;
  response:           string;
  context?:           number[];
  done:               boolean;
  load_duration?:     number;
  prompt_eval_count?: number;
  eval_count?:        number;
  eval_duration?:     number;
}

export interface OllamaWebhookRequest {
  /** Raw MCP token (umx_... format) — identifies + authenticates the user */
  mcpToken:     string;
  /** Optional hint for the memory (e.g. model context) */
  hint?:        string;
}

// ---------------------------------------------------------------------------
// Webhook handler (called by MCP server route)
// ---------------------------------------------------------------------------

export async function handleOllamaWebhook(
  payload: OllamaWebhookPayload,
  request: OllamaWebhookRequest,
): Promise<{ success: boolean; memoryId?: string; error?: string }> {
  // 1. Auth
  const auth = await validateMcpToken(request.mcpToken);
  if (!auth) {
    return { success: false, error: 'Invalid or expired MCP token' };
  }
  const { userId } = auth;

  // 2. Validate payload
  const content = payload.response?.trim();
  if (!content || content.length < 10) {
    return { success: false, error: 'Response too short to save' };
  }

  // 3. Injection check
  const injectionCheck = checkForInjection(content);
  if (!injectionCheck.safe) {
    return { success: false, error: 'Content rejected: potential prompt injection' };
  }

  // 4. Sanitize + encrypt
  const { redacted: sanitizedContent } = sanitizeForIndexing(content);
  const { ciphertext, iv } = await encryptContent(content, userId);

  // 5. Store encrypted memory
  try {
    const memory = await prisma.memory.create({
      data: {
        userId,
        content:   ciphertext as any,
        contentIv: iv as any,
        source:    'api',
        hint:      request.hint ?? extractModelContext(payload.model),
        status:    'active',
        spaceId:   null, // Librarian will classify
      },
      select: { id: true },
    });

    // Tag with Ollama source + model name
    const modelTag = `ollama:${payload.model.replace(/:/g, '-').slice(0, 40)}`;
    await withUserContextRaw(userId, async (client) => {
      await client.query(
        `INSERT INTO memory_tags (memory_id, user_id, tag)
         VALUES ($1, $2, 'source:ollama'), ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [memory.id, userId, modelTag],
      );
    }).catch((e) => console.warn('[Ollama] tag insert failed:', e));

    // Enqueue Librarian
    await prisma.agentRun.create({
      data: {
        userId,
        task:      'librarian',
        status:    'pending',
        result:    { job: { memoryId: memory.id, userId, content: sanitizedContent, hint: null, createdAt: new Date() } } as any,
        memoryIds: [memory.id],
      },
    }).catch((e) => console.warn('[Ollama] AgentRun enqueue failed:', e));

    return { success: true, memoryId: memory.id };
  } catch (err) {
    console.error('[Ollama] webhook storage error:', err);
    return { success: false, error: 'Storage failed' };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractModelContext(modelName: string): string {
  const contextMap: Record<string, string> = {
    mistral:      'Development',
    'neural-chat': 'Chat',
    'orca-mini':  'Learning',
    llama:        'General',
    codellama:    'Development',
    phind:        'Development',
    zephyr:       'Chat',
    dolphin:      'General',
  };
  for (const [key, ctx] of Object.entries(contextMap)) {
    if (modelName.toLowerCase().includes(key)) return ctx;
  }
  return 'Ollama';
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function checkOllamaHealth(ollamaUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(ollamaUrl: string): Promise<string[]> {
  try {
    const res  = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return (data.models ?? []).map((m: any) => m.name as string);
  } catch {
    return [];
  }
}

export function generateOllamaConfig(webhookUrl: string): string {
  return `# Unimatrix Ollama Integration
# Add to your environment or Docker run command:

OLLAMA_WEBHOOK="${webhookUrl}"

# Test with:
# curl -X POST ${webhookUrl} \\
#   -H "Content-Type: application/json" \\
#   -d '{"mcpToken":"umx_<your_token>","response":"Test memory from Ollama"}'
`;
}
