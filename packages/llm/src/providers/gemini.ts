import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

/**
 * Google Gemini provider
 * Supports: gemini-pro, gemini-pro-vision
 */
export class GeminiProvider extends BaseLLMProvider {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(
    apiKey: string,
    model: string = 'gemini-pro'
  ) {
    // Pricing per 1k tokens (Gemini is very affordable)
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-pro': { input: 0.00025, output: 0.0005 },
      'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
      'gemini-1.5-flash': { input: 0.075, output: 0.3 },
      'gemini-1.5-pro': { input: 1.5, output: 4.5 },
    };

    const modelPricing = pricing[model] || pricing['gemini-pro'];

    super(
      'Gemini',
      model,
      modelPricing.input,
      modelPricing.output,
      32000, // Context window (varies by model)
      true // Supports streaming
    );

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model });
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const start = Date.now();

    const response = await this.model.generateContent({
      contents: this.convertMessages(messages),
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 2048,
        temperature: options?.temperature,
        topP: options?.topP,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const latency = Date.now() - start;

    const text = response.response.text();

    // Estimate tokens (Gemini doesn't always provide token counts)
    const inputTokens = messages.reduce((acc, msg) => acc + msg.content.length / 4, 0);
    const outputTokens = text.length / 4;

    const cost = this.calculateCost(inputTokens, outputTokens);

    return {
      content: text,
      tokensUsed: Math.ceil(inputTokens + outputTokens),
      latencyMs: latency,
      cost,
      model: this.model.getModelName(),
      provider: this.name,
    };
  }

  async *stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncIterableIterator<string> {
    const result = await this.model.generateContentStream({
      contents: this.convertMessages(messages),
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 2048,
        temperature: options?.temperature,
        topP: options?.topP,
      },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.model.generateContent('ping');
      return response.response.text().length > 0;
    } catch {
      return false;
    }
  }

  private convertMessages(messages: Message[]) {
    return messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }
}
