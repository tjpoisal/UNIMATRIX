#!/bin/bash
# Quick helper to deploy Unimatrix to Fly.io
# Make executable: chmod +x scripts/fly-deploy.sh
#
# Prerequisites:
#   fly auth login
#   Have your Neon DATABASE_URL etc. ready
#
# Usage:
#   ./scripts/fly-deploy.sh web     # deploy only web
#   ./scripts/fly-deploy.sh mcp     # deploy only mcp
#   ./scripts/fly-deploy.sh worker  # deploy worker
#   ./scripts/fly-deploy.sh all     # all three

set -e

APP_WEB="unimatrix-web"
APP_MCP="unimatrix-mcp"
APP_WORKER="unimatrix-worker"

case "$1" in
  web)
    echo "Deploying web to $APP_WEB..."
    cp fly.web.toml fly.toml
    fly deploy --config fly.toml --app $APP_WEB
    ;;
  mcp)
    echo "Deploying MCP to $APP_MCP..."
    cp fly.mcp.toml fly.toml
    fly deploy --config fly.toml --app $APP_MCP
    ;;
  worker)
    echo "Deploying worker to $APP_WORKER..."
    cp fly.worker.toml fly.toml
    fly deploy --config fly.toml --app $APP_WORKER
    echo "Now start the worker process on a machine (example):"
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

echo "Done. Remember to set secrets with 'fly secrets set ... --app <name>' if not already done."
echo "Check status: fly status --app <name>"