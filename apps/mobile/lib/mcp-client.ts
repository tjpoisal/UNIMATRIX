/**
 * Clean mobile MCP client implementation.
 */
import type { Memory, RecallResult } from "./types";

const _DEFAULT_URL = process.env.EXPO_PUBLIC_MCP_URL ?? "https://deployunimatrix.com";

function _toMemory(raw: any): Memory {
  return {
    id: raw.id ?? "",
    hint: raw.hint ?? null,
    summary: raw.summary ?? null,
    source: raw.source ?? raw.llm ?? "mcp",
    status: raw.status ?? "active",
    importance: raw.importance ?? null,
    semanticCat: raw.semantic_cat ?? raw.semanticCat ?? null,
    spaceId: raw.space_id ?? raw.spaceId ?? null,
    tags: raw.tags ?? [],
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    indexedAt: raw.indexed_at ?? raw.indexedAt ?? null,
  };
}

// Minimal MCP client for the mobile app (used by dashboard)
export type HealthResponse = { status: string; version?: string };
export type Memory = { id: string; content: string; createdAt?: string; [key: string]: any };

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const MCP_BASE = `${API_BASE}/mcp`;

async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    if (!res.ok) return fallback;
    const data = await res.json();
    return data as T;
  } catch {
    return fallback;
  }
}

async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${MCP_BASE}/health`);
    return await safeJson<HealthResponse>(res, { status: 'offline', version: '' });
  } catch {
    return { status: 'offline', version: '' };
  }
}

async function getRecent(limit = 10): Promise<Memory[]> {
  try {
    const res = await fetch(`${MCP_BASE}/recent?limit=${encodeURIComponent(String(limit))}`);
    return await safeJson<Memory[]>(res, []);
  } catch {
    return [];
  }
}

async function recall(query: string, limit = 8, spaceId?: string): Promise<RecallResult> {
  try {
    const params = new URLSearchParams({
      query,
      limit: String(limit),
    });
    if (spaceId) params.append('spaceId', spaceId);
    
    const res = await fetch(`${MCP_BASE}/recall?${params}`);
    return await safeJson<RecallResult>(res, { memories: [], query, spaceId: null });
  } catch {
    return { memories: [], query, spaceId: null };
  }
}

async function listContexts(): Promise<Array<{ id: string; name: string; description: string | null; createdAt: string }>> {
  try {
    const res = await fetch(`${MCP_BASE}/contexts`);
    return await safeJson<Array<{ id: string; name: string; description: string | null; createdAt: string }>>(res, []);
  } catch {
    return [];
  }
}

export const mcpClient = {
  getHealth,
  getRecent,
  recall,
  listContexts,
};
