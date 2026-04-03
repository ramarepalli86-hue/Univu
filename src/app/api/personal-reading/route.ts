import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { budgetGuard, addTokens } from '@/lib/budget';
import { apiGuard } from '@/lib/apiGuard';

function getGroqClient(): Groq | null {
  const apiKey = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

const SECTION_PROMPTS: Record<string, (ctx: ReadingContext) => string> = {

  overview: (ctx) => `You are speaking directly to ${ctx.name}. Write their personal cosmic overview.

Chart data:
- ${ctx.lagnaSign} Ascendant | ${ctx.moonSign} Moon | ${ctx.moonNakshatraName} Nakshatra Pada ${ctx.moonNakshatraPada}
- Age ~${ctx.currentAge}, ${ctx.maritalStatus}, ${ctx.employment}
- Current dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha} (${ctx.currentDashaYears})
- Next dasha: ${ctx.nextDasha} starts ~${ctx.nextDashaYear}
- Manglik: ${ctx.isManglik ? 'YES' : 'No'} | Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE NOW' : 'Not active'}
${ctx.concern ? `- Their question: "${ctx.concern}"` : ''}

Write 4 sections with bold headings. Every sentence must be about ${ctx.name} specifically — NEVER generic planet facts.

**Who ${ctx.name} really is**
What ${ctx.lagnaSign} rising + ${ctx.moonSign} Moon creates in a REAL person — not sign definitions, but what their inner world feels like, what others notice, what emotional pattern they repeat, what they secretly struggle with.

**What is happening in ${ctx.name}'s life RIGHT NOW (${new Date().getFullYear()})**
What ${ctx.currentDasha} / ${ctx.currentAntardasha} is activating for them specifically. Which area of life is under pressure? What is being tested or opened? Be direct — if this is a hard period, say so.

**The main challenge ${ctx.name} faces right now**
Name the exact house and planet causing the biggest current difficulty. What does it look like in their actual daily life — not what the planet "represents" but what ${ctx.name} is actually experiencing.

**📅 When does this shift — the timeline ahead**
When does ${ctx.currentDasha} end? When does ${ctx.nextDasha} begin (~${ctx.nextDashaYear})? What changes? Give ${ctx.name} a concrete answer: "Between now and ${ctx.nextDashaYear}, you will likely experience... After ${ctx.nextDashaYear}, the energy shifts toward..."

End with: "⚠️ For entertainment & informational purposes only."`,

  love: (ctx) => `You are speaking privately to ${ctx.name} about love and marriage.

Data:
- ${ctx.maritalStatus.toUpperCase()} | Age ~${ctx.currentAge} | ${ctx.gender}
- Venus in ${ctx.venusSign} House ${ctx.venusHouse}
- 7th house: ${ctx.seventhHouseSign} | 7th lord: ${ctx.seventhHouseLord}
- Planets in 7th: ${ctx.planetsIn7}
- ${ctx.isManglik ? `MANGLIK — Mars in House ${ctx.marsHouse}` : 'No Manglik dosha'}
- Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse}${ctx.saturnHouse === 7 ? ' (directly delays marriage)' : ''}
- Rahu in House ${ctx.rahuHouse} | Current dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha} (${ctx.currentDashaYears})
- Next dasha: ${ctx.nextDasha} starts ~${ctx.nextDashaYear}
- CURRENT AGE: ~${ctx.currentAge} years old (born ${ctx.dob?.split('-')[0] || 'unknown'}) — any marriage timing prediction MUST be realistic for this age. Do NOT predict marriage beyond age 55.
${ctx.concern ? `- Their question: "${ctx.concern}"` : ''}

Write 5 sections with bold headings:

**Why ${ctx.name} attracts the partners they do**
Based on Venus in ${ctx.venusSign} and 7th house — what type keeps showing up and WHY including the painful patterns.

**The real reason marriage ${ctx.maritalStatus === 'single' ? 'has not happened yet' : 'has unfolded this way'}**
Name the EXACT planets and positions causing this. Not jargon — plain language. e.g. "Saturn in House X delays your 7th house lord by..." or "Rahu in the 7th creates..." Be specific about what ${ctx.name}'s chart actually shows.

**What ${ctx.name} actually needs in a partner**
Based on Moon in ${ctx.moonSign} and 7th lord ${ctx.seventhHouseLord} — the emotional truth, not what they consciously say.

**📅 When will marriage / a serious relationship happen**
THIS IS THE MOST IMPORTANT SECTION. ${ctx.name} is currently ~${ctx.currentAge} years old. The year is ${new Date().getFullYear()}. Any timing prediction MUST be within the next 1–10 years from now (${new Date().getFullYear()}–${new Date().getFullYear() + 10}) — never predict marriage at age 55+ for someone already in their 30s or 40s. Give a real answer with specific years. Example format: "The most promising window for ${ctx.name} is [year range] when [specific dasha/transit reason]. The ${ctx.nextDasha} dasha starting ~${ctx.nextDashaYear} [will/will not] favor marriage because [specific reason]." Name at least one concrete year or 2-year window within realistic range.

**What ${ctx.name} should do right now to move toward that**
One specific action — a pattern to break, a Saturn remedy, a conscious shift — based on the chart.

End with: "⚠️ For entertainment & informational purposes only."`,

  career: (ctx) => `You are speaking directly to ${ctx.name} about career and money.

Data:
- ${ctx.employment} | Age ~${ctx.currentAge}
- ${ctx.lagnaSign} Ascendant | 10th house: ${ctx.tenthHouseSign} lord: ${ctx.tenthHouseLord}
- Sun in ${ctx.sunSign} | Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse} | Jupiter in ${ctx.jupiterSign} House ${ctx.jupiterHouse}
- Current dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha} (${ctx.currentDashaYears})
- Next dasha: ${ctx.nextDasha} starts ~${ctx.nextDashaYear}
${ctx.concern ? `- Their concern: "${ctx.concern}"` : ''}

Write 5 sections with bold headings:

**What ${ctx.name} is built for professionally**
Not a list of careers — describe HOW they work naturally, what environment suits them, what colleagues notice about them. Specific to ${ctx.lagnaSign} + ${ctx.tenthHouseSign}.

**What is happening in ${ctx.name}'s career RIGHT NOW (${new Date().getFullYear()})**
What ${ctx.currentDasha} specifically means for work. Building period? Restructuring? Waiting? What to actively do or avoid.

**The hidden obstacle in ${ctx.name}'s career**
Name the specific planet and placement creating the main blockage. How does it show up in their actual work — with bosses, income, direction, confidence?

**📅 When does the career breakthrough or shift come**
Give a real answer with years. "By ${ctx.nextDashaYear} when ${ctx.nextDasha} dasha begins, ${ctx.name} can expect [specific shift] because [why this planet changes the career picture]." Also note if there is a Jupiter transit window or Saturn shift coming. Name actual years.

**One move ${ctx.name} should make in the next 6 months**
Specific and actionable based on what the current planetary energy supports.

End with: "⚠️ For entertainment & informational purposes only."`,

  health: (ctx) => `You are speaking privately to ${ctx.name} about health and wellbeing.

Data:
- ${ctx.lagnaSign} Ascendant → governs: ${ctx.lagnaBodyPart}
- 6th house: ${ctx.sixthHouseSign} | 8th house: ${ctx.eighthHouseSign}
- Moon in ${ctx.moonSign} | Mars in ${ctx.marsSign} House ${ctx.marsHouse} | Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse}
- Planets in 6th: ${ctx.planetsIn6}
- Current dasha: ${ctx.currentDasha}${ctx.currentDasha === 'Saturn' ? ' (chronic fatigue, bone/joint stress, low mood common)' : ctx.currentDasha === 'Mars' ? ' (inflammation, overexertion, injuries common)' : ctx.currentDasha === 'Rahu' ? ' (mysterious symptoms, anxiety, insomnia common)' : ctx.currentDasha === 'Sun' ? ' (eye strain, heart/spine focus, ego depletion)' : ctx.currentDasha === 'Moon' ? ' (emotional fluctuations, gut issues, sleep sensitivity)' : ''}
- Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE — physical depletion and emotional stress common' : 'Not active'}
${ctx.concern ? `- Their concern: "${ctx.concern}"` : ''}

Write 5 sections with bold headings:

**${ctx.name}'s body constitution and natural energy pattern**
What ${ctx.lagnaSign} Ascendant creates — energy highs/lows, sleep pattern, stress response, metabolic tendency. Not textbook — what their actual body experience tends to feel like.

**The health areas needing attention right now**
6th house ${ctx.sixthHouseSign} + planets in 6th — name the SPECIFIC body systems at risk for ${ctx.name}. Honest but not alarming.

**How ${ctx.currentDasha} is affecting ${ctx.name}'s body in ${new Date().getFullYear()}**
What this dasha planet does to health specifically. What symptoms or states ${ctx.name} may be noticing. What the body is signaling.

**📅 When does this health pressure ease**
Give a year. If ${ctx.name} is in a health-challenging dasha (Saturn, Rahu, Mars), when does it shift? "The ${ctx.currentDasha} dasha runs until [year from ${ctx.currentDashaYears}]. After that, ${ctx.nextDasha} dasha brings [better/different health signature] because..." Give ${ctx.name} a timeline.

**3 specific daily habits for ${ctx.name}'s chart**
One for body (${ctx.lagnaSign} Lagna), one for mind (Moon in ${ctx.moonSign}), one for current dasha energy. Not generic — genuinely chart-specific.

**🥗 Food, Exercise & Lifestyle prescription for ${ctx.name}**
Based on ${ctx.lagnaSign} Ascendant, Moon in ${ctx.moonSign}, and current ${ctx.currentDasha} dasha, give a specific, practical prescription:
- **Best foods to eat daily**: Name 5-7 specific foods that balance ${ctx.name}'s constitution. Be concrete (e.g. "ghee, pomegranate, soaked almonds, bitter gourd" — not just "eat well").
- **Foods to limit or avoid**: 3-4 specific foods that aggravate their dosha or dasha energy.
- **Best exercise style**: Name the EXACT type (e.g. "slow yoga and swimming — NOT high-intensity cardio which overheats your Mars in ${ctx.marsSign}"). Include how many days/week and duration.
- **Sleep & daily rhythm**: What time to wake, rest, and wind down based on their Lagna energy pattern.
- **One Ayurvedic or herbal remedy**: Specific to their constitution and current dasha (e.g. Ashwagandha for Saturn dasha exhaustion, Brahmi for Mercury mind stress, Triphala for digestive Moon signs).

End with: "⚠️ For entertainment & informational purposes only. NOT medical advice."`,

  timeline: (ctx) => `You are speaking to ${ctx.name} about their life's timeline — past, present, future.

Data:
- Born ${ctx.dob} | Age ~${ctx.currentAge}
- Current dasha: ${ctx.currentDasha} (${ctx.currentDashaYears}) / Antardasha: ${ctx.currentAntardasha}
- Next dasha: ${ctx.nextDasha} starts ~${ctx.nextDashaYear}
- Saturn Return: ~age ${parseInt(ctx.dob.split('-')[0],10)+29 - (new Date().getFullYear() - parseInt(ctx.dob.split('-')[0],10) > 30 ? 0 : new Date().getFullYear() - parseInt(ctx.dob.split('-')[0],10) > 29 ? 0 : 0)} (year ~${parseInt(ctx.dob.split('-')[0],10)+29})
- Jupiter Returns: ~ages 12, 24, 36, 48 (years ~${parseInt(ctx.dob.split('-')[0],10)+36}, ~${parseInt(ctx.dob.split('-')[0],10)+48})
- Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE NOW (intensified 7.5-year testing)' : 'Not currently active'}
${ctx.concern ? `- Their concern: "${ctx.concern}"` : ''}

Write 5 sections with bold headings:

**What the past chapter built (and cost)**
What the dasha before ${ctx.currentDasha} was doing. What foundation or wound it created. How it set up the current chapter.

**RIGHT NOW — the honest truth about ${new Date().getFullYear()}**
What ${ctx.currentDasha} / ${ctx.currentAntardasha} demands of ${ctx.name}. Both the difficulty AND the opportunity. What decision made now shapes the next 5 years.

**📅 The turning point — when does ${ctx.name}'s life shift**
This is the core section. Name specific years: "In ~${ctx.nextDashaYear}, ${ctx.nextDasha} dasha begins and brings [specific change] for ${ctx.name} because [why this planet changes things for their chart]." Also: if Saturn return is coming in ~${parseInt(ctx.dob.split('-')[0],10)+29}, what does it demand? If a Jupiter return is near, what does it open? Give at least 3 future years with meaning.

**The ages that define ${ctx.name}'s life**
Name 5 specific ages with what each means for this exact chart. Include the Saturn return year, next Jupiter return, dasha change points, and Rahu return at ~age 36-37.

**What ${ctx.name} should do NOW**
Based on the current dasha and what the next chapter brings — one concrete shift in the next 12 months that sets up the future well.

End with: "⚠️ For entertainment & informational purposes only."`,

  spiritual: (ctx) => `You are speaking to ${ctx.name} about their soul's purpose and karmic path.

Data:
- Atmakaraka: ${ctx.atmakaraka} (soul planet — its house and position reveal the soul's core lesson)
- Rahu in ${ctx.rahuSign} House ${ctx.rahuHouse}: the soul's direction this lifetime — unfamiliar, uncomfortable, essential
- Ketu in ${ctx.ketuSign} House ${ctx.ketuHouse}: past-life mastery — comfortable default that eventually creates stagnation
- Moon Nakshatra: ${ctx.moonNakshatraName} · deity: ${ctx.nakshatraDeity}
- 9th house (dharma): ${ctx.ninthHouseSign} | 12th house (moksha): ${ctx.twelfthHouseSign}
- Current dasha: ${ctx.currentDasha} | Age ~${ctx.currentAge}
- Next dasha: ${ctx.nextDasha} ~${ctx.nextDashaYear}

Write 5 sections with bold headings. Plain language — no mystical jargon:

**${ctx.name}'s soul mission — what they are here to do**
Translate Rahu in House ${ctx.rahuHouse}/${ctx.rahuSign} into plain real-world language. Not "your north node calls you toward..." — say exactly what this means in ${ctx.name}'s actual life choices, career direction, relationship patterns.

**The comfort zone Ketu keeps pulling ${ctx.name} back to**
What Ketu House ${ctx.ketuHouse}/${ctx.ketuSign} represents — the talent or safety that feels comfortable but ultimately prevents the soul's growth. What does ${ctx.name} default to under pressure that keeps them small?

**The karmic pattern that keeps repeating**
What keeps showing up in ${ctx.name}'s life — in relationships, work, inner life — until they integrate the Rahu-Ketu lesson. Name the pattern directly.

**📅 When does ${ctx.name}'s purpose become clearer or more activated**
Based on ${ctx.nextDasha} starting ~${ctx.nextDashaYear} — what spiritual or purposeful opening does this create? Is there a specific age where the soul lesson becomes undeniable for ${ctx.name}? Name it.

**The one practice that would transform ${ctx.name}'s life most**
Based on ${ctx.moonNakshatraName} Nakshatra, ${ctx.atmakaraka} Atmakaraka, 9th house ${ctx.ninthHouseSign} — one SPECIFIC practice. Not "meditate" — something genuinely tailored to this exact chart.

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
  const blocked = apiGuard(req);
  if (blocked) return blocked;

  const budgetBlocked = budgetGuard();
  if (budgetBlocked) return budgetBlocked;

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

    // ── PII: replace real name with an anonymous token before sending to the AI ──
    const anonContext: ReadingContext = {
      ...context,
      name: 'the Seeker',  // real name never reaches the AI model
    };

    const promptFn = SECTION_PROMPTS[section];
    if (!promptFn) {
      return NextResponse.json({ error: 'Unknown section: ' + section }, { status: 400 });
    }

    const userPrompt = promptFn(anonContext);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a master Vedic astrologer giving deeply personal, SPECIFIC readings.
RULES:
1. The person's name is "the Seeker". Use ONLY "the Seeker" — NEVER invent or substitute any other name (e.g. Emily, Alex, Priya, John). Do not use any name other than "the Seeker".
2. Use the correct pronouns based on gender — male: he/him/his, female: she/her/hers, nonbinary/they/prefer_not: they/them/their. NEVER misuse pronouns.
3. NEVER write generic planet descriptions — every sentence must be about THIS specific person.
4. The 📅 timing sections are MANDATORY — you MUST give real years or year-ranges, not vague answers.
5. Be honest about difficulties. Be honest about delays. Then show the path through.
6. Write like a wise, warm friend who knows their chart — not a textbook.
7. Use **bold headings** exactly as given. Rich paragraphs, no bullet points.
8. The WORST answer is a vague non-answer. Always commit to a specific year or window.`,
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 900,
      temperature: 0.75,
    });

    const text = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    addTokens(tokensUsed);

    return NextResponse.json({ text, section, tokensUsed });
  } catch (error: unknown) {
    console.error('Personal reading API error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg, text: null }, { status: 500 });
  }
}
