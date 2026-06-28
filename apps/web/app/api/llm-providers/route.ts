import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptApiKey } from '@/lib/crypto';
import { randomBytes as _randomBytes } from "crypto";
import _bcrypt from "bcryptjs";

/**
 * Providers that use the OpenAI-compat adapter (one adapter, many providers).
 * Local engines (vllm, lmstudio, jan, llamacpp, textgenwebui) accept a baseUrl
 * instead of an apiKey.
 */
const OPENAI_COMPAT_PROVIDERS = [
  'mistral', 'deepseek', 'xai', 'together', 'fireworks',
  'cerebras', 'sambanova', 'nvidia', 'ai21', 'octoai',
  'openrouter', 'azure', 'databricks',
  // Local engines
  'vllm', 'lmstudio', 'jan', 'llamacpp', 'textgenwebui',
];

/** Providers with their own dedicated adapter */
const NATIVE_PROVIDERS = ['claude', 'openai', 'gemini', 'groq', 'ollama', 'cohere', 'bedrock'];

/**
 * Consumer / browser-capture providers — no direct API.
 * Memory is ingested via POST /api/ingest/browser or the browser extension.
 * Listed here so the UI can show them with the correct "connect via extension" flow.
 */
const BROWSER_CAPTURE_PROVIDERS = [
  'perplexity',     // perplexity.ai — browser extension capture
  'gemini-app',     // gemini.google.com consumer app
  'copilot',        // microsoft copilot consumer
  'meta-ai',        // meta.ai
  'grok-consumer',  // grok.x.ai consumer
  'poe',            // poe.com
  'youcom',         // you.com
  'phind',          // phind.com
  'lechat',         // chat.mistral.ai consumer
  'pi',             // heypi.com
];

const SUPPORTED_PROVIDERS = [
  ...NATIVE_PROVIDERS,
  ...OPENAI_COMPAT_PROVIDERS,
  ...BROWSER_CAPTURE_PROVIDERS,
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

  // Browser-capture providers don't need an API key — they use the extension
  const isBrowserCapture = BROWSER_CAPTURE_PROVIDERS.includes(provider);
  // Local engines use baseUrl instead of apiKey
  const isLocalEngine = ['vllm', 'lmstudio', 'jan', 'llamacpp', 'textgenwebui', 'ollama'].includes(provider);

  if (!model?.trim()) {
    return NextResponse.json({ error: 'Model is required' }, { status: 400 });
  }
  if (!isBrowserCapture && !isLocalEngine && !apiKey?.trim()) {
    return NextResponse.json({ error: 'API key is required for this provider' }, { status: 400 });
  }

  // For browser-capture providers, store a sentinel value — no real key
  // For local engines, store the baseUrl as the "key" (it's not secret)
  const rawKey = isBrowserCapture
    ? `browser-capture:${provider}`
    : isLocalEngine
      ? (baseUrl?.trim() || 'http://localhost')
      : apiKey.trim();

  const { encrypted, iv } = encryptApiKey(rawKey);
  const keyPrefix = isBrowserCapture ? 'ext:...' : rawKey.slice(0, 8) + '...';

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
      isActive: true,
    },
    create: {
      userId: session.user.id,
      provider,
      model: model.trim(),
      label: label?.trim() || null,
      keyEncrypted: encrypted,
      keyIv: iv,
      keyPrefix,
    },
  });

  await ensureLLMHistoryLocation(session.user.id, provider, model.trim());

  return NextResponse.json(
    {
      id: record.id,
      provider: record.provider,
      model: record.model,
      label: record.label,
      keyPrefix: record.keyPrefix,
      createdAt: record.createdAt,
      captureMethod: isBrowserCapture ? 'browser-extension' : isLocalEngine ? 'local' : 'api-key',
    },
    { status: 201 }
  );
}

async function ensureLLMHistoryLocation(userId: string, provider: string, model: string) {
  const historyPalaceName = 'LLM Histories';
  const locationName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} History`;

  try {
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

    let location = await prisma.location.findFirst({
      where: { palaceId: palace.id, name: locationName },
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          palaceId: palace.id,
          name: locationName,
          description: `Full auto-stored history of all interactions with ${provider} (${model}). Unimatrix automatically files new conversations here based on the LLM source when you use it via agents, integrations, or the browser extension.`,
          position: 0,
        },
      });
    }

    console.log(`[Auto-magic] Ensured history location for ${provider}: ${location.id} in palace ${palace.id}`);
  } catch (err) {
    console.warn(`[Auto-magic] Failed to provision history location for ${provider}:`, err);
  }
}
