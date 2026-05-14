import {
  ILLMProvider,
  ILLMProviderRegistry,
  ProviderHealth,
  RoutingStrategy,
  RoutingContext,
} from '@unimatrix/types';

/**
 * Registry for managing multiple LLM providers
 * Handles provider registration, health checks, and selection
 */
export class LLMProviderRegistry implements ILLMProviderRegistry {
  private providers: Map<string, ILLMProvider> = new Map();
  private healthCache: Map<string, ProviderHealth> = new Map();
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 5 * 60 * 1000; // 5 minutes

  register(provider: ILLMProvider): void {
    this.providers.set(provider.name, provider);
    console.log(`[Registry] Registered LLM provider: ${provider.name} (${provider.model})`);
  }

  getProvider(name: string): ILLMProvider | null {
    return this.providers.get(name) || null;
  }

  listProviders(): ILLMProvider[] {
    return Array.from(this.providers.values());
  }

  async healthCheckAll(): Promise<ProviderHealth[]> {
    const now = Date.now();
    const useCache = now - this.lastHealthCheck < this.healthCheckInterval;

    if (useCache && this.healthCache.size === this.providers.size) {
      return Array.from(this.healthCache.values());
    }

    const results: ProviderHealth[] = [];

    for (const [name, provider] of this.providers) {
      try {
        const healthy = await provider.healthCheck();
        const health: ProviderHealth = {
          provider: name,
          healthy,
          lastCheck: new Date(),
          error: healthy ? undefined : 'Health check failed',
        };

        this.healthCache.set(name, health);
        results.push(health);

        console.log(
          `[Registry] ${name} health: ${healthy ? '✓' : '✗'}`
        );
      } catch (error) {
        const health: ProviderHealth = {
          provider: name,
          healthy: false,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        this.healthCache.set(name, health);
        results.push(health);

        console.error(`[Registry] ${name} health check failed:`, error);
      }
    }

    this.lastHealthCheck = now;
    return results;
  }

  selectProvider(
    context: RoutingContext,
    strategy: RoutingStrategy
  ): ILLMProvider | null {
    const healthyProviders = Array.from(this.healthCache.values())
      .filter((h) => h.healthy)
      .map((h) => this.providers.get(h.provider))
      .filter((p) => p !== undefined && p !== null) as ILLMProvider[];

    if (healthyProviders.length === 0) {
      console.warn('[Registry] No healthy providers available');
      return null;
    }

    // Filter by preferred providers if specified
    let candidates = healthyProviders;
    if (context.preferredProviders && context.preferredProviders.length > 0) {
      candidates = healthyProviders.filter((p) =>
        context.preferredProviders!.includes(p.name)
      );

      if (candidates.length === 0) {
        candidates = healthyProviders;
      }
    }

    switch (strategy) {
      case 'cheapest':
        return this.selectCheapest(candidates);
      case 'fastest':
        return this.selectFastest(candidates);
      case 'best':
        return this.selectBest(candidates);
      case 'roundrobin':
        return this.selectRoundRobin(candidates);
      default:
        return candidates[0] || null;
    }
  }

  private selectCheapest(providers: ILLMProvider[]): ILLMProvider {
    return providers.reduce((min, p) => {
      const minInfo = min.getModelInfo();
      const pInfo = p.getModelInfo();

      const minCost = minInfo.costPer1kInputTokens + minInfo.costPer1kOutputTokens;
      const pCost = pInfo.costPer1kInputTokens + pInfo.costPer1kOutputTokens;

      return pCost < minCost ? p : min;
    });
  }

  private selectFastest(providers: ILLMProvider[]): ILLMProvider {
    // For now, prefer Groq (known to be fastest)
    const groq = providers.find((p) => p.name === 'Groq');
    if (groq) return groq;

    // Otherwise random selection
    return providers[Math.floor(Math.random() * providers.length)];
  }

  private selectBest(providers: ILLMProvider[]): ILLMProvider {
    // Prefer Claude (most capable)
    const claude = providers.find((p) => p.name === 'Claude');
    if (claude) return claude;

    // Fallback to GPT-4
    const gpt4 = providers.find((p) => p.name === 'OpenAI' && p.model.includes('gpt-4'));
    if (gpt4) return gpt4;

    return providers[0];
  }

  private selectRoundRobin(providers: ILLMProvider[]): ILLMProvider {
    // Simple round-robin: select based on current timestamp
    const index = Math.floor(Date.now() / 1000) % providers.length;
    return providers[index];
  }

  /**
   * Analyze message complexity (simple -> complex)
   * Returns a score from 0 (simple) to 1 (complex)
   */
  static analyzeComplexity(message: string): number {
    const length = message.length;
    const wordCount = message.split(/\s+/).length;
    const hasCode = /```|<code>|{|}|\[|\]/.test(message);
    const hasMultipleSentences = (message.match(/[.!?]/g) || []).length > 2;

    let complexity = 0;

    if (length < 100) complexity += 0.1;
    else if (length < 500) complexity += 0.3;
    else if (length < 2000) complexity += 0.6;
    else complexity += 0.9;

    if (wordCount > 50) complexity += 0.2;
    if (hasCode) complexity += 0.3;
    if (hasMultipleSentences) complexity += 0.2;

    return Math.min(1, complexity);
  }

  /**
   * Suggest a routing strategy based on context
   */
  static suggestStrategy(context: RoutingContext): RoutingStrategy {
    if (context.urgency === 'high') return 'fastest';
    if (context.taskComplexity === 'complex') return 'best';
    if (context.taskComplexity === 'simple') return 'cheapest';
    return 'roundrobin';
  }
}
