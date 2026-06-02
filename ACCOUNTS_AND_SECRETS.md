# Unimatrix — Accounts & Secrets Setup Guide (Best Services for Fly.io)

This is the **complete list** of accounts you need to create and secrets to configure for the best possible production setup on **Fly.io** (persistent, low-latency, scalable).

**Core Philosophy for "Best" Setup**:
- **Fly.io** — Persistent Machines (performance CPU for MCP/web, shared for worker). Global, autoscaling, cheap for always-on.
- **Neon** — Serverless Postgres + pgvector (best for AI embeddings, branching, scale-to-zero).
- **Clerk** — Modern auth for MCP tokens/server (webhooks, JWTs).
- **Ably** — Best-in-class realtime for Collab Room (presence, history, auth, scales without you managing WS/Redis).
- **Upstash** — Redis (rate limiting, pubsub) + QStash (reliable background jobs instead of polling).
- **Voyage AI** — High-quality embeddings for semantic memory.
- **Stripe + Resend** — Standard for payments/email.
- **OAuth** — Google + GitHub.
- **Expo** — For mobile builds.
- **All secrets** managed via `fly secrets` (never in code or .env in prod).
- **Prisma** — Pure open-source client (direct Neon connection, **no** Prisma Accelerate signup or "prisma://" URL needed — ignore all marketing tips during `prisma generate`).

**No accounts needed for**: Local dev (use .env with test keys), basic Prisma (free OSS only).

## 1. Accounts You Must Create / Sign Up For

### 1.1 Fly.io (Hosting — The Main Platform)
- **Why**: Runs your persistent web (with WS Collab), MCP server, and worker. Best for long-lived connections (unlike Vercel serverless).
- **Sign up**: https://fly.io (free tier generous).
- **What you get**:
  - App names: `unimatrix-web`, `unimatrix-mcp`, `unimatrix-worker`.
  - Deploy with `fly deploy` or `./scripts/fly-deploy.sh`.
- **Secrets to set on Fly** (see section 2):
  - All production ones via `fly secrets set KEY=val --app <app-name>`.
- **Best practices**: Use `performance` machines for MCP (low latency LLM calls) and web (WS). See `fly.*.toml`.

### 1.2 Neon (Database)
- **Why**: Serverless Postgres with native pgvector for embeddings/librarian jobs. Branching, scale-to-zero, excellent with Prisma. **Best** for this AI memory use case.
- **Sign up**: https://neon.tech (free tier is solid for start).
- **What you get**:
  - `DATABASE_URL` (pooled, for app).
  - `DIRECT_URL` (direct, for migrations/prisma).
- **How to get**:
  1. Create project (choose region close to your Fly primary, e.g. us-east).
  2. Copy connection strings (pooled + direct).
  3. Enable pgvector if not default: `CREATE EXTENSION IF NOT EXISTS vector;`
- **Set on Fly**: As secrets on all apps.
- **Note**: Keep using this — no need for Fly Postgres.

### 1.3 Clerk (Auth for MCP Server & Tokens)
- **Why**: Handles MCP tokens, user verification for server, webhooks. Modern, secure for API/LLM use. (Web uses NextAuth during hybrid transition.)
- **Sign up**: https://clerk.com (free tier good).
- **What you get**:
  - `CLERK_SECRET_KEY` (sk_... or sk_test_...).
  - `CLERK_WEBHOOK_SECRET` (whsec_...).
- **How**:
  1. Create app in Clerk dashboard.
  2. Go to API Keys → Secret key.
  3. Webhooks → Add endpoint for `/webhooks/clerk` (user.created etc.) → copy signing secret.
- **Set on Fly**: On `unimatrix-mcp` and `unimatrix-worker`.
- **Best**: Use for all future auth unification.

