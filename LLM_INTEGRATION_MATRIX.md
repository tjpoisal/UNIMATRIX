# Unimatrix — LLM Integration Matrix & Setup Guides

## 🗺️ PLATFORM COMPATIBILITY MATRIX

| Platform | Type | Integration | Status | Setup Time | Priority |
|----------|------|-----------|--------|-----------|----------|
| **ChatGPT** | Web | Extension + API | ✅ READY | 2min | CRITICAL |
| **Claude (web)** | Web | Extension + MCP | ✅ READY | 2min | CRITICAL |
| **Claude Desktop** | Desktop | MCP | ✅ READY | 5min | CRITICAL |
| **Cursor IDE** | IDE | MCP | ✅ READY | 5min | CRITICAL |
| **Windsurf** | IDE | MCP | ✅ READY | 5min | HIGH |
| **Gemini** | Web | Extension + API | ✅ READY | 2min | HIGH |
| **Grok (X.com)** | Web | Extension | 🟡 PARTIAL | 2min | HIGH |
| **Perplexity** | Web | Extension + API | 🟡 PARTIAL | 2min | HIGH |
| **Copilot** | Web | Extension | ✅ READY | 2min | MEDIUM |
| **Ollama** (Local) | Local | API + Webhook | 🔴 MISSING | 10min | HIGH |
| **DeepSeek** | Web | Extension + API | 🔴 MISSING | 2min | MEDIUM |
| **OpenClaw** | Web | Extension | 🔴 MISSING | 2min | LOW |
| **Groq** | Web | Extension + API | 🔴 MISSING | 2min | MEDIUM |
| **Mistral** | Web | Extension + API | 🔴 MISSING | 2min | MEDIUM |
| **Cohere** | Web | Extension + API | 🔴 MISSING | 2min | LOW |
| **HuggingFace Spaces** | Web | Extension | ✅ READY | 2min | MEDIUM |
| **Together AI** | Web | Extension + API | 🔴 MISSING | 2min | LOW |
| **Antml Anthropic** (API only) | API | SDK Integration | 🔴 MISSING | 5min | HIGH |
| **OpenAI API** | API | SDK Integration | 🔴 MISSING | 5min | HIGH |
| **Azure OpenAI** | API | SDK Integration | 🔴 MISSING | 5min | MEDIUM |
| **Replicate** | API | Webhook | 🔴 MISSING | 10min | LOW |

---

## ✅ READY NOW (Do These First)

### 1. ChatGPT Web
**Status:** ✅ Extension ready  
**Setup:** 2 minutes

```
1. Install Unimatrix extension
2. Go to chat.openai.com
3. Button "💾 Save to Unimatrix" appears (bottom right)
4. Click → popup → save memory
```

**Help:** `/setup/chatgpt`

---

### 2. Claude Web
**Status:** ✅ Extension ready  
**Setup:** 2 minutes

```
1. Install Unimatrix extension
2. Go to claude.ai
3. Button appears on conversation
4. Save directly to encrypted vault
```

**Help:** `/setup/claude-web`

---

### 3. Claude Desktop (MCP)
**Status:** ✅ MCP ready  
**Setup:** 5 minutes

```json
{
  "mcpServers": {
    "unimatrix": {
      "command": "node",
      "args": ["/path/to/unimatrix-mcp-server.js"],
      "env": {
        "UNIMATRIX_API_KEY": "your-api-key-here",
        "UNIMATRIX_URL": "https://unimatrix-web.fly.dev"
      }
    }
  }
}
```

**Usage:**
```
@unimatrix recall "python recursion"
@unimatrix remember "React hooks: useCallback prevents re-renders"
@unimatrix get_recent 10
@unimatrix continue_from session-id
```

**Help:** `/setup/claude-desktop`

---

### 4. Cursor IDE (MCP)
**Status:** ✅ MCP ready  
**Setup:** 5 minutes

```
1. Open Cursor settings (Cmd+,)
2. Search "MCP"
3. Add Unimatrix server config
4. Restart Cursor
5. Use @unimatrix in any chat
```

**Help:** `/setup/cursor`

---

