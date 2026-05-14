# Unimatrix LLM Architecture

Complete documentation of the multi-LLM integration system powering Unimatrix.

## Overview

Unimatrix integrates 5 leading LLM providers (Claude, OpenAI, Gemini, Groq, Ollama) with intelligent routing, cost optimization, and provider failover. The system routes each request to the optimal provider based on message complexity, user preferences, and cost.

```
┌─────────────────────────────────────────────────────────────┐
│                   User Request (GraphQL)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  AppSync    │
                    │  GraphQL    │
                    │   Resolver  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐   ┌──────▼──────┐   ┌─────▼──────┐
    │  Lambda   │   │  Lambda     │   │  Lambda    │
    │  Handler  │   │  Handler    │   │  Handler   │
    │ Complete  │   │  Check      │   │  Suggest   │
    │           │   │  Health     │   │  Strategy  │
    └────┬─────┘   └──────┬──────┘   └─────┬──────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                ┌──────────▼──────────┐
                │  LLM System Init   │
                │  - Registry        │
                │  - Router          │
                │  - Load Balancer   │
                └──────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐    ┌────────▼────────┐    ┌──▼────┐
    │Provider│    │    Router       │    │Monitor│
    │Registry│    │  - Analyze      │    │Health │
    │        │    │  - Select       │    │       │
    │ Get    │    │  - Route        │    │       │
    │Healthy │    └────────┬────────┘    └───────┘
    │Filters │             │
    └────────┘             │
                    ┌──────▼──────┐
                    │   Providers   │
                    │ ┌──────────┐ │
                    │ │  Claude  │ │
                    │ ├──────────┤ │
                    │ │  OpenAI  │ │
                    │ ├──────────┤ │
                    │ │  Gemini  │ │
                    │ ├──────────┤ │
                    │ │  Groq    │ │
                    │ ├──────────┤ │
                    │ │ Ollama   │ │
                    │ └──────────┘ │
                    └──────────────┘
```

## System Components

### 1. Provider Interface (`BaseLLMProvider`)

All providers implement a common interface for consistency:

```typescript
interface ILLMProvider {
  readonly name: string;           // 'Claude', 'OpenAI', etc.
  readonly model: string;          // 'gpt-4-turbo', 'claude-3-opus'
  
  // Core methods
  complete(messages, options?): Promise<CompletionResult>;
  stream(messages, options?): AsyncIterableIterator<string>;
  healthCheck(): Promise<boolean>;
  
  // Utility methods
  getModelInfo(): ModelInfo;
  calculateCost(inputTokens, outputTokens): number;
}
```

**Key Features:**
- Unified completion interface across all providers
- Streaming support for real-time token generation
- Health monitoring for provider reliability
- Transparent cost calculation

### 2. Provider Implementations

#### Claude (Anthropic)
- **Cost**: $0.003–$0.075 per 1k tokens (by model)
- **Context Window**: 200k tokens
- **Strengths**: Best reasoning, code quality, creative writing
- **Default Model**: claude-3-opus-20240229
- **SDK**: @anthropic-ai/sdk

#### OpenAI
- **Cost**: $0.0005–$0.06 per 1k tokens (by model)
- **Context Window**: 128k tokens (GPT-4 Turbo)
- **Strengths**: Mature, widely used, function calling
- **Default Model**: gpt-4-turbo-preview
- **SDK**: openai

#### Gemini
- **Cost**: $0.00025–$4.5 per 1k tokens (by model)
- **Context Window**: 32k tokens (varies)
- **Strengths**: Very affordable, multimodal support
- **Default Model**: gemini-pro
- **SDK**: @google/generative-ai

#### Groq
- **Cost**: $0.00002–$0.0009 per 1k tokens
- **Context Window**: 8k–32k tokens
- **Strengths**: Ultra-fast inference, cheapest cost
- **Default Model**: mixtral-8x7b-32768
- **SDK**: groq-sdk
- **Speed**: 500+ tokens/second

#### Ollama
- **Cost**: FREE (local inference)
- **Context Window**: Varies by model (4k–8k)
- **Strengths**: Complete privacy, no internet required
- **Default Model**: mistral
- **Models**: Mistral, Llama 2/3, Neural Chat, Dolphin, etc.
- **Endpoint**: http://localhost:11434

### 3. LLMProviderRegistry

Central manager for all registered providers:

