import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptApiKey } from '@/lib/crypto';

const SUPPORTED_PROVIDERS = ['claude', 'openai', 'gemini', 'groq', 'ollama'];

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

  const { provider, model, apiKey, label } = await request.json();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return NextResponse.json(
      { error: `Provider must be one of: ${SUPPORTED_PROVIDERS.join(', ')}` },
      { status: 400 }
    );
  }
  if (!model?.trim()) {
    return NextResponse.json({ error: 'Model is required' }, { status: 400 });
  }
  if (provider !== 'ollama' && !apiKey?.trim()) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  const rawKey = provider === 'ollama' ? 'local' : apiKey.trim();
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

  return NextResponse.json(
    {
      id: record.id,
      provider: record.provider,
      model: record.model,
      label: record.label,
      keyPrefix: record.keyPrefix,
      createdAt: record.createdAt,
    },
    { status: 201 }
  );
}
