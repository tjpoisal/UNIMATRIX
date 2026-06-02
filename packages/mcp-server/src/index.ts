#!/usr/bin/env node
/**
 * Unimatrix MCP Server
 *
 * Connects any MCP-compatible AI (Claude Desktop, Claude Code, Ollama, etc.)
 * to the user's Unimatrix memory palaces — read, search, and store memories
 * across all their palaces through a single stdio interface.
 *
 * Required environment variables:
 *   UNIMATRIX_API_KEY  — API key generated from your Unimatrix dashboard (web or MCP tokens)
 *   UNIMATRIX_API_URL  — Base API URL (default: http://localhost:3000/api)
 *
 * Set UNIMATRIX_API_URL to your Fly.io (or Render/Railway) MCP service URL, e.g. https://unimatrix-mcp.fly.dev or the web's /api if using embedded. See DEPLOYMENT.md.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios, { AxiosError } from "axios";
import { z } from "zod";

// ─── Configuration ────────────────────────────────────────────────────────────

const API_KEY = process.env.UNIMATRIX_API_KEY ?? "";
const API_BASE = (
  process.env.UNIMATRIX_API_URL ?? "http://localhost:3000/api" // Update for production Render: your unimatrix-mcp or web service URL
).replace(/\/$/, "");

const CHARACTER_LIMIT = 25_000;

// ─── Shared API client ────────────────────────────────────────────────────────

async function api<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const response = await axios({
    method,
    url: `${API_BASE}${path}`,
    data: body,
    params,
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
  });
  return response.data as T;
}

function handleError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const { status, data } = error.response;
      const msg = (data as { error?: string })?.error ?? "";
      switch (status) {
        case 401: return "Error: Unauthorized — check your UNIMATRIX_API_KEY.";
        case 403: return `Error: Forbidden — ${msg || "you don't have access to this resource."}`;
        case 404: return `Error: Not found — ${msg || "check the ID is correct."}`;
        case 409: return `Error: Conflict — ${msg || "resource already exists."}`;
        case 429: return "Error: Rate limit exceeded. Please wait before retrying.";
        default:  return `Error: API returned ${status}${msg ? ` — ${msg}` : ""}.`;
      }
    }
    if (error.code === "ECONNABORTED") return "Error: Request timed out.";
    if (error.code === "ECONNREFUSED") return "Error: Could not connect to Unimatrix API. Check UNIMATRIX_API_URL.";
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}

function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  return (
    text.slice(0, CHARACTER_LIMIT) +
    `\n\n[Response truncated at ${CHARACTER_LIMIT} chars. Use filters or pagination to narrow results.]`
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Palace {
  [key: string]: unknown;
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Location {
  [key: string]: unknown;
  id: string;
  palaceId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  position: number;
  memories?: Memory[];
  children?: Location[];
}

interface Memory {
  [key: string]: unknown;
  id: string;
  locationId: string;
  content: string;
  tags: string[];
  createdAt: string;
  lastAccessed: string;
}

interface SearchResult {
  memory: Memory;
  location: Location;
  palace: Palace;
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "unimatrix-mcp-server",
  version: "1.0.0",
});

// ── Tool: list_palaces ────────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_list_palaces",
  {
    title: "List Memory Palaces",
    description: `List all memory palaces owned by the authenticated Unimatrix user.

Returns each palace's ID, name, description, visibility, and timestamps.
Use the palace ID with unimatrix_get_palace to fetch its full contents.

Returns:
  Array of palaces:
  - id (string): Palace ID, use this in other tools
  - name (string): Palace display name
  - description (string|null): Optional description
  - isPublic (boolean): Whether publicly visible
  - createdAt / updatedAt (ISO timestamps)

Examples:
  - "What memory palaces do I have?" → call with no parameters
  - "Show me all my palaces" → call with no parameters`,
    inputSchema: z.object({}).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => {
    try {
      const palaces = await api<Palace[]>("/palaces");
      if (!palaces.length) {
        return { content: [{ type: "text", text: "You have no memory palaces yet. Create one with unimatrix_create_palace." }] };
      }
      const lines = [`# Your Memory Palaces (${palaces.length})`, ""];
      for (const p of palaces) {
        lines.push(`## ${p.name}`);
        lines.push(`- **ID**: \`${p.id}\``);
        if (p.description) lines.push(`- **Description**: ${p.description}`);
        lines.push(`- **Visibility**: ${p.isPublic ? "Public" : "Private"}`);
        lines.push(`- **Created**: ${new Date(p.createdAt).toLocaleDateString()}`);
        lines.push("");
      }
      return {
        content: [{ type: "text", text: truncate(lines.join("\n")) }],
        structuredContent: { palaces },
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: get_palace ──────────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_get_palace",
  {
    title: "Get Palace with Locations and Memories",
    description: `Retrieve a memory palace by ID, including all its locations (rooms) and memories.

This is the primary tool for reading stored memories. The palace structure mirrors
the method of loci: a palace contains locations, and each location contains memories.

Args:
  - palace_id (string, required): The palace ID from unimatrix_list_palaces

Returns:
  Palace object with nested structure:
  - id, name, description, isPublic
  - locations[]: Array of locations, each containing:
    - id, name, description, position
    - memories[]: Memories at this location
      - id, content, tags, createdAt, lastAccessed
    - children[]: Nested sub-locations (recursive)

Examples:
  - "What's in my Work palace?" → get the palace ID from list_palaces first, then call this
  - "Show me all memories in palace abc123" → palace_id: "abc123"`,
    inputSchema: z.object({
      palace_id: z.string().min(1).describe("The palace ID to retrieve"),
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ palace_id }) => {
    try {
      const palace = await api<Palace & { locations: Location[] }>(`/palaces/${palace_id}`);

      const renderLocation = (loc: Location, depth = 0): string[] => {
        const indent = "  ".repeat(depth);
        const lines: string[] = [`${indent}### ${loc.name}${loc.description ? ` — ${loc.description}` : ""}`];
        if (loc.memories?.length) {
          for (const m of loc.memories) {
            lines.push(`${indent}- **Memory** (\`${m.id}\`): ${m.content}`);
            if (m.tags.length) lines.push(`${indent}  Tags: ${m.tags.join(", ")}`);
          }
        }
        if (loc.children?.length) {
          for (const child of loc.children) {
            lines.push(...renderLocation(child, depth + 1));
          }
        }
        return lines;
      };

      const lines = [
        `# ${palace.name}`,
        palace.description ? `\n> ${palace.description}` : "",
        "",
        `**ID**: \`${palace.id}\`  |  **Visibility**: ${palace.isPublic ? "Public" : "Private"}`,
        "",
      ];

      if (!palace.locations?.length) {
        lines.push("_No locations yet. Use unimatrix_create_location to add rooms._");
      } else {
        lines.push(`## Locations (${palace.locations.length})`);
        for (const loc of palace.locations) {
          lines.push(...renderLocation(loc));
          lines.push("");
        }
      }

      return {
        content: [{ type: "text", text: truncate(lines.join("\n")) }],
        structuredContent: palace,
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: search_memories ─────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_search_memories",
  {
    title: "Search Memories",
    description: `Full-text search across all of the user's memories, optionally scoped to a single palace.

This is the fastest way to find a specific memory without knowing its exact location.
Search is case-insensitive and matches against memory content and tags.

Args:
  - query (string, required): Search query (case-insensitive, partial matches work)
  - palace_id (string, optional): Restrict search to a specific palace ID
  - limit (number, optional): Max results to return, 1–50 (default: 20)

Returns:
  Array of results, each containing:
  - memory: { id, content, tags, createdAt, lastAccessed }
  - location: { id, name, palaceId }
  - palace: { id, name }

Examples:
  - "Find my memories about TypeScript" → query: "TypeScript"
  - "Search for notes on project X in the Work palace" → query: "project X", palace_id: "<id>"
  - "What do I remember about OAuth?" → query: "OAuth"`,
    inputSchema: z.object({
      query: z.string().min(1).max(500).describe("Search query"),
      palace_id: z.string().optional().describe("Restrict to a specific palace ID"),
      limit: z.number().int().min(1).max(50).default(20).describe("Max results (default: 20)"),
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ query, palace_id, limit }) => {
    try {
      const params: Record<string, string | number | boolean> = { q: query, limit };
      if (palace_id) params.palaceId = palace_id;

      const data = await api<{ results: SearchResult[]; total: number }>("/search", "GET", undefined, params);
      const { results, total } = data;

      if (!results.length) {
        return { content: [{ type: "text", text: `No memories found for "${query}".` }] };
      }

      const lines = [
        `# Search Results for "${query}"`,
        `_Found ${total} match${total !== 1 ? "es" : ""} (showing ${results.length})_`,
        "",
      ];

      for (const r of results) {
        lines.push(`## ${r.palace.name} › ${r.location.name}`);
        lines.push(`**Memory ID**: \`${r.memory.id}\``);
        lines.push(r.memory.content);
        if (r.memory.tags.length) lines.push(`**Tags**: ${r.memory.tags.join(", ")}`);
        lines.push(`_Stored: ${new Date(r.memory.createdAt).toLocaleDateString()}_`);
        lines.push("");
      }

      return {
        content: [{ type: "text", text: truncate(lines.join("\n")) }],
        structuredContent: { total, count: results.length, results },
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: store_memory ────────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_store_memory",
  {
    title: "Store a Memory",
    description: `Create and store a new memory in a specific location within a palace.

Use this to permanently save information the user wants to remember. Always confirm
with the user before storing if context is ambiguous.

Args:
  - location_id (string, required): The location ID to store the memory in
    (get location IDs from unimatrix_get_palace)
  - content (string, required): The memory text to store (supports markdown)
  - tags (array of strings, optional): Tags for categorization and search

Returns:
  - id (string): The new memory's ID
  - locationId, content, tags, createdAt, lastAccessed

Examples:
  - "Remember that OAuth uses PKCE for SPAs" → store in relevant location
  - "Save this meeting summary" → store with tags: ["meeting", "2024"]
  - "Note: deploy to staging before 5pm" → store with tags: ["todo", "deploy"]`,
    inputSchema: z.object({
      location_id: z.string().min(1).describe("Location ID to store the memory in"),
      content: z.string().min(1).max(10_000).describe("Memory content (supports markdown)"),
      tags: z.array(z.string().max(50)).max(20).default([]).describe("Optional tags for categorization"),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async ({ location_id, content, tags }) => {
    try {
      const memory = await api<Memory>("/memories", "POST", {
        locationId: location_id,
        content,
        tags,
      });
      return {
        content: [{
          type: "text",
          text: `Memory stored successfully.\n\n**ID**: \`${memory.id}\`\n**Content**: ${memory.content}\n**Tags**: ${memory.tags.join(", ") || "none"}`,
        }],
        structuredContent: memory,
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: list_memories ───────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_list_memories",
  {
    title: "List Memories in a Location",
    description: `List all memories stored at a specific location within a palace.

Use this when you need to see everything at a specific location rather than
searching across all palaces. Faster than get_palace for targeted access.

Args:
  - location_id (string, required): The location ID to list memories from
  - limit (number, optional): Max results, 1–100 (default: 50)
  - offset (number, optional): Pagination offset (default: 0)

Returns:
  Array of memories: { id, content, tags, createdAt, lastAccessed }
  Plus pagination metadata: total, count, offset, has_more

Examples:
  - "What's stored in my 'Inbox' location?" → provide that location's ID
  - "List all memories in location xyz" → location_id: "xyz"`,
    inputSchema: z.object({
      location_id: z.string().min(1).describe("Location ID to list memories from"),
      limit: z.number().int().min(1).max(100).default(50).describe("Max results (default: 50)"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset (default: 0)"),
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ location_id, limit, offset }) => {
    try {
      const data = await api<{ memories: Memory[]; total: number }>(
        "/memories",
        "GET",
        undefined,
        { locationId: location_id, limit, offset }
      );
      const { memories, total } = data;

      if (!memories.length) {
        return { content: [{ type: "text", text: "No memories found at this location." }] };
      }

      const lines = [
        `# Memories at Location (${total} total, showing ${memories.length})`,
        "",
      ];
      for (const m of memories) {
        lines.push(`## Memory \`${m.id}\``);
        lines.push(m.content);
        if (m.tags.length) lines.push(`**Tags**: ${m.tags.join(", ")}`);
        lines.push(`_Stored: ${new Date(m.createdAt).toLocaleDateString()} · Last accessed: ${new Date(m.lastAccessed).toLocaleDateString()}_`);
        lines.push("");
      }

      const hasMore = total > offset + memories.length;
      if (hasMore) {
        lines.push(`_${total - offset - memories.length} more memories — use offset: ${offset + memories.length} to see next page._`);
      }

      return {
        content: [{ type: "text", text: truncate(lines.join("\n")) }],
        structuredContent: {
          total,
          count: memories.length,
          offset,
          has_more: hasMore,
          next_offset: hasMore ? offset + memories.length : undefined,
          memories,
        },
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: create_palace ───────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_create_palace",
  {
    title: "Create a Memory Palace",
    description: `Create a new memory palace — a top-level container for organizing memories.

Think of a palace as a building. It holds locations (rooms), which hold memories.
Only create a palace when the user explicitly asks for a new one or no suitable
palace exists for the memory they want to store.

Args:
  - name (string, required): Palace display name (1–100 chars, must be unique per user)
  - description (string, optional): What this palace is for
  - is_public (boolean, optional): Whether to make it publicly visible (default: false)

Returns:
  - id (string): Use this ID to create locations within the palace
  - name, description, isPublic, createdAt

Examples:
  - "Create a palace for work notes" → name: "Work", description: "Work-related notes"
  - "Make a new palace called Research" → name: "Research"`,
    inputSchema: z.object({
      name: z.string().min(1).max(100).describe("Palace name (unique per user)"),
      description: z.string().max(500).optional().describe("Optional description"),
      is_public: z.boolean().default(false).describe("Whether publicly visible (default: false)"),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async ({ name, description, is_public }) => {
    try {
      const palace = await api<Palace>("/palaces", "POST", {
        name,
        description,
        isPublic: is_public,
      });
      return {
        content: [{
          type: "text",
          text: `Palace created: **${palace.name}** (\`${palace.id}\`)\n\nNext: create locations inside it with unimatrix_create_location.`,
        }],
        structuredContent: palace,
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: create_location ─────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_create_location",
  {
    title: "Create a Location in a Palace",
    description: `Create a location (room) inside a memory palace to hold related memories.

Locations are the rooms of a palace. They can be nested (a location can have
child locations), allowing arbitrarily deep organisation.

Args:
  - palace_id (string, required): The palace to create this location in
  - name (string, required): Location name (e.g., "Inbox", "Projects", "Meeting Notes")
  - description (string, optional): What kinds of memories belong here
  - parent_id (string, optional): Parent location ID for nested organisation
  - position (number, optional): Sort order within the parent (default: 0)

Returns:
  - id (string): Use this to store memories via unimatrix_store_memory
  - palaceId, parentId, name, description, position

Examples:
  - "Add an 'Inbox' room to my Work palace" → palace_id: "<work-id>", name: "Inbox"
  - "Create a sub-folder 'Q1 2025' inside Projects" → palace_id: "...", parent_id: "<projects-id>", name: "Q1 2025"`,
    inputSchema: z.object({
      palace_id: z.string().min(1).describe("Palace ID to create the location in"),
      name: z.string().min(1).max(100).describe("Location name"),
      description: z.string().max(500).optional().describe("What kinds of memories belong here"),
      parent_id: z.string().optional().describe("Parent location ID for nesting"),
      position: z.number().int().min(0).default(0).describe("Sort order (default: 0)"),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async ({ palace_id, name, description, parent_id, position }) => {
    try {
      const location = await api<Location>("/locations", "POST", {
        palaceId: palace_id,
        name,
        description,
        parentId: parent_id,
        position,
      });
      return {
        content: [{
          type: "text",
          text: `Location created: **${location.name}** (\`${location.id}\`) in palace \`${location.palaceId}\`\n\nNext: store memories here with unimatrix_store_memory using location_id: "${location.id}".`,
        }],
        structuredContent: location,
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ── Tool: update_memory ───────────────────────────────────────────────────────

server.registerTool(
  "unimatrix_update_memory",
  {
    title: "Update a Memory",
    description: `Update the content or tags of an existing memory.

Use this to correct, expand, or re-tag a stored memory. The memory ID comes
from a previous search or list operation.

Args:
  - memory_id (string, required): The ID of the memory to update
  - content (string, optional): New content to replace the existing content
  - tags (array of strings, optional): New tags (replaces existing tags entirely)

At least one of content or tags must be provided.

Returns: Updated memory object

Examples:
  - "Fix the typo in memory abc" → memory_id: "abc", content: "<corrected text>"
  - "Add tag 'important' to memory xyz" → memory_id: "xyz", tags: ["existing-tag", "important"]`,
    inputSchema: z.object({
      memory_id: z.string().min(1).describe("Memory ID to update"),
      content: z.string().min(1).max(10_000).optional().describe("New content (replaces existing)"),
      tags: z.array(z.string().max(50)).max(20).optional().describe("New tags (replaces existing)"),
    }).strict().refine(
      (d) => d.content !== undefined || d.tags !== undefined,
      { message: "At least one of content or tags must be provided" }
    ),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ memory_id, content, tags }) => {
    try {
      const memory = await api<Memory>(`/memories/${memory_id}`, "PATCH", { content, tags });
      return {
        content: [{
          type: "text",
          text: `Memory updated.\n\n**ID**: \`${memory.id}\`\n**Content**: ${memory.content}\n**Tags**: ${memory.tags.join(", ") || "none"}`,
        }],
        structuredContent: memory,
      };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// COLLABORATION TOOLS (Multi-Agent Rooms)
// These enable cross-LLM async communication. All operations are org-scoped via your API key.
// ──────────────────────────────────────────────────────────────────────────────

server.registerTool(
  "collab.create_room",
  {
    title: "Create Collaboration Room",
    description: "Create a shared room for multiple AI agents and humans to exchange messages asynchronously. Returns room_id for subsequent calls.",
    inputSchema: z.object({
      name: z.string().min(1).max(120).describe("Room name"),
      description: z.string().max(500).optional().describe("Optional purpose of the room"),
      is_private: z.boolean().default(true).describe("Whether the room is private to the organization"),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (args) => {
    try {
      // Prefer the universal tools/call for new domains to avoid route duplication
      const result = await api<{ room_id: string; name: string }>("/tools/call", "POST", {
        toolName: "collab.create_room",
        args,
      });
      return { content: [{ type: "text", text: JSON.stringify(result.result || result) }] };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

server.registerTool(
  "collab.list_rooms",
  {
    title: "List Collaboration Rooms",
    description: "List all collaboration rooms your organization/API key has access to.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).default(50).optional(),
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (args) => {
    try {
      const result = await api("/tools/call", "POST", { toolName: "collab.list_rooms", args });
      return { content: [{ type: "text", text: JSON.stringify((result as any).result || result) }] };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

server.registerTool(
  "collab.send_message",
  {
    title: "Send Message to Collab Room",
    description: `Send a message (from human or agent) into a shared room. Other connected LLMs and webhooks will receive it.

Use this for cross-agent handoff, debate, or logging findings that should be visible to the whole team of AIs.`,
    inputSchema: z.object({
      room_id: z.string().min(1),
      sender_id: z.string().optional(),
      sender_name: z.string().min(1).max(120),
      sender_type: z.enum(["human", "agent", "system"]),
      message: z.string().min(1).max(8000),
      metadata: z.record(z.unknown()).optional(),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (args) => {
    try {
      const result = await api("/tools/call", "POST", { toolName: "collab.send_message", args });
      return { content: [{ type: "text", text: JSON.stringify((result as any).result || result) }] };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

server.registerTool(
  "collab.get_messages",
  {
    title: "Get Messages from Room",
    description: "Fetch messages since a cursor (since_id) or the most recent N. Use for context reconstruction at the start of a new agent session.",
    inputSchema: z.object({
      room_id: z.string().min(1),
      since_id: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(50).optional(),
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (args) => {
    try {
      const result = await api("/tools/call", "POST", { toolName: "collab.get_messages", args });
      return { content: [{ type: "text", text: JSON.stringify((result as any).result || result) }] };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

server.registerTool(
  "collab.subscribe_webhook",
  {
    title: "Subscribe Webhook to Room",
    description: "Register an HTTPS endpoint to receive signed message.created events. The webhook_secret is returned only on this call.",
    inputSchema: z.object({
      room_id: z.string().min(1),
      target_url: z.string().url(),
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (args) => {
    try {
      const result = await api("/tools/call", "POST", { toolName: "collab.subscribe_webhook", args });
      return { content: [{ type: "text", text: JSON.stringify((result as any).result || result) }] };
    } catch (e) {
      return { content: [{ type: "text", text: handleError(e) }] };
    }
  }
);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!API_KEY) {
    console.error(
      "ERROR: UNIMATRIX_API_KEY is not set.\n" +
      "Generate an API key / MCP token at your Unimatrix dashboard (e.g. https://unimatrix-web.fly.dev/onboarding or /settings/mcp-tokens)\n" +
      "and set it as UNIMATRIX_API_KEY in your environment."
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Unimatrix MCP server running (API: ${API_BASE})`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
