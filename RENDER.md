# Unimatrix — Render Deployment Guide

This document is the source of truth for deploying Unimatrix to Render.

## Architecture on Render

- **PostgreSQL**: Managed Postgres (with pgvector) via Render
- **unimatrix-mcp**: Core Fastify MCP server (`packages/server`) — this is what Claude Desktop, Cursor, etc. connect to
- **unimatrix-web**: Next.js portal + custom WebSocket server for Collab Room
- **(Optional) unimatrix-worker**: Background processor for embeddings, summarization, librarian jobs

## Quick Deploy (Recommended)

1. Push `render.yaml` (already in repo)
2. In Render Dashboard → **Blueprints** → New Blueprint Instance
3. Connect GitHub repo `tjpoisal/UNIMATRIX`
4. Fill required environment variables (see below)
5. Deploy

## Docker vs Native Node Runtime

We support both.

**Native Node (current default in render.yaml)**:
- Faster deploys
- Simpler

**Docker (recommended for production)**:
- Consistent builds between local and production
- Better for native long-lived WebSocket connections
- Easier to add native binaries if needed later

To switch to Docker, change the service definitions in `render.yaml` to:

```yaml
runtime: docker
dockerfilePath: ./Dockerfile.server   # or ./Dockerfile.web
```

## Environment Variables

### Required for `unimatrix-mcp`
- `CLERK_SECRET_KEY`
- `VOYAGE_API_KEY`
- `MASTER_ENCRYPTION_KEY` (32-byte hex)

### Required for `unimatrix-web`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your Render web URL after first deploy)
- Google / GitHub OAuth credentials
- `RESEND_API_KEY`
- Stripe keys

## Local Development with Docker (matches Render)

```bash
# Start everything (Postgres + MCP + Web)
docker compose up --build

# Web → http://localhost:3000
# MCP  → http://localhost:3001
```

Run migrations locally against the container DB:

```bash
docker compose exec web pnpm --filter web db:migrate:deploy
docker compose exec mcp-server pnpm --filter server db:migrate:deploy
```

## Health Checks

- Web: `GET /api/health`
- MCP:  `GET /health`

Both are implemented and used by Render.

## Scaling Notes

- The custom `server.ts` (WebSocket Collab) works great on a single Render instance.
- For horizontal scaling of Collab Rooms, prefer **Ably** (already partially integrated in `lib/realtime/ably.ts`) over raw `ws` + Redis.
- The MCP server is stateless (except for DB) and can scale horizontally easily.

## Worker / Background Jobs

See the commented worker service in `render.yaml`.

The worker skeleton lives at `packages/server/src/worker.ts`.

Future: Replace the simple loop with Trigger.dev, Inngest, or BullMQ + Redis.

## One-Command Local Parity

```bash
docker compose up --build
```

This is the closest you can get to production without deploying.
