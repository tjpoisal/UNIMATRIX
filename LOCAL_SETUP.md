# Unimatrix — Local Development Setup

This guide covers running the web app and MCP server locally with a shared PostgreSQL database.

---

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL 15+ with `pgvector` extension
- (Optional) Voyage AI API key for embeddings

---

## 1. Install Dependencies

```bash
cd /workspace/UNIMATRIX
pnpm install
```

---

## 2. Database

The project now primarily uses **Prisma Postgres** (remote, pooled endpoint) for the web app and collaboration features.

### Recommended: Use your Prisma Postgres connection string

Get your connection string(s) from the Prisma dashboard:
- `DATABASE_URL`: the pooled connection string (for the app)
- `DIRECT_URL`: a direct (non-pooled) connection string (preferred for `prisma migrate`, `db push`, Studio, and DDL)

Set these in the env files (see below). The local Docker Postgres is now **optional** (useful for pgvector/embeddings in packages/server or fully offline dev).

### Optional: Local Postgres + Docker (for pgvector / full local mode)

If you want a local DB (e.g. for the older packages/server schema or embeddings):

```bash
docker compose up -d db
```

(Or the old manual docker run + `CREATE EXTENSION vector;`.)

See `docker-compose.yml` — the `web` and `mcp-server` services are pre-configured to use the remote DB by default.

---

## 3. Configure Environment Variables

Create `.env` files in **three** locations:

### A. Root + packages/server

Root `.env.local` and `packages/server/.env` have been created/updated with your Prisma Postgres URL (see the actual files). The old local example is no longer the default.

### B. Web App

`apps/web/.env` (for `prisma` CLI) and `apps/web/.env.local` (Next.js) have already been updated with your Prisma Postgres connection string.

### C. packages/mcp-server (stdio client for Claude Desktop, Cursor, etc.)

Update `packages/mcp-server/.env`:

```env
UNIMATRIX_API_URL=http://localhost:3000
UNIMATRIX_API_KEY=umx_...   # generate from the web dashboard
```

---

## 4. Initialize the Database

Since we are using a remote Prisma Postgres DB:

### Web App (Prisma)

```bash
cd /workspace/UNIMATRIX/apps/web
pnpm prisma migrate dev
# or for quick sync without migration history:
# pnpm prisma db push
```

(We already ran the initial migration for you when you provided the connection string.)

### Server (packages/server - raw SQL + its own Prisma schema)

```bash
cd /workspace/UNIMATRIX/packages/server
pnpm db:migrate   # runs the raw .sql files against $DATABASE_URL
# or
pnpm prisma migrate deploy
```

> **Important:** The web app (Prisma) and packages/server have **different schemas**.
> - web: Palaces, Locations, Memories, Organizations, CollabRoom/CollabMessage, WebhookSubscription, etc.
> - server: Spaces, Memories with pgvector, mcp_tokens, Clerk integration.
> 
> They *can* share the same Prisma Postgres DB, but migrations must be applied carefully (or use separate DBs/branches). The `web` schema is the primary one for the new collab features.

---

## 5. Start the Services

With the remote Prisma Postgres wired in, the local `db` container is optional.

### Terminal 1 — MCP Server (Fastify / packages/server)

```bash
cd /workspace/UNIMATRIX/packages/server
pnpm dev
```

Runs on **http://localhost:3001**

### Terminal 2 — Web App (Next.js)

```bash
cd /workspace/UNIMATRIX/apps/web
pnpm dev
```

Runs on **http://localhost:3000**

You can still run `docker compose up -d db` if you need the local pgvector instance for other experiments.

---

## 6. Verify Everything Works

### Quick Checklist

| # | Check | Command / Action | Expected Result |
|---|-------|----------------|-----------------|
| 1 | Server health | `curl http://localhost:3001/health` | `{"status":"ok","version":"0.1.0"}` |
| 2 | Web app loads | Open http://localhost:3000 | Sign-in page loads |
| 3 | Database connected | Sign up / log in | No errors, dashboard appears |
| 4 | API key generation | Dashboard → Settings → API Keys | Key created successfully |
| 5 | MCP server connects | Update `UNIMATRIX_API_KEY` in mcp-server `.env` | MCP tools respond |

### Detailed Verification Steps

#### 1. Health Check

```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","version":"0.1.0"}
```

