# Fly.io Deployment Guide - Complete Setup

This guide walks through deploying Unimatrix to Fly.io with the best services stack (Neon, Ably, Upstash, Voyage).

## Prerequisites

1. **Fly.io account** - Sign up at https://fly.io
2. **Neon Postgres** - Database with pgvector support
3. **Ably account** - For real-time sync (optional but recommended)
4. **Upstash account** - For Redis/Rate limiting (optional)
5. **Voyage AI account** - For embeddings
6. **GitHub account** - For OAuth
7. **Google Cloud account** - For OAuth
8. **Resend account** - For email
9. **Stripe account** - For payments

## Quick Start

```bash
# 1. Install flyctl
curl -L https://fly.io/install.sh | sh
fly auth login

# 2. Clone and setup
git clone https://github.com/tjpoisal/UNIMATRIX.git
cd UNIMATRIX
pnpm install

# 3. Run pre-deploy checks
chmod +x scripts/predeploy-check.sh
./scripts/predeploy-check.sh

# 4. Deploy all services
chmod +x scripts/fly-deploy.sh
./scripts/fly-deploy.sh all
```

## Detailed Deployment

### Step 1: Create Fly.io Apps

```bash
fly apps create unimatrix-web
fly apps create unimatrix-mcp
fly apps create unimatrix-worker
```

### Step 2: Set Up Neon Database

1. Create a Neon project at https://console.neon.tech
2. Enable pgvector extension
3. Get your connection strings:
   - **Pooled URL**: `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?pgbouncer=true`
   - **Direct URL**: `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Step 3: Configure Secrets

#### Web App Secrets

```bash
fly secrets set \
  DATABASE_URL="your-neon-pooled-url" \
  DIRECT_URL="your-neon-direct-url" \
  NEXTAUTH_SECRET="generate-random-32+chars" \
  NEXTAUTH_URL="https://unimatrix-web.fly.dev" \
  GOOGLE_CLIENT_ID="your-google-client-id" \
  GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  GITHUB_CLIENT_ID="your-github-client-id" \
  GITHUB_CLIENT_SECRET="your-github-client-secret" \
  RESEND_API_KEY="re_..." \
  EMAIL_FROM="Unimatrix <onboarding@resend.dev>" \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_PUBLISHABLE_KEY="pk_live_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  STRIPE_PRICE_FREE="price_..." \
  STRIPE_PRICE_PRO="price_..." \
  STRIPE_PRICE_ENTERPRISE="price_..." \
  ABLY_API_KEY="your-ably-key" \
  --app unimatrix-web
```

#### MCP Server Secrets

```bash
fly secrets set \
  DATABASE_URL="your-neon-pooled-url" \
  DIRECT_URL="your-neon-direct-url" \
  CLERK_SECRET_KEY="sk_..." \
  VOYAGE_API_KEY="pa-..." \
  MASTER_ENCRYPTION_KEY="32-byte-hex-string" \
  INTERNAL_API_SECRET="generate-random-32+chars" \
  --app unimatrix-mcp
```

#### Worker Secrets

```bash
fly secrets set \
  DATABASE_URL="your-neon-pooled-url" \
  DIRECT_URL="your-neon-direct-url" \
  VOYAGE_API_KEY="pa-..." \
  MASTER_ENCRYPTION_KEY="32-byte-hex-string" \
  --app unimatrix-worker
```

### Step 4: Deploy Services

```bash
# Deploy web app
./scripts/fly-deploy.sh web

# Deploy MCP server
./scripts/fly-deploy.sh mcp

# Deploy worker
./scripts/fly-deploy.sh worker
```

Or deploy all at once:

```bash
./scripts/fly-deploy.sh all
```

### Step 5: Start Worker Persistently

The worker needs to run continuously:

```bash
fly machine run \
  --app unimatrix-worker \
  --region iad \
  --vm-memory 512 \
  node dist/worker.js
```

### Step 6: Verify Deployment

```bash
# Check web app
curl https://unimatrix-web.fly.dev/api/health

# Check MCP server
curl https://unimatrix-mcp.fly.dev/health

