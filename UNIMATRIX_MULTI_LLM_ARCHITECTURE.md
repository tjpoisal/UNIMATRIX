# Unimatrix — Multi-LLM Integration Architecture

**Purpose:** Support ANY LLM provider (local or cloud) reading/writing to shared palaces

---

## Architecture Overview

```
ANY LLM (local or cloud)
    ↓
Unimatrix Abstraction Layer (standardized interface)
├── OpenAI (GPT-4, GPT-3.5)
├── Anthropic Claude (Sonnet, Opus, Haiku)
├── Google Gemini
├── Meta Llama (via Ollama, llama.cpp, Groq)
├── Mistral
├── Custom local models (via Ollama)
└── Any OpenAI-compatible API
    ↓
Palace Read/Write Engine (identical for all LLMs)
    ↓
Unimatrix Server (DynamoDB + AppSync + Redis)
```

**Key Principle:** LLM orchestration is **provider-agnostic**. The palace read/write layer doesn't care which LLM generated the content.

---

## Part 1: Unimatrix LLM Provider Interface

### 1.1 Abstract LLM Provider Class

```typescript
/**
 * LLMProvider - Abstract interface that ALL LLM implementations follow
 * 
 * This allows swapping Claude ↔ Ollama ↔ GPT-4 with one line of config
 */

interface LLMProvider {
  // Unique identifier (for logging, metrics)
  providerId: string;
  
  // Call the LLM with a message
  complete(input: CompletionInput): Promise<CompletionOutput>;
  
  // Stream tokens (for real-time UI updates)
  stream(input: CompletionInput): AsyncIterableIterator<string>;
  
  // Get model info (context window, cost, etc)
  getModelInfo(): ModelInfo;
  
  // Check if provider is available/healthy
  healthCheck(): Promise<boolean>;
}

interface CompletionInput {
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: Message[];
  maxTokens?: number;
  temperature?: number;
}

interface CompletionOutput {
  text: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  model: string;
  providerId: string;
  latency: number;  // ms
}

interface ModelInfo {
  name: string;
  providerId: string;
  contextWindow: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  capabilities: {
    reasoning: boolean;
    vision: boolean;
    functionCalling: boolean;
  };
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### 1.2 Implementation: Anthropic Claude

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeProvider implements LLMProvider {
  providerId = 'anthropic-claude';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    const start = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: input.maxTokens || 2000,
      temperature: input.temperature || 0.7,
      system: input.systemPrompt,
      messages: [
        ...(input.conversationHistory || []),
        {
          role: 'user',
          content: input.userMessage,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      text,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      model: this.model,
      providerId: this.providerId,
      latency: Date.now() - start,
    };
  }

  async *stream(input: CompletionInput): AsyncIterableIterator<string> {
    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: input.maxTokens || 2000,
      system: input.systemPrompt,
      messages: [
        ...(input.conversationHistory || []),
        {
          role: 'user',
          content: input.userMessage,
        },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  getModelInfo(): ModelInfo {
    return {
      name: this.model,
      providerId: this.providerId,
      contextWindow: 200000,
      costPer1kInputTokens: 0.003,
      costPer1kOutputTokens: 0.015,
      speed: 'fast',
      capabilities: {
        reasoning: true,
        vision: true,
        functionCalling: true,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ok' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

### 1.3 Implementation: OpenAI (GPT-4, GPT-3.5)

```typescript
import OpenAI from 'openai';

