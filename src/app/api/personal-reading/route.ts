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

  weekly: (ctx) => `You are speaking directly to ${ctx.name} about the week immediately ahead — starting from today, ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

Chart data:
- ${ctx.lagnaSign} Ascendant | ${ctx.moonSign} Moon | ${ctx.sunSign} Sun
- Moon Nakshatra: ${ctx.moonNakshatraName} Pada ${ctx.moonNakshatraPada}
- Current dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha} (${ctx.currentDashaYears})
- Venus in House ${ctx.venusHouse} | Mars in House ${ctx.marsHouse} | Jupiter in House ${ctx.jupiterHouse}
- Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse}
- Manglik: ${ctx.isManglik ? 'YES' : 'No'} | Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE' : 'Not active'}
- Age ~${ctx.currentAge} | ${ctx.maritalStatus} | ${ctx.employment}
${ctx.concern ? `- Their focus: "${ctx.concern}"` : ''}

Write a personalised week-ahead forecast with the following sections using bold headings.
Every single sentence must be specific to ${ctx.name}'s chart — NEVER generic horoscope language.

**Monday–Tuesday: The opening energy**
What planetary energy dominates the first half of the week for ${ctx.name} given their current ${ctx.currentDasha}/${ctx.currentAntardasha} dasha. What is the right approach for work, communication, and decisions these two days? Name one specific action to take and one to avoid.

**Wednesday–Thursday: The pivot point**
Mid-week energy shift. What changes? How should ${ctx.name} adapt? This is often the best time for key decisions or conversations — is it this week, for ${ctx.name}'s chart? Why or why not.

**Friday–Weekend: Rest, opportunity, or intensity?**
Based on ${ctx.moonSign} Moon and current dasha — what does the weekend hold for ${ctx.name}? Social, romantic, creative, rest, or push? Give a specific tone for Saturday and Sunday.

**📅 The single most important window this week**
Name one specific day and time window (e.g. "Wednesday afternoon") that is the most powerful for ${ctx.name} this week, based on their dasha and natal chart. What should they do in that window?

**What to focus on vs. what to let go this week**
One concrete focus based on ${ctx.concern ? `"${ctx.concern}" and ` : ''}the current planetary energy. One thing to release or not force this week.

**This week's mantra or intention for ${ctx.name}**
A single, specific sentence — not generic. Rooted in their ${ctx.moonNakshatraName} Nakshatra energy and current dasha. Something they can actually say to themselves.

End with: "⚠️ For entertainment & informational purposes only. Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}."`,

  vastu: (ctx) => {
    // Pull Vastu-specific enrichment fields (passed via context object)
    const c = ctx as ReadingContext & {
      vastuHouseCity?: string;
      vastuHouseLat?: number;
      vastuHouseLng?: number;
      vastuClimate?: string;
      vastuSunWind?: string;
      vastuPersonDob?: string;
      vastuPersonTime?: string;
      vastuPersonBirthCity?: string;
      vastuPartnerDob?: string;
      vastuPartnerTime?: string;
      vastuPartnerBirthCity?: string;
      vastuMode?: string;
    };
    const houseCity   = c.vastuHouseCity  || c.currentCity || c.birthCity;
    const houseLat    = c.vastuHouseLat   ?? 0;
    const houseLng    = c.vastuHouseLng   ?? 0;
    const climate     = c.vastuClimate    || `House is located in ${houseCity}.`;
    const sunWind     = c.vastuSunWind    || '';
    const mode        = c.vastuMode       || 'person';
    const personDob   = c.vastuPersonDob  || '';
    const partnerDob  = c.vastuPartnerDob || '';
    const isCouple    = mode === 'couple' && !!partnerDob;
    const hasPersonal = mode !== 'place-only' && (!!personDob || !!c.lagnaSign);

    const personalBlock = hasPersonal ? `
PERSONAL CHART (${ctx.name || 'the Seeker'}):
- Lagna (Ascendant): ${c.lagnaSign} | Moon Sign: ${c.moonSign} | Sun Sign: ${c.sunSign}
- Atmakaraka (soul planet): ${c.atmakaraka}
- Current Dasha: ${c.currentDasha} / ${c.currentAntardasha}
- Manglik: ${c.isManglik ? 'YES — Mars direction (South) needs specific handling' : 'No'}
- Sade Sati: ${c.sadeSatiActive ? 'ACTIVE — Saturn pressure on the Moon/West zone' : 'Not active'}
- Jupiter in ${c.jupiterSign} House ${c.jupiterHouse} | Saturn in ${c.saturnSign} House ${c.saturnHouse}
- Venus in ${c.venusSign} House ${c.venusHouse} | Mars in ${c.marsSign} House ${c.marsHouse}
- Rahu in ${c.rahuSign} House ${c.rahuHouse} | Ketu in ${c.ketuSign} House ${c.ketuHouse}
${personDob ? `- DOB for Vastu: ${personDob}${c.vastuPersonTime ? ` at ${c.vastuPersonTime}` : ''}${c.vastuPersonBirthCity ? ` · born in ${c.vastuPersonBirthCity}` : ''}` : ''}` : '';

    const partnerBlock = isCouple ? `
PARTNER'S CHART (details provided):
- Partner DOB: ${partnerDob}${c.vastuPartnerTime ? ` at ${c.vastuPartnerTime}` : ''}${c.vastuPartnerBirthCity ? ` · born in ${c.vastuPartnerBirthCity}` : ''}
- Note: Derive the partner's dominant planet from their birth year and provide compatible Vastu zone recommendations.` : '';

    return `You are an expert Vastu Shastra consultant who also understands environmental science, architecture, and biophilic design. You give LOCATION-SPECIFIC Vastu advice — not generic Indian-home templates.

═══════════════════════════════════════════
HOUSE LOCATION: ${houseCity}
Coordinates: ${houseLat.toFixed(4)}°, ${houseLng.toFixed(4)}°
CLIMATE & ENVIRONMENT: ${climate}
SUN PATH & WIND: ${sunWind}
═══════════════════════════════════════════
${personalBlock}${partnerBlock}

CRITICAL RULE — LOCATION-FIRST THINKING:
Traditional Vastu was designed for the Indian subcontinent (20–30°N latitude), where the sun always arcs through the SOUTH sky and the NE/East receives cool morning light. These assumptions BREAK in different locations:
- In the Southern Hemisphere, the sun arcs NORTH — the entire direction logic for solar gain REVERSES.
- In high-latitude cold countries (above 50°N), the South wall is the MOST PRECIOUS solar asset — blocking it is a serious mistake. North rooms are cold and dark in winter.
- In tropical/equatorial cities, the primary concern is cross-ventilation and shade, not solar gain.
- Prevailing wind direction varies by geography — the traditional NE-open-corridor advice only works where NE winds are prevailing.

You must adapt ALL Vastu direction advice to the ACTUAL conditions of ${houseCity}. Do not parrot Indian-centric Vastu if the location is in the Southern Hemisphere, Northern Europe, the Americas, or East Asia. Be explicit when you deviate from traditional Indian Vastu because the location demands it.

Write 6 sections with bold headings. Be specific, science-backed, and practical. Every recommendation must reference WHY it works for ${houseCity}'s specific latitude, climate, and sun/wind pattern.

**Understanding ${houseCity}'s Vastu Canvas**
Start by explaining what makes this specific location unique for Vastu. What does the latitude mean for solar gain? What is the dominant climate challenge — heat, cold, humidity, wind? How does this modify the traditional Vastu direction map? Name which traditional Vastu principles apply directly, and which need to be reversed or modified for this location. This section sets the frame — be precise and educational.

**The Main Entrance and Primary Orientation**
${hasPersonal ? `Based on ${c.lagnaSign} Ascendant and the current ${c.currentDasha} dasha — ` : ''}which direction should the main door face for maximum positive energy AND maximum practical benefit in ${houseCity}'s climate? Give a specific compass direction. Then explain: (1) which Vastu deity/energy governs this direction, (2) what this direction receives in terms of sunlight and wind in ${houseCity} specifically, and (3) what to place near the entrance (specific plants, threshold elements, colors, or materials) that thrive in this climate. If the best Vastu direction conflicts with the best climate direction for ${houseCity}, say so directly and give the priority recommendation.

**Room-by-Room Placement for ${houseCity}**
For each room below, give a specific compass direction suited to BOTH Vastu principles AND ${houseCity}'s climate reality:
- **Master bedroom**: Which direction — and why does this work for both the planetary ruler of that zone and the thermal comfort in ${houseCity}? ${hasPersonal ? `With ${c.moonSign} Moon, the bedroom needs to support emotional restoration.` : ''}
- **Kitchen / fire zone**: The kitchen generates heat. In ${houseCity}'s climate, which direction minimises overheating OR maximises warmth as needed? How does this align with the SE fire zone of Vastu?
- **Study / workspace**: Where does natural light fall at working hours in ${houseCity}? Which direction maximises focus energy in Vastu AND provides good natural light?
- **Prayer / meditation corner**: Quietest zone, away from street noise. Which Vastu zone and why?
- **Living room**: Social energy zone — which direction for ${houseCity} gets the best afternoon or evening light for gathering?

**Light, Air, and Living Plants — The Science of Pure Energy**
${climate.includes('cold') || climate.includes('dark') || climate.includes('subarctic') || climate.includes('temperate')
  ? `WINTER WELLBEING PRIORITY: ${houseCity} has limited daylight in winter. Seasonal Affective Disorder (SAD) risk is real. Address this directly:`
  : `TROPICAL VENTILATION PRIORITY: Address heat, humidity, and air quality directly:`}
- **Natural light maximisation**: Which walls should have the largest windows for ${houseCity}'s sun path? Which rooms suffer most from low winter light and how to remedy this (skylights, light tubes, reflective surfaces)?
- **Cross-ventilation design**: Given the prevailing wind direction for ${houseCity}, where should windows and openings be on opposite walls to create natural airflow?
- **Living plants for this climate**: Name 3–4 specific plants that (a) thrive in ${houseCity}'s climate, (b) improve indoor air quality, and (c) carry Vastu positive energy. Give exact placement for each. ${climate.includes('cold') || climate.includes('subarctic') ? 'For cold-climate homes, specify which are suitable as indoor plants year-round.' : ''}
- **Colour psychology + planetary resonance**: Which wall colors work for ${houseCity}'s light quality (bright equatorial light vs. soft northern light) AND align with ${hasPersonal ? c.lagnaSign + ' Lagna energy' : 'universal Vastu harmony'}?

**${isCouple ? 'Couple Compatibility — Balancing Two Charts in One Space' : hasPersonal ? `${ctx.name || 'Your'} Personal Vastu Priority` : 'Energy Flow and Dosha Correction'}**
${isCouple
  ? `Two people, two dominant energies, one home. Based on the charts provided: identify the dominant planet for each partner. Where do their energies complement each other spatially? Where might there be friction (e.g. one needs a quiet North study, the other needs an energetic South workspace)? How should the home be zoned so both thrive? Name 2 specific design choices that honor both charts. Then name the one zone that should be the couple's shared sanctuary and why.`
  : hasPersonal
  ? `Based on ${c.lagnaSign} Ascendant and ${c.currentDasha} dasha — what is the most important Vastu zone to activate or heal RIGHT NOW? ${c.sadeSatiActive ? 'Sade Sati is active — the West/Saturn zone needs specific attention.' : c.isManglik ? 'Manglik dosha means the South/Mars zone carries extra intensity — specific remedies needed.' : `The ${c.currentDasha} dasha planet governs a specific direction that should be strengthened now.`} Give 1 specific zone, explain the dosha or opportunity, and provide the remedy.`
  : `Without personal chart data, focus on universal Vastu and ${houseCity}'s environmental factors. Name the 2 most common Vastu doshas people create in ${houseCity}-style homes (e.g., blocking the South wall in a cold-climate home, or poor cross-ventilation in a humid zone). Give the corrective action for each.`}

