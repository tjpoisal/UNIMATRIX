# Unimatrix Deployment Guide

**Current target: Fly.io** (best for persistent long-lived processes, WS Collab, dedicated MCP server, background worker).

**Complete deployment guide:** See `DEPLOYMENT_FLY.md` for step-by-step instructions with all secrets and configuration.

**Quick start:**
```bash
# Install flyctl and login
curl -L https://fly.io/install.sh | sh
fly auth login

# Run pre-deploy checks
chmod +x scripts/predeploy-check.sh
./scripts/predeploy-check.sh

# Deploy all services
chmod +x scripts/fly-deploy.sh
./scripts/fly-deploy.sh all
```

**Services deployed:**
- `unimatrix-web` - Next.js dashboard + WebSocket Collab Room
- `unimatrix-mcp` - Fastify MCP server (what LLMs connect to)
- `unimatrix-worker` - Background job processor (embeddings, summarization)

**Configuration files:**
- `fly.web.toml` - Web app config (performance CPU, 2GB RAM)
- `fly.mcp.toml` - MCP server config (performance CPU, 2GB RAM, 2 CPUs)
- `fly.worker.toml` - Worker config (shared CPU, 512MB RAM)

**Best services stack:**
- **Database**: Neon Postgres (serverless, pgvector)
- **Realtime**: Ably (managed, scales better than raw WS)
- **Jobs**: Upstash QStash (recommended) or polling worker
- **Embeddings**: Voyage AI
- **Auth**: Clerk (MCP) + NextAuth (web)
- **Email**: Resend
- **Payments**: Stripe

## Why We Moved Away From Vercel (and why it's hard to go back)

Vercel was the original home, and parts of the app still work there:

- The web dashboard, auth, REST APIs, and the **HTTP-based MCP endpoint** (`/api/mcp` route handler) can run on Vercel. This is a serverless-friendly JSON-RPC implementation of the MCP protocol.
- For realtime on Vercel, we have the **Ably adapter** (`lib/realtime/ably.ts` + collab system) as the recommended path (no long-lived connections needed in functions).

**The reasons we can't easily use Vercel for the full product:**

1. **Long-lived WebSocket connections for Collab Room**  
   The real-time multi-LLM collaboration room requires persistent WebSocket connections (`/ws/collab` with room-based broadcasting, using the custom `server.ts` + `ws` library + optional Redis pub/sub for scaling).  
   Vercel's serverless/Edge Functions have strict timeouts and do not support raw HTTP upgrade for WebSockets in the same process as a long-running Node server. Connections get dropped.

2. **Custom server architecture**  
   We use `apps/web/server.ts` (creates an `http.Server`, attaches Next.js request handler + WebSocketServer for upgrade handling). Production start is `node dist/server.js`.  
   Vercel does not run custom servers this way in production. Their platform expects standard `next build` + their managed serverless runtime.

