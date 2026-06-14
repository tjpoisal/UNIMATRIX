/**
 * GET /api/memory/system-prompt
 *
 * Returns a ready-to-inject system-prompt block for non-MCP LLMs.
 * Combines recalled memories + active triples into a compact text block.
 *
 * Query params:
 *   - q: string  — current user message (used to retrieve relevant memories)
 *   - limit: number (default 6, max 15)
 *   - space_id: string (optional — scope to a specific Space)
 *
 * Usage in ChatGPT/Gemini/Perplexity integrations:
 *   const url = `/api/memory/system-prompt?q=${encodeURIComponent(userMessage)}`;
 *   const { block, tokenEstimate } = await fetch(url, { headers: { Authorization: `Bearer ${key}` } }).then(r => r.json());
 *   const systemPrompt = `${basePrompt}\n\n${block}`;
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest }       from '@/lib/api-auth';
import { pool }                       from '@/lib/db';
import { generateQueryEmbedding }     from '@unimatrix/server/embeddings';
import { cosineSim }                  from '@unimatrix/server/lib/quantize';

const RRF_K = 60;

interface MemRow  { id: string; summary: string; embedding: string | null; cosine_sim: string; }
interface FtsRow  { id: string; summary: string; bm25_rank: string; }
interface TrpRow  { subject: string; predicate: string; object: string; }

function estimateTokens(text: string): number {
  // ~4 chars per token (rough estimate for English text)
  return Math.ceil(text.length / 4);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query   = searchParams.get('q');
  const limit   = Math.min(parseInt(searchParams.get('limit') ?? '6', 10), 15);
  const spaceId = searchParams.get('space_id') ?? null;

  if (!query) return NextResponse.json({ error: '"q" query param is required' }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);

    const embedding = await generateQueryEmbedding(query);
    const qFloat    = new Float32Array(embedding);
    const vecStr    = `[${embedding.join(',')}]`;
    const spaceF    = spaceId ? `AND (m.space_id = '${spaceId}'::uuid OR m.hierarchy_path LIKE '${spaceId}%')` : '';

    // L1 vector
    await client.query(`SET LOCAL hnsw.ef_search = 80`);
    const vRes = await client.query<MemRow>(
      `SELECT m.id, m.summary, m.embedding::text,
              1.0 - (m.embedding <=> $1::vector) AS cosine_sim
         FROM memories m
        WHERE m.user_id = $2::uuid AND m.indexed_at IS NOT NULL AND m.status = 'active' AND m.deleted_at IS NULL
        ${spaceF}
        ORDER BY m.embedding <=> $1::vector LIMIT $3`,
      [vecStr, userId, 30],
    );

    // L2 BM25
    const fRes = await client.query<FtsRow>(
      `SELECT m.id, m.summary, ts_rank(m.fts_vector, plainto_tsquery('english', $1)) AS bm25_rank
         FROM memories m
        WHERE m.user_id = $2::uuid AND m.fts_vector @@ plainto_tsquery('english', $1)
          AND m.status = 'active' AND m.deleted_at IS NULL ${spaceF}
        ORDER BY bm25_rank DESC LIMIT 30`,
      [query, userId],
    );

    // L3 RRF + cosine rerank
    const rrf = new Map<string, { summary: string; rrf_score: number; embedding: string | null }>();
    vRes.rows.forEach((r, i) => rrf.set(r.id, { summary: r.summary, rrf_score: 1 / (RRF_K + i + 1), embedding: r.embedding }));
    fRes.rows.forEach((r, i) => { const ex = rrf.get(r.id); if (ex) ex.rrf_score += 1 / (RRF_K + i + 1); else rrf.set(r.id, { summary: r.summary, rrf_score: 1 / (RRF_K + i + 1), embedding: null }); });

    const ranked = Array.from(rrf.entries())
      .sort((a, b) => b[1].rrf_score - a[1].rrf_score)
      .slice(0, limit * 3)
      .map(([id, d]) => {
        let score = d.rrf_score;
        if (d.embedding) {
          try { const sv = new Float32Array(d.embedding.replace(/[\[\]]/g, '').split(',').map(Number)); score = cosineSim(qFloat, sv) * 0.7 + d.rrf_score * 0.3; } catch { /**/ }
        }
        return { id, summary: d.summary, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // L4 triples
    const tRes = await client.query<TrpRow>(
      `SELECT subject, predicate, object FROM memory_triples
        WHERE user_id = $1::uuid AND superseded_at IS NULL
        ORDER BY confidence DESC, created_at DESC LIMIT 15`,
      [userId],
    );

    // Assemble block
    const memLines    = ranked.map((m, i) => `${i + 1}. ${m.summary}`).join('\n');
    const tripleLines = tRes.rows.map(t => `- ${t.subject} ${t.predicate} ${t.object}`).join('\n');

    const block = [
      '---',
      '# Unimatrix Memory Context',
      ranked.length   > 0 ? `## Recalled Memories\n${memLines}`           : '',
      tRes.rows.length > 0 ? `\n## Known User Facts\n${tripleLines}` : '',
      '---',
    ].filter(Boolean).join('\n');

    return NextResponse.json({
      block,
      tokenEstimate:  estimateTokens(block),
      memoryCount:    ranked.length,
      tripleCount:    tRes.rows.length,
      // Array form for programmatic use
      memories:       ranked.map(m => ({ id: m.id, summary: m.summary, score: parseFloat(m.score.toFixed(4)) })),
      knownFacts:     tRes.rows.map(t => `${t.subject} ${t.predicate} ${t.object}`),
    });
  } catch (err) {
    console.error('[/api/memory/system-prompt]', err);
    return NextResponse.json({ error: 'Failed to build system prompt' }, { status: 500 });
  } finally {
    client.release();
  }
}
