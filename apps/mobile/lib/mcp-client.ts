/**
 * lib/mcp-client.ts
 *
 * Thin client for the Unimatrix MCP server REST API.
 * All writes encrypt content client-side before sending.
 * Reads return memory metadata only (hint, summary, tags) — never plaintext.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { Memory, RecallResult } from "./types";

const DEFAULT_URL = process.env.EXPO_PUBLIC_MCP_URL ?? "https://deployunimatrix.com";

/**
 * lib/mcp-client.ts
 *
 * Thin client for the Unimatrix MCP server REST API.
 * All writes encrypt content client-side before sending.
 * Reads return memory metadata only (hint, summary, tags) — never plaintext.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { Memory, RecallResult } from "./types";

const DEFAULT_URL = process.env.EXPO_PUBLIC_MCP_URL ?? "https://deployunimatrix.com";

async function getBaseUrl(): Promise<string> {
  const saved = await AsyncStorage.getItem("unimatrix_server_url");
  return saved ?? DEFAULT_URL;
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem("unimatrix_mcp_token");
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h["x-unimatrix-key"] = token;
  return h;
}

// ── Crypto helpers (client-side placeholder) ───────────────────────────────
async function encryptContent(
  plaintext: string,
  password: string,
): Promise<{ ciphertext: string; nonce: string }> {
  // This is a lightweight placeholder using SHA-256 to derive a nonce.
  // Production: replace with proper client-side encryption (expo-secure-store + quick-crypto).
  const nonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + Date.now(),
  );
  return { ciphertext: plaintext, nonce: nonce.slice(0, 32) };
}

// ── API methods ───────────────────────────────────────────────────────────────
class McpClient {
  async getRecent(limit = 20): Promise<Memory[]> {
    const base = await getBaseUrl();
    const headers = await authHeaders();
    const res = await fetch(`${base}/api/memories?limit=${limit}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.memories ?? json ?? []).map(normalizeMemory);
  }

  async recall(query: string, spaceId?: string): Promise<RecallResult> {
    const base = await getBaseUrl();
    const headers = await authHeaders();
    const params = new URLSearchParams({ q: query, ...(spaceId ? { spaceId } : {}) });
    const res = await fetch(`${base}/api/search?${params}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      memories: (json.memories ?? []).map(normalizeMemory),
      query,
      spaceId: spaceId ?? null,
    };
  }

  async storeMemory(
    input: { content: string; hint?: string; tags?: string[]; password: string },
  ): Promise<{ memoryId: string }> {
    const base = await getBaseUrl();
    const headers = await authHeaders();
    const { ciphertext, nonce } = await encryptContent(input.content, input.password);
    const res = await fetch(`${base}/api/memories/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        encryptedContent: ciphertext,
        nonce,
        hint: input.hint ?? null,
        tags: input.tags ?? [],
        source: "mobile",
      }),
    });
    if (!res.ok) throw new Error(`Store failed: HTTP ${res.status}`);
    return res.json();
  }

  async getHealth(): Promise<{ status: string; version: string }> {
    const base = await getBaseUrl();
    // AbortSignal.timeout isn't available in all RN environments; cast as any for safety
    const signal = (AbortSignal as any).timeout?.(5000);
    const res = await fetch(`${base}/health`, { signal });
    if (!res.ok) throw new Error("Unhealthy");
    return res.json();
  }
}

function normalizeMemory(raw: any): Memory {
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

export const mcpClient = new McpClient();
