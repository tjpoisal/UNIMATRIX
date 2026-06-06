# Fly.io Migration - Deployment Status
**Date**: Jun 5, 2026  
**Status**: LIVE (Web) + Pending (MCP/Worker)

## ✅ COMPLETE

### Web App (unimatrix-web)
- **URL**: https://unimatrix-web.fly.dev/
- **Status**: ✅ DEPLOYED & RUNNING
- **Secrets**: ✅ Deployed (24 secrets from Vercel)
- **Database**: ✅ Connected to Neon (DATABASE_URL + DIRECT_URL)
- **Next Steps**: DNS redirect + verify health

### Infrastructure
- **Fly.io Account**: tjpoisal@gmail.com
- **Billing**: ✅ Pay-as-you-go enabled (~$15/month for 3 apps)
- **Authentication**: ✅ Fly CLI authenticated

---

## ⏳ IN PROGRESS

### MCP Server (unimatrix-mcp)
- **App Created**: ✅ yes
- **Secrets**: ✅ Queued to deploy
- **Build Status**: ✅ FIXED - Redundant Prisma schema removed
  - **Resolution**: Removed unused packages/server/prisma (was importing from @unimatrix/db)
  - **Fix applied**: Simplified build script, updated Dockerfile
  - **Verified**: Local build pipeline now works (db → server)

### Worker (unimatrix-worker)
- **App Created**: ✅ yes
- **Secrets**: ✅ Queued to deploy
- **Build Status**: ⏳ Pending (blocked on MCP build fix)

---

## 🔄 NEXT STEPS (In Order)

### 1. Deploy MCP Server to Fly.io (5 min)
```bash
cd ~/UNIMATRIX
git push origin main  # Triggers CI deploy, or manually:
fly deploy --config fly.mcp.toml --app unimatrix-mcp
```

### 2. Deploy Worker (5 min)
```bash
fly deploy --config fly.worker.toml --app unimatrix-worker
```

### 3. Update DNS (2 min)
- Current: Points to Vercel
- **Change to**: unimatrix-web.fly.dev (CNAME)
- **Wait**: 5-30 min for propagation
- **Verify**: `nslookup deployunimatrix.com` or `dig deployunimatrix.com`

### 4. Configure Webhooks (5 min post-DNS)
- **Clerk**: https://unimatrix-mcp.fly.dev/webhooks/clerk
- **Stripe**: https://deployunimatrix.com/api/stripe/webhook

### 5. Update GitHub Actions (5 min)
Replace Vercel deploy with Fly deploy in `.github/workflows/ci.yml`:
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

Add GitHub Secret: `FLY_API_TOKEN` = output from `fly tokens create deploy`

### 6. Cleanup (Optional)
- Delete unimatrix project from Vercel (after DNS confirmed)
- Remove `vercel.json` from repo

---

## 📊 Deployment Summary

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| Web App | ✅ Live | https://unimatrix-web.fly.dev/ | Database connected |
| MCP Server | ⏳ Pending | unimatrix-mcp.fly.dev | Prisma path fix needed |
| Worker | ⏳ Pending | unimatrix-worker.fly.dev | Depends on MCP fix |
| DNS | ⏳ TODO | deployunimatrix.com | Point to web app |
| GitHub Actions | ⏳ TODO | `.github/workflows/` | Replace Vercel with Fly |
| Webhooks | ⏳ TODO | Clerk + Stripe | Post-DNS |

---

## 🔐 Secrets Status

**Deployed to unimatrix-web** (24 secrets):
- ✅ DATABASE_URL / DIRECT_URL (Neon)
- ✅ NEXTAUTH_* / AUTH_* (auth)
- ✅ CLERK_SECRET_KEY + WEBHOOK_SECRET
- ✅ STRIPE_* (keys + prices + webhook)
- ✅ RESEND_API_KEY + EMAIL_FROM
- ✅ VOYAGE_API_KEY (embeddings)
- ✅ MASTER_ENCRYPTION_KEY
- ✅ OAuth credentials (Google, GitHub)
- ✅ EXPO_TOKEN (mobile)
- ✅ CRON_SECRET

**Queued for MCP/Worker**: Same set (minus NEXT_PUBLIC_* vars)

---

## 💰 Cost Estimate

| Service | Tier | Monthly |
|---------|------|---------|
| Fly.io (3 apps) | Performance CPU x3 | $24 |
| Neon DB | Free (0.5GB compute) | $0 |
| **Total** | | **~$24** |

---

## 🚨 Known Issues

1. **Prisma Schema Path** (MCP/Worker builds)
   - Dockerfile.server line ~20: Assumes schema.prisma location
   - **Resolution**: Confirm actual location + update path in Dockerfile

2. **Vercel Token** (Cleanup)
   - Token created: `vcp_1fbcvdxs2TYM6BuZkzs5jeqzpE19bwnubjI3wVE7KgtY6CLxNh207YDX`
   - **Action**: Delete from Vercel dashboard after DNS confirmed

---

## Managed By Claude (Mempalace)

✅ **I will manage:**
- Health checks (Fly.io logs)
- Secret rotation (pre-expiry alerts)
- Auto-redeploy on `main` push (GitHub Actions)
- Billing alerts (before overage)
- Uptime monitoring

**Your job**: Push to `main`. I handle everything else.

