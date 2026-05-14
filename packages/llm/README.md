# @unimatrix/llm — Multi-LLM Provider Integration

Complete, production-ready multi-LLM integration for Unimatrix with intelligent routing, cost optimization, and provider failover.

## Features

- ✅ **5 LLM Providers**: Claude, OpenAI, Gemini, Groq, Ollama
- ✅ **Intelligent Routing**: Analyzes message complexity and routes to optimal provider
- ✅ **Cost Optimization**: Smart selection of cheapest provider for simple tasks
- ✅ **Load Balancing**: Round-robin and least-loaded strategies
- ✅ **Health Checks**: Automatic provider health monitoring
- ✅ **Provider Failover**: Graceful fallback if preferred provider fails
- ✅ **Streaming Support**: Real-time token streaming from all providers
- ✅ **Cost Tracking**: Detailed metrics on per-provider and per-request costs

## Quick Start

```typescript
import { initializeLLMSystem } from '@unimatrix/llm';

// Initialize with environment variables
const { registry, router, loadBalancer, providers } = initializeLLMSystem();

// List available providers
console.log(providers.map(p => p.name));

// Route a message to the optimal provider
const provider = await router.route([
  { role: 'user', content: 'What is quantum computing?' }
]);

// Execute completion
const result = await provider!.complete([
  { role: 'user', content: 'What is quantum computing?' }
]);

console.log(`Response: ${result.content}`);
console.log(`Cost: $${result.cost.toFixed(4)}`);
```

## Environment Variables

Create a `.env` file with your API keys (see `.env.example`):

```bash
# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-opus-20240229

# OpenAI GPT
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview

# Google Gemini
GOOGLE_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-pro

# Groq (ultra-fast)
GROQ_API_KEY=gsk_...
GROQ_MODEL=mixtral-8x7b-32768

# Ollama (local, free)
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=mistral
```

## Core Concepts

### Providers

Each provider implements the `ILLMProvider` interface:

```typescript
interface ILLMProvider {
  name: string;
  model: string;
  complete(messages: Message[], options?: CompletionOptions): Promise<CompletionResult>;
  stream(messages: Message[], options?: CompletionOptions): AsyncIterableIterator<string>;
  healthCheck(): Promise<boolean>;
  getModelInfo(): ModelInfo;
  calculateCost(inputTokens: number, outputTokens: number): number;
}
```

### Registry

Manages multiple providers and provides selection strategies:

```typescript
const registry = new LLMProviderRegistry();

// Register providers
registry.register(claudeProvider);
registry.register(openaiProvider);

// Check health
await registry.healthCheckAll();

// Select provider by strategy
const provider = registry.selectProvider(context, 'cheapest');
```

### Router

Intelligently routes requests based on message complexity:

```typescript
const router = new IntelligentLLMRouter(registry);

// Analyze message and route automatically
const provider = await router.route(messages, 'best');

// Or use convenience methods
const cheap = router.routeToCheapest();
const fast = router.routeToFastest();
const best = router.routeToBest();
```

### Load Balancer

Tracks request distribution and costs:

```typescript
const balancer = new LLMLoadBalancer(registry);

// Track requests
balancer.trackRequest('Claude', 0.042);

// Get statistics
const stats = balancer.getStats();
console.log(stats);
// {
//   Claude: { requests: 5, totalCost: 0.21, avgCost: 0.042 },
//   OpenAI: { requests: 3, totalCost: 0.18, avgCost: 0.06 }
// }
```

## Routing Strategies

### `'cheapest'`
Routes to the provider with lowest cost per token. Best for:
- Simple, non-critical requests
- Cost-sensitive use cases
- FAQ lookups

### `'fastest'`
Routes to Groq (ultra-fast) or similar. Best for:
- Real-time user interactions
- Time-sensitive queries
- Streaming completions

### `'best'`
Routes to Claude (most capable). Best for:
- Complex reasoning tasks
- Code generation
- Creative writing
- Analysis and research

### `'roundrobin'`
Load balances across all providers. Best for:
- Distributing load evenly
- Testing different models
- Redundancy

## Provider Pricing

### Claude (Anthropic)
- **Opus** (most capable): $0.015 input / $0.075 output per 1k tokens
- **Sonnet** (balanced): $0.003 input / $0.015 output per 1k tokens
- **Haiku** (cheapest): $0.00025 input / $0.00125 output per 1k tokens

