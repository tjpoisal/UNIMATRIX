/**
 * GET /api/tools
 *
 * Universal tool discovery endpoint for non-MCP LLMs and agents.
 *
 * Returns the complete list of Unimatrix memory tools in the standard
 * OpenAI function-calling / tool-use format:
 *
 *   [
 *     {
 *       "type": "function",
 *       "function": {
 *         "name": "unimatrix_search_memories",
 *         "description": "...",
 *         "parameters": { ...JSON Schema... }
 *       }
 *     },
 *     ...
 *   ]
 *
 * This allows any LLM that supports OpenAI-style function calling
 * (GPT-4, Gemini, Grok, Llama-3 via Ollama, etc.) to dynamically
 * discover and use Unimatrix without hard-coded tool definitions.
 *
 * Authentication: Optional (tool schemas are not user-specific).
 * For authenticated discovery you may still send a Bearer token.
 */

import { NextRequest, NextResponse } from "next/server";
import { toOpenAITools } from "@/lib/tools/registry";
import { listMcpTools, type McpTool } from "@/lib/mcp-client";

export const dynamic = "force-dynamic";

type ToolFormat = "openai" | "mcp";

export async function GET(
  req: NextRequest
): Promise<NextResponse<OpenAITool[] | McpTool[] | { error: string }>> {
  try {
    const { searchParams } = req.nextUrl;
    const format = (searchParams.get("format") || "openai").toLowerCase() as ToolFormat;

    if (format === "mcp") {
      // Raw MCP shape (useful for some agent frameworks or debugging)
      const tools = await listMcpTools();
      return NextResponse.json(tools, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
          "X-Tool-Format": "mcp",
        },
      });
    }

    // Default: OpenAI function calling / tool use format (powered by central registry)
    const tools = toOpenAITools();
    return NextResponse.json(tools, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Tool-Format": "openai",
      },
    });
  } catch (error) {
    console.error("[/api/tools] Discovery error:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve tool definitions from MCP backend",
      },
      { status: 500 }
    );
  }
}

