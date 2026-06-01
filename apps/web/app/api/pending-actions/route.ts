/**
 * GET /api/pending-actions
 * Polling endpoint for Human-in-the-Loop approvals.
 *
 * Query params:
 *   room_id (required)
 *   status  (optional, default: pending)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { getPendingActions } from '@/lib/telemetry/agent-usage';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const roomId = searchParams.get('room_id');
  const status = searchParams.get('status') || 'pending';

  if (!roomId) {
    return NextResponse.json({ error: 'room_id query parameter is required' }, { status: 400 });
  }

  try {
    const actions = await getPendingActions(roomId, status);
    return NextResponse.json({ actions });
  } catch (error) {
    console.error('[pending-actions] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending actions' }, { status: 500 });
  }
}
