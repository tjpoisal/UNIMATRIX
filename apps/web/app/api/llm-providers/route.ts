import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptApiKey } from '@/lib/crypto';
import { randomBytes as _randomBytes } from "crypto";
import _bcrypt from "bcryptjs";

const OPENAI_COMPAT_PROVIDERS: Record<string, { envKey: string }> = {
  mistral: { envKey: 'MISTRAL_API_KEY' },
  deepseek: { envKey: 'DEEPSEEK_API_KEY' },
  together: { envKey: 'TOGETHER_API_KEY' },
  fireworks: { envKey: 'FIREWORKS_API_KEY' },
  cerebras: { envKey: 'CEREBRAS_API_KEY' },
  sambanova: { envKey: 'SAMBANOVA_API_KEY' },
  xai: { envKey: 'XAI_API_KEY' },
  openrouter: { envKey: 'OPENROUTER_API_KEY' },
  nvidia: { envKey: 'NVIDIA_API_KEY' },
  ai21: { envKey: 'AI21_API_KEY' },
  sonar: { envKey: 'PERPLEXITY_API_KEY' },
  vllm: { envKey: '' },
  lmstudio: { envKey: '' },
  jan: { envKey: '' },
  llamacpp: { envKey: '' },
  textgenui: { envKey: '' },
};

const SUPPORTED_PROVIDERS = [
  'claude',
  'openai',
  'gemini',
  'groq',
  'ollama',
  ...Object.keys(OPENAI_COMPAT_PROVIDERS),
];

// GET /api/llm-providers — list user's connected LLM providers (no keys)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providers = await prisma.lLMProvider.findMany({
    where: { userId: session.user.id, isActive: true },
    select: {
      id: true,
      provider: true,
      model: true,
      baseUrl: true,
      label: true,
      keyPrefix: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(providers);
}

// POST /api/llm-providers — connect a new LLM provider
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider, model, apiKey, label, baseUrl } = await request.json();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return NextResponse.json(
      { error: `Provider must be one of: ${SUPPORTED_PROVIDERS.join(', ')}` },
      { status: 400 }
    );
  }
  if (!model?.trim()) {
    return NextResponse.json({ error: 'Model is required' }, { status: 400 });
  }
  const compatCfg = OPENAI_COMPAT_PROVIDERS[provider];
  const isLocalCompat = !!compatCfg && compatCfg.envKey === '';
  if (provider !== 'ollama' && !isLocalCompat && !apiKey?.trim()) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }
  if (isLocalCompat && baseUrl && typeof baseUrl !== 'string') {
    return NextResponse.json({ error: 'baseUrl must be a string when provided' }, { status: 400 });
  }

  const rawKey = provider === 'ollama' || isLocalCompat ? 'local' : apiKey.trim();
  const { encrypted, iv } = encryptApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 8) + '...';

  // Upsert — replace if same provider+model combo already exists
  const record = await prisma.lLMProvider.upsert({
    where: {
      userId_provider_model: {
        userId: session.user.id,
        provider,
        model: model.trim(),
      },
    },
    update: {
      keyEncrypted: encrypted,
      keyIv: iv,
      keyPrefix,
      label: label?.trim() || null,
      baseUrl: baseUrl?.trim() || null,
      isActive: true,
    },
    create: {
      userId: session.user.id,
      provider,
      model: model.trim(),
      label: label?.trim() || null,
      baseUrl: baseUrl?.trim() || null,
      keyEncrypted: encrypted,
      keyIv: iv,
      keyPrefix,
    },
  });

  // Auto-magic: provision per-LLM history organization space
  // This runs every time a user "logs into" / connects an LLM via the installer/onboarding/settings.
  // Unimatrix will now auto-store and organize future conversation history from this LLM
  // into its dedicated location.
  await ensureLLMHistoryLocation(session.user.id, provider, model.trim());

  // Background seed for history (supports non-MCP LLMs too via the general auto-log mechanism).
  // Since importRecentHistory requires a usable Unimatrix key and the llm package,
  // we do a simple direct seed of the "import note" memory into the history location.
  // Real history import/population happens on LLM use via autoLog / agent.
  try {
    const historyPalace = await prisma.palace.findFirst({
      where: { userId: session.user.id, name: 'LLM Histories', deletedAt: null },
    });
    if (historyPalace) {
      const locName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} History`;
      const loc = await prisma.location.findFirst({
        where: { palaceId: historyPalace.id, name: locName },
      });
      if (loc) {
        // Seed a note about auto-capture (idempotent enough)
        await prisma.memory.create({
          data: {
            locationId: loc.id,
            content: `Background import note for ${provider}: History will be automatically captured and organized on future uses of this LLM (via the @unimatrix/llm auto-log, agent tasks, or when the LLM calls remember with sourceLlm). For providers supporting history APIs, extend importRecentHistory.`,
            tags: ['import-note', 'auto', provider, 'non-mcp-support'],
          },
        });
      }
    }
  } catch (e) {
    console.warn('Background history seed note skipped:', e);
  }

  return NextResponse.json(
    {
      id: record.id,
      provider: record.provider,
      model: record.model,
      baseUrl: record.baseUrl,
      label: record.label,
      keyPrefix: record.keyPrefix,
      createdAt: record.createdAt,
    },
    { status: 201 }
  );
}

// After saving the provider, auto-provision memory organization for its history
// This is the "installer" auto-magic: when you log into an LLM, Unimatrix auto-creates
// a dedicated space to store and organize all future (and past) conversation history from it.
async function ensureLLMHistoryLocation(userId: string, provider: string, model: string) {
  const historyPalaceName = 'LLM Histories';
  const locationName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} History`;

  try {
    // Find or create the "LLM Histories" palace for this user
    let palace = await prisma.palace.findFirst({
      where: { userId, name: historyPalaceName, deletedAt: null },
    });

    if (!palace) {
      palace = await prisma.palace.create({
        data: {
          userId,
          name: historyPalaceName,
          description: 'Auto-organized conversation histories from all connected LLMs. Each LLM gets its own dedicated space for its full history.',
        },
      });
    }

    // Find or create the per-LLM location inside it
    let location = await prisma.location.findFirst({
      where: { palaceId: palace.id, name: locationName },
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          palaceId: palace.id,
          name: locationName,
          description: `Full auto-stored history of all interactions with ${provider} (${model}). Unimatrix automatically files new conversations here based on the LLM source when you use it via agents or integrations.`,
          position: 0,
        },
      });
    }

    // Seed or update a note about auto-storage (idempotent-ish via description)
    // (We could query for a memory with specific tag, but for simplicity we just ensure the space exists)

    console.log(`[Auto-magic] Ensured history location for ${provider}: ${location.id} in palace ${palace.id}`);
  } catch (err) {
    console.warn(`[Auto-magic] Failed to provision history location for ${provider}:`, err);
  }
}