### OpenAI (GPT)
- **GPT-4**: $0.03 input / $0.06 output per 1k tokens
- **GPT-4 Turbo**: $0.01 input / $0.03 output per 1k tokens
- **GPT-3.5 Turbo**: $0.0005 input / $0.0015 output per 1k tokens

### Gemini (Google)
- **Gemini Pro**: $0.00025 input / $0.0005 output per 1k tokens (cheapest)
- **Gemini 1.5 Flash**: $0.075 input / $0.3 output per 1k tokens
- **Gemini 1.5 Pro**: $1.5 input / $4.5 output per 1k tokens

### Groq
- **Mixtral 8x7B**: $0.00027 input / $0.00027 output per 1k tokens (ultra-cheap)
- **Llama 3 70B**: $0.0007 input / $0.0009 output per 1k tokens
- **Llama 3 8B**: $0.00002 input / $0.00003 output per 1k tokens

### Ollama (Local)
- **Free** (runs locally on your machine)
- Models: Mistral, Llama 2/3, Neural Chat, Dolphin Mixtral, etc.

## Message Complexity Analysis

The router automatically analyzes message complexity:

```typescript
const complexity = LLMProviderRegistry.analyzeComplexity(message);
// Returns 0-1 score based on:
// - Message length
// - Word count
// - Code blocks
// - Multiple sentences
```

Complexity breakdown:
- **0-0.33**: Simple queries (FAQ, simple questions)
- **0.33-0.66**: Moderate tasks (analysis, coding)
- **0.66-1.0**: Complex reasoning (creative, advanced analysis)

## Usage Examples

### Basic Completion

```typescript
const { registry } = initializeLLMSystem();

const provider = registry.getProvider('Claude');
if (provider) {
  const result = await provider.complete([
    { role: 'user', content: 'Explain quantum computing' }
  ]);

  console.log(result.content);
  console.log(`Cost: $${result.cost.toFixed(4)}`);
}
```

### Streaming Completion

```typescript
const provider = registry.getProvider('OpenAI');
if (provider) {
  const stream = provider.stream([
    { role: 'user', content: 'Write a poem about AI' }
  ]);

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}
```

### Intelligent Routing

```typescript
const { router, loadBalancer } = initializeLLMSystem();

const userMessage = 'Complex analysis of market trends...';

// Route automatically
const provider = await router.route([
  { role: 'user', content: userMessage }
], undefined, ['Claude', 'OpenAI']); // Prefer these

if (provider) {
  const result = await provider.complete([
    { role: 'user', content: userMessage }
  ]);

  // Track the request
  loadBalancer.trackRequest(provider.name, result.cost);

  // Get stats
  console.log(loadBalancer.getStats());
}
```

### Cost-Optimized Selection

```typescript
const { router } = initializeLLMSystem();

// For simple FAQ: use cheapest
const faqProvider = router.routeToCheapest();

// For real-time chat: use fastest
const chatProvider = router.routeToFastest();

// For complex analysis: use best
const analysisProvider = router.routeToBest();
```

## Advanced Configuration

### Custom Configuration

```typescript
import { initializeLLMSystemFromConfig } from '@unimatrix/llm';

const system = initializeLLMSystemFromConfig({
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
    enabled: true,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // Use cheaper model
    enabled: true,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    enabled: true,
  },
  // Ollama enabled by default (local, free)
  ollama: {
    endpoint: 'http://localhost:11434',
    model: 'llama2',
  },
});
```

### Provider Factory

```typescript
import { LLMProviderFactory } from '@unimatrix/llm';

// Create a single provider
const claude = LLMProviderFactory.createProvider('claude', {
  apiKey: 'sk-ant-...',
  model: 'claude-3-haiku-20240307',
});

// Create multiple providers from config
const providers = LLMProviderFactory.createProvidersFromConfig({
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'mixtral-8x7b-32768',
  },
});
```

## Health Monitoring

```typescript
const { registry } = initializeLLMSystem();

// Check health of all providers
const health = await registry.healthCheckAll();

for (const h of health) {
  console.log(`${h.provider}: ${h.healthy ? '✓' : '✗'}`);
  if (h.error) {
    console.log(`  Error: ${h.error}`);
  }
}
```

