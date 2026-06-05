# Unimatrix Fly.io Migration (Vercel → Fly.io)
**Status: IN PROGRESS**  
**Account**: tjpoisal@gmail.com  
**Date Started**: Jun 5, 2026

---

## STEP 1: Fly.io Billing (COMPLETE THIS NOW)

1. Go to https://dashboard.fly.io
2. Login with **tjpoisal@gmail.com**
3. Hit the credit limit warning
4. Select **"Pay as you go"** (enable on-demand billing)
5. Fly.io is **~$5-15/month** for three small apps (web + mcp + worker)

---

## STEP 2: Verify Apps Exist (or create them)

```bash
cd ~/UNIMATRIX
fly apps list
```

Expected output:
- `unimatrix-web`
- `unimatrix-mcp`
- `unimatrix-worker`

If missing, run:
```bash
fly apps create unimatrix-web
fly apps create unimatrix-mcp
fly apps create unimatrix-worker
```

---

## STEP 3: Set Secrets (Copy from Vercel or generate)

### 3.1 Get secrets from Vercel dashboard or existing setup

**From Neon (Database):**
```
DATABASE_URL=postgresql://DB_USER:REDACTED_DB_PASS@REDACTED_DB_HOST/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:REDACTED_NEON_PASSWORD@ep-frosty-wildflower-ap33hyav.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**From Clerk:**
- `CLERK_SECRET_KEY` (sk_live_... or sk_test_...)
- `CLERK_WEBHOOK_SECRET` (whsec_...)

**From Stripe:**
- `STRIPE_SECRET_KEY` (sk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- `STRIPE_PRICE_PRO_MONTHLY` (price_...)
- `STRIPE_PRICE_PRO_YEARLY` (price_...)
- `STRIPE_PRICE_ENTERPRISE_MONTHLY` (price_...)
- `STRIPE_PRICE_ENTERPRISE_YEARLY` (price_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)

**From Resend:**
- `RESEND_API_KEY` (re_...)
- `EMAIL_FROM` (e.g., "Unimatrix <onboarding@unimatrix.com>")

**From Voyage AI:**
- `VOYAGE_API_KEY` (...)

**From OAuth (Google/GitHub):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

**Generate (if not in Vercel):**
```bash
# NEXTAUTH_SECRET (generate once, reuse)
openssl rand -base64 32

# AUTH_SECRET (same or different)
openssl rand -base64 32

# MASTER_ENCRYPTION_KEY (for sensitive data encryption)
openssl rand -hex 32

# CRON_SECRET (for internal cron endpoints)
openssl rand -base64 32
```

### 3.2 Set on Fly.io

**For `unimatrix-web` (Next.js + Collab):**
```bash
fly secrets set \
  NODE_ENV=production \
  DATABASE_URL="postgresql://..." \
  DIRECT_URL="postgresql://..." \
  NEXTAUTH_URL=https://deployunimatrix.com \
  AUTH_URL=https://deployunimatrix.com \
  NEXT_PUBLIC_API_URL=https://deployunimatrix.com/api \
  NEXT_PUBLIC_APP_URL=https://deployunimatrix.com \
  NEXTAUTH_SECRET="<generated>" \
  AUTH_SECRET="<generated>" \
  MASTER_ENCRYPTION_KEY="<generated>" \
  CRON_SECRET="<generated>" \
  CLERK_SECRET_KEY="<sk_...>" \
  STRIPE_SECRET_KEY="<sk_live_...>" \
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<pk_live_...>" \
  STRIPE_PRICE_PRO_MONTHLY="<price_...>" \
  STRIPE_PRICE_PRO_YEARLY="<price_...>" \
  STRIPE_PRICE_ENTERPRISE_MONTHLY="<price_...>" \
  STRIPE_PRICE_ENTERPRISE_YEARLY="<price_...>" \
  STRIPE_WEBHOOK_SECRET="<whsec_...>" \
  RESEND_API_KEY="<re_...>" \
  EMAIL_FROM="Unimatrix <onboarding@unimatrix.com>" \
  GOOGLE_CLIENT_ID="<...>" \
  GOOGLE_CLIENT_SECRET="<...>" \
  GITHUB_CLIENT_ID="<...>" \
  GITHUB_CLIENT_SECRET="<...>" \
  --app unimatrix-web
```

**For `unimatrix-mcp` (Fastify MCP server):**
```bash
fly secrets set \
  NODE_ENV=production \
  DATABASE_URL="postgresql://..." \
  DIRECT_URL="postgresql://..." \
  MASTER_ENCRYPTION_KEY="<generated>" \
  CLERK_SECRET_KEY="<sk_...>" \
  CLERK_WEBHOOK_SECRET="<whsec_...>" \
  VOYAGE_API_KEY="<...>" \
  --app unimatrix-mcp
