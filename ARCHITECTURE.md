# Unimatrix — AWS-Native Memory Palace with Multi-LLM Integration
## Comprehensive Architecture & Development Plan (v2.0)

---

## CONTEXT

**Problem:** LLM users (Claude, ChatGPT, Gemini, etc.) lack a unified, cross-platform memory palace system. Desktop tools don't sync to mobile; each LLM has isolated context windows. Users lose structured knowledge across devices and can't leverage multiple LLMs collaboratively.

**Vision:** Unimatrix is a hierarchical, text-first memory palace app for iOS + Android + Web + Desktop (Electron), with:
- **AWS-native backend** (Cognito, RDS PostgreSQL, AppSync GraphQL, Lambda)
- **Multi-LLM API integration** (Claude, GPT-4, Gemini, Groq, Ollama) from v1
- **Inter-LLM collaboration** (agents write/read shared palaces)
- **Real-time sync** across all devices via AppSync subscriptions
- **Self-hosted backend** as premium tier (Docker + API)
- **Open Claw Agent** orchestration for multi-agent workflows

**Market:** Mem0 is LLM memory API; Desktop Memory Palace (3D) exists for power users. Gap: mobile-first, multi-platform, real-time sync, native LLM integration, collaborative agent support.

---

## STRATEGIC DECISIONS (Locked)

| Decision | Choice | Why |
|----------|--------|-----|
| Backend | AWS-native (Cognito + RDS + AppSync + Lambda) | Production-grade, real-time, scalable, self-host option |
| LLM Integration | v1 (5 providers: Claude, GPT-4, Gemini, Groq, Ollama) | Core value prop; agents need multi-provider access |
| Collaboration | Inter-LLM (agents share palace writes) | Enable agentic workflows; reduce context fragmentation |
| Real-time Sync | AppSync subscriptions (WebSocket) | Production-grade, AWS-native, offline queue built-in |
| Self-Hosted | v1 Premium (Docker containers + API) | Differentiate from SaaS; enterprise value |
| UI Paradigm | Hierarchical/Tree (text-first) + LLM editor | Mobile-friendly, fast search, native LLM integration |
| Agent Orchestration | Open Claw Agent framework | Multi-agent workflows, routing, cost optimization |
| Free Tier | 3 memory palaces, 1 LLM provider | Freemium hook; upgrade for unlimited + multi-provider |
| Monetization | Freemium SaaS ($9.99-29.99/month) + Self-host license | Standard model + enterprise revenue |
| Project Structure | Monorepo (pnpm) at /Users/tim/unimatrix/ | Separated from weather app; shared types/api/ui |

---

## ARCHITECTURE OVERVIEW

### System Components

```
┌────────────────────────────────────────────────────────────┐
│                        UNIMATRIX                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ ┌────┐ │
│  │  iOS App     │  │ Android App  │  │ Web App  │ │ DE │ │
│  │  (Expo)      │  │  (Expo)      │  │(Next.js) │ │ sk │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │top │ │
│         │                 │               │       └────┘ │
│         └─────────────────┼───────────────┘               │
│                           │                               │
│       ┌─────────────────────────────────────┐            │
│       │  Open Claw Agent Orchestrator       │            │
│       │  (Multi-agent routing + analysis)   │            │
│       └────────────────┬────────────────────┘            │
│                        │                                  │
│       ┌────────────────▼────────────────┐               │
│       │   LLM Provider Registry         │               │
│       │  ┌──────┬──────┬───┬──────┐     │               │
│       │  │Claude│OpenAI│Gem│Groq  │ ... │               │
│       │  └──────┴──────┴───┴──────┘     │               │
│       │  + Ollama (local models)        │               │
│       └────────────────┬────────────────┘               │
├────────────────────────┼──────────────────────────────────┤
│                 AWS CLOUD INFRASTRUCTURE                 │
│  ┌──────┐  ┌──────────────┐  ┌──────────────┐           │
│  │Cognito │ │RDS PostgreSQL │ │ AppSync      │           │
│  │Auth   │ │(Palaces, Mem. │ │(GraphQL +    │           │
│  │+ MFA │ │Agents, Metrics)│ │Subscriptions)│           │
│  └──────┘  └──────────────┘  └──────────────┘           │
│                                                            │
│  ┌──────────────────────────────────────┐               │
│  │  Lambda Functions (Mutations)        │               │
│  │  - createPalace, updateMemory, etc.  │               │
│  │  - LLM routing & cost optimization   │               │
│  │  - Agent collaboration handlers      │               │
│  └──────────────────────────────────────┘               │
│                                                            │
│  ┌────────────────────────────────────┐                │
│  │ ElastiCache (Redis)                │                │
│  │ - Session cache, pub/sub            │                │
│  │ - Agent state store                 │                │
│  └────────────────────────────────────┘                │
├────────────────────────────────────────────────────────────┤
│              OPTIONAL: SELF-HOSTED BACKEND                │
│  Docker Compose: API Gateway + PostgreSQL + Redis         │
│  (Premium tier: users run their own environment)          │
└────────────────────────────────────────────────────────────┘
```

