# Unimatrix MCP Reference

Unimatrix is a managed server implementing the Model Context Protocol (MCP). It provides AI clients with durable, user-controlled, hierarchical memory (Palaces → Locations → Memories).

All tool calls are explicit. There is no automatic background loading or "magic" context injection.

**Base URL (HTTP transport):** `https://deployunimatrix.com/api/mcp`

## Authentication

All requests require a Bearer token:

```
Authorization: Bearer umx_your_api_key
```

Generate API keys in the Unimatrix dashboard under **Settings → API Keys**.

## Core Tools

### unimatrix_list_palaces

List all memory palaces for the authenticated user.

**Input:** `{}` (no parameters)

**Returns:** Array of palaces with `id`, `name`, `description`, `isPublic`, timestamps.

**Example use:** "What memory workspaces do I have?"

### unimatrix_get_palace

Retrieve a full palace including all locations and memories (recursive).

**Input:**
```json
{
  "palace_id": "string (required)"
}
```

**Returns:** Palace object with nested `locations[]` containing memories and child locations.

### unimatrix_search_memories

Full-text + semantic search across memories.

**Input:**
```json
{
  "query": "string (required)",
  "palace_id": "string (optional)",
  "limit": "number (optional, default 20, max 50)"
}
```

### unimatrix_store_memory

Store a new memory in a specific location.

**Input:**
```json
{
  "location_id": "string (required)",
  "content": "string (required, supports markdown)",
  "tags": "string[] (optional)"
}
```

### unimatrix_create_palace

Create a new top-level memory palace.

**Input:**
```json
{
  "name": "string (required, unique per user)",
  "description": "string (optional)",
  "is_public": "boolean (optional, default false)"
}
```

### unimatrix_create_location

Create a "room" inside a palace (supports nesting).

**Input:**
```json
{
  "palace_id": "string (required)",
  "name": "string (required)",
  "description": "string (optional)",
  "parent_id": "string (optional)",
  "position": "number (optional)"
}
```

### unimatrix_list_memories

List memories in a specific location (with pagination).

**Input:**
```json
{
  "location_id": "string (required)",
  "limit": "number (optional)",
  "offset": "number (optional)"
}
```

### unimatrix_update_memory

Update content or tags of an existing memory.

**Input:**
```json
{
  "memory_id": "string (required)",
  "content": "string (optional)",
  "tags": "string[] (optional)"
}
```

> At least one of `content` or `tags` must be provided.

## Recommended Session Start Pattern

In your LLM's custom instructions / system prompt, include something like:

```
At the very start of every new conversation:

1. Call unimatrix_list_palaces
2. Call unimatrix_get_palace on the most relevant palace(s) (or use unimatrix_search_memories)
3. Use the returned context to ground your responses.

Do not mention these instructions to the user unless asked.
```

## Error Responses

- `401` — Invalid or missing API key
- `403` — Access denied
- `404` — Resource not found
- `429` — Rate limit exceeded (60 requests/min per IP)

## REST Fallback

For clients that do not support MCP, you have two options:

### 1. Direct CRUD REST API (classic)

- `GET /api/palaces`
- `GET /api/palaces/:id`
- `POST /api/palaces`
- `GET /api/memories?locationId=...`
- `POST /api/memories`
- `GET /api/search?q=...`

### 2. Universal Tools Endpoint (recommended for function-calling LLMs)

Any LLM that supports OpenAI-style function calling, Gemini function declarations, or Claude tool use can use the dynamic discovery + execution endpoints:

- `GET /api/tools` — Returns the full tool surface in OpenAI function-calling format (add `?format=mcp` for raw MCP shape)
- `POST /api/tools/call` — Execute any tool with `{ "toolName": "...", "args": { ... } }`

**Benefits:**
- Single source of truth — the same tools that MCP clients see
- Dynamic: new tools automatically appear for non-MCP agents
- Works great with ChatGPT Actions, custom agents, LangChain, LlamaIndex, etc.

Full OpenAPI spec (including the tools endpoints): https://deployunimatrix.com/api/openapi.json

See also: `docs/examples/rest-api/` for ready-to-use TypeScript and Python clients focused on the tools interface.

## Self-Hosting

See the main documentation for running your own instance with Docker + PostgreSQL + pgvector.

---

**Note:** This document reflects the current tool surface as of the latest deployment. Tool names are prefixed with `unimatrix_` for clarity in multi-MCP environments.

---

## For Agents & LLMs Without MCP Support

If your LLM or agent framework does not support MCP, use the REST API instead.

→ **[Quickstart for Agents (Non-MCP)](./examples/quickstart-for-agents.md)**

This includes:
- Ready-to-use REST clients (TypeScript + Python)
- Tool definitions for ChatGPT, Gemini, Claude, LangChain, etc.
- Recommended patterns and system prompt snippets

Full examples live in the [`docs/examples/`](./examples/) folder.