```

**For `unimatrix-worker` (Background jobs):**
```bash
fly secrets set \
  NODE_ENV=production \
  DATABASE_URL="postgresql://..." \
  DIRECT_URL="postgresql://..." \
  MASTER_ENCRYPTION_KEY="<generated>" \
  CLERK_SECRET_KEY="<sk_...>" \
  VOYAGE_API_KEY="<...>" \
  --app unimatrix-worker
```

---

## STEP 4: Deploy All Apps

```bash
cd ~/UNIMATRIX
chmod +x scripts/fly-deploy.sh

# Deploy web
./scripts/fly-deploy.sh web

# Deploy MCP server
./scripts/fly-deploy.sh mcp

# Deploy worker
./scripts/fly-deploy.sh worker
```

Monitor logs:
```bash
fly logs --app unimatrix-web
fly logs --app unimatrix-mcp
fly logs --app unimatrix-worker
```

---

## STEP 5: Update DNS (deployunimatrix.com)

After web deploys, Fly assigns hostname: `unimatrix-web.fly.dev`

**Update your domain registrar (GoDaddy, Namecheap, etc.):**

1. Go to DNS settings for `deployunimatrix.com`
2. Find **CNAME record** pointing to old Vercel domain
3. Change to: `unimatrix-web.fly.dev`
4. Save (takes 5-30 min to propagate)

**Verify:**
```bash
nslookup deployunimatrix.com
dig deployunimatrix.com CNAME
```

---

## STEP 6: Configure Webhooks (Post-Deploy)

**Clerk webhooks:**
1. https://dashboard.clerk.com → Webhooks
2. Add endpoint: `https://unimatrix-mcp.fly.dev/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, etc.
4. Copy webhook signing secret → `fly secrets set CLERK_WEBHOOK_SECRET=... --app unimatrix-mcp`

**Stripe webhooks:**
1. https://dashboard.stripe.com → Developers → Webhooks
2. Add endpoint: `https://deployunimatrix.com/api/stripe/webhook` (after DNS points to Fly)
3. Subscribe to: `payment_intent.succeeded`, `customer.subscription.created`, etc.
4. Copy signing secret → `fly secrets set STRIPE_WEBHOOK_SECRET=... --app unimatrix-web`

---

## STEP 7: GitHub Actions Auto-Deploy (Update CI)

Replace Vercel deployment in `.github/workflows/*.yml` with:

```yaml
- name: Deploy to Fly.io
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
  run: |
    curl -L https://fly.io/install.sh | sh
    fly deploy --app unimatrix-web
    fly deploy --app unimatrix-mcp
    fly deploy --app unimatrix-worker
```

**Add GitHub secret:**
1. https://github.com/tjpoisal/UNIMATRIX/settings/secrets/actions
2. Add `FLY_API_TOKEN` with value from `fly tokens create deploy`

---

## STEP 8: Verify All Apps Running

```bash
fly status --app unimatrix-web
fly status --app unimatrix-mcp
fly status --app unimatrix-worker

# Check endpoints
curl https://deployunimatrix.com/api/health
curl https://unimatrix-mcp.fly.dev/health
```

---

## Cleanup: Remove Vercel

1. Vercel dashboard: Delete `unimatrix` project
2. Remove `vercel.json` from repo (no longer needed)
3. Update docs/README to point to Fly.io

---

## Rollback Plan (if needed)

If Fly deployment fails:
1. Keep Vercel project alive for 24 hours
2. Revert DNS CNAME to Vercel
3. Use `git revert` to undo GitHub Actions changes
4. Investigate logs: `fly logs --app unimatrix-web`

---

## Cost Estimate

**Fly.io (3 apps):**
- Web (1x performance CPU, 1GB): ~$8/month
- MCP (1x performance CPU, 1GB): ~$8/month
- Worker (shared): ~$2/month (or $5 if dedicated)
- **Total: ~$15-18/month** (generous free tier may cover it)

**Neon (Database):**
- Free tier: 0.5GB compute, 3GB storage, shared infra ✅ (likely sufficient)
- Paid: ~$0.25/compute hour + $0.10/GB storage

---

## Managed By Claude (Mempalace)

Once deployed, I will:
✅ Monitor Fly.io app health (logs, uptime)
✅ Manage secrets rotation (Stripe API keys, etc.)
✅ Handle scaling/instance adjustments
✅ Auto-redeploy on GitHub pushes (via Actions)
✅ Manage DNS updates if needed
✅ Track billing and warn before limits

**Mempalace location:** `/unimatrix-prod-deployment`

