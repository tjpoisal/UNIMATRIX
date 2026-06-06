#!/bin/bash
# Restore all environment secrets to Fly.io apps

set -e

echo "════════════════════════════════════════════════════════════"
echo "  UNIMATRIX SECRET RESTORATION SCRIPT"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "This script will deploy secrets to three Fly.io apps:"
echo "  1. unimatrix-web (Next.js frontend + payments)"
echo "  2. unimatrix-mcp (Fastify backend)"
echo "  3. unimatrix-worker (Background jobs)"
echo ""
echo "⚠️  IMPORTANT: Fill in your actual values in the .env section below"
echo ""

# ==================== FILL IN YOUR VALUES HERE ====================

export DATABASE_URL="${DATABASE_URL:-postgresql://DB_USER:REDACTED_DB_PASS@REDACTED_DB_HOST/neondb?sslmode=require}"
export DIRECT_URL="${DIRECT_URL:-}"

export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}"
export AUTH_SECRET="${AUTH_SECRET:-}"

export CLERK_SECRET_KEY="${CLERK_SECRET_KEY:-}"
export CLERK_WEBHOOK_SECRET="${CLERK_WEBHOOK_SECRET:-}"

export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}"

export RESEND_API_KEY="${RESEND_API_KEY:-}"
export EMAIL_FROM="${EMAIL_FROM:-Unimatrix <onboarding@unimatrix.com>}"

export GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
export GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-}"
export GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-}"
export GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-}"

export VOYAGE_API_KEY="${VOYAGE_API_KEY:-}"

export MASTER_ENCRYPTION_KEY="${MASTER_ENCRYPTION_KEY:-}"
export CRON_SECRET="${CRON_SECRET:-}"

export NODE_ENV="production"

# ===================== END OF CONFIGURATION ======================

# Validation
if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "❌ Error: CLERK_SECRET_KEY is empty. Fill in your values above."
  exit 1
fi

echo "📤 Deploying secrets to unimatrix-web..."
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
  --app unimatrix-web && echo "✅ unimatrix-web secrets deployed"

echo ""
echo "📤 Deploying secrets to unimatrix-mcp..."
fly secrets set \
  DATABASE_URL="$DATABASE_URL" \
  DIRECT_URL="$DIRECT_URL" \
  MASTER_ENCRYPTION_KEY="$MASTER_ENCRYPTION_KEY" \
  CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  CLERK_WEBHOOK_SECRET="$CLERK_WEBHOOK_SECRET" \
  VOYAGE_API_KEY="$VOYAGE_API_KEY" \
  NODE_ENV="$NODE_ENV" \
  --app unimatrix-mcp && echo "✅ unimatrix-mcp secrets deployed"

echo ""
echo "📤 Deploying secrets to unimatrix-worker..."
fly secrets set \
  DATABASE_URL="$DATABASE_URL" \
  DIRECT_URL="$DIRECT_URL" \
  MASTER_ENCRYPTION_KEY="$MASTER_ENCRYPTION_KEY" \
  CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  VOYAGE_API_KEY="$VOYAGE_API_KEY" \
  NODE_ENV="$NODE_ENV" \
  --app unimatrix-worker && echo "✅ unimatrix-worker secrets deployed"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ All secrets restored and deployed!"
echo "════════════════════════════════════════════════════════════"
