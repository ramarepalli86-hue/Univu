import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { budgetGuard, addTokens } from '@/lib/budget';

function getGroqClient(): Groq | null {
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

const ASTRO_SYSTEM = `You are Univu's AI astrologer — a warm, wise, direct guide who answers questions about Vedic astrology, Western astrology, Mayan, and Egyptian traditions.

Rules:
1. Answer questions clearly and specifically. Never be vague or generic.
2. If the user shares their chart details (lagna, moon sign, dasha, etc.), use them directly.
3. If asked about timing (when will marriage happen, career break, etc.) give a specific answer with a year range — never say "it depends" without also giving a best estimate.
4. You can ask for birth details (date, time, city) to give a more accurate answer.
5. Keep answers conversational but substantive — 3-6 sentences for simple questions, a few paragraphs for complex ones.
6. Be honest about what astrology can and cannot tell. Never make medical or legal claims.
7. Sign off answers that involve timing or predictions with: "⚠️ For entertainment & information only."
8. You know: Vedic rashis, nakshatras, dashas (Vimshottari), Manglik/Sade Sati, Lagna, Egyptian decans, Mayan Tzolkin, and Western sun signs.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const blocked = budgetGuard();
  if (blocked) return blocked;

  try {
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json({ error: 'API key not configured', reply: null }, { status: 503 });
    }

    const body = await req.json();
    const { messages, chartContext }: { messages: ChatMessage[]; chartContext?: string } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    // Build system prompt — inject chart context if user has generated a reading
    const systemContent = chartContext
      ? `${ASTRO_SYSTEM}\n\nThe user's chart context:\n${chartContext}\nUse this chart data when answering their questions.`
      : ASTRO_SYSTEM;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.slice(-10), // keep last 10 messages for context window
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    addTokens(tokensUsed);

    return NextResponse.json({ reply, tokensUsed });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg, reply: null }, { status: 500 });
  }
}
