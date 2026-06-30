#!/bin/bash
# Quick helper to deploy Unimatrix to Fly.io
# chmod +x scripts/fly-deploy.sh
#
# Prereqs: fly auth login; Neon DB URLs ready; apps created (or script will suggest).
#
# Usage: ./scripts/fly-deploy.sh web | mcp | worker | all
#
# For `web`, a predeploy-check.sh dry-run is automatically executed first.
# Pass --skip-checks to bypass (not recommended).

set -e

SKIP_CHECKS=false
for arg in "$@"; do
  [[ "$arg" == "--skip-checks" ]] && SKIP_CHECKS=true
done

APP_WEB="unimatrix-web"
APP_MCP="unimatrix-mcp"
APP_WORKER="unimatrix-worker"

create_if_needed() {
  if ! fly apps list | grep -q "$1"; then
    echo "App $1 not found. Creating..."
    fly apps create "$1" || true
  fi
}

case "$1" in
  web)
    create_if_needed $APP_WEB
    # ── Pre-deploy checks ────────────────────────────────────────────────────
    if [[ "$SKIP_CHECKS" == false ]]; then
      SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
      if [[ -x "$SCRIPT_DIR/predeploy-check.sh" ]]; then
        echo "Running pre-deploy checks (pass --skip-checks to bypass)..."
        "$SCRIPT_DIR/predeploy-check.sh" || {
          echo "Pre-deploy checks FAILED. Aborting deploy."
          echo "Fix the issues above, or re-run with --skip-checks to deploy anyway."
          exit 1
        }
        echo "Pre-deploy checks passed."
      else
        echo "WARNING: scripts/predeploy-check.sh not found or not executable — skipping."
      fi
    else
      echo "--skip-checks flag set. Skipping pre-deploy checks."
    fi
    # ── Deploy ───────────────────────────────────────────────────────────────
    echo "Deploying web to $APP_WEB..."
    flyctl deploy --config fly.web.toml --app $APP_WEB
    ;;
  mcp)
    create_if_needed $APP_MCP
    echo "Deploying MCP to $APP_MCP..."
    flyctl deploy --config fly.mcp.toml --app $APP_MCP
    ;;
  worker)
    create_if_needed $APP_WORKER
    echo "Deploying worker to $APP_WORKER..."
    flyctl deploy --config fly.worker.toml --app $APP_WORKER
    echo "Worker deployed. Start persistently:"
    echo "  fly machine run --app $APP_WORKER --vm-memory 512 node dist/worker.js"
    ;;
  all)
    $0 web
    $0 mcp
    $0 worker
    ;;
  *)
    echo "Usage: $0 {web|mcp|worker|all}"
    exit 1
    ;;
esac

echo "Done. Set secrets if first time: fly secrets set ... --app <name>"
echo "Status: fly status --app <name>"
echo "Logs: fly logs --app <name>"