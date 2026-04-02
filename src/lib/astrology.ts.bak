/**
 * Univu Astrology Engine — Vedic + Western calculations
 *
 * This is a rule-based computational engine using classical
 * Vedic (Jyotish) and Western astrology rule-sets.
 *
 * DISCLAIMER: This is for ENTERTAINMENT and INFORMATION only.
 * It is NOT accurate prediction. Consult a professional astrologer.
 */

// ─── Zodiac Signs ────────────────────────────────────────────
export const WESTERN_SIGNS: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const VEDIC_RASHIS: string[] = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)',
  'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanu (Sagittarius)',
  'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

export const NAKSHATRAS: string[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// ─── Western Sun Sign from Date ──────────────────────────────
export function getWesternSunSign(month: number, day: number): string {
  const ranges: [number, number, string][] = [
    [1, 20, 'Capricorn'], [2, 19, 'Aquarius'], [3, 20, 'Pisces'],
    [4, 20, 'Aries'], [5, 21, 'Taurus'], [6, 21, 'Gemini'],
    [7, 22, 'Cancer'], [8, 23, 'Leo'], [9, 23, 'Virgo'],
    [10, 23, 'Libra'], [11, 22, 'Scorpio'], [12, 22, 'Sagittarius'],
  ];
  for (let i = 0; i < ranges.length; i++) {
    if (month === ranges[i][0] && day <= ranges[i][1]) {
      return i === 0 ? 'Capricorn' : WESTERN_SIGNS[i - 1];
    }
  }
  return WESTERN_SIGNS[month - 1];
}

// ─── Vedic Rashi (approximate — shifted ~23° from Western) ──
export function getVedicRashi(month: number, day: number): string {
  // Ayanamsa offset: Vedic signs are roughly one sign behind Western
  const westernIdx = WESTERN_SIGNS.indexOf(getWesternSunSign(month, day));
  const vedicIdx = (westernIdx + 11) % 12; // shift back by 1 (approximate Lahiri ayanamsa)
  return VEDIC_RASHIS[vedicIdx];
}

// ─── Nakshatra (birth star) — simplified from day of year ───
export function getNakshatra(month: number, day: number): string {
  const dayOfYear = getDayOfYear(month, day);
  const idx = Math.floor((dayOfYear / 365) * 27) % 27;
  return NAKSHATRAS[idx];
}

function getDayOfYear(month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let i = 1; i < month; i++) total += daysInMonth[i];
  return total + day;
}

// ─── Moon Sign (simplified from DOB hash) ───────────────────
export function getMoonSign(dob: string): string {
  let hash = 0;
  for (let i = 0; i < dob.length; i++) {
    hash = ((hash << 5) - hash) + dob.charCodeAt(i);
    hash = hash & hash;
  }
  return WESTERN_SIGNS[Math.abs(hash) % 12];
}

// ─── Rising Sign (simplified from name + DOB) ──────────────
export function getRisingSign(name: string, dob: string): string {
  let hash = 0;
  const seed = name + dob;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 3) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return WESTERN_SIGNS[Math.abs(hash) % 12];
}

// ─── Vedic Summary Generator ────────────────────────────────
interface VedicInput {
  rashi: string;
  nakshatra: string;
  gender: string;
  concern: string;
  isUnderage: boolean;
}

