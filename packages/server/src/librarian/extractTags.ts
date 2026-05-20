/**
 * src/librarian/extractTags.ts
 *
 * TF-IDF-inspired keyword extraction — no external API.
 *
 * Algorithm:
 *   1. Tokenize and clean the text.
 *   2. Remove stopwords and very short/numeric-only tokens.
 *   3. Score each candidate term:
 *        - Term frequency (raw count in document)
 *        - Position bonus: terms in the first 15% of the text get 2x weight
 *          (titles, opening sentences are dense with key concepts)
 *        - Length bonus: 5-12 char words tend to be more specific than 3-4 char ones
 *   4. Optionally extract bigrams (two-word phrases) that co-occur at least twice.
 *   5. Merge and return the top N unique tags, kebab-cased.
 */

// ---------------------------------------------------------------------------
// Stopwords
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
  'said','say','get','got','make','made','use','used','using','new','one',
  'two','three','four','five','first','second','last','next','see','know',
  'want','need','go','going','come','coming','take','taking','like','good',
  'well','work','working','way','time','day','year','month','week',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9\-]/g, '');
}

function isCandidate(w: string): boolean {
  return (
    w.length >= 3 &&
    !STOPWORDS.has(w) &&
    !/^\d+$/.test(w)       // skip pure numbers
  );
}

function toKebab(phrase: string): string {
  return phrase.replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Extracts up to `maxTags` keyword tags from `text`.
 * Returns lowercase, kebab-cased tags sorted by relevance score descending.
 *
 * @param text    - Source text (sanitized)
 * @param maxTags - Maximum tags to return (default 5)
 */
export function extractTags(text: string, maxTags: number = 5): string[] {
  if (!text.trim()) return [];

  const rawWords = text
    .replace(/[^a-zA-Z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .map(clean)
    .filter(Boolean);

  const frontCutoff = Math.max(1, Math.floor(rawWords.length * 0.15));

  // --- Unigram frequency + position scoring ---
  const unigramScore = new Map<string, number>();

  rawWords.forEach((word, i) => {
    if (!isCandidate(word)) return;
    const posBonus  = i < frontCutoff ? 2.0 : 1.0;
    const lenBonus  = word.length >= 5 && word.length <= 12 ? 1.2 : 1.0;
    const prev      = unigramScore.get(word) ?? 0;
    unigramScore.set(word, prev + posBonus * lenBonus);
  });

  // --- Bigram extraction (co-occurring pairs) ---
  const bigramCount = new Map<string, number>();
  for (let i = 0; i < rawWords.length - 1; i++) {
    const a = rawWords[i];
    const b = rawWords[i + 1];
    if (!isCandidate(a) || !isCandidate(b)) continue;
    const bigram = `${a} ${b}`;
    bigramCount.set(bigram, (bigramCount.get(bigram) ?? 0) + 1);
  }

  // Only keep bigrams that appear at least twice
  const strongBigrams: Array<{ tag: string; score: number }> = [];
  for (const [bigram, count] of bigramCount) {
    if (count >= 2) {
      const [a, b] = bigram.split(' ');
      // Score = sum of individual scores × bigram frequency bonus
      const score = ((unigramScore.get(a) ?? 0) + (unigramScore.get(b) ?? 0)) * count * 0.6;
      strongBigrams.push({ tag: toKebab(bigram), score });
    }
  }

  // --- Merge and rank ---
  const candidates: Array<{ tag: string; score: number }> = [
    ...[...unigramScore.entries()].map(([tag, score]) => ({ tag, score })),
    ...strongBigrams,
  ];

  const seen  = new Set<string>();
  const final: string[] = [];

  for (const { tag } of candidates.sort((a, b) => b.score - a.score)) {
    if (seen.has(tag)) continue;
    // Skip unigrams that are already covered by a selected bigram
    const coveredByBigram = [...seen].some((s) => s.includes('-') && s.split('-').includes(tag));
    if (coveredByBigram) continue;
    seen.add(tag);
    final.push(tag);
    if (final.length >= maxTags) break;
  }

  return final;
}
