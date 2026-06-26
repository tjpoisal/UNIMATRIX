/**
 * Agent Telemetry, Spend Limits & HITL Service
 * Production-grade tracking for multi-agent collaboration (Vercel + Neon)
 */

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { calculateCostInCents } from './pricing';

export const TokenUsageInput = z.object({
  roomId: z.string(),
  agentName: z.string(),
  promptTokens: z.number().int().min(0),
  completionTokens: z.number().int().min(0),
  costInCents: z.number().int().min(0),
  latencyMs: z.number().int().min(0).optional(),
});

export type TokenUsageInput = z.infer<typeof TokenUsageInput>;

export interface SpendCheckResult {
  allowed: boolean;
  currentSpend: number;
  limit: number;
  remaining: number;
  reason?: string;
}

/**
 * Log token usage and increment the agent's current spend using real pricing.
 */
export async function logTokenUsage(input: TokenUsageInput & { provider?: string; model?: string }) {
  const data = TokenUsageInput.parse(input);

  let costInCents = data.costInCents;

  // Use real pricing if provider + model are provided
  if (input.provider && input.model) {
    costInCents = calculateCostInCents(input.provider, input.model, data.promptTokens, data.completionTokens);
  }

  await prisma.$transaction([
    prisma.tokenLog.create({
      data: {
        roomId: data.roomId,
        agent_name: data.agentName,
        prompt_tokens: data.promptTokens,
        completion_tokens: data.completionTokens,
        cost_in_cents: costInCents,
        latency_ms: data.latencyMs,
      },
    }),
    prisma.agentConfig.updateMany({
      where: { agent_name: data.agentName },
      data: { current_spend: { increment: costInCents } },
    }),
  ]);

  await checkAndSendBudgetAlert(data.agentName);

  return costInCents;
}

async function checkAndSendBudgetAlert(agentName: string) {
  const config = await prisma.agentConfig.findFirst({ where: { agent_name: agentName } });
  if (!config) return;

  const usage = config.current_spend / config.daily_spend_limit;
  if (usage >= 0.8) {
    console.warn(`[budget-alert] ${agentName} has reached ${Math.round(usage * 100)}% of daily spend limit`);
    // Future: Send email + Slack once per day using a simple cache / last_alerted_at field
  }
}

/**
 * Check if an agent is allowed to spend more today.
 */
/**
 * Estimate cost before actually calling the LLM/tool.
 */
export function estimateCostBeforeExecution(
  provider: string,
  model: string,
  estimatedPromptTokens: number,
  estimatedCompletionTokens = 800
): number {
  return calculateCostInCents(provider, model, estimatedPromptTokens, estimatedCompletionTokens);
}

export async function checkSpendLimit(agentName: string, organizationId?: string): Promise<SpendCheckResult> {
  const config = await prisma.agentConfig.findFirst({
    where: {
      agent_name: agentName,
      ...(organizationId ? { organizationId } : {}),
    },
  });

  if (!config) {
    return {
      allowed: true,
      currentSpend: 0,
      limit: 0,
      remaining: 0,
      reason: 'No spend limit configured for this agent',
    };
  }

  const remaining = Math.max(0, config.daily_spend_limit - config.current_spend);

  if (config.current_spend >= config.daily_spend_limit) {
    return {
      allowed: false,
      currentSpend: config.current_spend,
      limit: config.daily_spend_limit,
      remaining: 0,
      reason: 'Daily spend limit reached',
    };
  }

  return {
    allowed: true,
    currentSpend: config.current_spend,
    limit: config.daily_spend_limit,
    remaining,
  };
}

/**
 * Determine whether a tool call for a given agent requires human approval.
 * Supports both global flag and per-tool rules via hitl_tool_rules JSON.
 */
export async function requiresHumanApproval(
  agentName: string,
  toolName: string,
  organizationId?: string
): Promise<boolean> {
  const config = await prisma.agentConfig.findFirst({
    where: {
      agent_name: agentName,
      ...(organizationId ? { organizationId } : {}),
    },
  });

  if (!config) return false;

  // Per-tool override takes highest priority
  if (config.hitl_tool_rules) {
    try {
      const rules = config.hitl_tool_rules as Record<string, boolean>;
      if (typeof rules[toolName] === 'boolean') {
        return rules[toolName];
      }
    } catch (err) {
      console.debug('Failed to parse hitl_tool_rules for agent', agentName, err);
    }
  }

  // Fall back to global agent flag
  return config.requires_hitl;
}

/**
 * Create a pending action that requires human approval.
 */
export async function createPendingAction(params: {
  roomId: string;
  agentName: string;
  toolName: string;
  args: Record<string, unknown>;
  requestedBy?: string;
  expiresInMinutes?: number;
}) {
  const expiresAt = params.expiresInMinutes
    ? new Date(Date.now() + params.expiresInMinutes * 60 * 1000)
    : null;

  return prisma.pendingAction.create({
    data: {
      roomId: params.roomId,
      agent_name: params.agentName,
      tool_name: params.toolName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: params.args as any,
      requested_by: params.requestedBy,
      status: 'pending',
      expiresAt,
    },
  });
}

export async function getPendingActions(roomId: string, status: string = 'pending') {
  return prisma.pendingAction.findMany({
    where: { roomId, status },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function approvePendingAction(id: string, approvedBy: string) {
  return prisma.pendingAction.update({
    where: { id },
    data: {
      status: 'approved',
      approved_by: approvedBy,
      updatedAt: new Date(),
    },
  });
}

export async function rejectPendingAction(id: string, rejectedBy: string) {
  return prisma.pendingAction.update({
    where: { id },
    data: {
      status: 'rejected',
      approved_by: rejectedBy,
      updatedAt: new Date(),
    },
  });
}

/**
 * Auto-expire old pending actions (run via cron)
 */
export async function expireOldPendingActions() {
  const result = await prisma.pendingAction.updateMany({
    where: {
      status: 'pending',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'expired' },
  });
  return result.count;
}

/**
 * Lightweight telemetry logger for tool executions.
 * Uses real pricing when provider/model are known.
 */
export async function logToolExecutionTelemetry(
  toolName: string,
  agentName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
  args: Record<string, unknown>,
  provider?: string,
  model?: string,
  promptTokens = 0,
  completionTokens = 0
) {
  const roomId = (args.room_id as string) || (args.roomId as string);
  if (!roomId) return;

  const costInCents = provider && model
    ? calculateCostInCents(provider, model, promptTokens, completionTokens)
    : 3; // small fallback cost

  try {
    await prisma.tokenLog.create({
      data: {
        roomId,
        agent_name: agentName,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        cost_in_cents: costInCents,
        latency_ms: undefined,
      },
    });

    await prisma.agentConfig.updateMany({
      where: { agent_name: agentName },
      data: { current_spend: { increment: costInCents } },
    });
  } catch (e) {
    // Non-fatal telemetry logging failure — surface for debugging
    console.debug('[telemetry] Failed to log tool usage:', e);
  }
}