export function generateVedicSummary(input: VedicInput): string {
  if (input.isUnderage) {
    return `Born under the star ${input.nakshatra} with ${input.rashi} as your moon sign, you carry a beautiful cosmic energy. The stars encourage you to focus on education, develop your natural talents, and be kind to those around you. Your future holds great promise — trust the journey!`;
  }

  const rashiTraits: Record<string, string> = {
    'Mesha (Aries)': 'You possess fierce determination and natural leadership. Mars fuels your ambitions, but can also ignite impatience.',
    'Vrishabha (Taurus)': 'Venus blesses you with appreciation for beauty and stability. You\'re grounded but can be stubbornly attached to comfort.',
    'Mithuna (Gemini)': 'Mercury makes you intellectually agile and communicative. Your dual nature means you crave variety but struggle with focus.',
    'Karka (Cancer)': 'The Moon rules your emotional depths. You\'re nurturing and intuitive, but your moods shift like tides.',
    'Simha (Leo)': 'The Sun grants you charisma and pride. You\'re born to lead, but ego can be your blind spot.',
    'Kanya (Virgo)': 'Mercury sharpens your analytical mind. You seek perfection, which can become paralyzing self-criticism.',
    'Tula (Libra)': 'Venus gives you charm and a deep need for harmony. You avoid conflict, sometimes at the cost of your own truth.',
    'Vrischika (Scorpio)': 'Mars and Ketu give you intensity and depth. You see through facades, but your suspicion can push people away.',
    'Dhanu (Sagittarius)': 'Jupiter expands your horizons and idealism. You seek meaning but can be preachy or restless.',
    'Makara (Capricorn)': 'Saturn teaches you discipline and patience. You build slowly but surely — don\'t let ambition steal your joy.',
    'Kumbha (Aquarius)': 'Saturn and Rahu make you unconventional and visionary. You march to your own drum, sometimes alienating others.',
    'Meena (Pisces)': 'Jupiter and Ketu dissolve boundaries, making you deeply empathetic and spiritual. Guard against escapism.',
  };

  const rashiText = rashiTraits[input.rashi] || 'Your rashi carries a unique cosmic signature that shapes your inner world.';

  let concernNote = '';
  const c = input.concern.toLowerCase();
  if (c.includes('career') || c.includes('job') || c.includes('work')) {
    concernNote = 'Regarding your career: The 10th house (Karma Bhava) in your chart suggests that perseverance and strategic thinking will open doors. Don\'t chase titles — chase meaningful work.';
  } else if (c.includes('relationship') || c.includes('love') || c.includes('marriage')) {
    concernNote = 'Regarding relationships: The 7th house (Kalatra Bhava) indicates that honest communication and emotional maturity are your keys. Stop looking for perfection — look for growth.';
  } else if (c.includes('health')) {
    concernNote = 'Regarding health: The 6th house (Roga Bhava) urges discipline in diet and rest. Don\'t ignore your body\'s signals — prevention beats cure every time.';
  } else if (c.includes('financ') || c.includes('money') || c.includes('wealth')) {
    concernNote = 'Regarding finances: The 2nd and 11th houses govern wealth. Build steadily, avoid shortcuts, and diversify. Generosity paradoxically attracts more abundance.';
  } else if (c.includes('spiritual') || c.includes('purpose') || c.includes('meaning')) {
    concernNote = 'Regarding your spiritual path: The 9th and 12th houses point to a deep inner calling. Meditation, service, and honest self-inquiry will reveal your purpose.';
  } else {
    concernNote = `Regarding "${input.concern}": The cosmic energies around you suggest this is a pivotal area for growth. Approach it with honesty, patience, and willingness to change.`;
  }

  return `${rashiText}\n\nYour birth star ${input.nakshatra} adds layers of nuance — it governs your instinctual reactions and deep-seated patterns.\n\n${concernNote}`;
}

// ─── Western Summary Generator ──────────────────────────────
interface WesternInput {
  sunSign: string;
  moonSign: string;
  rising: string;
  gender: string;
  concern: string;
  isUnderage: boolean;
}

