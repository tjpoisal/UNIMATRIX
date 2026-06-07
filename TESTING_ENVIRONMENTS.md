# Unimatrix — 4 Testing Environments

## Overview
Four isolated testing environments for comprehensive QA before production release.

---

## Environment 1: **Local Development** 
**Purpose:** Feature development, rapid iteration, local debugging

**Setup:**
```bash
# Terminal 1: Start Neon local database
neon local

# Terminal 2: Start Next.js web app
cd apps/web && npm run dev

# Terminal 3: Start MCP server
cd packages/server && npm run dev:server

# Terminal 4: Start mobile dev (optional)
cd apps/mobile && npx expo start
```

**Features:**
- Hot reload on code changes
- Local SQLite (via neon local) — no network latency
- Full debugging with browser DevTools
- Local file uploads to Vercel Blob
- No external API calls (mock implementations)

**Credentials:**
- Test User: `dev@local.test` / `password123`
- Encryption Password: `dev-key-12345`

**Memory Upload:**
```bash
# Upload test memories directly
curl -X POST http://localhost:3000/api/memories/create \
  -H "Authorization: Bearer DEV_TOKEN" \
  -H "Content-Type: application/json" \
  -d @packages/server/memories-demo.jsonl
```

**Success Criteria:**
- ✅ All features load without errors
- ✅ Memory encryption/decryption works locally
- ✅ Browser extension injects into localhost LLMs
- ✅ Dashboard renders all components

---

## Environment 2: **Staging — Fly.io Preview**
**Purpose:** Test production-like environment before deploy

**Setup:**
```bash
# Deploy to preview environment
vercel env pull  # Get staging vars
git checkout -b test/staging
# Make changes
git push origin test/staging

# Or manual deploy
fly deploy --build-only --app unimatrix-web-staging
```

**Infrastructure:**
- Neon PostgreSQL (staging database)
- Fly.io compute (same as production)
- Custom domain: `https://unimatrix-staging.fly.dev`
- Email: `staging@resend.dev` (test sends)
- Stripe test mode API keys

**Testing Checklist:**
- [ ] User signup/login (staging)
- [ ] Password reset email (staging Resend)
- [ ] Memory encryption with staging DB
- [ ] MCP server connects to staging
- [ ] Extension works with staged deployment
- [ ] Stripe test payment flow
- [ ] Export/import functionality
- [ ] Browser extension sync (staging DB)

**Data Reset:**
```bash
# Reset staging database (DESTRUCTIVE)
fly postgres connect -a unimatrix-db-staging
# Inside psql:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

**Success Criteria:**
- ✅ All features work with real database
- ✅ Encryption stable across multiple users
- ✅ Email sending works (check Resend logs)
- ✅ No console errors in production build
- ✅ Performance metrics acceptable

---

## Environment 3: **Feature Testing — Isolated Branch**
**Purpose:** Test new features in isolation before merging to main

**Setup:**
```bash
# Create feature branch with its own environment
git checkout -b feature/librarian-ai
npm run build
fly deploy --app unimatrix-feature-librarian

# Or use Vercel preview
# Preview automatically created on PR
git push origin feature/librarian-ai
# Open PR → Preview link generates
```

**Example: Librarian AI Training Test**
```bash
# Deploy fine-tuned model to this environment
cd packages/server
./scripts/deploy-finetuned-model.sh librarian-v1 \
  --model-path ./models/mistral-7b-lora.gguf \
  --environment feature

# Test inference
curl -X POST https://unimatrix-feature-librarian.fly.dev/api/librarian/recall \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d '{"query": "python recursion example"}'
```

**Memory Test Data:**
```bash
# Use training data to test model
npx tsx packages/server/scripts/test-librarian-accuracy.ts \
  --memories packages/server/memories-demo.jsonl \
  --model librarian-v1 \
  --output test-results/librarian-accuracy.json
```

**Success Criteria:**
- ✅ Feature works as designed
- ✅ No regressions in existing features
- ✅ Performance within SLA
- ✅ All tests pass
- ✅ Ready for merge approval

---

## Environment 4: **Load Testing & Performance**
**Purpose:** Stress test before production launch

**Setup:**
```bash
# k6 load testing script
npm install -g k6

# Run load test against staging
k6 run scripts/k6-loadtest.js --vus 100 --duration 5m
```

**Load Test Scenarios:**

### Scenario A: Memory Upload Spike
```javascript
// 100 concurrent users uploading memories
for (let i = 0; i < 100; i++) {
  http.post('https://unimatrix-staging.fly.dev/api/memories/create', {
    ciphertext: generateRandomEncryptedMemory(),
    nonce: generateNonce(),
    context: 'load-test',
    importance: 'high'
  });
}
```

### Scenario B: Recall Query Storm
```javascript
// 500 concurrent recall queries
for (let i = 0; i < 500; i++) {
  http.get('https://unimatrix-staging.fly.dev/api/memories/recall?q=' + randomQuery());
}
```

### Scenario C: MCP Server Hammering
```javascript
// 1000 concurrent MCP protocol calls
for (let i = 0; i < 1000; i++) {
  mcp.call('unimatrix.recall', { query: randomQuery() });
}
```

**Metrics to Monitor:**
```
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- CPU usage (Fly.io dashboard)
- Database connection pool
- Memory leak detection
- Encryption performance
```

**Acceptance Criteria:**
- ✅ p95 latency < 500ms
- ✅ Error rate < 0.1%
- ✅ CPU stays < 80%
- ✅ No memory leaks over 10 min
- ✅ Concurrent users sustained

**Load Test Commands:**
```bash
# Light load (10 users, 1 min)
k6 run scripts/k6-loadtest.js --vus 10 --duration 1m

