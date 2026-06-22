import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runAgentTask, AgentMode } from '@/lib/agent';

/**
 * POST /api/agent/run
 *
 * Body:
 * {
 *   task:        string           — the question or task
 *   mode:        "parallel" | "sequential" | "debate"
 *   providerIds: string[]         — IDs of connected LLMProvider records
 *   palaceId?:   string           — palace to pull memory context from
 *   saveToMemory?: boolean        — auto-save synthesis as a new memory
 * }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { task, mode = 'parallel', providerIds, palaceId, saveToMemory = true } = body;

  if (!task?.trim()) {
    return NextResponse.json({ error: 'task is required' }, { status: 400 });
  }
  if (!Array.isArray(providerIds) || providerIds.length === 0) {
    return NextResponse.json({ error: 'providerIds must be a non-empty array' }, { status: 400 });
  }
  if (!['parallel', 'sequential', 'debate'].includes(mode)) {
    return NextResponse.json(
      { error: 'mode must be parallel, sequential, or debate' },
      { status: 400 }
    );
  }

  // Create run record (pending)
  const run = await prisma.agentRun.create({
    data: {
      userId: session.user.id,
      task: task.trim(),
      // legacy fields like `mode` and `providers` don't exist on the canonical
      // AgentRun model. Store the minimal required fields and keep richer
      // metadata inside the JSON `result` field if needed.
      status: 'running',
    },
  });

  try {
    const result = await runAgentTask({
      userId: session.user.id,
      task: task.trim(),
      mode: mode as AgentMode,
      providerIds,
      palaceId,
      saveToMemory,
    });

    // Update run record with result
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        result: {
          synthesis: result.synthesis,
          responses: result.responses.map(r => ({
            provider: r.provider,
            model: r.model,
            response: r.response,
            ...(r.error !== undefined ? { error: r.error } : {}),
          })),
        } as unknown as Prisma.InputJsonValue,
        memoryIds: result.memoryId ? [result.memoryId] : [],
      },
    });

    return NextResponse.json({
      runId: run.id,
      task: result.task,
      mode: result.mode,
      synthesis: result.synthesis,
      responses: result.responses,
      memoryId: result.memoryId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Agent run failed';
    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: 'failed', errorMsg: msg },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/agent/run — list recent runs for the user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runs = await prisma.agentRun.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      task: true,
      status: true,
      memoryIds: true,
      createdAt: true,
    },
  });

  return NextResponse.json(runs);
}
