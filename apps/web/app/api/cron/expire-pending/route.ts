/**
 * Vercel Cron: Expire old pending HITL actions
 */

import { NextResponse } from 'next/server';
import { expireOldPendingActions } from '@/lib/telemetry/agent-usage';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expired = await expireOldPendingActions();
  return NextResponse.json({ expired });
}
