import { default as Groq } from 'groq-sdk';
import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

/**
 * Groq provider - ultra-fast inference
 * Supports: mixtral-8x7b-32768, llama2-70b-4096
 */
export class GroqProvider extends BaseLLMProvider {
  private client: Groq;

  constructor(
    apiKey: string,
    model: string = 'mixtral-8x7b-32768'
  ) {
    // Groq is extremely affordable
    const pricing: Record<string, { input: number; output: number }> = {
      'mixtral-8x7b-32768': { input: 0.00027, output: 0.00027 },
      'llama2-70b-4096': { input: 0.0007, output: 0.0009 },
      'llama3-70b-8192': { input: 0.0007, output: 0.0009 },
      'llama3-8b-8192': { input: 0.00002, output: 0.00003 },
    };

    const modelPricing = pricing[model] || pricing['mixtral-8x7b-32768'];

    super(
      'Groq',
      model,
      modelPricing.input,
      modelPricing.output,
      32768, // Context window
      true // Supports streaming
    );

    this.client = new Groq({ apiKey });
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature ?? 0.7,
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

    const result = {
      content,
      tokensUsed: usage.input + usage.output,
      latencyMs: latency,
      cost,
      model: this.model,
      provider: this.name,
    };

    await this.maybeAutoLog(messages, result);
    return result;
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncIterableIterator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature ?? 0.7,
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
