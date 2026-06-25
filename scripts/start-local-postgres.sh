#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/start-local-postgres.sh [PORT] [CONTAINER_NAME]
# Example: ./scripts/start-local-postgres.sh 5433 unimatrix_dev_db

PORT="${1:-5433}"
NAME="${2:-unimatrix_dev_db}"
USER="unimatrix"
PASSWORD="unimatrix"
DB="unimatrix"

echo "Removing any existing container named $NAME..."
docker rm -f "$NAME" >/dev/null 2>&1 || true

echo "Starting postgres container $NAME on host port $PORT..."
docker run -d --name "$NAME" \
  -e POSTGRES_USER="$USER" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -e POSTGRES_DB="$DB" \
  -p "${PORT}:5432" \
  postgres:15

echo "Waiting for Postgres to accept connections (up to 30s)..."
for i in {1..30}; do
  if docker exec "$NAME" pg_isready -U "$USER" >/dev/null 2>&1; then
    echo "Postgres is ready."
    break
  fi
  sleep 1
done

echo
echo "Local Postgres started. Connection string (export this for Prisma):"
echo "postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB}?schema=public"
