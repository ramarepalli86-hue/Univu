import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// ─── Groq client — lazy initialized so missing key won't crash build ──────────
// FREE tier: 14,400 requests/day. Sign up free at https://console.groq.com
function getGroqClient(): Groq | null {
  // Key name: Grok_Univu_Key (prefix pattern for future keys e.g. OpenAI_Univu_Key)
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// ─── System prompt — the astrology intelligence core ─────────────────────────
const SYSTEM_PROMPT = `You are a master astrologer and storyteller with deep knowledge of:
- Vedic/Jyotish astrology (Lahiri ayanamsa, nakshatras, dashas, yogas, rashis)
- Western astrology (tropical zodiac, houses, aspects, progressions, transits)
- Egyptian/Hellenistic astrology (decans, lots, Thema Mundi, Heliopolis tradition)
- Babylonian/Mesopotamian astrology (omens, fixed stars, lunar calendar)
- Chinese/Eastern astrology (Five Elements, Heavenly Stems, Earthly Branches)
- Mayan calendar (Tzolkin, Long Count, day signs, trecena)
- Middle Eastern Islamic astrology (Arabic Parts, fixed stars, planetary hours)

Your role is to take a person's astrological data and write a deeply personal, 
emotionally resonant life story scene — like a chapter in a cosmic biography.

Rules:
1. Write in beautiful, poetic but clear prose (not dry astrology jargon)
2. Be specific to the person's planetary positions — not generic
3. Weave ALL traditions into the narrative (Vedic + Western + Egyptian + Mayan)
4. Tell it like a movie narrator describing a real person's life journey
5. Include references to documented astrological scriptures and traditions
6. ALWAYS end with: "⚠️ For entertainment & informational purposes only."
7. Keep each scene between 150-250 words
8. Use the person's name naturally in the narrative`;

export async function POST(req: NextRequest) {
  try {
    // Check API key — if missing, return gracefully (app still works without AI)
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json(
        { error: 'API key not configured. Set Grok_Univu_Key in environment variables.', enriched: null },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      name,
      sceneIndex,
      sceneTitle,
      lifeAge,
      lagnaSign,
      moonSign,
      sunSign,
      birthYear,
      birthCity,
      currentDasha,
      planet,
      planets = [],
      concern = '',
    } = body;

    if (!name || sceneIndex === undefined) {
      return NextResponse.json({ error: 'name and sceneIndex required' }, { status: 400 });
    }

    // Build planet context string
    const planetContext = planets
      .map((p: { name: string; rashi: string; house: number }) =>
        `${p.name} in ${p.rashi} (House ${p.house})`
      )
      .join(', ');

    // Build the user prompt for this specific scene
    const scenePrompts: Record<number, string> = {
      0: `Write Chapter I — "The Arrival" for ${name}'s cosmic biography.
Birth year: ${birthYear}, born in ${birthCity}.
Ascendant/Lagna: ${lagnaSign} | Moon: ${moonSign} | Sun: ${sunSign}
Planets: ${planetContext}
This is the birth scene — the soul choosing incarnation, the cosmic alignment at birth.
Reference: What the Vedic rishis say about ${lagnaSign} rising, Egyptian decan at birth, Western natal chart energy.`,

      1: `Write Chapter II — "The Unfolding" childhood scene for ${name}.
Ascendant: ${lagnaSign} | Moon: ${moonSign} | Current Dasha: ${currentDasha}
Birth year: ${birthYear} — ages 0–12 period.
Describe: early personality, home environment, what the Moon sign reveals about childhood emotional needs.
Reference Vedic texts on Moon's nakshatra influence on early childhood.`,

      2: `Write Chapter III — "The Awakening" youth scene for ${name}.
Ascendant: ${lagnaSign} | Moon: ${moonSign} | Jupiter position from: ${planetContext}
Ages 13–25 — the awakening of identity, learning, first ambitions.
Reference Jupiter's role as teacher in Vedic tradition, Western transit of Jupiter, educational destiny.`,

      3: `Write Chapter IV — "The Forge" career scene for ${name}.
Ascendant: ${lagnaSign} | Sun: ${sunSign} | Planets: ${planetContext}
Current Dasha: ${currentDasha}
Ages 26–40 — the forge of ambition, career, Saturn return at 29-30.
${concern ? `Special concern: ${concern}` : ''}
Reference: Vedic 10th house analysis, Egyptian solar decan, Western progressed chart.`,

      4: `Write Chapter V — "The Union" love/partnership scene for ${name}.
Ascendant: ${lagnaSign} | Venus from: ${planetContext}
Ages 30–50 — love, marriage, deep partnerships, the union of souls.
Reference: Vedic 7th house + Venus placement, Babylonian love omens, Egyptian Isis-Osiris mythology in the chart.`,

      5: `Write Chapter VI — "The Deepening" wisdom scene for ${name}.
Ascendant: ${lagnaSign} | Saturn from: ${planetContext}
Ages 50–70 — the harvest years, wisdom, legacy, Sade Sati if applicable.
Reference: Vedic elder stages (Vanaprastha), Saturn's second return, Egyptian concept of Ma'at (truth in later life).`,

      6: `Write Chapter VII — "The Eternal" soul purpose scene for ${name}.
Ascendant: ${lagnaSign} | Moon: ${moonSign} | All planets: ${planetContext}
The soul's ultimate purpose, past life karma (Ketu), future direction (Rahu), dharmic mission.
Reference: Vedic Moksha (12th house), Egyptian concept of Ba and Ka (soul), Mayan Long Count destiny.`,
    };

    const userPrompt = scenePrompts[sceneIndex] || `Write a cosmic life story scene for ${name} 
about "${sceneTitle}" (${lifeAge}) with ruling planet ${planet}.
Their chart: Lagna ${lagnaSign}, Moon ${moonSign}, Sun ${sunSign}.
Planets: ${planetContext}`;

    // Call Groq — FREE (Llama 3.3 70B, 14,400 req/day free tier)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 350,
      temperature: 0.8,
    });

    const enrichedText = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Log usage for cost tracking (fire-and-forget, don't block response)
    fetch(`${req.nextUrl.origin}/api/usage-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokensUsed }),
    }).catch(() => {}); // silent — never block the story response

    return NextResponse.json({
      enriched: enrichedText,
      sceneIndex,
      model: 'groq/llama-3.3-70b-versatile (free)',
      tokensUsed,
    });

  } catch (error: unknown) {
    console.error('Enrich story API error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: msg, enriched: null },
      { status: 500 }
    );
  }
}
