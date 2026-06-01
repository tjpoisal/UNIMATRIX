# Unimatrix — Updated Project Framework (Synthesized June 2026)

**One-sentence mission:** Persistent, encrypted, searchable memory layer for any LLM client (Claude Desktop/Code, Ollama, etc.) via the Model Context Protocol (MCP) — so context survives device/session switches with zero re-explaining.

## Current (Authoritative) Stack & Architecture

- **Monorepo:** pnpm + Turbo (root package.json, pnpm-workspace.yaml, turbo.json)
- **Backend API (packages/server):** Fastify 5 + Zod + TypeScript (ESM). Deployed serverless on Vercel.
  - Auth: Clerk (primary for MCP/tools) + dev shortcut (sk_test_ + x-user-id)
  - DB: Neon PostgreSQL + pgvector (512-dim Voyage MRL embeddings)
  - Security: Per-memory AES-256-GCM (scrypt KDF, fresh salt/IV per write) + PII/API-key redaction (before embedding/Librarian) + prompt-injection detection + Postgres RLS via `app.current_user_id` session var + RLS guard in dev
  - MCP: @modelcontextprotocol/sdk (Streamable HTTP transport on /mcp)
  - Embeddings: Voyage AI Voyage 3.5 MRL (compresses to 512d)
  - Librarian: Claude Haiku for async classification/poly-tagging/routing into Spaces (see librarian/)
  - Tokens: MCP API keys (bcrypt-hashed only; raw never stored post-2026-06 fixes)
- **Web Dashboard (apps/web):** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4
  - Auth: NextAuth v5 beta (JWT strategy, Credentials + conditional Google/GitHub OAuth)
  - ORM: Prisma (users, palaces/locations/memories/sync_state etc.)
  - Features: Palace CRUD + hierarchy, search, export, sync (for mobile), Stripe (tiers), provider key settings
  - Note: Hybrid auth with server Clerk — user rows mirrored by email/clerk_id
- **MCP Client (packages/mcp-server):** Publishable stdio/HTTP bridge (`npx @unimatrix/mcp-server` or local). Tools: remember/recall/store/search/timeline etc. Points to backend API + API key.
- **Legacy/Partial:**
  - packages/llm: Multi-provider abstraction (Claude/OpenAI/Gemini/Groq/Ollama) + intelligent router + health (used in old AWS Lambda handlers; partially relevant)
  - packages/api, types, ui: Shared contracts/components (ui thin)
  - apps/mobile (Expo ~54): Scaffold, incomplete
  - apps/desktop (Electron ^36 + electron-builder): Scaffold/wrapper, release workflows
- **Infra:** .github/workflows (CI type/lint/build, desktop releases signed, mobile EAS), Dependabot (weekly npm + actions, groups minor/patch, ignores major Next)
- **Deployment:** Vercel (web + serverless Fastify). Neon DB. Homepage: https://unimatrix-flax.vercel.app
- **Encryption & Privacy:** App-layer (not just at-rest). Episodic (verbatim encrypted) + Semantic (Librarian summary + vector). RLS + redaction defense-in-depth.

## Memory Model (MVP, evolved from docs)

- **Spaces** (user-owned, 2-level hierarchy ready for deeper; Librarian auto-files)
- **Memories:** 
  - content: BYTEA (AES ciphertext)
  - summary: TEXT (Librarian synthesis, for recall)
  - embedding: vector(512)
  - status (active/superseded/archived), tags[], timestamps, source
- **Hybrid recall:** cosine + exponential recency decay (0.5 ^ age) + status penalty. Token budget (4k desktop / 800 mobile).
- **MCP tools (core 4+):** store_memory (enqueue to Librarian), recall_context (semantic+recency, budgeted), search_memories, get_timeline (episodic verbatim), supersede, etc.
- **Librarian:** Non-blocking classification + poly-tag (route to 1-2 Spaces if <85% confidence). Async jobs (current impl in-process or queued?).

## Evolution (from all .md synthesis — key for understanding)

