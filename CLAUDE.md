# Unimatrix — Claude Working Memory

> This file is read at the start of every session. Keep it current.

---

## What Is Unimatrix — THE REAL PRODUCT (READ THIS FIRST)

**Unimatrix is a universal AI memory persistence and cross-device continuity layer.**

It runs as an MCP server in the background. Any LLM (Claude, ChatGPT, Gemini, etc.) connects to it and can read/write memories from all previous conversations across all devices. The user never loses context — ever.

**Core use case:** A user starts a research conversation with ChatGPT on their iPhone. They pick up their iPad and open Claude. Claude connects to Unimatrix via MCP and continues EXACTLY where ChatGPT left off — full context, no re-explaining. They get home, open their desktop where they run a private Unimatrix instance on a home server. Multiple AIs are now in the room together in a collaborative conversation — each LLM can chime in with ideas, corrections, or contributions in real time.

**This is NOT a study app. This is NOT a method of loci memorization tool. This is NOT for students memorizing flashcards.**

The "Palace → Location → Memory" schema is the underlying data model for organizing AI context — a Palace is a project/workspace, a Location is a context within it (topic, session, device), a Memory is an AI-generated context entry. The metaphor is architectural, not mnemonic.

**Tagline:** Your AI remembers everything. Everywhere.

---

## The Four Pillars

1. **Cross-LLM memory continuity** — Start with ChatGPT, continue with Claude, switch to Gemini. Same context, always.
2. **Cross-device sync** — iPhone → iPad → desktop → home server. The conversation never breaks.
3. **Self-hosted private cloud** — Power users run Unimatrix on their own hardware. Full privacy. Our cloud is available for everyone else with enterprise-grade security and isolation.
4. **Collaborative AI desktop** — Multiple LLMs participate in a single conversation simultaneously. An AI chimes in when it has a relevant point, idea, or correction. Think: a room full of expert AIs collaborating with the user.

---

## Apps & Stack

| App | Tech | Purpose |
|-----|------|---------|
| Web app | Next.js 16, NextAuth v5, Prisma, Tailwind CSS | Memory browser UI, account management, settings, memory viewer |
| Mobile | React Native / Expo, Axios | On-the-go access — read/write memories, view conversation context |
| MCP Server | packages/server (Fastify) | **THE CORE PRODUCT** — the MCP endpoint that LLMs connect to |
| LLM Package | packages/llm | Multi-LLM abstraction (Claude, GPT-4, Gemini, Groq, Ollama) |
| Backend API | Next.js Route Handlers (REST) | Auth, sync, memory CRUD |
| Database | Neon PostgreSQL (via Prisma) | Persistent memory store |
| Self-hosted | Docker / home server | Private deployment option for power users |
| Email | Resend API | Transactional email |
| Payments | Stripe | Cloud tier subscriptions |

**Monorepo layout:**
```
unimatrix/
├── apps/web/          Next.js web app — memory browser, settings, account
├── apps/mobile/       Expo React Native — mobile memory access
├── apps/desktop/      Electron (planned) — collaborative multi-LLM conversation UI
├── packages/llm/      Multi-LLM provider abstraction layer
├── packages/server/   Fastify MCP server — what LLMs actually connect to
├── vercel.json        Build config (pnpm turbo --filter=web)
└── CLAUDE.md          ← You are here
```

**URLs (Vercel legacy - primary deployment now on Render):**
- Old Cloud (Vercel): https://unimatrix-flax.vercel.app
- Marketing site: https://deployunimatrix.com
- MCP endpoint (legacy Vercel): https://unimatrix-flax.vercel.app/api/mcp
- MCP endpoint (Render primary): https://<your-unimatrix-mcp-service>.onrender.com/mcp (see render.yaml, RENDER.md)
- MCP endpoint (self-hosted): http://[user-server]:PORT/mcp

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0F1C` | All screens |
| Accent/CTA | `#00F5FF` | Buttons, links, borders |
| Accent hover | `#00D9FF` | Hover states |
| Card bg | `#111827` (web) / `#1A1F35` (mobile) | Form cards |
| Text primary | `#F1F5F9` (web) / white (mobile) | Headings |
| Text muted | `#94A3B8` (web) / `#6B7280` (mobile) | Subtext |
| Border | `#334155/30` (web) / `#00F5FF/20` (mobile) | Inputs |
| Error | `#EF4444` | Error states |