export function generateWesternSummary(input: WesternInput): string {
  if (input.isUnderage) {
    return `With your Sun in ${input.sunSign}, Moon in ${input.moonSign}, and ${input.rising} Rising, you have a wonderful blend of energies. This combination suggests creativity, kindness, and a bright future. Keep learning, stay curious, and believe in yourself!`;
  }

  const sunTraits: Record<string, string> = {
    'Aries': 'Your Aries Sun makes you a pioneer — bold, direct, sometimes reckless. You start strong but need to learn the art of finishing.',
    'Taurus': 'Your Taurus Sun craves security and sensory pleasure. You\'re reliable but can be maddeningly stubborn when pushed.',
    'Gemini': 'Your Gemini Sun gives you a quick mind and silver tongue. You adapt fast but scatter your energy across too many interests.',
    'Cancer': 'Your Cancer Sun makes you deeply emotional and protective. Home is sacred, but you must stop retreating into your shell when challenged.',
    'Leo': 'Your Leo Sun radiates warmth and demands attention. You\'re generous and creative, but your need for validation can be exhausting.',
    'Virgo': 'Your Virgo Sun drives you to analyze and improve everything. Service-oriented but prone to anxiety from impossible standards.',
    'Libra': 'Your Libra Sun seeks balance in all things. Diplomatic and fair, but your indecisiveness can stall your own progress.',
    'Scorpio': 'Your Scorpio Sun runs deep — transformative, passionate, secretive. You either evolve or self-destruct. There\'s no middle ground.',
    'Sagittarius': 'Your Sagittarius Sun seeks truth and adventure. Optimistic and philosophical, but your bluntness can wound without you realizing.',
    'Capricorn': 'Your Capricorn Sun is built for achievement. Disciplined and strategic, but learn to celebrate wins instead of immediately chasing the next mountain.',
    'Aquarius': 'Your Aquarius Sun makes you the rebel intellectual. You see the future, but connecting emotionally in the present is your challenge.',
    'Pisces': 'Your Pisces Sun dissolves boundaries between self and other. Compassionate and artistic, but you must guard against being everyone\'s emotional sponge.',
  };

  const sunText = sunTraits[input.sunSign] || `With your Sun in ${input.sunSign}, you carry a distinct cosmic signature.`;

  return `${sunText}\n\nWith your Moon in ${input.moonSign}, your emotional inner world operates differently from your outer persona. This creates internal tension that, when understood, becomes your greatest strength.\n\nYour ${input.rising} Rising is the mask you wear — how the world first perceives you. Understanding this difference between your Rising (appearance) and Sun (core self) is key to authentic living.`;
}

// ─── Combined Insight ───────────────────────────────────────
export function generateCombinedInsight(
  vedic: { rashi: string; nakshatra: string },
  western: { sunSign: string; moonSign: string; rising: string },
  concern: string,
  isUnderage: boolean
): string {
  if (isUnderage) {
    return 'Both Vedic and Western astrology agree: you have a bright and unique energy. The universe encourages you to explore your passions, be kind, and trust that great things are coming your way. Education and self-discovery are your superpowers right now!';
  }

  return `Where Vedic astrology sees you through the lens of ${vedic.rashi} and the ${vedic.nakshatra} nakshatra, Western astrology frames you as a ${western.sunSign} Sun with ${western.moonSign} emotional patterns. These aren't contradictions — they're different angles of the same diamond.\n\nThe honest truth? No planetary alignment will fix what only self-awareness and hard work can change. The stars show tendencies, not destiny. Your free will is the most powerful force in your chart.\n\nRegarding your concern: approach it with both the intuitive wisdom of the Vedic tradition and the psychological insight of Western astrology. Act with clarity, not fear.`;
}

// ─── Remedies Generator ─────────────────────────────────────
export function generateRemedies(
  rashi: string,
  nakshatra: string,
  concern: string,
  isUnderage: boolean
): string[] {
  if (isUnderage) {
    return [
      '📚 Focus on your studies and reading — knowledge is the best gift you can give yourself.',
      '🧘 Practice 5 minutes of quiet breathing each morning to start your day with calm.',
      '🌿 Spend time in nature — it connects you with the universe\'s energy.',
      '💛 Be kind to others — what you give comes back multiplied.',
      '🎨 Explore creative hobbies — art, music, writing, or anything that excites you.',
    ];
  }

  const baseRemedies = [
    `🕉 Chant the seed mantra for your rashi (${rashi.split(' ')[0]}) — even 5 minutes daily can shift your energy.`,
    `🪔 Light a sesame oil lamp on Saturdays to honor your karmic path.`,
    `🧘 Practice meditation for at least 10 minutes daily. Your mind is your most powerful instrument — train it.`,
    `📿 Wear or keep gemstones associated with your nakshatra (${nakshatra}) — but consult a qualified astrologer before investing in expensive stones.`,
    `🌊 Donate to those in need regularly. Generosity is the most powerful planetary remedy — period.`,
  ];

  const c = concern.toLowerCase();
  if (c.includes('career') || c.includes('job')) {
    baseRemedies.push(
      '💼 Recite Vishnu Sahasranama on Thursdays for career growth.',
      '🎯 Set clear 90-day goals. The planets support effort, not wishes.',
    );
  }
  if (c.includes('relationship') || c.includes('love')) {
    baseRemedies.push(
      '💕 Fast on Fridays (even partially) to strengthen Venus energy for relationships.',
      '🗣 Practice honest communication daily — no remedy replaces real conversation.',
    );
  }
  if (c.includes('health')) {
    baseRemedies.push(
      '🏃 Exercise at least 30 minutes daily. No mantra replaces physical discipline.',
      '🍃 Try Ayurvedic herbs like Ashwagandha or Tulsi — but consult a doctor first.',
    );
  }
  if (c.includes('financ') || c.includes('money')) {
    baseRemedies.push(
      '💰 Feed crows on Saturdays for Saturn\'s blessings on wealth matters.',
      '📊 Budget ruthlessly. The stars favor the disciplined, not the hopeful.',
    );
  }

  return baseRemedies;
}

