# Unimatrix — Accounts & Secrets Setup Guide (Best Services for Fly.io)

> **DIRECT ANSWER TO YOUR QUERY**  
> "TAKE THAT LIST [your pasted Vercel env block], AND SUBTRACT EVERYTHING YOU HAVE SECRETS FOR OR IS CONNECTED PROPERLY, LEAVING ONLY WHAT NEEDS SECRETS AND CONNECTIONS LEFT"

This doc + the Fly tomls + scripts + code wiring = the "setup the best services" you asked for.

---

## REMAINING DELTA — ONLY THESE FROM YOUR PASTED VERCEL LIST STILL NEED ACTION

**Your full pasted list (reconstructed from the message):**  
AUTH_URL, EXPO_TOKEN, STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY, STRIPE_PRICE_ENTERPRISE_MONTHLY, STRIPE_PRICE_ENTERPRISE_YEARLY, RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, NEXT_PUBLIC_API_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, AUTH_SECRET, DATABASE_URL, GITHUB_CLIENT_SECRET, GITHUB_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, CLERK_WEBHOOK_SECRET, NODE_ENV, MASTER_ENCRYPTION_KEY, VOYAGE_API_KEY, CLERK_SECRET_KEY (plus any close variants like STRIPE_WEBHOOK_SECRET, DIRECT_URL, CRON_SECRET that appeared in your Vercel).

### SUBTRACTED (everything we have secrets support + code connections + docs for — reusable from your Vercel/Neon/etc.)
These are **fully wired** (process.env reads in the right packages/apps), listed in `.env.example`, explained with "how to get" + generation + `fly secrets set` examples here and in DEPLOYMENT.md/CLAUDE.md, and the values you already have (or can copy) from Vercel dashboards + Neon project work directly on Fly:

