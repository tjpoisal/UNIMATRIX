
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fastify } from '../src/app';   // ← your singleton Fastify instance

// Ensure Fastify is fully ready (plugins, routes, etc.)
const fastifyReadyPromise = fastify.ready();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    await fastifyReadyPromise;           // Wait for Fastify to initialize

    // Emit the request to the Fastify server
    fastify.server.emit('request', req, res);
  } catch (error) {
    console.error('Fastify handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}