// ─── Story Generator (anime-style celestial narrative) ──────
export function generateStory(
  name: string,
  sunSign: string,
  rashi: string,
  nakshatra: string,
  concern: string,
  isUnderage: boolean
): string {
  if (isUnderage) {
    return `In the great cosmic ocean, a brilliant star named ${name} was born under the constellation of ${nakshatra}. The Moon herself smiled, for this was no ordinary soul — this was a being of pure light and infinite potential. The celestial guardians whispered: "This one will change the world, not with power, but with kindness and courage." As ${name} grows, the universe watches with pride, knowing that every book read, every kind word spoken, and every dream dreamed adds to the tapestry of the cosmos. The story has just begun, and it promises to be extraordinary.`;
  }

  return `Long ago, when the universe was still young, a cosmic thread was woven into the fabric of existence — and that thread was ${name}. Born under the fire of ${sunSign} and the ancient gaze of ${nakshatra}, ${name} entered this world carrying both brilliance and shadow. The Vedic sages would have called it ${rashi} energy — a force that demands transformation, not comfort. Through the challenges of ${concern.toLowerCase()}, the stars do not promise ease — they promise meaning. Every obstacle is a cosmic teacher in disguise. The Moon whispers: "Stop looking for answers outside. The universe already placed them inside you." This is not a fairy tale. This is a wake-up call wrapped in starlight. ${name}'s story isn't written in the stars — it's written by ${name}'s own hands. The cosmos merely provides the ink.`;
}

// ─── Master Reading Generator ───────────────────────────────
export interface ReadingInput {
  name: string;
  dob: string;
  birthplace: string;
  gender: string;
  location: string;
  concern: string;
}

export interface FullReading {
  name: string;
  isUnderage: boolean;
  vedic: { rashi: string; nakshatra: string; summary: string };
  western: { sunSign: string; moonSign: string; rising: string; summary: string };
  combined: string;
  remedies: string[];
  story: string;
}

export function generateFullReading(input: ReadingInput): FullReading {
  const parts = input.dob.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  // Age check
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) age--;
  const isUnderage = age < 18;

  // Calculate positions
  const sunSign = getWesternSunSign(month, day);
  const moonSign = getMoonSign(input.dob);
  const rising = getRisingSign(input.name, input.dob);
  const rashi = getVedicRashi(month, day);
  const nakshatra = getNakshatra(month, day);

  // Generate content
  const vedicSummary = generateVedicSummary({
    rashi, nakshatra, gender: input.gender, concern: input.concern, isUnderage,
  });
  const westernSummary = generateWesternSummary({
    sunSign, moonSign, rising, gender: input.gender, concern: input.concern, isUnderage,
  });
  const combined = generateCombinedInsight(
    { rashi, nakshatra }, { sunSign, moonSign, rising }, input.concern, isUnderage,
  );
  const remedies = generateRemedies(rashi, nakshatra, input.concern, isUnderage);
  const story = generateStory(input.name, sunSign, rashi, nakshatra, input.concern, isUnderage);

  return {
    name: input.name,
    isUnderage,
    vedic: { rashi, nakshatra, summary: vedicSummary },
    western: { sunSign, moonSign, rising, summary: westernSummary },
    combined,
    remedies,
    story,
  };
}
