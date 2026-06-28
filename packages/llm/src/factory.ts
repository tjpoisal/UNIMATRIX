import { ILLMProvider } from '@unimatrix/types';
import { ClaudeProvider } from './providers/claude.js';
import { OpenAIProvider } from './providers/openai.js';
import { GeminiProvider } from './providers/gemini.js';
import { GroqProvider } from './providers/groq.js';
import { OllamaProvider } from './providers/ollama.js';
import { OpenAICompatProvider, OPENAI_COMPAT_PROVIDERS } from './providers/openai-compat.js';
import type { UnimatrixMemoryConfig } from './memory.js';

/**
 * Factory for creating LLM provider instances
 * Handles provider instantiation based on config
 */
export class LLMProviderFactory {
  /**
   * Create a provider instance from config
   */
  static createProvider(
    providerName: string,
    config: {
      apiKey?: string;
      model?: string;
      endpoint?: string;
      unimatrixMemory?: UnimatrixMemoryConfig;
    }
  ): ILLMProvider {
    let provider: ILLMProvider;

    switch (providerName.toLowerCase()) {
      case 'claude':
      case 'anthropic':
        provider = new ClaudeProvider(
          config.apiKey || process.env.ANTHROPIC_API_KEY || '',
          config.model || 'claude-3-opus-20240229'
        );
        break;

      case 'openai':
      case 'gpt':
        provider = new OpenAIProvider(
          config.apiKey || process.env.OPENAI_API_KEY || '',
          config.model || 'gpt-4-turbo-preview'
        );
        break;

      case 'gemini':
      case 'google':
        provider = new GeminiProvider(
          config.apiKey || process.env.GOOGLE_API_KEY || '',
          config.model || 'gemini-pro'
        );
        break;

      case 'groq':
        provider = new GroqProvider(
          config.apiKey || process.env.GROQ_API_KEY || '',
          config.model || 'mixtral-8x7b-32768'
        );
        break;

      case 'ollama':
        provider = new OllamaProvider(
          config.model || 'mistral',
          config.endpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'
        );
        break;

      default:
        {
          const compat = OPENAI_COMPAT_PROVIDERS[providerName.toLowerCase()];
          if (!compat) throw new Error(`Unknown LLM provider: ${providerName}`);
          const apiKey =
            config.apiKey ||
            (compat.envKey ? process.env[compat.envKey] || '' : 'local');
          provider = new OpenAICompatProvider(
            providerName,
            config.endpoint || compat.baseURL,
            apiKey,
            compat.models,
            config.model || compat.models[0]
          );
        }
    }

    if (config.unimatrixMemory) {
      (provider as any).setUnimatrixMemoryConfig?.(config.unimatrixMemory);
    }

    return provider;
  }

  /**
   * Create multiple providers from a config object
   * Useful for initializing all providers at startup
   */
  static createProvidersFromConfig(
    config: Record<
      string,
      {
        apiKey?: string;
        model?: string;
        endpoint?: string;
        unimatrixMemory?: UnimatrixMemoryConfig;
      }
    >
  ): ILLMProvider[] {
    return Object.entries(config).map(([name, providerConfig]) =>
      this.createProvider(name, providerConfig)
    );
  }

  /**
   * Create default providers (all 5)
   * Uses environment variables for API keys
   * Pass optional unimatrixMemory to enable auto-logging of every completion.
   */
  static createDefaultProviders(unimatrixMemory?: UnimatrixMemoryConfig): ILLMProvider[] {
    const providers: ILLMProvider[] = [];

    const memCfg = unimatrixMemory;

    // Claude
    if (process.env.ANTHROPIC_API_KEY) {
      const p = new ClaudeProvider(
        process.env.ANTHROPIC_API_KEY,
        process.env.CLAUDE_MODEL || 'claude-3-opus-20240229'
      );
      if (memCfg) (p as any).setUnimatrixMemoryConfig?.(memCfg);
      providers.push(p);
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      const p = new OpenAIProvider(
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      );
      if (memCfg) (p as any).setUnimatrixMemoryConfig?.(memCfg);
      providers.push(p);
    }

    // Gemini
    if (process.env.GOOGLE_API_KEY) {
      const p = new GeminiProvider(
        process.env.GOOGLE_API_KEY,
        process.env.GEMINI_MODEL || 'gemini-pro'
      );
      if (memCfg) (p as any).setUnimatrixMemoryConfig?.(memCfg);
      providers.push(p);
    }

    // Groq
    if (process.env.GROQ_API_KEY) {
      const p = new GroqProvider(
        process.env.GROQ_API_KEY,
        process.env.GROQ_MODEL || 'mixtral-8x7b-32768'
      );
      if (memCfg) (p as any).setUnimatrixMemoryConfig?.(memCfg);
      providers.push(p);
    }

    // Ollama (always available, local)
    const p = new OllamaProvider(
      process.env.OLLAMA_MODEL || 'mistral',
      process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'
    );
    if (memCfg) (p as any).setUnimatrixMemoryConfig?.(memCfg);
    providers.push(p);

    for (const [name, compat] of Object.entries(OPENAI_COMPAT_PROVIDERS)) {
      if (!compat.envKey) continue;
      const apiKey = process.env[compat.envKey];
      if (!apiKey) continue;
      const provider = new OpenAICompatProvider(
        name,
        compat.baseURL,
        apiKey,
        compat.models,
        process.env[`${name.toUpperCase()}_MODEL`] || compat.models[0]
      );
      if (memCfg) (provider as any).setUnimatrixMemoryConfig?.(memCfg);
      providers.push(provider);
    }

    return providers;
  }
}
