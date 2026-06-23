/**
 * Unimatrix MCP HTTP Endpoint (serverless-friendly)
 * POST /api/mcp  — handles all MCP tool calls over HTTP+JSON
 * GET  /api/mcp  — returns server info (for discovery)
 *
 * This route handler version runs on Vercel (or any Next.js deployment).
 * For the full persistent dedicated MCP server, see packages/server (Fastify)
 * and the custom server.ts + worker setup (recommended for Collab Room + always-on).
 *
 * Authentication: Bearer <umx_...> API key in Authorization header
 * Used by Claude Desktop, Claude Code, Cursor, and any MCP client
 * that supports the streamable-http transport.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Extend NextRequest for internal org context passing (from API key auth to MCP handlers)
declare module "next/server" {
  interface NextRequest {
    _unimatrixOrgId?: string | null;
  }
}

// ─── API key auth ─────────────────────────────────────────────────────────────

async function resolveUser(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer umx_")) return null;
  const raw = auth.slice(7); // strip "Bearer "

  // Prefix is first 12 chars ("umx_" + 8 hex chars)
  const prefix = raw.slice(0, 12);
  const keys = await prisma.apiKey.findMany({
    where: { keyPrefix: prefix, revokedAt: null },
    select: { id: true, userId: true, keyHash: true, organizationId: true },
  });

  for (const k of keys) {
    const match = await bcrypt.compare(raw, k.keyHash);
    if (match) {
      // Update last-used timestamp async (don't await)
      prisma.apiKey.update({ where: { id: k.id }, data: { lastUsed: new Date() } }).catch(() => {});
      // Attach org to request for downstream (tools/call path)
      req._unimatrixOrgId = k.organizationId;
      return k.userId;
    }
  }
  return null;
}

// ─── MCP protocol helpers ─────────────────────────────────────────────────────

type McpRequest = {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
};

function ok(id: string | number, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { status: 200 });
}

function err(id: string | number | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 });
}

function textContent(text: string) {
  return { content: [{ type: "text", text }] };
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const TOOLS = [
  {
    name: "unimatrix_list_palaces",
    description: "List all memory palaces owned by the authenticated user.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "unimatrix_get_palace",
    description: "Retrieve a memory palace by ID with all locations and memories.",
    inputSchema: {
      type: "object",
      properties: { palace_id: { type: "string", description: "Palace ID" } },
      required: ["palace_id"],
    },
  },
  {
    name: "unimatrix_search_memories",
    description: "Full-text search across all memories, optionally scoped to a palace.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        palace_id: { type: "string", description: "Optional palace ID to restrict search" },
        limit: { type: "number", description: "Max results (default 20, max 50)" },
      },
      required: ["query"],
    },
  },
  {
    name: "unimatrix_store_memory",
    description: "Store a new memory in a specific location (or auto-resolve per-LLM history loc).\n\nCRITICAL — NON-MCP LLMs (Gemini, ChatGPT, Grok, custom agents, any LLM using POST /api/tools or POST /api/tools/call REST surface instead of native MCP):\n- Pass sourceLlm at the TOP LEVEL of your /api/tools/call request body (sibling to \"toolName\" and \"args\"), e.g. { \"toolName\": \"unimatrix_store_memory\", \"args\": { \"content\": \"...\" }, \"sourceLlm\": \"gemini\" }\n- Do NOT put sourceLlm inside args.\n- This auto-tags the memory with 'llm-source:gemini' and (when location_id omitted) auto-files it into the 'Gemini History' location under your 'LLM Histories' palace.\n- The palace + per-LLM locations are auto-provisioned the moment you connect the provider key in Unimatrix onboarding/web settings.\n- To discover: first call unimatrix_list_palaces (or get_palace on 'LLM Histories').\n\nCopy-paste this as a system instruction to your LLM:\n'You are Gemini (or the current model). Unimatrix provides long-term memory via tools. For ANY call you make to unimatrix_store_memory (or remember) using the REST endpoint POST /api/tools/call, you MUST include at the ROOT of the JSON body (NOT inside the args object): \"sourceLlm\": \"gemini\". Example payload: {\"toolName\":\"unimatrix_store_memory\",\"args\":{\"content\":\"key fact here\"},\"sourceLlm\":\"gemini\"}. This ensures every conversation turn with me is automatically organized into my Gemini History bucket for perfect recall. Always do this for store/remember calls. Use search_memories with good queries to recall.'\n\nFor standard MCP clients the location_id is usually provided explicitly after listing palaces.",
    inputSchema: {
      type: "object",
      properties: {
        location_id: { type: "string", description: "Location ID. Optional for non-MCP: if omitted and sourceLlm provided at the top level of the /api/tools/call body, server auto-resolves to the matching per-LLM 'XXX History' location (recommended for Gemini/ChatGPT/etc)." },
        content: { type: "string", description: "Memory content (markdown supported)" },
        tags: { type: "array", items: { type: "string" }, description: "Optional tags" },
      },
      required: ["content"],
    },
  },
  {
    name: "unimatrix_list_memories",
    description: "List all memories at a specific location.",
    inputSchema: {
      type: "object",
      properties: {
        location_id: { type: "string" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
      required: ["location_id"],
    },
  },
  {
    name: "unimatrix_create_palace",
    description: "Create a new memory palace.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        is_public: { type: "boolean" },
      },
      required: ["name"],
    },
  },
  {
    name: "unimatrix_create_location",
    description: "Create a location (room) inside a memory palace.",
    inputSchema: {
      type: "object",
      properties: {
        palace_id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        parent_id: { type: "string" },
        position: { type: "number" },
      },
      required: ["palace_id", "name"],
    },
  },
  {
    name: "unimatrix_update_memory",
    description: "Update the content or tags of an existing memory.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "string" },
        content: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "unimatrix_get_recent",
    description: "Get the most recently accessed or created memories across all palaces.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results (default 10, max 50)" },
      },
      required: [],
    },
  },
];

// ─── Tool handlers ────────────────────────────────────────────────────────────

export async function handleTool(
  name: string,
  args: Record<string, unknown>,
  userId: string
): Promise<string> {
  switch (name) {
    // ── list_palaces ────────────────────────────────────────────────────────
    case "unimatrix_list_palaces": {
      const palaces = await prisma.palace.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, description: true, isPublic: true, createdAt: true, updatedAt: true },
      });
      if (!palaces.length) return "You have no memory palaces yet. Create one with unimatrix_create_palace.";
      return palaces.map((p: { id: string; name: string; description?: string; isPublic: boolean; createdAt: string | Date }) =>
        `## ${p.name}\n- ID: \`${p.id}\`\n${p.description ? `- ${p.description}\n` : ""}- ${p.isPublic ? "Public" : "Private"} · Created ${new Date(p.createdAt).toLocaleDateString()}`
      ).join("\n\n");
    }

    // ── get_palace ──────────────────────────────────────────────────────────
    case "unimatrix_get_palace": {
      const palaceId = args.palace_id as string;
      const palace = await prisma.palace.findFirst({
        where: { id: palaceId, userId, deletedAt: null },
        include: {
          locations: {
            where: { deletedAt: null, parentId: null },
            orderBy: { position: "asc" },
            include: {
              memories: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 50 },
              children: {
                where: { deletedAt: null },
                orderBy: { position: "asc" },
                include: { memories: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 50 } },
              },
            },
          },
        },
      });
      if (!palace) return "Palace not found or access denied.";

      const renderMems = (memories: { id: string; content: string; tags: string[] }[], indent = "") =>
        memories.map(m => `${indent}- \`${m.id}\`: ${m.content.slice(0, 200)}${m.content.length > 200 ? "…" : ""}${m.tags.length ? ` [${m.tags.join(", ")}]` : ""}`).join("\n");

      const lines = [`# ${palace.name}`, palace.description ? `> ${palace.description}` : "", `**ID**: \`${palace.id}\`\n`];
      for (const loc of palace.locations) {
        lines.push(`### ${loc.name} (\`${loc.id}\`)`);
        if (loc.memories.length) lines.push(renderMems(loc.memories, "  "));
        for (const child of loc.children) {
          lines.push(`  #### ${child.name} (\`${child.id}\`)`);
          if (child.memories.length) lines.push(renderMems(child.memories, "    "));
        }
      }
      return lines.join("\n");
    }

    // ── search_memories ─────────────────────────────────────────────────────
    case "unimatrix_search_memories": {
      const query = args.query as string;
      const limit = Math.min(Number(args.limit ?? 20), 50);
      const palaceFilter = args.palace_id ? { palace: { id: args.palace_id as string } } : {};

      const memories = await prisma.memory.findMany({
        where: {
          deletedAt: null,
          location: { ...palaceFilter, palace: { userId } },
          OR: [
            { content: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { location: { include: { palace: { select: { id: true, name: true } } } } },
      });

      if (!memories.length) return `No memories found for "${query}".`;
      return memories.map((m: { id: string; content: string; tags: string[]; location: { name: string; palace: { name: string } } }) =>
        `## ${m.location.palace.name} › ${m.location.name}\n**ID**: \`${m.id}\`\n${m.content}\n${m.tags.length ? `Tags: ${m.tags.join(", ")}` : ""}`
      ).join("\n\n---\n\n");
    }

    // ── store_memory ─────────────────────────────────────────────────────────
    case "unimatrix_store_memory": {
      let locationId = args.location_id as string | undefined;
      const content = args.content as string;
      let tags = (args.tags as string[]) ?? [];

      // Support sourceLlm at args root (injected by /api/tools/call for non-MCP LLMs, or passed in MCP args)
      const sourceLlm = (args.sourceLlm as string) || (args.source_llm as string) || (args["sourceLlm"] as string);
      if (sourceLlm && typeof sourceLlm === "string") {
        const llmTag = `llm-source:${sourceLlm}`;
        if (!tags.includes(llmTag)) tags = [...tags, llmTag];
      }

      // Auto-resolve to per-LLM history location if location_id omitted but sourceLlm present.
      // This makes non-MCP LLMs (after connecting in onboarding) "just work" for auto-organized history
      // without needing to discover + specify the exact location ID every time.
      if (!locationId && sourceLlm && typeof sourceLlm === "string") {
        try {
          const cap = sourceLlm.charAt(0).toUpperCase() + sourceLlm.slice(1);
          const locName = `${cap} History`;
          const historiesPalace = await prisma.palace.findFirst({
            where: { userId, name: "LLM Histories", deletedAt: null },
          });
          if (historiesPalace) {
            const histLoc = await prisma.location.findFirst({
              where: { palaceId: historiesPalace.id, name: locName, deletedAt: null },
            });
            if (histLoc) {
              locationId = histLoc.id;
            }
          }
          // Also check inside "Mobile" palace (created by mobile installer auto-magic) for device context
          if (!locationId) {
            const mobilePalace = await prisma.palace.findFirst({
              where: { userId, name: "Mobile", deletedAt: null },
            });
            if (mobilePalace) {
              const mobileHist = await prisma.location.findFirst({
                where: { palaceId: mobilePalace.id, name: locName, deletedAt: null },
              });
              if (mobileHist) locationId = mobileHist.id;
            }
          }
        } catch (e) {
          console.warn("[store_memory] auto-resolve history loc failed:", e);
        }
      }

      if (!locationId) {
        return "location_id is required (or pass sourceLlm at call root for auto-resolve to your per-LLM History location). Get IDs via unimatrix_list_palaces + unimatrix_get_palace.";
      }

      // Verify location belongs to user
      const location = await prisma.location.findFirst({
        where: { id: locationId, palace: { userId }, deletedAt: null },
        select: { id: true },
      });
      if (!location) return "Location not found or access denied.";

      const contentBytes = new Uint8Array(Buffer.from(content, 'utf8'));
      const memory = await prisma.memory.create({
        data: {
          locationId,
          content: contentBytes,
          contentIv: new Uint8Array(16),
          source: 'api',
          status: 'active',
        },
      });

      if (tags && Array.isArray(tags) && tags.length > 0) {
        await prisma.memoryTag.createMany({
          data: tags.map((t: string) => ({ memoryId: memory.id, tag: t })),
          skipDuplicates: true,
        });
      }

      const decoded = Buffer.from(memory.content as Buffer).toString('utf8');
      return `Memory stored. ID: \`${memory.id}\`\n\nContent: ${decoded}${sourceLlm ? ` (auto-filed for ${sourceLlm})` : ""}`;
    }

    // ── list_memories ─────────────────────────────────────────────────────────
    case "unimatrix_list_memories": {
      const locationId = args.location_id as string;
      const limit = Math.min(Number(args.limit ?? 50), 100);
      const offset = Number(args.offset ?? 0);

      const location = await prisma.location.findFirst({
        where: { id: locationId, palace: { userId }, deletedAt: null },
        select: { id: true, name: true },
      });
      if (!location) return "Location not found or access denied.";

      const [memories, total] = await Promise.all([
        prisma.memory.findMany({
          where: { locationId, deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.memory.count({ where: { locationId, deletedAt: null } }),
      ]);

  if (!memories.length) return "No memories at this location.";
      const lines = [`# ${location.name} — ${total} memories (showing ${memories.length})\n`];
      for (const m of memories) {
        lines.push(`**\`${m.id}\`**: ${m.content}`);
        if (m.tags.length) lines.push(`Tags: ${m.tags.join(", ")}`);
        lines.push(`_${new Date(m.createdAt).toLocaleDateString()}_\n`);
      }
      return lines.join("\n");
    }

    // ── create_palace ─────────────────────────────────────────────────────────
    case "unimatrix_create_palace": {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
      if (user?.tier === "free") {
        const count = await prisma.palace.count({ where: { userId, deletedAt: null } });
        if (count >= 3) return "Free tier is limited to 3 palaces. Upgrade to Pro at deployunimatrix.com/pricing.";
      }
      const palace = await prisma.palace.create({
        data: { userId, name: args.name as string, description: (args.description as string) ?? null, isPublic: (args.is_public as boolean) ?? false },
      });
      return `Palace created: **${palace.name}** (\`${palace.id}\`)\nUse unimatrix_create_location to add rooms.`;
    }

    // ── create_location ───────────────────────────────────────────────────────
    case "unimatrix_create_location": {
      const palace = await prisma.palace.findFirst({
        where: { id: args.palace_id as string, userId, deletedAt: null },
        select: { id: true },
      });
      if (!palace) return "Palace not found or access denied.";

      const location = await prisma.location.create({
        data: {
          palaceId: palace.id,
          name: args.name as string,
          description: (args.description as string) ?? null,
          parentId: (args.parent_id as string) ?? null,
          position: Number(args.position ?? 0),
        },
      });
      return `Location created: **${location.name}** (\`${location.id}\`)\nStore memories with location_id: "${location.id}"`;
    }

    // ── update_memory ─────────────────────────────────────────────────────────
    case "unimatrix_update_memory": {
      const memoryId = args.memory_id as string;
      const memory = await prisma.memory.findFirst({
        where: { id: memoryId, location: { palace: { userId } }, deletedAt: null },
        select: { id: true },
      });
      if (!memory) return "Memory not found or access denied.";

      const updated = await prisma.memory.update({
        where: { id: memoryId },
        data: {
          ...(args.content ? { content: args.content as string } : {}),
          ...(args.tags ? { tags: args.tags as string[] } : {}),
        },
      });
      return `Memory updated. ID: \`${updated.id}\`\n${updated.content}`;
    }

    // ── get_recent ────────────────────────────────────────────────────────────
    case "unimatrix_get_recent": {
      const limit = Math.min(Number(args.limit ?? 10), 50);
      const memories = await prisma.memory.findMany({
        where: { deletedAt: null, location: { palace: { userId } } },
        orderBy: { lastAccessed: "desc" },
        take: limit,
        include: { location: { include: { palace: { select: { id: true, name: true } } } } },
      });
      if (!memories.length) return "No memories found.";
      return memories.map((m: { id: string; content: string; lastAccessed: string | Date; location: { name: string; palace: { name: string } } }) =>
        `**${m.location.palace.name} › ${m.location.name}** (\`${m.id}\`)\n${m.content.slice(0, 300)}${m.content.length > 300 ? "…" : ""}\n_${new Date(m.lastAccessed).toLocaleDateString()}_`
      ).join("\n\n---\n\n");
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    name: "unimatrix-mcp-server",
    version: "1.0.0",
    description: "Unimatrix memory palace MCP endpoint",
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
  });
}

export async function POST(req: NextRequest) {
  // Auth
  const userId = await resolveUser(req);
  if (!userId) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Unauthorized — invalid or missing API key." } },
      { status: 401 }
    );
  }

  let body: McpRequest;
  try {
    body = await req.json();
  } catch {
    return err(null as unknown as number, -32700, "Parse error");
  }

  const { id, method, params } = body;

  // ── initialize ──────────────────────────────────────────────────────────────
  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "unimatrix-mcp-server", version: "1.0.0" },
    });
  }

  // ── tools/list ──────────────────────────────────────────────────────────────
  if (method === "tools/list") {
    // Use central registry so collab tools appear automatically
    const { getAllTools } = await import("@/lib/tools/registry");
    const tools = getAllTools();
    return ok(id, { tools });
  }

  // ── tools/call ──────────────────────────────────────────────────────────────
  if (method === "tools/call") {
    const toolName = params?.name as string;
    const args = (params?.arguments ?? {}) as Record<string, unknown>;

    if (!toolName) return err(id, -32602, "Missing tool name");

    // Extract agent context (used for telemetry + HITL)
    const agentName = (args.agent_name || args.sender_name || 'unknown-agent') as string;
    const organizationId = req._unimatrixOrgId || null;

    try {
      // === NEW: Spend Limit Check + Pre-execution Cost Estimation ===
      const { 
        checkSpendLimit, 
        requiresHumanApproval, 
        createPendingAction,
        estimateCostBeforeExecution 
      } = await import('@/lib/telemetry/agent-usage');

      // Rough pre-estimation (agents should pass better estimates in future)
      const estimatedCost = estimateCostBeforeExecution(
        (args.provider as string) || 'openai',
        (args.model as string) || 'gpt-4o',
        1200, // assumed prompt tokens
        600
      );

      const projectedSpend = (await checkSpendLimit(agentName, organizationId || undefined)).currentSpend + estimatedCost;

      const spendCheck = await checkSpendLimit(agentName, organizationId || undefined);
      if (projectedSpend > spendCheck.limit) {
        return ok(id, {
          status: 'blocked',
          reason: 'would_exceed_daily_spend_limit',
          estimated_cost: estimatedCost,
          current_spend: spendCheck.currentSpend,
          limit: spendCheck.limit,
          message: 'This call would exceed the daily spend limit.',
        });
      }

      if (!spendCheck.allowed) {
        return ok(id, {
          status: 'blocked',
          reason: 'daily_spend_limit_exceeded',
          current_spend: spendCheck.currentSpend,
          limit: spendCheck.limit,
        });
      }

      // === NEW: HITL (Human-in-the-Loop) Check ===
      const hitlRequired =
        (args.hitl_required as boolean) ||
        (await requiresHumanApproval(agentName, toolName, organizationId || undefined));

      if (hitlRequired) {
        const pending = await createPendingAction({
          roomId: (args.room_id as string) || 'global',
          agentName,
          toolName,
          args,
          requestedBy: agentName,
          expiresInMinutes: 60,
        });

        // Fire notification (non-blocking)
        import('@/lib/notifications/pending-action')
          .then(({ notifyPendingActionCreated }) =>
            notifyPendingActionCreated({
              id: pending.id,
              roomId: pending.roomId,
              agentName,
              toolName,
              requestedBy: agentName,
            })
          )
          .catch(() => {});

        return ok(id, {
          status: 'pending_approval',
          pending_action_id: pending.id,
          message: 'This action requires human approval before execution.',
          tool_name: toolName,
        });
      }

      // Normal execution path
      const { executeTool } = await import('@/lib/tools/registry');
      const result = await executeTool(toolName, args, { userId, organizationId });

      // Best-effort telemetry logging (non-blocking)
      const { logToolExecutionTelemetry } = await import('@/lib/telemetry/agent-usage');
      logToolExecutionTelemetry(toolName, agentName, result, args).catch(() => {});

      return ok(id, result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[MCP] Tool error (${toolName}):`, msg);
      return ok(id, textContent(`Error: ${msg}`));
    }
  }

  // ── notifications/initialized (client ack — no response needed) ─────────────
  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  return err(id, -32601, `Method not found: ${method}`);
}
