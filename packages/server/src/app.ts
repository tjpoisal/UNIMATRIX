/**
 * src/app.ts
 *
 * Builds and configures the Fastify application without calling listen().
 * Imported by:
 *   - src/index.ts  → local dev / Render / Railway  (calls fastify.listen() on 0.0.0.0 + PORT)
 *   - api/index.ts  → legacy Vercel serverless only (deprecated post Render migration)
 */

import Fastify                           from 'fastify';
import rateLimit                         from '@fastify/rate-limit';
import { McpServer }                     from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type {
  ServerRequest,
  ServerNotification,
} from '@modelcontextprotocol/sdk/types.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

import { installRlsGuard }               from './middleware/rls-guard.js';
import { verifyUser }                    from './auth/verifyUser.js';
import { storeMemoryHandler }            from './handlers/storeMemory.js';
import { recallContextHandler }          from './handlers/recallContext.js';
import { searchMemoriesHandler }         from './handlers/searchMemories.js';
import { getTimelineHandler }            from './handlers/getTimeline.js';
import { supersedeMemoryHandler }        from './handlers/supersedeMemory.js';
import {
  createSpace,
  listSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
} from './handlers/spaces.js';
import { rememberHandler }      from './handlers/remember.js';
import { recallHandler }        from './handlers/recall.js';
import { getRecentHandler }     from './handlers/getRecent.js';
import { continueFromHandler }  from './handlers/continueFrom.js';
import { listContextsHandler }  from './handlers/listContexts.js';
import { clerkWebhookHandler }   from './webhooks/clerk.js';
import { handleOllamaWebhook }  from './integrations/ollama-integration.js';
import { processLibrarianJob }  from './librarian/processJob.js';
import type { LibrarianJob }    from './types/domain.js';

import {
  StoreMemoryInputSchema,
  RecallContextInputSchema,
  SearchMemoriesInputSchema,
  GetTimelineInputSchema,
  SupersedeMemoryInputSchema,
  RememberInputSchema,
  RecallInputSchema,
  GetRecentInputSchema,
  ContinueFromInputSchema,
  ListContextsInputSchema,
  type StoreMemoryInput,
  type RecallContextInput,
  type SearchMemoriesInput,
  type GetTimelineInput,
  type SupersedeMemoryInput,
  type RememberInput,
  type RecallInput,
  type GetRecentInput,
  type ContinueFromInput,
  type ListContextsInput,
} from './types/mcp.js';

// RLS guard — module-level, only runs once per process/container
installRlsGuard();

// ---------------------------------------------------------------------------
// Internal API secret — shared secret authenticating server-to-server calls
// from the web app (apps/web) to this MCP server's /internal/* routes.
// Required in production; falls back to a dev value otherwise.
// ---------------------------------------------------------------------------

function internalApiSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('INTERNAL_API_SECRET is required in production');
  }
  return 'dev-internal-secret';
}

/** Extracts the Bearer token from an Authorization header value. */
function bearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Adapter — bridges MCP SDK (args, extra) → internal (input, userId)
// ---------------------------------------------------------------------------

function adapt<TInput>(
  handler: (input: TInput, userId: string) => Promise<unknown>,
) {
  return async (args: TInput, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
    const headers = ((extra as any).requestInfo?.headers ?? {}) as Record<string, string>;
    const { userId } = await verifyUser(headers);
    const result = await handler(args, userId);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result) }],
    };
  };
}

// ---------------------------------------------------------------------------
// Factory — new McpServer per request (stateless HTTP requirement)
// ---------------------------------------------------------------------------

function createMcpServer(): McpServer {
  const mcp = new McpServer({ name: 'Unimatrix', version: '0.1.0' });

  mcp.tool(
    'store_memory',
    'Store content into your Memory Palace. The Librarian will classify and index it asynchronously.',
    StoreMemoryInputSchema.shape,
    adapt<StoreMemoryInput>(storeMemoryHandler),
  );

  mcp.tool(
    'recall_context',
    'Return to Context (RTX): retrieve the most relevant memories for the current session. Call this when a session opens.',
    RecallContextInputSchema.shape,
    adapt<RecallContextInput>(recallContextHandler),
  );

  mcp.tool(
    'search_memories',
    'Explicit semantic + full-text search across your Memory Palace. Use when you have a specific question to answer.',
    SearchMemoriesInputSchema.shape,
    adapt<SearchMemoriesInput>(searchMemoriesHandler),
  );

  mcp.tool(
    'get_timeline',
    'Retrieve the full chronological history of memories, including verbatim decrypted content.',
    GetTimelineInputSchema.shape,
    adapt<GetTimelineInput>(getTimelineHandler),
  );

  mcp.tool(
    'supersede_memory',
    'Mark an existing memory as outdated. Optionally provide replacement content linked via superseded_by.',
    SupersedeMemoryInputSchema.shape,
    adapt<SupersedeMemoryInput>(supersedeMemoryHandler),
  );

  // ── User-facing tools (canonical names for cross-LLM use) ────────────────

  mcp.tool(
    'remember',
    'Store something from the current conversation into Unimatrix. Works across all LLMs — Claude, ChatGPT, Gemini, Ollama, etc.',
    RememberInputSchema.shape,
    adapt<RememberInput>(rememberHandler),
  );

  mcp.tool(
    'recall',
    'Search across ALL your memories from ALL LLMs and devices. Use this to find what was discussed in previous conversations, even with a different AI.',
    RecallInputSchema.shape,
    adapt<RecallInput>(recallHandler),
  );

  mcp.tool(
    'get_recent',
    'Get the last N memories in chronological order, regardless of which LLM wrote them. Use this at session start to continue from where any AI left off.',
    GetRecentInputSchema.shape,
    adapt<GetRecentInput>(getRecentHandler),
  );

  mcp.tool(
    'continue_from',
    'Retrieve full context from a prior session (by session_id/context) or the most recent history across all contexts. The primary cross-LLM handoff tool.',
    ContinueFromInputSchema.shape,
    adapt<ContinueFromInput>(continueFromHandler),
  );

  mcp.tool(
    'list_contexts',
    'List all your memory workspaces/contexts. Use before recall() or continue_from() to understand what memory spaces are available.',
    ListContextsInputSchema.shape,
    adapt<ListContextsInput>(listContextsHandler),
  );

  return mcp;
}