### Data Model (AWS RDS PostgreSQL)

```sql
-- Users & Auth (managed by Cognito, synced to DB)
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  tier: free|pro|enterprise,
  subscription_status: active|trial|canceled,
  created_at, updated_at
)

-- Memory Palaces
palaces (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  name VARCHAR,
  description TEXT,
  is_public BOOLEAN,
  created_at, updated_at
)

-- Hierarchical Locations (nested folders)
locations (
  id UUID PRIMARY KEY,
  palace_id UUID FOREIGN KEY,
  parent_id UUID (nullable for nested),
  name VARCHAR,
  position INT (sort order),
  created_at, updated_at
)

-- Memories with LLM metadata
memories (
  id UUID PRIMARY KEY,
  location_id UUID FOREIGN KEY,
  content TEXT (markdown),
  tags TEXT[] (jsonb),
  
  -- LLM tracking
  llm_provider VARCHAR (Claude, OpenAI, Gemini, Groq, Ollama),
  llm_model VARCHAR (gpt-4, claude-3-opus, etc),
  tokens_used INT,
  latency_ms INT,
  cost_usd DECIMAL(10,6),
  
  created_at, updated_at, last_accessed
)

-- Agent Collaboration
agent_collaborations (
  id UUID PRIMARY KEY,
  palace_id UUID FOREIGN KEY,
  agent_name VARCHAR,
  agent_provider VARCHAR,
  writes_count INT,
  reads_count INT,
  last_interaction TIMESTAMP,
  created_at
)

-- LLM Provider Usage Tracking (for billing + metrics)
llm_usage_metrics (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  palace_id UUID FOREIGN KEY,
  provider VARCHAR,
  model VARCHAR,
  request_type (query|write|stream),
  tokens_input INT,
  tokens_output INT,
  cost_usd DECIMAL(10,6),
  latency_ms INT,
  timestamp TIMESTAMP
)

-- Sync State (for offline-first mobile)
sync_state (
  device_id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  last_sync TIMESTAMP,
  device_name VARCHAR,
  pending_changes JSONB (queue of offline mutations)
)

-- Self-Hosted Backend License
self_hosted_licenses (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  license_key VARCHAR UNIQUE,
  activation_date TIMESTAMP,
  expires_at TIMESTAMP,
  max_users INT,
  created_at
)
```

### Tech Stack

**Mobile (iOS/Android):**
- Expo ~54 (React Native 0.81), TypeScript 5.9
- Zustand (state) + expo-sqlite (local cache)
- AppSync (WebSocket subscriptions)
- TweetNaCl + expo-crypto (optional encryption)
- Offline sync queue (pending mutations)

**Web:**
- Next.js 15 (App Router), React 19, TypeScript
- Zustand, Tailwind CSS
- AppSync client (real-time subscriptions)
- Monaco Editor (rich markdown support)

**Desktop (Electron):**
- Electron ~latest, wraps Next.js web app
- Auto-updates (electron-updater)
- Native window management