```typescript
const registry = new LLMProviderRegistry();

// Register providers
registry.register(claudeProvider);
registry.register(openaiProvider);

// Get specific provider
const provider = registry.getProvider('Claude');

// List all providers
const providers = registry.listProviders();

// Health check all (cached for 5 minutes)
const health = await registry.healthCheckAll();

// Select provider by strategy
const selected = registry.selectProvider(context, 'cheapest');
```

**Selection Strategies:**

| Strategy | Logic | Use Case |
|----------|-------|----------|
| `cheapest` | Lowest cost per token | FAQ, simple Q&A |
| `fastest` | Groq (500+ tok/s) | Real-time chat |
| `best` | Claude (most capable) | Complex reasoning |
| `roundrobin` | Even distribution | Load balancing |

**Cost Analysis:**
- Tracks cumulative costs per provider
- Identifies cheapest option at runtime
- Optimizes for long-term cost efficiency

### 4. IntelligentLLMRouter

Analyzes message complexity and selects optimal provider:

```typescript
const router = new IntelligentLLMRouter(registry);

// Automatic routing based on context
const provider = await router.route(messages, strategy?, preferredProviders?);

// Convenience methods
const cheap = router.routeToCheapest();
const fast = router.routeToFastest();
const best = router.routeToBest();
const balanced = router.routeRoundRobin();
```

**Complexity Analysis:**

```typescript
const score = LLMProviderRegistry.analyzeComplexity(message);
// Returns 0-1 based on:
// - Message length (100 → 0.33, 500 → 0.6, 2000+ → 0.9)
// - Word count (>50 words +0.2)
// - Code blocks (+0.3)
// - Multiple sentences (+0.2)
```

**Routing Decision Flow:**

```
Message Input
    ↓
Analyze Complexity (0-1 score)
    ↓
    ├─ 0-0.33: Simple      → Use cheapest (Groq, Gemini)
    ├─ 0.33-0.66: Moderate → Use balanced (round-robin)
    └─ 0.66-1.0: Complex   → Use best (Claude, OpenAI)
    ↓
Check Health Status
    ↓
Filter by Preferred Providers
    ↓
Select by Strategy
    ↓
Execute with Selected Provider
```

### 5. LLMLoadBalancer

Tracks request distribution and costs:

```typescript
const balancer = new LLMLoadBalancer(registry);

// Track each request
balancer.trackRequest('Claude', 0.042);

// Get statistics
const stats = balancer.getStats();
// {
//   Claude: { requests: 5, totalCost: 0.21, avgCost: 0.042 },
//   OpenAI: { requests: 2, totalCost: 0.12, avgCost: 0.06 },
//   Groq: { requests: 10, totalCost: 0.001, avgCost: 0.0001 }
// }

// Reset statistics
balancer.reset();
```

## Integration with GraphQL/AppSync

### Mutation: `completeLLMMessage`

```graphql
mutation CompleteLLMMessage(
  $palaceId: String!
  $locationId: String!
  $message: String!
  $provider: LLMProvider
  $routingStrategy: RoutingStrategy
) {
  completeLLMMessage(
    palaceId: $palaceId
    locationId: $locationId
    message: $message
    provider: $provider
    routingStrategy: $routingStrategy
  ) {
    content
    tokenCount
    latencyMs
    costUsd
  }
}
```

**Lambda Handler Flow:**

```typescript
1. Initialize LLM System
   ├─ Create Registry with all providers
   ├─ Check provider health
   └─ Create Router and LoadBalancer

2. Determine Target Provider
   ├─ If provider specified: use it
   ├─ Else: use router to analyze message
   └─ Apply routing strategy

3. Execute Completion
   ├─ Call provider.complete()
   ├─ Track latency
   └─ Calculate cost

4. Update Tracking
   ├─ Store in LoadBalancer
   ├─ Log metrics
   └─ Return result

5. Store Memory (AppSync Resolver)
   ├─ Create Memory record
   ├─ Attach LLM metadata
   ├─ Store in DynamoDB
   └─ Publish subscription
```

### Mutation: `streamLLMCompletion`

Real-time token streaming via AppSync subscriptions:

```graphql
mutation StreamLLMCompletion(
  $palaceId: String!
  $message: String!
  $provider: LLMProvider
) {
  streamLLMCompletion(
    palaceId: $palaceId
    message: $message
    provider: $provider
  )
}

subscription OnLLMStreamChunk($requestId: String!) {
  onLLMStreamChunk(requestId: $requestId)
}
```