// ---------------------------------------------------------------------------
// Build app — configures Fastify without listening
// ---------------------------------------------------------------------------

export function buildApp() {
  const fastify = Fastify({ logger: true });

  // Rate limiting — 60 req/min per IP
  fastify.register(rateLimit, {
    max:        60,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error:   'Too Many Requests',
      message: 'Rate limit exceeded — 60 requests per minute per IP',
    }),
  });

  // Raw body capture — required for Svix HMAC verification
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer', bodyLimit: 1_048_576 },
    function (_req, body, done) {
      (_req as any).rawBody = body;
      try {
        done(null, JSON.parse(body.toString('utf8')));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // ── MCP endpoint ─────────────────────────────────────────────────────────
  fastify.post('/mcp', async (request, reply) => {
    const mcp       = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    reply.raw.on('close', () => {
      transport.close().catch(() => {});
      mcp.close().catch(() => {});
    });

    await mcp.connect(transport);
    await transport.handleRequest(request.raw, reply.raw, request.body);
  });

  // ── Health check ──────────────────────────────────────────────────────────
  fastify.get('/health', async () => ({ status: 'ok', version: '0.1.0' }));

  // ── Clerk webhook ─────────────────────────────────────────────────────────
  fastify.post('/webhooks/clerk', clerkWebhookHandler);

  // ── Spaces REST API ───────────────────────────────────────────────────────
  fastify.post('/spaces',       createSpace);
  fastify.get('/spaces',        listSpaces);
  fastify.get('/spaces/:id',    getSpace);
  fastify.patch('/spaces/:id',  updateSpace);
  fastify.delete('/spaces/:id', deleteSpace);

  // ── Ollama integration webhook ────────────────────────────────────────────
  // POST /api/integrations/ollama/webhook
  // Body: { mcpToken: string, response: string, model: string, ... }
  // Authenticated via MCP token (umx_... format) in the JSON body.
  fastify.post('/api/integrations/ollama/webhook', async (request, reply) => {
    const body = request.body as any;
    if (!body?.mcpToken) {
      return reply.code(401).send({ error: 'mcpToken required' });
    }
    const payload = {
      model:      body.model      ?? 'unknown',
      created_at: body.created_at ?? new Date().toISOString(),
      response:   body.response   ?? body.content ?? '',
      done:       body.done       ?? true,
      eval_count: body.eval_count,
      eval_duration: body.eval_duration,
    };
    const result = await handleOllamaWebhook(payload, {
      mcpToken: body.mcpToken,
      hint:     body.hint,
    });
    return reply.code(result.success ? 200 : 400).send(result);
  });

  // ── Internal Librarian processing ─────────────────────────────────────────
  // Server-to-server endpoint used by apps/web to hand off the CSMTER Librarian
  // pipeline (embed → quantize → classify → triples) to the MCP server, which
  // owns the librarian implementation. Authenticated via INTERNAL_API_SECRET.
  //
  // Accepts either shape:
  //   { job: LibrarianJob }                                  (explicit envelope)
  //   { memoryId, userId, content, spaceId?, sourceLlm? }    (flat — REST store)
  //
  // Fire-and-forget: responds 202 immediately and processes in the background.
  const librarianRoute = async (request: any, reply: any) => {
    const token = bearerToken(request.headers['authorization']);
    if (!token || token !== internalApiSecret()) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const body = (request.body ?? {}) as Record<string, unknown>;
    const raw  = (body.job ?? body) as Partial<LibrarianJob>;

    if (!raw.memoryId || !raw.userId || typeof raw.content !== 'string') {
      return reply
        .code(400)
        .send({ error: 'memoryId, userId, and content are required' });
    }

    const job: LibrarianJob = {
      memoryId:  raw.memoryId,
      userId:    raw.userId,
      content:   raw.content,
      hint:      raw.hint      ?? null,
      spaceId:   raw.spaceId   ?? null,
      sourceLlm: raw.sourceLlm,
      createdAt: raw.createdAt ?? new Date(),
    };

    // Fire-and-forget — never block the response on the pipeline.
    processLibrarianJob(job).catch((err) => {
      request.log.error({ err, memoryId: job.memoryId }, '[Librarian] job failed');
    });

    return reply.code(202).send({ ok: true });
  };

  fastify.post('/internal/librarian',    librarianRoute);
  fastify.post('/api/librarian/process', librarianRoute);

  return fastify;
}
