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
  "description": "Store a new memory in a specific location (or auto-resolve per-LLM history loc).\n\nCRITICAL — NON-MCP LLMs (Gemini, ChatGPT, Grok, custom agents, any LLM using POST /api/tools or POST /api/tools/call REST surface instead of native MCP):\n- Pass sourceLlm at the TOP LEVEL of your /api/tools/call request body (sibling to \"toolName\" and \"args\"), e.g. { \"toolName\": \"unimatrix_store_memory\", \"args\": { \"content\": \"...\" }, \"sourceLlm\": \"gemini\" }\n- Do NOT put sourceLlm inside args.\n- This auto-tags the memory with 'llm-source:gemini' and (when location_id omitted) auto-files it into the 'Gemini History' location under your 'LLM Histories' palace.\n- The palace + per-LLM locations are auto-provisioned the moment you connect the provider key in Unimatrix onboarding/web settings.\n\nCopy-paste this as a system instruction to your LLM:\n'You are Gemini (or the current model). Unimatrix provides long-term memory via tools. For ANY call you make to unimatrix_store_memory (or remember) using the REST endpoint POST /api/tools/call, you MUST include at the ROOT of the JSON body (NOT inside the args object): \"sourceLlm\": \"gemini\". Example payload: {\"toolName\":\"unimatrix_store_memory\",\"args\":{\"content\":\"key fact here\"},\"sourceLlm\":\"gemini\"}. This ensures every conversation turn with me is automatically organized into my Gemini History bucket for perfect recall. Always do this for store/remember calls. Use search_memories with good queries to recall.'",
  "parameters": {
    "type": "object",
    "properties": {
      "location_id": {
        "type": "string",
        "description": "Location ID. Optional for non-MCP: if omitted and sourceLlm provided at the top level of the /api/tools/call body, server auto-resolves to the matching per-LLM 'XXX History' location (recommended for Gemini/ChatGPT/etc)."
      },
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
      "description": "Store important context in the user's long-term memory. (For auto per-LLM org: caller must pass sourceLlm at top level of the /api/tools/call POST body, not in params. See recommended system prompt section.)",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "location_id": { "type": "STRING", "description": "Optional when sourceLlm at call root: auto-resolves to per-LLM history loc" },
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

## Recommended System Prompt Addition (MANDATORY for auto-organized per-LLM history)

Add this to your LLM's system prompt when using the REST tools (non-MCP path). The live tool description returned by GET /api/tools contains the authoritative version.

```
You have access to the user's long-term memory through Unimatrix (auto-provisioned per-LLM history locations when the user connected your key in onboarding).

CRITICAL RULE FOR ORGANIZATION:
For EVERY call you make to unimatrix_store_memory (or remember) via the REST endpoint POST /api/tools/call (or /api/tools), you MUST include at the ROOT of the request JSON body (sibling to toolName/args, never inside args):
  "sourceLlm": "gemini"   (use "openai", "claude", "gemini", "groq", or your exact provider name the user connected)
Example exact payload:
{"toolName":"unimatrix_store_memory","args":{"content":"User decided on dark theme for the app. Prefers high contrast."},"sourceLlm":"gemini"}

This causes automatic tagging + filing into the dedicated 'Gemini History' (or equivalent) location inside 'LLM Histories' palace. The server will auto-resolve the location if you omit location_id.

When the user asks about previous work, decisions, or context:
- First call unimatrix_search_memories with a good query (optionally scoped via palace)
- Use the results to inform your response. You can search across histories or target a specific LLM's history.

When the user shares important information they may want to remember later:
- Call unimatrix_store_memory with clear, specific content + the sourceLlm root field as shown above.
- Prefer the auto-resolve (omit location_id) so it lands in the correct per-LLM bucket.

Hosts/agents: use prepareUnimatrixToolCall from @unimatrix/llm (or the equivalent in your client) when translating LLM function calls into /api/tools/call POSTs.
```

---

**Note (Recommended)**: Instead of hard-coding the tool definitions above, most agents should now dynamically discover the current tool surface at runtime:

```
GET https://deployunimatrix.com/api/tools
```

This returns the exact OpenAI function-calling shape (or `?format=mcp` for the raw definitions). The schemas will always stay in sync with the live MCP server. The `unimatrix_store_memory` description in the live response contains the full authoritative system-prompt text + sourceLlm contract for non-MCP auto-history organization.

See the ready-to-use clients:
- `docs/examples/rest-api/typescript.ts` → `UnimatrixToolsClient`
- `docs/examples/rest-api/python.py` → `UnimatrixToolsClient`

These clients handle both discovery (`listTools()`) and execution (`callTool()` / `searchMemories()` etc.).

For hosts that programmatically build the call payloads for a known LLM context, use the portable helper:
```ts
import { prepareUnimatrixToolCall } from '@unimatrix/llm';
const payload = prepareUnimatrixToolCall('unimatrix_store_memory', { content: '...' }, 'gemini');
// then POST /api/tools/call with the payload (includes sourceLlm at root)
```
