import { NextResponse } from "next/server";

export async function GET() {
  const origin =
    process.env.NEXTAUTH_URL ?? "https://unimatrix-flax.vercel.app";

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Unimatrix API",
      version: "1.0.0",
      description:
        "Universal memory palace API — store, retrieve, and share memories across any AI system.",
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
      },
    },
    paths: {
      "/palaces": {
        get: {
          operationId: "listPalaces",
          summary: "List memory palaces",
          description: "Returns all memory palaces owned by the authenticated user.",
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
          summary: "Create a memory palace",
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
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
