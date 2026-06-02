/**
 * src/index.ts
 *
 * Local dev + Render (or Railway/Fly) entry point.
 * Imports the configured Fastify app from src/app.ts and calls listen() on 0.0.0.0:PORT.
 *
 * Legacy: For old Vercel serverless, see packages/server/api/index.ts (marked deprecated with Render migration).
 */

import { buildApp }  from './app.js';
import { closePool } from './db/client.js';

const fastify = buildApp();

const start = async () => {
  try {
    const port = parseInt(process.env.PORT ?? '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`[Unimatrix] MCP Server running on http://localhost:${port}/mcp`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown — drains in-flight requests, closes pg pool, then exits.
const shutdown = async (signal: string) => {
  console.log(`[shutdown] ${signal} received — closing server and pool`);
  await fastify.close();
  await closePool();
  console.log('[shutdown] clean exit');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