**LLM Integration (@unimatrix/llm):**
- Anthropic SDK (Claude), OpenAI SDK (GPT-4)
- @google/generative-ai (Gemini), groq-sdk (Groq)
- Ollama HTTP client (local models)
- LLMProvider abstraction + Factory + Registry
- Open Claw Agent framework for orchestration

**Backend (AWS):**
- Cognito (auth + MFA)
- RDS PostgreSQL (data + full-text search)
- AppSync (GraphQL + real-time subscriptions)
- Lambda (mutations, LLM routing, agents)
- ElastiCache Redis (session, pub/sub, agent state)
- CloudWatch (monitoring, cost tracking)

**Shared Packages (pnpm monorepo):**
- @unimatrix/types — TypeScript interfaces (Palace, Memory, Agent, LLMProvider)
- @unimatrix/api — Apollo GraphQL client + AppSync + Cognito
- @unimatrix/ui — React components (Tree, Editor, AuthForm, SearchBar)
- @unimatrix/llm — Multi-provider LLM clients + registry + orchestration

---

## MVP PHASE 1 (24-32 weeks)

### v1.0 Feature Set

**Core Memory Palace:**
- ✅ Cognito signup/login (with optional MFA)
- ✅ Create memory palaces (3 free, unlimited paid)
- ✅ Hierarchical locations (nested folders, drag-drop reordering)
- ✅ Add/edit/delete memories (markdown + rich text)
- ✅ Full-text search (PostgreSQL tsvector)
- ✅ Tags + filtering
- ✅ Export as JSON/markdown

**Multi-LLM Integration (NEW IN v1):**
- ✅ LLMProvider abstraction (Claude, OpenAI, Gemini, Groq, Ollama)
- ✅ LLMProviderFactory + LLMProviderRegistry
- ✅ Intelligent routing (complexity analysis → optimal provider)
- ✅ Cost tracking per interaction
- ✅ LLM metadata in memories (provider, model, tokens, cost, latency)
- ✅ Health checks + fallback providers
- ✅ Stream support for long responses

**Inter-LLM Collaboration (NEW IN v1):**
- ✅ Multiple agents can write to same palace
- ✅ Agent metadata tracking (writes, reads, last interaction)
- ✅ Shared access controls between agents
- ✅ Agent collaboration history

**Real-time Sync (NEW IN v1):**
- ✅ AppSync GraphQL subscriptions (WebSocket)
- ✅ Offline-first mobile (expo-sqlite + sync queue)
- ✅ Conflict resolution (last-write-wins)
- ✅ Cross-platform consistency (mobile ↔ web ↔ desktop)

**Self-Hosted Backend (NEW IN v1):**
- ✅ Docker Compose (API Gateway + PostgreSQL + Redis)
- ✅ License key system (premium tier)
- ✅ On-prem LLM routing (support local Ollama)
- ✅ Admin dashboard (user management, metrics)

**Mobile (iOS/Android):**
- ✅ Cognito auth + MFA
- ✅ Palace list + tree view
- ✅ Memory editor
- ✅ Quick-add memory (FAB)
- ✅ LLM provider selector
- ✅ Search + filter
- ✅ Offline cache + manual sync
- ✅ Sync status indicator

**Web:**
- ✅ Dashboard (palaces overview)
- ✅ Palace editor (split-pane: tree | editor)
- ✅ Drag-drop reordering
- ✅ Rich markdown editor with preview
- ✅ LLM provider config + usage metrics
- ✅ Settings + export
- ✅ Billing + subscription management

**Desktop (Electron):**
- ✅ Wrap Next.js web app
- ✅ Window management
- ✅ Auto-updates
- ✅ Native file save/open

**Freemium + Billing:**
- Free: 3 palaces, 1 LLM provider (Claude), local-only
- Pro ($9.99/mo): Unlimited palaces + all 5 providers + sync
- Self-Hosted ($499/yr): Docker deployment + on-prem

