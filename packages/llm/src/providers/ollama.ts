import { BaseLLMProvider } from './base.js';
import { Message, CompletionOptions, CompletionResult } from '@unimatrix/types';

interface OllamaResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  response?: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Ollama provider - local LLM models
 * Supports: mistral, llama2, neural-chat, etc.
 * Runs on http://localhost:11434
 */
export class OllamaProvider extends BaseLLMProvider {
  private endpoint: string;

  constructor(
    model: string = 'mistral',
    endpoint: string = 'http://localhost:11434'
  ) {
    super(
      'Ollama',
      model,
      0, // Free (local)
      0, // Free (local)
      4096, // Varies by model
      true // Supports streaming
    );

    this.endpoint = endpoint;
  }

  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    const start = Date.now();

    // Convert messages to Ollama format
    const prompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');

    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          num_predict: options?.maxTokens || 2048,
          temperature: options?.temperature ?? 0.7,
          top_p: options?.topP,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaResponse;
    const latency = Date.now() - start;

    const content = data.response || '';

    // Estimate tokens
    const inputTokens = prompt.length / 4;
    const outputTokens = content.length / 4;

    const result = {
      content,
      tokensUsed: Math.ceil(inputTokens + outputTokens),
      latencyMs: latency,
      cost: 0, // Free (local)
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
    const prompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');

    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
        options: {
          num_predict: options?.maxTokens || 2048,
          temperature: options?.temperature ?? 0.7,
          top_p: options?.topP,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      for (let i = 0; i < lines.length - 1; i++) {
        try {
          const parsed = JSON.parse(lines[i]) as OllamaResponse;
          if (parsed.response) {
            yield parsed.response;
          }
        } catch {
          // Skip invalid JSON
        }
      }

      buffer = lines[lines.length - 1];
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer) as OllamaResponse;
        if (parsed.response) {
          yield parsed.response;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
