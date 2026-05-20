/**
 * api/index.ts
 *
 * Vercel serverless entry point for the Unimatrix MCP Server.
 *
 * Vercel compiles this file via @vercel/node (esbuild) and serves it as a
 * Node.js Lambda. The Fastify app is initialised once per container (cold
 * start) and reused across warm invocations via module-level caching.
 *
 * KEY: Fastify's .ready() returns (FastifyInstance & PromiseLike<...>),
 * NOT a full Promise (missing .catch / .finally / [Symbol.toStringTag]).
 * Wrapping in Promise.resolve() converts the thenable to a real Promise.
 *
 * All traffic is routed here via the root vercel.json rewrites rule.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../src/app.js';

// ── Singleton — one Fastify instance per Lambda container ─────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ready: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getApp(): Promise<any> {
  if (!_ready) {
    // Promise.resolve() wraps Fastify's PromiseLike into a real Promise
    _ready = Promise.resolve(buildApp().ready());
  }
  return _ready;
}

// ── Handler ───────────────────────────────────────────────────────────────

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const app = await getApp();
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('[unimatrix] handler error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
}