- DATABASE_URL (and DIRECT_URL)
- CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET
- VOYAGE_API_KEY
- MASTER_ENCRYPTION_KEY (generate locally if you don't have the exact hex value from Vercel: `openssl rand -hex 32`)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
- RESEND_API_KEY
- EMAIL_FROM
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- NEXTAUTH_SECRET, AUTH_SECRET (generate: `openssl rand -base64 32`)
- NODE_ENV
- (STRIPE_WEBHOOK_SECRET if it was in your paste — code uses it at apps/web/app/api/stripe/webhook/route.ts)

**For all the above:** just `fly secrets set KEY=the-value-you-already-have --app unimatrix-web` (or -mcp / -worker as appropriate — web gets the NextAuth/Stripe/Resend/OAuth ones; mcp+worker get DB/Clerk/Voyage/Master/encryption). Reusable cross-platform, no new accounts needed for these keys themselves.

### WHAT REMAINS (the only items from your list that still need secrets created or connections made)
These are the **only** ones left after the subtraction:

1. **EXPO_TOKEN**
   - Why still here: You have no Expo token value yet (or it's not a runtime secret the apps read — it's consumed by `eas` CLI / GitHub Actions / your build machine for publishing the React Native app).
   - Needs new account + secret: Yes.
   - Action:
     - Go to https://expo.dev (free)
     - Account → Access Tokens → Create (choose "Read & Write" or appropriate scope for builds)
     - Copy the token (expo_...)
     - Store it in your EAS dashboard / CI secrets / local shell when running `eas build`. Not typically `fly secrets` (unless you run mobile builds on a Fly machine).
   - Also set for the app: `EXPO_PUBLIC_API_URL=https://unimatrix-web.fly.dev/api` (in eas.json or build env).

2. **STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY, STRIPE_PRICE_ENTERPRISE_MONTHLY, STRIPE_PRICE_ENTERPRISE_YEARLY** (the 4 price IDs)
   - Why still here: Your Vercel may have had the IDs, but the *resources* (Stripe Price objects) are what matter. The keys themselves are not generic "API keys" — they are specific `price_xxx` strings created under your products.
   - Needs: Create the 4 recurring prices (even if you have STRIPE_SECRET_KEY).
   - Action (easiest):
     ```bash
     STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.js
     ```
     It creates the Pro + Enterprise products + the 4 prices and **prints the IDs** (the Vercel parts are optional and will be skipped if no VERCEL_TOKEN).
   - Or manual: Stripe Dashboard → Products → +Add product (name "Unimatrix Pro", description..., recurring price $9/mo + $79/yr; same for Enterprise $29/$299). Copy the four `price_...` IDs.
   - Then: `fly secrets set STRIPE_PRICE_PRO_MONTHLY=price_xxx ... --app unimatrix-web` (only web needs the price IDs for checkout).

3. **NEXTAUTH_URL, AUTH_URL, NEXT_PUBLIC_API_URL** (and related NEXT_PUBLIC_APP_URL)
   - Why still here: These are **not secrets you "have" from Vercel anymore** for the new hosting — their *values* are the Fly hostnames you only receive after you create the apps and do the first deploy.
   - Needs connection after platform provisioning.
   - Action (post first deploy):
     ```bash
     # After ./scripts/fly-deploy.sh web  (or the cp + fly deploy)
     # Note the hostname Fly assigned, usually unimatrix-web.fly.dev (or a custom domain)
     fly secrets set \
       NEXTAUTH_URL=https://unimatrix-web.fly.dev \
       AUTH_URL=https://unimatrix-web.fly.dev \
       NEXT_PUBLIC_API_URL=https://unimatrix-web.fly.dev/api \
       NEXT_PUBLIC_APP_URL=https://unimatrix-web.fly.dev \
       --app unimatrix-web
     ```
     Update any mobile .env or EAS build envs with the prod EXPO_PUBLIC_API_URL too.
     (MCP clients will point at the mcp app URL, not these.)

**Also note for webhook / cron secrets you may have in the list (or in full Vercel dump):**
- CLERK_WEBHOOK_SECRET: you may have/copy the value, but **must connect** the endpoint in Clerk dashboard → Webhooks → Endpoint URL = `https://unimatrix-mcp.fly.dev/webhooks/clerk` (post-deploy) to obtain/validate the whsec_.
- STRIPE_WEBHOOK_SECRET (used by apps/web/app/api/stripe/webhook/route.ts): configure endpoint in Stripe dashboard (Developers → Webhooks) pointing at your prod `https://unimatrix-web.fly.dev/api/stripe/webhook`.
- CRON_SECRET (if present; used by internal /api/cron/* routes): generate locally (`openssl rand -base64 32`), set on web app. Protects scheduled jobs (no external account needed).

If any other obscure var from your paste isn't listed here (e.g. SVIX), it's optional/legacy and not required for core Fly + best stack.

---

## 1. Accounts You Must Create / Sign Up For (Best Stack)

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

### 1.9 Expo (Mobile App Builds) — one of the few items that remained in the delta
- **Sign up**: https://expo.dev (free) under the same account that owns the project (tjpoisal).
- **Existing EAS project**: We are using ID `a93ce64a-bd02-4777-a432-35f72349253d` (the one in your command).
- **What you get**: `EXPO_TOKEN` (long-lived token for non-interactive `eas build` in CI or local scripts).
- **How to link + build (CRITICAL: EAS must see the correct project dir — apps/mobile — or you get wrong bundle IDs, missing autolinking errors, and 30MB+ wrong uploads of the whole monorepo)**:
  1. From monorepo root **always use the pnpm aliases** (they ensure correct CWD inside apps/mobile via --filter):
     - `pnpm mobile:eas:login`
     - `pnpm mobile:eas:init`   (uses --id a93ce64a-bd02-4777-a432-35f72349253d)
     - `pnpm mobile:build:all`   (or mobile:build:ios / mobile:build:android / mobile:build:prod / mobile:build:preview)
  2. For extra EAS flags (e.g. --non-interactive, --wait, --local): 
     `pnpm --filter mobile exec npx eas-cli@latest build --platform all --profile production --non-interactive`
  3. Never run raw `npx eas-cli@latest ...` while your shell is in the monorepo root. It generates bad root config and uploads the entire monorepo (33MB+).
  3. (Configs were pre-cleaned + updated after your last run: bundleIdentifier + package now `com.tjpoisal.unimatrix` to match the IDs you chose in the prompts, versionCode bumped, EXPO_PUBLIC_API_URL injected per profile for the Fly backend, .easignore added.)
  4. Create / use `EXPO_TOKEN`: Expo dashboard → Access Tokens for the @tjpoisal/unimatrix project. Then `EXPO_TOKEN=xxx pnpm mobile:build:all`.
- **What happened in your last `npx ... build --platform all` run (from root)**: It created root eas.json + app.json, detected the old ./unimatrix/ skeleton (from prior create-expo-app), started an Android build with the new package + cloud keystore, asked for iOS bundle (you picked com.tjpoisal.unimatrix), then failed on iOS with "Cannot find 'expo-modules-autolinking'" because the build context/CWD was wrong (no proper expo in the tarball). We cleaned the root junk and ./unimatrix/ dir.
- **API URL**: 
  - Local dev: `EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000/api pnpm --filter mobile start`
  - EAS builds: wired in apps/mobile/eas.json (production/preview point to Fly once web is live).
- **Set EXPO_TOKEN** for CI or one-off: as above. Also set in GitHub repo secrets if using the .eas/workflows you started.
- **iOS IMPORTANT (Apple Developer fee)**: Real iOS builds for physical devices or App Store submission require a paid Apple Developer Program membership ($99 USD/year). You currently cannot afford this fee, so:
  - `pnpm mobile:build:ios` (and iOS part of :all) now uses the "preview" profile → simulator-only builds (free, works without membership).
  - Full production iOS (signed .ipa for devices/store) and the submit section are disabled/placeholders until you obtain membership.
  - Android production builds are fully supported with no extra fee.
  - For iOS testing: use simulator via the alias, or Expo Go (limited, no custom native modules easily).
  - When you can afford membership: fill TEAM_ID_PLACEHOLDER in eas.json, run interactive `pnpm exec eas credentials:configure-build --platform ios --profile production` (login with tjpoisal@gmail.com + app-specific password), then switch iOS back to production profile.
- Check the dashboard at https://expo.dev for the status of the Android build that was queued.

(The other remaining delta items (STRIPE_PRICE_* and the post-deploy NEXTAUTH_URL etc.) are independent of this.)

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

See the **REMAINING DELTA** section at the top for the exact subtraction from your pasted Vercel list (only EXPO_TOKEN + the 4 STRIPE_PRICE_* + the post-deploy URL vars remain as things that still need secrets created or connections made). Everything else you already have values for and is wired.

This list + the updated `DEPLOYMENT.md` + `scripts/fly-deploy.sh` + tomls + the code changes (Prisma in server, custom server.ts + WS, worker + AgentRun, Ably/Upstash paths, mcp-bridge + /settings/mcp-tokens UI, etc.) = the full "JUST SETUP THE BEST SERVICES" + "HANDLE SETTING EVERYTHING UP".

Run the deploy commands (`fly auth login`, create apps, `./scripts/fly-deploy.sh all`, then the `fly secrets set` using values from the delta + your existing ones) and you're live with the optimal persistent stack (Fly perf machines + Neon + Ably preferred for Collab + Voyage + QStash-ready). Let me know the first deploy output if any issues!