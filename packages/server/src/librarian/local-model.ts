/**
 * src/librarian/local-model.ts
 *
 * Phase 1D/E — Local Librarian model (Ollama / Mistral 7B LoRA)
 *
 * Replaces Claude Haiku API calls for memory classification.
 * Falls back gracefully to rule-based classification if Ollama is unavailable
 * (zero-cost, zero-dependency mode for bootstrapped deployments).
 *
 * Environment variables:
 *   OLLAMA_URL         — Ollama base URL (default: http://localhost:11434)
 *   LIBRARIAN_MODEL    — Model tag to use    (default: unimatrix-librarian)
 *   LIBRARIAN_TIMEOUT  — Request timeout ms  (default: 10000)
 *
 * Model selection priority:
 *   1. LOCAL: Ollama with unimatrix-librarian LoRA (Phase 1D target)
 *   2. LOCAL: Ollama with plain mistral (fallback if LoRA not loaded yet)
 *   3. RULE-BASED: extractTags + keyword heuristics (no-LLM fallback)
 */

import { extractTags } from './extractTags.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OLLAMA_URL       = process.env.OLLAMA_URL        ?? 'http://localhost:11434';
const LIBRARIAN_MODEL  = process.env.LIBRARIAN_MODEL   ?? 'unimatrix-librarian';
const FALLBACK_MODEL   = 'mistral';
const TIMEOUT_MS       = parseInt(process.env.LIBRARIAN_TIMEOUT ?? '10000', 10);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LibrarianClassification {
  semanticCategory: 'code' | 'personal' | 'learning' | 'work' | 'research' | 'general';
  importance:       'low' | 'medium' | 'high';
  tags:             string[];
  suggestsSupersession: boolean;
}

// ---------------------------------------------------------------------------
// Ollama inference
// ---------------------------------------------------------------------------

const CLASSIFY_PROMPT = `You are a memory classifier for an AI assistant. Given a memory snippet, classify it.

Respond ONLY with valid JSON (no explanation):
{
  "semanticCategory": "code|personal|learning|work|research|general",
  "importance": "low|medium|high",
  "tags": ["tag1","tag2","tag3"],
  "suggestsSupersession": true|false
}

Rules:
- importance=high if actionable, frequently useful, or contains key facts
- importance=low if trivial, conversational filler, or highly time-specific
- suggestsSupersession=true if this likely updates/replaces an older memory on the same topic
- tags: 2-5 lowercase keywords, no spaces in individual tags

Memory:
`;

async function classifyWithOllama(
  content: string,
  model: string,
): Promise<LibrarianClassification | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        model,
        prompt: CLASSIFY_PROMPT + content.slice(0, 800), // cap at ~800 chars for speed
        stream: false,
        options: { temperature: 0.1, top_p: 0.9 },
      }),
    });

    if (!res.ok) return null;

  const data: any = await res.json();
  const raw  = (data?.response as string ?? '').trim();

    // Extract JSON even if model wraps it in prose
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as LibrarianClassification;

    // Validate required fields
    if (
      !parsed.semanticCategory ||
      !parsed.importance       ||
      !Array.isArray(parsed.tags)
    ) return null;

    return {
      semanticCategory:     parsed.semanticCategory,
      importance:           parsed.importance,
      tags:                 parsed.tags.slice(0, 8).map(String),
      suggestsSupersession: Boolean(parsed.suggestsSupersession),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Rule-based fallback (no LLM required)
// ---------------------------------------------------------------------------

function classifyRuleBased(content: string): LibrarianClassification {
  const lower = content.toLowerCase();

  // Semantic category heuristics
  let semanticCategory: LibrarianClassification['semanticCategory'] = 'general';
  if (/\bfunction\b|\bclass\b|\bimport\b|\bconst\b|\bdef\b|\bpublic\b/.test(lower)) {
    semanticCategory = 'code';
  } else if (/\blearn(ed|ing)\b|\btutorial\b|\bexplain(ed)?\b|\bhow to\b/.test(lower)) {
    semanticCategory = 'learning';
  } else if (/\bmeeting\b|\bdeadline\b|\bproject\b|\bclient\b|\btask\b/.test(lower)) {
    semanticCategory = 'work';
  } else if (/\bstudy\b|\bpaper\b|\bresearch\b|\bfind(ing)?\b|\banalysis\b/.test(lower)) {
    semanticCategory = 'research';
  } else if (/\bfeel\b|\bfamily\b|\bfriend\b|\bpersonal\b|\blife\b/.test(lower)) {
    semanticCategory = 'personal';
  }

  // Importance heuristics
  let importance: LibrarianClassification['importance'] = 'medium';
  if (content.length < 80 || /\btodo\b|\bmaybe\b|\bjust\b/.test(lower)) {
    importance = 'low';
  } else if (
    content.length > 300 ||
    /\bimportant\b|\bcritical\b|\bmust\b|\balways\b|\bnever\b|\bkey\b/.test(lower)
  ) {
    importance = 'high';
  }

  // Supersession heuristics
  const suggestsSupersession = /\bnow\b|\bupdated?\b|\bchanged?\b|\bnew(er)?\b|\bcorrect(ed)?\b|\breplace\b/.test(lower);

  const tags = extractTags(content, 5);

  return { semanticCategory, importance, tags, suggestsSupersession };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a memory using the best available local model.
 *
 * Priority: unimatrix-librarian LoRA → mistral fallback → rule-based
 * Never calls external APIs. Always returns a valid classification.
 */
export async function classifyMemory(content: string): Promise<LibrarianClassification> {
  // 1. Try primary Librarian model (LoRA fine-tuned)
  const loraResult = await classifyWithOllama(content, LIBRARIAN_MODEL);
  if (loraResult) {
    return loraResult;
  }

  // 2. Try plain Mistral as fallback (Ollama available but LoRA not loaded)
  if (LIBRARIAN_MODEL !== FALLBACK_MODEL) {
    const mistralResult = await classifyWithOllama(content, FALLBACK_MODEL);
    if (mistralResult) {
      return mistralResult;
    }
  }

  // 3. Rule-based fallback — always works, zero cost, zero latency
  console.info('[Librarian] Using rule-based fallback (Ollama unavailable)');
  return classifyRuleBased(content);
}

/**
 * Check if the local Librarian model (Ollama) is reachable.
 * Returns model availability info for health checks.
 */
export async function checkLibrarianHealth(): Promise<{
  available:   boolean;
  model:       string | null;
  fallback:    'lora' | 'mistral' | 'rule-based';
}> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: any = await res.json();
  const names: string[] = (data?.models ?? []).map((m: any) => m.name as string);

    if (names.some((n) => n.includes('unimatrix-librarian'))) {
      return { available: true, model: LIBRARIAN_MODEL, fallback: 'lora' };
    }
    if (names.some((n) => n.includes('mistral'))) {
      return { available: true, model: FALLBACK_MODEL, fallback: 'mistral' };
    }

    return { available: true, model: null, fallback: 'rule-based' };
  } catch {
    return { available: false, model: null, fallback: 'rule-based' };
  }
}
