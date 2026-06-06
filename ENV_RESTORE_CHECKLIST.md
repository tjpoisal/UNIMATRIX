# UNIMATRIX Environment Variables — Full Restore Checklist

## 🔴 CRITICAL: These are the secrets we extracted from Vercel but NOT YET deployed to Fly.io

**Extraction source**: Vercel API (project: prj_jnbSGZjsPuYBmJyjZh0trtLUKZGB)  
**Deployed to Fly.io**: Only the 4 STRIPE_PRICE_* + EXPO_TOKEN (5 total)  
**Missing on Fly.io**: All other 19 secrets below

---

## REQUIRED SECRETS (Get these values from your Vercel dashboard or original setup)

### DATABASE / AUTH (from Neon + Prisma)
- `DATABASE_URL` — Primary Neon connection (pooler, sslmode=require)
- `DIRECT_URL` — Direct Neon connection (for migrations)

### NextAuth / Auth Setup
- `NEXTAUTH_SECRET` — (generate: `openssl rand -base64 32` if lost)
- `NEXTAUTH_URL` — Will be `https://unimatrix-web.fly.dev` after DNS
- `AUTH_SECRET` — (generate: `openssl rand -base64 32` if lost)  
- `AUTH_URL` — Same as NEXTAUTH_URL

### Clerk Auth (webhooks + server-side validation)
- `CLERK_SECRET_KEY` — From Clerk Dashboard → API Keys (sk_live_...)
- `CLERK_WEBHOOK_SECRET` — From Clerk → Webhooks (whsec_...)