3. **Persistent / always-on MCP server + background jobs**  
   The core product is the dedicated MCP server (`packages/server` — Fastify) that LLMs connect to for `remember`/`recall` etc.  
   The background **worker** processes heavy work (Voyage embeddings, summarization, space classification, AgentRun tracking).  
   Serverless functions are ephemeral and have duration limits. True persistent processes + background workers are a poor fit (you'd need external queues like Inngest + Vercel Cron, losing simplicity).

4. **Separate services + persistent memory vision**  
   The goal is a reliable "memory layer" that LLMs can connect to from anywhere, with real-time collab across devices/LLMs. This requires long-lived containers, not functions that spin up/down.

**Bottom line:**  
If your main need is just the dashboard + the HTTP `/api/mcp` for occasional tool calls, Vercel still works fine (and the old `vercel.json` + `/api/mcp` route are there).  

For the full vision (persistent MCP, real WebSocket Collab Room, background processing, dedicated always-on services), we need platforms that run traditional Node processes: Render, Railway, Fly.io, or a VPS with Docker.

This is exactly why the custom server, Dockerfiles, and worker were built, and why we have `DEPLOYMENT.md` with alternatives.

**Strongly recommended DB:** Keep using your existing **Neon Postgres** (with pgvector). It works from anywhere and you don't need to migrate the database when switching hosts.

## Alternative Platforms

### Railway (Alternative - if billing resolved)

See `RENDER.md` for Railway deployment instructions. The configuration is similar to Render with Dockerfiles.

### Self-Hosted VPS + Docker Compose (Cheapest / full control)

If you want to avoid PaaS billing surprises entirely:

1. Get a cheap VPS (Hetzner Cloud CPX11 or similar ~€3-6/mo, Ubuntu 22.04/24.04, 2GB+ RAM recommended).
2. Install Docker + Docker Compose.
3. `git clone` this repo on the VPS.
4. Create a `.env` (or `.env.local`) with your real production secrets (especially the Neon `DATABASE_URL`/`DIRECT_URL` and all auth keys).
5. Run:
   ```bash
   docker compose up -d --build
   ```
6. For production HTTPS + routing:
   - Install **Caddy** (easiest) or Nginx.
   - Simple Caddyfile example:
     ```
     yourdomain.com {
         reverse_proxy localhost:3000
     }

     mcp.yourdomain.com {
         reverse_proxy localhost:3001
     }
     ```
7. The worker can run as a separate container (see the compose file) or as a systemd service.
8. Use Docker restart policies (`restart: unless-stopped`) + healthchecks (already in the Dockerfiles/compose).
9. Set up basic monitoring (UptimeRobot pinging `/api/health` and `/health`).

This setup uses exactly the Dockerfiles and `docker-compose.yml` that were created for the migration.

**Pros:** Cheapest long-term, no platform lock-in.
**Cons:** You handle OS updates, SSL (Caddy makes this trivial), and basic ops.

### Other Options
- DigitalOcean App Platform (very similar to Render/Railway — use the Dockerfiles).
- Coolify (install on a VPS — gives you a nice Render-like UI on your own hardware).
- Keep Vercel for the *web* frontend only and run the MCP server + worker elsewhere (possible but more split).

## Important Notes for Any Platform

- **Database stays on Neon** — just point `DATABASE_URL` + `DIRECT_URL` at it. This is already the recommended setup.
- **MCP endpoint** for Claude Desktop / Cursor etc.: Point them at whichever service is running `packages/server` (usually on its own domain or port).
- **WebSocket Collab Room**: Works on any platform that supports long-lived connections (Railway, Fly, VPS/Docker all do). The `apps/web/server.ts` handles this.
- **Background jobs**: The worker (`node dist/worker.js` or the dedicated service) processes embeddings, summarization, space classification, etc.
- **Health checks**:
  - Web: `GET /api/health`
  - MCP: `GET /health`
- Update any hardcoded old Vercel URLs in client configs or docs to your new URLs.

## Environment Variables Checklist

See `RENDER.md` (or the old Render section) for the full lists. The critical ones are the same across platforms.

## Local Development (unchanged)
```bash
docker compose up --build
```
Web on 3000, MCP on 3001 (by default in compose).

## What to Do Next

1. Follow the complete Fly.io deployment guide in `DEPLOYMENT_FLY.md`
2. Deploy the three services (web, mcp, worker)
3. Copy your secrets (especially from Neon + auth keys)
4. Update your MCP client configs and any custom domains
5. Test the health endpoints and a memory write/read via MCP

The hard engineering work (custom server, Docker, worker, schema/bridge work, etc.) is already done. Deploying to Fly.io is now mostly wiring + env vars.

**Ready-made config files in this repo:**
- `fly.web.toml` + `fly.mcp.toml` + `fly.worker.toml` — pre-configured for deployment
- `scripts/fly-deploy.sh` — automated deployment script
- `scripts/predeploy-check.sh` — pre-deploy validation
- `DEPLOYMENT_FLY.md` — complete step-by-step guide
