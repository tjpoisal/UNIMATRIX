/**
 * Clean, self-contained memory helpers for @unimatrix/llm
 *
 * This file intentionally avoids importing @unimatrix/db or any DualWriteStorage
 * implementations so the package builds reliably while the real storage code is
 * developed or adjusted elsewhere.
 */

import type { Message, CompletionResult } from '@unimatrix/types';

export type UnimatrixMemoryConfig = {
  apiUrl: string;
  apiKey: string;
  userId?: string;
  defaultPalaceId?: string;
};

/** Simple in-memory store (placeholder) */
const _store: Record<string, any> = {};

/** Persist a memory (placeholder) */
export async function storeMemory(data: any) {
  const id = 'mem-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  _store[id] = { id, ...data, createdAt: new Date().toISOString() };
  return _store[id];
}

export async function updateMemory(id: string, data: any) {
  if (!_store[id]) return null;
  _store[id] = { ..._store[id], ...data, updatedAt: new Date().toISOString() };
  return _store[id];
}

export async function deleteMemory(id: string) {
  if (!_store[id]) return false;
  delete _store[id];
  return true;
}

export async function retrieveMemory(id: string) {
  return _store[id] ?? null;
}

/**
 * Auto-logs an LLM interaction to a configured Unimatrix endpoint.
 * Placeholder implementation: validates config and returns a synthetic id.
 */
export async function autoLogInteraction(
  provider: string,
  messages: Message[],
  result: CompletionResult,
  config: UnimatrixMemoryConfig
): Promise<{ memoryId?: string; locationId?: string; error?: string }> {
  if (!config?.apiUrl || !config?.apiKey) {
    return { error: 'Unimatrix apiUrl and apiKey required' };
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const content = `LLM: ${provider} (${result.model})\nUser: ${lastUser}\nAssistant: ${result.content}`;

  const mem = await storeMemory({
    provider,
    model: result.model,
    content,
    tags: ['llm-history', provider],
    source: 'llm-auto-log',
  });

  // locationId is intentionally left undefined in placeholder
  return { memoryId: mem.id, locationId: undefined };
}

/**
 * Wraps an LLM completion call and fires an async auto-log (non-blocking).
 */
export async function withAutoLog<T extends CompletionResult>(
  fn: () => Promise<T>,
  provider: string,
  messages: Message[],
  config: UnimatrixMemoryConfig
): Promise<T> {
  const result = await fn();
  // fire-and-forget
  autoLogInteraction(provider, messages, result, config).catch(() => {});
  return result;
}

/**
 * Placeholder for importing recent history for a provider.
 */
export async function importRecentHistory(
  providerName: string,
  config: UnimatrixMemoryConfig & { limit?: number },
  options?: { recentMessages?: Message[] }
): Promise<{ imported: number; location?: string; note?: string }> {
  if (options?.recentMessages?.length) {
    await storeMemory({
      provider: providerName,
      model: 'imported',
      content: 'Seeded import',
      tags: ['import'],
    });
    return { imported: 1, note: 'Seeded from provided recentMessages' };
  }
  return { imported: 0, note: 'No-op placeholder' };
}

/**
 * Prepare payloads when proxying LLM tool calls into Unimatrix REST tool endpoints.
 * Kept intentionally minimal.
 */
export async function prepareUnimatrixToolCall(data: any) {
  return data;
}