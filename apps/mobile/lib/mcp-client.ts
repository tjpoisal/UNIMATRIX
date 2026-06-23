/**
 * Clean mobile MCP client implementation.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { Memory, RecallResult } from "./types";

const DEFAULT_URL = process.env.EXPO_PUBLIC_MCP_URL ?? "https://deployunimatrix.com";

function toMemory(raw: any): Memory {
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

export class McpClient {
  private async base(): Promise<string> {
    return (await AsyncStorage.getItem("unimatrix_server_url")) ?? DEFAULT_URL;
  }

  private async headers(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem("unimatrix_mcp_token");
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (token) h["x-unimatrix-key"] = token;
    return h;
  }

  async getRecent(limit = 20): Promise<Memory[]> {
    const base = await this.base();
    const headers = await this.headers();
    const res = await fetch(`${base}/api/memories?limit=${limit}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.memories ?? json ?? []).map(toMemory);
  }

  async recall(query: string, spaceId?: string): Promise<RecallResult> {
    const base = await this.base();
    const headers = await this.headers();
    const params = new URLSearchParams({ q: query, ...(spaceId ? { spaceId } : {}) });
    const res = await fetch(`${base}/api/search?${params}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { memories: (json.memories ?? []).map(toMemory), query, spaceId: spaceId ?? null };
  }

  async storeMemory(input: { content: string; hint?: string; tags?: string[]; password: string }): Promise<{ memoryId: string }> {
    const base = await this.base();
    const headers = await this.headers();
    // lightweight placeholder encryption (no-op ciphertext)
    const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input.password + Date.now());
    const ciphertext = input.content;
    const res = await fetch(`${base}/api/memories/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ encryptedContent: ciphertext, nonce: nonce.slice(0, 32), hint: input.hint ?? null, tags: input.tags ?? [], source: "mobile" }),
    });
    if (!res.ok) throw new Error(`Store failed: HTTP ${res.status}`);
    return res.json();
  }

  async getHealth(): Promise<{ status: string; version: string }> {
    const base = await this.base();
    const signal = (AbortSignal as any).timeout?.(5000);
    const res = await fetch(`${base}/health`, { signal });
    if (!res.ok) throw new Error("Unhealthy");
    return res.json();
  }
}

export const mcpClient = new McpClient();
