/**
 * Unimatrix Tool Registry
 *
 * Single source of truth for all MCP + REST tools.
 * This replaces the monolithic switch statement in the MCP route.
 *
 * Benefits:
 * - Easy to add new tool domains (memory, collab, governance, etc.)
 * - Consistent OpenAI + MCP schema generation
 * - Better testability and type safety
 */

import { TOOLS as legacyMemoryTools, handleTool as legacyHandleTool } from '@/app/api/mcp/route';
import { MEMORY_TOOL_MANIFESTS, handleMemoryTool } from '@unimatrix/server/mcp/memoryTools';
import { sendMessage, getMessages, subscribeWebhook, createRoom, listRooms } from '@/lib/collab/service';
import type { OpenAITool } from '@/lib/mcp-client';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  // Execution is handled separately for now (gradual migration)
}

export interface ToolExecutionContext {
  userId: string;
  organizationId: string | null; // null during migration
}

// ============================================================================
// REGISTRY
// ============================================================================

const registry = new Map<string, ToolDefinition>();

// Register legacy memory tools (temporary — will be migrated)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
legacyMemoryTools.forEach((tool: any) => {
  registry.set(tool.name, {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  });
});

// New Collaboration Tools (multi-agent + human)
const collabTools: ToolDefinition[] = [
  {
    name: 'collab.create_room',
    description: 'Create a new collaboration room scoped to your organization. Required before sending messages.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 120 },
        description: { type: 'string', maxLength: 500 },
        is_private: { type: 'boolean', default: true },
      },
      required: ['name'],
    },
  },
  {
    name: 'collab.list_rooms',
    description: 'List collaboration rooms visible to the authenticated organization/API key.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'collab.send_message',
    description: 'Send a message to a shared collaboration room. Supports humans and AI agents. All agents in the org can observe.',
    inputSchema: {
      type: 'object',
      properties: {
        room_id: { type: 'string' },
        sender_id: { type: 'string' },
        sender_name: { type: 'string' },
        sender_type: { type: 'string', enum: ['human', 'agent', 'system'] },
        message: { type: 'string', maxLength: 8000 },
        metadata: { type: 'object' },
      },
      required: ['room_id', 'sender_name', 'sender_type', 'message'],
    },
  },
  {
    name: 'collab.get_messages',
    description: 'Retrieve recent messages from a collaboration room with cursor-based pagination (stable since_id).',
    inputSchema: {
      type: 'object',
      properties: {
        room_id: { type: 'string' },
        since_id: { type: 'string' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      },
      required: ['room_id'],
    },
  },
  {
    name: 'collab.subscribe_webhook',
    description: 'Subscribe an HTTPS endpoint to receive real-time events (message.created) from a room. Secret returned only once.',
    inputSchema: {
      type: 'object',
      properties: {
        room_id: { type: 'string' },
        target_url: { type: 'string', format: 'uri' },
      },
      required: ['room_id', 'target_url'],
    },
  },
];

collabTools.forEach((tool) => registry.set(tool.name, tool));

// CSMTER memory tools (L1 vector + L2 BM25 + L3 RRF + L4 triples)
MEMORY_TOOL_MANIFESTS.forEach((tool) => registry.set(tool.name, tool));

export function getAllTools(): ToolDefinition[] {
  return Array.from(registry.values());
}

export function getTool(name: string): ToolDefinition | undefined {
  return registry.get(name);
}

// ============================================================================
// EXECUTION DISPATCHER
// ============================================================================

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  // Collaboration tools (new, preferred path)
  if (name.startsWith('collab.')) {
    return executeCollabTool(name, args, context);
  }

  // CSMTER hybrid memory tools (L1+L2+L3+L4 pipeline)
  if (name.startsWith('unimatrix_recall') || name.startsWith('unimatrix_search_csmter') || name.startsWith('unimatrix_list_triples') || name.startsWith('unimatrix_system_prompt')) {
    const result = await handleMemoryTool(name, args, context.userId);
    if (result !== null) {
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }
  }

  // Legacy memory tools (delegate to existing implementation)
  const resultText = await legacyHandleTool(name, args, context.userId);
  return { content: [{ type: 'text' as const, text: resultText }] };
}

async function executeCollabTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const orgId = context.organizationId;
  if (!orgId) {
    return {
      content: [{ type: 'text', text: 'Error: Organization context required. Use an organization-scoped API key or ensure your account has a workspace.' }],
    };
  }

  try {
    if (name === 'collab.create_room') {
      const result = await createRoom(
        {
          name: args.name as string,
          description: args.description as string | undefined,
          isPrivate: (args.is_private as boolean) ?? true,
        },
        orgId
      );
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }

    if (name === 'collab.list_rooms') {
      const input = args.limit != null ? { limit: Number(args.limit) } : {};
      const rooms = await listRooms(input, orgId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(rooms) }] };
    }

    if (name === 'collab.send_message') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await sendMessage(args as any, orgId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      };
    }

    if (name === 'collab.get_messages') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = await getMessages(args as any, orgId);
      return {
        content: [{ type: 'text', text: JSON.stringify(messages) }],
      };
    }

    if (name === 'collab.subscribe_webhook') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await subscribeWebhook(args as any, orgId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      };
    }

    throw new Error(`Unknown collaboration tool: ${name}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Tool execution failed';
    // Surface CollabError status if present for better client UX
    return {
      content: [{ type: 'text', text: `Error: ${msg}` }],
    };
  }
}

// Convert registry to OpenAI format (used by /api/tools)
export function toOpenAITools(): OpenAITool[] {
  return getAllTools().map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parameters: tool.inputSchema as any,
    },
  }));
}
