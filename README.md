# Unimatrix

**A managed MCP server for persistent, hierarchical AI memory.**

Unimatrix gives MCP-compatible clients (Claude Desktop, Cursor, Windsurf, custom agents) access to the same durable, user-controlled memory through standard protocol tools — and gives non-MCP LLMs (ChatGPT, Gemini, Grok, Perplexity) the same memory via a browser extension and an OpenAI-compatible local proxy.

**Key characteristics:**
- Explicit tool calls only — no automatic background loading or hidden sync
- Hierarchical organization (Palaces → nested Locations → Memories)
- Works across every AI tool and device via MCP, REST, browser extension, and local proxy
- AES-256-GCM encryption at rest, full per-account audit logs
- Cloud hosted or self-hostable (Docker + Postgres + pgvector)

See [deployunimatrix.com](https://deployunimatrix.com) for the live product, onboarding, and security details.

---

## Project Structure

This is a **pnpm + TurboRepo monorepo**.

```
unimatrix/
├── apps/
│   ├── web/          # Next.js web dashboard + landing page (Neon + Prisma + NextAuth)
│   ├── mobile/       # Expo (React Native) — iOS & Android
│   ├── desktop/      # Electron — system tray, MCP proxy (port 8765), OpenAI proxy (port 8766)
│   └── extension/    # Chrome/Firefox extension — ChatGPT, Claude, Gemini, Grok, Perplexity
├── packages/
│   ├── server/       # Fastify backend — MCP API, embeddings, Librarian agent
│   ├── db/           # Prisma schema and migrations
│   ├── llm/          # Multi-LLM abstraction (Claude, GPT-4, Gemini, Groq, Ollama)
│   ├── types/        # Shared TypeScript interfaces
│   └── ui/           # Shared React components
├── fly.mcp.toml      # Fly.io — MCP server app
├── fly.web.toml      # Fly.io — web dashboard app
├── fly.worker.toml   # Fly.io — background worker app
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── LLM_ARCHITECTURE.md
```

---

## What's Built

### `packages/server` — Fastify Backend
The core API that stores and retrieves memories. Deployed to Fly.io as a persistent VM (not serverless — required for WebSocket Collab Room, long-running embeddings, and the Librarian agent).

- **Auth**: Clerk
- **Database**: PostgreSQL + pgvector (Neon) — migrations in `migrations/`
- **Embeddings**: `@huggingface/transformers` (local inference, no API cost)
- **Librarian Agent**: Claude Haiku — async classification, poly-tagging, routing
- **Security**: Per-user AES-256-GCM encryption (scrypt KDF), PII/API key redaction, RLS, audit logging
- **MCP Tools**:
  - `unimatrix_store_memory` — encrypt, queue, auto-file into Palace/Location
  - `unimatrix_search_memories` — hybrid full-text + semantic search with recency decay
  - `unimatrix_list_palaces` — enumerate workspaces available to this API key
  - `unimatrix_get_timeline` — temporal replay of memory history
  - `unimatrix_supersede_memory` — version/correct existing memories

### `packages/llm` — Multi-LLM Abstraction
Unified interface for 5 LLM providers with intelligent routing.

- **Providers**: Claude (Anthropic), GPT-4 (OpenAI), Gemini (Google), Groq, Ollama (local)
- **Features**: Provider registry, complexity-based router, load balancer, health monitoring, failover, streaming, cost optimization

### `apps/web` — Web Dashboard + Landing Page
Next.js web app — both the public landing page ([deployunimatrix.com](https://deployunimatrix.com)) and the authenticated dashboard.

- **Auth**: NextAuth.js (JWT, credentials, OAuth-ready)
- **Database**: Neon PostgreSQL + Prisma ORM
- **API**: REST endpoints — palaces, locations, memories, search, export, sync
- **Offline sync**: Batch sync with conflict resolution for mobile
- **Tiers enforced**: Free (3 palaces, 200 memories), Pro (unlimited)
- **Deployment**: Fly.io (`fly.web.toml`) — persistent VM required for WebSocket Collab Room

### `apps/desktop` — Electron Desktop App
System tray app that runs two local proxies:

- **MCP Proxy** (`localhost:8765`) — bridges Claude Desktop and other local MCP clients to Unimatrix. Auto-writes config files for Claude Desktop, Cursor, and Windsurf.
- **OpenAI-Compatible Proxy** (`localhost:8766`) — any tool that accepts a custom `baseURL` (LM Studio, Continue.dev, LangChain, custom scripts) gets automatic Unimatrix memory by pointing at `http://localhost:8766/v1`. The proxy injects tool schemas, intercepts `unimatrix_*` tool calls silently, and strips them from responses.

### `apps/extension` — Browser Extension
Chrome/Firefox extension for non-MCP web LLMs.

- **Supported**: ChatGPT, Claude web, Gemini, Grok (x.com/grok + grok.x.ai), Perplexity, Microsoft Copilot, HuggingFace Spaces
- **Features**: Floating "Save to Memory" button, per-site DOM conversation extraction, right-click context menu, auto-capture mode (Pro), SPA navigation support
- **Auth**: API key stored in `chrome.storage.local`, verified against Unimatrix REST API

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm + TurboRepo |
| Backend API | Fastify 5 + Zod + TypeScript |
| Web App | Next.js (App Router) + React |
| Mobile | Expo (React Native) |
| Desktop | Electron + local HTTP proxies |
| Browser Extension | Chrome MV3 (content + service worker) |
| Database | Neon PostgreSQL + pgvector |
| ORM | Prisma (web) / pg direct (server) |
| Embeddings | @huggingface/transformers (local) |
| Auth | Clerk (server) + NextAuth.js (web) |
| LLM / Librarian | Claude Haiku |
| MCP | @modelcontextprotocol/sdk |
| Deployment | Fly.io (3 persistent VMs: web, mcp, worker) |

---

## Quick Start

### Prerequisites
- Node.js 20+, pnpm 10+
- [Neon](https://neon.tech) database
- API keys: Clerk, Anthropic

### Install

```bash
git clone https://github.com/tjpoisal/UNIMATRIX.git
cd UNIMATRIX
pnpm install
```

### Run the Backend

```bash
cd packages/server
cp .env.example .env   # fill in DATABASE_URL, CLERK_SECRET_KEY, ANTHROPIC_API_KEY
npm run dev            # http://localhost:3000
```

### Run the Web App

```bash
cd apps/web
cp .env.local.example .env.local   # fill in DATABASE_URL, NEXTAUTH_SECRET
npm run db:push
npm run dev            # http://localhost:3001
```

### Connect a MCP Client (Claude Desktop, Cursor, Windsurf)

**Option A — Desktop app (recommended):** Install the Unimatrix desktop app. It auto-configures all supported MCP clients in one click.

**Option B — Manual config.** Add to your client's MCP config:

```json
{
  "mcpServers": {
    "unimatrix": {
      "type": "http",
      "url": "https://deployunimatrix.com/mcp",
      "headers": {
        "x-unimatrix-key": "your-api-key"
      }
    }
  }
}
```

Then instruct the model in your system prompt:

```
At the start of each session call unimatrix_list_palaces, then
unimatrix_search_memories with the current topic. When you learn
something important call unimatrix_store_memory to persist it.
```

### Connect a Non-MCP LLM (ChatGPT, Gemini, Grok, LM Studio…)

**Browser extension:** Install from `apps/extension/` (load unpacked in Chrome). Adds a "Save to Memory" button on every supported LLM web UI. Enter your API key in extension settings.

**OpenAI-compatible proxy:** Install the desktop app. Point any tool that accepts a custom `baseURL` at `http://localhost:8766/v1`. Memory injection happens automatically — no other config needed.

---

## Deployment

Three Fly.io apps — all persistent VMs, no serverless:

```bash
# Web dashboard
fly deploy --config fly.web.toml

# MCP + embeddings + Librarian
fly deploy --config fly.mcp.toml

# Background worker
fly deploy --config fly.worker.toml
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for environment variables, secrets, and database migration steps.

---

## Roadmap

### MVP (complete)
- [x] Core memory engine + Fastify backend
- [x] MCP tools (`unimatrix_store_memory`, `unimatrix_search_memories`, `unimatrix_list_palaces`)
- [x] Multi-LLM abstraction layer (Claude, GPT-4, Gemini, Groq, Ollama)
- [x] Web dashboard + landing page (deployunimatrix.com live)
- [x] Librarian agent (async classification + routing)
- [x] Security baseline (AES-256-GCM, RLS, audit logs)
- [x] Desktop app — system tray, MCP proxy, OpenAI-compatible proxy
- [x] Browser extension — ChatGPT, Claude, Gemini, Grok, Perplexity, Copilot
- [x] Collaborative AI Room (Pro/Enterprise — 7-day free trial)
- [x] iOS + Android mobile apps

### In Progress
- [ ] Web dashboard UI — palace editor, memory browser, search
- [ ] Fly.io production deployment (3 persistent VMs)
- [ ] Stripe billing integration

### Phase 2
- Temporal Replay UI (timeline visualization)
- Memory Graph (visual knowledge map)
- Multi-modal ingestion (images, PDFs)
- OAuth providers

### Phase 3 (B2B)
- Team / Shared Palaces
- CRDT offline sync (Yjs / Automerge)
- Enterprise SSO + BYOK

---

## Pricing

| Tier | Monthly | Annual | Key Features |
|---|---|---|---|
| Free | $0 | $0 | 3 palaces · 200 memories · 2 devices · All MCP clients |
| Pro | $9/mo | $79/yr | Unlimited everything · 20 API keys · Collab Room · Spend controls · Audit logs |
| Enterprise | $29/mo | $299/yr | Everything in Pro · Self-hosted Docker · Team sharing · 100 API keys · SSO · SLA |

---

## Docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Full system design
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Fly.io deployment guide (current)
- [`LLM_ARCHITECTURE.md`](./LLM_ARCHITECTURE.md) — Multi-LLM routing system
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) — What's done, what's next
- [`UNIMATRIX_QUICKSTART.md`](./UNIMATRIX_QUICKSTART.md) — Step-by-step local setup

---

*Memory should be infrastructure, not a product you fight with. Unimatrix makes every AI session feel like a continuation — not a new conversation.*
