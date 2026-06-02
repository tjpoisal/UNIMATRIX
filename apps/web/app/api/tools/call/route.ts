/**
 * POST /api/tools/call
 *
 * Universal tool execution endpoint for non-MCP LLMs and agents.
 *
 * Accepts a simple JSON payload and translates it into an internal
 * MCP `tools/call` invocation.
 *
 * Request body:
 *   {
 *     "toolName": "unimatrix_search_memories",
 *     "args": {
 *       "query": "authentication decisions",
 *       "limit": 5
 *     }
 *   }
 *
 * Success response (200):
 *   {
 *     "status": "success",
 *     "result": "string content returned by the tool",
 *     "toolName": "unimatrix_search_memories"
 *   }
 *
 * Error responses:
 *   400 — Malformed request (missing toolName, bad args shape, etc.)
 *   401 — Missing or invalid API key
 *   404 — Unknown tool name
 *   500 — Internal MCP / database error
 *
 * Authentication: Required — Bearer umx_... API key (same as /api/mcp)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { rateLimiters } from "@/lib/rate-limit";
import {
  callMcpTool,
  type ToolCallRequest,
  type ToolCallSuccessResponse,
} from "@/lib/mcp-client";

export const dynamic = "force-dynamic";

interface ErrorResponseBody {
  status: "error";
  error: string;
  code: string;
  toolName?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ToolCallSuccessResponse | ErrorResponseBody>> {
  let userId: string | null = null;
  let organizationId: string | null = null;

  try {
    // ─── 1. Authentication + Organization (required for tool execution) ─────
    const auth = await getAuthContext(req);

    if (!auth?.userId) {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: "Unauthorized — missing or invalid API key. Use Authorization: Bearer umx_...",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // For org-scoped tools (collab.*), require a valid organization
    if (!auth.organizationId) {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: "Forbidden — this tool requires an organization-scoped API key or active organization membership.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    userId = auth.userId;
    organizationId = auth.organizationId;

    // ─── 1b. Rate limit per API key (best effort identifier) ───────────────
    // Extract prefix for rate limiting key (avoids full key material)
    const authHeader = req.headers.get("authorization") ?? "";
    const rateKey = authHeader.startsWith("Bearer umx_") ? authHeader.slice(7, 19) : `user:${userId}`;
    const rl = await rateLimiters.apiKeyToolExecution(rateKey);
    if (!rl.success) {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: "Rate limit exceeded for tool execution. Retry later.",
          code: "RATE_LIMITED",
        },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.reset - Date.now()) / 1000).toString() } }
      );
    }

    // ─── 2. Parse and validate request body ─────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: "Invalid JSON body. Expected application/json.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: "Request body must be a JSON object.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { toolName, args } = body as Partial<ToolCallRequest>;

    if (!toolName || typeof toolName !== "string") {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: "Missing or invalid 'toolName' (must be a non-empty string).",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // args is optional in the payload; default to empty object
    const safeArgs: Record<string, unknown> =
      args && typeof args === "object" && !Array.isArray(args) ? args : {};

    // ─── 3. Execute via internal MCP client (translates to tools/call) ──────
    // The MCP layer now handles HITL + telemetry internally
    const mcpResult = await callMcpTool(toolName, safeArgs, userId, organizationId);

    // Extract the primary text content (consistent with MCP text responses)
    const primaryText =
      mcpResult?.content?.[0]?.text ??
      (typeof mcpResult === "string" ? mcpResult : JSON.stringify(mcpResult));

    const successResponse: ToolCallSuccessResponse = {
      status: "success",
      result: primaryText,
      toolName,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    const toolNameForError =
      ((req as unknown) as { _parsedBody?: { toolName?: string } })._parsedBody?.toolName ?? "unknown";

    console.error(`[/api/tools/call] Tool execution failed (${toolNameForError}):`, error);

    const message = error instanceof Error ? error.message : "Unknown internal error";

    // Detect common classes of errors
    if (message.toLowerCase().includes("unknown tool")) {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: message,
          code: "NOT_FOUND",
          toolName: toolNameForError,
        },
        { status: 404 }
      );
    }

    if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("access denied")) {
      return NextResponse.json<ErrorResponseBody>(
        {
          status: "error",
          error: message,
          code: "UNAUTHORIZED",
          toolName: toolNameForError,
        },
        { status: 401 }
      );
    }

    // Generic server error (never leak stack traces to clients)
    return NextResponse.json<ErrorResponseBody>(
      {
        status: "error",
        error: "Tool execution failed. Please check the tool name and arguments.",
        code: "INTERNAL_ERROR",
        toolName: toolNameForError,
      },
      { status: 500 }
    );
  }
}
