/**
 * Unimatrix Collaborative Agent Engine
 *
 * Orchestrates multiple user-connected LLMs to work together on a task.
 * Each agent reads from the user's memory palace for context, contributes
 * its answer, and results are stored back as new memories.
 *
 * Modes:
 *   parallel   — all LLMs answer simultaneously, best LLM synthesizes
 *   sequential — LLMs build on each other in turn (chain of thought)
 *   debate     — LLMs argue positions, then synthesize consensus
 */

import { generateText } from 'ai';
import { decryptApiKey } from './crypto';
import { prisma } from './prisma';

// ─── AI Gateway synthesis (uses Vercel OIDC — no API key needed) ─────────────
async function synthesizeWithGateway(system: string, prompt: string): Promise<string> {
  const { text } = await generateText({
    model: 'openai/gpt-4o-mini',
    system,
    prompt,
    maxOutputTokens: 2048,
  });
  return text;
}

export type AgentMode = 'parallel' | 'sequential' | 'debate';

export interface AgentRunOptions {
  userId: string;
  task: string;
  mode: AgentMode;
  providerIds: string[];   // IDs of LLMProvider records to use
  palaceId?: string;       // palace to pull context from + save memories to
  saveToMemory?: boolean;  // whether to auto-save synthesis as a memory
}

export interface ProviderResponse {
  provider: string;
  model: string;
  response: string;
  error?: string;
}

export interface AgentResult {
  task: string;
  mode: AgentMode;
  responses: ProviderResponse[];
  synthesis: string;
  memoryId?: string;
}

// ─── Memory context retrieval ───────────────────────────────────────────────