### 5. Windsurf IDE (MCP)
**Status:** ✅ MCP ready  
**Setup:** 5 minutes (same as Cursor)

**Help:** `/setup/windsurf`

---

### 6. Gemini Web
**Status:** ✅ Extension ready  
**Setup:** 2 minutes

```
1. Install extension
2. Go to gemini.google.com
3. Button appears in conversation
4. Save memory
```

**Help:** `/setup/gemini`

---

### 7. HuggingFace Spaces
**Status:** ✅ Extension ready  
**Setup:** 2 minutes

```
1. Install extension
2. Open any HuggingFace Space with chat
3. Save memory from conversation
```

**Help:** `/setup/huggingface`

---

### 8. Copilot (Microsoft)
**Status:** ✅ Extension ready  
**Setup:** 2 minutes

```
1. Install extension
2. Go to copilot.microsoft.com
3. Button appears
4. Save memory
```

**Help:** `/setup/copilot`

---

## 🟡 PARTIAL (Update Extension)

### Grok (X.com)
**Status:** 🟡 Extension needs DOM selector update  
**Setup:** 2 minutes (once fixed)

**What's needed:**
- Update content.js to detect Grok chat interface
- Add DOM selectors for Grok's message containers
- Test auto-capture on x.com/grok

**File to update:** `apps/extension/content.js` (line 92)

```javascript
// Add to captureFromLLM()
} else if (url.includes('x.com/grok')) {
  return captureGrok();
}

// Add function
function captureGrok() {
  const messages = [];
  const messageElements = document.querySelectorAll('[data-testid="Conversation-Tweet"], [role="article"]');
  messageElements.forEach(el => {
    const text = el.textContent?.trim();
    if (text && text.length > 10) messages.push(text);
  });
  return messages.slice(-10).join('\n\n');
}
```

---

### Perplexity
**Status:** 🟡 Extension + API needed  
**Setup:** 2 minutes (once built)

**What's needed:**
- Browser extension content script for perplexity.ai
- Perplexity API integration (for authenticated saves)
- Custom webhook for real-time capture

**File to create:** `apps/extension/integrations/perplexity.js`

---

## 🔴 MISSING (Needs Implementation)

### Ollama (Local LLM)
**Status:** 🔴 High priority - local alternative to cloud APIs  
**Setup:** 10 minutes

**Architecture:**
```
User → Ollama (localhost:11434)
    ↓
Unimatrix MCP Server (running locally or remotely)
    ↓
Webhook: POST localhost:11434/api/memory-save
    ↓
Encrypted storage (Neon + client-side)
```

**Installation:**
```bash
# 1. User installs Ollama
brew install ollama
ollama serve

# 2. Download a model
ollama pull mistral

# 3. Configure Unimatrix for Ollama
# In Unimatrix dashboard: /settings/integrations/ollama
# Enter: http://localhost:11434

# 4. Ollama auto-sends memories after each response
```

**What to build:**
- [ ] Ollama webhook handler (captures conversation context)
- [ ] Local memory storage (SQLite for offline-first)
- [ ] Sync when online
- [ ] Ollama settings page in dashboard

**Files needed:**
- `packages/server/src/handlers/ollama-webhook.ts`
- `apps/web/app/settings/integrations/ollama.tsx`
- `apps/web/lib/ollama-client.ts`

---

### DeepSeek
**Status:** 🔴 Popular in China, needs extension + API  
**Setup:** 2 minutes (once built)

**What's needed:**
- Browser extension for deepseek.com
- DeepSeek API integration
- CN/EN localization (Chinese users)

**Files to create:**
- `apps/extension/integrations/deepseek.js`
- `packages/server/src/integrations/deepseek-api.ts`

---

### Groq (Fast Inference)
**Status:** 🔴 API-based, needs integration  
**Setup:** 5 minutes

**Groq API Integration:**
```typescript
// POST /api/integrations/groq/webhook
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// After each completion, send to Unimatrix
const message = await groq.messages.create({
  model: "mixtral-8x7b-32768",
  messages: [{ role: "user", content: "..." }],
});

// Capture response
await saveMemory({
  content: message.content[0].text,
  context: "Groq Inference",
  encrypted: true,
});
```

