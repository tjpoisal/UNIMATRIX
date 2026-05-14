import { ILLMProvider, RoutingContext, RoutingStrategy, Message } from '@unimatrix/types';
import { LLMProviderRegistry } from './registry.js';

/**
 * Intelligent LLM routing engine
 * Analyzes request context and selects optimal provider
 */
export class IntelligentLLMRouter {
  constructor(private registry: LLMProviderRegistry) {}

  /**
   * Route a request to the optimal LLM provider
   * Analyzes message complexity and urgency to select provider
   */
  async route(
    messages: Message[],
    preferredStrategy?: RoutingStrategy,
    preferredProviders?: string[]
  ): Promise<ILLMProvider | null> {
    // Combine all messages for complexity analysis
    const messageText = messages.map((m) => m.content).join('\n');

    // Analyze context
    const context: RoutingContext = {
      messageLength: messageText.length,
      taskComplexity: this.categorizeComplexity(
        LLMProviderRegistry.analyzeComplexity(messageText)
      ),
      urgency: 'normal', // Could be determined from metadata
      preferredProviders,
    };

    // Determine strategy
    const strategy =
      preferredStrategy || LLMProviderRegistry.suggestStrategy(context);

    console.log(
      `[Router] Complexity: ${context.taskComplexity}, Strategy: ${strategy}`
    );

    return this.registry.selectProvider(context, strategy);
  }

  /**
   * Route to the cheapest provider (for simple, non-urgent requests)
   */
  routeToCheapest(): ILLMProvider | null {
    return this.registry.selectProvider(
      {
        messageLength: 0,
        taskComplexity: 'simple',
        urgency: 'low',
      },
      'cheapest'
    );
  }

  /**
   * Route to the fastest provider (for urgent requests)
   */
  routeToFastest(): ILLMProvider | null {
    return this.registry.selectProvider(
      {
        messageLength: 0,
        taskComplexity: 'moderate',
        urgency: 'high',
      },
      'fastest'
    );
  }

  /**
   * Route to the best provider (for complex reasoning)
   */
  routeToBest(): ILLMProvider | null {
    return this.registry.selectProvider(
      {
        messageLength: 0,
        taskComplexity: 'complex',
        urgency: 'normal',
      },
      'best'
    );
  }

  /**
   * Route with round-robin (load balancing)
   */
  routeRoundRobin(): ILLMProvider | null {
    return this.registry.selectProvider(
      {
        messageLength: 0,
        taskComplexity: 'moderate',
        urgency: 'normal',
      },
      'roundrobin'
    );
  }

  /**
   * Categorize complexity score into human-readable level
   */
  private categorizeComplexity(score: number): 'simple' | 'moderate' | 'complex' {
    if (score < 0.33) return 'simple';
    if (score < 0.66) return 'moderate';
    return 'complex';
  }
}

/**
 * Load balancer for distributing requests across providers
 */
export class LLMLoadBalancer {
  private requestCounts: Map<string, number> = new Map();
  private costTracking: Map<string, number> = new Map();

  constructor(private registry: LLMProviderRegistry) {}

  /**
   * Get the provider with the least requests (load balancing)
   */
  getLeastLoadedProvider(): ILLMProvider | null {
    const providers = this.registry.listProviders();
    if (providers.length === 0) return null;

    let minProvider = providers[0];
    let minCount = this.requestCounts.get(minProvider.name) || 0;

    for (const provider of providers) {
      const count = this.requestCounts.get(provider.name) || 0;
      if (count < minCount) {
        minProvider = provider;
        minCount = count;
      }
    }

    return minProvider;
  }

  /**
   * Get the provider with lowest cumulative cost
   */
  getCheapestProvider(): ILLMProvider | null {
    const providers = this.registry.listProviders();
    if (providers.length === 0) return null;

    let minProvider = providers[0];
    let minCost = this.costTracking.get(minProvider.name) || 0;

    for (const provider of providers) {
      const cost = this.costTracking.get(provider.name) || 0;
      if (cost < minCost) {
        minProvider = provider;
        minCost = cost;
      }
    }

    return minProvider;
  }

  /**
   * Track a request to a provider
   */
  trackRequest(providerName: string, cost: number): void {
    const current = this.requestCounts.get(providerName) || 0;
    this.requestCounts.set(providerName, current + 1);

    const currentCost = this.costTracking.get(providerName) || 0;
    this.costTracking.set(providerName, currentCost + cost);
  }

  /**
   * Get load balancing statistics
   */
  getStats(): Record<
    string,
    {
      requests: number;
      totalCost: number;
      avgCost: number;
    }
  > {
    const stats: Record<
      string,
      {
        requests: number;
        totalCost: number;
        avgCost: number;
      }
    > = {};

    for (const provider of this.registry.listProviders()) {
      const requests = this.requestCounts.get(provider.name) || 0;
      const cost = this.costTracking.get(provider.name) || 0;

      stats[provider.name] = {
        requests,
        totalCost: parseFloat(cost.toFixed(6)),
        avgCost: requests > 0 ? parseFloat((cost / requests).toFixed(6)) : 0,
      };
    }

    return stats;
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.requestCounts.clear();
    this.costTracking.clear();
  }
}
