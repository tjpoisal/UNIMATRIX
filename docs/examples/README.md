# Unimatrix Integration Examples

This folder contains practical examples for using Unimatrix with LLMs and agents that do **not** support the Model Context Protocol (MCP).

## Recommended Starting Point

→ **[Quickstart for Agents (Non-MCP)](./quickstart-for-agents.md)**

This is the fastest way to get started with ChatGPT, Gemini, LangChain, custom agents, etc.

## Folder Structure

- `quickstart-for-agents.md` — **Start here** — concise guide with copy-paste examples
- `rest-api/` — Simple client libraries
  - `typescript.ts`
  - `python.py`
- `llm-tools/` — Ready-to-paste tool definitions
  - `non-mcp-tool-definitions.md`

## When to Use This

Use these resources when your LLM or framework does not support MCP natively:

- ChatGPT (Custom GPTs / Actions)
- Gemini
- Grok, Claude via API
- LangChain, LlamaIndex, CrewAI, AutoGen, etc.

For Claude Desktop, Cursor, Windsurf, Zed, and other native MCP clients, use the [MCP connection](../mcp-setup.md) instead.
