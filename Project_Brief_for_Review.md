# Unimatrix — Project Brief for External Review

**Prepared:** 2026-05-11  
**Updated:** 2026-05-11 (v2 — Gemini technical review incorporated)  
**Purpose:** Strategic and technical review by third-party AI systems

---

## Gemini Review Summary (already incorporated into spec below)

Gemini reviewed v1 of this brief and confirmed the following decisions, which are now locked:

| Decision | Status | Gemini finding |
|----------|--------|----------------|
| Dual-layer memory (episodic + semantic) | ✅ Confirmed correct | Industry standard for long-horizon agents; "token bomb" anti-pattern if verbatim only |
| Fastify + Supabase + Clerk stack | ✅ Confirmed solid | Bulletproof for MVP scale |
| 10-week timeline | ✅ Confirmed realistic | Headless-first approach de-risks the schedule |
| MCP mobile gap (clipboard workaround) | ✅ No longer needed | MCP configs are account-linked in 2026 — desktop config automatically available on Claude iOS/Android |
| BullMQ + Upstash Redis | ⚠️ Replaced | Use Inngest or Trigger.dev — serverless, zero Redis infra, built-in retries |
| Low-confidence review queue | ⚠️ Replaced | Poly-tagging: route to both candidate Spaces if confidence < 85%. Never quarantine. |
| text-embedding-3-small | ⚠️ Re-evaluate | Benchmark against Voyage AI Voyage Multimodal 3.5 with MRL (better compression, competitive recall) |
| recall_context search | ⚠️ Upgraded | Must use hybrid search: cosine similarity + exponential recency decay. Pure cosine similarity is a "relevance noise" trap. |
| Token budgeting in MCP | ⚠️ Added | Hard token cap on payloads: 4,000 tokens desktop, 800 tokens mobile/cellular |
| Encryption at rest | ⚠️ Added | Application-layer AES-256-GCM on content column from day one. BYOK in Enterprise tier. |

**Gemini's closing question (answered):** How to handle encryption at rest for a system that will ingest highly sensitive personal and corporate data. Answer: tiered strategy — Supabase default + application-layer column encryption (MVP) → per-user keys in Secrets Manager (Pro) → BYOK via AWS KMS/Vault (Enterprise) → self-hosted (sovereign). Content column is BYTEA not TEXT from day one so the migration is never needed.

---

## What is Unimatrix?

Unimatrix is a cloud-native AI memory system — a "Memory Palace" (Method of Loci-inspired) that gives any LLM client instant, persistent context across all devices. The core pain point it solves: every time you switch devices or start a new AI session, you lose all context and have to re-explain everything from scratch. Unimatrix eliminates that.

The system exposes memory to LLM clients via the **Model Context Protocol (MCP)** — the emerging standard for LLM tool integration. Rather than being a note-taking app or a chat history tool, Unimatrix is positioned as **memory infrastructure** — a universal context layer that any AI tool plugs into.

**The hero UX moment ("Return to Context"):** You're 3 days into a coding project with Claude on your laptop. You pick up your phone, open Claude, and ask "where were we?" — Claude immediately knows everything. Zero re-explaining. Zero copy-pasting. That's the product.

---

## Original Architecture Vision (full spec)

### Core Philosophy
- **Verbatim storage:** Preserve interaction history exactly as-is. Do not rely solely on LLM summarization.
- **Spatial hierarchy:** Organize memories into Wings (domains) → Halls (categories) → Rooms (subjects) → Drawers (raw entries)

### Key Features Planned
1. **Asynchronous Librarian Agent** — background LLM service that automatically routes, tags, and files unstructured inputs (voice notes, chat logs, dropped text) into the correct location without blocking the UI
2. **Multi-Modal Drawers** — support for images, audio, and diagrams; OCR/vision transcription before vector embedding
3. **CRDTs for Offline-First Sync** — Conflict-free Replicated Data Types for seamless offline-to-online sync on mobile
4. **State-Dependent Wake-Up Profiles** — mobile on cellular gets a concise context payload; desktop IDE gets a deep-dive payload
5. **Time-Aware Invalidation** — when facts change, old data is tagged with expiration timestamps rather than deleted; preserves the full timeline of truth
6. **Security & Ephemerality** — auto-redaction of PII/API keys before embedding; Ephemeral Rooms that auto-delete after 24 hours

