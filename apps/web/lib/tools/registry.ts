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

import { z } from 'zod';
import { TOOLS as legacyMemoryTools, handleTool as legacyHandleTool } from '@/app/api/mcp/route';
import { sendMessage, getMessages, subscribeWebhook } from '@/lib/collab/service';
import type { McpTool, OpenAITool } from '@/lib/mcp-client';

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
legacyMemoryTools.forEach((tool: any) => {
  registry.set(tool.name, {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  });
});

// New Collaboration Tools
const collabTools: ToolDefinition[] = [
  {
    name: 'collab.send_message',
    description: 'Send a message to a shared collaboration room. Supports humans and AI agents.',
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
    description: 'Retrieve recent messages from a collaboration room with cursor pagination.',
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
    description: 'Subscribe an HTTPS endpoint to receive real-time events from a room (message.created).',
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

  // Legacy memory tools (delegate to existing implementation)
  const resultText = await legacyHandleTool(name, args, context.userId);
  return { content: [{ type: 'text' as const, text: resultText }] };
}

async function executeCollabTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
) {
  try {
    if (name === 'collab.send_message') {
      const result = await sendMessage(args as any, context.organizationId ?? ''); // TODO: tighten during migration
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      };
    }

    if (name === 'collab.get_messages') {
      const messages = await getMessages(args as any, context.organizationId ?? '');
      return {
        content: [{ type: 'text', text: JSON.stringify(messages) }],
      };
    }

    if (name === 'collab.subscribe_webhook') {
      const result = await subscribeWebhook(args as any, context.organizationId ?? '');
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      };
    }

    throw new Error(`Unknown collaboration tool: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message || 'Tool execution failed'}` }],
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
      parameters: tool.inputSchema as any,
    },
  }));
}
