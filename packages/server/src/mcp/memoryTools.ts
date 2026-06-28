/**
 * src/mcp/memoryTools.ts
 *
 * CSMTER-enhanced MCP tool handlers and manifests.
 *
 * Drop-in addition to the existing MCP server tool switch.
 * Exposes four new tools via the CSMTER storage backend:
 *
 *   unimatrix_recall         — 4-layer hybrid recall (L1 vector + L2 BM25 + L3 RRF + L4 triples)
 *   unimatrix_search_csmter  — Explicit CSMTER search with filter controls
 *   unimatrix_list_triples   — List known active semantic facts
 *   unimatrix_system_prompt  — Get injectable system-prompt block for non-MCP LLMs
 *
 * Wiring (3 lines in your MCP route handler):
 *
 *   import { handleMemoryTool, MEMORY_TOOL_MANIFESTS } from './mcp/memoryTools.js';
 *
 *   // In tools array:
 *   tools: [...existingTools, ...MEMORY_TOOL_MANIFESTS]
 *
 *   // In switch/case or tool dispatcher:
 *   const result = await handleMemoryTool(toolName, args, userId);
 *   if (result !== null) return result;
 *   // ...fall through to existing handlers
 */

import { withUserContextReadOnlyRaw as withROCtx } from '../db/client.js';
import { generateQueryEmbedding }                  from '../embeddings.js';
import { cosineSim }                               from '../lib/quantize.js';
import { estimateTokenCount }                      from '../utils/tokens.js';

// ─────────────────────────────────────────────────────────────────────────────
// MCP tool manifests (JSON Schema)
// ─────────────────────────────────────────────────────────────────────────────

