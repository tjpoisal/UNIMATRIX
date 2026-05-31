/**
 * src/librarian/summarize.ts
 *
 * Extractive summarization — no external API, no LLM.
 *
 * Algorithm:
 *   1. Split text into sentences.
 *   2. Score each sentence on three axes:
 *        - Term frequency: sentences containing high-freq terms score higher.
 *        - Position:       first sentence gets a strong bonus (thesis statement),
 *                          last sentence gets a mild bonus (conclusion).
 *        - Length:         very short or very long sentences are penalized.
 *   3. Pick the top N sentences by score.
 *   4. Re-order them by original position before joining.
 *
 * This is a simplified TextRank-style approach — no graph needed because
 * memories are short enough that positional + frequency heuristics work well.
 */

// ---------------------------------------------------------------------------
// Stopwords (English) — terms excluded from frequency scoring
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','as','is','was','are','were','be','been','being','have',
  'has','had','do','does','did','will','would','could','should','may',
  'might','must','can','this','that','these','those','it','its','i','me',
  'my','we','our','you','your','he','she','they','their','his','her',
  'not','no','so','if','then','than','when','where','who','which','what',
  'how','all','any','both','each','few','more','most','other','some','such',
  'only','own','same','too','very','just','about','above','after','before',
  'between','into','through','during','without','within','along','across',
  'also','back','now','here','there','up','out','over','under','again',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// ---------------------------------------------------------------------------
// Sentence splitter
// ---------------------------------------------------------------------------

function splitSentences(text: string): string[] {
  // Split on . ! ? followed by whitespace and an uppercase letter or end-of-string
  const raw = text.match(/[^.!?]*[.!?]+(?:\s|$)/g) ?? [];
  const sentences = raw.map((s) => s.trim()).filter((s) => s.length > 10);
  // If splitting failed (no punctuation), fall back to chunks of ~100 chars
  if (sentences.length === 0) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += 100) {
      chunks.push(text.slice(i, i + 100).trim());
    }
    return chunks.filter((c) => c.length > 10);
  }
  return sentences;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Returns an extractive summary of `text` using at most `maxSentences`.
 *
 * If the text is already short enough to fit in `maxSentences` sentences,
 * it is returned as-is (trimmed). Otherwise the highest-scoring sentences
 * are selected and returned in original order.
 *
 * @param text         - Source text (sanitized, no API keys/PII)
 * @param maxSentences - Max sentences in the output (default 2)
 * @param maxChars     - Hard cap on output length (default 300 chars)
 */
export function extractiveSummarize(
  text:         string,
  maxSentences: number = 2,
  maxChars:     number = 300,
): string {
  const trimmed   = text.trim();
  if (!trimmed)   return '';

  const sentences = splitSentences(trimmed);
  if (sentences.length <= maxSentences) return trimmed.slice(0, maxChars);

  // --- Term frequency over the whole document ---
  const docTokens = tokenize(trimmed);
  const tf        = new Map<string, number>();
  for (const w of docTokens) tf.set(w, (tf.get(w) ?? 0) + 1);
  const maxFreq   = Math.max(...tf.values(), 1);

  const n = sentences.length;

  // --- Score each sentence ---
  const scored = sentences.map((sentence, i) => {
    const tokens  = tokenize(sentence);
    const len     = sentence.length;

    // TF score: average normalized frequency of content words
    const tfScore = tokens.length === 0 ? 0
      : tokens.reduce((sum, w) => sum + (tf.get(w) ?? 0) / maxFreq, 0) / tokens.length;

    // Position score: strong bonus for first sentence, mild for last
    const posScore =
      i === 0     ? 1.0 :
      i === n - 1 ? 0.75 :
      1 - (i / n) * 0.4;  // linear decay

    // Length score: ideal range 40–180 chars
    const lenScore =
      len < 20  ? 0.2 :
      len < 40  ? 0.6 :
      len > 250 ? 0.5 :
      1.0;

    // Weighted combination
    const score = tfScore * 0.55 + posScore * 0.30 + lenScore * 0.15;

    return { sentence, score, index: i };
  });

  // --- Pick top sentences, restore original order ---
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence)
    .join(' ');

  return selected.slice(0, maxChars);
}