## Performance Metrics

### Cost Analysis

```typescript
const { loadBalancer } = initializeLLMSystem();

// Get detailed stats
const stats = loadBalancer.getStats();
for (const [provider, data] of Object.entries(stats)) {
  console.log(`${provider}:`);
  console.log(`  Requests: ${data.requests}`);
  console.log(`  Total cost: $${data.totalCost.toFixed(2)}`);
  console.log(`  Avg cost: $${data.avgCost.toFixed(4)}`);
}

// Reset stats
loadBalancer.reset();
```

## Integration with Lambda

The LLM system is integrated into AWS Lambda handlers for AppSync mutations:

```typescript
// In Lambda handler
import { initializeLLMSystem } from '@unimatrix/llm';

const { registry, router, loadBalancer } = initializeLLMSystem();

export async function handleCompleteLLMMessage(event: any) {
  const provider = await router.route(event.messages, 'best');
  const result = await provider!.complete(event.messages);
  loadBalancer.trackRequest(provider!.name, result.cost);
  return result;
}
```

## Error Handling

All providers gracefully handle errors:

```typescript
try {
  const provider = registry.getProvider('Claude');
  const result = await provider!.complete(messages);
} catch (error) {
  console.error('Completion failed:', error);
  // Fallback to another provider
  const fallback = router.routeToCheapest();
  const result = await fallback!.complete(messages);
}
```

## Testing

```typescript
import { LLMProviderRegistry, IntelligentLLMRouter } from '@unimatrix/llm';

// Test complexity analysis
const complexity = LLMProviderRegistry.analyzeComplexity('Test message');
expect(complexity).toBeGreaterThanOrEqual(0);
expect(complexity).toBeLessThanOrEqual(1);

// Test routing strategy suggestion
const strategy = LLMProviderRegistry.suggestStrategy({
  messageLength: 100,
  taskComplexity: 'simple',
  urgency: 'normal',
});
expect(['cheapest', 'fastest', 'best', 'roundrobin']).toContain(strategy);
```

## Troubleshooting

### No providers available
- Check that at least one API key is set in `.env`
- Run `registry.healthCheckAll()` to see which providers are failing
- For Ollama, ensure `ollama serve` is running on localhost:11434

### Provider health check failing
- Verify API keys are valid
- Check network connectivity
- Review provider-specific error messages in logs

### Unexpectedly high costs
- Use `router.routeToCheapest()` for non-critical requests
- Check `loadBalancer.getStats()` to see which providers are being used
- Consider using Ollama for local, free inference

### Slow responses
- Use `router.routeToFastest()` to prefer Groq
- Check provider health status
- Consider message complexity (shorter messages are faster)

## API Reference

### Classes

- `BaseLLMProvider` - Abstract base class for all providers
- `ClaudeProvider` - Anthropic Claude implementation
- `OpenAIProvider` - OpenAI GPT implementation
- `GeminiProvider` - Google Gemini implementation
- `GroqProvider` - Groq implementation
- `OllamaProvider` - Local Ollama implementation
- `LLMProviderRegistry` - Manages multiple providers
- `IntelligentLLMRouter` - Routes messages to optimal provider
- `LLMLoadBalancer` - Tracks request distribution and costs

### Functions

- `initializeLLMSystem()` - Initialize from environment variables
- `initializeLLMSystemFromConfig(config)` - Initialize from config object
- `parseEnvConfig()` - Parse environment variables
- `getProviderStats(balancer)` - Get usage statistics
- `resetProviderStats(balancer)` - Reset statistics

### Types

- `ILLMProvider` - Provider interface
- `Message` - Chat message type
- `CompletionResult` - Completion result type
- `CompletionOptions` - Completion options
- `RoutingStrategy` - Strategy type ('cheapest', 'fastest', 'best', 'roundrobin')
- `RoutingContext` - Context for routing decisions
- `ProviderHealth` - Health status type

## Contributing

To add a new LLM provider:

1. Extend `BaseLLMProvider`
2. Implement `complete()`, `stream()`, and `healthCheck()`
3. Add pricing information in constructor
4. Register in `LLMProviderFactory.createProvider()`
5. Add environment variable support in `initializeLLMSystem()`

## License

MIT
