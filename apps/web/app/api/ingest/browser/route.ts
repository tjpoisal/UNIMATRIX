/**
 * POST /api/ingest/browser
 *
 * Receives conversation turns captured by the Unimatrix browser extension
 * from consumer AI apps that don't support MCP:
 *   - Perplexity (perplexity.ai)
 *   - Gemini app (gemini.google.com)
 *   - Microsoft Copilot (copilot.microsoft.com)
 *   - Meta AI (meta.ai)
 *   - Grok consumer (grok.x.ai)
 *   - Poe (poe.com)
 *   - You.com (you.com)
 *   - Phind (phind.com)
 *   - Le Chat / Mistral consumer (chat.mistral.ai)
 *   - Pi / Inflection (heypi.com)
 *   - Any other chat UI the extension is configured for
 *
 * Auth: Bearer token (MCP token or session JWT — same as the MCP server).
 * The extension sends the user's Unimatrix API key, obtained during onboarding.
 *
 * Body:
 * {
 *   source: 'perplexity' | 'gemini-app' | 'copilot' | ...,
 *   model: string,           // best-effort model name from the UI, or 'unknown'
 *   userMessage: string,
 *   assistantMessage: string,
 *   url: string,             // page URL for deduplication
 *   capturedAt: string,      // ISO timestamp from the browser
 *   sessionId?: string,      // optional conversation thread ID
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMcpToken } from '@/lib/mcp-bridge';

const ALLOWED_BROWSER_SOURCES = [
  'perplexity', 'gemini-app', 'copilot', 'meta-ai',
  'grok-consumer', 'poe', 'youcom', 'phind', 'lechat', 'pi',
];

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const userId = await verifyMcpToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { source, model, userMessage, assistantMessage, url, capturedAt, sessionId } = body;

  if (!source || !ALLOWED_BROWSER_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: `source must be one of: ${ALLOWED_BROWSER_SOURCES.join(', ')}` },
      { status: 400 },
    );
  }
  if (!userMessage?.trim() || !assistantMessage?.trim()) {
    return NextResponse.json({ error: 'userMessage and assistantMessage are required' }, { status: 400 });
  }

  // ── Deduplication — skip if same URL + userMessage already ingested ─────────
  const dedupeTag = `browser-ingest:${source}:${Buffer.from((url ?? '') + userMessage).toString('base64').slice(0, 32)}`;
  const existing = await prisma.memory.findFirst({
    where: { tags: { has: dedupeTag }, location: { palace: { userId } } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ status: 'duplicate', id: existing.id });
  }

  // ── Find or create the LLM History location ─────────────────────────────────
  const palaceName = 'LLM Histories';
  const locationName = `${source.charAt(0).toUpperCase() + source.slice(1)} History`;

  let palace = await prisma.palace.findFirst({
    where: { userId, name: palaceName, deletedAt: null },
  });
  if (!palace) {
    palace = await prisma.palace.create({
      data: { userId, name: palaceName, description: 'Auto-organized conversation histories from all connected LLMs and browser-captured apps.' },
    });
  }

  let location = await prisma.location.findFirst({
    where: { palaceId: palace.id, name: locationName },
  });
  if (!location) {
    location = await prisma.location.create({
      data: {
        palaceId: palace.id,
        name: locationName,
        description: `Conversations captured from ${source} via the Unimatrix browser extension.`,
        position: 0,
      },
    });
  }

  // ── Store the conversation turn as a memory ──────────────────────────────────
  const content = `[${source}${model && model !== 'unknown' ? ` / ${model}` : ''}]
User: ${userMessage.trim()}
Assistant: ${assistantMessage.trim()}`;

  const memory = await prisma.memory.create({
    data: {
      locationId: location.id,
      content,
      tags: [
        'browser-capture',
        source,
        model ?? 'unknown',
        dedupeTag,
        ...(sessionId ? [`session:${sessionId}`] : []),
      ],
      // capturedAt from browser is stored in metadata via importance/tags
      // Full timestamp available in createdAt
    },
  });

  // ── Enqueue Librarian job (embedding + compression + triple extraction) ───────
  // The Librarian worker picks this up via the job queue (Upstash/BullMQ)
  // Same pipeline as MCP-originated memories — fully symmetric.
  try {
    const { enqueueLibrarianJob } = await import('@/lib/librarian-queue');
    await enqueueLibrarianJob({ memoryId: memory.id, userId, source });
  } catch (e) {
    // Non-fatal — memory is saved, embedding happens async
    console.warn('[ingest/browser] Failed to enqueue Librarian job:', e);
  }

  return NextResponse.json({ status: 'ingested', id: memory.id }, { status: 201 });
}