export class OpenAIProvider implements LLMProvider {
  providerId = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: input.maxTokens || 2000,
      temperature: input.temperature || 0.7,
      system: input.systemPrompt,
      messages: [
        ...(input.conversationHistory || []),
        {
          role: 'user',
          content: input.userMessage,
        },
      ],
    });

    const text = response.choices[0].message.content || '';

    return {
      text,
      tokensUsed: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
      },
      model: this.model,
      providerId: this.providerId,
      latency: Date.now() - start,
    };
  }

  async *stream(input: CompletionInput): AsyncIterableIterator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: input.maxTokens || 2000,
      temperature: input.temperature || 0.7,
      stream: true,
      system: input.systemPrompt,
      messages: [
        ...(input.conversationHistory || []),
        {
          role: 'user',
          content: input.userMessage,
        },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }

  getModelInfo(): ModelInfo {
    return {
      name: this.model,
      providerId: this.providerId,
      contextWindow: 128000,
      costPer1kInputTokens: 0.01,
      costPer1kOutputTokens: 0.03,
      speed: 'medium',
      capabilities: {
        reasoning: true,
        vision: true,
        functionCalling: true,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ok' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

### 1.4 Implementation: Ollama (Local LLMs)

```typescript
/**
 * Ollama - Run local LLMs (Llama 2, Mistral, etc) on your Mac
 * 
 * Install: brew install ollama
 * Start: ollama serve
 * Pull model: ollama pull mistral
 */

export class OllamaProvider implements LLMProvider {
  providerId = 'ollama-local';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://127.0.0.1:11434', model: string = 'mistral') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    const start = Date.now();

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: input.systemPrompt },
          ...(input.conversationHistory || []),
          { role: 'user', content: input.userMessage },
        ],
        stream: false,
      }),
    });

    const data = (await response.json()) as any;

    return {
      text: data.message.content,
      tokensUsed: {
        input: data.prompt_eval_count || 0,
        output: data.eval_count || 0,
      },
      model: this.model,
      providerId: this.providerId,
      latency: Date.now() - start,
    };
  }

  async *stream(input: CompletionInput): AsyncIterableIterator<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: input.systemPrompt },
          ...(input.conversationHistory || []),
          { role: 'user', content: input.userMessage },
        ],
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          const chunk = JSON.parse(line);
          if (chunk.message?.content) {
            yield chunk.message.content;
          }
        }
      }
    }
  }

  getModelInfo(): ModelInfo {
    return {
      name: this.model,
      providerId: this.providerId,
      contextWindow: 4096,  // Varies by model
      costPer1kInputTokens: 0,  // Local = free
      costPer1kOutputTokens: 0,
      speed: 'slow',  // CPU-based, slower than cloud
      capabilities: {
        reasoning: false,
        vision: false,
        functionCalling: false,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 1.5 Implementation: Google Gemini

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements LLMProvider {
  providerId = 'google-gemini';
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-pro') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    const start = Date.now();
    const genAI = this.client;
    const model = genAI.getGenerativeModel({ model: this.model });

    const chat = model.startChat({
      history: input.conversationHistory?.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(input.userMessage);
    const text = result.response.text();

    return {
      text,
      tokensUsed: {
        input: 0,  // Gemini doesn't expose token counts
        output: 0,
      },
      model: this.model,
      providerId: this.providerId,
      latency: Date.now() - start,
    };
  }

  async *stream(input: CompletionInput): AsyncIterableIterator<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const chat = model.startChat({
      history: input.conversationHistory?.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessageStream(input.userMessage);

    for await (const chunk of result.stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  getModelInfo(): ModelInfo {
    return {
      name: this.model,
      providerId: this.providerId,
      contextWindow: 32000,
      costPer1kInputTokens: 0.0005,
      costPer1kOutputTokens: 0.0015,
      speed: 'fast',
      capabilities: {
        reasoning: true,
        vision: true,
        functionCalling: true,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      await model.generateContent('ok');
      return true;
    } catch {
      return false;
    }
  }
}
```

### 1.6 Implementation: Groq (Fast Inference)

```typescript
import Groq from 'groq-sdk';

export class GroqProvider implements LLMProvider {
  providerId = 'groq';
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string = 'mixtral-8x7b-32768') {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: input.maxTokens || 2000,
      temperature: input.temperature || 0.7,
      messages: [
        { role: 'system', content: input.systemPrompt },
        ...(input.conversationHistory || []),
        { role: 'user', content: input.userMessage },
      ],
    });

    const text = response.choices[0].message.content || '';

    return {
      text,
      tokensUsed: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
      },
      model: this.model,
      providerId: this.providerId,
      latency: Date.now() - start,
    };
  }

  async *stream(input: CompletionInput): AsyncIterableIterator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: input.maxTokens || 2000,
      stream: true,
      messages: [
        { role: 'system', content: input.systemPrompt },
        ...(input.conversationHistory || []),
        { role: 'user', content: input.userMessage },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }

  getModelInfo(): ModelInfo {
    return {
      name: this.model,
      providerId: this.providerId,
      contextWindow: 32000,
      costPer1kInputTokens: 0.00027,
      costPer1kOutputTokens: 0.00027,
      speed: 'fast',  // Groq is extremely fast (~100ms)
      capabilities: {
        reasoning: true,
        vision: false,
        functionCalling: true,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ok' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Part 2: LLM Provider Factory & Registry

### 2.1 Provider Factory

```typescript
/**
 * Factory pattern - create LLM providers based on config
 */

export class LLMProviderFactory {
  static create(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'anthropic':
        return new ClaudeProvider(config.apiKey, config.model);

      case 'openai':
        return new OpenAIProvider(config.apiKey, config.model);

      case 'google':
        return new GeminiProvider(config.apiKey, config.model);

      case 'groq':
        return new GroqProvider(config.apiKey, config.model);

      case 'ollama':
        return new OllamaProvider(config.baseUrl, config.model);

      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }
}

interface LLMConfig {
  provider: 'anthropic' | 'openai' | 'google' | 'groq' | 'ollama';
  apiKey?: string;  // Not needed for Ollama
  baseUrl?: string;  // For Ollama
  model: string;
}
```

### 2.2 Provider Registry (For Running Multiple LLMs)

```typescript
/**
 * Registry - manage multiple LLM providers simultaneously
 * 
 * Useful for:
 * - Load balancing (round-robin)
 * - Cost optimization (use cheapest for simple tasks)
 * - Redundancy (fallback if one provider fails)
 * - Comparison (run same task on multiple models)
 */

export class LLMProviderRegistry {
  private providers: Map<string, LLMProvider> = new Map();

  // Register a provider
  register(providerId: string, provider: LLMProvider): void {
    this.providers.set(providerId, provider);
  }

  // Get a provider by ID
  get(providerId: string): LLMProvider | undefined {
    return this.providers.get(providerId);
  }

  // Get all providers
  getAll(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  // Get provider by strategy
  async getNextProvider(strategy: 'fastest' | 'cheapest' | 'roundRobin'): Promise<LLMProvider> {
    const available = await Promise.all(
      Array.from(this.providers.values()).map(async p => ({
        provider: p,
        healthy: await p.healthCheck(),
      }))
    );

    const healthy = available.filter(a => a.healthy).map(a => a.provider);

    if (healthy.length === 0) {
      throw new Error('No healthy providers available');
    }

    switch (strategy) {
      case 'fastest': {
        // Return fastest provider (lowest latency)
        const models = healthy.map(p => p.getModelInfo());
        return healthy[models.reduce((i, m, idx) => (m.speed === 'fast' ? idx : i), 0)];
      }

      case 'cheapest': {
        // Return cheapest provider
        const models = healthy.map(p => p.getModelInfo());
        const costs = models.map(m => m.costPer1kInputTokens + m.costPer1kOutputTokens);
        return healthy[costs.indexOf(Math.min(...costs))];
      }

      case 'roundRobin':
      default: {
        // Return random healthy provider
        return healthy[Math.floor(Math.random() * healthy.length)];
      }
    }
  }
}
```

---

## Part 3: Multi-LLM Integration with Unimatrix

### 3.1 Updated Palace Write Tracking

Track which LLM wrote what to palaces:

```typescript
interface PalaceDrawer {
  id: string;
  content: string;
  type: 'finding' | 'reasoning' | 'decision' | 'context';
  metadata: {
    source: 'llm-interaction';
    timestamp: string;
    llmProvider: string;  // ← NEW: "anthropic", "openai", "ollama-local", etc
    model: string;        // ← NEW: "claude-sonnet", "gpt-4", "mistral", etc
    tokensUsed: {
      input: number;
      output: number;
    };
    latency: number;      // ms to generate this content
    cost: number;         // in cents (if applicable)
  };
}
```

### 3.2 Multi-LLM Unimatrix Integration

```typescript
/**
 * UnimatrixMultiLLM
 * 
 * Same as unimatrix-claude-integration.ts, but:
 * - Accepts ANY LLM provider
 * - Records which LLM wrote what
 * - Can run same task on multiple LLMs for comparison
 */

export async function unimatrixWithAnyLLM(input: {
  userId: string;
  conversationId: string;
  userMessage: string;
  llmProvider: LLMProvider;  // ← Can be Claude, GPT-4, Mistral, etc
  palaceIds?: string[];
}): Promise<{
  response: string;
  llmProvider: string;
  model: string;
  tokensUsed: { input: number; output: number };
  cost: number;
  latency: number;
}> {
  console.log(`\n🧠 Unimatrix interaction (${input.llmProvider.providerId})...`);

  // 1. Query palaces for context
  const palaceDataMap = await queryPalacesForContext(input.userId, input.palaceIds);
  const palaceIds = Array.from(palaceDataMap.keys());

  // 2. Build system prompt
  const systemPrompt = buildUnimatrixSystemPrompt(palaceDataMap);

  // 3. Call ANY LLM
  const start = Date.now();
  const completion = await input.llmProvider.complete({
    systemPrompt,
    userMessage: input.userMessage,
  });
  const latency = Date.now() - start;

  // 4. Parse palace writes
  const palaceWrites = parsePalaceWrites(completion.text);

  // 5. Write to palaces (with LLM provider metadata)
  for (const write of palaceWrites) {
    await appSync.writeToPalace({
      ...write,
      metadata: {
        source: 'llm-interaction',
        timestamp: new Date().toISOString(),
        llmProvider: input.llmProvider.providerId,
        model: input.llmProvider.getModelInfo().name,
        tokensUsed: completion.tokensUsed,
        latency,
        cost: calculateCost(completion.tokensUsed, input.llmProvider.getModelInfo()),
      },
    });
  }

  // 6. Record conversation
  await recordConversationMessage(
    input.conversationId,
    input.userId,
    input.userMessage,
    completion.text,
    palaceIds,
    palaceWrites
  );

  const cost = calculateCost(completion.tokensUsed, input.llmProvider.getModelInfo());

  return {
    response: completion.text.replace(/\[PALACE_WRITE\].*?\[\/PALACE_WRITE\]/gs, '').trim(),
    llmProvider: input.llmProvider.providerId,
    model: input.llmProvider.getModelInfo().name,
    tokensUsed: completion.tokensUsed,
    cost,
    latency,
  };
}

function calculateCost(tokensUsed: { input: number; output: number }, modelInfo: ModelInfo): number {
  const inputCost = (tokensUsed.input / 1000) * modelInfo.costPer1kInputTokens;
  const outputCost = (tokensUsed.output / 1000) * modelInfo.costPer1kOutputTokens;
  return inputCost + outputCost;
}
```

### 3.3 Load Balancing Across Multiple LLMs

```typescript
/**
 * Route different tasks to different LLMs for cost optimization
 */

export async function intelligentLLMRouting(input: {
  userId: string;
  conversationId: string;
  userMessage: string;
  registry: LLMProviderRegistry;
}): Promise<{
  response: string;
  llmUsed: string;
  cost: number;
}> {
  // Determine task complexity
  const complexity = analyzeMessageComplexity(input.userMessage);

  let provider: LLMProvider;

  switch (complexity) {
    case 'simple':
      // Use cheapest/fastest for simple tasks
      provider = await input.registry.getNextProvider('cheapest');
      break;

    case 'complex':
      // Use most capable for complex reasoning
      provider = input.registry.get('anthropic-claude') || (await input.registry.getNextProvider('fastest'));
      break;

    case 'urgent':
      // Use fastest for latency-sensitive tasks
      provider = await input.registry.getNextProvider('fastest');
      break;

    default:
      provider = await input.registry.getNextProvider('roundRobin');
  }

  return await unimatrixWithAnyLLM({
    ...input,
    llmProvider: provider,
  });
}

function analyzeMessageComplexity(message: string): 'simple' | 'complex' | 'urgent' {
  const length = message.length;
  const questionCount = (message.match(/\?/g) || []).length;
  const analysisWords = ['analyze', 'explain', 'reason', 'compare', 'summarize'];
  const hasAnalysis = analysisWords.some(w => message.toLowerCase().includes(w));

  if (message.includes('URGENT') || message.includes('NOW')) return 'urgent';
  if (length > 500 || questionCount > 3 || hasAnalysis) return 'complex';
  return 'simple';
}
```

---

## Part 4: Configuration Examples

### 4.1 .env for Multi-LLM Setup

```bash
# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo

# Google Gemini
GOOGLE_API_KEY=xxxxxxxxxxxxx
GEMINI_MODEL=gemini-pro

# Groq (fast inference)
GROQ_API_KEY=gsk-xxxxxxxxxxxxx
GROQ_MODEL=mixtral-8x7b-32768

# Ollama (local)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=mistral

# Unimatrix
APPSYNC_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
APPSYNC_API_KEY=da2-xxxxxxxxxxxxx
REDIS_ENDPOINT=unimatrix-redis-xxx.ng.0001.use1.cache.amazonaws.com

# LLM Strategy
LLM_STRATEGY=intelligent-routing  # or "round-robin", "cheapest", "fastest"
```

### 4.2 Initialization Code

```typescript
import dotenv from 'dotenv';
dotenv.config();

// Create provider instances
const providers: { [key: string]: LLMProvider } = {
  claude: new ClaudeProvider(
    process.env.ANTHROPIC_API_KEY!,
    process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
  ),

  gpt4: new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_MODEL || 'gpt-4-turbo'
  ),

  gemini: new GeminiProvider(
    process.env.GOOGLE_API_KEY!,
    process.env.GEMINI_MODEL || 'gemini-pro'
  ),

  groq: new GroqProvider(
    process.env.GROQ_API_KEY!,
    process.env.GROQ_MODEL || 'mixtral-8x7b-32768'
  ),

  ollama: new OllamaProvider(
    process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    process.env.OLLAMA_MODEL || 'mistral'
  ),
};

// Create registry
const llmRegistry = new LLMProviderRegistry();
Object.entries(providers).forEach(([id, provider]) => {
  llmRegistry.register(id, provider);
});

// Export for use
export { llmRegistry, providers };
```

### 4.3 Usage Examples

```typescript
// Example 1: Use Claude specifically
const result1 = await unimatrixWithAnyLLM({
  userId: 'user-123',
  conversationId: 'conv-456',
  userMessage: 'Analyze weather patterns',
  llmProvider: providers.claude,
});

// Example 2: Use GPT-4 for comparison
const result2 = await unimatrixWithAnyLLM({
  userId: 'user-123',
  conversationId: 'conv-456',
  userMessage: 'Analyze weather patterns',
  llmProvider: providers.gpt4,
});

// Example 3: Intelligent routing (automatic provider selection)
const result3 = await intelligentLLMRouting({
  userId: 'user-123',
  conversationId: 'conv-456',
  userMessage: 'Quick weather summary',
  registry: llmRegistry,
});

// Example 4: Cheapest provider for batch processing
const cheapest = await llmRegistry.getNextProvider('cheapest');
const result4 = await unimatrixWithAnyLLM({
  userId: 'user-123',
  conversationId: 'conv-456',
  userMessage: 'Process historical data',
  llmProvider: cheapest,
});

// Example 5: Compare responses across 3 LLMs
const comparisons = await Promise.all([
  unimatrixWithAnyLLM({
    userId: 'user-123',
    conversationId: 'conv-456',
    userMessage: userMessage,
    llmProvider: providers.claude,
  }),
  unimatrixWithAnyLLM({
    userId: 'user-123',
    conversationId: 'conv-456',
    userMessage: userMessage,
    llmProvider: providers.gpt4,
  }),
  unimatrixWithAnyLLM({
    userId: 'user-123',
    conversationId: 'conv-456',
    userMessage: userMessage,
    llmProvider: providers.gemini,
  }),
]);

console.log('Comparison results:', comparisons);
```

---

## Part 5: Monitoring Multi-LLM Usage

### 5.1 Palace Query to Show LLM Usage

```graphql
query GetLLMUsageByProvider($palaceId: String!) {
  # Get all palace data, grouped by LLM provider
  searchPalace(palaceId: $palaceId, query: "*", topK: 1000) {
    id
    content
    metadata  # Contains llmProvider, model, tokensUsed, cost
    createdBy
    createdAt
  }
}
```

### 5.2 Dashboard Metrics

```typescript
interface LLMMetrics {
  provider: string;
  model: string;
  totalCalls: number;
  totalTokensUsed: {
    input: number;
    output: number;
  };
  totalCost: number;
  avgLatency: number;
  avgResponseQuality: number;  // Based on palace writes
}

// Query DynamoDB to get metrics
async function getLLMMetrics(palaceId: string): Promise<LLMMetrics[]> {
  const drawers = await queryPalaceDrawers(palaceId);
  
  const grouped = new Map<string, any[]>();
  drawers.forEach(d => {
    const key = `${d.metadata.llmProvider}:${d.metadata.model}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(d);
  });

  return Array.from(grouped.entries()).map(([key, drawers]) => {
    const [provider, model] = key.split(':');
    const totalTokens = drawers.reduce((sum, d) => 
      sum + d.metadata.tokensUsed.input + d.metadata.tokensUsed.output, 0
    );
    const totalCost = drawers.reduce((sum, d) => sum + (d.metadata.cost || 0), 0);
    const avgLatency = drawers.reduce((sum, d) => sum + d.metadata.latency, 0) / drawers.length;

    return {
      provider,
      model,
      totalCalls: drawers.length,
      totalTokensUsed: {
        input: drawers.reduce((sum, d) => sum + d.metadata.tokensUsed.input, 0),
        output: drawers.reduce((sum, d) => sum + d.metadata.tokensUsed.output, 0),
      },
      totalCost,
      avgLatency,
      avgResponseQuality: 4.5,  // TODO: Implement quality scoring
    };
  });
}
```

---

## Part 6: Multi-LLM Deployment Architecture

```
Config (.env)
├── ANTHROPIC_API_KEY (Claude)
├── OPENAI_API_KEY (GPT-4)
├── GOOGLE_API_KEY (Gemini)
├── GROQ_API_KEY (Groq)
├── OLLAMA_BASE_URL (Local Mistral)
└── LLM_STRATEGY (intelligent-routing)
    ↓
LLMProviderRegistry
├── ClaudeProvider
├── OpenAIProvider
├── GeminiProvider
├── GroqProvider
└── OllamaProvider
    ↓
intelligentLLMRouting() or unimatrixWithAnyLLM()
    ↓
Selected LLM (based on config/strategy)
    ↓
Unimatrix Palace (stores which LLM wrote what)
    ↓
DynamoDB (with llmProvider + model + cost metadata)
```

---

## Summary: Multi-LLM Unimatrix

| Feature | Support |
|---------|---------|
| **Claude (Sonnet, Opus, Haiku)** | ✅ Full |
| **GPT-4, GPT-3.5** | ✅ Full |
| **Google Gemini** | ✅ Full |
| **Groq (Mixtral, Llama2)** | ✅ Full |
| **Ollama (Local LLMs)** | ✅ Full |
| **Mistral (via API)** | ✅ With OpenAI-compatible endpoint |
| **Custom local models** | ✅ Via Ollama |
| **Cost tracking** | ✅ Per LLM per palace write |
| **Load balancing** | ✅ Cheapest/fastest/roundRobin |
| **Intelligent routing** | ✅ Auto-selects based on task |
| **Multi-LLM comparison** | ✅ Run same task on 3+ LLMs |
| **Fallback handling** | ✅ Switch to healthy provider |

---

## Files to Create

1. **`unimatrix-llm-providers.ts`** (1,500 lines)
   - All provider implementations
   - LLMProvider interface
   - Factory pattern

2. **`unimatrix-multi-llm-integration.ts`** (500 lines)
   - Multi-LLM Unimatrix wrapper
   - Load balancing
   - Cost tracking

3. **`llm-registry.ts`** (300 lines)
   - Provider registry
   - Health checking
   - Strategy selection

4. **`llm-metrics.ts`** (200 lines)
   - Dashboard queries
   - Cost analysis
   - Performance metrics

---

**Ready, Sir? Should I generate all four files in full production-ready code?**