**CRITICAL:** Each app is a separate product with its own CSS. Do NOT mix web and mobile color values or component styles.

---

## Auth Flow

- **NextAuth v5** with Credentials + Google + GitHub providers
- JWT sessions (no database sessions)
- Password hashing: bcryptjs (10 rounds)
- Password reset: `VerificationToken` model (32-byte hex token, 1hr expiry)
- Email: Resend API via `apps/web/lib/email.ts`

### Auth Routes (web)
| Route | Purpose |
|-------|---------|
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/auth/forgot-password` | Request reset email |
| `/auth/reset-password?token=&email=` | Set new password |

### Auth API Routes
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/register` | POST | Create user |
| `/api/auth/forgot-password` | POST | Send reset email (always 200) |
| `/api/auth/reset-password` | POST | Set new password |

### Mobile Auth
- `apiClient.login()`, `.register()`, `.forgotPassword()`, `.resetPassword()`
- Screens: `(auth)/login.tsx`, `(auth)/register.tsx`, `(auth)/forgot-password.tsx`, `(auth)/reset-password.tsx`

---

## Environment Variables (Vercel Production)

| Variable | Where set | Notes |
|----------|-----------|-------|
| `DATABASE_URL` | Vercel | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Vercel | Random base64 string |
| `NEXTAUTH_URL` | Render (or Vercel legacy) | `https://<your-web-service>.onrender.com` (or old vercel) |
| `RESEND_API_KEY` | Vercel ✅ | `re_eGJUC6th_...` |
| `EMAIL_FROM` | Vercel ✅ | `Unimatrix <onboarding@resend.dev>` |
| `GOOGLE_CLIENT_ID` | Vercel | OAuth |
| `GOOGLE_CLIENT_SECRET` | Vercel | OAuth |
| `GITHUB_CLIENT_ID` | Vercel | OAuth |
| `GITHUB_CLIENT_SECRET` | Vercel | OAuth |
| `STRIPE_SECRET_KEY` | Vercel | Payments |
| `STRIPE_WEBHOOK_SECRET` | Vercel | Webhook validation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Vercel | Client-side Stripe |

---

## Deployment Workflow

**Rule: Every change must be committed to GitHub AND deployed to Vercel.**

```bash
# Stage auth-related changes
git add <files>
git commit -m "type(scope): description"
git push origin main
# → Vercel auto-deploys from main (webhook connected)
```

- **Only branch:** `main`
- **GitHub repo:** `https://github.com/tjpoisal/UNIMATRIX`
- **Primary deploy:** Render via render.yaml Blueprint (Postgres + unimatrix-mcp Fastify + unimatrix-web custom server + optional worker). See RENDER.md
- **Legacy:** Vercel (vercel.json marked as legacy; old project unimatrix-flax)
- git push to main triggers Render Blueprint deploys (and legacy Vercel if still connected)

---

## Current Implementation Status

### ✅ Complete
- Multi-LLM provider package (`packages/llm`) — Claude, GPT-4, Gemini, Groq, Ollama
- Full REST API (auth, palaces/workspaces, locations/contexts, memories, sync, search, export)
- MCP server (`packages/server`) — LLMs connect here to read/write memories
- NextAuth v5 auth (credentials, Google, GitHub)
- Forgot/reset password flow (web + mobile + email)
- Stripe payment tiers (checkout, webhooks)
- Prisma schema (users, palaces, locations, memories, sync, sessions, tokens)
- Web pages: login, register, forgot-password, reset-password, dashboard, pricing
- Web UI: memory browser, palace/context manager (dashboard)
- Mobile screens: login, register, forgot-password, reset-password
- Mobile ApiClient (full REST coverage)
- DNS + email forwarding: deployunimatrix.com via ImprovMX