Docs show 3+ major pivots (this is why "updated framework" needed):
1. **v1 AWS-native (ARCHITECTURE.md, early MVP_Scope, LLM_ARCHITECTURE, Project_Brief):** Full Cognito + RDS + AppSync GraphQL + Lambda + ElastiCache + multi-LLM + agent collab + real-time subs + self-host Docker. 24-32wk plan. Abandoned for cost/speed.
2. **Supabase/Clerk/Fastify pivot (MVP_Scope.md, some IMPLEMENTATION):** Removed GraphQL/AppSync, added MCP focus, Voyage, encryption from day 1, 10-week MVP for Claude Desktop "RTX moment", 2-layer memory (episodic vs semantic), Inngest/Trigger for jobs, poly-tagging not review queues.
3. **Neon + Vercel + Current (README, LOCAL_SETUP, IMPLEMENTATION_STATUS, NEON_VERCEL_MIGRATION, DEPLOY):** Dropped Supabase for Neon direct + pgvector, Fastify on Vercel, hybrid Clerk (server) + NextAuth (web), REST APIs instead of GQL, web scaffold + API complete but full UI pending, MCP primary delivery (account-linked = mobile Claude auto-works), legacy AWS/LLM code remains but server is source of truth.

**Result:** Lean MCP memory infrastructure, not the original full collaborative agent platform. Strong security baseline (encryption, RLS, redaction, injection checks) added in later phases.

## Vulnerabilities Addressed (this task + prior)

**Fixed in this session (pushed to main):**
- **Critical (MCP tokens):** Plaintext `token` column in mcp_tokens + broken verification (sha256 hash vs bcrypt storage, mismatched queries in verifyUser vs mcpToken modules). Now: hash-only inserts, full active-token bcrypt scan in verification paths (small-N acceptable). Raw token never stored server-side after generation. (See packages/server/src/auth/{verifyUser,mcpToken}.ts)
- **Workflows:** Mixed old actions (checkout/setup-node v4), npm install in pnpm repo, --no-frozen-lockfile in CI (drift risk). Updated to v5, pnpm --frozen, consistent.
- **Auth init:** Unconditional Google/GitHub providers in NextAuth (crash if no env). Now conditional.
- **Docs & secrets hygiene:** Placeholder SECURITY.md, all-zero MASTER key examples in .env/LOCAL_SETUP (now warned + openssl example).
- **Deps:** Added pnpm override uuid>=11.1.1 (moderate buffer vuln via expo transitive); bumped desktop Electron ^36 + builder (many historical Electron CVEs/alerts).

**GitHub Dependabot (as of push):** ~20 alerts (4 high, 11 mod, 5 low) — mostly Electron core CVEs (use-after-free, injection in older builds; bumped version + alerts may need manual dismiss for non-applicable), transitive (uuid fixed by override, postcss by existing override, turbo/js-cookie/protobuf fixed states). Run `pnpm audit` locally shows only the uuid (now overridden).

