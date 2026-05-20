import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptApiKey } from '@/lib/crypto';

interface AssistBody {
  palaceId: string;
  locationName: string;
  locationDescription?: string;
  existingMemories?: string[];
}

const SYSTEM_PROMPT = `You are a memory palace assistant helping a user using the Method of Loci.
Your role: suggest vivid, memorable content to store at a specific location in their memory palace.
Guidelines:
- Make suggestions concrete, sensory, and visual — memorable is the goal
- Keep each suggestion 1–3 sentences
- Ground them in the location's name and context
- Suggest things that would be useful to remember there
- Return exactly 5 suggestions, each on its own line, numbered 1-5
- Do NOT add explanations, just the numbered suggestions`;

async function callGroq(apiKey: string, model: string, prompt: string): Promise<string[]> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  const text: string = data.choices[0]?.message?.content || '';
  return parseSuggestions(text);
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseSuggestions(text);
}

function parseSuggestions(text: string): string[] {
  // Try to extract numbered lines like "1. ..." or "1) ..."
  const numbered = text.match(/^\d+[.)]\s+.+/gm);
  if (numbered && numbered.length >= 3) {
    return numbered.map(s => s.replace(/^\d+[.)]\s+/, '').trim()).filter(Boolean).slice(0, 5);
  }
  // Fallback: split by newlines and filter empties
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 5);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: AssistBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { palaceId, locationName, locationDescription = '', existingMemories = [] } = body;
  if (!palaceId || !locationName) {
    return NextResponse.json({ error: 'palaceId and locationName are required' }, { status: 400 });
  }

  // Build the user prompt
  const existingText = existingMemories.length > 0
    ? `\n\nExisting memories at this location:\n${existingMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
    : '';

  const userPrompt = `Location: "${locationName}"${locationDescription ? `\nDescription: ${locationDescription}` : ''}${existingText}\n\nSuggest 5 new, vivid memory items to place here.`;

  // Look up user's connected providers — try Groq first, then Gemini
  const providers = await prisma.lLMProvider.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      provider: { in: ['groq', 'gemini'] },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Sort: groq first
  const groqProvider = providers.find(p => p.provider === 'groq');
  const geminiProvider = providers.find(p => p.provider === 'gemini');

  let suggestions: string[] = [];
  let usedProvider = '';

  // Try Groq
  if (groqProvider) {
    try {
      const apiKey = decryptApiKey(groqProvider.keyEncrypted, groqProvider.keyIv);
      suggestions = await callGroq(apiKey, groqProvider.model, userPrompt);
      usedProvider = 'groq';
    } catch (err) {
      console.warn('[llm/assist] Groq failed, trying Gemini:', err);
    }
  }

  // Fallback to Gemini
  if (suggestions.length === 0 && geminiProvider) {
    try {
      const apiKey = decryptApiKey(geminiProvider.keyEncrypted, geminiProvider.keyIv);
      suggestions = await callGemini(apiKey, geminiProvider.model, userPrompt);
      usedProvider = 'gemini';
    } catch (err) {
      console.warn('[llm/assist] Gemini also failed:', err);
    }
  }

  if (suggestions.length === 0) {
    // Neither provider is connected or both failed
    const msg = providers.length === 0
      ? 'No Groq or Gemini provider connected. Go to Settings → AI Providers to add one.'
      : 'AI providers failed to respond. Please check your API keys in Settings.';
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  return NextResponse.json({ suggestions, provider: usedProvider });
}
