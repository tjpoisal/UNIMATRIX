/**
 * src/handlers/retrieveExplain.ts
 *
 * Retrieval explainability endpoint — tells the user WHY a specific memory
 * was returned for a given query.
 *
 * Endpoint: GET /api/explorer/memories/:id/explain?query=<search_query>&tags=tag1,tag2
 *
 * Computes a relevance score from four factors:
 *   1. semanticScore     — cosine similarity between query & memory embeddings
 *   2. recencyScore      — exponential decay based on memory age
 *   3. fullTextMatch     — 1 if tsvector match, else 0
 *   4. tagOverlap        — Jaccard-style overlap of query tags vs memory tags
 *
 * Combined score = ALPHA * semanticScore + (1-ALPHA) * recencyScore
 *                  + fullTextBonus + tagBonus
 *
 * Constants:
 *   ALPHA      = 0.7   (70 % semantic, 30 % recency)
 *   HALF_LIFE  = 30    (days)
 *   lambda     = ln(2) / HALF_LIFE ≈ 0.0231
 */

import { withUserContextReadOnly } from '../db/client.js';
import { generateQueryEmbedding } from '../embeddings.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALPHA = 0.7;
const HALF_LIFE_DAYS = 30;
const DECAY_LAMBDA = Math.log(2) / HALF_LIFE_DAYS; // ≈ 0.0231049

const FULL_TEXT_BONUS = 0.1;
const TAG_BONUS_MAX = 0.05;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExplainFactor {
  label:        string;
  value:        number;
  weight:       number;
  contribution: number; // value * weight (or bonus amount)
}

export interface ExplainBreakdown {
  semanticScore: number;
  recencyScore:  number;
  fullTextMatch: number; // 0 or 1
  tagOverlap:    number | null; // 0..1 or null when no query tags
}

