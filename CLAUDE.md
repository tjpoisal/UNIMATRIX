# Unimatrix — Claude Working Memory

> This file is read at the start of every session. Keep it current.

---

## What Is Unimatrix

A **memory palace app** — users create spatial memory structures (Palaces → Locations → Memories) to store and retrieve information using the method of loci. Multi-LLM powered. Mobile + Web.

**Tagline:** Your second brain, architectured like a palace.

---

## Apps & Stack

| App | Tech | URL |
|-----|------|-----|
| Web | Next.js 16, NextAuth v5, Prisma, Tailwind CSS | https://unimatrix.vercel.app |
| Mobile | React Native / Expo, Axios | Local dev / EAS Build |
| Backend API | Next.js Route Handlers (REST) | Same as web |
| Database | Neon PostgreSQL (via Prisma) | neon.tech |
| Email | Resend API (`onboarding@resend.dev`) | resend.com |
| Payments | Stripe | stripe.com |

**Monorepo layout:**
```
unimatrix/
├── apps/web/          Next.js 16 web app + API routes
├── apps/mobile/       Expo React Native
├── packages/llm/      Multi-LLM provider abstraction
├── vercel.json        Build config (pnpm turbo --filter=web)
└── CLAUDE.md          ← You are here
```

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
| `NEXTAUTH_URL` | Vercel | `https://unimatrix.vercel.app` |
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
- **Vercel project:** `stackmax/unimatrix` (team: `stackmax`)
- **GitHub repo:** `https://github.com/tjpoisal/UNIMATRIX`
- Vercel watches `main` and deploys automatically on every push
- No manual `vercel deploy` needed — git push IS the deploy

---

## Current Implementation Status

### ✅ Complete
- Multi-LLM provider package (`packages/llm`)
- Full REST API (auth, palaces, locations, memories, sync, search, export)
- NextAuth v5 auth (credentials, Google, GitHub)
- Forgot/reset password flow (web + mobile + email)
- Stripe payment tiers (checkout, webhooks)
- Prisma schema (users, palaces, locations, memories, sync, sessions, tokens)
- Web pages: login, register, forgot-password, reset-password, dashboard, pricing
- Mobile screens: login, register, forgot-password, reset-password
- Mobile ApiClient (full REST coverage)

### ⏳ In Progress / Next
- Web UI components (palace editor, location tree, memory editor)
- Mobile offline-first sync UI
- Rich markdown editor
- Search UI
- User profile / settings page

### 📋 Deferred
- Real-time sync (WebSocket)
- Collaborative palaces
- Desktop app (Electron)
- OAuth on mobile
- Data migration from AWS (old DynamoDB + AppSync stack — do NOT reactivate)

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

| Tier | Palaces | Memories | Price |
|------|---------|----------|-------|
| Free | 3 | 100 | $0 |
| Pro | Unlimited | Unlimited | $9.99/mo |
| Enterprise | Unlimited | Unlimited | $29.99/mo |

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

Last updated: 2026-05-19
