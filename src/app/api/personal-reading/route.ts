import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

function getGroqClient(): Groq | null {
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// Each section type → what the AI should produce
const SECTION_PROMPTS: Record<string, (ctx: ReadingContext) => string> = {

  overview: (ctx) => `You are speaking directly to ${ctx.name}. Write their personal cosmic overview.

Who ${ctx.name} IS:
- ${ctx.lagnaSign} Ascendant: this shapes how they appear to the world AND their relationship with their physical body and first impressions
- ${ctx.moonSign} Moon: this is their emotional default, what they need to feel safe, how they process feelings
- ${ctx.moonNakshatraName} birth star (Pada ${ctx.moonNakshatraPada}): the specific flavor of their soul
- Currently ${ctx.currentAge} years old, ${ctx.maritalStatus}, working as ${ctx.employment}
- Active dasha: ${ctx.currentDasha} Mahadasha / ${ctx.currentAntardasha} Antardasha
${ctx.concern ? `- Their specific question: "${ctx.concern}"` : ''}
- Manglik: ${ctx.isManglik ? 'YES' : 'No'} | Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE — intensified testing period' : 'Not active'}

Write 3 paragraphs directly to ${ctx.name}:

Paragraph 1 (WHO YOU ARE): What the combination of ${ctx.lagnaSign} rising + ${ctx.moonSign} Moon creates in a real human — NOT what these signs mean generically, but what the PERSON who has this combination is actually like. What do they struggle with? What do others notice about them first? What emotional pattern do they repeat?

Paragraph 2 (RIGHT NOW): What ${ctx.currentDasha}/${ctx.currentAntardasha} means specifically for ${ctx.name}'s life RIGHT NOW in ${new Date().getFullYear()}. Is this a building period or a releasing period? What area of life is being most activated? What is being demanded of them?

Paragraph 3 (HONEST TRUTH): One honest challenge ${ctx.name} is almost certainly facing right now based on their chart (be specific — name the house/planet causing it). Then one genuine strength they have that they may be underusing.

DO NOT start any sentence with generic planet facts. Every sentence must be about ${ctx.name} specifically.
End with: "⚠️ For entertainment & informational purposes only."`,

  love: (ctx) => `You are speaking privately with ${ctx.name} about their love life. Be direct, warm, and specific.

${ctx.name}'s love profile:
- ${ctx.maritalStatus.toUpperCase()} | Age ~${ctx.currentAge} | ${ctx.gender}
- Venus in ${ctx.venusSign} (House ${ctx.venusHouse}): this is HOW ${ctx.name} loves, what they find attractive, what they offer in relationships
- 7th house (marriage house): ${ctx.seventhHouseSign} | Ruled by ${ctx.seventhHouseLord} 
- Planets in 7th house: ${ctx.planetsIn7}
- ${ctx.isManglik ? `MANGLIK: Mars in House ${ctx.marsHouse} — this creates relationship intensity and potential volatility that needs awareness` : 'No Manglik dosha'}
- Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse}: ${ctx.saturnHouse === 7 ? 'Saturn directly aspects/influences marriage house — delays and lessons in partnership' : `delays wherever it sits — House ${ctx.saturnHouse}`}
- Current dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha}
${ctx.concern ? `- Their question: "${ctx.concern}"` : ''}

Write 4 sections, each with a bold heading:

**Why ${ctx.name} keeps attracting the partners they do**
[2-3 sentences — based on Venus sign + 7th house: what type of partner they pull in, and WHY — including the difficult patterns they attract because of their own unresolved needs]

**The real astrological reason marriage ${ctx.maritalStatus === 'single' ? 'hasn\'t happened yet' : 'has unfolded the way it has'}**
[2-3 sentences — be SPECIFIC: name the actual planets causing delay/difficulty. Is it Saturn's 7th house aspect? Manglik dosha? Rahu in 7th? Venus debilitated? Name it in plain language, not astro-jargon]

**What ${ctx.name} genuinely needs in a partner (not what they think they want)**
[2-3 sentences — based on Moon sign ${ctx.moonSign} and 7th house lord ${ctx.seventhHouseLord}: the emotional truth about what they actually need vs what they consciously seek]

**Timing: When and how marriage becomes more likely**
[2-3 sentences — name the specific dasha/antardasha period that historically brings marriage for this chart type. Be as specific as possible with years: "The ${ctx.nextDasha} period starting around ${ctx.nextDashaYear} brings…"]

End with: "⚠️ For entertainment & informational purposes only."`,

  career: (ctx) => `You are speaking directly to ${ctx.name} about their career path and finances.

${ctx.name}'s career profile:
- Employment: ${ctx.employment} | Age ~${ctx.currentAge}
- ${ctx.lagnaSign} Ascendant: shapes their natural working style and approach
- 10th house (career): ${ctx.tenthHouseSign} ruled by ${ctx.tenthHouseLord}
- Sun in ${ctx.sunSign}: their core drive and leadership style
- Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse}: where discipline and delay operate
- Jupiter in ${ctx.jupiterSign} House ${ctx.jupiterHouse}: where growth and opportunity emerge
- Current Dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha}
- Next major period: ${ctx.nextDasha} starts ~${ctx.nextDashaYear}
${ctx.concern ? `- Their concern: "${ctx.concern}"` : ''}

Write 4 sections with bold headings:

**What ${ctx.name} is genuinely built for professionally**
[2-3 sentences — what ${ctx.lagnaSign} rising + ${ctx.tenthHouseSign} 10th house creates in terms of career strengths. Don't list jobs — describe the WAY they work and what ENVIRONMENT suits them. What do colleagues notice about them?]

**What ${ctx.currentDasha} Dasha means for ${ctx.name}'s work right now**
[2-3 sentences — is this a visibility period? A behind-the-scenes period? A restructuring period? What should ${ctx.name} be actively doing or avoiding in their career in ${new Date().getFullYear()}?]

**The hidden obstacle blocking ${ctx.name}'s career potential**
[2-3 sentences — be HONEST. Name the specific planetary placement or aspect that creates the main career blockage. Saturn's house position, a debilitated 10th lord, Sun in a difficult house — what is it and how does it show up in their actual work life?]

**Best moves for ${ctx.name} in the next 12-24 months**
[2-3 sentences — based on when ${ctx.nextDasha} begins and Jupiter's current influence, what SPECIFIC actions (not generic advice) should ${ctx.name} take? What window is opening?]

End with: "⚠️ For entertainment & informational purposes only."`,

  health: (ctx) => `You are speaking privately to ${ctx.name} about their health and body.

${ctx.name}'s health profile:
- ${ctx.lagnaSign} Ascendant → body governs: ${ctx.lagnaBodyPart}
- 6th house (chronic health): ${ctx.sixthHouseSign} — where recurring health issues tend to manifest
- 8th house (acute/crisis health): ${ctx.eighthHouseSign}
- Moon in ${ctx.moonSign} — governs mind, emotions, gut, sleep
- Mars in ${ctx.marsSign} House ${ctx.marsHouse} — energy, inflammation, accidents
- Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse} — chronic conditions, bone/joint issues, discipline
- Planets in 6th house: ${ctx.planetsIn6}
- Current Dasha: ${ctx.currentDasha} — ${ctx.currentDasha === 'Saturn' ? 'Saturn dasha is notorious for bringing chronic fatigue, depression, and bone issues' : ctx.currentDasha === 'Mars' ? 'Mars dasha brings inflammation, accidents, and high energy that needs grounding' : ctx.currentDasha === 'Rahu' ? 'Rahu dasha brings mysterious illnesses, anxiety, and confusion in diagnosis' : 'health expression of this planet'}
- Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE — emotional heaviness and physical depletion are common' : 'Not active'}
- Gender: ${ctx.gender}

Write 4 sections with bold headings:

**${ctx.name}'s body type and natural energy pattern**
[2-3 sentences — what ${ctx.lagnaSign} Ascendant creates in terms of physical constitution, energy levels, and what ${ctx.name}'s body naturally needs. Not generic sign traits — what their specific body tends to feel like day-to-day]

**The health areas ${ctx.name} must pay attention to**
[2-3 sentences — based on 6th house ${ctx.sixthHouseSign} and planets in 6th, name the SPECIFIC body systems or health areas that are this person's vulnerable points. Be clear and non-alarming]

**How ${ctx.currentDasha} Dasha is affecting ${ctx.name}'s body right now**
[2-3 sentences — what this specific dasha planet's energy does to health when it runs. What symptoms or states might ${ctx.name} notice? What is their body trying to tell them?]

**3 daily practices that genuinely match ${ctx.name}'s chart**
[3 specific habits — one for body (based on Lagna), one for mind (based on Moon in ${ctx.moonSign}), one for energy (based on current dasha). Be specific, not generic "eat well and sleep" advice]

End with: "⚠️ For entertainment & informational purposes only. This is NOT medical advice."`,

  timeline: (ctx) => `You are speaking directly to ${ctx.name} about the key chapters of their life — past, present, and future.

${ctx.name}'s timeline:
- Born: ${ctx.dob} in ${ctx.birthCity} | Current age: ~${ctx.currentAge}
- Current Dasha: ${ctx.currentDasha} (${ctx.currentDashaYears})
- Current Antardasha: ${ctx.currentAntardasha}
- Next major Dasha: ${ctx.nextDasha} (starts ~${ctx.nextDashaYear})
- Saturn Return: age 29-30 (year ~${parseInt(ctx.dob.split('-')[0],10)+29}) and age 58-60
- Jupiter Return: every 12 years (ages 12, 24, 36, 48, 60)
- Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE NOW — this 7.5-year Saturn transit near your Moon sign is in progress' : 'Not currently active'}
- Lagna: ${ctx.lagnaSign} | Moon: ${ctx.moonSign}
${ctx.concern ? `- Their concern: "${ctx.concern}"` : ''}

Write 4 sections with bold headings:

**What ${ctx.name}'s life has been building toward (the past chapter)**
[2-3 sentences — what dasha they were in before ${ctx.currentDasha} and what that period was testing, building, or clearing in their life. What foundation (good or difficult) did it lay?]

**RIGHT NOW in ${new Date().getFullYear()}: The honest truth about ${ctx.name}'s current period**
[3-4 sentences — what ${ctx.currentDasha}/${ctx.currentAntardasha} specifically brings for this person. What is being demanded? What is possible? What mistake to avoid? Be DIRECT — not every dasha is easy, say so honestly]

**The coming shift: ${ctx.nextDasha} Dasha starting ~${ctx.nextDashaYear}**
[2-3 sentences — what changes when ${ctx.nextDasha} takes over. What new energy, theme, or opportunity opens? What challenge does ${ctx.nextDasha} bring that ${ctx.name} should prepare for?]

**The specific ages that matter most for ${ctx.name}**
[3-4 sentences — name actual ages: Saturn return, Jupiter return years, the ${ctx.nextDasha} start year, any Rahu/Ketu returns at age 18-19 and 36-37. Tell ${ctx.name} what each age window means for their specific chart]

End with: "⚠️ For entertainment & informational purposes only."`,

  spiritual: (ctx) => `You are speaking soul-to-soul with ${ctx.name} about their deepest purpose.

${ctx.name}'s soul profile:
- Atmakaraka (Soul planet): ${ctx.atmakaraka} — the planet with the highest degree, representing the soul's core desire and lesson
- Rahu (North Node) in ${ctx.rahuSign} House ${ctx.rahuHouse}: what this soul is MEANT to move toward — it feels uncomfortable, foreign, destabilizing, but that discomfort is the path
- Ketu (South Node) in ${ctx.ketuSign} House ${ctx.ketuHouse}: past-life mastery — deeply comfortable, but staying there creates stagnation
- Moon Nakshatra: ${ctx.moonNakshatraName} — presiding deity: ${ctx.nakshatraDeity}
- 9th house (dharma/faith): ${ctx.ninthHouseSign}
- 12th house (moksha/liberation): ${ctx.twelfthHouseSign}
- Current Dasha: ${ctx.currentDasha}

Write 4 sections with bold headings. Be profound but speak in plain language — no mystical jargon:

**${ctx.name}'s soul mission in plain language**
[2-3 sentences — translate Rahu in House ${ctx.rahuHouse}/${ctx.rahuSign} into a real-world description of what ${ctx.name} is here to BUILD, EXPERIENCE, and MASTER in this lifetime. Not "your north node calls you to…" — say WHAT it means in their actual life path]

**The past-life comfort zone Ketu keeps pulling ${ctx.name} back to**
[2-3 sentences — what Ketu in House ${ctx.ketuHouse}/${ctx.ketuSign} represents as the overused talent or safety net. What does ${ctx.name} default to when life gets hard? Why does it feel comfortable but ultimately hollow?]

**The repeating karmic pattern in ${ctx.name}'s life**
[2-3 sentences — what the Rahu-Ketu axis + ${ctx.atmakaraka} as Atmakaraka creates as a recurring life theme or lesson. What situation or relationship dynamic keeps showing up until ${ctx.name} genuinely integrates it?]

**The one practice that would most transform ${ctx.name}'s life**
[2-3 sentences — based on ${ctx.moonNakshatraName} Nakshatra deity ${ctx.nakshatraDeity}, Atmakaraka ${ctx.atmakaraka}, and 9th house ${ctx.ninthHouseSign} — give one SPECIFIC, genuine spiritual or life practice (not generic meditation advice) that aligns with this chart]

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
      max_tokens: 800,
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
