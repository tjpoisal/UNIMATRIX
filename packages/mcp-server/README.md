# @unimatrix/mcp-server

MCP server bridge for [Unimatrix](https://deployunimatrix.com).

Gives any MCP-compatible AI client (Claude Desktop, Cursor, Windsurf, custom agents, Ollama + Open WebUI, etc.) access to persistent, hierarchical memory palaces stored in the cloud (or your self-hosted instance).

## Installation

```bash
npm install -g @unimatrix/mcp-server
```

Or run without installing globally:

```bash
npx @unimatrix/mcp-server
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unimatrix": {
      "command": "unimatrix-mcp-server",
      "env": {
        "UNIMATRIX_API_KEY": "umx_your_key_here",
        "UNIMATRIX_API_URL": "https://deployunimatrix.com/api"
      }
    }
  }
}
```

## Usage with Cursor / Windsurf / other streamable-http clients

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

## Important: Explicit Context Loading

Unimatrix does **not** do automatic background memory injection.

You must tell your LLM (via custom instructions / system prompt) to call tools at the start of every new conversation:

```
At the very start of every new conversation:
1. Call unimatrix_list_palaces
2. Call unimatrix_get_palace (or unimatrix_search_memories) on the most relevant palace(s)
3. Use the returned context to ground your answers.
```

## Environment Variables

- `UNIMATRIX_API_KEY` (required) — Generate in the Unimatrix dashboard
- `UNIMATRIX_API_URL` — Defaults to `https://deployunimatrix.com/api`

## Self-Hosting / Development

See the main [UNIMATRIX repository](https://github.com/tjpoisal/UNIMATRIX) for:

- Self-hosting the full stack (Docker + Postgres + pgvector)
- Building from source
- Contributing

## License

MIT
