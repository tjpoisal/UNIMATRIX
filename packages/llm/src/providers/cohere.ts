/**
 * Cohere Provider
 *
 * Cohere uses its own SDK (not OpenAI-compat) with a different request shape.
 * Supports: Command R+, Command R, Command Light.
 *
 * Also covers: IBM watsonx (uses Cohere models via watsonx.ai API — extend baseURL).
 */

import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

const COHERE_PRICING: Record<string, { input: number; output: number; context: number }> = {
  'command-r-plus':       { input: 0.003,  output: 0.015, context: 128000 },
  'command-r-plus-08-2024': { input: 0.0025, output: 0.010, context: 128000 },
  'command-r':            { input: 0.00015, output: 0.00060, context: 128000 },
  'command-r-08-2024':    { input: 0.0001375, output: 0.00055, context: 128000 },
  'command-light':        { input: 0.00015, output: 0.00060, context: 4096 },
};

export class CohereProvider extends BaseLLMProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(
    apiKey: string,
    model: string = 'command-r-plus',
    /** Override for watsonx or self-hosted Cohere */
    baseURL: string = 'https://api.cohere.com/v2',
  ) {
    const pricing = COHERE_PRICING[model] ?? COHERE_PRICING['command-r-plus'];
    super('Cohere', model, pricing.input, pricing.output, pricing.context, true);
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  /** Convert Unimatrix messages to Cohere chat history format */
  private formatMessages(messages: Message[]) {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    // Cohere v2 uses the same shape as OpenAI for /chat
    return {
      preamble: systemMessages.map((m) => m.content).join('\n') || undefined,
      messages: chatMessages.map((m) => ({
        role: m.role === 'assistant' ? 'chatbot' : 'user',
        message: m.content,
      })),
    };
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const start = Date.now();
    const { preamble, messages: chatMessages } = this.formatMessages(messages);

    const res = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-Name': 'unimatrix',
      },
      body: JSON.stringify({
        model: this.model,
        messages: chatMessages,
        preamble,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[Cohere] ${res.status}: ${err}`);
    }

    const data = await res.json();
    const latency = Date.now() - start;
    const content = data.message?.content?.[0]?.text ?? data.text ?? '';
    const usage = {
      input:  data.usage?.billed_units?.input_tokens  ?? data.meta?.billed_units?.input_tokens  ?? 0,
      output: data.usage?.billed_units?.output_tokens ?? data.meta?.billed_units?.output_tokens ?? 0,
    };

    const result: CompletionResult = {
      content,
      tokensUsed: usage.input + usage.output,
      latencyMs: latency,
      cost: this.calculateCost(usage.input, usage.output),
      model: this.model,
      provider: 'cohere',
    };

    await this.maybeAutoLog(messages, result);
    return result;
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions,
  ): AsyncIterableIterator<string> {
    const { preamble, messages: chatMessages } = this.formatMessages(messages);

    const res = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-Name': 'unimatrix',
      },
      body: JSON.stringify({
        model: this.model,
        messages: chatMessages,
        preamble,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) throw new Error(`[Cohere stream] ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.type === 'content-delta') {
            const delta = event.delta?.message?.content?.text;
            if (delta) yield delta;
          }
        } catch { /* skip malformed chunks */ }
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.complete([{ role: 'user', content: 'ping' }], { maxTokens: 5 });
      return true;
    } catch {
      return false;
    }
  }
}
