/**
 * @unimatrix/llm
 * Multi-LLM provider integration with intelligent routing
 */

// Re-export types
export * from '@unimatrix/types';

// Providers
export * from './providers/index.js';

// Registry
export { LLMProviderRegistry } from './registry.js';

// Factory
export { LLMProviderFactory } from './factory.js';

// Routing
export { IntelligentLLMRouter, LLMLoadBalancer } from './routing.js';

// Configuration
export { initializeLLMSystem, initializeLLMSystemFromConfig, parseEnvConfig, getProviderStats, resetProviderStats } from './config.js';
export type { LLMConfig } from './config.js';

// Automatic memory logging (auto-stores and organizes interactions by LLM source)
export * from './memory.js';
export type { UnimatrixMemoryConfig } from './memory.js';

/**
 * Quick setup: Create all providers and return registry + router
 * @deprecated Use initializeLLMSystem() instead
 */
export function setupUnimatrixLLM() {
  const registry = new (require('./registry.js').LLMProviderRegistry)();
  const providers = (require('./factory.js').LLMProviderFactory).createDefaultProviders();

  for (const provider of providers) {
    registry.register(provider);
  }

  const router = new (require('./routing.js').IntelligentLLMRouter)(registry);
  const loadBalancer = new (require('./routing.js').LLMLoadBalancer)(registry);

  return {
    registry,
    router,
    loadBalancer,
    providers,
  };
}