**Streaming Handler Flow:**

```typescript
1. Route to fastest provider (minimize latency)
2. Get AsyncIterator from provider.stream()
3. For each chunk:
   ├─ Emit via onLLMStreamChunk subscription
   ├─ Update token count estimate
   └─ Track latency
4. On completion:
   ├─ Calculate final cost
   ├─ Store memory
   └─ Close subscription
```

### Query: `checkLLMProvidersHealth`

```graphql
query CheckLLMProvidersHealth {
  checkLLMProvidersHealth {
    Claude {
      healthy
      latencyMs
    }
    OpenAI {
      healthy
      latencyMs
    }
    # ... etc
  }
}
```

**Health Check Handler:**

```typescript
1. Iterate all providers
2. Call provider.healthCheck()
3. Measure latency
4. Cache results (5 minutes)
5. Return aggregated status
```

### Query: `suggestRoutingStrategy`

```graphql
query SuggestRoutingStrategy($messageContent: String!) {
  suggestRoutingStrategy(messageContent: $messageContent)
}
```

**Suggestion Handler:**

```typescript
1. Analyze message complexity
2. Categorize (simple/moderate/complex)
3. Suggest strategy:
   - Simple → cheapest
   - Moderate → roundrobin
   - Complex → best
```

## Data Flow: End-to-End Example

### Scenario: User asks "What is quantum computing?"

```
1. Frontend sends completeLLMMessage mutation
   ├─ palaceId: 'palace_abc123'
   ├─ locationId: 'loc_def456'
   ├─ message: 'What is quantum computing?'
   └─ routingStrategy: undefined (auto-detect)

2. AppSync invokes Lambda handler
   ├─ Initialize LLM system from env vars
   └─ Create registry with 5 providers

3. Router analyzes message
   ├─ Complexity score: 0.25 (simple question)
   ├─ Task complexity: 'simple'
   └─ Suggested strategy: 'cheapest'

4. Registry selects provider
   ├─ Filter healthy providers
   ├─ Compare costs
   └─ Select Groq (cheapest)

5. Execute completion
   ├─ Groq API: 'What is quantum computing?'
   ├─ Response time: 245ms
   ├─ Tokens used: 42
   └─ Cost: $0.00001

6. LoadBalancer tracks request
   ├─ Groq requests: +1
   ├─ Groq cost: +$0.00001
   └─ Avg cost: $0.00001

7. Store memory in DynamoDB
   ├─ Create Memory record
   ├─ provider: 'Groq'
   ├─ model: 'mixtral-8x7b-32768'
   ├─ tokensUsed: 42
   ├─ latencyMs: 245
   ├─ costUsd: 0.00001
   └─ createdByAgent: false

8. Return result to client
   ├─ content: 'Quantum computing is...'
   ├─ tokensUsed: 42
   ├─ latencyMs: 245
   └─ costUsd: 0.00001
```

## Cost Optimization Strategies

### Strategy 1: Tiered Routing

Route based on message complexity:

```typescript
const complexity = LLMProviderRegistry.analyzeComplexity(message);

if (complexity < 0.33) {
  // Simple: use Groq ($0.00027/1k tokens)
  return router.routeToCheapest();
} else if (complexity < 0.66) {
  // Moderate: load balance
  return router.routeRoundRobin();
} else {
  // Complex: use Claude (best reasoning)
  return router.routeToBest();
}
```

### Strategy 2: Time-Based Routing

Different strategies for different times:

```typescript
const hour = new Date().getHours();

if (hour < 9 || hour > 17) {
  // Off-peak: use cheapest
  return router.routeToCheapest();
} else {
  // Peak hours: use fastest
  return router.routeToFastest();
}
```

### Strategy 3: User Preference Routing

Remember user preferences:

```typescript
const userPreferences = getUserPreferences(userId);

if (userPreferences.prioritizeCost) {
  return router.routeToCheapest();
} else if (userPreferences.prioritizeSpeed) {
  return router.routeToFastest();
} else {
  return router.routeToBest(); // Quality
}
```

## Performance Characteristics

### Response Time

