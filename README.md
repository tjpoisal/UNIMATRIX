# Unimatrix

**Persistent memory infrastructure for AI — across every client, device, and session.**

> Close your laptop after 3 days of deep work with Claude. Open Claude on your phone and ask *"Where were we?"* — it instantly knows everything. Zero re-explaining. Zero copy-paste. That's the RTX moment.

Unimatrix is **memory as infrastructure**. It gives any LLM client (Claude Desktop, Claude Code, Cursor, Ollama) a persistent, searchable, structured memory layer via the **Model Context Protocol (MCP)**.

---

## Project Structure

This is a **pnpm + TurboRepo monorepo**.

```
unimatrix/
├── apps/
│   ├── web/          # Next.js 16 web dashboard (Neon + Prisma + NextAuth)
│   ├── mobile/       # Expo (React Native) — iOS & Android
│   └── desktop/      # Electron — wraps web app
├── packages/
│   ├── server/       # Fastify backend — MCP API, embeddings, Librarian agent
│   ├── mcp-server/   # MCP client — connects Claude/Ollama to Unimatrix API
│   ├── llm/          # Multi-LLM abstraction (Claude, GPT-4, Gemini, Groq, Ollama)
│   ├── types/        # Shared TypeScript interfaces
│   ├── ui/           # Shared React components
│   └── api/          # REST client helpers
├── infrastructure/
│   └── aws-cdk/      # Legacy AWS CDK (archived — migrated to Render + Neon)
├── ARCHITECTURE.md
├── MVP_Scope.md
├── IMPLEMENTATION_STATUS.md
└── LLM_ARCHITECTURE.md
```

---

## What's Built

### `packages/server` — Fastify Backend
The core API that stores and retrieves memories. Deployed to Render (Fastify MCP service + custom Next.js server for WS).

- **Auth**: Clerk
- **Database**: PostgreSQL + pgvector (Neon) — migrations in `migrations/`
- **Embeddings**: VoyageAI Voyage 3.5 MRL (512-dim, HNSW index)
- **Librarian Agent**: Claude Haiku — async classification, poly-tagging, routing
- **Security**: Per-user AES-256-GCM encryption, PII/API key redaction, RLS, audit logging
- **MCP Tools**:
  - `store_memory` — encrypt, queue, auto-file
  - `recall_context` — hybrid scoring: `α·cosine + (1-α)·0.5^(age/h)` with token budgets
  - `search_memories` — full-text + semantic fallback
  - `get_timeline` — temporal replay of memory history
  - `supersede_memory` — version/correct existing memories

### `packages/mcp-server` — MCP Client
Stdio MCP server that any Claude Desktop / Claude Code / Ollama user installs. Calls the backend via REST.

- **Tools**: `list_palaces`, `get_palace`, `search_memories`, `store_memory`, `list_memories`, `create_palace`, `create_location`, `update_memory`
- **Publishable** as an npm package (`unimatrix-mcp-server` binary)
- **Live API**: `https://deployunimatrix.com/api`

### `packages/llm` — Multi-LLM Abstraction
Unified interface for 5 LLM providers with intelligent routing.

- **Providers**: Claude (Anthropic), GPT-4 (OpenAI), Gemini (Google), Groq, Ollama (local)
- **Features**: Provider registry, intelligent router (complexity analysis), load balancer, health monitoring, failover, streaming, cost optimization

### `apps/web` — Web Dashboard
Next.js 16 dashboard for managing memory palaces.

