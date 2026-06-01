/**
 * Vercel Cron Job: Reset daily spend for all AgentConfigs
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/reset-spend",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Security: Only allow Vercel Cron or internal calls with secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Reset all agents whose last reset was before today (UTC)
    const result = await prisma.agentConfig.updateMany({
      where: {
        last_spend_reset: {
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
      data: {
        current_spend: 0,
        last_spend_reset: now,
      },
    });

    console.log(`[cron] Reset daily spend for ${result.count} agent configs`);

    return NextResponse.json({
      success: true,
      resetCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[cron/reset-spend] Error:', error);
    return NextResponse.json({ error: 'Failed to reset spend' }, { status: 500 });
  }
}
