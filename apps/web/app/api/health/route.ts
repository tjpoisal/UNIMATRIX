import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint for Render (and other platforms).
 * Used by load balancers and monitoring.
 */
export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return NextResponse.json(
    {
      status: 'ok',
      db: dbOk ? 'connected' : 'error',
      ts: Date.now(),
    },
    { status: dbOk ? 200 : 503 }
  );
}
