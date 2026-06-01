# Unimatrix — Deployment Guide

## Architecture

```
Clerk (auth)
    │
    ├─► MCP Server  (Vercel serverless)   /mcp  /spaces  /webhooks/clerk
    │       │
    │       └─► PostgreSQL + pgvector   (Neon)
    │
    └─► Portal      (Vercel)             /  /dashboard  /memories  /spaces
```

Both the MCP server and the portal deploy to Vercel. The MCP server runs as
a serverless function via `api/index.ts`; all routes are rewritten to it via
`vercel.json`. The portal lives in `clerk-nextjs/` and is a separate Vercel project.

---

## 1. MCP Server → Vercel

### Steps
1. `vercel login` then `vercel link` in repo root
2. Set env vars in Vercel Dashboard → Settings → Environment Variables (see below)
3. `vercel --prod` from repo root
4. Copy the deployment URL (e.g. `https://unimatrix-flax.vercel.app`)
5. Add it to the portal's `NEXT_PUBLIC_MCP_URL` and Clerk webhook endpoint

### Required environment variables

| Variable                   | Where to get it                                           |
|----------------------------|-----------------------------------------------------------|
| `DATABASE_URL`             | Neon Dashboard → Connection string (pooled, sslmode=require) |
| `CLERK_SECRET_KEY`         | Clerk Dashboard → API Keys → Secret key (`sk_live_…`)    |
| `CLERK_WEBHOOK_SECRET`     | Clerk Dashboard → Webhooks → Signing secret (`whsec_…`)  |
| `VOYAGE_API_KEY`           | voyageai.com → API Keys                                   |
| `MASTER_ENCRYPTION_KEY`    | Generate: `openssl rand -hex 32`                          |
| `NODE_ENV`                 | `production`                                              |

### After deploy
1. Run migrations against your Neon database:
   ```sh
   psql $DATABASE_URL -f migrations/001_initial_schema.sql
   psql $DATABASE_URL -f migrations/002_indexes_security.sql
   psql $DATABASE_URL -f migrations/003_space_embeddings.sql
   ```
2. Seed default Wings:
   ```sh
   npx tsx scripts/seed-embeddings.ts
   ```
3. Register the webhook in Clerk Dashboard:
   - URL: `https://your-app.vercel.app/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret → set `CLERK_WEBHOOK_SECRET`

---

## 2. Next.js Portal → Vercel

### Steps
1. `vercel login` then in `clerk-nextjs/`: `vercel link`
2. Set env vars (see below)
3. `vercel --prod` from `clerk-nextjs/`

### Required environment variables (Vercel Dashboard → Settings → Environment Variables)

| Variable                            | Value                                                  |
|-------------------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys → Publishable key           |
| `CLERK_SECRET_KEY`                  | Clerk Dashboard → API Keys → Secret key                |
| `NEXT_PUBLIC_MCP_URL`               | `https://your-app.vercel.app` (no trailing slash)      |
| `MCP_SERVER_URL`                    | Same as above (server-side calls in RSC)               |

### Add Clerk redirect URLs
In Clerk Dashboard → Paths:
- Sign-in URL: `/`
- Sign-up URL: `/`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

Add your Vercel domain to Clerk's allowed origins.

---

## 3. Claude Desktop MCP Config

After deploy, users add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://your-app.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer <clerk_session_token>"
      }
    }
  }
}
```

---

## 4. Health check

```sh
curl https://your-app.vercel.app/health
# → {"status":"ok","version":"0.1.0"}
```

---

## 5. Local development

```sh
cp .env.example .env   # fill in real values
npm install
npm run dev            # tsx watch on port 3000
```

Health check: `curl http://localhost:3000/health`

Dev mode auth shortcut (sk_test_ keys only — never works in production):
```sh
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "x-user-id: <your-uuid>" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```
