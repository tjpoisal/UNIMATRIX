/**
 * Configuration utilities for Unimatrix LLM system
 * Handles environment variable parsing and provider configuration
 */

import { ILLMProvider } from '@unimatrix/types';
import { LLMProviderFactory } from './factory.js';
import { LLMProviderRegistry } from './registry.js';
import { IntelligentLLMRouter, LLMLoadBalancer } from './routing.js';

/**
 * LLM Provider configuration from environment
 */
export interface LLMConfig {
  anthropic?: {
    apiKey: string;
    model?: string;
    enabled?: boolean;
  };
  openai?: {
    apiKey: string;
    model?: string;
    enabled?: boolean;
  };
  gemini?: {
    apiKey: string;
    model?: string;
    enabled?: boolean;
  };
  groq?: {
    apiKey: string;
    model?: string;
    enabled?: boolean;
  };
  ollama?: {
    endpoint?: string;
    model?: string;
    enabled?: boolean;
  };
}

/**
 * Initialize LLM system from environment variables
 * Creates providers, registry, router, and load balancer
 */
export function initializeLLMSystem(): {
  registry: LLMProviderRegistry;
  router: IntelligentLLMRouter;
  loadBalancer: LLMLoadBalancer;
  providers: ILLMProvider[];
} {
  const registry = new LLMProviderRegistry();
  const providers: ILLMProvider[] = [];

  // Initialize Claude provider
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claude = LLMProviderFactory.createProvider('claude', {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.CLAUDE_MODEL,
      });
      registry.register(claude);
      providers.push(claude);
      console.log('[LLM Config] Claude provider registered');
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Claude:', error);
    }
  }

  // Initialize OpenAI provider
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = LLMProviderFactory.createProvider('openai', {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
      });
      registry.register(openai);
      providers.push(openai);
      console.log('[LLM Config] OpenAI provider registered');
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize OpenAI:', error);
    }
  }

  // Initialize Gemini provider
  if (process.env.GOOGLE_API_KEY) {
    try {
      const gemini = LLMProviderFactory.createProvider('gemini', {
        apiKey: process.env.GOOGLE_API_KEY,
        model: process.env.GEMINI_MODEL,
      });
      registry.register(gemini);
      providers.push(gemini);
      console.log('[LLM Config] Gemini provider registered');
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Gemini:', error);
    }
  }

  // Initialize Groq provider
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = LLMProviderFactory.createProvider('groq', {
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL,
      });
      registry.register(groq);
      providers.push(groq);
      console.log('[LLM Config] Groq provider registered');
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Groq:', error);
    }
  }

  // Initialize Ollama provider (always available, local)
  try {
    const ollama = LLMProviderFactory.createProvider('ollama', {
      model: process.env.OLLAMA_MODEL,
      endpoint: process.env.OLLAMA_ENDPOINT,
    });
    registry.register(ollama);
    providers.push(ollama);
    console.log('[LLM Config] Ollama provider registered');
  } catch (error) {
    console.warn('[LLM Config] Failed to initialize Ollama:', error);
  }

  // Create router and load balancer
  const router = new IntelligentLLMRouter(registry);
  const loadBalancer = new LLMLoadBalancer(registry);

  console.log(
    `[LLM Config] Initialized ${providers.length} LLM providers`
  );

  return {
    registry,
    router,
    loadBalancer,
    providers,
  };
}

/**
 * Initialize LLM system from configuration object
 */
export function initializeLLMSystemFromConfig(config: LLMConfig): {
  registry: LLMProviderRegistry;
  router: IntelligentLLMRouter;
  loadBalancer: LLMLoadBalancer;
  providers: ILLMProvider[];
} {
  const registry = new LLMProviderRegistry();
  const providers: ILLMProvider[] = [];

  if (config.anthropic?.enabled !== false && config.anthropic?.apiKey) {
    try {
      const claude = LLMProviderFactory.createProvider('claude', {
        apiKey: config.anthropic.apiKey,
        model: config.anthropic.model,
      });
      registry.register(claude);
      providers.push(claude);
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Claude:', error);
    }
  }

  if (config.openai?.enabled !== false && config.openai?.apiKey) {
    try {
      const openai = LLMProviderFactory.createProvider('openai', {
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      });
      registry.register(openai);
      providers.push(openai);
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize OpenAI:', error);
    }
  }

  if (config.gemini?.enabled !== false && config.gemini?.apiKey) {
    try {
      const gemini = LLMProviderFactory.createProvider('gemini', {
        apiKey: config.gemini.apiKey,
        model: config.gemini.model,
      });
      registry.register(gemini);
      providers.push(gemini);
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Gemini:', error);
    }
  }

  if (config.groq?.enabled !== false && config.groq?.apiKey) {
    try {
      const groq = LLMProviderFactory.createProvider('groq', {
        apiKey: config.groq.apiKey,
        model: config.groq.model,
      });
      registry.register(groq);
      providers.push(groq);
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Groq:', error);
    }
  }

  if (config.ollama?.enabled !== false) {
    try {
      const ollama = LLMProviderFactory.createProvider('ollama', {
        model: config.ollama?.model,
        endpoint: config.ollama?.endpoint,
      });
      registry.register(ollama);
      providers.push(ollama);
    } catch (error) {
      console.warn('[LLM Config] Failed to initialize Ollama:', error);
    }
  }

  const router = new IntelligentLLMRouter(registry);
  const loadBalancer = new LLMLoadBalancer(registry);

  return {
    registry,
    router,
    loadBalancer,
    providers,
  };
}

/**
 * Parse provider configuration from environment
 */
export function parseEnvConfig(): LLMConfig {
  return {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.CLAUDE_MODEL,
      enabled: !!process.env.ANTHROPIC_API_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL,
      enabled: !!process.env.OPENAI_API_KEY,
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY || '',
      model: process.env.GEMINI_MODEL,
      enabled: !!process.env.GOOGLE_API_KEY,
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      model: process.env.GROQ_MODEL,
      enabled: !!process.env.GROQ_API_KEY,
    },
    ollama: {
      endpoint: process.env.OLLAMA_ENDPOINT,
      model: process.env.OLLAMA_MODEL,
      enabled: true, // Ollama always available (local)
    },
  };
}

/**
 * Get provider usage statistics
 */
export function getProviderStats(
  loadBalancer: LLMLoadBalancer
): Record<
  string,
  {
    requests: number;
    totalCost: number;
    avgCost: number;
  }
> {
  return loadBalancer.getStats();
}

/**
 * Reset provider statistics
 */
export function resetProviderStats(loadBalancer: LLMLoadBalancer): void {
  loadBalancer.reset();
}
