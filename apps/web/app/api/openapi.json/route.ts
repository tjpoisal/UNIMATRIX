import { NextResponse } from "next/server";

export async function GET() {
  const origin =
    process.env.NEXTAUTH_URL ?? "https://deployunimatrix.com";

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Unimatrix API",
      version: "1.0.0",
      description:
        "Universal AI memory layer API — store and retrieve context across all LLMs and devices.",
    },
    servers: [{ url: `${origin}/api` }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key generated from your Unimatrix dashboard.",
        },
      },
      schemas: {
        Palace: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            isPublic: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Location: {
          type: "object",
          properties: {
            id: { type: "string" },
            palaceId: { type: "string" },
            parentId: { type: "string", nullable: true },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            position: { type: "integer" },
          },
        },
        Memory: {
          type: "object",
          properties: {
            id: { type: "string" },
            locationId: { type: "string" },
            content: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            lastAccessed: { type: "string", format: "date-time" },
          },
        },
        SearchResult: {
          type: "object",
          properties: {
            memory: { $ref: "#/components/schemas/Memory" },
            location: { $ref: "#/components/schemas/Location" },
            palace: { $ref: "#/components/schemas/Palace" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        // ── Tools / Function Calling (MCP REST Fallback) ─────────────────────
        OpenAITool: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["function"] },
            function: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                parameters: {
                  type: "object",
                  description: "JSON Schema for the tool parameters (OpenAI function calling format)",
                },
              },
              required: ["name", "parameters"],
            },
          },
          required: ["type", "function"],
        },
        ToolCallRequest: {
          type: "object",
          required: ["toolName"],
          properties: {
            toolName: {
              type: "string",
              description: "Exact name of the tool from /api/tools (e.g. unimatrix_search_memories)",
            },
            args: {
              type: "object",
              description: "Arguments matching the tool's parameters schema",
              additionalProperties: true,
            },
          },
        },
        ToolCallSuccessResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["success"] },
            result: {
              type: "string",
              description: "Textual result returned by the tool (same shape as MCP text content)",
            },
            toolName: { type: "string" },
          },
          required: ["status", "result", "toolName"],
        },
        ToolCallErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["error"] },
            error: { type: "string" },
            code: {
              type: "string",
              enum: ["UNAUTHORIZED", "NOT_FOUND", "VALIDATION_ERROR", "INTERNAL_ERROR"],
            },
            toolName: { type: "string" },
          },
          required: ["status", "error", "code"],
        },
      },
    },
    paths: {
      "/palaces": {
        get: {
          operationId: "listPalaces",
          summary: "List memory workspaces",
          description: "Returns all memory workspaces owned by the authenticated user.",
          responses: {
            "200": {
              description: "List of palaces",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Palace" },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          operationId: "createPalace",
          summary: "Create a memory workspace",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    isPublic: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Palace created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Palace" },
                },
              },
            },
            "400": { description: "Invalid input" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/palaces/{palaceId}": {
        get: {
          operationId: "getPalace",
          summary: "Get a palace with its locations and memories",
          parameters: [
            { name: "palaceId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Palace detail",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Palace" },
                },
              },
            },
            "404": { description: "Not found" },
          },
        },
        patch: {
          operationId: "updatePalace",
          summary: "Update a palace",
          parameters: [
            { name: "palaceId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    isPublic: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Updated palace" },
            "404": { description: "Not found" },
          },
        },
        delete: {
          operationId: "deletePalace",
          summary: "Delete a palace",
          parameters: [
            { name: "palaceId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Deleted" },
            "404": { description: "Not found" },
          },
        },
      },
      "/memories": {
        get: {
          operationId: "listMemories",
          summary: "List memories",
          parameters: [
            { name: "locationId", in: "query", schema: { type: "string" } },
            { name: "palaceId", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "List of memories",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Memory" },
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: "createMemory",
          summary: "Store a new memory",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["locationId", "content"],
                  properties: {
                    locationId: { type: "string" },
                    content: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Memory created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Memory" },
                },
              },
            },
          },
        },
      },
      "/search": {
        get: {
          operationId: "searchMemories",
          summary: "Full-text search across memories",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Search query",
            },
            {
              name: "palaceId",
              in: "query",
              schema: { type: "string" },
              description: "Scope to a specific palace",
            },
          ],
          responses: {
            "200": {
              description: "Search results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      results: {
                        type: "array",
                        items: { $ref: "#/components/schemas/SearchResult" },
                      },
                      total: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/locations": {
        post: {
          operationId: "createLocation",
          summary: "Create a location (room) inside a palace",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["palaceId", "name"],
                  properties: {
                    palaceId: { type: "string" },
                    parentId: { type: "string", nullable: true },
                    name: { type: "string" },
                    description: { type: "string" },
                    position: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Location created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Location" },
                },
              },
            },
          },
        },
      },
      // ── Universal MCP REST Fallback (for non-MCP LLMs with function calling) ─
      "/tools": {
        get: {
          operationId: "listTools",
          summary: "Discover available Unimatrix tools",
          description: "Returns all memory/context tools in OpenAI function calling format by default. Add ?format=mcp to receive the raw MCP tool definitions instead. This endpoint is public (no auth required) because tool schemas are not sensitive.",
          parameters: [
            {
              name: "format",
              in: "query",
              schema: { type: "string", enum: ["openai", "mcp"], default: "openai" },
              description: "Response shape: 'openai' (default, for function calling) or 'mcp' (raw tool definitions)",
            },
          ],
          responses: {
            "200": {
              description: "List of tools",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/OpenAITool" },
                  },
                },
              },
            },
            "500": { description: "Failed to load tools from MCP backend" },
          },
        },
      },
      "/tools/call": {
        post: {
          operationId: "callTool",
          summary: "Execute a Unimatrix tool (MCP REST fallback)",
          description: "Translates a simple {toolName, args} payload into an internal MCP tools/call invocation. Use the exact tool names returned by GET /api/tools. Requires a valid Unimatrix API key.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ToolCallRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Tool executed successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ToolCallSuccessResponse" },
                },
              },
            },
            "400": {
              description: "Bad request (missing toolName or malformed args)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ToolCallErrorResponse" },
                },
              },
            },
            "401": {
              description: "Unauthorized (invalid or missing API key)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ToolCallErrorResponse" },
                },
              },
            },
            "404": {
              description: "Unknown tool",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ToolCallErrorResponse" },
                },
              },
            },
            "500": {
              description: "Internal tool execution error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ToolCallErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