### Target Tech Stack
- Backend/API: Node.js + TypeScript
- Web portal: Next.js
- Mobile: SwiftUI (iOS-first, iPhone 15 Pro Max optimized)
- Integration: Cloud-hosted MCP server
- Database: PostgreSQL + pgvector

---

## Strategic Analysis (what we concluded)

### What's genuinely strong
- **MCP-native architecture** — being MCP-first is a real moat, not just a feature; MCP is becoming the standard LLM integration protocol
- **Time-aware invalidation** — no competitor tracks the timeline of truth; "show me what I knew about X on date Y" is genuinely novel
- **The Librarian agent** — auto-filing is the magic moment; "drop anything in, it files itself" is the hook that sells the product
- **Auto-redaction** — PII/API key scrubbing before embedding is table-stakes for enterprise adoption

### What needs improvement
- **The spatial metaphor must be invisible** — Wings/Halls/Rooms/Drawers is too cognitively heavy for daily use. Users should interact via natural language; the palace structure should be an implementation detail handled entirely by the Librarian, not a navigation layer users traverse.
- **Verbatim storage needs a dual-layer approach** — at scale, storing everything verbatim creates massive storage costs and retrieval noise. Solution: (1) a living synthesis layer showing what's current and true now, and (2) a verbatim archive for audit and temporal replay. LLMs query Layer 1 by default.
- **Don't roll custom CRDTs** — implementing CRDTs for complex nested hierarchical data is one of the hardest distributed systems problems. Use Yjs or Automerge (proven libraries). CRDTs are not a differentiator; correctness is.
- **The rigid 4-level hierarchy is too constraining** — real knowledge doesn't fit cleanly into 4 levels. Better: flexible tagging + auto-clustering, with the spatial visualization as a layer on top, not a storage constraint.

### What to eliminate or defer from MVP
- **Next.js web portal** — Phase 2. Developers use MCP; consumers use mobile. Web portal is a management interface, not a priority.
- **Custom OCR pipeline** — never build this. Use Claude Vision / GPT-4V. Not a differentiator.
- **Ephemeral Rooms (24hr auto-delete)** — replace with a "scratchpad" Space tag. Auto-deletion creates user anxiety.
- **iOS-only mobile focus** — start iOS-first but architect for Android parity from day one.
- **Multi-modal ingestion** — Phase 2. Text-only for MVP; image/audio via existing APIs is 2 days of work later.
- **Memory graph visualization** — Phase 2. The viral feature, but only worth building after the memory itself is worth visualizing.
- **Team/shared palaces** — Phase 3. The B2B moat. Schema must account for it from day one.

### What will make it a hit (missing from original spec)
1. **"Memory as Infrastructure" positioning** — not a note app; a universal context layer for the AI era. Any LLM plugs in via MCP.
2. **Team/Shared Palaces** — shared team wing where multiple people's AI sessions feed a collective knowledge base. Enterprise moat. No competitor has this.
3. **Temporal Replay** — "show me what I knew about X on date Y." Enabled by time-aware invalidation. Premium tier feature. Genuinely novel.
4. **Memory Graph visualization** — visual map of your knowledge palace. The viral screenshot moment. Growth loop.
5. **Integration marketplace** — Notion, Obsidian, Apple Notes, Bear, Readwise as input sources. Palace becomes the universal destination.
6. **Self-hosted / privacy-first tier** — unlocks enterprise, government, healthcare, privacy-conscious devs. Auto-redaction is already planned — lean into it as a trust differentiator.

---

## MVP Scope (10-week build plan)

### The one thing the MVP must prove
When you open any AI client on any device, it instantly knows where you left off — zero re-establishment friction.

### What we're building in MVP
A cloud-hosted MCP server backed by a memory engine and an async Librarian agent. No mobile app. No full web portal. One integration target: Claude Desktop.

