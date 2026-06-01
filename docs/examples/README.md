# Unimatrix Integration Examples

This folder contains practical examples for using Unimatrix with LLMs and agents that do **not** support the Model Context Protocol (MCP).

## Folder Structure

- `rest-api/` — Simple client libraries for direct REST access
  - `typescript.ts`
  - `python.py`
- `llm-tools/` — Ready-to-paste tool definitions for popular LLMs
  - `non-mcp-tool-definitions.md`

## Quick Start

1. Get an API key from the Unimatrix dashboard.
2. Use one of the clients in `rest-api/`, or copy tool definitions from `llm-tools/`.
3. For full documentation, see the [MCP Reference](../mcp-reference.md) and the live docs at https://deployunimatrix.com/docs/mcp.

## When to Use This

Use the REST API when your LLM or framework does not support MCP natively:

- ChatGPT (Custom GPTs / Actions)
- Gemini
- Most custom agents and scripts
- LangChain, LlamaIndex, CrewAI, AutoGen, etc. (unless using an MCP adapter)

For Claude Desktop, Cursor, Windsurf, etc., use the MCP connection instead (much better experience).