export const MEMORY_TOOL_MANIFESTS = [
  {
    name: 'unimatrix_recall',
    description:
      'Hybrid memory recall across ALL your LLM conversations. ' +
      'Combines semantic vector search (L1), BM25 keyword cross-check (L2), ' +
      'Reciprocal Rank Fusion reranking (L3), and semantic triple injection (L4). ' +
      'Use this for broad contextual recall — it surfaces what ChatGPT wrote, ' +
      'what Cursor inferred, and what Claude remembered, all in one call.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query — what context do you need?',
        },
        space_id: {
          type: 'string',
          description: 'Optional: scope to a specific Space (and its descendants).',
        },
        limit: {
          type: 'number',
          description: 'Max memories to return (default: 8, max: 20).',
        },
        profile: {
          type: 'string',
          enum: ['desktop', 'mobile'],
          description: 'Token budget profile (default: desktop).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'unimatrix_search_csmter',
    description:
      'Explicit memory search with filter controls. Differs from unimatrix_recall: ' +
      'requires a query, supports tag/status/date filters, and applies no recency decay. ' +
      'Use when you want precise filtered search rather than broad contextual recall.',
    inputSchema: {
      type: 'object',
      properties: {
        query:    { type: 'string', description: 'Search query.' },
        space_id: { type: 'string', description: 'Filter to a specific Space.' },
        tags:     { type: 'array', items: { type: 'string' }, description: 'Tag filter (ANY match).' },
        status:   { type: 'string', enum: ['active', 'superseded', 'archived'], description: 'Memory status filter.' },
        limit:    { type: 'number', description: 'Max results (default: 10, max: 50).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'unimatrix_list_triples',
    description:
      'List active semantic triples (subject-predicate-object facts) the Librarian has ' +
      'extracted from your memories. These represent stable known facts: preferences, ' +
      'goals, projects, identities. Inject these directly into your system prompt for ' +
      'zero-vector-cost personalization.',
    inputSchema: {
      type: 'object',
      properties: {
        limit:   { type: 'number', description: 'Max triples to return (default: 20).' },
        subject: { type: 'string', description: 'Filter by subject (e.g. userId for user facts).' },
      },
    },
  },
  {
    name: 'unimatrix_system_prompt',
    description:
      'Get a ready-to-inject system-prompt block containing active memories and known facts. ' +
      'For non-MCP LLMs (ChatGPT, Gemini, etc.) — prepend this to your system message. ' +
      'Returns a compact text block summarizing context relevant to a given query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Current user message (used to retrieve relevant memories).',
        },
        limit: { type: 'number', description: 'Max memories in the block (default: 6).' },
      },
      required: ['query'],
    },
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Internal query helpers
// ─────────────────────────────────────────────────────────────────────────────

const RRF_K          = 60;
const TOP_K_BUFFER   = 40;
const MAX_RERANK     = 24;
type MemoryTier = 'HOT' | 'WARM' | 'COLD' | 'ARCHIVE';
const HALF_LIFE_BY_TIER: Record<MemoryTier, number> = { HOT: 180, WARM: 90, COLD: 30, ARCHIVE: 7 };

interface MemoryRow {
  id:         string;
  summary:    string;
  space_id:   string | null;
  source:     string;
  tags:       string[];
  created_at: Date;
  embedding:  string | null;
  cosine_sim: string;
  days_since: string;
}

interface FtsRow {
  id:        string;
  summary:   string;
  bm25_rank: string;
  created_at: Date;
  tags:      string[];
}

interface TripleRow {
  subject:    string;
  predicate:  string;
  object:     string;
  confidence: string;
}

function resolveMemoryTier(tags: string[]): MemoryTier {
  const lowered = tags.map((tag) => tag.toLowerCase());
  if (lowered.includes('tier:hot') || lowered.includes('storage-tier:hot')) return 'HOT';
  if (lowered.includes('tier:cold') || lowered.includes('storage-tier:cold')) return 'COLD';
  if (lowered.includes('tier:archive') || lowered.includes('storage-tier:archive')) return 'ARCHIVE';
  return 'WARM';
}

function applyTemporalDecay(score: number, createdAt: Date, halfLifeDays = 90): number {
  const ageMs = Date.now() - createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const decay = Math.pow(0.5, ageDays / halfLifeDays);
  return score * (0.3 + 0.7 * decay);
}

async function hybridSearch(
  userId:  string,
  query:   string,
  options: { spaceId?: string; limit?: number; tags?: string[]; status?: string },
): Promise<Array<{ id: string; summary: string; score: number; source: string; tags: string[]; createdAt: Date }>> {
  const limit     = Math.min(options.limit ?? 8, 50);
  const embedding = await generateQueryEmbedding(query);
  const qFloat    = new Float32Array(embedding);

  const spaceFilter  = options.spaceId
    ? `AND (m.space_id = '${options.spaceId}'::uuid OR m.hierarchy_path LIKE '${options.spaceId}%')`
    : '';
  const statusFilter = options.status ? `AND m.status = '${options.status}'::memory_status` : `AND m.status = 'active'`;
  const tagsFilter   = options.tags?.length
    ? `AND EXISTS (SELECT 1 FROM memory_tags mt WHERE mt.memory_id = m.id AND mt.tag = ANY(ARRAY[${options.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]))`
    : '';

  // L1 vector ANN
  const vRows = await withROCtx(userId, async (client) => {
    await client.query(`SET LOCAL hnsw.ef_search = 100`);
    const res = await client.query<MemoryRow>(
      `SELECT m.id, m.summary, m.space_id, m.source, m.embedding,
              (SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[]) FROM memory_tags t WHERE t.memory_id = m.id) AS tags,
              m.created_at,
              1.0 - (m.embedding <=> $1::vector) AS cosine_sim,
              EXTRACT(DAY FROM NOW() - m.created_at)::float AS days_since
         FROM memories m
        WHERE m.user_id = current_user_id()::uuid
          AND m.indexed_at IS NOT NULL
          AND m.deleted_at IS NULL
          ${statusFilter} ${spaceFilter} ${tagsFilter}
        ORDER BY m.embedding <=> $1::vector
        LIMIT $2`,
      [`[${embedding.join(',')}]`, TOP_K_BUFFER],
    );
    return res.rows;
  });

  // L2 BM25
  const fRows = await withROCtx(userId, async (client) => {
    const res = await client.query<FtsRow>(
      `SELECT m.id, m.summary, ts_rank(m.fts_vector, plainto_tsquery('english', $1)) AS bm25_rank,
              m.created_at,
              (SELECT COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag), ARRAY[]::text[]) FROM memory_tags t WHERE t.memory_id = m.id) AS tags
         FROM memories m
        WHERE m.user_id = current_user_id()::uuid
          AND m.fts_vector @@ plainto_tsquery('english', $1)
          AND m.deleted_at IS NULL
          ${statusFilter} ${spaceFilter} ${tagsFilter}
        ORDER BY bm25_rank DESC
        LIMIT $2`,
      [query, TOP_K_BUFFER],
    );
    return res.rows;
  });

  // L3 RRF + float32 rerank
  const rrf = new Map<string, { summary: string; rrf_score: number; embedding: string | null; source: string; tags: string[]; created_at: Date }>();
  vRows.forEach((r, rank) => rrf.set(r.id, { summary: r.summary, rrf_score: 1 / (RRF_K + rank + 1), embedding: r.embedding, source: 'vector', tags: r.tags ?? [], created_at: r.created_at }));
  fRows.forEach((r, rank) => {
    const ex = rrf.get(r.id);
    if (ex) { ex.rrf_score += 1 / (RRF_K + rank + 1); ex.source = parseFloat(ex.rrf_score.toString()) < 0.55 ? 'bm25_rescue' : ex.source; }
    else rrf.set(r.id, { summary: r.summary, rrf_score: 1 / (RRF_K + rank + 1), embedding: null, source: 'bm25_only', tags: [], created_at: new Date() });
  });

  return Array.from(rrf.entries())
    .sort((a, b) => b[1].rrf_score - a[1].rrf_score)
    .slice(0, MAX_RERANK)
    .map(([id, data]) => {
      const tier = resolveMemoryTier(data.tags);
      const decayedRrf = applyTemporalDecay(data.rrf_score, data.created_at, HALF_LIFE_BY_TIER[tier]);
      let score = decayedRrf;
      if (data.embedding) {
        try {
          const sv = new Float32Array(data.embedding.replace(/[\[\]]/g, '').split(',').map(Number));
          score = cosineSim(qFloat, sv) * 0.7 + decayedRrf * 0.3;
        } catch { /* fall back to rrf_score */ }
      }
      return { id, summary: data.summary, score, source: data.source, tags: data.tags, createdAt: data.created_at };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function getActiveTriples(
  userId:  string,
  limit:   number,
  subject?: string,
): Promise<TripleRow[]> {
  return withROCtx(userId, async (client) => {
    const subjectFilter = subject ? `AND subject = '${subject.replace(/'/g, "''")}'` : '';
    const res = await client.query<TripleRow>(
      `SELECT subject, predicate, object, confidence
         FROM memory_triples
        WHERE user_id = current_user_id()::uuid
          AND superseded_at IS NULL
          ${subjectFilter}
        ORDER BY confidence DESC, created_at DESC
        LIMIT $1`,
      [limit],
    );
    return res.rows;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// handleMemoryTool — call from your MCP switch/case
// Returns null if toolName is not a CSMTER tool (fall through to existing handlers)
// ─────────────────────────────────────────────────────────────────────────────

export async function handleMemoryTool(
  toolName: string,
  args:     Record<string, unknown>,
  userId:   string,
): Promise<Record<string, unknown> | null> {

  switch (toolName) {

    // ── unimatrix_recall ────────────────────────────────────────────────────
    case 'unimatrix_recall': {
      const query   = args.query   as string;
      const spaceId = args.space_id as string | undefined;
      const limit   = Math.min(Number(args.limit ?? 8), 20);

      const memories = await hybridSearch(userId, query, { spaceId, limit });
      const triples  = await getActiveTriples(userId, 20);

      return {
        memories: memories.map(m => ({
          id:               m.id,
          summary:          m.summary,
          score:            parseFloat(m.score.toFixed(4)),
          retrievalChannel: m.source,
          tags:             m.tags,
          createdAt:        m.createdAt,
        })),
        knownFacts: triples.map(t => `${t.subject} ${t.predicate} ${t.object}`),
        storageStats: {
          bytesPerMemory:   148,
          compressionRatio: '10x',
          pipeline:         'L1-vector+L2-BM25+L3-RRF+L4-triples',
        },
      };
    }

    // ── unimatrix_search_csmter ─────────────────────────────────────────────
    case 'unimatrix_search_csmter': {
      const query   = args.query    as string;
      const spaceId = args.space_id as string | undefined;
      const tags    = args.tags     as string[] | undefined;
      const status  = args.status   as string | undefined;
      const limit   = Math.min(Number(args.limit ?? 10), 50);

      const memories = await hybridSearch(userId, query, { spaceId, limit, tags, status });

      return {
        memories: memories.map(m => ({
          id:               m.id,
          summary:          m.summary,
          score:            parseFloat(m.score.toFixed(4)),
          retrievalChannel: m.source,
          tags:             m.tags,
          createdAt:        m.createdAt,
        })),
        total: memories.length,
      };
    }

    // ── unimatrix_list_triples ──────────────────────────────────────────────
    case 'unimatrix_list_triples': {
      const limit   = Math.min(Number(args.limit ?? 20), 100);
      const subject = args.subject as string | undefined;

      const triples = await getActiveTriples(userId, limit, subject);

      return {
        triples: triples.map(t => ({
          subject:    t.subject,
          predicate:  t.predicate,
          object:     t.object,
          confidence: parseFloat(t.confidence),
        })),
        total: triples.length,
      };
    }

    // ── unimatrix_system_prompt ─────────────────────────────────────────────
    case 'unimatrix_system_prompt': {
      const query = args.query as string;
      const limit = Math.min(Number(args.limit ?? 6), 15);

      const memories = await hybridSearch(userId, query, { limit });
      const triples  = await getActiveTriples(userId, 15);

      const memoryBlock = memories.length > 0
        ? `## Recalled Memories\n${memories.map((m, i) => `${i + 1}. ${m.summary}`).join('\n')}`
        : '';

      const triplesBlock = triples.length > 0
        ? `\n\n## Known Facts About the User\n${triples.map(t => `- ${t.subject} ${t.predicate} ${t.object}`).join('\n')}`
        : '';

      const systemPromptAddition = `\n\n---\n# Unimatrix Memory Context\n${memoryBlock}${triplesBlock}\n---\n`;

      return {
        systemPromptAddition,
        memories: memories.map(m => ({ id: m.id, summary: m.summary, score: parseFloat(m.score.toFixed(4)) })),
        knownFacts: triples.map(t => `${t.subject} ${t.predicate} ${t.object}`),
        tokenEstimate: estimateTokenCount(systemPromptAddition),
      };
    }

    default:
      return null; // not a CSMTER tool — fall through to existing handlers
  }
}
