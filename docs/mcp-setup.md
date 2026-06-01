# Unimatrix MCP Setup Guide

Unimatrix is a cloud-hosted MCP server that gives your AI tools (Claude Desktop, Cursor, Windsurf, etc.) access to persistent, structured memory across sessions and models.

**Important:** MCP is a developer protocol. It works with desktop clients and IDEs that support it. It does **not** work with consumer apps like ChatGPT or Gemini on mobile.

## What You Need

1. A Unimatrix account — [sign up at deployunimatrix.com](https://deployunimatrix.com/auth/register)
2. An API key — generate one in **Settings → API Keys** after logging in
3. An MCP-compatible client (Claude Desktop, Cursor, Windsurf, Zed, Continue, etc.)

---

## Claude Desktop

Claude Desktop requires a **local stdio process**. You cannot point it directly at a remote URL.

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Correct configuration:**

```json
{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["-y", "@unimatrix/mcp-server@latest"],
      "env": {
        "UNIMATRIX_API_KEY": "umx_your_key_here",
        "UNIMATRIX_API_URL": "https://deployunimatrix.com/api"
      }
    }
  }
}
```

**How it actually works:**
- The `@unimatrix/mcp-server` package runs locally as a bridge.
- It securely forwards requests to your Unimatrix account using your API key.
- No data is stored on your machine.

**Important: LLMs do not automatically load memory.**  
After connecting, add this to your Claude custom instructions / system prompt:

> At the start of every new conversation, call `unimatrix_list_palaces`, then use `unimatrix_search_memories` or `unimatrix_get_palace` to load relevant context before responding.

**Available tools (actual names):**

| Tool                        | Purpose                                      |
|----------------------------|----------------------------------------------|
| `unimatrix_list_palaces`   | List your memory workspaces                  |
| `unimatrix_get_palace`     | Load a full palace with locations + memories |
| `unimatrix_search_memories`| Semantic + full-text search                  |
| `unimatrix_store_memory`   | Save new context (requires location_id)      |
| `unimatrix_create_palace`  | Create a new top-level workspace             |
| `unimatrix_create_location`| Create a "room" inside a palace              |

See the tool descriptions inside Claude for full schemas and examples.

---

## Cursor, Windsurf, and Other IDEs

Many modern IDEs support the streamable HTTP transport directly.

**Recommended config** (e.g. `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "unimatrix": {
      "type": "streamable-http",
      "url": "https://deployunimatrix.com/api/mcp",
      "headers": {
        "Authorization": "Bearer umx_your_key_here"
      }
    }
  }
}
```

Some clients also accept this simpler form:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://deployunimatrix.com/api/mcp",
      "headers": { "Authorization": "Bearer umx_..." }
    }
  }
}
```

**Again:** You must add explicit instructions in the IDE's AI settings telling it to load context at the start of sessions using the tools above. There is no automatic background polling.

---

## Any MCP-Compatible Client (Generic HTTP)

Clients that support the streamable HTTP transport can connect directly:

**Endpoint:** `https://deployunimatrix.com/api/mcp`

**Authentication:** `Authorization: Bearer umx_your_key`

Unimatrix implements the MCP protocol over HTTP (JSON-RPC 2.0). Use the standard `tools/list` and `tools/call` methods.

**Current tool names all start with the `unimatrix_` prefix** (e.g. `unimatrix_store_memory`, `unimatrix_search_memories`). Check the descriptions returned by `tools/list` for exact schemas.

---

## Self-Hosted Setup

Run Unimatrix on your own hardware for complete data sovereignty.

### Prerequisites

- Docker and Docker Compose
- A PostgreSQL 15+ database with the `pgvector` extension
- A Voyage AI API key (for embeddings) — free tier available at [voyageai.com](https://www.voyageai.com)
- A Clerk account (for auth) — free tier at [clerk.com](https://clerk.com)

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/tjpoisal/UNIMATRIX.git
cd UNIMATRIX

# 2. Copy environment file
cp packages/server/.env.example packages/server/.env

# 3. Edit .env with your values
# Required:
#   DATABASE_URL=postgresql://user:pass@localhost:5432/unimatrix
#   CLERK_SECRET_KEY=sk_live_...
#   VOYAGE_API_KEY=pa-...
```

**Run with Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  unimatrix:
    image: ghcr.io/tjpoisal/unimatrix-server:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      VOYAGE_API_KEY: ${VOYAGE_API_KEY}
    restart: unless-stopped
```

```bash
docker compose up -d
```

### Point Your LLM Client at Your Server

Replace `https://deployunimatrix.com/api/mcp` with your server's URL:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "http://YOUR_SERVER_IP:3000/mcp",
      "apiKey": "YOUR_UNIMATRIX_API_KEY"
    }
  }
}
```

### Database Setup

Run the migrations against your PostgreSQL instance:

```bash
# From the repo root
cd packages/server
npm run migrate
```

The migrations create:
- `users` — Clerk-linked user accounts
- `spaces` — memory workspaces (formerly "palaces")
- `memories` — encrypted, vector-indexed memory entries
- `memory_tags` — tag associations
- `mcp_audit_log` — security audit log

### Health Check

```bash
curl http://YOUR_SERVER:3000/health
# → {"status":"ok","version":"0.1.0"}
```

---

## Troubleshooting

### "Missing Authorization header" error

Your API key is not being passed correctly. Ensure:
- The key starts with `um_` (Unimatrix API keys)
- The `apiKey` field in your MCP config matches exactly what you copied from the dashboard
- There are no trailing spaces in the key

### Tools not appearing in Claude

1. Check that `claude_desktop_config.json` is valid JSON (no trailing commas)
2. Fully quit and relaunch Claude Desktop (not just close the window)
3. Confirm the MCP server URL is reachable: `curl https://deployunimatrix.com/health`

### Memories not persisting across sessions

Ensure the AI is actually calling `remember()` during the conversation. You can prompt it: *"Please remember X"* or instruct it in your system prompt: *"At the end of each conversation, call unimatrix.remember() to save key context."*

### Self-hosted: `pgvector` extension missing

```sql
-- Run in your PostgreSQL instance as superuser
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## How Cross-Model Continuity Actually Works

Unimatrix stores memories in a user-scoped, hierarchical structure (Palaces → Locations → Memories). Any connected MCP client can read and write to the same data.

**There is no automatic magic.** Each client only sees what it explicitly asks for via tool calls.

To get the "continue where I left off" experience:

1. When using one client, explicitly ask it (or instruct it via system prompt) to call `unimatrix_store_memory` for important context.
2. When starting in a different client, your custom instructions must tell it to call `unimatrix_list_palaces` + search/get tools at the beginning of the session.

The memories themselves are not filtered by which LLM wrote them. This is by design.

---

## API Reference (REST)

For LLMs that do not support MCP (e.g., ChatGPT Actions, Gemini function calling), use the REST API directly:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/palaces` | GET | List memory workspaces |
| `/api/memories` | GET | Get memories (supports `?q=search`) |
| `/api/memories` | POST | Store a new memory |
| `/api/search?q=...` | GET | Full-text + semantic search |
| `/api/sync` | POST | Batch sync from a client |
| `/api/export` | GET | Export all memories as JSON |

**Authentication:** `Authorization: Bearer YOUR_API_KEY`

**OpenAPI spec:** `https://deployunimatrix.com/api/openapi.json`

---

*Questions? Email hello@deployunimatrix.com or open an issue at github.com/tjpoisal/UNIMATRIX*