| Provider | Typical Latency | Tokens/Second |
|----------|-----------------|---------------|
| Groq | 50-100ms | 500+ |
| OpenAI | 500-1500ms | 50-100 |
| Claude | 1000-2000ms | 50-100 |
| Gemini | 1000-2000ms | 50-100 |
| Ollama (local) | 50-500ms | 10-100 |

### Cost per 1k Tokens

| Provider | Input | Output | Use Case |
|----------|-------|--------|----------|
| Groq | $0.00027 | $0.00027 | Ultra-cheap |
| Gemini | $0.00025 | $0.0005 | Very cheap |
| Haiku | $0.00025 | $0.00125 | Cheap |
| Groq 8B | $0.00002 | $0.00003 | Cheapest |
| Ollama | FREE | FREE | On-premise |
| Sonnet | $0.003 | $0.015 | Balanced |
| GPT-3.5 | $0.0005 | $0.0015 | Cheap GPT |
| Opus | $0.015 | $0.075 | Premium |

## Monitoring & Observability

### Logging

All operations are logged with context:

```
[Registry] Registered LLM provider: Claude (claude-3-opus-20240229)
[Handler] Complexity: simple, Strategy: cheapest
[Router] Message complexity: 0.25, Suggested: cheapest
[Handler] Routing to Groq (mixtral-8x7b-32768)
[Handler] Stream complete: 42 tokens, 245ms, $0.00001
```

### Metrics

```typescript
const stats = loadBalancer.getStats();
// {
//   'Claude': {
//     requests: 5,
//     totalCost: 0.21,
//     avgCost: 0.042
//   },
//   'Groq': {
//     requests: 42,
//     totalCost: 0.00001,
//     avgCost: 0.00000024
//   }
// }
```

### Health Status

```typescript
const health = await registry.healthCheckAll();
// [
//   { provider: 'Claude', healthy: true, lastCheck: Date },
//   { provider: 'Groq', healthy: true, lastCheck: Date },
//   { provider: 'OpenAI', healthy: false, error: 'Invalid API key' }
// ]
```

## Security Considerations

### API Key Management

- Keys stored in environment variables only
- Never logged or transmitted in plaintext
- Separate keys per provider for granular control
- Support for rotating keys without code changes

### Rate Limiting

- No built-in rate limiting (handled by providers)
- LoadBalancer tracks request counts
- Can implement max requests per provider

### Cost Controls

- Limit tokens per request (maxTokens option)
- Monitor per-user costs
- Implement spending caps in DynamoDB

## Error Handling & Failover

### Provider Failure

```typescript
try {
  const provider = await router.route(messages, 'best');
  return await provider!.complete(messages);
} catch (error) {
  // Fallback to cheapest available
  const fallback = router.routeToCheapest();
  return await fallback!.complete(messages);
}
```

### Health Check Fallback

Registry automatically filters unhealthy providers:

```typescript
// Only returns healthy providers
const selected = registry.selectProvider(context, strategy);
if (!selected) {
  // No healthy providers available
  throw new Error('No LLM providers available');
}
```

## Future Enhancements

### Planned Features
- [ ] Fine-tuned model caching
- [ ] Batch processing for cost optimization
- [ ] Predictive routing (ML-based)
- [ ] Multi-turn conversation optimization
- [ ] Fallback chains (primary → secondary → tertiary)
- [ ] Rate limiting per user/org
- [ ] Spending limits enforcement
- [ ] Provider credit system

### Phase 2 Features
- [ ] LLM-specific prompt optimization
- [ ] Automatic retry with exponential backoff
- [ ] Cost budgeting and analytics dashboard
- [ ] A/B testing between providers
- [ ] Custom routing rules per user

## Deployment

### Environment Setup

```bash
# Copy template
cp .env.example .env

# Add your API keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
OLLAMA_ENDPOINT=http://localhost:11434
```

### Lambda Deployment

```bash
# Package @unimatrix/llm with dependencies
npm install @unimatrix/llm

# Deploy Lambda
cdk deploy UnimatrixStack
```

### Local Testing

```bash
# Start Ollama (for local inference)
ollama serve

# In another terminal
npm run dev
```

## References

- [Anthropic Claude Docs](https://docs.anthropic.com)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Ollama Documentation](https://ollama.ai)
- [@unimatrix/llm Source](./packages/llm/)

---

**Last Updated**: May 2026  
**Status**: Production Ready  
**Maintainer**: Unimatrix Team
