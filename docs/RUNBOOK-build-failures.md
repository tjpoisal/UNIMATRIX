# Unimatrix Web — Build Failure Runbook

**Scope:** Fly.io / Depot build failures for `unimatrix-web`  
**Updated:** June 2026  
**Related PRs:** [#30](https://github.com/tjpoisal/UNIMATRIX/pull/30) · [#31](https://github.com/tjpoisal/UNIMATRIX/pull/31)

---

## How to use this runbook

1. Match the error message in the `RUN pnpm build` step of the Depot log to a section below.
2. Follow the **Diagnosis** and **Fix** steps in order.
3. Re-run `flyctl deploy --config fly.web.toml --app unimatrix-web` after each fix.

Run the pre-deploy check at any time to catch issues before they hit Depot:

```bash
./scripts/check-env.sh           # local (reads from Fly secrets via flyctl)
./scripts/predeploy-check.sh     # full dry-run including tsc + Next.js build
```

---

## Issue 1 — `DATABASE_URL environment variable is not set`

**Symptoms**

```
Error: DATABASE_URL environment variable is not set
    at <unknown> (.next/server/chunks/...)
Error: Failed to collect page data for /api/memory/search
 ELIFECYCLE  Command failed with exit code 1
```

**Root cause**

`next build`'s *Collecting page data* step imports every API route module to
determine static vs dynamic rendering. Any code that **throws on module import**
(not on request) crashes the build.

The typical culprits:
- `lib/db.ts` calling `createPool()` at module load time
- `packages/db/src/index.ts` calling `new PrismaClient()` at module load time

**Diagnosis checklist**

```bash
# 1. Confirm DATABASE_URL is set on the Fly app
flyctl secrets list --app unimatrix-web | grep DATABASE_URL

# 2. If missing, set it
flyctl secrets set DATABASE_URL="postgresql://..." --app unimatrix-web

# 3. Check that lib/db.ts uses a lazy Proxy (not a top-level createPool() call)
grep -n "createPool\|new Pool" apps/web/lib/db.ts

# 4. Check that packages/db/src/index.ts uses getPrisma() lazily
grep -n "new PrismaClient" packages/db/src/index.ts
```

**Fix**

a. **Set the secret** if it was missing:
   ```bash
   flyctl secrets set DATABASE_URL="$(flyctl secrets list --app unimatrix-web -j | python3 -c "import json,sys; [print(s['Name']) for s in json.load(sys.stdin)]")" --app unimatrix-web
   ```
   Or get the Neon connection string from the [Neon console](https://console.neon.tech) →
   project `long-bird-25172855` → Connection Details.

b. **If the secret is set but the build still fails:** the DB client is being
   instantiated at import time. Both `lib/db.ts` and `packages/db/src/index.ts`
   must use lazy Proxy patterns (see PR #31). Verify:
   ```bash
   git log --oneline packages/db/src/index.ts | head -3
   # Should show the PR #31 commit
   ```

c. **Quick local test** to confirm the fix doesn't throw at import:
   ```bash
   cd apps/web
   node -e "require('.next/server/app/api/memory/search/route.js')" 2>&1 | head -5
   # Should output nothing or a harmless warning — not a throw
   ```

**Time to fix:** ~5 min if secret is missing; ~15 min if code needs patching.

---

## Issue 2 — `Invalid next.config.ts options` / `Unrecognized key`

**Symptoms**

```
⚠ Invalid next.config.ts options detected:
⚠     Unrecognized key(s) in object: 'eslint'
```

Appears as a warning in Next.js 16 but will become a hard error in a future
release. Can also surface for: `swcMinify`, `target`, `experimental.legacyBrowsers`.

**Root cause**

Keys that existed in Next.js 13–15 were removed from the config schema in
Next.js 16. The `eslint` config key was dropped in favour of running ESLint
exclusively through the `next lint` CLI — it no longer does anything in
`next.config.ts`.

**Diagnosis checklist**

```bash
# 1. List all top-level keys in next.config.ts
node -e "const c = require('./apps/web/next.config.ts'); console.log(Object.keys(c))"

# 2. Cross-reference against the removed-options list
grep -E "eslint:|swcMinify:|target:" apps/web/next.config.ts
```

**Fix**

Remove the offending key from `apps/web/next.config.ts`:

```diff
 const nextConfig: NextConfig = {
   typescript: {
     ignoreBuildErrors: true,
   },
-  eslint: {
-    ignoreDuringBuilds: true,
-  },
+  // eslint key removed — unrecognised in Next.js 16.
+  // ESLint runs in CI via the typecheck workflow.
   poweredByHeader: false,
```

The CI `pre-deploy-env-check.yml` workflow now scans for these keys
automatically and fails the check before the deploy ever starts.

**Time to fix:** 2 min.

---

## Issue 3 — `Prisma failed to detect libssl / openssl version`

**Symptoms**

```
prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected.
Defaulting to "openssl-1.1.x".
Please manually install OpenSSL via `apt-get update -y && apt-get install -y openssl`
```

Can appear during `prisma generate` or at runtime. On `node:20-slim` (Debian
Bookworm), OpenSSL is not installed by default.

**Root cause**

Prisma 6.x requires `openssl` and `libssl-dev` at both **build time** (for
`prisma generate`) and **runtime** (for the query engine's TLS stack). The base
`node:20-slim` image ships without them.

**Diagnosis checklist**

```bash
# 1. Check if the Dockerfile.web has the apt-get install block
grep -A6 "apt-get install" Dockerfile.web

# 2. Confirm it's in BOTH base and production stages
grep -c "apt-get install" Dockerfile.web
# Should output 2 (one per stage)

# 3. Verify the packages installed
grep "openssl" Dockerfile.web
# Should show: openssl, libssl-dev in both stages
```

**Fix**

Both the `base` (build) and `production` (runtime) stages in `Dockerfile.web`
must include:

```dockerfile
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
      openssl \
      libssl-dev \
      ca-certificates \
      curl \
      git \
    && rm -rf /var/lib/apt/lists/*
```

This was fixed in PR #30. If the warning re-appears after a `FROM` base image
change, re-add the block to the new stage.

**Verify the fix worked:**

```bash
# Check Depot build logs — Prisma warning should be gone
flyctl logs --app unimatrix-web | grep -i "libssl\|openssl" | head -5
# Should return nothing (or only the Prisma client version line, not the warning)
```

**Time to fix:** 5 min (edit Dockerfile, redeploy).

---

## Escalation path

| Symptom | Check first | Escalate to |
|---|---|---|
| Build fails in Depot, passes locally | `./scripts/predeploy-check.sh` | Compare Docker vs local `node_modules` |
| Secret set on Fly but still failing | `flyctl secrets list --app unimatrix-web` | Check if secret was set on wrong app |
| Neon unreachable | [console.neon.tech](https://console.neon.tech) → project status | Neon status page / support |
| `pnpm install` fails in Docker | `.npmrc` hoisting patterns | Check `public-hoist-pattern` in `.npmrc` |
| TypeScript errors block CI | `pnpm exec tsc --noEmit` locally | Check PR #28 typecheck workflow output |

---

## Quick reference

```bash
# Set a Fly secret
flyctl secrets set KEY=value --app unimatrix-web

# List all Fly secrets (names only, no values)
flyctl secrets list --app unimatrix-web

# Tail live Fly logs
flyctl logs --app unimatrix-web

# Full pre-deploy dry-run (local)
./scripts/predeploy-check.sh

# Check env + DB only
./scripts/check-env.sh

# Deploy
flyctl deploy --config fly.web.toml --app unimatrix-web

# Get Neon connection string
# → https://console.neon.tech → long-bird-25172855 → Connection Details
```
