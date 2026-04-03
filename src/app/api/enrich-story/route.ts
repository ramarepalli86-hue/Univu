import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { budgetGuard, addTokens } from '@/lib/budget';

// ─── Groq client — lazy initialized so missing key won't crash build ──────────
function getGroqClient(): Groq | null {
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// ─── System prompt — the astrology intelligence core ─────────────────────────
function buildSystemPrompt(pronouns: { sub: string; obj: string; pos: string }): string {
  return `You are a master astrologer and storyteller giving a deeply personal cosmic biography scene.

Rules:
1. Write in vivid, clear prose directly about THIS person — use their name.
2. Use the correct pronouns throughout: subject="${pronouns.sub}", object="${pronouns.obj}", possessive="${pronouns.pos}". NEVER use the wrong gender pronoun.
3. Be specific to their planetary positions — no generic zodiac descriptions.
4. Weave Vedic + Western + Egyptian traditions naturally into the narrative.
5. Tell the FULL truth: real gifts AND real struggles. Never be relentlessly positive.
6. Structure EVERY scene with these three parts in order:
   - Opening narrative (2-3 sentences): what this life chapter IS for this person
   - Challenge: Start exactly with "Challenge: " followed by the specific obstacle, struggle or pain this period brings (1-2 sentences)
   - Lesson: Start exactly with "Lesson: " followed by the specific action, growth or remedy that navigates it (1-2 sentences)
7. Reference astrological traditions concretely (e.g., "Saturn's 2.5-year transit", "Rahu's insatiable hunger")
8. End with: "⚠️ For entertainment & informational purposes only."
9. Keep total length 200–280 words.
10. Always include the person's name naturally.`;
}

export async function POST(req: NextRequest) {
  const blocked = budgetGuard();
  if (blocked) return blocked;

  try {
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json(
        { error: 'API key not configured.', enriched: null },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      name,
      gender,
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

    // ── PII: anonymise before sending to the AI ──────────────────────────────
    const anonName = 'the Seeker';  // real name never reaches the AI model

    // Determine pronouns from gender
    const pronouns = gender === 'female'
      ? { sub: 'she', obj: 'her', pos: 'her' }
      : (gender === 'nonbinary' || gender === 'they' || gender === 'prefer_not')
        ? { sub: 'they', obj: 'them', pos: 'their' }
        : { sub: 'he', obj: 'him', pos: 'his' };

    // Build planet context string
    const planetContext = planets
      .map((p: { name: string; rashi: string; house: number }) =>
        `${p.name} in ${p.rashi} (House ${p.house})`
      )
      .join(', ');

    // Build the user prompt for this specific scene
    const scenePrompts: Record<number, string> = {
      0: `Write Chapter I — "The Arrival" for ${anonName}'s cosmic biography.
Born ${birthYear} in ${birthCity}. Ascendant: ${lagnaSign} | Moon: ${moonSign} | Sun: ${sunSign}
Planets at birth: ${planetContext}

Opening: What energies ${anonName} came into this world carrying — what gifts AND what heavy karmic debts were baked in from day one. Be specific about what ${lagnaSign} rising + ${moonSign} Moon creates in a real person (not just planet meanings — what their LIFE feels like).

Challenge: What is the core difficulty of this birth chart? (e.g., Moon-Saturn tension, Manglik influence, 8th house stellium — name it and what it means for their actual lived experience)

Lesson: What one astrological tradition (Vedic/Egyptian/Mayan) says is the path through this birth challenge for ${lagnaSign} rising.`,

      1: `Write Chapter II — "The Unfolding" for ${anonName}'s childhood (ages 0–12).
Ascendant: ${lagnaSign} | Moon: ${moonSign} | Planets: ${planetContext}
Birth year: ${birthYear}

Opening: What ${anonName}'s early emotional world was like — what their home life, relationships with parents, and core childhood emotional pattern was based on ${moonSign} Moon. Be specific and personal, not generic.

Challenge: What specific emotional wound or family dynamic does this chart suggest ${anonName} likely carried from childhood? (Name the planet + house creating it)

Lesson: What Vedic tradition recommends for healing this particular childhood wound. Give one practical remedy or shift.`,

      2: `Write Chapter III — "The Awakening" for ${anonName} (ages 13–25).
Ascendant: ${lagnaSign} | Moon: ${moonSign} | Jupiter: ${planets.find((p: { name: string }) => p.name === 'Jupiter') ? `House ${planets.find((p: { name: string }) => p.name === 'Jupiter')?.house}` : 'unknown'}
Full chart: ${planetContext}

Opening: What ${anonName}'s awakening years felt like — the identity questions, educational choices, and first real relationships shaped by this specific chart. What did ${lagnaSign} rising as a young adult look like in real life?

Challenge: What is the specific pitfall of this age period for this chart — the mistake or pain most likely to hit between 18–25 based on Jupiter's placement and the running dasha?

Lesson: What specific action or mindset shift would help ${anonName} navigate this chapter's challenge successfully.`,

      3: `Write Chapter IV — "The Forge" for ${anonName} (ages 26–40).
Ascendant: ${lagnaSign} | Sun: ${sunSign} | Current Dasha: ${currentDasha}
Planets: ${planetContext}
${concern ? `Their stated concern: "${concern}"` : ''}

Opening: What ${anonName}'s career forge years are actually about — not just ambition but what Saturn's first return at 29-30 demanded of them specifically. Be direct about their actual 10th house sign and career direction.

Challenge: What is the specific career or relationship obstacle this chart creates in the 30s? Name the planet, its position, and what real-life problem it causes for ${anonName}.

Lesson: What Vedic tradition (specific dasha timing, Saturn remedy, Jupiter transit window) gives ${anonName} the clearest path through this decade's challenges.`,

      4: `Write Chapter V — "The Union" for ${anonName} (ages 30–50).
Ascendant: ${lagnaSign} | Venus: ${planets.find((p: { name: string }) => p.name === 'Venus') ? `${planets.find((p: { name: string }) => p.name === 'Venus')?.rashi} House ${planets.find((p: { name: string }) => p.name === 'Venus')?.house}` : 'unknown'}
7th house context from: ${planetContext}

Opening: What ${anonName}'s relationship chapter actually looks like — what Venus's exact placement creates in their love life, who they attract, and what the pattern of their partnerships has been.

Challenge: What is the shadow pattern this chart brings to relationships — possessiveness, avoidance, fear of commitment, or attracting the wrong partners? Name the specific planetary cause.

Lesson: What one thing ${anonName} must genuinely change or accept about themselves to experience deeper love, based on their Venus and 7th house.`,

      5: `Write Chapter VI — "The Deepening" for ${anonName} (ages 50–70).
Ascendant: ${lagnaSign} | Saturn: ${planets.find((p: { name: string }) => p.name === 'Saturn') ? `${planets.find((p: { name: string }) => p.name === 'Saturn')?.rashi} House ${planets.find((p: { name: string }) => p.name === 'Saturn')?.house}` : 'unknown'}
Full chart: ${planetContext}

Opening: What the harvest years look like for ${anonName} — what has been built, what must be surrendered, and what Saturn's second return at 58-60 demands of this specific chart.

Challenge: What karmic debt or structural collapse does this period bring for ${anonName}? Be specific — which house, which area of life (health/career/relationship) is Saturn testing?

Lesson: What wisdom or practice from Vedic tradition gives ${anonName} peace and purpose in this chapter. Be practical.`,

      6: `Write Chapter VII — "The Eternal" for ${anonName}'s soul purpose.
Ascendant: ${lagnaSign} | Moon: ${moonSign}
Rahu-Ketu axis + all planets: ${planetContext}

Opening: What ${anonName}'s soul came here to ultimately experience — stated in plain language (not mystical jargon). What Rahu's house/sign is pulling them toward that feels uncomfortable but essential.

Challenge: What is the central karmic battle of this lifetime for ${anonName}? What does Ketu's comfort zone keep pulling them back to, preventing real growth?

Lesson: What one transformative action — based on Rahu's placement and the Atmakaraka planet — would most radically shift ${anonName}'s life in the direction of their soul's true purpose.`,
    };

    const userPrompt = scenePrompts[sceneIndex] || `Write a cosmic life story scene for ${anonName} 
about "${sceneTitle}" (${lifeAge}) with ruling planet ${planet}.
Their chart: Lagna ${lagnaSign}, Moon ${moonSign}, Sun ${sunSign}.
Planets: ${planetContext}`;

    // Call Groq — FREE (Llama 3.3 70B, 14,400 req/day free tier)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSystemPrompt(pronouns) },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const enrichedText = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    addTokens(tokensUsed);

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
