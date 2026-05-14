# Unimatrix — AWS-Native Memory Palace with Multi-LLM Integration

A unified, cross-platform memory palace system that integrates with multiple LLM providers (Claude, GPT-4, Gemini, Groq, Ollama) for collaborative knowledge management.

## 🎯 Vision

Unimatrix solves the fragmentation of LLM knowledge:
- **Single source of truth** for structured memory across all devices
- **Multi-LLM collaboration** — agents write and read from shared palaces
- **Real-time sync** across iOS, Android, Web, and Desktop (Electron)
- **Native LLM integration** — cost tracking, intelligent routing, health checks
- **Self-hosted option** — Docker deployment for enterprise control

## 📊 Tech Stack

### Frontend
- **Mobile:** Expo (React Native) — iOS & Android
- **Web:** Next.js 15 (React 19) — responsive dashboard
- **Desktop:** Electron — native window management

### Backend (AWS)
- **Auth:** Cognito (with optional MFA)
- **Database:** RDS PostgreSQL (palaces, memories, agent metadata)
- **API:** AppSync GraphQL (real-time subscriptions via WebSocket)
- **Compute:** Lambda (mutations, LLM routing, agent handlers)
- **Cache:** ElastiCache Redis (sessions, pub/sub, agent state)

### LLM Integration
- **Claude (Anthropic)** — $0.003/$0.015 per 1k tokens
- **GPT-4 (OpenAI)** — $0.01/$0.03 per 1k tokens
- **Gemini (Google)** — $0.00075/$0.00075 per 1k tokens
- **Groq** — $0.00027 per 1k tokens (ultra-fast)
- **Ollama** — Local models (free, CPU-based)

### Orchestration
- **Open Claw Agent** — Multi-agent workflows
- **LLMProvider abstraction** — Unified interface for all providers
- **Intelligent routing** — Analyze message complexity → optimal provider

## 📁 Project Structure

```
unimatrix/
├── packages/
│   ├── types/           # TypeScript interfaces (Palace, Memory, Agent, LLMProvider)
│   ├── api/             # Apollo GraphQL client + AppSync + Cognito
│   ├── ui/              # Shared React components (Tree, Editor, AuthForm, SearchBar)
│   └── llm/             # Multi-provider LLM clients + registry + orchestration
├── apps/
│   ├── mobile/          # Expo (iOS/Android)
│   ├── web/             # Next.js
│   └── desktop/         # Electron (wraps web)
├── infrastructure/
│   ├── aws-cdk/         # CloudFormation infrastructure
│   └── docker-compose.yml   # Self-hosted (API + Postgres + Redis)
└── ARCHITECTURE.md      # Full specification (read this first!)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- AWS account (for cloud deployment)
- API keys for LLM providers (Claude, OpenAI, Gemini, Groq)
- Docker (for self-hosted backend)

### Setup

1. **Clone the repo:**
   ```bash
   cd /Users/tim/unimatrix
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create environment files:**
   ```bash
   cp .env.example .env.local
   # Fill in AWS credentials, LLM API keys, etc.
   ```

4. **Run development environment:**
   ```bash
   pnpm dev
   ```

## 📅 Development Roadmap

### v1.0 (24-32 weeks)
- ✅ AWS infrastructure (Cognito, RDS, AppSync)
- ✅ Multi-LLM integration (all 5 providers)
- ✅ Mobile apps (iOS/Android with offline sync)
- ✅ Web dashboard
- ✅ Desktop app (Electron)
- ✅ Self-hosted backend (Docker)
- ✅ Freemium tier limits + Stripe billing

### v2.0 (Post-launch)
- Advanced agent workflows
- Voice input/output
- AI-powered summaries
- Multi-user collaboration

## 💰 Pricing (v1.0)

| Tier | Cost | Features |
|------|------|----------|
| Free | $0 | 3 palaces, 1 LLM provider (Claude), local-only |
| Pro | $9.99/mo | Unlimited palaces, all 5 providers, cloud sync |
| Self-Hosted | $499/yr | Docker deployment, on-prem LLM support |

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Run all apps in parallel

# Build
pnpm build            # Build all packages

# Testing
pnpm test             # Run all tests

# AWS CDK
pnpm cdk:deploy       # Deploy infrastructure to AWS

# Docker (Self-hosted)
pnpm docker:up        # Start self-hosted backend
pnpm docker:down      # Stop self-hosted backend
```

## 📖 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Full technical specification
- **packages/types** — TypeScript interfaces
- **packages/llm** — LLM provider documentation
- **infrastructure/aws-cdk** — AWS setup guide

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon).

## 📄 License

MIT (to be determined)

## 🙋 Questions?

Open an issue on GitHub or check ARCHITECTURE.md for detailed explanations.

---

**Last Updated:** 2026-05-06
