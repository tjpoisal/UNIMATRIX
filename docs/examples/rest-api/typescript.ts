/**
 * Simple Unimatrix REST API Client (TypeScript)
 * 
 * Use this when your LLM or agent doesn't support MCP.
 */

export class UnimatrixClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl = 'https://deployunimatrix.com/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Palaces
  async listPalaces() {
    return this.request<any[]>('/palaces');
  }

  async createPalace(name: string, description?: string) {
    return this.request('/palaces', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getPalace(id: string) {
    return this.request(`/palaces/${id}`);
  }

  // Memories
  async storeMemory(locationId: string, content: string, tags: string[] = []) {
    return this.request('/memories', {
      method: 'POST',
      body: JSON.stringify({ locationId, content, tags }),
    });
  }

  async searchMemories(query: string, options: { palaceId?: string; limit?: number } = {}) {
    const params = new URLSearchParams({ q: query });
    if (options.palaceId) params.set('palaceId', options.palaceId);
    if (options.limit) params.set('limit', String(options.limit));
    
    return this.request(`/search?${params.toString()}`);
  }

  async listMemories(locationId: string) {
    return this.request(`/memories?locationId=${locationId}`);
  }

  // Convenience: Get recent context from a palace
  async getRecentContext(palaceId: string, limit = 10) {
    const palace = await this.getPalace(palaceId);
    const allMemories: any[] = [];
    
    function collectMemories(locations: any[]) {
      for (const loc of locations) {
        if (loc.memories) allMemories.push(...loc.memories);
        if (loc.children) collectMemories(loc.children);
      }
    }
    
    if (palace.locations) collectMemories(palace.locations);
    
    return allMemories
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Delete a memory
  async deleteMemory(memoryId: string) {
    return this.request(`/memories/${memoryId}`, { method: 'DELETE' });
  }

  // List locations in a palace
  async listLocations(palaceId: string) {
    const palace = await this.getPalace(palaceId);
    return palace.locations || [];
  }

  // Create a location inside a palace
  async createLocation(palaceId: string, name: string, description?: string, parentId?: string) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify({
        palaceId,
        name,
        description,
        parentId,
      }),
    });
  }

  // Export all data for the user
  async exportAll() {
    return this.request('/export');
  }
}

// Example usage with an LLM
// const client = new UnimatrixClient(process.env.UNIMATRIX_API_KEY!);
// const results = await client.searchMemories("authentication decisions");
