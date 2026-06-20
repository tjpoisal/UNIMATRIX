/**
 * Clean, self-contained memory helpers for @unimatrix/llm
 *
 * This file intentionally avoids importing @unimatrix/db or any DualWriteStorage
 * implementations so the package builds reliably while the real storage code is
 * developed or adjusted elsewhere.
 */

import type { Message, CompletionResult } from '@unimatrix/types';
import { prisma as sharedPrisma } from "@unimatrix/db";

export interface UnimatrixMemoryConfig {
    apiUrl: string;           // e.g. https://deployunimatrix.com/api or self-hosted
    apiKey: string;           // Unimatrix API key for the user (umx_...)
    userId?: string;
    defaultPalaceId?: string;
}

/**
 * Auto-log an LLM interaction to Unimatrix via the public REST API.
 * Minimal, resilient implementation used by the llm package during build/runtime.
 */
export async function autoLogInteraction(
    provider: string,
    messages: Message[],
    result: CompletionResult,
    config: UnimatrixMemoryConfig
): Promise<{ memoryId?: string; locationId?: string; error?: string }> {
    if (!config?.apiUrl || !config?.apiKey) {
        return { error: 'Unimatrix API key and URL required for auto-logging' };
    }

    try {
        const capitalized = provider.charAt(0).toUpperCase() + provider.slice(1);
        const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
        const content = `**LLM:** ${capitalized} (${result.model})\n**Timestamp:** ${new Date().toISOString()}\n\n**User:** ${lastUser}\n\n**Assistant:** ${result.content}`;
        const tags = ['llm-history', provider.toLowerCase(), 'auto-stored', result.model];

        // Best-effort store via REST API; if the REST endpoint exists it will create the memory.
        const res = await fetch(`${config.apiUrl.replace(/\/$/, '')}/memories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                locationId: config.defaultPalaceId ?? undefined,
                content,
                tags,
                sourceLlm: provider.toLowerCase(),
            }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => 'unknown');
            return { error: `Failed to store memory: ${res.status} ${text}` };
        }

        type MemoryCreateResponse = { id?: string; locationId?: string };

        const body = await res.json().catch(() => ({} as MemoryCreateResponse));
        return {
          memoryId: (body as MemoryCreateResponse)?.id,
          locationId: (body as MemoryCreateResponse)?.locationId,
        };
    } catch (err: any) {
        return { error: err?.message ?? String(err) };
    }
}

/**
 * Wrap any completion call and fire-and-forget a log to Unimatrix.
 */
export async function withAutoLog<T extends CompletionResult>(
    fn: () => Promise<T>,
    provider: string,
    messages: Message[],
    config: UnimatrixMemoryConfig
): Promise<T> {
    const result = await fn();
    // Don't block caller — best-effort logging
    autoLogInteraction(provider, messages, result, config).catch(() => {});
    return result;
}

/**
 * Import recent history (stub). Returns a note and a seeded memory location if possible.
 */
export async function importRecentHistory(
    providerName: string,
    config: UnimatrixMemoryConfig & { limit?: number },
    options?: { recentMessages?: Message[] }
): Promise<{ imported: number; location?: string; note?: string }> {
    const limit = config.limit ?? 5;
    if (options?.recentMessages && options.recentMessages.length > 0) {
        const fakeResult: CompletionResult = {
            content: '[Imported previous context]',
            tokensUsed: 0,
            latencyMs: 0,
            cost: 0,
            model: 'imported',
            provider: providerName,
        };
        const res = await autoLogInteraction(providerName, options.recentMessages.slice(0, limit), fakeResult, config);
        return { imported: res.memoryId ? 1 : 0, location: res.locationId, note: res.error };
    }

    const note = `Background import for ${providerName} is currently a no-op; future imports can be implemented per-provider.`;
    // Try to seed a note memory
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
    return { imported: res.memoryId ? 1 : 0, location: res.locationId, note };
}

/* Basic in-memory placeholders for storage functions used by some consumers.
   These are intentionally simple so builds/passive usage succeed. Replace with
   richer logic if you need local persistence. */
const _store: Record<string, any> = {};

export async function storeMemory(data: any) {
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    _store[id] = { id, ...data, createdAt: new Date().toISOString() };
    return _store[id];
}
export async function updateMemory(id: string, data: any) {
    _store[id] = { ...( _store[id] ?? { id }), ...data, updatedAt: new Date().toISOString() };
    return _store[id];
}
export async function deleteMemory(id: string) {
    if (id in _store) { delete _store[id]; return { success: true }; }
    return { success: false };
}
export async function retrieveMemory(id: string) {
    return _store[id] ?? null;
}

/** Helper used when proxying tool calls into Unimatrix; returns normalized call body. */
export async function prepareUnimatrixToolCall(data: any) {
    // minimal normalizer: ensure tags is array, sourceLlm normalized
    return {
        ...data,
        tags: Array.isArray(data?.tags) ? data.tags : data?.tags ? [String(data.tags)] : [],
        sourceLlm: data?.sourceLlm ? String(data.sourceLlm).toLowerCase() : undefined,
    };
}