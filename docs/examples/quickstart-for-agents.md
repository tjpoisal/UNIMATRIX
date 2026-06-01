# Quickstart for Agents (Non-MCP)

This guide is for LLMs, agents, and frameworks that **do not** support the Model Context Protocol (MCP) natively.

Use this when working with:
- ChatGPT (Custom GPTs)
- Gemini
- Grok
- Custom Python/TypeScript agents
- LangChain, LlamaIndex, CrewAI, AutoGen, etc.

---

## 1. Get an API Key

1. Sign up at [deployunimatrix.com](https://deployunimatrix.com)
2. Go to **Settings → API Keys**
3. Create a new key (starts with `umx_`)

Keep this key secret. It gives access to your memory.

---

## 2. Choose a Client

### Option A: TypeScript / JavaScript

```ts
import { UnimatrixClient } from './rest-api/typescript';

const client = new UnimatrixClient(process.env.UNIMATRIX_API_KEY!);

// Store something important
await client.storeMemory(
  "loc_project_architecture", 
  "We decided to use a custom JWT validation middleware instead of NextAuth.",
  ["architecture", "auth", "decision"]
);

// Recall relevant context
const results = await client.searchMemories("authentication decisions");
console.log(results);
```

See full client: [`typescript.ts`](./rest-api/typescript.ts)

### Option B: Python

```python
from rest_api.python import UnimatrixClient
import os

client = UnimatrixClient(os.environ["UNIMATRIX_API_KEY"])

# Store memory
client.store_memory(
    location_id="loc_project_architecture",
    content="We decided to use a custom JWT validation middleware instead of NextAuth.",
    tags=["architecture", "auth", "decision"]
)

# Search memory
results = client.search_memories("authentication decisions")
print(results)
```

See full client: [`python.py`](./rest-api/python.py)

---

## 3. Recommended System Prompt

Add this to your agent's system prompt for reliable memory usage:

```markdown
You have access to the user's long-term memory via Unimatrix using these tools:

- unimatrix_search_memories(query)
- unimatrix_store_memory(content, tags?)

**Rules:**
- When the user references previous work, decisions, or context, first search memory.
- When the user shares something important they may want to remember, store it.
- Always use specific, concrete language when storing memories.
- Use relevant tags (e.g. "architecture", "bug", "decision", "project-x").
```

---

## 4. Ready-to-Use Tool Definitions

Copy these directly into your LLM configuration:

→ [Tool Definitions for ChatGPT, Gemini, Claude, LangChain →](./llm-tools/non-mcp-tool-definitions.md)

---

## 5. Common Patterns

### Store important context
```ts
await client.storeMemory(locationId, "The rate limiter uses a sliding window with Redis sorted sets.");
```

### Recall before answering
```ts
const context = await client.searchMemories("rate limiting implementation");
```

### Get recent context from a workspace
```ts
const recent = await client.getRecentContext("palace_project_x", 15);
```

---

## Full Documentation

- Live interactive docs: https://deployunimatrix.com/docs/mcp
- Complete tool schemas & REST reference: [mcp-reference.md](../mcp-reference.md)

---

**Tip**: Start by creating one dedicated Palace per major project or domain. This makes retrieval much more effective than dumping everything into one big bucket.
