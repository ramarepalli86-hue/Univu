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

  // ─── Weekly Sub-Tab: By Rashi (Vedic Moon Sign) ────────────────────────────
  weekly_rashi: (ctx) => {
    const c = ctx as ReadingContext & { weeklyRashi?: string; weeklyTimeframe?: string };
    const rashi = c.weeklyRashi || ctx.moonSign;
    const timeframe = c.weeklyTimeframe || 'current';
    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeLabel = timeframe === 'next_week' ? 'the coming week (next week)'
      : timeframe === 'month' ? 'the next 4 weeks ahead'
      : `this current week starting ${dateLabel}`;
    return `You are a master Vedic astrologer writing the weekly Rashi forecast for **${rashi}** (Vedic Moon Sign) for ${timeLabel}.

IMPORTANT: This forecast is for EVERYONE whose Vedic Moon sign is ${rashi} — not a personal reading. Write in second person ("You will…").

The current planetary transits as of ${dateLabel} influence all ${rashi} natives. Consider:
- The Moon's transit through nakshatras this week and its effect on ${rashi}
- Saturn's ongoing transit and aspect on ${rashi}
- Jupiter's transit and its beneficial/challenging angle to ${rashi}
- Any Mars, Venus, or Mercury sign changes happening ${timeLabel === 'this current week' ? 'this week' : 'in this period'}
- Rahu-Ketu axis and its current influence on ${rashi}

Write 5 sections with bold headings. Be specific to ${rashi} — every sentence must reference WHY ${rashi} specifically experiences this energy.

**🌙 Overall Energy for ${rashi} — ${timeframe === 'month' ? 'This Month' : 'This Week'}**
What is the dominant planetary energy affecting ${rashi} natives right now? Is this a week of action, patience, rest, or transformation? Name the specific transit causing this.

**💼 Career & Finance for ${rashi}**
How do the current transits affect the 10th house from ${rashi}? Job opportunities, money flow, boss relations, business decisions — what should ${rashi} natives expect and do?

**💞 Love & Relationships for ${rashi}**
Venus and Moon transits relative to ${rashi}'s 7th house — what happens in love, marriage, and close bonds this period?

**⚡ Health & Energy for ${rashi}**
Mars and Saturn transits affecting ${rashi}'s 6th and 8th houses — energy levels, stress points, and what to watch for physically and mentally.

**✨ Lucky Day, Color & Mantra for ${rashi}**
One specific day this period that is most auspicious for ${rashi}. One color to wear. One short mantra or intention rooted in the ruling planet of ${rashi}.

End with: "⚠️ For entertainment & informational purposes only. Rashi forecast for ${rashi} · ${dateLabel}."`;
  },

  // ─── Weekly Sub-Tab: By Western Zodiac Sign ────────────────────────────────
  weekly_zodiac: (ctx) => {
    const c = ctx as ReadingContext & { weeklyZodiacSign?: string; weeklyTimeframe?: string };
    const sign = c.weeklyZodiacSign || 'Aries';
    const timeframe = c.weeklyTimeframe || 'current';
    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeLabel = timeframe === 'next_week' ? 'the coming week (next week)'
      : timeframe === 'month' ? 'the next 4 weeks ahead'
      : `this current week starting ${dateLabel}`;
    return `You are a skilled Western astrologer writing the weekly horoscope for **${sign}** for ${timeLabel}.

IMPORTANT: This forecast is for EVERYONE born under the ${sign} Sun sign — not a personal reading. Write in second person ("You will…").

Consider the current planetary transits as of ${dateLabel}:
- Sun's current sign and aspect to ${sign}
- Mercury's position (retrograde? sign change?) and how it affects ${sign}'s communication
- Venus transit and its influence on ${sign}'s love and money houses
- Mars transit and its energy impact on ${sign}
- Jupiter and Saturn's slow transits and their long-term themes for ${sign}
- Any significant aspects (squares, trines, oppositions) forming to ${sign}'s Sun position

Write 5 sections with bold headings. Be specific to ${sign} — why ${sign} in particular feels this energy.

**☀️ The Big Picture for ${sign} — ${timeframe === 'month' ? 'This Month' : 'This Week'}**
What planetary aspects dominate ${sign}'s sky right now? Is this a period of opportunity, challenge, reflection, or breakthrough? Name the key transit.

**💼 Career & Ambition for ${sign}**
What do transiting planets to ${sign}'s 10th house (Midheaven) and 6th house indicate for professional life this period? Opportunities, obstacles, timing.

**💞 Love & Connection for ${sign}**
Venus and Mars transits relative to ${sign}'s 5th and 7th houses — what opens or challenges in love, dating, and committed partnerships?

**🌿 Wellness & Self-Care for ${sign}**
Energy levels, stress points, and the best self-care approach based on current transits hitting ${sign}'s vitality sectors.

**🌟 Power Move of the ${timeframe === 'month' ? 'Month' : 'Week'} for ${sign}**
One specific action ${sign} should take this period to ride the planetary wave most effectively. Be concrete and actionable.

End with: "⚠️ For entertainment & informational purposes only. Western horoscope for ${sign} · ${dateLabel}."`;
  },

  // ─── Weekly Sub-Tab: By Chinese Zodiac Year ────────────────────────────────
  weekly_chinese: (ctx) => {
    const c = ctx as ReadingContext & { weeklyChineseAnimal?: string; weeklyTimeframe?: string };
    const animal = c.weeklyChineseAnimal || 'Dragon';
    const timeframe = c.weeklyTimeframe || 'current';
    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentYear = new Date().getFullYear();
    const timeLabel = timeframe === 'next_week' ? 'the coming week (next week)'
      : timeframe === 'month' ? 'the next 4 weeks ahead'
      : `this current week starting ${dateLabel}`;
    return `You are a master Chinese astrologer writing the weekly forecast for people born in the Year of the **${animal}** for ${timeLabel}.

IMPORTANT: This forecast is for EVERYONE born in a ${animal} year — not a personal reading. Write in second person ("You will…").

The year ${currentYear} is governed by specific elemental and animal energies. Consider:
- How ${currentYear}'s ruling animal interacts with the ${animal} sign (compatible, conflicting, or neutral)
- The current lunar month and its elemental influence on ${animal} natives
- The Five Elements cycle and what element is active this week/month
- Traditional Chinese astrological concepts: Tai Sui (Grand Duke Jupiter), San Sha (Three Killings), and their direction this year relative to ${animal}

Write 5 sections with bold headings. Be specific to the ${animal} — explain WHY ${animal} people feel this energy.

**☯️ Overall Fortune for ${animal} — ${timeframe === 'month' ? 'This Month' : 'This Week'}**
What is the dominant energy for ${animal} natives in ${currentYear}? Is this a period of growth, caution, opportunity, or consolidation? How does the current lunar phase affect ${animal}?

**💰 Wealth & Career for ${animal}**
Financial outlook and career energy for ${animal} this period. Which days are best for important business decisions? Any risks to avoid?

**❤️ Love & Relationships for ${animal}**
Romantic and social energy for ${animal} natives. Is this a good time for new connections, deepening bonds, or giving space? What element supports harmony?

**🏥 Health & Vitality for ${animal}**
Which organs or body systems need attention for ${animal} this period based on Five Element theory? Energy levels, rest needs, and wellness tips.

**🍀 Lucky Elements for ${animal} This ${timeframe === 'month' ? 'Month' : 'Week'}**
- Lucky numbers (2-3 specific numbers)
- Lucky colors (2 colors with WHY they balance ${animal}'s energy)
- Lucky direction for important activities
- Best and worst days of the period for ${animal}

End with: "⚠️ For entertainment & informational purposes only. Chinese zodiac forecast for ${animal} · ${dateLabel}."`;
  },

  // ─── Weekly Sub-Tab: Personal Week (by DOB, chart-specific) ────────────────
  weekly_personal: (ctx) => {
    const c = ctx as ReadingContext & { weeklyTimeframe?: string };
    const timeframe = c.weeklyTimeframe || 'current';
    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeLabel = timeframe === 'next_week' ? 'the coming week (next week)'
      : timeframe === 'month' ? 'the next 4 weeks ahead'
      : `this current week starting ${dateLabel}`;
    return `You are speaking directly to ${ctx.name} about ${timeLabel}.

This is a DEEPLY PERSONAL forecast based on ${ctx.name}'s exact birth chart — not a generic sign forecast.

Chart data:
- ${ctx.lagnaSign} Ascendant | ${ctx.moonSign} Moon | ${ctx.sunSign} Sun
- Moon Nakshatra: ${ctx.moonNakshatraName} Pada ${ctx.moonNakshatraPada}
- Current dasha: ${ctx.currentDasha} / ${ctx.currentAntardasha} (${ctx.currentDashaYears})
- Venus in ${ctx.venusSign} House ${ctx.venusHouse} | Mars in ${ctx.marsSign} House ${ctx.marsHouse}
- Jupiter in ${ctx.jupiterSign} House ${ctx.jupiterHouse} | Saturn in ${ctx.saturnSign} House ${ctx.saturnHouse}
- Rahu in ${ctx.rahuSign} House ${ctx.rahuHouse} | Ketu in ${ctx.ketuSign} House ${ctx.ketuHouse}
- Manglik: ${ctx.isManglik ? 'YES' : 'No'} | Sade Sati: ${ctx.sadeSatiActive ? 'ACTIVE' : 'Not active'}
- Age ~${ctx.currentAge} | ${ctx.maritalStatus} | ${ctx.employment}
- Atmakaraka: ${ctx.atmakaraka}
${ctx.concern ? `- Their focus: "${ctx.concern}"` : ''}

Write a personalised forecast for ${timeLabel}. Every single sentence must be specific to ${ctx.name}'s chart — NEVER generic horoscope language.

**🔮 The Planetary Weather for ${ctx.name} — ${timeframe === 'month' ? 'This Month' : 'This Week'}**
What specific transits are hitting ${ctx.name}'s natal chart this period? Which house is most activated? What does ${ctx.currentDasha}/${ctx.currentAntardasha} dasha demand RIGHT NOW?

**💼 Work & Money — What ${ctx.name} Should Do**
Based on the 10th house lord and current transits to ${ctx.name}'s career axis — is this a push week, a waiting week, or a pivot week? One specific action for work. One thing to avoid financially.

**💞 Relationships & Emotional Life**
How does the Moon's transit through nakshatras this period interact with ${ctx.name}'s natal ${ctx.moonNakshatraName} Moon? What emotional tone dominates? What should ${ctx.name} express, and what should they hold?

**⚡ Energy, Health & Daily Rhythm**
Based on Mars in House ${ctx.marsHouse} and the Lagna lord's current strength — ${ctx.name}'s physical energy pattern this period. Best days for exercise vs. rest. Any health caution from the transits.

**📅 The Key Moment This ${timeframe === 'month' ? 'Month' : 'Week'}**
Name one specific day (or 2-3 day window) that is the most powerful for ${ctx.name}. What should they do in that window? What planetary alignment creates this opportunity?

**🕉️ ${ctx.name}'s ${timeframe === 'month' ? 'Monthly' : 'Weekly'} Intention**
A single, specific intention rooted in ${ctx.moonNakshatraName} Nakshatra energy, ${ctx.atmakaraka} Atmakaraka, and the current dasha. Not generic — deeply personal.

End with: "⚠️ For entertainment & informational purposes only. Personal forecast for ${timeLabel} · ${dateLabel}."`;
  },

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

    return `You are an expert in THREE spatial harmony traditions: (1) Indian Vastu Shastra, (2) Chinese Feng Shui (Form School + Compass School), and (3) modern environmental science (biophilic design, circadian architecture, building biology). You give LOCATION-SPECIFIC advice that weaves all three wisdoms — not generic templates.

Your approach: For each recommendation, explain what Vastu says, what Feng Shui says, and what environmental science confirms — showing where the traditions agree and where they differ for THIS specific location. Always frame positively: self-improvement, harmony, empowerment — NEVER fear-based ("bad luck", "disaster", "you must do this or suffer").

═══════════════════════════════════════════
HOUSE LOCATION: ${houseCity}
${houseLat !== 0 ? `Coordinates: ${houseLat.toFixed(4)}°, ${houseLng.toFixed(4)}°` : 'Coordinates: not provided — use the city name to infer hemisphere, climate zone, and sun path.'}
CLIMATE & ENVIRONMENT: ${climate || `House is located in ${houseCity}. Infer climate from the city name.`}
SUN PATH & WIND: ${sunWind || 'Infer from the city name and hemisphere.'}
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

**Understanding ${houseCity}'s Vastu & Feng Shui Canvas**
Start by explaining what makes this specific location unique for spatial harmony. What does the latitude mean for solar gain? What is the dominant climate challenge — heat, cold, humidity, wind? How does this modify the traditional Vastu direction map AND the Feng Shui Bagua? Name which traditional principles from BOTH Vastu and Feng Shui apply directly, and which need adaptation for this location. Where do Vastu and Feng Shui AGREE about this location? Where do they DIFFER? This section sets the frame — be precise and educational.

**The Main Entrance — Vastu vs. Feng Shui vs. Science**
${hasPersonal ? `Based on ${c.lagnaSign} Ascendant and the current ${c.currentDasha} dasha — ` : ''}which direction should the main door face? Explain:
- **Vastu says**: Which direction and which deity/energy governs this direction.
- **Feng Shui says**: What the Compass School (Luo Pan) and Form School recommend for ${houseCity}.
- **Science says**: What this direction receives in terms of sunlight and wind in ${houseCity} specifically.
Then give the PRIORITY recommendation: which advice to follow when the traditions conflict for this location. What to place near the entrance (specific plants, threshold elements, colors, or materials) that thrive in this climate.

**Room-by-Room Placement — The Three-Wisdom Approach**
For each room, give a specific compass direction suited to Vastu, Feng Shui, AND ${houseCity}'s climate reality:
- **Master bedroom**: Vastu direction + Feng Shui Bagua zone + thermal comfort in ${houseCity}. ${hasPersonal ? `With ${c.moonSign} Moon, the bedroom needs to support emotional restoration.` : ''} Which head direction for sleeping — Vastu vs. Feng Shui recommendation?
- **Kitchen / fire zone**: Vastu SE fire zone vs. Feng Shui fire element placement vs. practical heat management in ${houseCity}'s climate.
- **Study / workspace**: Vastu zone vs. Feng Shui career/knowledge area (Gen/Kan trigrams). Where does natural light fall at working hours in ${houseCity}?
- **Prayer / meditation corner**: Vastu NE Ishanya vs. Feng Shui spiritual zone. Quietest area for ${houseCity}.
- **Living room**: Social energy zone — Vastu vs. Feng Shui "Ming Tang" (bright hall) concept. Best direction for ${houseCity}'s afternoon/evening light.

**Light, Air, Plants & Water — Science Meets Ancient Wisdom**
${climate.includes('cold') || climate.includes('dark') || climate.includes('subarctic') || climate.includes('temperate')
  ? `WINTER WELLBEING PRIORITY: ${houseCity} has limited daylight in winter. Seasonal Affective Disorder (SAD) risk is real. Address this directly:`
  : `TROPICAL VENTILATION PRIORITY: Address heat, humidity, and air quality directly:`}
- **Natural light**: Vastu's "Jyoti" (light) principles + Feng Shui's "Yang energy" through windows + circadian science on daylight exposure. Which walls need the largest windows for ${houseCity}'s sun path?
- **Cross-ventilation**: Vastu's "Vayu" (wind) corridors + Feng Shui's "Qi flow" paths + building science on stack ventilation. Given ${houseCity}'s prevailing winds, where to place openings.
- **Living plants**: Name 4 specific plants that (a) thrive in ${houseCity}'s climate, (b) improve indoor air quality (NASA study), (c) carry Vastu positive energy, and (d) are auspicious in Feng Shui. Give exact room placement for each.
- **Water features**: Feng Shui places great emphasis on water for wealth (aquariums, fountains). Where does Vastu agree? Where should water be placed in ${houseCity} — and where is it harmful? Science-backed humidity considerations.
- **Colors**: Which wall colors work for ${houseCity}'s light quality AND align with ${hasPersonal ? c.lagnaSign + ' Lagna energy' : 'universal harmony'}? Compare Vastu color rules with Feng Shui Five Element color theory.

**${isCouple ? 'Couple Compatibility — Balancing Two Charts in One Space' : hasPersonal ? `${ctx.name || 'Your'} Personal Harmony Priority` : 'Energy Flow and Dosha/Sha Qi Correction'}**
${isCouple
  ? `Two people, two dominant energies, one home. Based on the charts provided: identify the dominant planet for each partner. Where do their energies complement each other spatially? In Feng Shui terms, what are their Kua numbers and compatible directions? How should the home be zoned so both thrive? Name 2 specific design choices that honor both charts. Then name the one zone that should be the couple's shared sanctuary and why.`
  : hasPersonal
  ? `Based on ${c.lagnaSign} Ascendant and ${c.currentDasha} dasha — what is the most important zone to activate RIGHT NOW? In Vastu terms: ${c.sadeSatiActive ? 'Sade Sati is active — the West/Saturn zone needs attention.' : c.isManglik ? 'Manglik dosha means the South/Mars zone carries extra intensity.' : `The ${c.currentDasha} dasha planet governs a specific direction.`} In Feng Shui terms: which Bagua area needs activation? Give 1 specific zone, explain the opportunity from both traditions, and provide 3 practical remedies (1 Vastu, 1 Feng Shui, 1 science-based).`
  : `Without personal chart data, focus on universal Vastu + Feng Shui and ${houseCity}'s environmental factors. Name the 3 most common spatial harmony mistakes people create in ${houseCity}-style homes (1 Vastu dosha, 1 Feng Shui sha qi, 1 building science issue). Give the corrective action for each.`}

