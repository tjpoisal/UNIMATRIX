Local development setup for Prisma (Postgres)

This project uses Prisma with a PostgreSQL database. For safe local development we recommend running a disposable local Postgres container and pushing the schema to it instead of pushing to any pooled/shared database.

Quick workflow

1. Start a local Postgres container on port 5433 (or pick another free port):

```bash
./scripts/start-local-postgres.sh 5433 unimatrix_dev_db
```

2. Push Prisma schema and generate the client (pointing at the local DB):

```bash
./scripts/prisma-local-sync.sh "postgresql://unimatrix:unimatrix@localhost:5433/unimatrix?schema=public"
```

Notes
- The scripts are intentionally conservative and use `--accept-data-loss` because this is a local/dev workflow. Do NOT run these scripts against production or pooled DBs.
- If you prefer migration files (instead of `db push`), run `pnpm prisma migrate dev` from `packages/db` after setting `DATABASE_URL` appropriately.
- If your machine already runs Postgres on 5432, use 5433 or 5434 as the host port mapping.