**Your 7-Day Action Plan for ${houseCity}**
Practical changes anyone can implement immediately — no structural work required. Numbered list of 7 specific actions, each tied to either a Vastu principle, the planetary energy of that zone, or ${houseCity}'s specific environmental need. Include at least 2 items specific to the climate challenge of ${houseCity} (e.g. for cold cities: maximising winter light; for tropical: airflow and shade). Each item: one sentence with the action, one sentence with WHY it works here.

End with: "⚠️ For entertainment & informational purposes only. Vastu recommendations are traditional wisdom blended with environmental science — not professional structural, architectural, or interior design advice. Consult a licensed architect for any structural modifications."`;
  },
};

export interface ReadingContext {
  name: string;
  dob: string;
  birthCity: string;
  currentCity: string;
  currentLat: number;
  currentLng: number;
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
  vedicSystem: 'parashari' | 'kp' | 'jaimini' | 'lal_kitab';
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

    const vedicSystemLabel: Record<string, string> = {
      parashari: 'Parashari (classical — Vimshottari Dasha, natural house rulerships, graha strengths)',
      kp:        'KP System (Krishnamurti Paddhati — sub-lord theory, cusp-based predictions, event-timing precision)',
      jaimini:   'Jaimini (Chara Dasha, Karakamsha, Argala, Pada Lagna — soul-level karmic readings)',
      lal_kitab: 'Lal Kitab (folk Vedic — Pucca/Kachcha houses, debts across lifetimes, practical remedies)',
    };
    const systemInstruction = vedicSystemLabel[context.vedicSystem] || vedicSystemLabel.parashari;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a master Vedic astrologer giving deeply personal, SPECIFIC readings using the ${systemInstruction} system.
RULES:
1. The person's name is "the Seeker". Use ONLY "the Seeker" — NEVER invent or substitute any other name (e.g. Emily, Alex, Priya, John). Do not use any name other than "the Seeker".
2. Use the correct pronouns based on gender — male: he/him/his, female: she/her/hers, other: they/them/their. NEVER misuse pronouns.
3. NEVER write generic planet descriptions — every sentence must be about THIS specific person.
4. The 📅 timing sections are MANDATORY — you MUST give real years or year-ranges, not vague answers.
5. Be honest about difficulties. Be honest about delays. Then show the path through.
6. Write like a wise, warm friend who knows their chart — not a textbook.
7. Use **bold headings** exactly as given. Rich paragraphs, no bullet points.
8. The WORST answer is a vague non-answer. Always commit to a specific year or window.
9. Apply the ${systemInstruction.split(' (')[0]} system's specific rules — do NOT blend with other systems unless asked.`,
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
