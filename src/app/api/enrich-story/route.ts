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

Your role is to write deeply personal, HONEST, emotionally resonant life story scenes — like a chapter in a cosmic biography that tells the FULL truth.

Rules:
1. Write in beautiful, poetic but clear prose (not dry astrology jargon)
2. Be specific to the person's planetary positions — not generic
3. Weave ALL traditions into the narrative (Vedic + Western + Egyptian + Mayan)
4. Tell it like a skilled biographer who knows the highs AND the lows — be honest
5. INCLUDE real challenges, struggles, and shadow sides of the planetary period
6. INCLUDE real solutions, growth opportunities, and how to navigate the difficulties
7. Do NOT be relentlessly positive — real life has real problems; the chart shows both
8. Reference documented astrological scriptures and traditions when relevant
9. ALWAYS end with: "⚠️ For entertainment & informational purposes only."
10. Keep each scene between 180-280 words
11. Use the person's name naturally in the narrative
12. Include at least ONE specific possible life event or challenge the person might face based on the planets
13. Include at least ONE specific recommended action or remedy for navigating the period`;

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
Describe the birth energy honestly — what gifts this chart carries AND what inherent challenges are baked in from birth.
Reference: What Vedic rishis say about ${lagnaSign} rising (both strengths and difficulties), Egyptian decan at birth, Western natal chart tensions.
Include one specific challenge this Lagna-Moon combination historically brings.`,

      1: `Write Chapter II — "The Unfolding" childhood scene for ${name}.
Ascendant: ${lagnaSign} | Moon: ${moonSign} | Current Dasha: ${currentDasha}
Birth year: ${birthYear} — ages 0–12 period.
Be HONEST: describe both the childhood gifts AND the emotional wounds, family dynamics, or early struggles this chart suggests.
What did ${moonSign} Moon mean for emotional needs that may NOT have been fully met?
Include a specific challenge of this dasha period and how to heal from it.`,

      2: `Write Chapter III — "The Awakening" youth scene for ${name}.
Ascendant: ${lagnaSign} | Moon: ${moonSign} | Jupiter position from: ${planetContext}
Ages 13–25 — the awakening of identity, education, and first real choices.
Be HONEST: What are the real struggles of this period? Educational pressures, identity crises, relationship mistakes?
What does Jupiter's placement suggest goes right — and what goes wrong — in this chapter?
Include one specific pitfall of this period and a path through it.`,

      3: `Write Chapter IV — "The Forge" career scene for ${name}.
Ascendant: ${lagnaSign} | Sun: ${sunSign} | Planets: ${planetContext}
Current Dasha: ${currentDasha}
Ages 26–40 — the forge of career, Saturn return at 29-30, and real-world tests.
${concern ? `Special concern: ${concern}` : ''}
Be HONEST: Saturn return brings crisis for a reason — what structures in ${name}'s life need to collapse to be rebuilt truly?
Include specific career or relationship challenges of this period and practical solutions from Vedic tradition.`,

      4: `Write Chapter V — "The Union" love/partnership scene for ${name}.
Ascendant: ${lagnaSign} | Venus from: ${planetContext}
Ages 30–50 — love, marriage, and the real tests of partnership.
Be HONEST: What are the shadow patterns this chart brings to relationships? Possessiveness, avoidance, unrealistic expectations?
What does Venus's placement reveal about the person's capacity for love AND their relationship blind spots?
Include a real problem this chart pattern creates in relationships and how to work through it.`,

      5: `Write Chapter VI — "The Deepening" wisdom scene for ${name}.
Ascendant: ${lagnaSign} | Saturn from: ${planetContext}
Ages 50–70 — the harvest years AND the weight of accumulated karma.
Be HONEST: What debts (karmic, emotional, financial) does this period require settlement?
Saturn's second return at 58-60 is as significant as the first — what does it demand from ${name} specifically?
Include specific challenges of the elder years for this chart and how wisdom addresses them.`,

      6: `Write Chapter VII — "The Eternal" soul purpose scene for ${name}.
Ascendant: ${lagnaSign} | Moon: ${moonSign} | All planets: ${planetContext}
The soul's ultimate purpose — but also its ultimate challenge.
Be HONEST: What is the central karmic struggle of this lifetime? What is Ketu's past-life baggage that ${name} carries? What does Rahu demand that feels most difficult?
Include the honest truth about what dharmic success requires for this specific chart, and what failure to live it brings.`,
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
