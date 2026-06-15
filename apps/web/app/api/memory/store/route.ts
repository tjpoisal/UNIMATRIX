/**
 * POST /api/memory/store
 *
 * REST store endpoint for non-MCP LLMs (ChatGPT, Gemini, Perplexity, etc.).
 *
 * Request body:
 *   { content: string, space_id?: string, tags?: string[], source_llm?: string, ttl_days?: number }
 *
 * Response:
 *   { success: true, memoryId: string }
 *
 * The CSMTER Librarian pipeline (embed → quantize → classify → triples) runs
 * fire-and-forget after the HTTP response is sent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest }       from '@/lib/api-auth';
import { prisma }                     from '@unimatrix/db';
import { processLibrarianJob }        from '@unimatrix/server/librarian/processJob';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.content) return NextResponse.json({ error: '"content" is required' }, { status: 400 });

  const {
    content,
    space_id,
    tags       = [],
    source_llm,
    ttl_days,
  } = body as {
    content:    string;
    space_id?:  string;
    tags?:      string[];
    source_llm?: string;
    ttl_days?:  number;
  };

  try {
    // Add source tag for non-MCP LLMs
    const finalTags = source_llm
      ? [...new Set([...tags, `llm-source:${source_llm}`])]
      : tags;

    // TTL: convert ttl_days to an expiry timestamp
    const expiresAt = ttl_days && ttl_days > 0
      ? new Date(Date.now() + ttl_days * 86_400_000)
      : null;

    // Insert episodic row (content is stored as encrypted bytes in production;
    // here we store as buffer via Prisma — encryption is handled by the middleware layer)
    const memory = await prisma.memory.create({
      data: {
        userId,
        spaceId:    space_id ?? null,
        content:    new Uint8Array(Buffer.from(content, 'utf8')),
        contentIv:  new Uint8Array(16), // placeholder IV — encryption layer overwrites this
        source:     'api',
        status:     'active',
      },
    });

    // Apply TTL if requested (expiresAt added in migration 006 — set via raw SQL
    // until Prisma client is regenerated to include the new column)
    if (expiresAt) {
      await prisma.$executeRaw`
        UPDATE memories SET expires_at = ${expiresAt} WHERE id = ${memory.id}::uuid
      `;
    }

    // Insert tags
    if (finalTags.length > 0) {
      await prisma.memoryTag.createMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: finalTags.map(tag => ({ memoryId: memory.id, tag })),
        skipDuplicates: true,
      });
    }

    // Fire-and-forget CSMTER Librarian pipeline (embed → quantize → classify → triples)
    setImmediate(() => {
      processLibrarianJob({
        memoryId:  memory.id,
        userId,
        content,
        spaceId:   space_id,
        sourceLlm: source_llm,
      }).catch(err => {
        console.error(`[/api/memory/store] Librarian job failed for ${memory.id}:`, err);
      });
    });

    return NextResponse.json({ success: true, memoryId: memory.id }, { status: 201 });
  } catch (err) {
    console.error('[/api/memory/store]', err);
    return NextResponse.json({ error: 'Store failed' }, { status: 500 });
  }
}
