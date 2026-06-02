# Unimatrix Deployment Guide (Render Alternatives)

**Note:** If you currently can't use Render (e.g. billing/owe money issues), use this guide instead. The architecture (custom Next.js server for persistent WebSockets + Collab Room, separate Fastify MCP server from `packages/server`, background worker for librarian/AgentRun jobs, Docker support) is fully portable.

**Strongly recommended DB:** Keep using your existing **Neon Postgres** (with pgvector). It works from anywhere and you don't need to migrate the database when switching hosts.

## Recommended Platforms (in order of ease for this stack)

### 1. Railway (Easiest "Render-like" experience)
Railway has excellent developer experience for monorepos, Docker, and long-running services. Very similar to Render.

**How to deploy:**

1. Go to [railway.app](https://railway.app), sign in, and connect this GitHub repo.
2. Create **two separate services** from the *same repo*:

   - **unimatrix-web**
     - Dockerfile: `Dockerfile.web`
     - Root directory: `.` (or the repo root)
     - Port: 3000
     - Environment variables (see list below). Set `NEXTAUTH_URL` to the public URL Railway gives this service.

   - **unimatrix-mcp** (the one LLMs actually connect to)
     - Dockerfile: `Dockerfile.server`
     - Root directory: `.`
     - Port: 3000
     - Environment variables for the MCP server (Clerk, Voyage, encryption key, etc.).

3. (Optional) Worker for background jobs:
   - Deploy a third service using `Dockerfile.server`.
   - Override the start command to: `node dist/worker.js` (or temporarily change the CMD in a copy of the Dockerfile).

4. Database: Use your existing Neon `DATABASE_URL` + `DIRECT_URL`. Paste them into the environment variables for both services. Do **not** create a new Postgres on Railway unless you want to.

5. Domains & scaling: Railway gives you `*.up.railway.app` URLs automatically. Add custom domains in the dashboard. Scale CPU/memory as needed.

**Environment variables** (copy from your current setup):
- Shared: `DATABASE_URL`, `DIRECT_URL` (from Neon), `NODE_ENV=production`
- Web: `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your web service public URL), Google/GitHub OAuth, `RESEND_API_KEY`, Stripe keys, etc.
- MCP: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `VOYAGE_API_KEY`, `MASTER_ENCRYPTION_KEY`

Railway will build the Dockerfiles when you point the services at them.

**Local development stays the same:** Your existing `docker-compose.yml` works (it already prefers remote Neon over the local `db` service).

### 2. Fly.io (Great for long-lived apps + often cheaper)
Fly.io is very strong for exactly this kind of workload (custom servers, WebSockets, background processes).

**How to deploy:**

1. Install `flyctl` and log in (`fly auth login`).
2. Create two apps:
   ```bash
   fly apps create your-unimatrix-web
   fly apps create your-unimatrix-mcp
   ```
3. Deploy using the Dockerfiles:
   ```bash
   fly deploy --dockerfile Dockerfile.web --app your-unimatrix-web
   fly deploy --dockerfile Dockerfile.server --app your-unimatrix-mcp
   ```
4. Set secrets (recommended over env in toml for sensitive values):
   ```bash
   fly secrets set DATABASE_URL=... DIRECT_URL=... --app your-unimatrix-web
   # repeat for all other keys
   ```
5. For the worker you can add it as another process/machine in one of the apps or a third app.

See the example `fly.web.toml` and `fly.mcp.toml` files in the repo root (copy/rename as needed and use `--config`).

**Database:** Use your Neon connection strings as secrets.

Fly has a generous free tier and is usually cheaper than Render for always-on services.

### 3. Self-Hosted VPS + Docker Compose (Cheapest / full control)
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

### 4. Other Options
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
1. Pick a platform (Railway is the smoothest transition if you liked Render's style).
2. Deploy the two Dockerfiles as separate services/apps.
3. Copy your secrets (especially from Neon + auth keys).
4. Update your MCP client configs and any custom domains.
5. Test the health endpoints and a memory write/read via MCP.

If you tell me **which platform** you want to use right now (Railway, Fly.io, VPS, DigitalOcean, etc.), I will immediately generate the exact additional config files (specific `fly.toml` files, Railway service templates, production Caddy config, deploy scripts, etc.) and walk through the precise commands.

The hard engineering work (custom server, Docker, worker, schema/bridge work, etc.) is already done. Switching hosts is now mostly wiring + env vars.

Which one do you want to go with? I'll execute the tailored files and updates right away.
**Ready-made config files in this repo (for the alternatives):**
- `fly.web.toml` + `fly.mcp.toml` — copy/rename and use with `fly deploy --config ...`
- `railway.toml` — reference for Railway (most config happens in the dashboard when pointing services at the Dockerfiles)
- `docker-compose.prod.yml` — override for VPS/production (`docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`)
- This `DEPLOYMENT.md` is the current primary guide when Render is not available.
