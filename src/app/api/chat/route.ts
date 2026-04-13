import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { budgetGuard, addTokens } from '@/lib/budget';
import { apiGuard, sanitise } from '@/lib/apiGuard';

function getGroqClient(): Groq | null {
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}
const ASTRO_SYSTEM = `You are Univu's AI astrologer — a warm, wise, direct guide who answers questions about Vedic astrology, Western astrology, Mayan, and Egyptian traditions.

CRITICAL RULES:
1. Answer questions clearly and specifically. Never be vague or generic.
2. If the user has shared their chart details (lagna, moon sign, dasha, etc.), use them DIRECTLY in every answer. CITE exact house numbers and planet positions: "Your Mars in House 4 means..." — never just "Mars can cause..."
3. NEVER INVENT OR GUESS chart details the user has NOT provided. If you don't know their Lagna, say "I'd need your birth time and city to determine your Lagna." Do NOT make up planet positions.
4. If asked about timing (when will marriage happen, career break, etc.) give a specific answer with a year range — never say "it depends" without also giving a best estimate based on the data you have.
5. You can ask for birth details (date, time, city) to give a more accurate answer.
6. Keep answers conversational but substantive — 3-6 sentences for simple questions, a few paragraphs for complex ones.
7. Be honest about what astrology can and cannot tell. Never make medical or legal claims.
8. MARITAL STATUS: If the user is single, NEVER refer to "your spouse" or "your partner" as if they currently have one. Use "future partner" for single people.
9. Give PRACTICAL advice alongside astrological insights — specific exercises, foods, career steps, not just planet talk.
10. If mentioning any remedy (gemstone, mantra, puja), ALWAYS add: "This is for informational purposes only — consult a professional Vedic astrologer before performing any remedy."
11. Sign off answers that involve timing or predictions with: "⚠️ For entertainment & information only."
12. You know: Vedic rashis, nakshatras, dashas (Vimshottari), Manglik/Sade Sati, Lagna, Egyptian decans, Mayan Tzolkin, and Western sun signs.
13. NEVER say things like "according to your chart, your Mars is in Aries in the 7th house" unless the chart data ACTUALLY shows that. If you're making a hypothetical, clearly say "If your Mars were in..."`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const blocked = apiGuard(req);
  if (blocked) return blocked;

  const budgetBlocked = budgetGuard();
  if (budgetBlocked) return budgetBlocked;

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

    // Sanitise the last user message to prevent prompt injection
    const safeMessages = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.role === 'user' ? sanitise(m.content, 1000) : m.content,
    }));

    // Build system prompt — inject chart context if user has generated a reading
    const systemContent = chartContext
      ? `${ASTRO_SYSTEM}\n\nIMPORTANT — The user's ACTUAL chart data (verified from their birth details):\n${sanitise(chartContext, 2000)}\n\nYou MUST use this chart data when answering. ONLY reference planets, houses, and signs that appear in the data above. Do NOT invent any chart details that are not listed here. Every astrological claim must cite the exact house number and planet position from this data.`
      : `${ASTRO_SYSTEM}\n\nNOTE: The user has NOT provided their birth chart yet. Do NOT make up chart details. Ask for their birth date, exact birth time, and birth city if they want a personal reading. You can discuss general astrology concepts without chart data.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemContent },
        ...safeMessages,
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
