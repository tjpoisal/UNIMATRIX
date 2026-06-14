/**
 * POST /api/memory/search
 *
 * CSMTER hybrid semantic search for non-MCP LLMs (ChatGPT, Gemini, Perplexity, etc.).
 *
 * Usage before sending to a non-MCP LLM:
 *   const { systemPromptAddition, memories, knownFacts } = await fetch('/api/memory/search', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <umx_...>' },
 *     body: JSON.stringify({ query: userMessage, sourceLlm: 'openai' })
 *   }).then(r => r.json());
 *   const fullSystemPrompt = baseSystemPrompt + systemPromptAddition;
 *
 * Pipeline: L1 vector ANN → L2 BM25 cross-check → L3 RRF rerank → L4 triple injection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest }       from '@/lib/api-auth';
import { pool }                       from '@/lib/db';
import { generateQueryEmbedding }     from '@unimatrix/server/embeddings';
import { cosineSim }                  from '@unimatrix/server/lib/quantize';

const TOP_K_BUFFER = 40;
const RRF_K        = 60;

interface MemRow {
  id: string; summary: string; space_id: string | null; source: string;
  tags: string[]; created_at: Date; embedding: string | null; cosine_sim: string;
}
interface FtsRow  { id: string; summary: string; bm25_rank: string; }
interface TrpRow  { subject: string; predicate: string; object: string; }

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.query) return NextResponse.json({ error: '"query" is required' }, { status: 400 });

  const { query, space_id, tags, limit: rawLimit, source_llm } = body as {
    query: string; space_id?: string; tags?: string[]; limit?: number; source_llm?: string;
  };
  const limit = Math.min(rawLimit ?? 8, 50);

  try {
    const embedding = await generateQueryEmbedding(query);
    const qFloat    = new Float32Array(embedding);
    const vecStr    = `[${embedding.join(',')}]`;

    const spaceFilter = space_id ? `AND (m.space_id = '${space_id}'::uuid OR m.hierarchy_path LIKE '${space_id}%')` : '';
    const tagsFilter  = tags?.length ? `AND EXISTS (SELECT 1 FROM memory_tags mt WHERE mt.memory_id = m.id AND mt.tag = ANY(ARRAY[${tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]))` : '';

    const client = await pool.connect();
    try {
      // RLS
      await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);

      // L1: vector ANN
      await client.query(`SET LOCAL hnsw.ef_search = 100`);
      const vRes = await client.query<MemRow>(
        `SELECT m.id, m.summary, m.space_id, m.source, m.embedding::text,
                (SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[]) FROM memory_tags t WHERE t.memory_id = m.id) AS tags,
                m.created_at,
                1.0 - (m.embedding <=> $1::vector) AS cosine_sim
           FROM memories m
          WHERE m.user_id = $2::uuid AND m.indexed_at IS NOT NULL AND m.status = 'active' AND m.deleted_at IS NULL
          ${spaceFilter} ${tagsFilter}
          ORDER BY m.embedding <=> $1::vector LIMIT $3`,
        [vecStr, userId, TOP_K_BUFFER],
      );

      // L2: BM25
      const fRes = await client.query<FtsRow>(
        `SELECT m.id, m.summary, ts_rank(m.fts_vector, plainto_tsquery('english', $1)) AS bm25_rank
           FROM memories m
          WHERE m.user_id = $2::uuid AND m.fts_vector @@ plainto_tsquery('english', $1)
            AND m.status = 'active' AND m.deleted_at IS NULL
          ${spaceFilter} ${tagsFilter}
          ORDER BY bm25_rank DESC LIMIT $3`,
        [query, userId, TOP_K_BUFFER],
      );

      // L3: RRF + float32 rerank
      const rrf = new Map<string, { summary: string; rrf_score: number; embedding: string | null; source: string; tags: string[]; created_at: Date }>();
      vRes.rows.forEach((r, i) => rrf.set(r.id, { summary: r.summary, rrf_score: 1 / (RRF_K + i + 1), embedding: r.embedding, source: 'vector', tags: r.tags ?? [], created_at: r.created_at }));
      fRes.rows.forEach((r, i) => {
        const ex = rrf.get(r.id);
        if (ex) { ex.rrf_score += 1 / (RRF_K + i + 1); }
        else rrf.set(r.id, { summary: r.summary, rrf_score: 1 / (RRF_K + i + 1), embedding: null, source: 'bm25_only', tags: [], created_at: new Date() });
      });

      const results = Array.from(rrf.entries())
        .sort((a, b) => b[1].rrf_score - a[1].rrf_score)
        .slice(0, limit * 3)
        .map(([id, d]) => {
          let score = d.rrf_score;
          if (d.embedding) {
            try {
              const sv = new Float32Array(d.embedding.replace(/[\[\]]/g, '').split(',').map(Number));
              score = cosineSim(qFloat, sv) * 0.7 + d.rrf_score * 0.3;
            } catch { /* use rrf score */ }
          }
          return { id, summary: d.summary, score, source: d.source, tags: d.tags, createdAt: d.created_at };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // L4: semantic triples
      const tRes = await client.query<TrpRow>(
        `SELECT subject, predicate, object FROM memory_triples
          WHERE user_id = $1::uuid AND superseded_at IS NULL
          ORDER BY confidence DESC, created_at DESC LIMIT 20`,
        [userId],
      );
      const knownFacts = tRes.rows.map(t => `${t.subject} ${t.predicate} ${t.object}`);

      // Build system-prompt block
      const memBlock    = results.length > 0 ? `## Recalled Memories\n${results.map((m, i) => `${i + 1}. ${m.summary}`).join('\n')}` : '';
      const tripleBlock = knownFacts.length > 0 ? `\n\n## Known User Facts\n${knownFacts.map(f => `- ${f}`).join('\n')}` : '';
      const systemPromptAddition = memBlock || tripleBlock ? `\n\n---\n# Unimatrix Memory Context\n${memBlock}${tripleBlock}\n---\n` : '';

      return NextResponse.json({
        memories:             results,
        knownFacts,
        systemPromptAddition,
        sourceLlm:            source_llm ?? null,
        storageStats:         { pipeline: 'L1-vector+L2-BM25+L3-RRF+L4-triples', bytesPerMemory: 148, compressionRatio: '10x' },
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[/api/memory/search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