**Other observations (no critical code vulns found):**
- Strong patterns: param queries (no SQLi), crypto correct (GCM+scrypt), sanitization comprehensive, RLS guard, rate-limit on Fastify.
- Risks remaining (non-blocking for MVP): Dev shortcut too broad if test keys leaked; hybrid Clerk/NextAuth sync (email/clerk_id mirroring); missing mcp_tokens CREATE in migrations/*.sql (setup blocker); no per-user keys yet (Phase 2 planned); web UI incomplete per IMPLEMENTATION_STATUS; async Librarian jobs may lack prod queue.
- No hardcoded secrets, no eval/dangerous HTML, good .gitignore.

## What Else to Get Up & Running (Practical Checklist, synthesized from README + LOCAL_SETUP + IMPLEMENTATION + code)

**Prerequisites:** Node >=18, pnpm >=9, PostgreSQL 15+ w/ pgvector (Neon recommended), API keys (Clerk, VoyageAI, Anthropic for Librarian, optional Stripe/OpenAI/etc).

**1. Clone & Install**
```bash
git clone https://github.com/tjpoisal/UNIMATRIX.git
cd UNIMATRIX
pnpm install
```

**2. Database (Neon or local)**
- Neon: Create project, enable pgvector (CREATE EXTENSION vector;), copy connection string.
- Local: `docker run -d --name pgv -e POSTGRES_PASSWORD=... -p 5432:5432 ankane/pgvector:latest` then create db + extension.
- **Critical:** Run migrations in order: `psql $DATABASE_URL -f packages/server/migrations/00*.sql`
  - Note: mcp_tokens table CREATE is **missing** from current migrations (code assumes it). Add manually or via new migration before running server:
    ```sql
    CREATE TABLE IF NOT EXISTS mcp_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token TEXT,  -- legacy; set NULL for new rows (post-fix)
      hashed_token TEXT NOT NULL,
      scope TEXT NOT NULL,
      expires_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      last_used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX ON mcp_tokens (user_id, created_at DESC);
    ```

**3. Environment (3 locations!)**
- Root `.env` (server): DATABASE_URL, CLERK_SECRET_KEY (sk_test_... for dev), MASTER_ENCRYPTION_KEY (strong hex!), VOYAGE_API_KEY, NODE_ENV=development, optional ANTHROPIC etc.
- `apps/web/.env.local`: DATABASE_URL, AUTH_SECRET (or NEXTAUTH_SECRET), NEXTAUTH_URL, optional OAuth/Stripe/Voyage.
- `packages/mcp-server/.env`: UNIMATRIX_API_URL (http://localhost:3001 or prod), UNIMATRIX_API_KEY (generate later from web dashboard).
- **Generate strong keys:** `openssl rand -base64 32` (AUTH), `openssl rand -hex 32` (MASTER).

**4. DB Init & Run**
```bash
# Web (Prisma)
cd apps/web
pnpm prisma db push   # or migrate
pnpm dev              # http://localhost:3000

# Server (Fastify + MCP)
cd ../packages/server
pnpm db:migrate       # psql direct (may need $DATABASE_URL in env)
pnpm dev              # http://localhost:3001 (check /health)
```

**5. Bootstrap Users & Keys**
- Visit web, sign up (Clerk flow or credentials).
- Dashboard → Settings → generate MCP API key.
- Use key in mcp-server .env or Claude config.

**6. Claude Desktop Integration**
Add to `claude_desktop_config.json` (or via UI):
```json
{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["@unimatrix/mcp-server"],
      "env": {
        "UNIMATRIX_API_KEY": "your-key-from-dashboard",
        "UNIMATRIX_API_URL": "https://unimatrix-flax.vercel.app/api"  // or local 3001
      }
    }
  }
}
```
Test: "store_memory: working on X", then on new session "recall_context: where were we on X?"

**7. Verify**
- curl http://localhost:3001/health
- Web sign-in → create space/memory
- MCP tools respond in Claude
- No plaintext tokens in DB (query mcp_tokens after generate)

**Known Gaps / Next Steps to Production-Ready**
- **Complete web UI** (per IMPLEMENTATION_STATUS & roadmap: palace editor/tree/drag-drop, search UI, timeline viz, settings polish).
- **Add missing migration** for mcp_tokens (and any other assumed tables).
- **Async jobs:** Librarian (classifySpace etc.) — currently invoked? Wire to queue (Inngest/Trigger.dev/Bull) or pg cron for prod reliability.
- **Docs cleanup:** Archive or mark historical (ARCHITECTURE.md etc. describe pre-MCP AWS version). New single source-of-truth doc + diagrams.
- **Testing:** Add e2e (Claude Desktop + MCP), auth flows, encryption roundtrips, RLS isolation tests.
- **Mobile/Desktop:** Finish Expo/Electron UIs or deprecate in favor of MCP (Claude mobile already works via account link).
- **Prod hardening:** Remove dev shortcuts in non-test Clerk, per-user encryption keys (Phase 2), spend caps, full audit, Sentry, domain (unimatrix.app?), Stripe live keys, rate limits per-user/token.
- **CI/CD:** Add secret scanning (beyond Dependabot), e2e in workflows, preview deploys.
- **Scale:** HNSW/IVF indexes (in 004 migration), token budgets, cost tracking for Voyage/Claude.
- **Monetization:** Enforce tiers in web + MCP middleware (free=3 spaces?).

**Resources (prioritized current first):**
- README.md, LOCAL_SETUP.md, IMPLEMENTATION_STATUS.md (most accurate)
- SECURITY.md (now real policy), DEPLOY.md, UNIMATRIX_QUICKSTART.md (partial)
- Code: packages/server/src/{auth,security,handlers,app.ts}, apps/web/app/api + lib/auth.ts
- Historical (read for context only): ARCHITECTURE.md, MVP_Scope.md, LLM_ARCHITECTURE.md, NEON_VERCEL_MIGRATION.md, design.md, Project_Brief_for_Review.md, CLAUDE.md, predev-prompt.md, docs/mcp-setup.md, subdir READMEs/AGENTS.md/SETUP.md

**Status after fixes:** Core (MCP + encrypted memory + hybrid auth + API) is secure and runnable with DB+keys. UI and polish remain for full "RTX everywhere" experience. GitHub Dependabot alerts reduced/actionable via bumps+overrides.

*Memory as infrastructure, done right.*