- **Auth**: NextAuth.js (JWT, credentials, OAuth-ready)
- **Database**: Neon PostgreSQL + Prisma ORM
- **API**: REST endpoints — palaces, locations, memories, search, export, sync
- **Offline sync**: Batch sync with conflict resolution for mobile
- **Tiers enforced**: Free (3 palaces), Pro (unlimited)
- **Deployment**: See `DEPLOYMENT.md` (Railway, Fly.io, VPS + Docker Compose, etc.). The full product needs persistent long-lived processes (custom server for WS Collab + dedicated MCP + worker). The web UI + `/api/mcp` HTTP route can still run on Vercel, but the complete vision cannot. Dockerfiles ready for persistent platforms.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm + TurboRepo |
| Backend API | Fastify 5 + Zod + TypeScript |
| Web App | Next.js 16 (App Router) + React 19 |
| Mobile | Expo (React Native) |
| Desktop | Electron |
| Database | Neon PostgreSQL + pgvector |
| ORM | Prisma (web) / pg direct (server) |
| Embeddings | VoyageAI Voyage 3.5 MRL |
| Auth | Clerk (server) + NextAuth.js (web) |
| LLM / Librarian | Claude Haiku |
| MCP | @modelcontextprotocol/sdk |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites
- Node.js 18+, pnpm 9+
- [Neon](https://neon.tech) database
- API keys: Clerk, VoyageAI, Anthropic

### Install

```bash
git clone https://github.com/tjpoisal/UNIMATRIX.git
cd unimatrix
pnpm install
```

### Run the Backend

```bash
cd packages/server
cp .env.example .env   # fill in DATABASE_URL, CLERK_SECRET_KEY, VOYAGE_API_KEY, ANTHROPIC_API_KEY
npm run dev            # http://localhost:3000
```

### Run the Web App

```bash
cd apps/web
cp .env.local.example .env.local   # fill in DATABASE_URL, NEXTAUTH_SECRET
npm run db:push
npm run dev            # http://localhost:3001
```

### Connect to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["unimatrix-mcp-server"],
      "env": {
        "UNIMATRIX_API_KEY": "your-api-key",
        "UNIMATRIX_API_URL": "https://deployunimatrix.com/api"
      }
    }
  }
}
```

Then try in Claude:
```
store_memory: "Working on auth refactor — Clerk handles server, NextAuth handles web app"
recall_context: "Where were we on auth?"
```

---

## Roadmap

### MVP (Weeks 1–8 complete)
- [x] Core memory engine + Fastify backend
- [x] MCP client (Claude Desktop integration)
- [x] Multi-LLM abstraction layer
- [x] Web dashboard scaffold (Next.js + Prisma + Neon)
- [x] Librarian agent (async classification + routing)
- [x] Security baseline (encryption, RLS, audit)
- [ ] Web dashboard UI (palace editor, memory browser)
- [ ] Expo mobile app UI
- [ ] Beta launch

### Phase 2
- Temporal Replay UI (timeline visualization)
- Memory Graph (visual knowledge map)
- Multi-modal ingestion (images, PDFs)
- OAuth providers

### Phase 3 (B2B)
- Team / Shared Palaces
- CRDT offline sync (Yjs / Automerge)
- Self-hosted Docker tier
- Enterprise SSO + BYOK

---

## Monetization

| Tier | Price | Features |
|---|---|---|
| Free | $0 | 3 palaces, basic MCP |
| Pro | $15–20/mo | Unlimited palaces, Temporal Replay, priority Librarian |
| Team | $30–50/seat | Shared palaces, audit logs, team admin |
| Enterprise | Custom | Self-hosted, SSO, SLA, BYOK |

---

## Docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Full system design
- [`MVP_Scope.md`](./MVP_Scope.md) — 10-week build plan and scope decisions
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) — What's done, what's next
- [`LLM_ARCHITECTURE.md`](./LLM_ARCHITECTURE.md) — Multi-LLM routing system
- [`NEON_VERCEL_MIGRATION.md`](./NEON_VERCEL_MIGRATION.md) — Historical AWS → Neon + Vercel (now Render primary, see RENDER.md)
- [`UNIMATRIX_QUICKSTART.md`](./UNIMATRIX_QUICKSTART.md) — Step-by-step local setup

---

*Memory should be infrastructure, not a product you fight with. Unimatrix makes every AI session feel like a continuation — not a new conversation.*
