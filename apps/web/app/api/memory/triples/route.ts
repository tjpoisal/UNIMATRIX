/**
 * GET /api/memory/triples
 *
 * List active semantic triples extracted by the CSMTER Librarian.
 * Returns subject-predicate-object facts about the user.
 *
 * Query params:
 *   - limit: number (default 20, max 100)
 *   - subject: string (filter by subject — typically userId for user facts)
 *
 * Use these for zero-vector-cost personalization: inject them directly
 * into your system prompt instead of running a vector search.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest }       from '@/lib/api-auth';
import { pool }                       from '@/lib/db';

interface TripleRow {
  id:           string;
  subject:      string;
  predicate:    string;
  object:       string;
  confidence:   string;
  source_llm:   string | null;
  valid_from:   Date;
  created_at:   Date;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit   = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const subject = searchParams.get('subject') ?? null;

  const client = await pool.connect();
  try {
    await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);

    const subjectFilter = subject ? `AND subject = $2` : '';
    const params: unknown[] = subject ? [userId, subject, limit] : [userId, limit];

    const res = await client.query<TripleRow>(
      `SELECT id, subject, predicate, object, confidence, source_llm, valid_from, created_at
         FROM memory_triples
        WHERE user_id = $1::uuid
          AND superseded_at IS NULL
          ${subjectFilter}
        ORDER BY confidence DESC, created_at DESC
        LIMIT $${params.length}`,
      params,
    );

    const triples = res.rows.map(r => ({
      id:         r.id,
      subject:    r.subject,
      predicate:  r.predicate,
      object:     r.object,
      confidence: parseFloat(r.confidence),
      sourceLlm:  r.source_llm,
      validFrom:  r.valid_from,
      createdAt:  r.created_at,
    }));

    return NextResponse.json({
      triples,
      total: triples.length,
      // Convenience: formatted as plain text for direct system-prompt injection
      asText: triples.map(t => `${t.subject} ${t.predicate} ${t.object}`).join('\n'),
    });
  } catch (err) {
    console.error('[/api/memory/triples]', err);
    return NextResponse.json({ error: 'Failed to fetch triples' }, { status: 500 });
  } finally {
    client.release();
  }
}
