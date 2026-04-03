import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

function getGroqClient(): Groq | null {
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// Each section type → what the AI should produce
const SECTION_PROMPTS: Record<string, (ctx: ReadingContext) => string> = {

  overview: (ctx) => `You are a warm, wise astrologer speaking directly to ${ctx.name}.
Write a 3-paragraph PERSONAL introduction to their cosmic blueprint.
Start with their NAME. Make it feel like you KNOW them — not a generic reading.

Their chart:
- Born: ${ctx.dob} in ${ctx.birthCity}
- Lagna (Ascendant): ${ctx.lagnaSign} — this shapes their personality, body, first impression
- Moon Sign: ${ctx.moonSign} — this is their emotional world, inner self
- Birth Nakshatra: ${ctx.moonNakshatraName} Pada ${ctx.moonNakshatraPada} — their soul's star
- Current Major Period (Mahadasha): ${ctx.currentDasha}
- Current Sub-Period (Antardasha): ${ctx.currentAntardasha}
- Gender: ${ctx.gender}
- Marital Status: ${ctx.maritalStatus}
- Occupation: ${ctx.employment}
${ctx.concern ? `- Their specific question/concern: "${ctx.concern}"` : ''}

Rules:
1. Address ${ctx.name} directly ("You are...", "Your life shows...", "Right now you...")
2. Paragraph 1: Who they are at their core — what ${ctx.lagnaSign} rising + ${ctx.moonSign} Moon creates in a real person
3. Paragraph 2: What the current ${ctx.currentDasha}/${ctx.currentAntardasha} period means for their life RIGHT NOW — specific, real
4. Paragraph 3: One honest truth about a challenge they are likely facing + one genuine strength to rely on
5. NO generic planet descriptions. Every sentence must be about THIS person.
6. End with: "⚠️ For entertainment & informational purposes only."`,

  love: (ctx) => `You are a direct, warm astrologer speaking privately to ${ctx.name} about their love life.

Their profile:
- Name: ${ctx.name}, Gender: ${ctx.gender}, Marital Status: ${ctx.maritalStatus}
- Lagna: ${ctx.lagnaSign} | Moon: ${ctx.moonSign} | Venus: ${ctx.venusSign} (House ${ctx.venusHouse})
- 7th house sign: ${ctx.seventhHouseSign} | 7th lord: ${ctx.seventhHouseLord}
- Manglik status: ${ctx.isManglik ? 'YES — Mars in house ' + ctx.marsHouse : 'No Manglik dosha'}
- Current Dasha: ${ctx.currentDasha} / Antardasha: ${ctx.currentAntardasha}
- Planets in 7th house: ${ctx.planetsIn7 || 'None'}
${ctx.concern ? `- Their specific concern: "${ctx.concern}"` : ''}

Write 4 sections, each with a bold heading and 2-3 sentences. Be DIRECT and PERSONAL:

**Why ${ctx.name} attracts the partners they do**
[Based on Venus sign + 7th house — what kind of people they pull in, good and bad]

**The real reason marriage ${ctx.maritalStatus === 'single' ? 'has been delayed' : 'has unfolded this way'}**
[Be honest — if Manglik, Saturn influence, Rahu in 7th etc — name it plainly. Give the astrological reason in plain language]

**What ${ctx.name} needs in a partner (that they may not admit)**
[Based on 7th house lord + Moon sign — the emotional truth about partnership needs]

**What ${ctx.maritalStatus === 'single' ? 'will bring marriage closer' : 'deepens the bond now'} — Timing**
[Which dasha/transit period opens marriage doors. Be specific about years if possible based on dasha]

End with: "⚠️ For entertainment & informational purposes only."`,

  career: (ctx) => `You are speaking directly to ${ctx.name} about their career and finances.

Their profile:
- Name: ${ctx.name}, Employment: ${ctx.employment}
- Lagna: ${ctx.lagnaSign} | Sun Sign: ${ctx.sunSign}
- 10th house sign: ${ctx.tenthHouseSign} | 10th lord: ${ctx.tenthHouseLord}
- Saturn position: ${ctx.saturnSign} House ${ctx.saturnHouse}
- Jupiter position: ${ctx.jupiterSign} House ${ctx.jupiterHouse}
- Current Dasha: ${ctx.currentDasha} / Antardasha: ${ctx.currentAntardasha}
${ctx.concern ? `- Their specific concern: "${ctx.concern}"` : ''}

Write 4 sections with bold headings, 2-3 sentences each. Be DIRECT and PERSONAL:

**${ctx.name}'s natural career strength**
[What ${ctx.lagnaSign} rising + 10th house sign tells about what they're built for professionally]

**The current chapter — what ${ctx.currentDasha} Dasha means for work right now**
[Specific to this dasha: is this a growth period, a waiting period, a restructuring period?]

**The hidden obstacle in ${ctx.name}'s career path**
[Saturn's position, debilitated planets, or 10th lord challenges — name it honestly]

**Best career moves in the next 12-24 months**
[Based on upcoming dasha transitions and Jupiter/Saturn transits — actionable advice]

End with: "⚠️ For entertainment & informational purposes only."`,

  health: (ctx) => `You are speaking privately to ${ctx.name} about their health and vitality.

Their profile:
- Lagna: ${ctx.lagnaSign} (governs: ${ctx.lagnaBodyPart})
- 6th house sign: ${ctx.sixthHouseSign} (chronic vulnerabilities)
- 8th house sign: ${ctx.eighthHouseSign} (acute/sudden events)
- Moon sign: ${ctx.moonSign} (mental health, emotions)
- Mars position: ${ctx.marsSign} House ${ctx.marsHouse}
- Saturn position: ${ctx.saturnSign} House ${ctx.saturnHouse}
- Planets in 6th house: ${ctx.planetsIn6 || 'None'}
- Current Dasha: ${ctx.currentDasha}
- Gender: ${ctx.gender}

Write 4 sections with bold headings. Be SPECIFIC and CARING, not alarming:

**${ctx.name}'s constitutional body type and natural vitality**
[What ${ctx.lagnaSign} rising means for body type, energy levels, and natural strengths]

**The health areas that need attention**
[6th house + any afflicted planets — name the specific body systems honestly but gently]

**How ${ctx.currentDasha} Dasha is affecting the body right now**
[This dasha's specific health signature — what to watch, what to support]

**3 practical daily habits that align with your chart**
[Specific to their Lagna + Moon sign — diet, sleep, exercise that genuinely matches their astrology]

End with: "⚠️ For entertainment & informational purposes only. Not medical advice."`,

  timeline: (ctx) => `You are speaking to ${ctx.name} about the key periods of their life — past, present, and future.

Their profile:
- Born: ${ctx.dob} in ${ctx.birthCity}
- Current age: approximately ${ctx.currentAge}
- Current Dasha: ${ctx.currentDasha} (${ctx.currentDashaYears})
- Current Antardasha: ${ctx.currentAntardasha}
- Next major Dasha: ${ctx.nextDasha} (starts around ${ctx.nextDashaYear})
- Saturn Return age: ~29-30
- Lagna: ${ctx.lagnaSign} | Moon: ${ctx.moonSign}
- Sade Sati active: ${ctx.sadeSatiActive ? 'YES — Saturn near Moon sign, intensified testing period' : 'No'}
${ctx.concern ? `- Their concern: "${ctx.concern}"` : ''}

Write 4 sections with bold headings, 3-4 sentences each. Be HONEST — both challenges and growth:

**What the past years have been building toward**
[Based on what dasha they just came through or are in — what this chapter of life is really about]

**RIGHT NOW: The honest truth about ${ctx.currentDasha}/${ctx.currentAntardasha}**
[What this specific combination brings — good AND difficult. What decisions matter most right now]

**The turning point coming: ${ctx.nextDasha} Dasha (${ctx.nextDashaYear})**
[What changes, what becomes possible, what challenges this next major period brings]

**The ages/windows that matter most for ${ctx.name}**
[Saturn returns, Jupiter returns, Rahu returns, and dasha transitions — name specific ages and what they mean]

End with: "⚠️ For entertainment & informational purposes only."`,

  spiritual: (ctx) => `You are speaking soul-to-soul with ${ctx.name} about their deeper purpose.

Their profile:
- Atmakaraka (Soul planet): ${ctx.atmakaraka} — the planet of their soul's deepest desire
- Rahu (North Node): ${ctx.rahuSign} House ${ctx.rahuHouse} — where the soul is headed
- Ketu (South Node): ${ctx.ketuSign} House ${ctx.ketuHouse} — past-life mastery, current comfort zone
- Moon Nakshatra: ${ctx.moonNakshatraName} — deity: ${ctx.nakshatraDeity}
- 9th house (Dharma): ${ctx.ninthHouseSign}
- 12th house (Moksha): ${ctx.twelfthHouseSign}
- Current Dasha: ${ctx.currentDasha}

Write 4 sections with bold headings, 3 sentences each. Be profound but accessible:

**${ctx.name}'s soul mission in plain language**
[Rahu house + Atmakaraka — what they are here to experience and master, stated clearly not mystically]

**The past-life gift they keep falling back on (Ketu)**
[What Ketu house/sign reveals about their comfort zone — why it feels safe but won't fulfill them]

**The karmic pattern that keeps repeating**
[Based on Rahu-Ketu axis + current dasha — what cycle keeps showing up until they learn its lesson]

**The practice that would transform ${ctx.name}'s life most**
[Based on 9th house + nakshatra deity + atmakaraka — specific, genuine recommendation]

End with: "⚠️ For entertainment & informational purposes only."`,
};

export interface ReadingContext {
  name: string;
  dob: string;
  birthCity: string;
  gender: string;
  maritalStatus: string;
  employment: string;
  concern: string;
  lagnaSign: string;
  moonSign: string;
  sunSign: string;
  moonNakshatraName: string;
  moonNakshatraPada: number;
  nakshatraDeity: string;
  currentDasha: string;
  currentAntardasha: string;
  currentDashaYears: string;
  nextDasha: string;
  nextDashaYear: string;
  currentAge: number;
  isManglik: boolean;
  marsHouse: number;
  marsSign: string;
  venusSign: string;
  venusHouse: number;
  saturnSign: string;
  saturnHouse: number;
  jupiterSign: string;
  jupiterHouse: number;
  rahuSign: string;
  rahuHouse: number;
  ketuSign: string;
  ketuHouse: number;
  seventhHouseSign: string;
  seventhHouseLord: string;
  tenthHouseSign: string;
  tenthHouseLord: string;
  sixthHouseSign: string;
  eighthHouseSign: string;
  ninthHouseSign: string;
  twelfthHouseSign: string;
  lagnaBodyPart: string;
  planetsIn7: string;
  planetsIn6: string;
  atmakaraka: string;
  sadeSatiActive: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json({ error: 'API key not configured', text: null }, { status: 503 });
    }

    const body = await req.json();
    const { section, context }: { section: string; context: ReadingContext } = body;

    if (!section || !context) {
      return NextResponse.json({ error: 'section and context required' }, { status: 400 });
    }

    const promptFn = SECTION_PROMPTS[section];
    if (!promptFn) {
      return NextResponse.json({ error: 'Unknown section: ' + section }, { status: 400 });
    }

    const userPrompt = promptFn(context);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a master Vedic astrologer with 30 years experience giving deeply personal readings. 
You speak directly to the person — using their name, their specific planets, their real life situation.
You NEVER give generic planet descriptions. Every sentence is about THIS specific person.
You balance honesty with compassion — you tell hard truths gently but clearly.
You write in warm, conversational English — like a wise friend who also happens to know astrology.
Format: Use **bold headings** exactly as instructed. No bullet points unless asked. Rich paragraphs.`,
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.75,
    });

    const text = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Fire-and-forget usage tracking
    fetch(`${req.nextUrl.origin}/api/usage-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokensUsed }),
    }).catch(() => {});

    return NextResponse.json({ text, section, tokensUsed });
  } catch (error: unknown) {
    console.error('Personal reading API error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg, text: null }, { status: 500 });
  }
}
