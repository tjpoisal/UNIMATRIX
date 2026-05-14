import { ILLMProvider } from '@unimatrix/types';
import { ClaudeProvider } from './providers/claude.js';
import { OpenAIProvider } from './providers/openai.js';
import { GeminiProvider } from './providers/gemini.js';
import { GroqProvider } from './providers/groq.js';
import { OllamaProvider } from './providers/ollama.js';

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
    }
  ): ILLMProvider {
    switch (providerName.toLowerCase()) {
      case 'claude':
      case 'anthropic':
        return new ClaudeProvider(
          config.apiKey || process.env.ANTHROPIC_API_KEY || '',
          config.model || 'claude-3-opus-20240229'
        );

      case 'openai':
      case 'gpt':
        return new OpenAIProvider(
          config.apiKey || process.env.OPENAI_API_KEY || '',
          config.model || 'gpt-4-turbo-preview'
        );

      case 'gemini':
      case 'google':
        return new GeminiProvider(
          config.apiKey || process.env.GOOGLE_API_KEY || '',
          config.model || 'gemini-pro'
        );

      case 'groq':
        return new GroqProvider(
          config.apiKey || process.env.GROQ_API_KEY || '',
          config.model || 'mixtral-8x7b-32768'
        );

      case 'ollama':
        return new OllamaProvider(
          config.model || 'mistral',
          config.endpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'
        );

      default:
        throw new Error(`Unknown LLM provider: ${providerName}`);
    }
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
   */
  static createDefaultProviders(): ILLMProvider[] {
    const providers: ILLMProvider[] = [];

    // Claude
    if (process.env.ANTHROPIC_API_KEY) {
      providers.push(
        new ClaudeProvider(
          process.env.ANTHROPIC_API_KEY,
          process.env.CLAUDE_MODEL || 'claude-3-opus-20240229'
        )
      );
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      providers.push(
        new OpenAIProvider(
          process.env.OPENAI_API_KEY,
          process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
        )
      );
    }

    // Gemini
    if (process.env.GOOGLE_API_KEY) {
      providers.push(
        new GeminiProvider(
          process.env.GOOGLE_API_KEY,
          process.env.GEMINI_MODEL || 'gemini-pro'
        )
      );
    }

    // Groq
    if (process.env.GROQ_API_KEY) {
      providers.push(
        new GroqProvider(
          process.env.GROQ_API_KEY,
          process.env.GROQ_MODEL || 'mixtral-8x7b-32768'
        )
      );
    }

    // Ollama (always available, local)
    providers.push(
      new OllamaProvider(
        process.env.OLLAMA_MODEL || 'mistral',
        process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'
      )
    );

    return providers;
  }
}
