import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';
import { BaseLLMProvider } from './base';

export class GeminiProvider extends BaseLLMProvider {
  private genAI: GoogleGenerativeAI;
  private genModel: any;

  constructor(apiKey: string, model: string = 'gemini-pro') {
    super('gemini', model, 0.00015, 0.0006, apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.genModel = this.genAI.getGenerativeModel({ model });
  }

  async complete(messages: Message[], options?: CompletionOptions): Promise<CompletionResult> {
    const response = await this.genModel.generateContent({
      contents: messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    });

    return {
      content: response.response.text(),
      model: this.model,
      tokensUsed: 0,
      latencyMs: 0,
      cost: 0,
      provider: 'gemini'
    };
  }

  async *stream(messages: Message[], options?: CompletionOptions): AsyncIterableIterator<string> {
    const result = await this.genModel.generateContentStream({
      contents: messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    });

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.genModel.generateContent('ping');
      return true;
    } catch {
      return false;
    }
  }
}
