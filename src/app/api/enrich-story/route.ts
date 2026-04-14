import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/aiProvider';
import { budgetGuard, addTokens } from '@/lib/budget';
import { apiGuard, sanitise } from '@/lib/apiGuard';

// ─── System prompt — the astrology intelligence core ─────────────────────────
function buildSystemPrompt(pronouns: { sub: string; obj: string; pos: string }): string {
  return `You are a master astrologer and storyteller giving a deeply personal cosmic biography scene.

Rules:
1. The person's name is "the Seeker". Use ONLY "the Seeker" — NEVER invent or substitute any other name (e.g. Emily, Alex, Priya, John). Do not use any name other than "the Seeker".
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
10. Always refer to the person as "the Seeker" — never any other name.`;
}

export async function POST(req: NextRequest) {
  const blocked = apiGuard(req);
  if (blocked) return blocked;

  const budgetBlock = budgetGuard();
  if (budgetBlock) return budgetBlock;

  try {
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

    // ── Sanitise all user-supplied strings ───────────────────────────────────
    const safeGender = sanitise(gender, 30);
    const safeSceneTitle = sanitise(sceneTitle, 200);
    const safeLifeAge = sanitise(lifeAge, 50);
    const safeLagnaSign = sanitise(lagnaSign, 30);
    const safeMoonSign = sanitise(moonSign, 30);
    const safeSunSign = sanitise(sunSign, 30);
    const safeBirthCity = sanitise(birthCity, 150);
    const safeCurrentDasha = sanitise(currentDasha, 50);
    const safePlanet = sanitise(planet, 30);
    const safeConcern = sanitise(concern, 500);
    const safeBirthYear = typeof birthYear === 'number' ? birthYear : parseInt(sanitise(String(birthYear), 6)) || 1990;
    const safeSceneIndex = typeof sceneIndex === 'number' ? Math.min(Math.max(Math.floor(sceneIndex), 0), 6) : 0;
    const safePlanets = Array.isArray(planets) ? planets.slice(0, 12).map((p: { name: string; rashi: string; house: number }) => ({
      name: sanitise(p.name, 30),
      rashi: sanitise(p.rashi, 30),
      house: typeof p.house === 'number' ? Math.min(Math.max(Math.floor(p.house), 1), 12) : 1,
    })) : [];

    // ── PII: anonymise before sending to the AI ──────────────────────────────
    const anonName = 'the Seeker';  // real name never reaches the AI model

    // Determine pronouns from gender
    const pronouns = safeGender === 'female'
      ? { sub: 'she', obj: 'her', pos: 'her' }
      : safeGender === 'other'
        ? { sub: 'they', obj: 'them', pos: 'their' }
        : { sub: 'he', obj: 'him', pos: 'his' };

    // Build planet context string
    const planetContext = safePlanets
      .map((p: { name: string; rashi: string; house: number }) =>
        `${p.name} in ${p.rashi} (House ${p.house})`
      )
      .join(', ');

    // Build the user prompt for this specific scene
    const scenePrompts: Record<number, string> = {
      0: `Write Chapter I — "The Arrival" for ${anonName}'s cosmic biography.
Born ${safeBirthYear} in ${safeBirthCity}. Ascendant: ${safeLagnaSign} | Moon: ${safeMoonSign} | Sun: ${safeSunSign}
Planets at birth: ${planetContext}

Opening: What energies ${anonName} came into this world carrying — what gifts AND what heavy karmic debts were baked in from day one. Be specific about what ${safeLagnaSign} rising + ${safeMoonSign} Moon creates in a real person (not just planet meanings — what their LIFE feels like).

Challenge: What is the core difficulty of this birth chart? (e.g., Moon-Saturn tension, Manglik influence, 8th house stellium — name it and what it means for their actual lived experience)

Lesson: What one astrological tradition (Vedic/Egyptian/Mayan) says is the path through this birth challenge for ${safeLagnaSign} rising.`,

      1: `Write Chapter II — "The Unfolding" for ${anonName}'s childhood (ages 0–12).
Ascendant: ${safeLagnaSign} | Moon: ${safeMoonSign} | Planets: ${planetContext}
Birth year: ${safeBirthYear}

Opening: What ${anonName}'s early emotional world was like — what their home life, relationships with parents, and core childhood emotional pattern was based on ${safeMoonSign} Moon. Be specific and personal, not generic.

Challenge: What specific emotional wound or family dynamic does this chart suggest ${anonName} likely carried from childhood? (Name the planet + house creating it)

Lesson: What Vedic tradition recommends for healing this particular childhood wound. Give one practical remedy or shift.`,

      2: `Write Chapter III — "The Awakening" for ${anonName} (ages 13–25).
Ascendant: ${safeLagnaSign} | Moon: ${safeMoonSign} | Jupiter: ${safePlanets.find((p: { name: string }) => p.name === 'Jupiter') ? `House ${safePlanets.find((p: { name: string }) => p.name === 'Jupiter')?.house}` : 'unknown'}
Full chart: ${planetContext}

Opening: What ${anonName}'s awakening years felt like — the identity questions, educational choices, and first real relationships shaped by this specific chart. What did ${safeLagnaSign} rising as a young adult look like in real life?

Challenge: What is the specific pitfall of this age period for this chart — the mistake or pain most likely to hit between 18–25 based on Jupiter's placement and the running dasha?

Lesson: What specific action or mindset shift would help ${anonName} navigate this chapter's challenge successfully.`,

      3: `Write Chapter IV — "The Forge" for ${anonName} (ages 26–40).
Ascendant: ${safeLagnaSign} | Sun: ${safeSunSign} | Current Dasha: ${safeCurrentDasha}
Planets: ${planetContext}
${safeConcern ? `Their stated concern: "${safeConcern}"` : ''}

Opening: What ${anonName}'s career forge years are actually about — not just ambition but what Saturn's first return at 29-30 demanded of them specifically. Be direct about their actual 10th house sign and career direction.

Challenge: What is the specific career or relationship obstacle this chart creates in the 30s? Name the planet, its position, and what real-life problem it causes for ${anonName}.

Lesson: What Vedic tradition (specific dasha timing, Saturn remedy, Jupiter transit window) gives ${anonName} the clearest path through this decade's challenges.`,

      4: `Write Chapter V — "The Union" for ${anonName} (ages 30–50).
Ascendant: ${safeLagnaSign} | Venus: ${safePlanets.find((p: { name: string }) => p.name === 'Venus') ? `${safePlanets.find((p: { name: string }) => p.name === 'Venus')?.rashi} House ${safePlanets.find((p: { name: string }) => p.name === 'Venus')?.house}` : 'unknown'}
7th house context from: ${planetContext}

Opening: What ${anonName}'s relationship chapter actually looks like — what Venus's exact placement creates in their love life, who they attract, and what the pattern of their partnerships has been.

Challenge: What is the shadow pattern this chart brings to relationships — possessiveness, avoidance, fear of commitment, or attracting the wrong partners? Name the specific planetary cause.

Lesson: What one thing ${anonName} must genuinely change or accept about themselves to experience deeper love, based on their Venus and 7th house.`,

      5: `Write Chapter VI — "The Deepening" for ${anonName} (ages 50–70).
Ascendant: ${safeLagnaSign} | Saturn: ${safePlanets.find((p: { name: string }) => p.name === 'Saturn') ? `${safePlanets.find((p: { name: string }) => p.name === 'Saturn')?.rashi} House ${safePlanets.find((p: { name: string }) => p.name === 'Saturn')?.house}` : 'unknown'}
Full chart: ${planetContext}

Opening: What the harvest years look like for ${anonName} — what has been built, what must be surrendered, and what Saturn's second return at 58-60 demands of this specific chart.

Challenge: What karmic debt or structural collapse does this period bring for ${anonName}? Be specific — which house, which area of life (health/career/relationship) is Saturn testing?

Lesson: What wisdom or practice from Vedic tradition gives ${anonName} peace and purpose in this chapter. Be practical.`,

      6: `Write Chapter VII — "The Eternal" for ${anonName}'s soul purpose.
Ascendant: ${safeLagnaSign} | Moon: ${safeMoonSign}
Rahu-Ketu axis + all planets: ${planetContext}

Opening: What ${anonName}'s soul came here to ultimately experience — stated in plain language (not mystical jargon). What Rahu's house/sign is pulling them toward that feels uncomfortable but essential.

Challenge: What is the central karmic battle of this lifetime for ${anonName}? What does Ketu's comfort zone keep pulling them back to, preventing real growth?

Lesson: What one transformative action — based on Rahu's placement and the Atmakaraka planet — would most radically shift ${anonName}'s life in the direction of their soul's true purpose.`,
    };

    const userPrompt = scenePrompts[safeSceneIndex] || `Write a cosmic life story scene for ${anonName} 
about "${safeSceneTitle}" (${safeLifeAge}) with ruling planet ${safePlanet}.
Their chart: Lagna ${safeLagnaSign}, Moon ${safeMoonSign}, Sun ${safeSunSign}.
Planets: ${planetContext}`;

    // Call AI — 3-tier fallback: Gemini → Cerebras → Groq
    const result = await callAI({
      messages: [
        { role: 'system', content: buildSystemPrompt(pronouns) },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 500,
      temperature: 0.8,
    });

    addTokens(result.tokensUsed);

    return NextResponse.json({
      enriched: result.text,
      sceneIndex,
      model: `${result.provider} (free tier)`,
      tokensUsed: result.tokensUsed,
    });

  } catch (error: unknown) {
    console.error('Enrich story API error:', error);
    return NextResponse.json(
      { error: 'Story generation unavailable. Please try again.', enriched: null },
      { status: 500 }
    );
  }
}
