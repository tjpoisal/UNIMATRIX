export interface Memory {
  id: string;
  content: string;
  storageTier?: string;
}

export class Unimatrix {
  constructor(private config: { apiKey: string; baseUrl?: string }) {}

  async wrap<T extends { choices: Array<{ message: { content: string } }> }>(
    promise: Promise<T>,
    opts?: { context?: string; tags?: string[] }
  ): Promise<T> {
    const result = await promise;
    const content = result.choices[0]?.message?.content;
    if (content) await this.remember(content, opts);
    return result;
  }

  async remember(content: string, opts?: { context?: string; tags?: string[] }) {
    await fetch(`${this.config.baseUrl ?? 'https://unimatrix-web.fly.dev'}/api/memories`, {
      method: 'POST',
      headers: { Authorization: `****** 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, context: opts?.context, tags: opts?.tags }),
    });
  }

  async recall(query: string, limit = 5): Promise<Memory[]> {
    const res = await fetch(
      `${this.config.baseUrl ?? 'https://unimatrix-web.fly.dev'}/api/memories/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: { Authorization: `****** } }
    );
    return res.json() as Promise<Memory[]>;
  }

  async buildContext(query: string, maxTokens = 800): Promise<string> {
    const memories = await this.recall(query, 10);
    return memories
      .slice(0, Math.max(1, Math.floor(maxTokens / 160)))
      .map((m) => `[${m.storageTier ?? 'WARM'}] ${m.content}`)
      .join('\n');
  }
}

export * from './providers/openai.js';
