/**
 * OpenAI-Compatible Provider
 *
 * One adapter covers every provider that implements the OpenAI chat completions API:
 *   Mistral, DeepSeek, xAI Grok, Together AI, Fireworks AI, Cerebras, SambaNova,
 *   NVIDIA NIM, AI21, Aleph Alpha, OctoAI, OpenRouter, Azure AI Foundry,
 *   Databricks Mosaic, vLLM, LM Studio, Jan, llama.cpp server, Text Gen WebUI.
 *
 * Usage:
 *   const provider = new OpenAICompatProvider(MISTRAL_CONFIG, apiKey, 'mistral-large-latest');
 *   const result = await provider.complete(messages);
 */

import OpenAI from 'openai';
import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

export interface OpenAICompatConfig {
  /** Canonical provider slug — used for memory tagging, history palace, routing */
  providerSlug: string;
  /** Display name shown in UI */
  displayName: string;
  /** Base URL for the provider's OpenAI-compat API */
  baseURL: string;
  /** Context window in tokens */
  contextWindow: number;
  /** Cost per 1k input tokens (USD) — 0 for local/unknown */
  costInput: number;
  /** Cost per 1k output tokens (USD) — 0 for local/unknown */
  costOutput: number;
  /** Whether an API key is required (false for local engines) */
  requiresApiKey: boolean;
  /** Extra headers to inject (e.g. OpenRouter requires HTTP-Referer) */
  extraHeaders?: Record<string, string>;
}

// ─── Provider Registry ──────────────────────────────────────────────────────

export const OPENAI_COMPAT_CONFIGS: Record<string, OpenAICompatConfig> = {
  // ── Frontier / Open-weight API providers ──────────────────────────────────
  mistral: {
    providerSlug: 'mistral',
    displayName: 'Mistral AI',
    baseURL: 'https://api.mistral.ai/v1',
    contextWindow: 131072,
    costInput: 0.002,
    costOutput: 0.006,
    requiresApiKey: true,
  },
  deepseek: {
    providerSlug: 'deepseek',
    displayName: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    contextWindow: 65536,
    costInput: 0.00014,
    costOutput: 0.00028,
    requiresApiKey: true,
  },
  xai: {
    providerSlug: 'xai',
    displayName: 'xAI Grok',
    baseURL: 'https://api.x.ai/v1',
    contextWindow: 131072,
    costInput: 0.003,
    costOutput: 0.015,
    requiresApiKey: true,
  },
  together: {
    providerSlug: 'together',
    displayName: 'Together AI',
    baseURL: 'https://api.together.xyz/v1',
    contextWindow: 131072,
    costInput: 0.0008,
    costOutput: 0.0008,
    requiresApiKey: true,
  },
  fireworks: {
    providerSlug: 'fireworks',
    displayName: 'Fireworks AI',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    contextWindow: 131072,
    costInput: 0.0009,
    costOutput: 0.0009,
    requiresApiKey: true,
  },
  cerebras: {
    providerSlug: 'cerebras',
    displayName: 'Cerebras Inference',
    baseURL: 'https://api.cerebras.ai/v1',
    contextWindow: 131072,
    costInput: 0.0006,
    costOutput: 0.0006,
    requiresApiKey: true,
  },
  sambanova: {
    providerSlug: 'sambanova',
    displayName: 'SambaNova Cloud',
    baseURL: 'https://api.sambanova.ai/v1',
    contextWindow: 131072,
    costInput: 0.0008,
    costOutput: 0.0016,
    requiresApiKey: true,
  },
  nvidia: {
    providerSlug: 'nvidia',
    displayName: 'NVIDIA NIM',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    contextWindow: 131072,
    costInput: 0.00035,
    costOutput: 0.00040,
    requiresApiKey: true,
  },
  ai21: {
    providerSlug: 'ai21',
    displayName: 'AI21 Labs',
    baseURL: 'https://api.ai21.com/studio/v1',
    contextWindow: 256000,
    costInput: 0.0005,
    costOutput: 0.0007,
    requiresApiKey: true,
  },
  octoai: {
    providerSlug: 'octoai',
    displayName: 'OctoAI',
    baseURL: 'https://text.octoai.run/v1',
    contextWindow: 131072,
    costInput: 0.00015,
    costOutput: 0.00015,
    requiresApiKey: true,
  },

  // ── Gateway / Router ───────────────────────────────────────────────────────
  openrouter: {
    providerSlug: 'openrouter',
    displayName: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    contextWindow: 200000, // varies per model — set per-request
    costInput: 0,          // billed per model by OpenRouter
    costOutput: 0,
    requiresApiKey: true,
    extraHeaders: {
      'HTTP-Referer': 'https://deployunimatrix.com',
      'X-Title': 'Unimatrix',
    },
  },

  // ── Enterprise cloud (OpenAI-compat endpoints) ─────────────────────────────
  azure: {
    providerSlug: 'azure',
    displayName: 'Azure AI Foundry',
    // User supplies their own endpoint — this is a placeholder
    baseURL: 'https://<resource>.openai.azure.com/openai/deployments/<deployment>',
    contextWindow: 128000,
    costInput: 0.01,
    costOutput: 0.03,
    requiresApiKey: true,
  },
  databricks: {
    providerSlug: 'databricks',
    displayName: 'Databricks Mosaic AI',
    // User supplies workspace URL: https://<workspace>.azuredatabricks.net/serving-endpoints
    baseURL: 'https://<workspace>.azuredatabricks.net/serving-endpoints',
    contextWindow: 131072,
    costInput: 0,
    costOutput: 0,
    requiresApiKey: true,
  },

  // ── Local inference engines (no API key — user supplies baseUrl) ───────────
  vllm: {
    providerSlug: 'vllm',
    displayName: 'vLLM',
    baseURL: 'http://localhost:8000/v1',
    contextWindow: 131072,
    costInput: 0,
    costOutput: 0,
    requiresApiKey: false,
  },
  lmstudio: {
    providerSlug: 'lmstudio',
    displayName: 'LM Studio',
    baseURL: 'http://localhost:1234/v1',
    contextWindow: 131072,
    costInput: 0,
    costOutput: 0,
    requiresApiKey: false,
  },
  jan: {
    providerSlug: 'jan',
    displayName: 'Jan',
    baseURL: 'http://localhost:1337/v1',
    contextWindow: 131072,
    costInput: 0,
    costOutput: 0,
    requiresApiKey: false,
  },
  llamacpp: {
    providerSlug: 'llamacpp',
    displayName: 'llama.cpp',
    baseURL: 'http://localhost:8080/v1',
    contextWindow: 131072,
    costInput: 0,
    costOutput: 0,
    requiresApiKey: false,
  },
  textgenwebui: {
    providerSlug: 'textgenwebui',
    displayName: 'Text Generation WebUI',
    baseURL: 'http://localhost:5000/v1',
    contextWindow: 131072,
    costInput: 0,
    costOutput: 0,
    requiresApiKey: false,
  },
};