### 1.4 Stripe (Payments & Subscriptions)
- **Why**: Tiered pricing (Pro/Enterprise monthly/yearly) for the app.
- **Sign up**: https://stripe.com (test mode free).
- **What you get**:
  - `STRIPE_SECRET_KEY` (sk_...).
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_...).
  - `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_ENTERPRISE_MONTHLY`, `STRIPE_PRICE_ENTERPRISE_YEARLY` (price_ IDs).
- **How**:
  1. Create products in Stripe dashboard (Pro, Enterprise).
  2. Create prices (monthly + yearly recurring).
  3. Or run `node scripts/setup-stripe.js` (after setting STRIPE_SECRET_KEY) to auto-create and print the PRICE_ vars.
- **Set on Fly**: On web app (and any that use checkout).
- **Note**: Use test keys in dev, live in prod.

### 1.5 Resend (Transactional Email)
- **Why**: Password resets, onboarding, notifications.
- **Sign up**: https://resend.com (free tier).
- **What you get**:
  - `RESEND_API_KEY` (re_...).
  - `EMAIL_FROM` (e.g. "Unimatrix <onboarding@resend.dev>" — verify domain later for prod).
- **How**: Dashboard → API Keys → Create. For prod, add custom domain.
- **Set on Fly**: On web app.

### 1.6 Voyage AI (Embeddings)
- **Why**: High-quality vector embeddings for semantic search, librarian classification, recall. **Best** specialized model for this.
- **Sign up**: https://voyageai.com (free credits to start).
- **What you get**: `VOYAGE_API_KEY`.
- **How**: Sign up → API Keys.
- **Set on Fly**: On mcp + worker (where embeddings run).

### 1.7 Google (OAuth)
- **Sign up / Console**: https://console.cloud.google.com (Google account required).
- **What you get**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **How**:
  1. Create OAuth 2.0 Client ID (Web application).
  2. Add authorized redirect URIs (your NEXTAUTH_URL + /api/auth/callback/google).
- **Set on Fly**: On web app.

### 1.8 GitHub (OAuth)
- **Sign up / Settings**: https://github.com/settings/developers (GitHub account).
- **What you get**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
- **How**:
  1. New OAuth App.
  2. Set Authorization callback URL to your NEXTAUTH_URL + /api/auth/callback/github.
- **Set on Fly**: On web app.

### 1.9 Expo (Mobile App Builds)
- **Sign up**: https://expo.dev (free).
- **What you get**: `EXPO_TOKEN` (for CI/EAS builds).
- **How**:
  1. Account → Access Tokens → Create (read-only or full for builds).
  2. For mobile: Set `EXPO_PUBLIC_API_URL` in mobile .env.
- **Set on Fly**: Only if you run mobile builds in CI on Fly (usually set in your Expo/EAS dashboard or CI secrets).
- **Also needed**: `EXPO_PUBLIC_API_URL` (your Fly web URL).

### 1.10 Ably (Best Realtime for Collab Room)
- **Why (best services)**: Managed WebSockets with presence, history, auth, fan-out. Far superior to raw WS + Redis for multi-LLM collab rooms. Scales without ops.
- **Sign up**: https://ably.com (free tier).
- **What you get**: `ABLY_API_KEY`.
- **How**: Dashboard → Apps → Create → Copy key.
- **Set on Fly**: On web app.
- **Code**: Already in `lib/realtime/ably.ts`. Prefer this over raw `/ws/collab` in prod (see `DEPLOYMENT.md`).

### 1.11 Upstash (Redis + Queues — Best for Caching/Background)
- **Why (best services)**: Serverless Redis (for rate limiting, pubsub fallback) + QStash (reliable, scheduled, queued background jobs — better than DB polling for worker).
- **Sign up**: https://upstash.com (free tier, generous).
- **What you get**:
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (for rate-limit + redis-pubsub).
  - QStash token (for worker queues — see code comments in lib/collab and handlers).
- **How**: Create Redis database + QStash project.
- **Set on Fly**: On web (Redis) and worker (QStash if used).

## 2. Locally Generated Secrets (No External Account)
Generate these locally with OpenSSL (or similar). Never commit.