export interface ExplainResponse {
  memoryId:      string;
  relevanceScore: number;
  breakdown:     ExplainBreakdown;
  factors:       ExplainFactor[];
  spaceName:     string | null;
  tags:          string[];
  createdAt:     Date;
  confidence:    'very_relevant' | 'relevant' | 'possibly_related';
  retrievedBecause: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeRecencyScore(daysSinceCreated: number): number {
  return Math.exp(-DECAY_LAMBDA * daysSinceCreated);
}

function computeTagOverlap(queryTags: string[], memoryTags: string[]): number {
  if (queryTags.length === 0) return 0;
  const intersection = queryTags.filter((t) =>
    memoryTags.map((mt) => mt.toLowerCase()).includes(t.toLowerCase()),
  );
  return intersection.length / queryTags.length;
}

function computeConfidence(score: number): ExplainResponse['confidence'] {
  if (score >= 0.8) return 'very_relevant';
  if (score >= 0.55) return 'relevant';
  return 'possibly_related';
}

function buildRetrievedBecause(
  breakdown: ExplainBreakdown,
  spaceName: string | null,
  tags: string[],
): string {
  const parts: string[] = [];

  if (breakdown.semanticScore >= 0.7) {
    parts.push('strong semantic match');
  } else if (breakdown.semanticScore >= 0.4) {
    parts.push('moderate semantic similarity');
  } else {
    parts.push('weak semantic similarity');
  }

  if (breakdown.fullTextMatch === 1) {
    parts.push('full-text keyword match');
  }

  if (breakdown.tagOverlap !== null && breakdown.tagOverlap > 0) {
    parts.push(`tag overlap (${Math.round(breakdown.tagOverlap * 100)}%)`);
  }

  if (spaceName) {
    parts.push(`stored in "${spaceName}"`);
  }

  if (tags.length > 0) {
    parts.push(`tags: ${tags.slice(0, 3).join(', ')}`);
  }

  return parts.join('; ');
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

/**
 * GET /api/explorer/memories/:id/explain?query=<search_query>&tags=tag1,tag2
 *
 * Returns a detailed explainability breakdown for why a specific memory
 * would be retrieved given a query string (and optional query tags).
 */
export async function explainMemory(
  userId: string,
  memoryId: string,
  query: string,
  queryTags?: string[],
): Promise<ExplainResponse | null> {
  // Generate query embedding up-front (needed for semantic score)
  const queryEmbedding = await generateQueryEmbedding(query);

  return withUserContextReadOnly(userId, async (client) => {
    // ── Fetch memory + space + tags + compute scores in one query ──
    const res = await client.query<{
      id:            string;
      summary:       string;
      content:       string;
      created_at:    Date;
      space_id:      string | null;
      space_name:    string | null;
      memory_tags:   string[];
      cosine_sim:    string | null;
      days_since:    string;
      full_text_match: boolean;
    }>(
      `WITH memory_data AS (
         SELECT
           m.id,
           m.summary,
           convert_from(m.content, 'UTF8') as content,
           m.created_at,
           m.space_id,
           s.name AS space_name,
           (
             SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[])
             FROM memory_tags t
             WHERE t.memory_id = m.id
           ) AS memory_tags,
           1.0 - (m.embedding <=> $1::vector) AS cosine_sim,
           EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since,
           (
             m.search_vector @@ plainto_tsquery('english', $2::text)
           ) AS full_text_match
         FROM memories m
         LEFT JOIN spaces s ON s.id = m.space_id
         WHERE m.id = $3::uuid
           AND m.user_id = current_user_id()::uuid
           AND m.indexed_at IS NOT NULL
       )
       SELECT * FROM memory_data`,
      [
        JSON.stringify(queryEmbedding), // $1 — vector
        query,                         // $2 — full-text query
        memoryId,                      // $3 — memory id
      ],
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];

    // ── Compute individual scores ──
    const semanticScore = row.cosine_sim !== null
      ? parseFloat(row.cosine_sim)
      : 0;

    const daysSince = parseFloat(row.days_since);
    const recencyScore = computeRecencyScore(daysSince);

    const fullTextMatch = row.full_text_match ? 1 : 0;

    const tagOverlap = queryTags && queryTags.length > 0
      ? computeTagOverlap(queryTags, row.memory_tags)
      : null;

    // ── Combined score ──
    const baseScore = ALPHA * semanticScore + (1 - ALPHA) * recencyScore;
    const fullTextBonus = fullTextMatch * FULL_TEXT_BONUS;
    const tagBonus = tagOverlap !== null ? tagOverlap * TAG_BONUS_MAX : 0;

    const relevanceScore = Math.min(1, baseScore + fullTextBonus + tagBonus);

    // ── Build breakdown ──
    const breakdown: ExplainBreakdown = {
      semanticScore,
      recencyScore,
      fullTextMatch,
      tagOverlap,
    };

    // ── Build factors array ──
    const factors: ExplainFactor[] = [
      {
        label:        'Semantic similarity',
        value:        semanticScore,
        weight:       ALPHA,
        contribution: ALPHA * semanticScore,
      },
      {
        label:        'Recency decay',
        value:        recencyScore,
        weight:       1 - ALPHA,
        contribution: (1 - ALPHA) * recencyScore,
      },
      {
        label:        'Full-text match',
        value:        fullTextMatch,
        weight:       FULL_TEXT_BONUS,
        contribution: fullTextBonus,
      },
    ];

    if (tagOverlap !== null) {
      factors.push({
        label:        'Tag overlap',
        value:        tagOverlap,
        weight:       TAG_BONUS_MAX,
        contribution: tagBonus,
      });
    }

    // ── Confidence badge ──
    const confidence = computeConfidence(relevanceScore);

    // ── Human-readable explanation ──
    const retrievedBecause = buildRetrievedBecause(
      breakdown,
      row.space_name,
      row.memory_tags,
    );

    return {
      memoryId:       row.id,
      relevanceScore,
      breakdown,
      factors,
      spaceName:      row.space_name,
      tags:           row.memory_tags,
      createdAt:      row.created_at,
      confidence,
      retrievedBecause,
    };
  });
}
