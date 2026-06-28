import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';
import { BaseLLMProvider } from './base.js';

type OpenAICompatConfig = {
  baseURL: string;
  envKey: string;
  models: string[];
};

export const OPENAI_COMPAT_PROVIDERS: Record<string, OpenAICompatConfig> = {
  mistral: { baseURL: 'https://api.mistral.ai/v1', envKey: 'MISTRAL_API_KEY', models: ['mistral-large-latest', 'codestral-latest'] },
  deepseek: { baseURL: 'https://api.deepseek.com/v1', envKey: 'DEEPSEEK_API_KEY', models: ['deepseek-chat', 'deepseek-coder'] },
  together: { baseURL: 'https://api.together.xyz/v1', envKey: 'TOGETHER_API_KEY', models: ['meta-llama/Llama-4-Scout', 'Qwen/Qwen3-235B-A22B'] },
  fireworks: { baseURL: 'https://api.fireworks.ai/inference/v1', envKey: 'FIREWORKS_API_KEY', models: ['accounts/fireworks/models/llama-v3p1-70b-instruct'] },
  cerebras: { baseURL: 'https://api.cerebras.ai/v1', envKey: 'CEREBRAS_API_KEY', models: ['llama3.1-70b', 'llama3.1-8b'] },
  sambanova: { baseURL: 'https://api.sambanova.ai/v1', envKey: 'SAMBANOVA_API_KEY', models: ['Meta-Llama-3.3-70B-Instruct'] },
  xai: { baseURL: 'https://api.x.ai/v1', envKey: 'XAI_API_KEY', models: ['grok-3', 'grok-3-mini'] },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', envKey: 'OPENROUTER_API_KEY', models: ['meta-llama/llama-4-scout', 'deepseek/deepseek-r2'] },
  nvidia: { baseURL: 'https://integrate.api.nvidia.com/v1', envKey: 'NVIDIA_API_KEY', models: ['meta/llama-3.3-70b-instruct'] },
  ai21: { baseURL: 'https://api.ai21.com/studio/v1', envKey: 'AI21_API_KEY', models: ['jamba-1.5-large'] },
  sonar: { baseURL: 'https://api.perplexity.ai', envKey: 'PERPLEXITY_API_KEY', models: ['sonar-pro', 'sonar', 'sonar-reasoning-pro'] },
  vllm: { baseURL: 'http://localhost:8000/v1', envKey: '', models: [] },
  lmstudio: { baseURL: 'http://localhost:1234/v1', envKey: '', models: [] },
  jan: { baseURL: 'http://localhost:1337/v1', envKey: '', models: [] },
  llamacpp: { baseURL: 'http://localhost:8080/v1', envKey: '', models: [] },
  textgenui: { baseURL: 'http://localhost:5000/v1', envKey: '', models: [] },
};

export class OpenAICompatProvider extends BaseLLMProvider {
  private readonly baseURL: string;
  private readonly apiKey: string;
  readonly models: string[];

  constructor(
    public readonly providerName: string,
    baseURL: string,
    apiKey: string,
    models: string[],
    model?: string,
  ) {
    super(providerName, model ?? models[0] ?? 'default', 0, 0, 128000, true);
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.models = models;
  }

  async complete(messages: Message[], options?: CompletionOptions): Promise<CompletionResult> {
    const start = Date.now();
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: this.apiKey ? 'Bearer ' + this.apiKey : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: options?.maxTokens,
        temperature: options?.temperature,
        top_p: options?.topP,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`${this.providerName} request failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      model?: string;
    };
    const input = data.usage?.prompt_tokens ?? 0;
    const output = data.usage?.completion_tokens ?? 0;
    const result: CompletionResult = {
      content: data.choices?.[0]?.message?.content ?? '',
      tokensUsed: input + output,
      latencyMs: Date.now() - start,
      cost: 0,
      model: data.model ?? this.model,
      provider: this.providerName,
    };
    await this.maybeAutoLog(messages, result);
    return result;
  }

  async *stream(messages: Message[], options?: CompletionOptions): AsyncIterableIterator<string> {
    const result = await this.complete(messages, options);
    if (result.content) yield result.content;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/models`, {
        headers: { Authorization: this.apiKey ? 'Bearer ' + this.apiKey : '' },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