**Files to create:**
- `packages/server/src/integrations/groq-integration.ts`
- `apps/web/app/settings/integrations/groq.tsx`

---

### Mistral
**Status:** 🔴 Popular open-source model, needs API  
**Setup:** 5 minutes

**Files to create:**
- `packages/server/src/integrations/mistral-api.ts`
- Browser extension support

---

### OpenAI API + Azure OpenAI
**Status:** 🔴 For developers using API directly  
**Setup:** 5 minutes

**What to build:**
- Node.js SDK integration
- TypeScript types
- Automatic memory capture from API calls

```typescript
import { Unimatrix } from '@unimatrix/sdk';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const unimatrix = new Unimatrix({ apiKey: process.env.UNIMATRIX_API_KEY });

const completion = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "..." }],
  hooks: {
    onComplete: async (response) => {
      await unimatrix.remember({
        content: response.choices[0].message.content,
        context: "GPT-4 API",
        encrypted: true,
      });
    },
  },
});
```

**Files to create:**
- `packages/sdk/src/openai-integration.ts`
- `packages/sdk/src/azure-integration.ts`

---

### Cohere API
**Status:** 🔴 Lower priority, similar to Mistral  
**Setup:** 5 minutes

---

### Together AI
**Status:** 🔴 Inference platform, needs API  
**Setup:** 5 minutes

---

### OpenClaw
**Status:** 🔴 Emerging platform, research needed  
**Setup:** TBD

---

## 🏗️ INTEGRATION ARCHITECTURE

### Type 1: Browser Extension (Web UI)
**For:** ChatGPT, Claude, Gemini, Grok, Perplexity, DeepSeek, Copilot  
**How:** Inject button, capture DOM, send to API  
**Effort:** 2 hours per platform

```
User → Web LLM (chatgpt.com, claude.ai, etc.)
    ↓
Extension detects LLM platform
    ↓
Injects "💾 Save to Unimatrix" button
    ↓
User clicks → Captures conversation
    ↓
Client-side encryption
    ↓
POST /api/memories/create
```

---

### Type 2: MCP Server (Desktop IDEs)
**For:** Claude Desktop, Cursor, Windsurf, VS Code + MCP  
**How:** Expose tools via MCP protocol  
**Effort:** Already done

```
IDE (Cursor, Windsurf)
    ↓
@unimatrix tool call
    ↓
MCP Server (localhost:3000 or remote)
    ↓
Encrypted save to Neon
```

---

### Type 3: API Integration (Programmatic)
**For:** OpenAI API, Groq, Mistral, Cohere, Azure OpenAI  
**How:** SDK wrapper around LLM calls  
**Effort:** 4 hours per platform

```typescript
const response = await llm.chat.completions.create({
  model: "...",
  messages: [...],
  onComplete: (response) => {
    unimatrix.remember(response.text);
  },
});
```

---

### Type 4: Webhook (Real-time Capture)
**For:** Ollama (local), Replicate, LM Studio  
**How:** Webhook post-hook on LLM response  
**Effort:** 3 hours per platform

```
Ollama (localhost:11434)
    ↓
Response generated
    ↓
POST http://localhost:3000/api/ollama-webhook
    ↓
Unimatrix captures + encrypts
    ↓
Offline-first: sync when online
```

---

### Type 5: Custom Integration (Platform-specific)
**For:** Grok, Perplexity (advanced), custom chatbots  
**How:** Platform-specific APIs  
**Effort:** 5-8 hours per platform

---

## 📋 IMPLEMENTATION ROADMAP

### Week 1 (THIS WEEK) — CRITICAL PATH
- [ ] **Grok extension** (update DOM selectors)
- [ ] **Ollama local integration** (webhook + offline storage)
- [ ] **Perplexity extension** (update capturer)

### Week 2
- [ ] **OpenAI API SDK** (wrapper)
- [ ] **Groq API integration**
- [ ] **Mistral integration**
- [ ] Setup guides for all 6 (docs + videos)

### Week 3
- [ ] **DeepSeek** (extension + localization)
- [ ] **Azure OpenAI**
- [ ] **Together AI**
- [ ] More guides + API docs

