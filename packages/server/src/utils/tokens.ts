/**
 * src/utils/tokens.ts
 *
 * Lightweight token estimation for context budget enforcement.
 *
 * Why not use tiktoken or a real tokenizer?
 *   - Adds a native binary dependency that complicates deployment.
 *   - The 4 chars/token rule-of-thumb is accurate to ±15% for English prose,
 *     which is good enough for budget gating (we're not billing on it).
 *   - Summaries are short; the error margin has negligible UX impact.
 *
 * If you switch to a model with a very different tokenizer (e.g. a CJK-heavy
 * corpus), swap this out for a real tokenizer at that point.
 */

/**
 * Estimates the number of tokens in a string.
 *
 * Rule: 1 token ≈ 4 characters for English prose (GPT-4 / Claude).
 * For structured data or code the ratio is closer to 1:3, so we use 3.5
 * as a conservative estimate that errs toward fewer tokens in budget.
 *
 * @param text - The string to estimate.
 * @returns Estimated token count, always at least 1 for non-empty strings.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 3.5));
}

/**
 * Estimates the total tokens across a list of summaries, adding a small
 * fixed overhead per memory for JSON framing (id, tags, metadata fields).
 *
 * Used by recall_context to know when to stop adding memories to the payload.
 */
export function estimateBatchTokenCount(
  summaries: string[],
  perMemoryOverhead = 40,
): number {
  return summaries.reduce(
    (total, s) => total + estimateTokenCount(s) + perMemoryOverhead,
    0,
  );
}
