/**
 * Unimatrix browser extension — API client
 * Sends captured conversations to POST /api/ingest/browser
 */

const DEFAULT_API_URL = 'https://deployunimatrix.com/api/ingest/browser';

export interface ExtensionSettings {
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
  enabledSites: Record<string, boolean>;
}

export async function getSettings(): Promise<ExtensionSettings | null> {
  try {
    const result = await chrome.storage.local.get(['unimatrix_settings']);
    return result.unimatrix_settings ?? null;
  } catch {
    return null;
  }
}

export interface IngestPayload {
  source: string;
  model: string;
  userMessage: string;
  assistantMessage: string;
  url: string;
  capturedAt: string;
  sessionId?: string;
}

export async function sendToUnimatrix(
  apiKey: string,
  payload: IngestPayload,
  apiUrl: string = DEFAULT_API_URL,
): Promise<void> {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Unimatrix extension] Ingest failed ${res.status}: ${text}`);
  }
}

/** Best-effort model name extraction from page title or DOM */
export function extractModelName(title: string): string | undefined {
  const knownModels = [
    'sonar', 'claude', 'gpt-4o', 'gemini', 'llama', 'mistral',
    'deepseek', 'qwen', 'grok', 'command',
  ];
  const lower = title.toLowerCase();
  return knownModels.find((m) => lower.includes(m));
}