**Your 7-Day Transformation Plan for ${houseCity}**
Practical changes anyone can implement immediately — no structural work required. Numbered list of 7 specific actions:
- At least 2 from Vastu tradition (with the principle name)
- At least 2 from Feng Shui tradition (with the concept name, e.g. "Bagua activation", "Five Elements cure")
- At least 2 from environmental science (specific to ${houseCity}'s climate — e.g. maximising winter light, airflow, humidity control)
- 1 that bridges all three traditions
Each item: one sentence with the action, one sentence with WHY it works for ${houseCity} specifically. Frame everything positively — empowerment and harmony, never fear.

End with: "⚠️ For entertainment & informational purposes only. Vastu and Feng Shui recommendations are traditional wisdom blended with environmental science — not professional structural, architectural, or interior design advice. Consult a licensed architect for any structural modifications."`;
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

    // Vastu and monthly forecasts need more space; standard readings use 900 tokens
    const isLargeSection = section === 'vastu' || (section.startsWith('weekly_') && (context as unknown as Record<string,unknown>).weeklyTimeframe === 'month');
    const maxTokens = isLargeSection ? 1200 : 900;

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
9. Apply the ${systemInstruction.split(' (')[0]} system's specific rules — do NOT blend with other systems unless asked.
10. Frame everything positively: self-improvement, empowerment, growth. NEVER use fear-based language.`,
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
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