#### 2. Test MCP Endpoint

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Should return a list of available tools (`remember`, `recall`, `store_memory`, etc.).

#### 3. Test Memory Storage

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "remember",
      "arguments": {
        "content": "Test memory from local dev",
        "context": "dev-test"
      }
    }
  }'
```

Should return a success response with the stored memory ID.

#### 4. Test Memory Recall

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "recall",
      "arguments": {
        "query": "test memory"
      }
    }
  }'
```

Should return the memory you just stored.

---

## Environment Variable Reference

### Required for Local Dev

| Variable | Location | Value | Purpose |
|----------|----------|-------|---------|
| `DATABASE_URL` | Root `.env*`, `apps/web/.env*`, `packages/server/.env` | Your Prisma Postgres **pooled** connection string | Main DB for web + collab (and server if sharing) |
| `DIRECT_URL` | Same files as above | Your Prisma Postgres **direct** (non-pooled) connection string | Used by Prisma Migrate, db push, Studio |
| `AUTH_SECRET` | Root `.env*`, Web `.env*` | `dev-secret-change-in-production` | NextAuth encryption |
| `NEXTAUTH_URL` | Root `.env*`, Web `.env*` | `http://localhost:3000` | Auth callback URL |
| `UNIMATRIX_API_URL` | `packages/mcp-server/.env` | `http://localhost:3000` (or your deployed URL) | MCP stdio client → server |
| `UNIMATRIX_API_KEY` | `packages/mcp-server/.env` | (generate from web dashboard) | MCP authentication |

### Optional

| Variable | Location | Purpose |
|----------|----------|---------|
| `GOOGLE_CLIENT_ID` | Root `.env`, Web `.env.local` | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | Root `.env`, Web `.env.local` | Google OAuth login |
| `GITHUB_CLIENT_ID` | Root `.env`, Web `.env.local` | GitHub OAuth login |
| `GITHUB_CLIENT_SECRET` | Root `.env`, Web `.env.local` | GitHub OAuth login |
| `VOYAGE_API_KEY` | Root `.env`, Web `.env.local` | Semantic search embeddings |
| `STRIPE_SECRET_KEY` | Web `.env.local` | Payment processing |
| `STRIPE_PUBLISHABLE_KEY` | Web `.env.local` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Web `.env.local` | Stripe webhooks |

---

## Troubleshooting

### "pgvector extension not found"

Only relevant if using the optional local `db` container or a local Postgres for embeddings:

```bash
docker compose exec db psql -U unimatrix -d unimatrix -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### "DATABASE_URL is required"

Make sure one of the `.env` / `.env.local` files contains your Prisma Postgres `DATABASE_URL` (the files we updated should have it). The web Prisma CLI primarily reads `apps/web/.env`.

### "Unauthorized" from MCP

1. Log into the web app at http://localhost:3000
2. Go to Dashboard → Settings → API Keys
3. Generate a new key
4. Update `UNIMATRIX_API_KEY` in `packages/mcp-server/.env`
5. Restart the MCP server

### Port conflicts

- Web app runs on **3000** (Next.js default)
- MCP server runs on **3001** (Fastify default)

If either port is taken, set `PORT` in the respective `.env`:

For the web app, Next.js doesn't use `PORT` env — use:
```bash
pnpm dev -- -p 3002
```

---

## Architecture Overview (Local / Remote DB)

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────────┐
│   Web App       │      │   MCP Server     │      │   Prisma Postgres      │
│   (Next.js)     │      │   (Fastify)      │      │   (pooled + direct)    │
│   localhost:3000│◄────►│   localhost:3001 │◄────►│   pooled.db.prisma.io  │
│                 │      │                  │      │                        │
│  - Auth/NextAuth│      │  - MCP tools     │      │  - Users, Palaces      │
│  - Dashboard    │      │  - REST API      │      │  - CollabRooms         │
│  - API Key Mgmt │      │  - Embeddings*   │      │  - Memories, etc.      │
└─────────────────┘      └──────────────────┘      └────────────────────────┘
         ▲                                              ▲
         │                                              │
         └────────────── Same remote DB ────────────────┘

* pgvector/embeddings may still benefit from the optional local docker db in some server flows.
```

The web app and (optionally) the Fastify server connect to the **Prisma Postgres** instance. The local Docker Postgres (`docker compose up -d db`) is now optional.
