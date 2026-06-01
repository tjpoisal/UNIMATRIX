# Unimatrix MCP Setup Guide

Connect your AI tools to Unimatrix so they can read and write persistent memory across all your conversations, devices, and LLMs.

## What You Need

1. A Unimatrix account — [register free at unimatrix-flax.vercel.app/auth/register](https://unimatrix-flax.vercel.app/auth/register)
2. An API key — generate one at **Settings → API Keys** after signing in
3. An MCP-compatible LLM client (Claude Desktop, Cursor, Continue.dev, etc.)

---

## Claude Desktop

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Add this to your config:**

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://unimatrix-flax.vercel.app/api/mcp",
      "apiKey": "YOUR_UNIMATRIX_API_KEY"
    }
  }
}
```

**Verify it works:**

1. Restart Claude Desktop
2. Start a new conversation
3. Ask Claude: `"What do you remember from my previous conversations?"`
4. Claude will call `get_recent()` and show your stored memories

**Available MCP tools after connecting:**

| Tool | What It Does |
|------|-------------|
| `remember(content, context?)` | Store something from this conversation |
| `recall(query)` | Search all memories across all LLMs |
| `get_recent(limit?)` | Get last N memories (cross-LLM, chronological) |
| `continue_from(session_id?)` | Resume a specific prior session |
| `list_contexts()` | List all your memory workspaces |

---

## Cursor

Open your Cursor settings and add Unimatrix as an MCP server:

**Via `~/.cursor/mcp.json`:**

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://unimatrix-flax.vercel.app/api/mcp",
      "apiKey": "YOUR_UNIMATRIX_API_KEY"
    }
  }
}
```

**Via the Cursor Settings UI:**

1. Open Cursor → Settings → MCP
2. Click "Add MCP Server"
3. Name: `unimatrix`
4. URL: `https://unimatrix-flax.vercel.app/api/mcp`
5. API Key: your Unimatrix API key

**Verify:** Open any file and ask Cursor's AI: `"What were we working on last session?"` — Cursor will call `get_recent()` to pull context.

---

## Any MCP-Compatible Client (Generic)

Any client that supports the [Model Context Protocol](https://modelcontextprotocol.io) can connect to Unimatrix.

**MCP Server URL:** `https://unimatrix-flax.vercel.app/api/mcp`

**Authentication:** Pass your API key in the `Authorization` header:
```
Authorization: Bearer YOUR_UNIMATRIX_API_KEY
```

**Protocol:** Unimatrix uses the Streamable HTTP transport (stateless, per-request MCP sessions). No persistent WebSocket connection required.

**Example JSON-RPC call to list tools:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

**Example `remember` call:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "remember",
    "arguments": {
      "content": "User is building a Rust web server with Axum. Prefers async/await patterns.",
      "context": "rust-web-project"
    }
  }
}
```

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

Replace `https://unimatrix-flax.vercel.app/api/mcp` with your server's URL:

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
3. Confirm the MCP server URL is reachable: `curl https://unimatrix-flax.vercel.app/health`

### Memories not persisting across sessions

Ensure the AI is actually calling `remember()` during the conversation. You can prompt it: *"Please remember X"* or instruct it in your system prompt: *"At the end of each conversation, call unimatrix.remember() to save key context."*

### Self-hosted: `pgvector` extension missing

```sql
-- Run in your PostgreSQL instance as superuser
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Cross-LLM Continuity: How It Works

When Claude connects to Unimatrix and calls `get_recent()`, it receives the last N memories written by **any** LLM — including ChatGPT, Gemini, Groq, and your local Ollama instance. There is no LLM filter. All queries are scoped by user ID only.

This is the core mechanism for the cross-LLM handoff:

1. You finish a session with ChatGPT on your iPhone. ChatGPT calls `remember()` to store key context.
2. You open Claude on your iPad. Claude calls `get_recent()` at session start.
3. Claude sees the ChatGPT-written memories and picks up the conversation seamlessly.
4. The user never re-explains anything.

The `source` field on each memory records which LLM wrote it (e.g., `"mcp"`) but this field is informational only — it never affects what any AI can read.

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

**OpenAPI spec:** `https://unimatrix-flax.vercel.app/api/openapi.json`

---

*Questions? Email hello@deployunimatrix.com or open an issue at github.com/tjpoisal/UNIMATRIX*