### Phase breakdown
| Phase | Weeks | What gets built |
|-------|-------|-----------------|
| 0 — Foundation | 1–2 | Supabase + pgvector, Clerk auth, Fastify scaffold, Railway CI/CD |
| 1 — Memory engine | 3–4 | Memory CRUD, vector embed on write, semantic search, Space auto-creation, time-aware status flags |
| 2 — Librarian agent | 5–6 | LLM classification pipeline (Claude Haiku), auto-tag and route, BullMQ async queue, confidence scoring |
| 3 — MCP server | 7–8 | 4 core MCP tools, Claude Desktop integration, desktop wake-up profile, end-to-end RTX test |
| 4 — Ship + learn | 9–10 | Minimal management UI, onboarding flow, beta signup, 5 daily active beta users |

### The 4 MCP tools (nothing more for MVP)
| Tool | Purpose |
|------|---------|
| `store_memory(content, hint?)` | Drops raw content into Librarian queue. Non-blocking. Always returns immediately. |
| `recall_context(topic?, limit?)` | Returns most relevant memories for current session. The RTX moment. |
| `search_memories(query)` | Semantic search across all memories. |
| `get_timeline(topic)` | Chronological view with invalidation markers. Temporal Replay preview — premium bait. |

### Hierarchy — simplified for MVP
- **Spec:** Wing → Hall → Room → Drawer (4 levels)
- **MVP:** Space → Memory + tags (2 levels, Librarian assigns both automatically)
- Schema has `parent_id` on `spaces` table so Phase 2 hierarchy migration is non-breaking
- Schema has `org_id` placeholder for Phase 3 team palaces

### Tech stack
- **Runtime:** Node.js 20 + TypeScript (strict)
- **API:** Fastify + Zod
- **MCP:** @modelcontextprotocol/sdk
- **Database:** Supabase (PostgreSQL + pgvector)
- **Librarian LLM:** Claude Haiku (~$0.0005 per memory classification)
- **Queue:** BullMQ + Upstash Redis
- **Auth:** Clerk
- **Hosting:** Railway
- **Embeddings:** OpenAI text-embedding-3-small or Voyage AI (evaluate both)

### Database schema (MVP)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES spaces(id),  -- nullable; ready for Phase 2 depth
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  space_id UUID REFERENCES spaces(id),
  content TEXT NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'active',     -- active | superseded | archived
  superseded_by UUID REFERENCES memories(id),
  superseded_at TIMESTAMPTZ,
  confidence FLOAT,
  embedding VECTOR(1536),
  tags TEXT[],
  source TEXT,                      -- 'mcp' | 'api' | 'import'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ
);

CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON memories (user_id, status);
CREATE INDEX ON memories (space_id, created_at DESC);
```

### MVP success criteria
1. `recall_context` returns relevant memories in < 3 seconds from a cold Claude Desktop session
2. Librarian correctly routes memories to the right Space with > 80% accuracy on 50 varied test inputs
3. All 4 MCP tools work end-to-end in Claude Desktop without errors
4. 5 beta users actively using it daily for 2+ consecutive weeks

---

## Mobile Access (the honest gap)

The MVP is intentionally desktop/developer-centric. Mobile splits into two separate problems:

**Problem 1 — Capture (input):** User wants to drop thoughts on the go.
- Solved in MVP via: capture PWA (mobile web app, ~1 day to build), iOS Shortcuts (share sheet integration, ~2 hrs), email-to-palace endpoint (forward anything to a unique address), optional Telegram bot
- These bridge solutions cover the capture side without a native app

**Problem 2 — Context delivery (output):** User opens an LLM app on mobile and needs it to know their context.
- The honest constraint: most mobile LLM apps (Claude iOS, ChatGPT iOS) do not yet support user-configured MCP servers. This is an ecosystem gap, not a product gap.
- MVP workaround: manual "Copy context to clipboard" button in the PWA; user pastes into any AI chat.
- Phase 2 (months 4–8): Native SwiftUI (iOS) and Jetpack Compose (Android) apps with home screen widgets, share extensions, Siri/Google Assistant shortcuts, offline queue with optimistic sync
- Phase 3 (months 9+): CRDT sync (Yjs), state-dependent wake-up profiles (cellular vs. Wi-Fi), full RTX on mobile when MCP support lands in mobile LLM apps
- The bet: Claude mobile (and/or strong third-party clients) adds user-configured MCP support during the Phase 2 window. Reasonable given the pace of the ecosystem.

---

## Monetization Model

| Tier | Price | What's included |
|------|-------|-----------------|
| Free | $0 | Personal palace, limited storage, basic MCP access |
| Pro | $15–20/month | Unlimited storage, multi-modal, priority Librarian, Temporal Replay |
| Team | $30–50/seat/month | Shared palaces, team analytics, audit logs |
| Enterprise | Custom | Self-hosted, SSO, compliance, SLA |

---

## Competitive Landscape

- **Mem.ai** — AI-powered note-taking with auto-organization. No MCP. No cross-device LLM context delivery. No team shared memory.
- **Rewind** — records everything on your device, searchable. Local-only, no cloud sync, no MCP, privacy concerns, no Librarian.
- **Notion AI** — document workspace with AI. Not a memory layer; requires manual structure; no MCP integration.
- **ChatGPT Memory** — flat memory for one LLM client only. Not portable across clients. No hierarchy, no Temporal Replay, no team features.
- **Claude Projects** — context per-project within Claude only. Not cross-client, not cross-device via MCP.

**Unimatrix's moat:** MCP-native (works with any LLM client), time-aware invalidation (Temporal Replay), team shared palaces, and the Librarian agent as a zero-friction filing system. None of these exist together in any single product today.

---

## Key Open Questions for Review

Questions 1–7 below were answered by Gemini and are now locked. Questions 8–13 are open for Grok's review.

**Already answered (Gemini):**
1. ✅ Dual-layer memory is correct — episodic (verbatim) + semantic (synthesis). Standard pattern for long-horizon agents.
2. ✅ MCP mobile risk is moot — account-linked MCP configs already sync across Claude Desktop and Claude mobile in 2026.
3. ✅ Stack confirmed — Fastify + Supabase + Clerk is solid. BullMQ replaced with Inngest/Trigger.dev.
4. ✅ Embedding model — benchmark Voyage AI Voyage Multimodal 3.5 (MRL) against text-embedding-3-small before committing.
5. ✅ Librarian ambiguous routing — poly-tag to both Spaces at < 85% confidence. No review queue.
6. ✅ Biggest technical risks — relevance noise (solved by hybrid search + recency decay) and context window exhaustion (solved by hard token budgets).
7. ✅ Timeline — 10 weeks confirmed realistic for 1–3 person team given headless-first scope.

**Open for Grok:**

8. The recency decay formula uses `exp(-λ × days_since_created)` with λ = 0.01 as a starting point. Is there a better-validated approach for memory retrieval systems — e.g., a learned decay rate per Space or memory type rather than a global constant?

9. We're using Voyage AI with MRL-compressed 512-dimension embeddings stored in pgvector. At what user scale (memories per user, total users) does pgvector become a bottleneck, and what's the right migration path — Qdrant, Weaviate, or something else?

10. The Librarian uses Claude Haiku for classification. Is there a strong case for fine-tuning a smaller open-source model (e.g., a quantized Llama variant) for the routing task to reduce per-classification cost at scale? What's the break-even point?

11. Poly-tagging (routing to multiple Spaces) solves the ambiguous filing problem but creates a retrieval fan-out issue — the same memory appears in multiple Spaces, which could skew `recall_context` results toward frequently poly-tagged content. How should this be normalized?

12. What are the biggest security attack surfaces in an MCP server that ingests and returns sensitive user memories? Specifically: prompt injection via `store_memory`, exfiltration via a malicious MCP client, and cross-user data leakage through the vector index.

13. Is there a monetization or distribution angle we're missing? Specifically: should the MCP server itself be open-source (with a managed cloud offering as the revenue model), or is keeping it closed better for defensibility?