### Stripe (payments)
- `STRIPE_SECRET_KEY` — From Stripe Dashboard (sk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — From Stripe (pk_live_..., safe to expose)
- `STRIPE_PRICE_PRO_MONTHLY` — ✅ Already deployed (price_...)
- `STRIPE_PRICE_PRO_YEARLY` — ✅ Already deployed (price_...)
- `STRIPE_PRICE_ENTERPRISE_MONTHLY` — ✅ Already deployed (price_...)
- `STRIPE_PRICE_ENTERPRISE_YEARLY` — ✅ Already deployed (price_...)
- `STRIPE_WEBHOOK_SECRET` — From Stripe → Webhooks (whsec_...)

### Email (Resend)
- `RESEND_API_KEY` — From Resend Dashboard (re_...)
- `EMAIL_FROM` — e.g., "Unimatrix <onboarding@unimatrix.com>"

### OAuth (Google + GitHub)
- `GOOGLE_CLIENT_ID` — From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
- `GITHUB_CLIENT_ID` — From GitHub OAuth App settings
- `GITHUB_CLIENT_SECRET` — From GitHub OAuth App settings

### AI/Embeddings (Voyage)
- `VOYAGE_API_KEY` — From Voyage AI Dashboard

### Encryption + Security
- `MASTER_ENCRYPTION_KEY` — Hex-32 (generate: `openssl rand -hex 32` if lost)
- `CRON_SECRET` — Base64-32 (generate: `openssl rand -base64 32` if lost)

### Public URLs (set AFTER Fly.io DNS is configured)
- `NEXT_PUBLIC_API_URL` — Will be `https://unimatrix-web.fly.dev/api`
- `NEXT_PUBLIC_APP_URL` — Will be `https://unimatrix-web.fly.dev`

### Runtime
- `NODE_ENV` — `production`

---

## WHERE TO GET EACH VALUE

| Secret | Source | Status |
|--------|--------|--------|
| DATABASE_URL | Neon Dashboard → Connection strings | ❌ MISSING |
| CLERK_SECRET_KEY | Clerk Dashboard → API Keys → Secret | ❌ MISSING |
| STRIPE_SECRET_KEY | Stripe Dashboard → Developers → API Keys | ❌ MISSING |
| RESEND_API_KEY | Resend Dashboard → API Keys | ❌ MISSING |
| GOOGLE_CLIENT_ID/SECRET | Google Cloud → Credentials | ❌ MISSING |
| GITHUB_CLIENT_ID/SECRET | GitHub → Settings → Developer settings → OAuth Apps | ❌ MISSING |
| VOYAGE_API_KEY | Voyage AI Dashboard → API Keys | ❌ MISSING |
| NEXTAUTH_SECRET | **Generate**: `openssl rand -base64 32` | ❌ MISSING |
| MASTER_ENCRYPTION_KEY | **Generate**: `openssl rand -hex 32` | ❌ MISSING |
| CRON_SECRET | **Generate**: `openssl rand -base64 32` | ❌ MISSING |
| STRIPE_PRICE_* | ✅ Already on Fly.io | ✅ DONE |
| EXPO_TOKEN | ✅ Already on Fly.io | ✅ DONE |

---

## QUICK RESTORE (copy your values below, then deploy)

```bash
# 1. Fill in your actual values here:
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."
export NEXTAUTH_SECRET="..." # or generate with openssl
export AUTH_SECRET="..." # or generate
export CLERK_SECRET_KEY="sk_live_..."
export CLERK_WEBHOOK_SECRET="whsec_..."
export STRIPE_SECRET_KEY="sk_live_..."
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
export RESEND_API_KEY="re_..."
export EMAIL_FROM="Unimatrix <onboarding@unimatrix.com>"
export GOOGLE_CLIENT_ID="..."
export GOOGLE_CLIENT_SECRET="..."
export GITHUB_CLIENT_ID="..."
export GITHUB_CLIENT_SECRET="..."
export VOYAGE_API_KEY="..."
export MASTER_ENCRYPTION_KEY="..." # or generate: openssl rand -hex 32
export CRON_SECRET="..." # or generate: openssl rand -base64 32
export NODE_ENV="production"

# 2. Deploy all at once to unimatrix-web:
fly secrets set \
  DATABASE_URL="$DATABASE_URL" \
  DIRECT_URL="$DIRECT_URL" \
  NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  NEXTAUTH_URL="https://deployunimatrix.com" \
  AUTH_SECRET="$AUTH_SECRET" \
  AUTH_URL="https://deployunimatrix.com" \
  CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  CLERK_WEBHOOK_SECRET="$CLERK_WEBHOOK_SECRET" \
  STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
  STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \
  RESEND_API_KEY="$RESEND_API_KEY" \
  EMAIL_FROM="$EMAIL_FROM" \
  GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID" \
  GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET" \
  VOYAGE_API_KEY="$VOYAGE_API_KEY" \
  MASTER_ENCRYPTION_KEY="$MASTER_ENCRYPTION_KEY" \
  CRON_SECRET="$CRON_SECRET" \
  NODE_ENV="$NODE_ENV" \
  --app unimatrix-web

# 3. For MCP server (subset):
fly secrets set \
  DATABASE_URL="$DATABASE_URL" \
  DIRECT_URL="$DIRECT_URL" \
  MASTER_ENCRYPTION_KEY="$MASTER_ENCRYPTION_KEY" \
  CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  CLERK_WEBHOOK_SECRET="$CLERK_WEBHOOK_SECRET" \
  VOYAGE_API_KEY="$VOYAGE_API_KEY" \
  NODE_ENV="$NODE_ENV" \
  --app unimatrix-mcp

# 4. For Worker (same as MCP, minus CLERK_WEBHOOK_SECRET):
fly secrets set \
  DATABASE_URL="$DATABASE_URL" \
  DIRECT_URL="$DIRECT_URL" \
  MASTER_ENCRYPTION_KEY="$MASTER_ENCRYPTION_KEY" \
  CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  VOYAGE_API_KEY="$VOYAGE_API_KEY" \
  NODE_ENV="$NODE_ENV" \
  --app unimatrix-worker
```

---

## ⚠️ IF YOU DON'T HAVE THE VALUES

**Secrets that can be regenerated:**
- NEXTAUTH_SECRET: `openssl rand -base64 32`
- AUTH_SECRET: `openssl rand -base64 32`
- MASTER_ENCRYPTION_KEY: `openssl rand -hex 32`
- CRON_SECRET: `openssl rand -base64 32`

**Secrets from services (must retrieve):**
- DATABASE_URL / DIRECT_URL → Neon Dashboard
- CLERK_SECRET_KEY → Clerk Dashboard
- STRIPE_SECRET_KEY → Stripe Dashboard
- All OAuth secrets → Original provider dashboards
- VOYAGE_API_KEY → Voyage AI
- RESEND_API_KEY → Resend

**If you've lost them entirely:**
- Neon: Regenerate password/create new connection
- Clerk: Create new API key (old one revoked)
- Stripe: Rotate keys in Dashboard
- OAuth: Create new apps if credentials lost
- Resend: Create new API key

