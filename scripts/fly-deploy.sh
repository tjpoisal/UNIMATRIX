#!/bin/bash
# Quick helper to deploy Unimatrix to Fly.io (Vercel -> Fly migration)
# chmod +x scripts/fly-deploy.sh
#
# Prereqs: fly auth login; Neon DB URLs ready; apps created (or script will suggest).
#
# Usage: ./scripts/fly-deploy.sh web | mcp | worker | all

set -e

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
    echo "Deploying web to $APP_WEB..."
    cp fly.web.toml fly.toml
    fly deploy --config fly.toml --app $APP_WEB
    ;;
  mcp)
    create_if_needed $APP_MCP
    echo "Deploying MCP to $APP_MCP..."
    cp fly.mcp.toml fly.toml
    fly deploy --config fly.toml --app $APP_MCP
    ;;
  worker)
    create_if_needed $APP_WORKER
    echo "Deploying worker to $APP_WORKER..."
    cp fly.worker.toml fly.toml
    fly deploy --config fly.toml --app $APP_WORKER
    echo "Start worker persistently (example):"
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