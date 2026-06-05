/**
 * Unimatrix Internal MCP Client (Translation Layer)
 *
 * Provides a typed, in-process adapter over the MCP tool surface defined in
 * the canonical /api/mcp implementation.
 *
 * This client is the bridge that allows:
 *   - GET  /api/tools       → dynamic OpenAI-style function calling discovery
 *   - POST /api/tools/call  → execution for non-MCP LLMs (ChatGPT, Gemini, etc.)
 *
 * It does NOT perform real network JSON-RPC calls in this environment.
 * Instead it directly invokes the exported handlers from the MCP route for
 * maximum performance and to avoid self-http issues in serverless.
 *
 * For true remote MCP clients (e.g. the stdio package), see packages/mcp-server.
 */

import { getAllTools, executeTool } from "@/lib/tools/registry";
import type { ToolExecutionContext } from "@/lib/tools/registry";

// ─────────────────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────────────────

/** Raw MCP tool definition (what tools/list returns) */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/** OpenAI / ChatGPT / function-calling compatible tool definition */
export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: {
      type: "object";
      properties?: Record<string, unknown>;
      required?: string[];
      [key: string]: unknown;
    };
  };
}

/** Payload accepted by the REST execution endpoint */
export interface ToolCallRequest {
  toolName: string;
  args: Record<string, unknown>;
  /** Optional: for non-MCP LLMs, specify the LLM source (e.g. "gemini", "chatgpt") so memories are auto-tagged/organized by LLM. */
  sourceLlm?: string;
}

/** Standardized success response from /api/tools/call */
export interface ToolCallSuccessResponse {
  status: "success";
  result: string | Record<string, unknown>;
  toolName: string;
}

/** Standardized error response from /api/tools/call */
export interface ToolCallErrorResponse {
  status: "error";
  error: string;
  code?: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR";
  toolName?: string;
}

export type ToolCallResponse = ToolCallSuccessResponse | ToolCallErrorResponse;

// ─────────────────────────────────────────────────────────────────────────────
// MCP Client Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the list of available tools in native MCP format.
 * In a real multi-process setup this would perform a JSON-RPC "tools/list" call.
 */
export async function listMcpTools(): Promise<McpTool[]> {
  // Now powered by the central Tool Registry
  return getAllTools() as McpTool[];
}

/**
 * Executes an MCP tool by name.
 * Mirrors the behavior of a `tools/call` JSON-RPC request.
 *
 * @param name - Exact tool name (e.g. "unimatrix_search_memories")
 * @param args - Tool-specific arguments object
 * @param userId - Authenticated user (required for all memory operations)
 */
export async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  organizationId: string | null = null
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  if (!name) {
    throw new Error("Tool name is required");
  }
  if (!userId) {
    throw new Error("User context is required to call MCP tools");
  }

  const context: ToolExecutionContext = { userId, organizationId };

  // New registry-based execution (supports collab tools + legacy)
  return executeTool(name, args ?? {}, context);
}

/**
 * Helper for non-MCP LLMs / agents using the REST /api/tools/call.
 * Prepares the payload and auto-injects sourceLlm if provided.
 * Use this instead of raw JSON to ensure correct tagging for per-LLM auto-organization.
 *
 * Prefer the portable version from @unimatrix/llm when building host/agent code:
 *   import { prepareUnimatrixToolCall } from '@unimatrix/llm';
 *
 * Example:
 *   const payload = prepareToolCall('unimatrix_store_memory', { content: '...' }, 'gemini');
 *   await fetch('/api/tools/call', { method: 'POST', headers: { Authorization: 'Bearer YOUR_UMX_KEY' }, body: JSON.stringify(payload) });
 */
export function prepareToolCall(
  toolName: string,
  args: Record<string, unknown>,
  sourceLlm?: string,
): ToolCallRequest & { sourceLlm?: string } {
  const payload: ToolCallRequest & { sourceLlm?: string } = {
    toolName,
    args,
  };
  if (sourceLlm) {
    payload.sourceLlm = sourceLlm;
  }
  return payload;
}

/**
 * Maps an MCP tool definition into the standard OpenAI function-calling format.
 * This is the key translation that makes the REST fallback "universal".
 */
export function mapMcpToolToOpenAI(tool: McpTool): OpenAITool {
  const { name, description, inputSchema } = tool;

  // OpenAI expects the JSON Schema under `parameters`.
  // MCP uses `inputSchema`. We copy it (they are structurally identical).
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: inputSchema as OpenAITool["function"]["parameters"],
    },
  };
}

/**
 * High-level helper: returns all tools already mapped to OpenAI format.
 * Used directly by GET /api/tools.
 */
export async function listToolsAsOpenAI(): Promise<OpenAITool[]> {
  const mcpTools = await listMcpTools();
  return mcpTools.map(mapMcpToolToOpenAI);
}
