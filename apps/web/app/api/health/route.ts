import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Render (and other platforms).
 * Used by load balancers and monitoring.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'unimatrix-web',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
    },
    { status: 200 }
  );
}