### Non-Goals for v1
- ❌ 3D visualization
- ❌ Voice input/output
- ❌ AI-generated summaries
- ❌ Advanced agent scheduling
- ❌ Multi-user collaboration (sharing palaces)

### Sprint Breakdown (24-32 weeks)

**Weeks 1-2:** AWS setup + Cognito + RDS schema + AppSync GraphQL schema
**Weeks 3-4:** @unimatrix/llm — All 5 LLM providers + factory + registry + routing
**Weeks 5-6:** @unimatrix/ui — Shared React components
**Weeks 7-8:** @unimatrix/api — Apollo client + AppSync + auth integration
**Weeks 9-10:** Mobile (Expo) — Auth + palace list + tree view + LLM selector
**Weeks 11-12:** Mobile — Memory editor + quick-add + offline cache + sync queue
**Weeks 13-14:** Web (Next.js) — Dashboard + palace editor + settings
**Weeks 15-16:** Desktop (Electron) — Wrap web app + window management + auto-updates
**Weeks 17-18:** Lambda — Mutations + LLM routing + cost tracking
**Weeks 19-20:** AppSync subscriptions — Real-time sync all platforms
**Weeks 21-22:** Full-text search + export + agent collaboration UI
**Weeks 23-24:** Docker self-hosted backend + license system
**Weeks 25-26:** Stripe integration + freemium tier limits
**Weeks 27-28:** Cross-platform testing + bug fixes + monitoring
**Weeks 29-30:** App Store + Play Store submissions
**Weeks 31-32:** Electron signing + launch prep + documentation

---

## PHASE 2 (8-10 weeks, Post-Launch)

- AI-powered summarization (uses Open Claw Agent)
- Voice input/output (Whisper + TTS)
- Advanced agent scheduling + workflows
- Multi-user collaboration (shared palaces + roles)
- Mobile web for low-bandwidth regions

---

## CRITICAL DETAILS

### Multi-LLM Provider Architecture

**LLMProvider Interface (abstract):**
```typescript
interface ILLMProvider {
  name: string;
  model: string;
  
  complete(messages: Message[], opts?: CompletionOpts): Promise<string>;
  stream(messages: Message[], opts?: CompletionOpts): AsyncIterableIterator<string>;
  
  getModelInfo(): ModelInfo;
  healthCheck(): Promise<boolean>;
}
```

**Concrete Implementations:**
- `ClaudeProvider` — Anthropic SDK, $0.003/$0.015 per 1k tokens
- `OpenAIProvider` — OpenAI SDK, GPT-4, $0.01/$0.03 per 1k tokens
- `GeminiProvider` — Google SDK, $0.00075/$0.00075 per 1k tokens
- `GroqProvider` — Groq SDK, ultra-fast, $0.00027 per 1k tokens
- `OllamaProvider` — HTTP client, local models (Mistral, Llama 2), free

**LLMProviderRegistry:**
```typescript
class LLMProviderRegistry {
  register(provider: ILLMProvider);
  getProvider(name: string): ILLMProvider;
  listProviders(): ILLMProvider[];
  healthCheckAll(): Promise<ProviderHealth[]>;
}
```

**Intelligent Routing:**
```typescript
async function intelligentLLMRouting(
  message: string,
  registry: LLMProviderRegistry,
  strategy: 'cheapest' | 'fastest' | 'best' | 'roundrobin'
): Promise<ILLMProvider> {
  // Analyze message complexity → select optimal provider
  // Track cost + latency + quality metrics
}
```

**Memory Metadata:**
```typescript
interface Memory {
  content: string;
  llmProvider: string;
  llmModel: string;
  tokensUsed: number;
  latencyMs: number;
  costUsd: number;
  // ... other fields
}
```

### Inter-LLM Collaboration

Agents can write to shared palaces. Each write records:
- Agent name + provider
- Timestamp
- Cost + tokens used

Example workflow:
1. Claude analyzes user query → writes summary to palace
2. GPT-4 reads summary → writes detailed analysis
3. Groq writes quick implementation sketch
4. User reads all three perspectives in one palace location