# Moderate (50 users, 5 min)
k6 run scripts/k6-loadtest.js --vus 50 --duration 5m

# Heavy (200 users, 10 min)
k6 run scripts/k6-loadtest.js --vus 200 --duration 10m

# Generate report
k6 run scripts/k6-loadtest.js --out json=test-results/load-test.json
```

**Success Criteria:**
- ✅ Sustains 100+ concurrent users
- ✅ All metrics within SLA
- ✅ No errors under load
- ✅ Graceful degradation (no crashes)

---

## Testing Workflow

```
Local Dev
    ↓ (feature complete)
Feature Branch + Preview
    ↓ (tests pass)
Staging Environment
    ↓ (full test suite + load test)
Production
```

### Pre-Production Checklist
- [ ] All 4 environments pass tests
- [ ] Load test succeeds (p95 < 500ms)
- [ ] Zero security issues (no plaintext)
- [ ] Encryption working (verified in all envs)
- [ ] Email/Stripe configured
- [ ] Browser extension tested
- [ ] MCP server stable
- [ ] Documentation up-to-date
- [ ] Rollback plan documented

---

## Using Training Data for AI Improvement

### Phase 1: Initial Fine-Tuning (This Week)

**Data Source:** `packages/server/memories-demo.jsonl`
```json
{"content": "Python recursion example: factorial", "context": "Development", "importance": "high"}
{"content": "React hooks best practices", "context": "Learning", "importance": "medium"}
...
```

**Fine-Tuning Workflow:**

```bash
# 1. Export all memories as training data
npx tsx packages/server/scripts/export-memories-for-finetuning.ts \
  > training-data/unimatrix-memories-production.jsonl

# 2. Prepare data for Mistral LoRA training
python scripts/prepare-training-data.py \
  --input training-data/unimatrix-memories-production.jsonl \
  --output training-data/mistral-formatted.jsonl \
  --model mistral-7b \
  --split-ratio 0.9  # 90% train, 10% validation

# 3. Fine-tune on HuggingFace (free GPU - Community license)
python scripts/train-librarian-lora.py \
  --model-id mistralai/Mistral-7B-v0.1 \
  --training-data training-data/mistral-formatted.jsonl \
  --output-dir ./models/librarian-v1 \
  --lora-r 8 \
  --lora-alpha 16 \
  --batch-size 4 \
  --epochs 3

# 4. Test accuracy
npx tsx packages/server/scripts/test-librarian-accuracy.ts \
  --memories packages/server/memories-demo.jsonl \
  --model ./models/librarian-v1 \
  --output test-results/accuracy-report.json
```

**Expected Accuracy Metrics:**
```
Baseline (Claude Haiku API): 92% relevance
After fine-tuning: 94-96% relevance
Training data size: 1,000+ memories
Model size: 7B parameters (4GB quantized)
```

### Phase 2: Continuous Improvement

**Weekly Cycle:**
```
Monday: Export all user memories since last week
Tuesday: Merge into training dataset
Wednesday: Fine-tune Librarian model v2
Thursday: Test in feature branch environment
Friday: A/B test in production (10% traffic)
```

**Data Collection Strategy:**
```python
# Log memory recall queries and results
{
  "query": "python recursion example",
  "recalled_memories": [
    {"id": "mem-123", "relevance": 0.95, "time_ms": 45},
    {"id": "mem-456", "relevance": 0.87, "time_ms": 42},
  ],
  "user_feedback": "useful",
  "timestamp": "2026-06-15T10:30:00Z"
}
```

**Feedback Loop:**
```
User saves memory
    ↓
User recalls (queries) memory
    ↓
Log recall + user satisfaction
    ↓
Weekly aggregate → training data
    ↓
Fine-tune next version
    ↓
A/B test improvements
    ↓
Deploy winner
```

---

## Automation

### GitHub Actions

**Config:** `.github/workflows/test-environments.yml`
```yaml
name: Test All Environments

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  local-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup
        run: pnpm install && pnpm build
      - name: Run tests
        run: pnpm test:all
      - name: Lint
        run: pnpm lint

  staging-deploy:
    needs: local-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: fly deploy --app unimatrix-web-staging
      - name: Run staging tests
        run: npx playwright test --project=staging

  load-test:
    needs: staging-deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run load test
        run: k6 run scripts/k6-loadtest.js --duration 5m
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: test-results/
```

---

## Summary Table

| Environment | Purpose | Database | Deploy Time | Cost |
|-------------|---------|----------|-------------|------|
| **Local** | Development | SQLite (local) | Instant | $0 |
| **Feature** | PR Preview | Staging DB | 2-3 min | $5 |
| **Staging** | Full QA | Neon Staging | 3-5 min | $15 |
| **Load Test** | Performance | Staging | On-demand | $10 |

---

**Status:** ✅ Ready to implement

**Next Steps:**
1. Set up k6 load testing scripts
2. Configure GitHub Actions workflow
3. Run initial load test against staging
4. Begin weekly fine-tuning cycle with real user data
5. Monitor Librarian accuracy improvements
