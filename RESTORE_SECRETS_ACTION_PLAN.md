# 🔄 SECRET RESTORATION ACTION PLAN

## STATUS
- ✅ **5 secrets already on Fly.io**: EXPO_TOKEN + 4x STRIPE_PRICE_*
- ❌ **19 secrets missing**: Everything else below

---

## STEP 1: Collect Your Secrets (5-10 minutes)

Go to each dashboard and copy your values. **If you don't have them, the brackets tell you how to regenerate/create them.**

### 1.1 Database (Neon)
**Where**: https://console.neon.tech → Your project → Connection string

```
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-...pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://neondb_owner:npg_...@ep-...-2024-11-29.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 1.2 NextAuth / Auth Secrets
**If you have them**: Copy from old .env or Vercel dashboard  
**If you DON'T have them**: Generate NEW ones (these can change):
```bash
openssl rand -base64 32  # Run this to generate NEXTAUTH_SECRET
openssl rand -base64 32  # Run this to generate AUTH_SECRET
```

```
NEXTAUTH_SECRET=<paste or generate>
AUTH_SECRET=<paste or generate>
```

### 1.3 Clerk (Authentication)
**Where**: https://dashboard.clerk.com → Your app → API Keys

```
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 1.4 Stripe (Payments)
**Where**: https://dashboard.stripe.com → Developers → API Keys

```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.5 Resend (Email)
**Where**: https://resend.com → API Keys

```
RESEND_API_KEY=re_...
EMAIL_FROM=Unimatrix <onboarding@unimatrix.com>
```

### 1.6 OAuth Credentials
**Google**: https://console.cloud.google.com → Credentials → OAuth 2.0 Client IDs

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**GitHub**: https://github.com/settings/developers → OAuth Apps → Your App

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 1.7 Voyage AI (Embeddings)
**Where**: https://voyageai.com → Account → API Keys

```
VOYAGE_API_KEY=...
```

### 1.8 Encryption Keys
**If you have them from before**: Paste below  
**If you DON'T have them**: Generate NEW ones:
```bash
openssl rand -hex 32      # MASTER_ENCRYPTION_KEY
openssl rand -base64 32   # CRON_SECRET
```

```
MASTER_ENCRYPTION_KEY=<paste or generate>
CRON_SECRET=<paste or generate>
```

---

## STEP 2: Fill In Your Values

**Option A: Edit the script directly**
```bash
nano ~/UNIMATRIX/scripts/restore-secrets.sh
# Find the "FILL IN YOUR VALUES HERE" section
# Replace each empty string with your actual values
# Save with Ctrl+X, then Y
```

**Option B: Set environment variables, then run**
```bash
export DATABASE_URL="postgresql://..."
export DIRECT_URL="..."
export NEXTAUTH_SECRET="..."
export AUTH_SECRET="..."
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
export MASTER_ENCRYPTION_KEY="..."
export CRON_SECRET="..."

# Then run:
./scripts/restore-secrets.sh
```

---

## STEP 3: Run the Restore Script

```bash
cd ~/UNIMATRIX
./scripts/restore-secrets.sh
```

**Expected output:**
```
✅ unimatrix-web secrets deployed
✅ unimatrix-mcp secrets deployed
✅ unimatrix-worker secrets deployed
```

---

## STEP 4: Verify Deployment

```bash
# Check unimatrix-web
fly secrets list --app unimatrix-web

# Check unimatrix-mcp
fly secrets list --app unimatrix-mcp

# Check unimatrix-worker
fly secrets list --app unimatrix-worker
```

You should see ~20 secrets on web, ~7 on mcp, ~6 on worker.

---

## REFERENCE: Where Each Secret Comes From

| Secret | Dashboard | Type | Generate If Missing |
|--------|-----------|------|---------------------|
| DATABASE_URL | Neon → Connections | Connection string | ❌ Must retrieve |
| DIRECT_URL | Neon → Connections | Connection string | ❌ Must retrieve |
| NEXTAUTH_SECRET | (previous .env or Vercel) | Auth | ✅ `openssl rand -base64 32` |
| AUTH_SECRET | (previous .env or Vercel) | Auth | ✅ `openssl rand -base64 32` |
| CLERK_SECRET_KEY | Clerk → API Keys | API Key | ❌ Must retrieve |
| CLERK_WEBHOOK_SECRET | Clerk → Webhooks | Webhook Secret | ❌ Must retrieve |
| STRIPE_SECRET_KEY | Stripe → Developers → API | API Key | ❌ Must retrieve |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe → Developers → API | Publishable Key | ❌ Must retrieve |
| STRIPE_WEBHOOK_SECRET | Stripe → Webhooks | Webhook Secret | ❌ Must retrieve |
| RESEND_API_KEY | Resend → API Keys | API Key | ❌ Must retrieve |
| EMAIL_FROM | (custom format) | Email | ✅ Use default provided |
| GOOGLE_CLIENT_ID | Google Cloud → Credentials | OAuth ID | ❌ Must retrieve |
| GOOGLE_CLIENT_SECRET | Google Cloud → Credentials | OAuth Secret | ❌ Must retrieve |
| GITHUB_CLIENT_ID | GitHub → Settings → OAuth Apps | OAuth ID | ❌ Must retrieve |
| GITHUB_CLIENT_SECRET | GitHub → Settings → OAuth Apps | OAuth Secret | ❌ Must retrieve |
| VOYAGE_API_KEY | Voyage AI → API Keys | API Key | ❌ Must retrieve |
| MASTER_ENCRYPTION_KEY | (previous .env or Vercel) | Encryption | ✅ `openssl rand -hex 32` |
| CRON_SECRET | (previous .env or Vercel) | Secret | ✅ `openssl rand -base64 32` |

---

## EMERGENCY: Secrets I Can't Retrieve

**These require you to have saved them or retrieve from the original service:**
- DATABASE_URL / DIRECT_URL
- Any STRIPE_* keys
- CLERK_SECRET_KEY / CLERK_WEBHOOK_SECRET
- RESEND_API_KEY
- All OAuth secrets
- VOYAGE_API_KEY

**What to do if you've lost them completely:**
1. **Neon**: Go to dashboard → reset password → create new connection string
2. **Stripe**: Rotate API keys in dashboard (old keys revoked)
3. **Clerk**: Create new API key (old one deleted)
4. **Resend**: Create new API key
5. **OAuth**: Create new apps on Google Cloud / GitHub (old credentials no longer work)
6. **Voyage**: Create new API key

---

## Quick Copy-Paste Template

Print or keep this handy while collecting secrets:

```
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
AUTH_SECRET=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
VOYAGE_API_KEY=
MASTER_ENCRYPTION_KEY=
CRON_SECRET=
```

---

## 📞 Need Help?

- **Script not running?** Make sure you're in ~/UNIMATRIX: `cd ~/UNIMATRIX`
- **Secret validation failed?** Check for extra spaces or quotes
- **Fly.io deployment error?** Run `fly auth login` first
- **Missing a value?** See the Reference table above for where to get it

