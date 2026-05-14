import OpenAI from 'openai';
import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

/**
 * OpenAI provider using OpenAI SDK
 * Supports: gpt-4, gpt-4-turbo, gpt-3.5-turbo
 */
export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;

  constructor(
    apiKey: string,
    model: string = 'gpt-4-turbo-preview'
  ) {
    // Pricing per 1k tokens
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];

    super(
      'OpenAI',
      model,
      modelPricing.input,
      modelPricing.output,
      128000, // Context window
      true // Supports streaming
    );

    this.client = new OpenAI({ apiKey });
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature,
      top_p: options?.topP,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const latency = Date.now() - start;

    const usage = {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    };

    const content = response.choices[0]?.message?.content || '';
    const cost = this.calculateCost(usage.input, usage.output);

    return {
      content,
      tokensUsed: usage.input + usage.output,
      latencyMs: latency,
      cost,
      model: this.model,
      provider: this.name,
    };
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncIterableIterator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature,
      top_p: options?.topP,
      stream: true,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'ping',
          },
        ],
      });

      return response.id !== undefined;
    } catch {
      return false;
    }
  }
}
