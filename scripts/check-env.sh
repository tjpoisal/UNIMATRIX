#!/usr/bin/env bash
# =============================================================================
# scripts/check-env.sh
#
# Pre-deploy environment validator for unimatrix-web.
# Verifies that all required Fly.io secrets are set AND that DATABASE_URL
# actually connects to Neon before allowing a deploy to proceed.
#
# Usage:
#   ./scripts/check-env.sh                     # full check (local, uses flyctl)
#   ./scripts/check-env.sh --ci                # CI mode: reads from env vars directly
#   ./scripts/check-env.sh --ci --skip-db      # CI mode, skip live DB probe
#
# Exit codes:
#   0 — all checks passed, safe to deploy
#   1 — one or more required secrets are missing or DB is unreachable
# =============================================================================

set -euo pipefail

APP="unimatrix-web"
CI_MODE=false
SKIP_DB=false
FAILED=0

for arg in "$@"; do
  [[ "$arg" == "--ci" ]]       && CI_MODE=true
  [[ "$arg" == "--skip-db" ]]  && SKIP_DB=true
done

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

pass()  { echo -e "  ${GREEN}✔${RESET}  $1"; }
fail()  { echo -e "  ${RED}✖${RESET}  $1"; FAILED=$((FAILED+1)); }
warn()  { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
info()  { echo -e "  ${CYAN}→${RESET}  $1"; }
header(){ echo -e "\n${BOLD}${CYAN}$1${RESET}"; }

# =============================================================================
# 1. Required secrets (Fly.io secrets must be set at runtime)
# =============================================================================
# These are the secrets that unimatrix-web MUST have to start correctly.
# Keep this list in sync with apps/web/.env.example
REQUIRED_SECRETS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "MFA_ENCRYPTION_KEY"
)

# Optional but warn if missing (features degrade without these)
OPTIONAL_SECRETS=(
  "RESEND_API_KEY"
  "INTERNAL_API_SECRET"
  "MCP_SERVER_URL"
)

header "1 / 3 — Checking required secrets"

if [[ "$CI_MODE" == true ]]; then
  # In CI, secrets are injected as environment variables via GitHub Secrets
  info "CI mode: reading from environment variables"
  for secret in "${REQUIRED_SECRETS[@]}"; do
    val="${!secret:-}"
    if [[ -z "$val" ]]; then
      fail "Missing: $secret (add to GitHub Actions secrets → fly-secrets)"
    else
      # Mask all but last 4 chars
      masked="${val: -4}"
      pass "$secret = ****${masked}"
    fi
  done
  for secret in "${OPTIONAL_SECRETS[@]}"; do
    val="${!secret:-}"
    if [[ -z "$val" ]]; then
      warn "Optional missing: $secret (some features may not work)"
    else
      pass "$secret = ****${val: -4} (optional)"
    fi
  done
else
  # Local mode: pull secrets list from Fly.io (doesn't reveal values)
  info "Local mode: querying flyctl secrets list for $APP"
  if ! command -v flyctl &>/dev/null; then
    fail "flyctl not found — install from https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
  fi
  FLY_SECRETS=$(flyctl secrets list --app "$APP" --json 2>/dev/null || echo "[]")
  SECRET_NAMES=$(echo "$FLY_SECRETS" | python3 -c "
import json,sys
data = json.load(sys.stdin)
for s in data:
    print(s.get('Name',''))
" 2>/dev/null || echo "")

  for secret in "${REQUIRED_SECRETS[@]}"; do
    if echo "$SECRET_NAMES" | grep -qx "$secret"; then
      pass "$secret is set on $APP"
    else
      fail "$secret is NOT set — run: flyctl secrets set $secret=<value> --app $APP"
    fi
  done
  for secret in "${OPTIONAL_SECRETS[@]}"; do
    if echo "$SECRET_NAMES" | grep -qx "$secret"; then
      pass "$secret is set (optional)"
    else
      warn "Optional $secret is not set on $APP"
    fi
  done
fi

# =============================================================================
# 2. DATABASE_URL format validation
# =============================================================================
header "2 / 3 — Validating DATABASE_URL format"

DB_URL="${DATABASE_URL:-}"

if [[ "$CI_MODE" == false ]]; then
  # In local mode we can't read the actual secret value from Fly, so just skip
  # the format check — we confirmed it exists above
  info "Skipping format check in local mode (secret value not exposed by flyctl)"
else
  if [[ -z "$DB_URL" ]]; then
    fail "DATABASE_URL is empty — cannot validate format"
  else
    # Must be a postgres:// or postgresql:// URL
    if [[ "$DB_URL" =~ ^postgres(ql)?:// ]]; then
      pass "DATABASE_URL starts with postgres(ql)://"
    else
      fail "DATABASE_URL does not look like a valid Postgres URL (got: ${DB_URL:0:20}...)"
    fi

    # Warn if not pointing at Neon
    if echo "$DB_URL" | grep -q "neon.tech"; then
      pass "DATABASE_URL points to Neon (neon.tech)"
    else
      warn "DATABASE_URL does not contain neon.tech — is this the right database?"
    fi

    # Must include ?sslmode= or have an ssl param
    if echo "$DB_URL" | grep -qE "(sslmode=|ssl=)"; then
      pass "DATABASE_URL includes SSL parameter"
    else
      warn "DATABASE_URL has no sslmode/ssl param — Neon requires SSL"
    fi
  fi
fi

# =============================================================================
# 3. Live database connectivity probe
# =============================================================================
header "3 / 3 — Database connectivity probe"

if [[ "$SKIP_DB" == true ]]; then
  warn "Skipping live DB probe (--skip-db flag set)"
elif [[ -z "$DB_URL" ]]; then
  warn "Skipping live DB probe (DATABASE_URL not available in this mode)"
else
  info "Attempting test query via psql / Node.js..."

  # Try psql first (fastest), then fall back to Node one-liner
  if command -v psql &>/dev/null; then
    if psql "$DB_URL" -c "SELECT 1" --no-align --tuples-only --quiet 2>/dev/null | grep -q "1"; then
      pass "Database connection successful (psql)"
    else
      fail "Database connection FAILED via psql — check DATABASE_URL and Neon project status"
    fi
  elif command -v node &>/dev/null; then
    # Node one-liner: require pg, try a SELECT 1
    PROBE_RESULT=$(node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
c.connect()
  .then(() => c.query('SELECT 1'))
  .then(() => { process.stdout.write('ok'); c.end(); })
  .catch(e => { process.stderr.write(e.message); process.exit(1); });
" 2>&1 || true)
    if [[ "$PROBE_RESULT" == "ok" ]]; then
      pass "Database connection successful (node pg)"
    else
      fail "Database connection FAILED: $PROBE_RESULT"
    fi
  else
    warn "Neither psql nor node found — skipping live DB probe"
  fi
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}All checks passed — safe to deploy.${RESET}"
  exit 0
else
  echo -e "${RED}${BOLD}$FAILED check(s) failed — fix issues above before deploying.${RESET}"
  echo ""
  echo "  Quick fixes:"
  echo "  • Set a secret:   flyctl secrets set KEY=value --app $APP"
  echo "  • List secrets:   flyctl secrets list --app $APP"
  echo "  • Neon console:   https://console.neon.tech"
  exit 1
fi
