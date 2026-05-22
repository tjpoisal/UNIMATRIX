import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { auth } from '@/lib/auth';

interface AssistBody {
  palaceId: string;
  locationName: string;
  locationDescription?: string;
  existingMemories?: string[];
}

const SYSTEM_PROMPT = `You are an AI memory assistant for Unimatrix — a cross-LLM context persistence layer.
Your role: suggest relevant, useful context entries to store in this memory workspace.
Guidelines:
- Make suggestions concrete, sensory, and visual — memorable is the goal
- Keep each suggestion 1–3 sentences
- Ground them in the location's name and context
- Suggest things that would be useful to remember there
- Return exactly 5 suggestions, each on its own line, numbered 1-5
- Do NOT add explanations, just the numbered suggestions`;

function parseSuggestions(text: string): string[] {
  const numbered = text.match(/^\d+[.)]\s+.+/gm);
  if (numbered && numbered.length >= 3) {
    return numbered.map(s => s.replace(/^\d+[.)]\s+/, '').trim()).filter(Boolean).slice(0, 5);
  }
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

  const existingText = existingMemories.length > 0
    ? `\n\nExisting memories at this location:\n${existingMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
    : '';

  const userPrompt = `Location: "${locationName}"${locationDescription ? `\nDescription: ${locationDescription}` : ''}${existingText}\n\nSuggest 5 new, vivid memory items to place here.`;

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxTokens: 1024,
      temperature: 0.8,
    });

    const suggestions = parseSuggestions(text);
    if (suggestions.length === 0) {
      return NextResponse.json({ error: 'AI returned no suggestions. Please try again.' }, { status: 422 });
    }

    return NextResponse.json({ suggestions, provider: 'vercel-ai-gateway' });
  } catch (err) {
    console.error('[llm/assist] AI Gateway error:', err);
    return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 500 });
  }
}
