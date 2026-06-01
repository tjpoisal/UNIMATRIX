/**
 * Centralized LLM Pricing Table (per 1M tokens, in cents)
 * Update this file as pricing changes.
 */

export interface ModelPricing {
  prompt: number;      // cost per 1M prompt tokens in cents
  completion: number;  // cost per 1M completion tokens in cents
}

export const PRICING: Record<string, Record<string, ModelPricing>> = {
  openai: {
    'gpt-4o': { prompt: 250, completion: 1000 },
    'gpt-4o-mini': { prompt: 15, completion: 60 },
    'gpt-4-turbo': { prompt: 1000, completion: 3000 },
    'o1-preview': { prompt: 1500, completion: 6000 },
    'o1-mini': { prompt: 300, completion: 1200 },
  },
  anthropic: {
    'claude-3-5-sonnet': { prompt: 300, completion: 1500 },
    'claude-3-5-haiku': { prompt: 80, completion: 400 },
    'claude-3-opus': { prompt: 1500, completion: 7500 },
  },
  groq: {
    'llama-3.1-70b': { prompt: 59, completion: 79 },
    'llama-3.1-8b': { prompt: 5, completion: 8 },
    'mixtral-8x7b': { prompt: 24, completion: 24 },
  },
  google: {
    'gemini-1.5-pro': { prompt: 350, completion: 1050 },
    'gemini-1.5-flash': { prompt: 7, completion: 30 },
  },
};

/**
 * Calculate cost in cents given provider, model, and token counts.
 */
export function calculateCostInCents(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const providerPricing = PRICING[provider.toLowerCase()];
  if (!providerPricing) return 0;

  const modelPricing = providerPricing[model] || providerPricing[Object.keys(providerPricing)[0]];
  if (!modelPricing) return 0;

  const promptCost = (promptTokens / 1_000_000) * modelPricing.prompt;
  const completionCost = (completionTokens / 1_000_000) * modelPricing.completion;

  return Math.ceil(promptCost + completionCost);
}