// ─── Provider Class ──────────────────────────────────────────────────────────

export class OpenAICompatProvider extends BaseLLMProvider {
  private client: OpenAI;
  private config: OpenAICompatConfig;

  constructor(
    config: OpenAICompatConfig,
    apiKey: string,
    model: string,
    /** Override baseURL — used for local engines where user supplies their own host */
    baseURLOverride?: string,
  ) {
    super(
      config.displayName,
      model,
      config.costInput,
      config.costOutput,
      config.contextWindow,
      true,
    );

    this.config = config;

    this.client = new OpenAI({
      apiKey: apiKey || 'local', // local engines don't need a real key
      baseURL: baseURLOverride ?? config.baseURL,
      defaultHeaders: config.extraHeaders ?? {},
    });
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature,
      top_p: options?.topP,
    });

    const latency = Date.now() - start;
    const usage = {
      input: response.usage?.prompt_tokens ?? 0,
      output: response.usage?.completion_tokens ?? 0,
    };
    const content = response.choices[0]?.message?.content ?? '';
    const cost = this.calculateCost(usage.input, usage.output);

    const result: CompletionResult = {
      content,
      tokensUsed: usage.input + usage.output,
      latencyMs: latency,
      cost,
      model: this.model,
      provider: this.config.providerSlug,
    };

    await this.maybeAutoLog(messages, result);
    return result;
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions,
  ): AsyncIterableIterator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature,
      top_p: options?.topP,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      return !!res.id;
    } catch {
      return false;
    }
  }
}

/**
 * Factory helper — create an OpenAICompatProvider from a slug + env vars.
 * Used by the LLMProviderFactory to auto-register all configured providers.
 */
export function createOpenAICompatProvider(
  slug: string,
  model: string,
  apiKey: string,
  baseURLOverride?: string,
): OpenAICompatProvider | null {
  const config = OPENAI_COMPAT_CONFIGS[slug];
  if (!config) return null;
  if (config.requiresApiKey && !apiKey) return null;
  return new OpenAICompatProvider(config, apiKey, model, baseURLOverride);
}