### Offline-First Sync

**Mobile workflow:**
1. Write memory locally (expo-sqlite)
2. Add to sync queue (Zustand + AsyncStorage)
3. On network restore, async upload via AppSync
4. Conflict resolution: last-write-wins (timestamp comparison)
5. UI indicator: "syncing..." badge

**Web/Desktop:**
- Immediate AppSync mutation (WebSocket)
- Subscribe to palace changes
- Auto-merge remote changes

### Full-Text Search

```sql
CREATE INDEX idx_memories_search ON memories 
USING GIN(to_tsvector('english', content));

SELECT * FROM memories 
WHERE to_tsvector('english', content) @@ 
      plainto_tsquery('english', $1)
ORDER BY ts_rank(to_tsvector('english', content), 
         plainto_tsquery('english', $1)) DESC;
```

### Self-Hosted Backend (Docker)

`docker-compose.yml`:
- **api-gateway** — Node.js API (same Lambda code, local)
- **postgres** — RDS equivalent (PostgreSQL)
- **redis** — Session + pub/sub
- **vault** — Secrets management (local)

License key tied to activation. Users run their own environment, support local Ollama for cost savings.

---

## DEPLOYMENT

**Mobile:** 
- iOS: Expo EAS Build → App Store
- Android: Expo EAS Build → Play Store

**Web:** 
- Vercel (auto-deploy main)

**Desktop:** 
- GitHub Releases (code-signed .dmg + .exe)

**Backend:** 
- AWS CloudFormation (infrastructure as code)
- Self-hosted: Docker Hub (unimatrix/api, unimatrix/postgres)

**Domain:** 
- unimatrix.app (primary)
- api.unimatrix.app (AppSync GraphQL)

---

## TESTING CHECKLIST

- [ ] Cognito flow (signup → MFA → token refresh)
- [ ] All 5 LLM providers functional (health checks)
- [ ] LLM routing strategies (cheapest, fastest, best, roundrobin)
- [ ] Offline sync (write offline mobile, verify cloud on online)
- [ ] Cross-platform consistency (mobile ↔ web ↔ desktop)
- [ ] Search (1000+ memories in < 1 sec)
- [ ] Agent collaboration (two agents write to same palace)
- [ ] Freemium tier limits enforced (3 palaces free, 1 provider)
- [ ] Self-hosted Docker deployment (local Ollama support)
- [ ] Export works (JSON opens, markdown renders)
- [ ] Real-time subscriptions (change on mobile, see on web)
- [ ] iOS simulator, Android emulator, web all functional

---

## v1.0 SUCCESS METRICS

- ✅ 100+ beta users (across mobile + web + desktop)
- ✅ 5 LLM providers integrated + routing working
- ✅ 90%+ sync success rate
- ✅ < 3s sync time (mobile)
- ✅ < 500ms search (1000+ items)
- ✅ Agent collaboration demo (2+ LLMs writing to same palace)
- ✅ App Store + Play Store approved
- ✅ Self-hosted Docker working with Ollama
- ✅ Landing page + waitlist (5K+ signups)
- ✅ < $5K/month AWS costs (on free tier)

---

## OPEN QUESTIONS

1. AWS Region: us-east-1 (N. Virginia), us-west-2 (Oregon), or eu-west-1 (Ireland)?
2. RDS Instance: t3.micro (free tier), t3.small ($20/mo), or t4g.medium ($50/mo)?
3. Cognito MFA: Optional, enforced, or per-user setting?
4. Self-hosted Ollama: Ship with default model, or user-selectable?
5. Agent framework: Full Open Claw implementation, or minimal routing?

---

## NEXT STEPS

1. → Clarify open questions above
2. → Create AWS CDK project (Cognito + RDS + AppSync)
3. → Create monorepo with pnpm workspaces
4. → Design Figma mockups (mobile + web + desktop)
5. → Initialize GitHub monorepo + GitHub Actions
6. → Begin Week 1 (AWS setup + LLM providers)
