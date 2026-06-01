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

// ─────────────────────────────────────────────────────────────────────────────
// Universal Tools Client (for LLMs with OpenAI-style function calling)
// Use this when your model supports function calling but not MCP.
// It dynamically discovers tools via GET /api/tools and executes via POST /api/tools/call.
// ─────────────────────────────────────────────────────────────────────────────

export interface OpenAIFunctionTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface ToolCallResult {
  status: "success" | "error";
  result?: string | Record<string, unknown>;
  error?: string;
  toolName?: string;
}

export class UnimatrixToolsClient {
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

  /**
   * Discover available tools in OpenAI function-calling format.
   * Call this once at the start of an agent session.
   * Pass the returned array directly to your LLM as the `tools` parameter.
   */
  async listTools(format: 'openai' | 'mcp' = 'openai'): Promise<OpenAIFunctionTool[] | any[]> {
    const query = format === 'mcp' ? '?format=mcp' : '';
    return this.request(`/tools${query}`);
  }

  /**
   * Execute a tool by name (the universal REST fallback to MCP).
   * This is what your agent framework calls when the LLM decides to use a tool.
   */
  async callTool(toolName: string, args: Record<string, unknown> = {}): Promise<ToolCallResult> {
    return this.request('/tools/call', {
      method: 'POST',
      body: JSON.stringify({ toolName, args }),
    });
  }

  // Convenience helpers for the most common memory tools

  async searchMemories(query: string, options: { palaceId?: string; limit?: number } = {}) {
    return this.callTool('unimatrix_search_memories', {
      query,
      ...options,
    });
  }

  async storeMemory(content: string, tags: string[] = [], locationId?: string) {
    // Note: For full power use callTool directly with a real location_id.
    // This helper is mostly for quick "remember this" flows.
    return this.callTool('unimatrix_store_memory', { content, tags, ...(locationId ? { location_id: locationId } : {}) });
  }

  async getRecent(limit = 10) {
    return this.callTool('unimatrix_get_recent', { limit });
  }
}

// Example usage with an LLM that supports function calling
//
// const toolsClient = new UnimatrixToolsClient(process.env.UNIMATRIX_API_KEY!);
//
// // 1. At the beginning of a conversation, fetch tools
// const tools = await toolsClient.listTools();           // OpenAI format
// // const tools = await toolsClient.listTools('mcp');   // Raw MCP shape
//
// // 2. Give `tools` to your model (OpenAI, Groq, Anthropic with tool use, etc.)
//
// // 3. When the model returns a tool call:
// // const result = await toolsClient.callTool("unimatrix_search_memories", { query: "Q3 planning" });
// // const result = await toolsClient.searchMemories("architecture decisions");
