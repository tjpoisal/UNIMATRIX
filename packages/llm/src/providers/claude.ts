import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

/**
 * Claude provider using Anthropic SDK
 * Supports: claude-3-opus, claude-3-sonnet, claude-3-haiku
 */
export class ClaudeProvider extends BaseLLMProvider {
  private client: Anthropic;

  constructor(
    apiKey: string,
    model: string = 'claude-3-opus-20240229'
  ) {
    // Pricing per 1k tokens
    const pricing = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    };

    const modelPricing = pricing[model as keyof typeof pricing] || pricing['claude-3-opus-20240229'];

    super(
      'Claude',
      model,
      modelPricing.input,
      modelPricing.output,
      200000, // Context window
      true // Supports streaming
    );

    this.client = new Anthropic({ apiKey });
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const start = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature,
      top_p: options?.topP,
      messages: messages.map((msg) => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        content: msg.content,
      })),
    });

    const latency = Date.now() - start;

    const usage = {
      input: response.usage?.input_tokens || 0,
      output: response.usage?.output_tokens || 0,
    };

    const content =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

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
    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature,
      top_p: options?.topP,
      messages: messages.map((msg) => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        content: msg.content,
      })),
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
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