```bash
# MASTER_ENCRYPTION_KEY (for encrypting user memories — 32 bytes hex)
openssl rand -hex 32

# NEXTAUTH_SECRET / AUTH_SECRET (for NextAuth sessions)
openssl rand -base64 32

# CRON_SECRET (for protecting /api/cron/* routes)
openssl rand -base64 32
```

Add to your local `.env` / `.env.local`.

**In prod (Fly)**: `fly secrets set MASTER_ENCRYPTION_KEY=... --app <app>`

## 3. Post-Deploy / Platform-Generated
Set these **after** your Fly apps are live (they depend on the deployed URLs).

- `NEXTAUTH_URL`: `https://unimatrix-web.fly.dev` (your Fly web app URL)
- `NEXT_PUBLIC_API_URL`: `https://unimatrix-web.fly.dev/api` (for mobile/clients)
- `NEXT_PUBLIC_APP_URL`: `https://unimatrix-web.fly.dev` (for links in emails/notifications)
- `AUTH_URL`: Same as NEXTAUTH_URL (or your auth base)

**How to set on Fly**:
```bash
fly secrets set NEXTAUTH_URL="https://unimatrix-web.fly.dev" --app unimatrix-web
# etc for all apps that need them
```

Update your MCP client configs (Claude Desktop etc.) with the new MCP URL + a token from the web UI.

## 4. Full .env Template (Local Dev)
See `.env.example` (updated in this setup). Copy to `.env.local` and fill.

Key additions for **best** setup:
- `ABLY_API_KEY=...` (for Ably realtime)
- `UPSTASH_REDIS_REST_URL=...`
- `UPSTASH_REDIS_REST_TOKEN=...`
- `EXPO_PUBLIC_API_URL=http://localhost:3000/api` (local); prod = your Fly URL
- `CRON_SECRET=...`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

**For Fly production**: Do **NOT** use a .env file. Use `fly secrets set` for everything sensitive. Set non-sensitive (NODE_ENV=production) in your `fly.*.toml` `[env]`.

## 5. Quick "Best Setup" Checklist for Fly.io
1. Create all accounts above.
2. Get all keys/secrets.
3. Generate local secrets.
4. `fly apps create ...` for the three apps.
5. `./scripts/fly-deploy.sh all` (or manual with tomls).
6. `fly secrets set ...` for each app (full list in DEPLOYMENT.md).
7. Test health: `curl https://unimatrix-mcp.fly.dev/health`
8. Generate MCP token in web UI → test with Claude Desktop pointing to Fly MCP URL.
9. (Optional but best) Set up Ably + QStash for prod realtime/jobs.
10. Monitor: Fly dashboard + logs. Scale machines as needed.

## Notes
- **Prisma**: Pure free client. Use direct Neon URLs. Ignore all "sign up for Accelerate" or "get hosted DB" prompts/tips — they are marketing. We use `PRISMA_HIDE_UPDATE_MESSAGE=true` in scripts.
- **No more Vercel/Render limitations**: Persistent processes on Fly = real WS Collab + always-on MCP + background worker.
- **Security**: All secrets via Fly (encrypted at rest). Rotate regularly. Use test keys in dev.
- **Cost optimization on Fly**: Use shared for web/worker when idle; performance only for MCP. Enable auto_stop in tomls.
- **Mobile**: Set EXPO_PUBLIC_API_URL to your Fly web URL. Use EXPO_TOKEN for EAS builds.

If a secret from your list (e.g. AUTH_URL, specific STRIPE_PRICE_*) isn't covered, it's likely an alias for one above (NEXTAUTH_URL, the price IDs from Stripe dashboard). Map it and set it.

This list + the updated `DEPLOYMENT.md` + `scripts/fly-deploy.sh` + tomls = everything is "set up" for the best possible run on Fly.io.

Run the deploy commands and you're live with the optimal stack. Let me know the first error/output if any!