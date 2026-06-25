#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/prisma-local-sync.sh [DATABASE_URL]
# Example: ./scripts/prisma-local-sync.sh "postgresql://unimatrix:unimatrix@localhost:5433/unimatrix?schema=public"

DATABASE_URL_ARG="${1:-}"

if [ -z "$DATABASE_URL_ARG" ]; then
  echo "Please pass DATABASE_URL as the first argument." >&2
  echo "Example: $0 'postgresql://unimatrix:unimatrix@localhost:5433/unimatrix?schema=public'" >&2
  exit 2
fi

export DATABASE_URL="$DATABASE_URL_ARG"

echo "Using DATABASE_URL=$DATABASE_URL"

pushd packages/db >/dev/null

echo "Running prisma db push --accept-data-loss"
pnpm prisma db push --accept-data-loss

echo "Running prisma generate"
pnpm prisma generate

popd >/dev/null

echo "Prisma push + generate complete."
