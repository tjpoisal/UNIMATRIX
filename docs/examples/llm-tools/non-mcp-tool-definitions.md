# Tool Definitions for LLMs Without MCP Support

Use these definitions when connecting LLMs that don't support the Model Context Protocol.

## 1. OpenAI / ChatGPT Compatible (Function Calling)

```json
{
  "name": "unimatrix_search_memories",
  "description": "Search the user's long-term memory across all their conversations and projects.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "What the user wants to recall or find context about"
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of memories to return",
        "default": 8
      }
    },
    "required": ["query"]
  }
}
```

```json
{
  "name": "unimatrix_store_memory",
  "description": "Save important information to the user's long-term memory so it can be recalled later.",
  "parameters": {
    "type": "object",
    "properties": {
      "content": {
        "type": "string",
        "description": "The information to remember (be specific and include context)"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Optional tags for categorization (e.g. ['project-x', 'decision', 'architecture'])"
      }
    },
    "required": ["content"]
  }
}
```

## 2. Gemini Function Calling

```json
{
  "functionDeclarations": [
    {
      "name": "unimatrix_search_memories",
      "description": "Search the user's persistent memory for relevant context.",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "query": { "type": "STRING" }
        },
        "required": ["query"]
      }
    },
    {
      "name": "unimatrix_store_memory",
      "description": "Store important context in the user's long-term memory.",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "content": { "type": "STRING" },
          "tags": { "type": "ARRAY", "items": { "type": "STRING" } }
        },
        "required": ["content"]
      }
    }
  ]
}
```

## 3. Anthropic Claude (Tool Use)

```json
{
  "name": "unimatrix_search_memories",
  "description": "Search the user's long-term memory for relevant past context.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query describing what context is needed"
      }
    },
    "required": ["query"]
  }
}
```

## 4. LangChain / LlamaIndex Tool (Python)

```python
from langchain.tools import tool
from typing import Optional, List

@tool
def unimatrix_search_memories(query: str, limit: int = 8) -> str:
    """Search the user's persistent memory for relevant context."""
    # Implementation using the REST client above
    ...

@tool
def unimatrix_store_memory(content: str, tags: Optional[List[str]] = None) -> str:
    """Save important information to long-term memory."""
    # Implementation using the REST client above
    ...
```

## Recommended System Prompt Addition

Add this to your LLM's system prompt when using the REST tools:

```
You have access to the user's long-term memory through Unimatrix.

When the user asks about previous work, decisions, or context:
- First call unimatrix_search_memories with a good query
- Use the results to inform your response

When the user shares important information they may want to remember later:
- Call unimatrix_store_memory with clear, specific content
- Use relevant tags
```

---

**Note (Recommended)**: Instead of hard-coding the tool definitions above, most agents should now dynamically discover the current tool surface at runtime:

```
GET https://deployunimatrix.com/api/tools
```

This returns the exact OpenAI function-calling shape (or `?format=mcp` for the raw definitions). The schemas will always stay in sync with the live MCP server.

See the ready-to-use clients:
- `docs/examples/rest-api/typescript.ts` → `UnimatrixToolsClient`
- `docs/examples/rest-api/python.py` → `UnimatrixToolsClient`

These clients handle both discovery (`listTools()`) and execution (`callTool()` / `searchMemories()` etc.).
