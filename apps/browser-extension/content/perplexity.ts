/**
 * Perplexity.ai content script
 *
 * Perplexity does not implement MCP. This script captures completed
 * responses from the Perplexity UI and sends them to Unimatrix via
 * POST /api/ingest/browser.
 *
 * DOM strategy: MutationObserver watching for completed answer blocks.
 * Perplexity marks completed answers with [data-testid="answer"] or
 * the prose container — we watch for settled text nodes after streaming stops.
 */

import { sendToUnimatrix, getSettings, extractModelName } from '../utils/api.js';
import { isDuplicate, markSeen } from '../utils/dedup.js';

const SOURCE = 'perplexity';

// ── Selectors (update if Perplexity changes their DOM) ──────────────────────
const ANSWER_SELECTOR    = '[data-testid="answer"], .prose, .answer-text';
const QUESTION_SELECTOR  = '[data-testid="query"], .query-text, textarea[name="q"]';
const MODEL_SELECTOR     = '[data-testid="model-badge"], .model-name';

let lastCaptured = '';

async function captureCurrentTurn(): Promise<void> {
  const settings = await getSettings();
  if (!settings?.apiKey || !settings?.enabled) return;

  const answerEl   = document.querySelector(ANSWER_SELECTOR);
  const questionEl = document.querySelector(QUESTION_SELECTOR);
  const modelEl    = document.querySelector(MODEL_SELECTOR);

  const assistantMessage = answerEl?.textContent?.trim();
  const userMessage      = questionEl?.textContent?.trim() ||
                           (questionEl as HTMLTextAreaElement)?.value?.trim();
  const model            = modelEl?.textContent?.trim() ?? extractModelName(document.title);

  if (!assistantMessage || !userMessage) return;
  if (assistantMessage === lastCaptured) return; // streaming not yet settled

  const dedupeKey = `${userMessage}::${assistantMessage.slice(0, 64)}`;
  if (await isDuplicate(dedupeKey)) return;

  lastCaptured = assistantMessage;
  await markSeen(dedupeKey);

  await sendToUnimatrix(settings.apiKey, {
    source: SOURCE,
    model: model ?? 'unknown',
    userMessage,
    assistantMessage,
    url: location.href,
    capturedAt: new Date().toISOString(),
  });
}

// ── MutationObserver: fires when DOM settles after streaming ─────────────────
let debounceTimer: ReturnType<typeof setTimeout>;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  // Wait 1.5s after last DOM mutation — stream has likely settled by then
  debounceTimer = setTimeout(captureCurrentTurn, 1500);
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// ── Capture on navigation (Perplexity is a SPA) ──────────────────────────────
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // New question — reset lastCaptured so the new answer is captured
    lastCaptured = '';
  }
}).observe(document, { subtree: true, childList: true });
