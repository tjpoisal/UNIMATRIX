import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/api-auth';
import {
  generateMcpTokenForUser,
  listMcpTokensForUser,
  revokeMcpToken,
} from '@/lib/mcp-bridge';

/**
 * MCP Token management for the Core Server.
 * These tokens are for use with the production MCP endpoint (unimatrix-mcp on Render).
 *
 * POST /api/mcp-tokens          → create new token (returns raw token once)
 * GET  /api/mcp-tokens          → list user's tokens (no secrets)
 * DELETE /api/mcp-tokens/:id    → revoke
 */

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  // Also support session cookie for browser calls from dashboard
  // For simplicity in this bridge, we also accept a userId in body for demo (remove in prod)
  let effectiveUserId = userId;

  if (!effectiveUserId) {
    const body = await req.json().catch(() => ({} as any));
    effectiveUserId = body.userId; // only for testing; secure this
  }

  if (!effectiveUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const scope = body.scope || 'full';
    const expiresInDays = body.expiresInDays ?? 365;

    const tokenData = await generateMcpTokenForUser(
      effectiveUserId,
      scope,
      expiresInDays
    );

    return NextResponse.json({
      ...tokenData,
      note: 'Store this token securely. It will not be shown again.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate token' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokens = await listMcpTokensForUser(userId);
  return NextResponse.json({ tokens });
}

// DELETE /api/mcp-tokens?id=xxx  or support body, simple revoke
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await revokeMcpToken(id, userId);
  return new NextResponse(null, { status: 204 });
}