async function getMemoryContext(userId: string, palaceId: string, task: string): Promise<string> {
  // Pull the most recent 20 memories from the palace, filtered by basic relevance
  const keywords = task.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const memories = await prisma.memory.findMany({
    where: {
      deletedAt: null,
      location: {
        deletedAt: null,
        palace: {
          id: palaceId,
          userId,
          deletedAt: null,
        },
      },
    },
    orderBy: { lastAccessed: 'desc' },
    take: 30,
    select: {
      id: true,
      content: true,
      tags: true,
      location: { select: { name: true } },
    },
  });
  // Prisma schema stores memory content as Bytes and tags as MemoryTag[].
  // Normalize here so the rest of the code can treat content as string and tags as string[].
  const decodedMemories = (memories as any[]).map(m => {
    // decode content from Buffer/Uint8Array if necessary
    let contentStr: string;
    const raw = m.content;
    try {
      if (typeof raw === 'string') contentStr = raw;
      else if (raw instanceof Uint8Array) contentStr = new TextDecoder().decode(raw);
      else if (Buffer.isBuffer(raw)) contentStr = raw.toString('utf8');
      else contentStr = String(raw ?? '');
    } catch (err) {
      // Log decoding failures for debugging; avoid unused catch binding (ESLint)
      console.debug('Failed to decode memory content', err);
      contentStr = String(raw ?? '');
    }

    // normalize tags: could be array of strings or array of { tag: string }
    let tagsArr: string[] = [];
    if (Array.isArray(m.tags)) {
      tagsArr = m.tags
        .map((t: unknown) => {
          if (typeof t === 'string') return t;
          if (typeof t === 'object' && t !== null && 'tag' in (t as Record<string, unknown>)) {
            const maybe = (t as Record<string, unknown>).tag;
            return typeof maybe === 'string' ? maybe : String(maybe);
          }
          return String(t);
        })
        .filter(Boolean) as string[];
    }

    return {
      id: m.id,
      content: contentStr,
      tags: tagsArr,
      location: m.location ?? { name: 'unknown' },
    };
  });

  // Score by keyword overlap
  const scored = decodedMemories
    .map(m => {
      const text = (m.content + ' ' + m.tags.join(' ')).toLowerCase();
      const hits = keywords.filter(k => text.includes(k)).length;
      return { ...m, score: hits };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (scored.length === 0) return '';

  const lines = scored.map(m =>
    `[${m.location.name}] ${m.content.slice(0, 300)}${m.content.length > 300 ? '…' : ''}`
  );
  return `\n\nRelevant memories from your palace:\n${lines.join('\n---\n')}`;
}

// ─── LLM call dispatch ───────────────────────────────────────────────────────

async function callLLM(
  provider: string,
  model: string,
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  switch (provider) {
    case 'claude':
      return callClaude(model, apiKey, systemPrompt, userMessage);
    case 'openai':
      return callOpenAI(model, apiKey, systemPrompt, userMessage);
    case 'gemini':
      return callGemini(model, apiKey, systemPrompt, userMessage);
    case 'groq':
      return callGroq(model, apiKey, systemPrompt, userMessage);
    case 'ollama':
      return callOllama(model, systemPrompt, userMessage);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callClaude(model: string, apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(model: string, apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2048,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(model: string, apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callGroq(model: string, apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2048,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOllama(model: string, system: string, user: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.message.content;
}

// ─── Collaboration modes ─────────────────────────────────────────────────────

async function runParallel(
  providers: Array<{ id: string; provider: string; model: string; apiKey: string }>,
  task: string,
  memCtx: string
): Promise<{ responses: ProviderResponse[]; synthesis: string }> {
  const systemPrompt = `You are a knowledgeable AI agent participating in a multi-AI collaboration.
Answer the task thoroughly. You have access to the user's memory palace context below.${memCtx}`;

  // Fire all simultaneously
  const settled = await Promise.allSettled(
    providers.map(async p => ({
      provider: p.provider,
      model: p.model,
      response: await callLLM(p.provider, p.model, p.apiKey, systemPrompt, task),
    }))
  );

  const responses: ProviderResponse[] = settled.map((s, i) =>
    s.status === 'fulfilled'
      ? s.value
      : { provider: providers[i].provider, model: providers[i].model, response: '', error: s.reason?.message }
  );

  const goodResponses = responses.filter(r => !r.error && r.response);

  // Synthesise with the first available provider (or fallback text)
  let synthesis: string;
  if (goodResponses.length === 0) {
    synthesis = 'All agents failed to respond.';
  } else if (goodResponses.length === 1) {
    synthesis = goodResponses[0].response;
  } else {
    const combined = goodResponses
      .map(r => `### ${r.provider} (${r.model})\n${r.response}`)
      .join('\n\n');
    synthesis = await synthesizeWithGateway(
      'You are a synthesis AI. Combine the following agent responses into a single, comprehensive, non-redundant answer. Highlight where agents agree and note any meaningful differences.',
      `Task: ${task}\n\nAgent responses:\n${combined}`
    );
  }

  return { responses, synthesis };
}

async function runSequential(
  providers: Array<{ id: string; provider: string; model: string; apiKey: string }>,
  task: string,
  memCtx: string
): Promise<{ responses: ProviderResponse[]; synthesis: string }> {
  const responses: ProviderResponse[] = [];
  let chainContext = '';

  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    const isFirst = i === 0;
    const isLast = i === providers.length - 1;

    let systemPrompt: string;
    if (isFirst) {
      systemPrompt = `You are Agent 1 in a chain of AI collaborators. Provide a thorough first answer.${memCtx}`;
    } else if (isLast) {
      systemPrompt = `You are the final synthesizing agent. Review all previous agents' answers and produce a definitive, refined response that builds on their best points and corrects any errors.`;
    } else {
      systemPrompt = `You are Agent ${i + 1} in a chain. Read the previous answer(s) and improve upon them — fill gaps, correct errors, add depth.`;
    }

    const userMsg = isFirst
      ? task
      : `Original task: ${task}\n\nPrevious agents' work:\n${chainContext}\n\nYour turn: improve, refine, or synthesize.`;

    try {
      const response = await callLLM(p.provider, p.model, p.apiKey, systemPrompt, userMsg);
      responses.push({ provider: p.provider, model: p.model, response });
      chainContext += `\n\n### ${p.provider} (${p.model}):\n${response}`;
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      responses.push({ provider: p.provider, model: p.model, response: '', error });
    }
  }

  const lastGood = [...responses].reverse().find(r => !r.error && r.response);
  const synthesis = lastGood?.response || 'Sequential chain failed to produce a result.';

  return { responses, synthesis };
}

async function runDebate(
  providers: Array<{ id: string; provider: string; model: string; apiKey: string }>,
  task: string,
  memCtx: string
): Promise<{ responses: ProviderResponse[]; synthesis: string }> {
  const perspectives = ['supportive', 'critical', 'alternative', 'practical'];

  // Round 1: Each agent takes a different angle
  const round1: ProviderResponse[] = await Promise.all(
    providers.map(async (p, i) => {
      const angle = perspectives[i % perspectives.length];
      try {
        const response = await callLLM(
          p.provider, p.model, p.apiKey,
          `You are a ${angle} analyst in a multi-AI debate. Approach the task from a ${angle} perspective. Be specific and honest.${memCtx}`,
          task
        );
        return { provider: p.provider, model: p.model, response };
      } catch (err: unknown) {
        return { provider: p.provider, model: p.model, response: '', error: err instanceof Error ? err.message : String(err) };
      }
    })
  );

  const round1Summary = round1
    .filter(r => !r.error)
    .map((r, i) => `### ${perspectives[i % perspectives.length]} view (${r.provider}):\n${r.response}`)
    .join('\n\n');

  // Round 2: Each agent responds to the others
  const round2: ProviderResponse[] = await Promise.all(
    providers.map(async (p, i) => {
      const angle = perspectives[i % perspectives.length];
      try {
        const response = await callLLM(
          p.provider, p.model, p.apiKey,
          `You previously gave a ${angle} perspective. Now respond to the other agents' views — find common ground and identify the most important points.`,
          `Task: ${task}\n\nAll perspectives from round 1:\n${round1Summary}\n\nYour response:`
        );
        return { provider: p.provider, model: p.model, response };
      } catch (err: unknown) {
        return { provider: p.provider, model: p.model, response: '', error: err instanceof Error ? err.message : String(err) };
      }
    })
  );

  const allResponses = [...round1, ...round2];

  // Synthesis
  const synthInput = `Task: ${task}\n\nRound 1 perspectives:\n${round1Summary}\n\nRound 2 cross-responses:\n${round2.filter(r => !r.error).map(r => r.response).join('\n---\n')}`;

  let synthesis: string;
  try {
    synthesis = await synthesizeWithGateway(
      'Synthesize this multi-agent debate into a balanced, nuanced final answer that incorporates the strongest points from all perspectives.',
      synthInput
    );
  } catch {
    synthesis = round1.find(r => !r.error)?.response || 'Debate failed to produce a result.';
  }

  return { responses: allResponses, synthesis };
}

// ─── Main entry point ────────────────────────────────────────────────────────

export async function runAgentTask(options: AgentRunOptions): Promise<AgentResult> {
  const { userId, task, mode, providerIds, palaceId, saveToMemory } = options;

  // Load provider records
  const providerRecords = await prisma.lLMProvider.findMany({
    where: { id: { in: providerIds }, userId, isActive: true },
  });

  if (providerRecords.length === 0) {
    throw new Error('No active LLM providers found. Connect at least one provider first.');
  }

  // Decrypt keys
  const providers = providerRecords.map((p: { id: string; provider: string; model: string; keyEncrypted: string; keyIv: string }) => ({
    id: p.id,
    provider: p.provider,
    model: p.model,
    apiKey: decryptApiKey(p.keyEncrypted, p.keyIv),
  }));

  // Pull relevant memories as context
  let memCtx = '';
  if (palaceId) {
    memCtx = await getMemoryContext(userId, palaceId, task);
  }

  // Run the selected collaboration mode
  let responses: ProviderResponse[];
  let synthesis: string;

  if (mode === 'sequential') {
    ({ responses, synthesis } = await runSequential(providers, task, memCtx));
  } else if (mode === 'debate') {
    ({ responses, synthesis } = await runDebate(providers, task, memCtx));
  } else {
    ({ responses, synthesis } = await runParallel(providers, task, memCtx));
  }

  // Save synthesis to memory palace
  let memoryId: string | undefined;
  if (saveToMemory && palaceId && synthesis) {
    // Find or create an "Agent Sessions" location in the palace
    let location = await prisma.location.findFirst({
      where: { palaceId, name: 'Agent Sessions', deletedAt: null },
    });
    if (!location) {
      location = await prisma.location.create({
        data: {
          palaceId,
          name: 'Agent Sessions',
          description: 'Auto-saved collaborative agent results',
          position: 999,
        },
      });
    }

  const providerNames = providers.map((p: { provider: string }) => p.provider).join(', ');
    const contentBytes = new Uint8Array(Buffer.from(`**Task:** ${task}\n\n**Mode:** ${mode} (${providerNames})\n\n**Synthesis:**\n${synthesis}`, 'utf8'));
    const mem = await prisma.memory.create({
      data: {
        locationId: location.id,
        content: contentBytes,
        contentIv: new Uint8Array(16),
        source: 'api',
        status: 'active',
      },
    });
    memoryId = mem.id;

    // write tags as MemoryTag rows
    const agentTags = ['agent', mode, ...providers.map((p: { id: string; provider: string; model: string; apiKey: string }) => p.provider)];
    if (agentTags.length > 0 && memoryId) {
      await prisma.memoryTag.createMany({
        data: agentTags.map((t: string) => ({ memoryId: memoryId as string, tag: t })),
        skipDuplicates: true,
      });
    }
  }

  // Auto-magic: also store each individual LLM's response into its dedicated History location
  // This organizes memories automatically based on which LLM produced the output.
  // The "LLM Histories" palace + per-LLM locations are auto-provisioned when you connect the provider.
  if (saveToMemory) {
    for (const resp of responses) {
      if (resp.error || !resp.response) continue;

      try {
        // Find the user's "LLM Histories" palace
        const historyPalace = await prisma.palace.findFirst({
          where: { userId, name: 'LLM Histories', deletedAt: null },
        });

        if (historyPalace) {
          const historyLocName = `${resp.provider.charAt(0).toUpperCase() + resp.provider.slice(1)} History`;
          let histLoc = await prisma.location.findFirst({
            where: { palaceId: historyPalace.id, name: historyLocName },
          });

          if (!histLoc) {
            // Create on the fly if the provision hook didn't run yet
            histLoc = await prisma.location.create({
              data: {
                palaceId: historyPalace.id,
                name: historyLocName,
                description: `Auto-stored history from ${resp.provider}`,
              },
            });
          }

          const respContent = `**Task:** ${task}\n**Provider:** ${resp.provider} (${resp.model})\n\n${resp.response}`;
          const respBytes = new Uint8Array(Buffer.from(respContent, 'utf8'));
          const created = await prisma.memory.create({
            data: {
              locationId: histLoc.id,
              content: respBytes,
              contentIv: new Uint8Array(16),
              source: 'api',
              status: 'active',
            },
          });
          await prisma.memoryTag.createMany({
            data: ['llm-history', resp.provider, 'agent', mode].map(t => ({ memoryId: created.id, tag: t })),
            skipDuplicates: true,
          });
        }
      } catch (e) {
        // non-fatal
        console.warn('Failed to auto-store per-LLM history:', e);
      }
    }
  }

  return { task, mode, responses, synthesis, memoryId };
}
