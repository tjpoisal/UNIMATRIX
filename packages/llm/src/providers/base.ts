import {
  ILLMProvider,
  Message,
  CompletionOptions,
  CompletionResult,
  ModelInfo,
} from '@unimatrix/types';

/**
 * Abstract base class for LLM providers
 * All provider implementations extend this class
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  protected costPer1kInputTokens: number;
  protected costPer1kOutputTokens: number;
  protected contextWindow: number;
  protected supportsStreaming: boolean;

  constructor(
    readonly name: string,
    readonly model: string,
    costInput: number,
    costOutput: number,
    contextWindow: number,
    supportsStreaming: boolean = true
  ) {
    this.costPer1kInputTokens = costInput;
    this.costPer1kOutputTokens = costOutput;
    this.contextWindow = contextWindow;
    this.supportsStreaming = supportsStreaming;
  }

  abstract complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult>;

  abstract stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncIterableIterator<string>;

  abstract healthCheck(): Promise<boolean>;

  getModelInfo(): ModelInfo {
    return {
      name: this.model,
      provider: this.name,
      costPer1kInputTokens: this.costPer1kInputTokens,
      costPer1kOutputTokens: this.costPer1kOutputTokens,
      contextWindow: this.contextWindow,
      supportsStreaming: this.supportsStreaming,
    };
  }

  /**
   * Calculate cost for a completion
   */
  protected calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.costPer1kInputTokens;
    const outputCost = (outputTokens / 1000) * this.costPer1kOutputTokens;
    return inputCost + outputCost;
  }

  /**
   * Parse usage from API response
   * Subclasses should override if needed
   */
  protected parseUsage(response: any): { input: number; output: number } {
    // Default implementation - override in subclasses
    return { input: 0, output: 0 };
  }

  // Optional: Unimatrix memory config for auto-logging interactions per LLM source
  protected unimatrixMemoryConfig?: import('../memory.js').UnimatrixMemoryConfig;

  /**
   * Enable automatic memory logging for this provider.
   * When set, every complete() will auto-store the interaction into the
   * per-LLM history location (e.g. "Claude History") under the user's "LLM Histories" palace.
   * This is wired up automatically by the installer/onboarding when you connect providers.
   */
  setUnimatrixMemoryConfig(config: import('../memory.js').UnimatrixMemoryConfig | undefined) {
    this.unimatrixMemoryConfig = config;
  }

  protected async maybeAutoLog(messages: Message[], result: CompletionResult) {
    if (this.unimatrixMemoryConfig) {
      try {
        const { autoLogInteraction } = await import('../memory.js');
        // Fire-and-forget to not block the LLM response
        autoLogInteraction(this.name.toLowerCase(), messages, result, this.unimatrixMemoryConfig).catch(() => {});
      } catch (e) {
        // non-fatal
        console.warn('[Unimatrix] Auto memory log failed for', this.name, e);
      }
    }
  }
}