# Check logs
fly logs --app unimatrix-web
fly logs --app unimatrix-mcp
fly logs --app unimatrix-worker
```

## Configuration Files

### fly.web.toml
- Next.js custom server with WebSocket support
- Performance CPU for low-latency Collab Room
- Health check at `/api/health`
- 2GB RAM minimum

### fly.mcp.toml
- Fastify MCP server
- Performance CPU for low-latency LLM calls
- Health check at `/health`
- 2GB RAM, 2 CPUs

### fly.worker.toml
- Background job processor
- Shared CPU (cheaper)
- 512MB RAM
- No public services needed

## Post-Deployment Setup

### 1. Update MCP Client Configs

Update your Claude Desktop, Cursor, or other MCP clients to use:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://unimatrix-mcp.fly.dev/mcp",
      "apiKey": "your-api-key-from-web-ui"
    }
  }
}
```

### 2. Set Up Custom Domain (Optional)

```bash
# Add custom domain to web app
fly certs add yourdomain.com --app unimatrix-web

# Update NEXTAUTH_URL
fly secrets set NEXTAUTH_URL="https://yourdomain.com" --app unimatrix-web
```

### 3. Configure Ably (Recommended)

1. Create an Ably account at https://ably.com
2. Create a new app
3. Copy your API key
4. Set as secret (already done in step 3)

### 4. Configure Upstash Redis (Optional)

1. Create an Upstash Redis database
2. Get connection string
3. Add to secrets:

```bash
fly secrets set UPSTASH_REDIS_REST_URL="..." --app unimatrix-web
```

## Monitoring

### View Logs

```bash
# Web app
fly logs --app unimatrix-web

# MCP server
fly logs --app unimatrix-mcp

# Worker
fly logs --app unimatrix-worker
```

### View Metrics

```bash
fly metrics --app unimatrix-web
fly metrics --app unimatrix-mcp
```

### Scale Services

```bash
# Scale web app for more traffic
fly scale count 2 --app unimatrix-web

# Scale MCP server for more LLM connections
fly scale vm performance-cpu-2x --memory 4096 --app unimatrix-mcp
```

## Troubleshooting

### Build Failures

Run pre-deploy checks locally:

```bash
./scripts/predeploy-check.sh
```

### Database Connection Issues

Verify DATABASE_URL and DIRECT_URL are correct:

```bash
fly secrets list --app unimatrix-web
```

### Worker Not Running

Check if worker machine is running:

```bash
fly machines list --app unimatrix-worker
```

If not running, start it:

```bash
fly machine run --app unimatrix-worker --vm-memory 512 node dist/worker.js
```

### WebSocket Issues

Ensure web app is using performance CPU and has sufficient memory:

```bash
fly scale vm performance-cpu-1x --memory 2048 --app unimatrix-web
```

## Cost Estimates

Based on Fly.io pricing (as of 2026):

- **Web App**: ~$30-50/mo (performance CPU, 2GB RAM)
- **MCP Server**: ~$30-50/mo (performance CPU, 2GB RAM, 2 CPUs)
- **Worker**: ~$5-10/mo (shared CPU, 512MB RAM)
- **Neon Database**: ~$20-50/mo (depends on usage)
- **Ably**: ~$20-50/mo (depends on usage)
- **Total**: ~$100-200/mo for production

## Backup Strategy

### Database Backups

Neon handles automatic backups. Verify:

1. Go to Neon console
2. Check backup schedule
3. Ensure point-in-time recovery is enabled

### Application Backups

Fly.io stores deployment history. Rollback if needed:

```bash
fly rollback --app unimatrix-web
```

## Security Checklist

- [ ] All secrets set via `fly secrets set` (not in toml files)
- [ ] HTTPS enabled on all services
- [ ] Custom domain configured with SSL
- [ ] NEXTAUTH_SECRET is 32+ random characters
- [ ] MASTER_ENCRYPTION_KEY is 32-byte hex
- [ ] INTERNAL_API_SECRET is set and unique
- [ ] API keys rotated regularly
- [ ] Rate limiting enabled (Upstash)
- [ ] Database access restricted to Fly.io IPs
- [ ] Webhook secrets verified (Stripe, Clerk)

## Support

For issues:

1. Check logs: `fly logs --app <app-name>`
2. Check status: `fly status --app <app-name>`
3. Review deployment guide in DEPLOYMENT.md
4. Check Fly.io docs: https://fly.io/docs

## Next Steps

After successful deployment:

1. Test web app at https://unimatrix-web.fly.dev
2. Test MCP server with Claude Desktop
3. Create test memories via web UI
4. Verify real-time sync with Ably
5. Test mobile app with new MCP endpoint
6. Set up monitoring and alerts
7. Configure custom domain
8. Set up CI/CD for automatic deploys
