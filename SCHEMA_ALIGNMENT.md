# Prisma Schema Alignment — Technical Debt & Migration Path

## Current State (as of May 2026)

We have **two different Prisma schemas** that have diverged:

| Aspect              | `apps/web/prisma/schema.prisma`          | `packages/server/prisma/schema.prisma`              |
|---------------------|------------------------------------------|-----------------------------------------------------|
| Auth                | NextAuth (users, accounts, sessions)     | Clerk (`clerk_id`)                                  |
| Core Model          | Palace → Location → Memory               | User → Space (hierarchical) → Memory                |
| Embeddings          | Basic                                    | Full Voyage + pgvector + librarian processing       |
| Memory Features     | Soft delete, tags                        | Status (active/superseded/archived), Source, summary, embedding |
| Advanced Features   | Basic                                    | McpToken, AgentRun, AuditLog, Space classification  |
| Migrations          | Standard Prisma                          | Raw SQL migrations in `packages/server/migrations/` |

The **web dashboard UI** is currently built against the older Palace/Location model + NextAuth.

The **MCP protocol + Librarian** (the real product) lives in the richer `packages/server` schema.

## Recommended Long-term Direction

**Make `packages/server` schema the source of truth.**

Reasons:
- It was designed for the actual use case (multi-LLM memory + agents)
- Has proper embedding + semantic search infrastructure
- Clerk is more modern for API-first products
- The "Space" model is more flexible than Palace/Location

## Migration Phases (Proposed)

### Phase 1 — Short term (Current)
- Keep both schemas
- Web app talks to its schema
- MCP server talks to its schema
- Use one shared Postgres database (possible but requires careful table naming or separate schemas in Postgres)

### Phase 2 — Bridge Layer
- Create `packages/db` with shared types + a unified Prisma client (or two clients with mapping layer)
- Add API routes in web that proxy / translate to the richer models
- Gradually migrate the dashboard UI to use "Spaces" instead of Palaces

### Phase 3 — Full Unification
- Migrate all users/data from old schema to new schema (one-time ETL)
- Delete `apps/web/prisma/schema.prisma`
- Web app imports Prisma client from the server package (or shared package)
- Unify auth (strongly recommend moving web to Clerk)

## Immediate Practical Steps (Do These Now)

1. **Never add new models to the web schema** unless they are purely UI concerns.
2. All new backend features (especially anything MCP or agent related) must go into `packages/server` schema.
3. Document every table that exists in both schemas.

## Auth Unification Path (Critical)

Current split:
- Web → NextAuth (email/password + Google/GitHub)
- MCP → Clerk (designed for machine/API auth via tokens)

**Best path forward:**
- Move the entire product to Clerk
- Use Clerk's JWT + machine tokens for MCP
- NextAuth becomes a legacy compatibility layer during transition

A small bridging utility exists in early form in `apps/web/lib/api-auth.ts`.

## Decision Needed

We need a product decision:
**Option A**: Invest in unifying on the advanced schema (recommended)
**Option B**: Keep the split and treat the web schema as "presentation layer" only

Until this decision is made, **do not build major new features against the web schema**.

---

Last updated: 2026-05 (during Render migration)
