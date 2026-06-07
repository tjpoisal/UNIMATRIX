/**
 * Ollama Integration - Local LLM Support
 *
 * Captures memories from local Ollama instances
 * via webhook on model completion.
 *
 * Setup:
 * 1. User installs Ollama: https://ollama.ai
 * 2. Ollama listens on localhost:11434
 * 3. Configure Unimatrix URL: http://localhost:3000
 * 4. On each completion, Ollama POSTs to /api/integrations/ollama/webhook
 * 5. Memory encrypted + stored
 */

import { prisma } from '@/lib/prisma';
import { encryptMemory } from '@/lib/encryption';

export interface OllamaWebhookPayload {
  // Ollama API response structure
  model: string;
  created_at: string;
  response: string;
  context: number[];
  done: boolean;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaRequest {
  userId: string;
  encryptionPassword: string;
  userContext?: string;
}

/**
 * Handle webhook from Ollama after model completion
 * POST /api/integrations/ollama/webhook
 */
export async function handleOllamaWebhook(
  payload: OllamaWebhookPayload,
  request: OllamaRequest
) {
  try {
    // 1. Extract response text
    const memoryContent = payload.response.trim();

    if (!memoryContent || memoryContent.length < 10) {
      return { success: false, error: 'Response too short to save' };
    }

    // 2. Encrypt memory client-side
    // (In production, user passes encrypted payload)
    // This is simplified - actual implementation uses client-side crypto
    const encrypted = await encryptMemory(memoryContent, request.encryptionPassword);

    // 3. Determine context from model name
    const modelContext = request.userContext || extractContext(payload.model);

    // 4. Calculate importance based on response length + eval time
    const importance = calculateImportance(payload);

    // 5. Store encrypted memory
    const memory = await prisma.memory.create({
      data: {
        userId: request.userId,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        context: modelContext,
        importance,
        metadata: {
          source: 'ollama',
          model: payload.model,
          generation_time_ms: payload.eval_duration || 0,
          token_count: payload.eval_count || 0,
          timestamp: new Date(payload.created_at).toISOString(),
        },
      },
    });

    // 6. Log integration event
    await logIntegrationEvent({
      userId: request.userId,
      integration: 'ollama',
      action: 'memory_saved',
      model: payload.model,
      memoryId: memory.id,
    });

    return {
      success: true,
      memoryId: memory.id,
      context: modelContext,
      importance,
    };
  } catch (error) {
    console.error('Ollama webhook error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Extract context from Ollama model name
 * Examples:
 *   - "mistral" → "Development"
 *   - "neural-chat" → "Chat"
 *   - "llama2:7b" → "General"
 */
function extractContext(modelName: string): string {
  const contextMap: Record<string, string> = {
    mistral: 'Development',
    'neural-chat': 'Chat',
    'orca-mini': 'Learning',
    llama: 'General',
    codellama: 'Development',
    phind: 'Development',
    'zephyr': 'Chat',
  };

  for (const [key, context] of Object.entries(contextMap)) {
    if (modelName.toLowerCase().includes(key)) {
      return context;
    }
  }

  return 'Ollama';
}

/**
 * Calculate importance based on generation metrics
 */
function calculateImportance(
  payload: OllamaWebhookPayload
): 'low' | 'medium' | 'high' {
  const responseLength = payload.response.length;
  const tokenCount = payload.eval_count || 0;

  // Long, complex responses = high importance
  if (responseLength > 500 && tokenCount > 100) {
    return 'high';
  }

  // Medium responses = medium importance
  if (responseLength > 200 && tokenCount > 30) {
    return 'medium';
  }

  return 'low';
}

/**
 * Log integration event for analytics
 */
async function logIntegrationEvent(event: {
  userId: string;
  integration: string;
  action: string;
  model?: string;
  memoryId?: string;
}) {
  try {
    await prisma.integrationLog.create({
      data: {
        userId: event.userId,
        integration: event.integration,
        action: event.action,
        metadata: {
          model: event.model,
          memoryId: event.memoryId,
        },
        timestamp: new Date(),
      },
    });
  } catch (e) {
    // Don't fail if logging fails
    console.warn('Failed to log integration event:', e);
  }
}

/**
 * Configure Ollama to send webhooks to Unimatrix
 * Returns webhook configuration snippet
 */
export function generateOllamaConfig(unimatrixUrl: string): string {
  return `# Add to your Ollama integration config

[webhooks]
enabled = true
url = "${unimatrixUrl}/api/integrations/ollama/webhook"
events = ["response_complete"]
timeout = 5000

# For Docker:
# docker run -e OLLAMA_WEBHOOK="${unimatrixUrl}/api/integrations/ollama/webhook" ...
`;
}

/**
 * Get Ollama instance status/health
 */
export async function checkOllamaHealth(ollamaUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (e) {
    console.error('Ollama health check failed:', e);
    return false;
  }
}

/**
 * List available models on Ollama instance
 */
export async function listOllamaModels(ollamaUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    const data = await response.json();

    if (data.models) {
      return data.models.map((m: any) => m.name);
    }

    return [];
  } catch (e) {
    console.error('Failed to list Ollama models:', e);
    return [];
  }
}

/**
 * Test webhook connection from Ollama
 */
export async function testOllamaWebhook(
  ollamaUrl: string,
  unimatrixWebhookUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const testPayload: OllamaWebhookPayload = {
      model: 'test-model',
      created_at: new Date().toISOString(),
      response: 'This is a test response from Ollama to verify webhook connectivity.',
      context: [],
      done: true,
      eval_count: 10,
      eval_duration: 1000,
    };

    // Send test webhook to Unimatrix
    const response = await fetch(unimatrixWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      timeout: 5000,
    });

    if (response.ok) {
      return { success: true, message: 'Webhook test successful' };
    } else {
      return { success: false, message: `Webhook returned ${response.status}` };
    }
  } catch (e) {
    return { success: false, message: `Webhook test failed: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}

/**
 * Ollama integration database schema additions
 *
 * Run these migrations:
 *
 * CREATE TABLE integration_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES users(id),
 *   integration VARCHAR NOT NULL,
 *   action VARCHAR NOT NULL,
 *   metadata JSONB,
 *   timestamp TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE TABLE ollama_configs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES users(id),
 *   ollama_url VARCHAR NOT NULL,
 *   webhook_url VARCHAR NOT NULL,
 *   enabled BOOLEAN DEFAULT true,
 *   last_connected TIMESTAMP,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 */
