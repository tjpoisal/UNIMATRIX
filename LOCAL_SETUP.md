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

## 2. Start PostgreSQL

You need a local Postgres with the `pgvector` extension. Pick one:

### Option A: Docker (Recommended)

```bash
docker run -d \
  --name unimatrix-postgres \
  -e POSTGRES_USER=unimatrix \
  -e POSTGRES_PASSWORD=unimatrix \
  -e POSTGRES_DB=unimatrix \
  -p 5432:5432 \
  ankane/pgvector:latest
```

Then create the database:
```bash
docker exec -it unimatrix-postgres psql -U unimatrix -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Option B: Local Postgres

Ensure your local Postgres has `pgvector` installed, then:
```bash
createdb unimatrix
psql unimatrix -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

---

## 3. Configure Environment Variables

Create `.env` files in **three** locations:

### A. Root `.env` (used by packages/server)

Create `/workspace/UNIMATRIX/.env`:

```env
# Database (same DB for both web and server)
DATABASE_URL=postgresql://unimatrix:unimatrix@localhost:5432/unimatrix

# NextAuth v5
AUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional — skip if you only use Credentials login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Encryption (generate a real one for production)
MASTER_ENCRYPTION_KEY=00000000000000000000000000000000

# Voyage AI (optional — needed for semantic search/embedding generation)
VOYAGE_API_KEY=

# Node environment
NODE_ENV=development
```

### B. Web App `.env.local`

Create `/workspace/UNIMATRIX/apps/web/.env.local`:

```env
# Same database
DATABASE_URL=postgresql://unimatrix:unimatrix@localhost:5432/unimatrix

# NextAuth
AUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (optional — only needed for subscription features)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Voyage AI (optional)
VOYAGE_API_KEY=
```

### C. MCP Server `.env` (packages/mcp-server)

Create `/workspace/UNIMATRIX/packages/mcp-server/.env`:

```env
# Points to the local Fastify server
UNIMATRIX_API_URL=http://localhost:3001

# You'll generate this API key from the web app dashboard after first login
UNIMATRIX_API_KEY=your-api-key-here
```

---

## 4. Initialize the Database

### Web App (Prisma)

```bash
cd /workspace/UNIMATRIX/apps/web
pnpm prisma db push
```

### Server (Raw SQL Migrations)

```bash
cd /workspace/UNIMATRIX/packages/server
pnpm db:migrate
```

> **Note:** The server migrations create the `pgvector` column and RLS policies. The Prisma schema handles user/auth tables. Both can coexist on the same database.

---

## 5. Start the Services

### Terminal 1 — MCP Server (Fastify)

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
| `DATABASE_URL` | Root `.env`, Web `.env.local` | `postgresql://unimatrix:unimatrix@localhost:5432/unimatrix` | Shared Postgres connection |
| `AUTH_SECRET` | Root `.env`, Web `.env.local` | `dev-secret-change-in-production` | NextAuth encryption |
| `NEXTAUTH_URL` | Root `.env`, Web `.env.local` | `http://localhost:3000` | Auth callback URL |
| `MASTER_ENCRYPTION_KEY` | Root `.env` | `00000000000000000000000000000000` | Memory encryption (dev only) |
| `UNIMATRIX_API_URL` | `packages/mcp-server/.env` | `http://localhost:3001` | MCP → Server connection |
| `UNIMATRIX_API_KEY` | `packages/mcp-server/.env` | (generate from dashboard) | MCP authentication |

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

```bash
# Connect to your database and install the extension
psql postgresql://unimatrix:unimatrix@localhost:5432/unimatrix -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### "DATABASE_URL is required"

Ensure `.env` exists in `/workspace/UNIMATRIX/` (root) — the server loads it from there.

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
```env
PORT=3002  # for server
```

For the web app, Next.js doesn't use `PORT` env — use:
```bash
pnpm dev -- -p 3002
```

---

## Architecture Overview (Local)

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Web App       │      │   MCP Server     │      │   PostgreSQL    │
│   (Next.js)     │      │   (Fastify)      │      │   + pgvector    │
│   localhost:3000│◄────►│   localhost:3001 │◄────►│   localhost:5432│
│                 │      │                  │      │                 │
│  - Auth/NextAuth│      │  - MCP tools     │      │  - Users        │
│  - Dashboard    │      │  - REST API      │      │  - Palaces      │
│  - API Key Mgmt │      │  - Embeddings    │      │  - Memories     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         ▲                                              ▲
         │                                              │
         └────────────── Same DB ───────────────────────┘
```

Both the web app and MCP server connect to the **same PostgreSQL database**. The web app uses Prisma for auth/user tables; the server uses raw SQL for memory/vector tables.
