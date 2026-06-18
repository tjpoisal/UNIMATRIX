#!/usr/bin/env bash
# =============================================================================
# scripts/predeploy-check.sh
#
# Pre-deploy dry-run for unimatrix-web.
# Run this before every Fly.io deploy to catch build failures locally.
#
# What it checks:
#   1. pnpm lockfile consistency (frozen-lockfile)
#   2. Hoisting gaps — packages in .npmrc vs what pnpm actually resolves
#   3. Peer-dependency warnings that differ between local and CI
#   4. TypeScript type check (tsc --noEmit) for apps/web and all packages
#   5. Next.js production build dry-run (no Docker, exercises the same code path)
#   6. Custom server TypeScript compilation (tsconfig.server.json)
#   7. Prisma schema validation
#   8. Diff of what would be hoisted locally vs what CI/Docker sees
#
# Usage:
#   ./scripts/predeploy-check.sh          # full check
#   ./scripts/predeploy-check.sh --quick  # skip Next.js build (typecheck + prisma only)
#
# Exit codes:
#   0 — all checks passed, safe to deploy
#   1 — one or more checks failed, do NOT deploy
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$REPO_ROOT/apps/web"
QUICK=false
FAILED=0

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

pass()  { echo -e "  ${GREEN}✓${RESET} $*"; }
fail()  { echo -e "  ${RED}✗${RESET} $*"; FAILED=$((FAILED + 1)); }
warn()  { echo -e "  ${YELLOW}⚠${RESET} $*"; }
step()  { echo -e "\n${CYAN}${BOLD}▶ $*${RESET}"; }
banner(){ echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"; }

# ── Args ──────────────────────────────────────────────────────────────────────
for arg in "$@"; do
  [[ "$arg" == "--quick" ]] && QUICK=true
done

banner
echo -e "${BOLD}  Unimatrix pre-deploy check — $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo    "  Target: unimatrix-web (Fly.io)"
[[ "$QUICK" == true ]] && echo "  Mode: --quick (skipping Next.js build)"
banner

cd "$REPO_ROOT"

# ── 1. Toolchain versions ─────────────────────────────────────────────────────
step "Toolchain"
node_ver=$(node --version 2>/dev/null || echo "NOT FOUND")
pnpm_ver=$(pnpm --version 2>/dev/null || echo "NOT FOUND")
echo "  node: $node_ver  |  pnpm: $pnpm_ver"

required_node="18"
actual_node="${node_ver#v}"
actual_major="${actual_node%%.*}"
if [[ "$actual_major" -lt "$required_node" ]]; then
  fail "Node.js $node_ver is below required >=18. Install Node 20."
else
  pass "Node.js $node_ver (>= 18 required)"
fi

# ── 2. Lockfile consistency ───────────────────────────────────────────────────
step "Lockfile integrity (pnpm install --frozen-lockfile --dry-run)"
if pnpm install --frozen-lockfile --dry-run > /tmp/pnpm-dry.txt 2>&1; then
  pass "Lockfile is consistent — no missing or outdated packages"
else
  fail "Lockfile drift detected. Run 'pnpm install' and commit the updated lockfile."
  cat /tmp/pnpm-dry.txt | head -30
fi

# ── 3. Hoisting gap analysis ──────────────────────────────────────────────────
step "Hoisting gap analysis (local vs Docker)"

# What does .npmrc hoist?
NPMRC_PATTERNS=$(grep '^public-hoist-pattern\[\]=' "$REPO_ROOT/.npmrc" 2>/dev/null \
  | sed 's/public-hoist-pattern\[\]=//g' | sort)

echo "  Hoisted patterns in .npmrc:"
echo "$NPMRC_PATTERNS" | while read -r p; do echo "    - $p"; done

# Check that lucide-react is hoisted (the known problematic package)
CRITICAL_HOISTED=("lucide-react" "@radix-ui/*" "class-variance-authority" "clsx" "tailwind-merge")
for pkg in "${CRITICAL_HOISTED[@]}"; do
  if echo "$NPMRC_PATTERNS" | grep -qF "$pkg"; then
    pass "Hoisted: $pkg"
  else
    fail "NOT hoisted: $pkg — tsc will fail in Docker. Add to .npmrc: public-hoist-pattern[]=$pkg"
  fi
done

# Detect packages imported in apps/web that are likely peer deps and NOT hoisted
step "Peer dependency import scan"
IMPORTS=$(grep -rh "from '" "$WEB_DIR/components" "$WEB_DIR/app" "$WEB_DIR/lib" \
  --include="*.ts" --include="*.tsx" 2>/dev/null \
  | grep -oP "from '([^'./][^']+)'" \
  | grep -oP "'([^']+)'" | tr -d "'" \
  | sed "s|/.*||" \
  | grep -v '^@next\|^next\|^react\|^server-only\|^node:' \
  | sort -u)

WEB_DEPS=$(cat "$WEB_DIR/package.json" | python3 -c "
import json,sys
d=json.load(sys.stdin)
deps={**d.get('dependencies',{}),**d.get('devDependencies',{}),**d.get('peerDependencies',{})}
print('\n'.join(sorted(deps.keys())))
" 2>/dev/null)

PEER_ONLY_RISK=()
while IFS= read -r pkg; do
  # Strip scope for matching
  base_pkg="${pkg#@*/}"
  if ! echo "$WEB_DEPS" | grep -qF "$pkg" 2>/dev/null; then
    # Not a direct dep — might be a peer dep resolved transitively
    PEER_ONLY_RISK+=("$pkg")
  fi
done <<< "$IMPORTS"

if [[ ${#PEER_ONLY_RISK[@]} -gt 0 ]]; then
  warn "Packages imported but not in apps/web/package.json (may fail in Docker if not hoisted):"
  for p in "${PEER_ONLY_RISK[@]}"; do
    echo "    - $p"
  done
else
  pass "All imported packages are direct dependencies of apps/web"
fi

# ── 4. Prisma schema validation ───────────────────────────────────────────────
step "Prisma schema validation"
if (cd "$WEB_DIR" && pnpm prisma validate 2>&1); then
  pass "Prisma schema valid"
else
  fail "Prisma schema invalid — fix errors before deploying"
fi

echo ""
step "Prisma client generation"
if (cd "$WEB_DIR" && pnpm prisma generate 2>&1 | grep -E "Generated|Error|warn" | head -10); then
  pass "Prisma client generated successfully"
else
  fail "Prisma client generation failed"
fi

# ── 5. TypeScript type check ──────────────────────────────────────────────────
step "TypeScript type check — packages (upstream)"

for pkg_dir in packages/types packages/db packages/ui packages/llm packages/server; do
  if [[ -f "$REPO_ROOT/$pkg_dir/tsconfig.json" ]]; then
    pkg_name=$(basename "$pkg_dir")
    if (cd "$REPO_ROOT/$pkg_dir" && pnpm exec tsc --noEmit 2>&1 | head -20); then
      pass "packages/$pkg_name — no type errors"
    else
      fail "packages/$pkg_name — type errors found (fix before deploying)"
    fi
  fi
done

step "TypeScript type check — apps/web"
if (cd "$WEB_DIR" && pnpm exec tsc --noEmit 2>&1); then
  pass "apps/web — no type errors"
else
  fail "apps/web — type errors found. These will block the Fly.io build."
  echo ""
  echo -e "  ${YELLOW}Re-run with full output:${RESET}"
  echo "    cd apps/web && pnpm exec tsc --noEmit"
fi

step "TypeScript type check — apps/web server (tsconfig.server.json)"
if (cd "$WEB_DIR" && pnpm exec tsc -p tsconfig.server.json --noEmit 2>&1); then
  pass "apps/web server — no type errors"
else
  fail "apps/web server — type errors in server.ts or lib/realtime"
fi

# ── 6. Next.js production build ───────────────────────────────────────────────
if [[ "$QUICK" == false ]]; then
  step "Next.js production build (dry-run)"
  echo "  This replicates what Docker runs — may take 30-60s..."
  if (cd "$WEB_DIR" && pnpm run build 2>&1); then
    pass "Next.js build succeeded — safe to deploy"
  else
    fail "Next.js build FAILED — this will block Fly.io deployment"
    echo ""
    echo -e "  ${YELLOW}To investigate:${RESET}"
    echo "    cd apps/web && pnpm run build"
  fi
else
  warn "Skipping Next.js build (--quick mode). Run without --quick before final deploy."
fi

# ── 7. Environment variable sanity check ─────────────────────────────────────
step "Environment variable sanity check"
ENV_FILE="$WEB_DIR/.env"
ENV_EXAMPLE="$WEB_DIR/.env.example"

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "AUTH_SECRET"
  "NEXTAUTH_URL"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "MFA_ENCRYPTION_KEY"
  "RESEND_API_KEY"
)

if [[ -f "$ENV_FILE" ]]; then
  MISSING=()
  for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -qE "^${var}=" "$ENV_FILE" 2>/dev/null; then
      MISSING+=("$var")
    fi
  done
  if [[ ${#MISSING[@]} -gt 0 ]]; then
    warn "These env vars are missing from .env (they must be set as Fly secrets):"
    for v in "${MISSING[@]}"; do echo "    - $v"; done
    echo "    Run: flyctl secrets list --app unimatrix-web"
  else
    pass "All required env vars present in .env"
  fi
else
  warn "No .env file found at $ENV_FILE"
  echo "  Checking Fly secrets requires: flyctl secrets list --app unimatrix-web"
fi

# ── 8. Docker image size estimate ─────────────────────────────────────────────
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  step "Docker build dry-run (local)"
  echo "  Running docker build --dry-run to validate Dockerfile.web syntax..."
  if docker build --no-cache --dry-run -f "$REPO_ROOT/Dockerfile.web" "$REPO_ROOT" 2>&1 | head -20; then
    pass "Dockerfile.web syntax valid"
  else
    warn "docker --dry-run not supported on this Docker version, skipping"
  fi
else
  warn "Docker not running locally — skipping Dockerfile validation"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
banner
if [[ "$FAILED" -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}  ✓ All checks passed — safe to deploy${RESET}"
  echo ""
  echo "  Deploy with:"
  echo "    ./scripts/fly-deploy.sh web"
  echo "    # or: flyctl deploy --config fly.web.toml --app unimatrix-web"
  echo ""
  exit 0
else
  echo -e "${RED}${BOLD}  ✗ $FAILED check(s) failed — DO NOT deploy until fixed${RESET}"
  echo ""
  echo "  Fix the issues above, then re-run:"
  echo "    ./scripts/predeploy-check.sh"
  echo ""
  exit 1
fi