### ⏳ In Progress / Next
- **MCP protocol completeness** — ensure the MCP server exposes: `remember`, `recall`, `list_contexts`, `continue_from`, `get_recent`
- **Cross-LLM handoff** — when Claude connects via MCP, it should get the last N messages from *any* LLM session
- **Mobile memory viewer** — show what the AI remembers, by context/device
- **Real-time sync** (WebSocket) — push new memories to all connected clients immediately
- **Collaborative desktop app** (Electron) — multi-LLM simultaneous conversation UI

### 📋 Deferred
- Desktop app full build (Electron + WebSocket multi-LLM room)
- Self-hosted Docker packaging + one-click deploy
- OAuth on mobile
- Home server discovery (mDNS/local network)
- Data migration from AWS (old DynamoDB + AppSync stack — do NOT reactivate)

---

## How the MCP Integration Works

When a user configures an LLM client (Claude Desktop, Cursor, etc.) with the Unimatrix MCP:

```json
{
  "mcpServers": {
    "unimatrix": {
      "url": "https://<your-render-mcp>.onrender.com/mcp",  // or legacy vercel /api/mcp
      "apiKey": "USER_API_KEY"
    }
  }
}
```

The LLM can then call:
- `unimatrix.remember(content, context?)` — store a memory from this conversation
- `unimatrix.recall(query)` — semantic search across all memories
- `unimatrix.get_recent(limit?)` — last N memories across all LLMs/devices
- `unimatrix.continue_from(session_id?)` — get full context of a prior session
- `unimatrix.list_contexts()` — list all active palaces/workspaces

This is how Claude on iPad picks up where ChatGPT left off on iPhone — both call `get_recent()` at the start of a conversation.

---

## Key Files to Know

```
apps/web/
├── app/
│   ├── api/auth/             ← Auth API routes
│   ├── auth/                 ← Auth pages (login, register, etc.)
│   └── (dashboard)/          ← Protected dashboard routes
├── components/auth/          ← LoginForm, RegisterForm, etc.
├── lib/
│   ├── api.ts                ← API client (web)
│   ├── email.ts              ← Resend email utility
│   └── prisma.ts             ← Prisma client singleton
└── prisma/schema.prisma      ← DB schema

apps/mobile/
├── app/(auth)/               ← Auth screens
├── app/(tabs)/               ← Main app tabs
└── lib/api.ts                ← Mobile ApiClient (Axios)
```

---

## Stripe Tiers

| Tier | Workspaces | Memories | Devices | LLMs | Price |
|------|-----------|----------|---------|------|-------|
| Free | 3 | 1,000 | 2 | Any | $0 |
| Pro | Unlimited | Unlimited | Unlimited | Any | $9.99/mo |
| Enterprise | Unlimited | Unlimited | Unlimited + self-host | Any | $29.99/mo |

Enterprise = self-hosted Docker option + priority support + team sharing.

---

## Notes & Gotchas

1. **No CLAUDE.md existed before** — this is the first one. Check it every session.
2. **Vercel `framework` shows "fastify"** in the API but builds as Next.js — this is a stale API field, ignore it.
3. **`EMAIL_FROM` must use `onboarding@resend.dev`** until a custom domain is verified on Resend.
4. **Mobile API URL** is set via `EXPO_PUBLIC_API_URL` env var (defaults to `http://localhost:3000/api`).
5. **Git lock files** sometimes appear — run `rm -f .git/*.lock` before committing if git fails.
6. **Old AWS stack** (DynamoDB, AppSync, Lambda) is documented in `CLAUDE_CODE_SYSTEM_PROMPT.md` — that's the old architecture. We are on Neon + Vercel now.
7. **`pnpm-lock.yaml` conflicts** — always use `pnpm install --frozen-lockfile` in CI.

---

---

## The Competitive Moat

Nobody else is doing THIS specifically:
- Mem0/MemGPT do per-LLM memory but NOT cross-LLM portability
- No product lets you start on ChatGPT and seamlessly continue on Claude
- No product offers self-hosted MCP memory with a cloud fallback
- The collaborative multi-LLM desktop room is entirely novel

The MCP protocol is the key — it's the standard interface that makes this work with ANY LLM without custom integrations.

---

Last updated: 2026-05-20
