# Unimatrix — pre.dev Build Prompt
# Paste the text below into pre.dev's description box.
# Attach logo-icon-cyan.svg (apps/web/public/logo-icon-cyan.svg) as the project image.
---

## Product: Unimatrix
**Tagline:** Your AI remembers everything. Everywhere.
**Logo:** Attached — circuit/palace mark in cyan (#00F5FF) on dark navy (#0A0F1C).

Unimatrix is a universal AI memory persistence and cross-device continuity layer delivered as an MCP (Model Context Protocol) server. It runs silently in the background. Every AI the user talks to — on any device — reads and writes shared memory through Unimatrix automatically. The user never loses context. Ever.

**Hero use case:** User starts a research session with ChatGPT on iPhone. Picks up iPad, opens Claude. Claude calls `unimatrix.get_recent()` via MCP at session start and continues EXACTLY where ChatGPT left off — full context, zero re-explaining. Gets home, opens desktop running a private self-hosted Unimatrix instance on their home server. Opens the collaborative desktop app: Claude, GPT-4, and Gemini are simultaneously in the same conversation, each contributing when relevant, all reading from the same Unimatrix memory store.

**This is NOT a note-taking app, a flashcard app, a PKM tool, or a study aid.** It is infrastructure — a background MCP server that any LLM connects to for persistent, cross-device, cross-provider memory.

---

## Existing Stack (monorepo — already built, do not regenerate)

```
unimatrix/
├── packages/server/     Fastify MCP server — THE core product
├── packages/llm/        Multi-LLM abstraction (Claude, GPT-4, Gemini, Groq, Ollama)
├── apps/web/            Next.js 16 + NextAuth v5 + Prisma + Tailwind + Stripe
├── apps/mobile/         Expo / React Native — auth + memory viewer
└── apps/desktop/        Electron — planned, not yet built
```

- **Database:** Neon PostgreSQL via Prisma
- **Hosting:** Vercel (auto-deploy from GitHub `main`)
- **Auth:** NextAuth v5 — credentials + Google + GitHub, JWT sessions, bcryptjs
- **Payments:** Stripe — Free / Pro $9.99/mo / Enterprise $29.99/mo
- **Email:** Resend API
- **MCP endpoint (cloud - Render primary):** `https://<your-mcp-service>.onrender.com/mcp` (legacy Vercel: https://<your-mcp>.onrender.com/mcp  # or legacy vercel)

**Data model:**
- `Palace` = workspace / project (e.g. "Work Research", "Personal")
- `Location` = context within a palace (topic, session, device)
- `Memory` = AI-generated context entry from a conversation

**Live MCP tools today:**
- `unimatrix.remember(content, context?)` — store a memory from any LLM
- `unimatrix.recall(query)` — semantic search across all memories
- `unimatrix.get_recent(limit?)` — last N memories across all LLMs and devices
- `unimatrix.continue_from(session_id?)` — load full context of a prior session
- `unimatrix.list_contexts()` — list all active palaces/workspaces

**Design system:**
- Background: `#0A0F1C`
- Accent/CTA: `#00F5FF`
- Card bg: `#111827`
- Text primary: `#F1F5F9`
- Text muted: `#94A3B8`
- Error: `#EF4444`

---

## What Needs to Be Built

### 1. Non-MCP LLM Integration Layer

Many LLMs and their web UIs do not support MCP natively (ChatGPT web, Gemini web, Grok, etc.). Unimatrix must work with all of them through the following integration surfaces:

**A. Browser Extension (Chrome + Firefox + Safari)**
- Monitors active LLM web UIs: chat.openai.com, gemini.google.com, grok.com, claude.ai, character.ai
- On message send: POST conversation turn to `unimatrix.remember()` via REST
- On new conversation start: calls `unimatrix.get_recent()` and injects a system-context block into the page DOM before the first message sends
- Manifest V3, service worker architecture
- Popup UI: shows last 5 memories, current workspace selector, on/off toggle per site

**B. REST API (for any LLM that supports custom system prompts or tool definitions)**
All MCP tools are mirrored as plain REST endpoints:
- `POST /api/memory` — store a memory
- `GET /api/memory/recent?limit=10` — fetch recent memories
- `POST /api/memory/search` — semantic search
- `GET /api/memory/session/:id` — continue from session

**C. OpenAI-Compatible Function Definitions**
Generate a ready-to-paste JSON block of OpenAI function/tool definitions that any LLM supporting function calling can use (GPT-4, Mistral, Llama 3 via Ollama, etc.):
```json
{
  "name": "unimatrix_remember",
  "description": "Store a memory from this conversation to persist across all devices and LLMs",
  "parameters": { "content": "string", "context": "string?" }
}
```
Host these definitions at a static URL: `https://unimatrix-flax.vercel.app/api/tools.json`

**D. SDK / npm package (`@unimatrix/sdk`)**
- `npm install @unimatrix/sdk`
- Wraps the REST API with typed methods: `remember()`, `recall()`, `getRecent()`, `continueFrom()`
- Works in Node, Deno, browser, React Native
- Auto-injects API key from env var `UNIMATRIX_API_KEY`

---

### 2. IDE Integrations

**A. Cursor** (MCP — already supported)
Cursor natively supports MCP servers. Document and test the config:
```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://<your-mcp>.onrender.com/mcp  # or legacy vercel",
      "apiKey": "USER_API_KEY"
    }
  }
}
```
Build a Cursor-specific setup guide page at `/docs/cursor`.

**B. VS Code Extension** (`vscode-unimatrix`)
- Published to VS Code Marketplace
- Sidebar panel: shows recent memories, current workspace, search
- Command palette commands: `Unimatrix: Remember Selection`, `Unimatrix: Recall...`, `Unimatrix: Continue From Last Session`
- Status bar item: shows active workspace name, click to switch
- Works with GitHub Copilot via MCP (VS Code 1.99+ supports MCP natively — register Unimatrix as an MCP server automatically on extension install)
- Settings: `unimatrix.apiKey`, `unimatrix.endpoint`, `unimatrix.autoRemember`

**C. Warp Terminal** (MCP — already supported)
Warp AI supports MCP servers natively. Provide config and setup guide at `/docs/warp`:
```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://<your-mcp>.onrender.com/mcp  # or legacy vercel",
      "apiKey": "USER_API_KEY"
    }
  }
}
```
Add Warp-specific prompting tips: how to use `recall` in terminal AI sessions, how to persist shell research sessions across machines.

**D. Xcode** (`UnimatrixXcode` Swift Package + Source Extension)
- Swift Package Manager package: `https://github.com/tjpoisal/unimatrix-swift`
- `import UnimatrixKit` — async/await API client for all Unimatrix REST endpoints
- Xcode Source Editor Extension: adds "Remember Selection" and "Recall Context" to the Editor menu
- Companion macOS menu bar app: lives in the system tray, shows recent memories, allows quick recall without leaving Xcode
- Uses `UNIMATRIX_API_KEY` from Keychain (not plist — never stored in plaintext)

---

### 3. Docker — Full Self-Hosted Stack

`docker-compose.yml` at repo root that spins up the complete Unimatrix stack on any machine:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: unimatrix
      POSTGRES_USER: unimatrix
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U unimatrix"]

  mcp-server:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://unimatrix:${POSTGRES_PASSWORD}@postgres:5432/unimatrix
      PORT: 3001
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://unimatrix:${POSTGRES_PASSWORD}@postgres:5432/unimatrix
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      MCP_SERVER_URL: http://mcp-server:3001
    depends_on:
      - mcp-server

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - web
      - mcp-server

volumes:
  postgres_data:
  redis_data:
```

Also build:
- `packages/server/Dockerfile` — multi-stage Node build for the Fastify MCP server
- `apps/web/Dockerfile` — multi-stage Next.js build
- `.env.example` — all required env vars documented with descriptions
- `scripts/setup.sh` — one-command setup: generates secrets, runs `docker compose up`, runs Prisma migrations, prints the local MCP endpoint to configure in LLM clients
- Setup guide page at `/docs/self-host`

---

### 4. Real-Time WebSocket Sync

When any LLM writes a memory to Unimatrix, all other connected clients (web dashboard, mobile app, desktop app, other browser tabs) receive it instantly.

- Redis pub/sub as the message broker (already in Docker setup above)
- WebSocket server in `packages/server` using `@fastify/websocket`
- Client subscribes on connect, authenticated by API key
- Event payload: `{ type: 'memory.created', memory: Memory, palace: string, location: string }`
- Web dashboard updates memory list in real time without page refresh
- Mobile app shows live badge count of new memories

---

### 5. Collaborative Desktop App (Electron)

`apps/desktop` — multi-LLM simultaneous conversation room.

- Each LLM provider (Claude, GPT-4, Gemini, Groq, Ollama) connects as its own client
- User sends one message; all active LLMs receive it simultaneously
- Each LLM streams its response into its own panel
- Any LLM can "raise hand" (async contribution) when it detects relevance to an ongoing thread
- All LLMs share full context via `unimatrix.get_recent()` on room join
- Room history is stored back to Unimatrix so any device can continue the session later
- UI: dark room aesthetic matching design system, each LLM has its own color-coded stream
- Local LLMs (Ollama) supported — Unimatrix auto-detects running Ollama instances on LAN
- Self-hosted mode: Electron app talks to `localhost:3001` instead of cloud

---

### 6. Pricing Tiers

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 3 palaces, 1,000 memories, 2 devices |
| Pro | $9.99/mo | Unlimited all + Collaborative AI Room |
| Enterprise | $29.99/mo | Unlimited + self-host Docker + team sharing + agentic mode |

---

## Competitive Moat

- **Mem0 / MemGPT:** Per-LLM memory only. Cannot pass context from ChatGPT to Claude.
- **No existing product** lets a user start on ChatGPT and continue on Claude with full shared context.
- **No existing product** offers a self-hosted MCP memory server with a cloud fallback.
- **The collaborative multi-LLM room** is entirely novel.
- **MCP protocol** = any LLM, zero custom integrations. Future-proof by design.

---

## GitHub Repo
https://github.com/tjpoisal/UNIMATRIX

## Live Cloud
https://unimatrix-flax.vercel.app

## Marketing Site
https://deployunimatrix.com