### Week 4
- [ ] **Cohere**
- [ ] **OpenClaw** (if active)
- [ ] Remaining platforms
- [ ] Final testing + polish

---

## 🎯 SETUP GUIDES (To Create)

Each platform needs:
1. **Quick start** (2-3 steps)
2. **Video demo** (30-60 sec)
3. **Troubleshooting** (FAQ)
4. **Features** (what works, what doesn't)

### Pages to create:
```
/setup/chatgpt
/setup/claude-web
/setup/claude-desktop
/setup/cursor
/setup/windsurf
/setup/gemini
/setup/grok
/setup/perplexity
/setup/copilot
/setup/ollama
/setup/deepseek
/setup/groq
/setup/openai-api
/setup/mistral
/setup/cohere
/setup/azure-openai
/setup/together-ai
/setup/huggingface
```

---

## 📊 FEATURE PARITY BY PLATFORM

| Feature | ChatGPT | Claude | Cursor | Ollama | API |
|---------|---------|--------|--------|--------|-----|
| Save memories | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recall memories | ❌ | ✅ (MCP) | ✅ (MCP) | ✅ | ✅ |
| Auto-encrypt | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cross-LLM context | ✅ | ✅ | ✅ | ❌ | ✅ |
| Offline-first | ❌ | ❌ | ❌ | ✅ | ❌ |
| Real-time sync | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 CODE STRUCTURE

```
apps/extension/
├── integrations/
│   ├── chatgpt.js        ✅
│   ├── claude.js         ✅
│   ├── gemini.js         ✅
│   ├── grok.js           🟡 (update selectors)
│   ├── perplexity.js     🔴 (build)
│   ├── deepseek.js       🔴 (build)
│   ├── copilot.js        ✅
│   └── huggingface.js    ✅

packages/server/src/
├── integrations/
│   ├── ollama.ts         🔴 (build)
│   ├── groq.ts           🔴 (build)
│   ├── mistral.ts        🔴 (build)
│   ├── deepseek.ts       🔴 (build)
│   ├── cohere.ts         🔴 (build)
│   └── together.ts       🔴 (build)
├── handlers/
│   ├── ollama-webhook.ts 🔴 (build)
│   └── api-webhook.ts    🔴 (build)

packages/sdk/
├── openai-integration.ts 🔴 (build)
├── azure-integration.ts  🔴 (build)
├── groq-integration.ts   🔴 (build)
└── mistral-integration.ts 🔴 (build)

apps/web/app/setup/
├── [platform].tsx        (39 pages needed)
```

---

## 🎬 VIDEOS TO CREATE (By Platform)

| Platform | Video | Length | Effort |
|----------|-------|--------|--------|
| ChatGPT | "Save from ChatGPT" | 1m | 1h |
| Claude | "Claude Desktop config" | 2m | 1h |
| Cursor | "Use in Cursor IDE" | 1.5m | 1h |
| Ollama | "Run Ollama locally" | 2m | 1h |
| OpenAI API | "API integration" | 2m | 1h |
| Groq | "Lightning-fast inference" | 1.5m | 1h |

---

## ✅ PRIORITY ORDER (DO THIS)

1. **Grok** (update extension) — 1 hour
2. **Ollama** (local LLM) — 8 hours
3. **OpenAI API SDK** — 6 hours
4. **Groq** — 4 hours
5. **Mistral** — 4 hours
6. **Perplexity** — 4 hours
7. **DeepSeek** — 4 hours
8. **Setup guides + videos** — 20 hours

**Total: ~50 hours (1 dev, 1 week)**

---

## 🚀 SUCCESS CRITERIA

- [ ] All 8 major platforms supported
- [ ] Setup guide for each (<2min)
- [ ] Video for each (1-2min)
- [ ] Docs for each platform
- [ ] Feature parity matrix
- [ ] API SDK for developers
- [ ] Zero friction onboarding

---

**Status:** 🔴 **80% of integrations MISSING**

**Critical blockers:**
- ❌ Ollama users can't use locally
- ❌ API developers can't integrate
- ❌ Grok/Perplexity users blocked
- ❌ No guides for 60% of platforms

**Fix this ASAP for true cross-LLM coverage.**
