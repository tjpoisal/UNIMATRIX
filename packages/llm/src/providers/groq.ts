import Groq from 'groq-sdk';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';
import { BaseLLMProvider } from './base';

/**
 * Groq provider - ultra-fast inference
 * Supports: mixtral-8x7b-32768, llama2-70b-4096
 */
export class GroqProvider extends BaseLLMProvider {
  private groq: Groq;
  private apiKey: string;

  constructor(
    apiKey: string,
    model: string = 'mixtral-8x7b-32768'
  ) {
    // Groq costs are lower than other providers
    super('groq', model, 0.00009, 0.00024, 32768, true);
    this.apiKey = apiKey;
    this.groq = new Groq({ apiKey });
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const response = await this.groq.chat.completions.create({
      model: this.model,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options?.maxTokens || 1024,
    });

    return {
      content: response.choices[0].message.content || '',
      model: this.model,
      tokensUsed: response.usage?.total_tokens || 0,
      latencyMs: 0,
      cost: 0,
      provider: 'groq',
    };
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncIterableIterator<string> {
    const stream = await this.groq.chat.completions.create({
      model: this.model,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options?.maxTokens || 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.groq.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }
}
