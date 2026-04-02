/**
 * Univu Astrology Engine — Complete Vedic + Western Calculations
 *
 * Implements: Lahiri Ayanamsa, Sun/Moon/Planet positions, Lagna,
 * Nakshatras, Tithis, Yogas, Karanas, Vimshottari Dasha, Manglik,
 * Sade Sati, Egyptian Decans, Mayan Tzolkin, and full report generation.
 *
 * DISCLAIMER: For ENTERTAINMENT and INFORMATION only.
 */

// ─── Constants ───────────────────────────────────────────────

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

export const RASHI_LORDS: string[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

export const NAKSHATRAS: string[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export const NAKSHATRA_RULERS: string[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
];

export const NAKSHATRA_DEITIES: string[] = [
  'Ashwini Kumaras', 'Yama', 'Agni', 'Brahma', 'Soma', 'Rudra',
  'Aditi', 'Brihaspati', 'Nagas', 'Pitris', 'Bhaga', 'Aryaman',
  'Savitar', 'Tvashtar', 'Vayu', 'Indragni', 'Mitra', 'Indra',
  'Nirriti', 'Apas', 'Vishvedevas', 'Vishnu', 'Vasus', 'Varuna',
  'Ajaikapada', 'Ahir Budhnya', 'Pushan',
];

export const NAKSHATRA_GANAS: string[] = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya',
  'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya',
  'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa',
  'Manushya', 'Manushya', 'Deva',
];

export const NAKSHATRA_YONIS: string[] = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog',
  'Cat', 'Sheep', 'Cat', 'Rat', 'Rat', 'Cow',
  'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
  'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse',
  'Lion', 'Cow', 'Elephant',
];

const TITHIS: string[] = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const YOGAS: string[] = [
  'Vishkambha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

const KARANAS: string[] = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

const DASHA_SEQUENCE: string[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const PLANET_ABBREVIATIONS: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma',
  Jupiter: 'Ju', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

const VARAS: string[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

const ZODIAC_BODY_MAP: Record<string, string> = {
  'Mesha (Aries)': 'Head, brain, face',
  'Vrishabha (Taurus)': 'Throat, neck, thyroid',
  'Mithuna (Gemini)': 'Arms, lungs, nervous system',
  'Karka (Cancer)': 'Chest, stomach, breasts',
  'Simha (Leo)': 'Heart, spine, upper back',
  'Kanya (Virgo)': 'Intestines, digestive system',
  'Tula (Libra)': 'Kidneys, lower back, skin',
  'Vrischika (Scorpio)': 'Reproductive organs, bladder',
  'Dhanu (Sagittarius)': 'Thighs, liver, hips',
  'Makara (Capricorn)': 'Knees, bones, joints, teeth',
  'Kumbha (Aquarius)': 'Ankles, calves, circulation',
  'Meena (Pisces)': 'Feet, lymphatic system, immune system',
};

const HOUSE_NAMES: string[] = [
  'Tanu Bhava (Self)', 'Dhana Bhava (Wealth)', 'Sahaja Bhava (Siblings)',
  'Sukha Bhava (Happiness)', 'Putra Bhava (Children)', 'Ripu Bhava (Enemies)',
  'Kalatra Bhava (Spouse)', 'Ayu Bhava (Longevity)', 'Dharma Bhava (Fortune)',
  'Karma Bhava (Career)', 'Labha Bhava (Gains)', 'Vyaya Bhava (Loss)',
];

const HOUSE_MEANINGS: string[] = [
  'body, personality, general health, head',
  'money, family, speech, right eye, food habits',
  'courage, siblings, short travel, arms/shoulders, communication',
  'mother, home, vehicles, land, chest, emotional peace',
  'children, intelligence, education, romance, stomach, past life merit (Purva Punya)',
  'enemies, disease, debts, service, maternal uncle, intestines',
  'marriage, partnerships, business partners, lower abdomen',
  'lifespan, sudden events, inheritance, hidden things, reproductive organs, occult',
  'father, guru, religion, long travel, higher education, thighs, luck',
  'profession, fame, government, authority, knees, public reputation',
  'income, elder siblings, friends, desires fulfilled, ankles/calves',
  'expenses, foreign travel, hospitals, spiritual liberation, feet, isolation, sleep',
];

// ─── Utility Functions ───────────────────────────────────────

function deg2rad(d: number): number { return d * Math.PI / 180; }
function rad2deg(r: number): number { return r * 180 / Math.PI; }
function sinD(d: number): number { return Math.sin(deg2rad(d)); }
function cosD(d: number): number { return Math.cos(deg2rad(d)); }
function tanD(d: number): number { return Math.tan(deg2rad(d)); }
function normalize360(d: number): number { return ((d % 360) + 360) % 360; }

/** Julian Day Number from year, month, day, UT hours */
function julianDay(year: number, month: number, day: number, utHours: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + utHours / 24 + B - 1524.5;
}

/** Julian centuries from J2000.0 */
function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

// ─── Section A: Lahiri Ayanamsa ──────────────────────────────

export function lahiriAyanamsa(year: number): number {
  return 23.856 + (year - 2000) * 0.01397;
}

function toSidereal(tropicalLon: number, ayanamsa: number): number {
  return normalize360(tropicalLon - ayanamsa);
}

// ─── Section B: Sun Position ─────────────────────────────────

export function sunTropicalLongitude(T: number): number {
  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C = (1.9146 - 0.004817 * T) * sinD(M)
          + (0.019993 - 0.000101 * T) * sinD(2 * M)
          + 0.00029 * sinD(3 * M);
  return normalize360(L0 + C);
}

export function sunMeanAnomaly(T: number): number {
  return normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
}

// ─── Section C: Moon Position ────────────────────────────────

export function moonTropicalLongitude(T: number, sunTropLon: number): number {
  const Lprime = normalize360(218.3165 + 481267.8813 * T);
  const Mprime = normalize360(134.9634 + 477198.8676 * T);
  const D = normalize360(297.8502 + 445267.1115 * T);
  const Msun = sunMeanAnomaly(T);

  const evection = 1.2739 * sinD(2 * D - Mprime);
  const annualEq = 0.1858 * sinD(Msun);
  const A3 = 0.37 * sinD(Msun);
  const MprimeC = Mprime + evection - annualEq - A3;
  const center = 6.2894 * sinD(MprimeC) + 0.214 * sinD(2 * MprimeC);
  const correctedLon = Lprime + evection + center - annualEq;
  const A4 = 0.6583 * sinD(2 * (correctedLon - sunTropLon));
  return normalize360(correctedLon + A4);
}

// ─── Section D: Ascendant (Lagna) ────────────────────────────

export function calculateLagna(jd: number, T: number, lat: number, lng: number, ayanamsa: number): number {
  const jd0 = Math.floor(jd - 0.5) + 0.5;
  const T0 = (jd0 - 2451545.0) / 36525;
  const GST0 = normalize360(100.46061837 + 36000.770053608 * T0
                + 0.000387933 * T0 * T0 - (T0 * T0 * T0) / 38710000);
  const utHours = (jd - jd0) * 24;
  const LST = normalize360(GST0 + utHours * 15 * 1.00273790935 + lng);
  const RAMC = LST;
  const epsilon = 23.4393 - 0.0130 * T;

  const tanLagna = cosD(RAMC) / (-(sinD(epsilon) * tanD(lat) + cosD(epsilon) * sinD(RAMC)));
  let lagna = rad2deg(Math.atan(tanLagna));

  if (cosD(RAMC) < 0) lagna += 180;
  if (lagna < 0) lagna += 360;
  lagna = normalize360(lagna);

  return toSidereal(lagna, ayanamsa);
}

// ─── Section E: Navagraha Positions ──────────────────────────

export interface PlanetPosition {
  name: string;
  abbreviation: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  rashi: string;
  rashiIndex: number;
  house: number;
  nakshatra: string;
  nakshatraIndex: number;
  nakshatraPada: number;
  retrograde: boolean;
}

export function calculatePlanetPositions(
  T: number,
  sunTropLon: number,
  ayanamsa: number,
  lagnaRashiIndex: number
): PlanetPosition[] {
  const meanLons: Record<string, number> = {
    Sun: normalize360(280.466 + 36000.770 * T),
    Moon: normalize360(218.317 + 481267.881 * T),
    Mercury: normalize360(252.251 + 149472.675 * T),
    Venus: normalize360(181.980 + 58517.816 * T),
    Mars: normalize360(355.433 + 19140.299 * T),
    Jupiter: normalize360(34.351 + 3034.906 * T),
    Saturn: normalize360(50.077 + 1222.114 * T),
    Rahu: normalize360(125.045 - 1934.136 * T),
  };

  const sunSidereal = toSidereal(sunTropLon, ayanamsa);
  const moonTrop = moonTropicalLongitude(T, sunTropLon);
  const moonSidereal = toSidereal(moonTrop, ayanamsa);
  const rahuSidereal = toSidereal(meanLons['Rahu'], ayanamsa);
  const ketuSidereal = normalize360(rahuSidereal + 180);

  const planetData: { name: string; sidereal: number; tropical: number; retrograde: boolean }[] = [
    { name: 'Sun', sidereal: sunSidereal, tropical: sunTropLon, retrograde: false },
    { name: 'Moon', sidereal: moonSidereal, tropical: moonTrop, retrograde: false },
    { name: 'Mercury', sidereal: toSidereal(meanLons['Mercury'], ayanamsa), tropical: meanLons['Mercury'], retrograde: false },
    { name: 'Venus', sidereal: toSidereal(meanLons['Venus'], ayanamsa), tropical: meanLons['Venus'], retrograde: false },
    { name: 'Mars', sidereal: toSidereal(meanLons['Mars'], ayanamsa), tropical: meanLons['Mars'], retrograde: false },
    { name: 'Jupiter', sidereal: toSidereal(meanLons['Jupiter'], ayanamsa), tropical: meanLons['Jupiter'], retrograde: false },
    { name: 'Saturn', sidereal: toSidereal(meanLons['Saturn'], ayanamsa), tropical: meanLons['Saturn'], retrograde: false },
    { name: 'Rahu', sidereal: rahuSidereal, tropical: meanLons['Rahu'], retrograde: true },
    { name: 'Ketu', sidereal: ketuSidereal, tropical: normalize360(meanLons['Rahu'] + 180), retrograde: true },
  ];

  const NAKSHATRA_SPAN = 360 / 27;
  const PADA_SPAN = 360 / 108;

  return planetData.map(p => {
    const rashiIdx = Math.floor(p.sidereal / 30);
    const nakIdx = Math.floor(p.sidereal / NAKSHATRA_SPAN) % 27;
    const padaPos = p.sidereal % NAKSHATRA_SPAN;
    const pada = Math.min(Math.floor(padaPos / PADA_SPAN) + 1, 4);
    const house = ((rashiIdx - lagnaRashiIndex + 12) % 12) + 1;
    return {
      name: p.name,
      abbreviation: PLANET_ABBREVIATIONS[p.name] || p.name.substring(0, 2),
      tropicalLongitude: p.tropical,
      siderealLongitude: p.sidereal,
      rashi: VEDIC_RASHIS[rashiIdx],
      rashiIndex: rashiIdx,
      house,
      nakshatra: NAKSHATRAS[nakIdx],
      nakshatraIndex: nakIdx,
      nakshatraPada: pada,
      retrograde: p.retrograde,
    };
  });
}

// ─── Section F: Tithi ────────────────────────────────────────

export interface TithiInfo {
  number: number;
  name: string;
  paksha: string;
}

export function calculateTithi(sunSidereal: number, moonSidereal: number): TithiInfo {
  const diff = normalize360(moonSidereal - sunSidereal);
  const num = Math.floor(diff / 12) + 1;
  const paksha = num <= 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
  return { number: num, name: TITHIS[(num - 1) % 30], paksha };
}

// ─── Section G: Yoga ─────────────────────────────────────────

export function calculateYoga(sunSidereal: number, moonSidereal: number): string {
  const sum = normalize360(sunSidereal + moonSidereal);
  const idx = Math.floor(sum / (360 / 27));
  return YOGAS[idx % 27];
}

// ─── Section H: Karana ───────────────────────────────────────

export function calculateKarana(sunSidereal: number, moonSidereal: number): string {
  const diff = normalize360(moonSidereal - sunSidereal);
  const idx = Math.floor(diff / 6);
  if (idx === 0) return 'Kimstughna';
  if (idx >= 57) return KARANAS[7 + (idx - 57)];
  return KARANAS[((idx - 1) % 7)];
}

// ─── Section I: Vimshottari Dasha ────────────────────────────

export interface DashaPeriod {
  planet: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  subPeriods: AntarDasha[];
}

export interface AntarDasha {
  planet: string;
  startAge: number;
  endAge: number;
}

export function calculateDashaTimeline(moonSidereal: number, birthYear: number): DashaPeriod[] {
  const NAKSHATRA_SPAN = 360 / 27;
  const nakshatraIdx = Math.floor(moonSidereal / NAKSHATRA_SPAN) % 27;
  const ruler = NAKSHATRA_RULERS[nakshatraIdx];
  const totalYears = DASHA_YEARS[ruler];
  const posInNakshatra = moonSidereal % NAKSHATRA_SPAN;
  const fractionRemaining = 1 - (posInNakshatra / NAKSHATRA_SPAN);
  const birthBalance = fractionRemaining * totalYears;
  const startIdx = DASHA_SEQUENCE.indexOf(ruler);

  const timeline: DashaPeriod[] = [];
  let currentAge = 0;

  for (let cycle = 0; cycle < 18; cycle++) {
    const seqIdx = (startIdx + cycle) % 9;
    const planet = DASHA_SEQUENCE[seqIdx];
    const years = cycle === 0 ? birthBalance : DASHA_YEARS[planet];
    const endAge = currentAge + years;

    const subPeriods: AntarDasha[] = [];
    let subAge = currentAge;
    for (let s = 0; s < 9; s++) {
      const subIdx = (seqIdx + s) % 9;
      const subPlanet = DASHA_SEQUENCE[subIdx];
      const subYears = (years * DASHA_YEARS[subPlanet]) / 120;
      subPeriods.push({
        planet: subPlanet,
        startAge: Math.round(subAge * 100) / 100,
        endAge: Math.round((subAge + subYears) * 100) / 100,
      });
      subAge += subYears;
    }

    timeline.push({
      planet,
      startAge: Math.round(currentAge * 100) / 100,
      endAge: Math.round(endAge * 100) / 100,
      startYear: Math.round(birthYear + currentAge),
      endYear: Math.round(birthYear + endAge),
      subPeriods,
    });

    currentAge = endAge;
    if (currentAge > 100) break;
  }

  return timeline;
}

// ─── Section J: Manglik (Kuja Dosha) ─────────────────────────

export interface ManglikStatus {
  isManglik: boolean;
  fromLagna: boolean;
  fromMoon: boolean;
  details: string;
  cancellations: string[];
}

export function checkManglik(planets: PlanetPosition[], moonRashiIdx: number): ManglikStatus {
  const mars = planets.find(p => p.name === 'Mars');
  const jupiter = planets.find(p => p.name === 'Jupiter');
  if (!mars) return { isManglik: false, fromLagna: false, fromMoon: false, details: 'Mars not found', cancellations: [] };

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const fromLagna = manglikHouses.includes(mars.house);
  const marsRashiFromMoon = ((mars.rashiIndex - moonRashiIdx + 12) % 12) + 1;
  const fromMoon = manglikHouses.includes(marsRashiFromMoon);
  const isManglik = fromLagna || fromMoon;
  const cancellations: string[] = [];

  if (mars.rashi.includes('Mesha') || mars.rashi.includes('Vrischika')) {
    cancellations.push('Mars is in own sign (Aries or Scorpio) — Dosha is weakened');
  }
  if (jupiter) {
    const jupMarsAspect = Math.abs(jupiter.siderealLongitude - mars.siderealLongitude);
    if (jupMarsAspect < 15 || Math.abs(jupMarsAspect - 120) < 15 || Math.abs(jupMarsAspect - 240) < 15) {
      cancellations.push('Jupiter aspects Mars — Dosha is significantly reduced');
    }
  }

  let details = '';
  if (isManglik) {
    details = 'Mars is placed in house ' + mars.house + ' from Lagna';
    if (fromMoon) details += ' and house ' + marsRashiFromMoon + ' from Moon sign';
    details += ', indicating Manglik Dosha (Kuja Dosha). ';
    if (cancellations.length > 0) {
      details += 'However, cancellation conditions apply: ' + cancellations.join('; ') + '. The Dosha is therefore reduced in intensity.';
    } else {
      details += 'This can cause delays or challenges in marriage. Remedies include worship of Lord Hanuman, recitation of Mangal Stotra, and matching with another Manglik partner.';
    }
  } else {
    details = 'Mars is not in houses 1, 2, 4, 7, 8, or 12 from Lagna or Moon sign. No Manglik Dosha is present.';
  }

  return { isManglik, fromLagna, fromMoon, details, cancellations };
}

// ─── Section K: Sade Sati ────────────────────────────────────

export interface SadeSatiStatus {
  isActive: boolean;
  phase: string;
  details: string;
}

export function checkSadeSati(saturnRashiIdx: number, moonRashiIdx: number): SadeSatiStatus {
  const diff = ((saturnRashiIdx - moonRashiIdx + 12) % 12);
  const isActive = diff === 11 || diff === 0 || diff === 1;
  let phase = '';
  if (diff === 11) phase = 'Rising Phase (Saturn in 12th from Moon)';
  else if (diff === 0) phase = 'Peak Phase (Saturn transiting over natal Moon)';
  else if (diff === 1) phase = 'Setting Phase (Saturn in 2nd from Moon)';

  const details = isActive
    ? 'Sade Sati is currently active — ' + phase + '. This ~7.5 year period brings tests of patience, maturity, and karmic lessons. Saturn demands discipline, restructuring, and letting go of what no longer serves you. Remedies include regular Saturn worship on Saturdays, charitable acts, and patient perseverance.'
    : 'Sade Sati is not currently active. Saturn is not transiting the 12th, 1st, or 2nd house from your natal Moon sign. Use this period to build and consolidate.';

  return { isActive, phase, details };
}

// ─── Western Sun Sign ────────────────────────────────────────

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

// ─── Egyptian Decan Analysis ─────────────────────────────────

const CHALDEAN_ORDER = ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'];

const EGYPTIAN_DEITIES = [
  'Khnum', 'Anubis', 'Horus', 'Isis', 'Thoth', 'Hathor',
  'Sekhmet', 'Ptah', 'Sobek', 'Atum', 'Tefnut', 'Shu',
  'Bastet', 'Osiris', 'Nephthys', 'Set', 'Maat', 'Nut',
  'Hapi', 'Wadjet', 'Khonsu', 'Mut', 'Ra', 'Amun',
  'Geb', 'Renenutet', 'Serapis', 'Seshat', 'Min', 'Taweret',
  'Neith', 'Bes', 'Heqet', 'Meskhenet', 'Satet', 'Khepri',
];

export function getEgyptianDecan(sunDegree: number): {
  sign: string; decanNumber: number; ruler: string; deity: string; traits: string;
} {
  const signIdx = Math.floor(sunDegree / 30);
  const degInSign = sunDegree % 30;
  const decanNum = Math.floor(degInSign / 10) + 1;
  const overallDecan = signIdx * 3 + (decanNum - 1);
  const ruler = CHALDEAN_ORDER[overallDecan % 7];
  const deity = EGYPTIAN_DEITIES[overallDecan % 36];

  const decanTraits: Record<string, string> = {
    Mars: 'warrior spirit, initiative, courage, competitive drive',
    Sun: 'leadership, authority, creative expression, vitality',
    Venus: 'beauty, harmony, artistic talent, romantic nature',
    Mercury: 'intellect, communication, adaptability, curiosity',
    Moon: 'emotional depth, intuition, nurturing, sensitivity',
    Saturn: 'discipline, structure, patience, karmic lessons',
    Jupiter: 'wisdom, expansion, optimism, spiritual growth',
  };

  return {
    sign: WESTERN_SIGNS[signIdx],
    decanNumber: decanNum,
    ruler,
    deity,
    traits: decanTraits[ruler] || 'unique cosmic qualities',
  };
}

// ─── Mayan Tzolkin ───────────────────────────────────────────

const MAYAN_DAY_SIGNS = [
  'Imix (Crocodile)', 'Ik (Wind)', 'Akbal (Night)', 'Kan (Seed)', 'Chicchan (Serpent)',
  'Cimi (Death)', 'Manik (Deer)', 'Lamat (Star)', 'Muluc (Water)', 'Oc (Dog)',
  'Chuen (Monkey)', 'Eb (Grass)', 'Ben (Reed)', 'Ix (Jaguar)', 'Men (Eagle)',
  'Cib (Owl)', 'Caban (Earth)', 'Etznab (Flint)', 'Cauac (Storm)', 'Ahau (Sun)',
];

const MAYAN_SIGN_MEANINGS: Record<string, string> = {
  'Imix (Crocodile)': 'Primal creative force, nurturing, new beginnings. You carry the energy of the primordial waters.',
  'Ik (Wind)': 'Communication, breath of life, spirit. You are a messenger of the divine.',
  'Akbal (Night)': 'Darkness, introspection, the void. You hold the mystery of the inner world.',
  'Kan (Seed)': 'Germination, potential, harvest. You are a planter of ideas.',
  'Chicchan (Serpent)': 'Kundalini, life force, instinct. You carry primal power and transformation.',
  'Cimi (Death)': 'Transformation, rebirth, ancestors. Every ending is a new beginning.',
  'Manik (Deer)': 'Healing, gentleness, pilgrimage. You carry the healer\'s touch.',
  'Lamat (Star)': 'Harmony, beauty, abundance. You shine with inner light.',
  'Muluc (Water)': 'Emotion, flow, purification. You move with the currents of feeling.',
  'Oc (Dog)': 'Loyalty, heart, guidance. You are a faithful companion and guide.',
  'Chuen (Monkey)': 'Creativity, play, artistry. You weave creation with joy.',
  'Eb (Grass)': 'Road, path, human condition. You walk the path of humanity.',
  'Ben (Reed)': 'Authority, family, pillars of strength. You stand tall like a pillar.',
  'Ix (Jaguar)': 'Earth magic, shamanism, feminine power. You carry the jaguar\'s stealth.',
  'Men (Eagle)': 'Vision, freedom, higher perspective. You soar above limitations.',
  'Cib (Owl)': 'Ancestral wisdom, forgiveness, karma. You carry old soul wisdom.',
  'Caban (Earth)': 'Earth force, evolution, navigation. You are connected to Earth\'s rhythms.',
  'Etznab (Flint)': 'Truth, reflection, clarity. You cut through illusion.',
  'Cauac (Storm)': 'Transformation, thunder, catalysis. You bring necessary storms.',
  'Ahau (Sun)': 'Enlightenment, mastery, wholeness. You carry the energy of the fully realized being.',
};

export function getMayanTzolkin(jd: number): { daySign: string; tone: number; meaning: string } {
  const dayCount = Math.floor(jd) - 584283;
  const daySignIdx = ((dayCount % 20) + 20) % 20;
  const tone = ((dayCount % 13) + 13) % 13 || 13;
  const daySign = MAYAN_DAY_SIGNS[daySignIdx];
  return {
    daySign,
    tone,
    meaning: MAYAN_SIGN_MEANINGS[daySign] || 'A unique cosmic energy pattern.',
  };
}

// ─── Atmakaraka ──────────────────────────────────────────────

export function calculateAtmakaraka(planets: PlanetPosition[]): {
  planet: string; degree: number; meaning: string;
} {
  const candidates = planets.filter(p => !['Rahu', 'Ketu'].includes(p.name));
  let maxDeg = -1;
  let ak = candidates[0];
  for (const p of candidates) {
    const degInSign = p.siderealLongitude % 30;
    if (degInSign > maxDeg) { maxDeg = degInSign; ak = p; }
  }

  const meanings: Record<string, string> = {
    Sun: 'desire for recognition, leadership, and self-realization. The soul seeks to shine and express its authentic power.',
    Moon: 'desire for emotional fulfillment, nurturing, and connection. The soul seeks peace through caring for others.',
    Mars: 'desire for strength, courage, and competition. The soul seeks to conquer challenges and protect the righteous.',
    Mercury: 'desire for knowledge, communication, and skill mastery. The soul seeks to learn and share wisdom.',
    Jupiter: 'desire for wisdom, children, and dharmic living. The soul seeks truth and spiritual expansion.',
    Venus: 'desire for love, beauty, and comfort. The soul seeks harmony through relationships and artistic expression.',
    Saturn: 'desire for discipline, service, and ultimate detachment. The soul seeks liberation through hard work.',
  };

  return { planet: ak.name, degree: maxDeg, meaning: meanings[ak.name] || 'a unique karmic path for the soul.' };
}

// ─── Panchanga ───────────────────────────────────────────────

export interface Panchanga {
  tithi: TithiInfo;
  nakshatra: string;
  nakshatraPada: number;
  yoga: string;
  karana: string;
  vara: string;
}

export function calculatePanchanga(sunSidereal: number, moonSidereal: number, jd: number): Panchanga {
  const dayOfWeek = (Math.floor(jd + 1.5) % 7);
  const NAKSHATRA_SPAN = 360 / 27;
  const PADA_SPAN = 360 / 108;
  const nakshatraIdx = Math.floor(moonSidereal / NAKSHATRA_SPAN) % 27;
  const padaPos = moonSidereal % NAKSHATRA_SPAN;
  const pada = Math.min(Math.floor(padaPos / PADA_SPAN) + 1, 4);

  return {
    tithi: calculateTithi(sunSidereal, moonSidereal),
    nakshatra: NAKSHATRAS[nakshatraIdx],
    nakshatraPada: pada,
    yoga: calculateYoga(sunSidereal, moonSidereal),
    karana: calculateKarana(sunSidereal, moonSidereal),
    vara: VARAS[dayOfWeek],
  };
}

// ─── Historical Patterns by Nakshatra ────────────────────────

const NAKSHATRA_FAMOUS: Record<string, string[]> = {
  'Ashwini': ['Bruce Lee — rapid action, martial arts pioneer', 'Amelia Earhart — trailblazing courage', 'Jackie Chan — physical dynamism and healing through action'],
  'Bharani': ['Rihanna — creative transformation', 'Karl Marx — revolutionary ideas on wealth', 'Princess Diana — rebirth through compassion'],
  'Krittika': ['Cleopatra — fiery authority', 'Frida Kahlo — artistic fire through suffering', 'Bill Gates — cutting-edge precision'],
  'Rohini': ['Queen Victoria — creative abundance', 'Krishna (mythological) — divine charm', 'Charlie Chaplin — emotional artistry'],
  'Mrigashira': ['Audrey Hepburn — graceful searching spirit', 'Swami Vivekananda — spiritual seeker', 'Nikola Tesla — restless innovation'],
  'Ardra': ['Albert Einstein — explosive intellectual transformation', 'Robin Williams — emotional turbulence channeled into art', 'Jawaharlal Nehru — reformative vision'],
  'Punarvasu': ['Dalai Lama — return to wisdom', 'Leonardo da Vinci — renewal through learning', 'Rama (mythological) — return to dharma'],
  'Pushya': ['Mahatma Gandhi — nurturing mass movements', 'Mother Teresa — selfless service', 'A.P.J. Abdul Kalam — nurturing aspirations'],
  'Ashlesha': ['Pablo Picasso — hypnotic creative intensity', 'Steve Jobs — serpentine cunning in business', 'Chanakya — strategic brilliance'],
  'Magha': ['Abraham Lincoln — ancestral dignity', 'Indira Gandhi — royal authority', 'Nelson Mandela — throne of the people'],
  'Purva Phalguni': ['Marilyn Monroe — creative radiance', 'Sachin Tendulkar — joyful mastery', 'Mozart — divine creative expression'],
  'Uttara Phalguni': ['Warren Buffett — partnership-based wealth', 'Oprah Winfrey — generous patronage', 'Srinivasa Ramanujan — meticulous genius'],
  'Hasta': ['Swami Sivananda — skillful healing hands', 'David Copperfield — magical craftsmanship', 'Jimmy Carter — humanitarian handiwork'],
  'Chitra': ['Michelangelo — celestial architect of beauty', 'Shah Jahan — builder of the Taj Mahal', 'Oscar Wilde — literary craftsmanship'],
  'Swati': ['Mahatma Gandhi — independent spirit', 'Saraswati (deity) — flowing wisdom', 'Mark Zuckerberg — connecting through ideas'],
  'Vishakha': ['Hillary Clinton — focused ambition', 'Guru Gobind Singh — spiritual warrior', 'Winston Churchill — single-minded perseverance'],
  'Anuradha': ['Kapil Dev — devoted friendship and teamwork', 'Narendra Modi — strategic alliances and loyalty'],
  'Jyeshtha': ['Beethoven — elder genius overcoming adversity', 'Tiger Woods — competitive supremacy', 'Alexander the Great — conquering spirit'],
  'Moola': ['Sri Aurobindo — seeking the root of existence', 'Nostradamus — digging into hidden knowledge', 'J. Krishnamurti — questioning to the root'],
  'Purva Ashadha': ['Swami Vivekananda — invincible spirit', 'Subhash Chandra Bose — early victory energy'],
  'Uttara Ashadha': ['George Washington — final victory through perseverance', 'Sardar Patel — unifying iron will', 'Bismillah Khan — sustained effort mastery'],
  'Shravana': ['Adi Shankaracharya — learning through listening', 'Vikram Sarabhai — listening to the cosmos', 'Lata Mangeshkar — voice that makes the world listen'],
  'Dhanishta': ['Che Guevara — rhythmic revolutionary energy', 'Usain Bolt — musical speed and rhythm'],
  'Shatabhisha': ['Nikola Tesla — healing through electricity', 'Ratan Tata — healing business practices', 'Jonas Salk — physician who healed millions'],
  'Purva Bhadrapada': ['Ramakrishna Paramahamsa — burning spiritual intensity', 'Martin Luther King Jr. — fiery idealism'],
  'Uttara Bhadrapada': ['Rumi — deep oceanic wisdom', 'Kabir — depths of spiritual poetry', 'Albert Schweitzer — profound compassion'],
  'Revati': ['Ramana Maharshi — transcendent final journey', 'Bob Marley — music that guides souls home'],
};


// ─── Report Helper: Planet in House Effects ──────────────────

function getPlanetInHouseEffect(planet: string, house: number): string {
  const key = planet + '_' + house;
  const effects: Record<string, string> = {
    Sun_1: 'Sun in 1st house gives strong personality, leadership ability, and robust health.',
    Sun_2: 'Sun in 2nd house brings wealth through authority. Speech is powerful and commanding.',
    Sun_3: 'Sun in 3rd house gives courage, strong communication, and competitive sibling bonds.',
    Sun_4: 'Sun in 4th house gives a strong connection to homeland but tension with mother.',
    Sun_5: 'Sun in 5th house blesses with intelligence, creativity, and a powerful firstborn.',
    Sun_6: 'Sun in 6th house gives victory over enemies. Government service may be indicated.',
    Sun_7: 'Sun in 7th house can create dominance in marriage. Spouse from a notable family.',
    Sun_8: 'Sun in 8th house brings interest in occult, transformation, government inheritance.',
    Sun_9: 'Sun in 9th house gives dharmic nature, good fortune from father, higher education.',
    Sun_10: 'Sun in 10th house — career authority, government positions, fame, natural leadership.',
    Sun_11: 'Sun in 11th house brings gains through powerful connections and government income.',
    Sun_12: 'Sun in 12th house indicates foreign residence, spiritual inclination, challenges with father.',
    Moon_1: 'Moon in 1st house gives emotional, caring personality with changing moods.',
    Moon_2: 'Moon in 2nd house brings wealth fluctuations, sweet voice, and family attachments.',
    Moon_3: 'Moon in 3rd house gives creative communication and emotional courage.',
    Moon_4: 'Moon in 4th house is very strong — domestic happiness, close to mother.',
    Moon_5: 'Moon in 5th house gives emotional intelligence and creative mind.',
    Moon_6: 'Moon in 6th house brings emotional enemies, health fluctuations, success in service.',
    Moon_7: 'Moon in 7th house gives a caring spouse and emotional partnerships.',
    Moon_8: 'Moon in 8th house gives emotional intensity, psychic ability, upheavals.',
    Moon_9: 'Moon in 9th house brings devotion, religious nature, fortune through mother.',
    Moon_10: 'Moon in 10th house gives public-facing career, popularity, professional changes.',
    Moon_11: 'Moon in 11th house brings emotional fulfillment through friendships.',
    Moon_12: 'Moon in 12th house gives spiritual inclination, foreign residence, rich dream life.',
    Mars_1: 'Mars in 1st house (Manglik) gives courage, athletic build, aggressive temperament.',
    Mars_2: 'Mars in 2nd house (Manglik) brings harsh speech, family disputes, aggressive wealth-building.',
    Mars_3: 'Mars in 3rd house gives immense courage, strong siblings, bold communication.',
    Mars_4: 'Mars in 4th house (Manglik) can cause domestic disturbance and property disputes.',
    Mars_5: 'Mars in 5th house gives sharp intelligence, athletic children, competitive education.',
    Mars_6: 'Mars in 6th house is excellent — victory over enemies, success in military/surgery.',
    Mars_7: 'Mars in 7th house (Manglik) brings passionate but potentially conflictual marriage.',
    Mars_8: 'Mars in 8th house (Manglik) gives accidents, surgery, powerful transformation.',
    Mars_9: 'Mars in 9th house gives warrior dharma, sometimes conflict with father or guru.',
    Mars_10: 'Mars in 10th house — career in military, police, engineering, surgery, or real estate.',
    Mars_11: 'Mars in 11th house brings gains through courage and influential friends.',
    Mars_12: 'Mars in 12th house (Manglik) gives foreign residence and spiritual warrior tendencies.',
    Mercury_1: 'Mercury in 1st house gives youthful appearance, quick wit, communication talent.',
    Mercury_2: 'Mercury in 2nd house brings wealth through intellect, eloquent speech.',
    Mercury_3: 'Mercury in 3rd house is very strong — excellent communication, writing talent.',
    Mercury_4: 'Mercury in 4th house gives educated mother, intellectual home environment.',
    Mercury_5: 'Mercury in 5th house blesses with sharp intellect, skill in mathematics.',
    Mercury_6: 'Mercury in 6th house gives analytical problem-solving against enemies.',
    Mercury_7: 'Mercury in 7th house brings an intelligent spouse and business partnerships.',
    Mercury_8: 'Mercury in 8th house gives research ability, interest in occult sciences.',
    Mercury_9: 'Mercury in 9th house gives higher education, philosophical communication.',
    Mercury_10: 'Mercury in 10th house — career in IT, communication, writing, accounting, or teaching.',
    Mercury_11: 'Mercury in 11th house brings gains through intellect and diverse friendships.',
    Mercury_12: 'Mercury in 12th house gives foreign communication, spiritual intellectual pursuits.',
    Jupiter_1: 'Jupiter in 1st house gives wisdom, healthy body, optimistic nature, teaching ability.',
    Jupiter_2: 'Jupiter in 2nd house is excellent for wealth — family prosperity, eloquent speech.',
    Jupiter_3: 'Jupiter in 3rd house gives wise communication and religious siblings.',
    Jupiter_4: 'Jupiter in 4th house brings domestic happiness, wise mother, property gains.',
    Jupiter_5: 'Jupiter in 5th house is very auspicious — brilliant children, high intelligence.',
    Jupiter_6: 'Jupiter in 6th house gives victory over enemies through wisdom.',
    Jupiter_7: 'Jupiter in 7th house brings a wise, educated spouse and dharmic marriage.',
    Jupiter_8: 'Jupiter in 8th house gives longevity, inheritance, deep spiritual knowledge.',
    Jupiter_9: 'Jupiter in 9th house is supremely powerful — dharmic life, guru blessings.',
    Jupiter_10: 'Jupiter in 10th house — career in law, education, banking, or counseling.',
    Jupiter_11: 'Jupiter in 11th house is excellent for wealth — all desires fulfilled.',
    Jupiter_12: 'Jupiter in 12th house gives spiritual liberation, foreign prosperity.',
    Venus_1: 'Venus in 1st house gives attractive appearance, artistic nature, love of luxury.',
    Venus_2: 'Venus in 2nd house brings wealth, beautiful voice, family harmony.',
    Venus_3: 'Venus in 3rd house gives artistic communication and creative siblings.',
    Venus_4: 'Venus in 4th house brings luxury vehicles, beautiful home, comfort.',
    Venus_5: 'Venus in 5th house gives romantic nature, creative children, artistic talent.',
    Venus_6: 'Venus in 6th house brings relationship enemies but success in beauty industries.',
    Venus_7: 'Venus in 7th house is very favorable — charming spouse, harmonious marriage.',
    Venus_8: 'Venus in 8th house gives hidden pleasures, inheritance through spouse.',
    Venus_9: 'Venus in 9th house brings fortune through art and luxury in travel.',
    Venus_10: 'Venus in 10th house — career in arts, entertainment, fashion, luxury, or diplomacy.',
    Venus_11: 'Venus in 11th house brings gains through beauty and pleasure from friendships.',
    Venus_12: 'Venus in 12th house gives foreign luxuries, secret relationships, spiritual devotion.',
    Saturn_1: 'Saturn in 1st house gives serious demeanor, lean body, life lessons through hardship.',
    Saturn_2: 'Saturn in 2nd house brings delayed wealth, frugal speech, slow accumulation.',
    Saturn_3: 'Saturn in 3rd house gives courage through perseverance and disciplined communication.',
    Saturn_4: 'Saturn in 4th house delays property, tension with mother, but eventual domestic stability.',
    Saturn_5: 'Saturn in 5th house delays children, gives serious intelligence and old-soul merit.',
    Saturn_6: 'Saturn in 6th house gives victory over chronic enemies but bone/joint issues.',
    Saturn_7: 'Saturn in 7th house delays marriage, brings older/serious spouse, lasting commitment.',
    Saturn_8: 'Saturn in 8th house gives longevity, chronic conditions, deep life understanding.',
    Saturn_9: 'Saturn in 9th house gives practical dharma, delayed higher education, strict guru.',
    Saturn_10: 'Saturn in 10th house — slow but steady career rise in labor, manufacturing, or government.',
    Saturn_11: 'Saturn in 11th house brings steady gains, loyal elder friends, patient fulfillment.',
    Saturn_12: 'Saturn in 12th house gives foreign exile, spiritual discipline through isolation.',
    Rahu_1: 'Rahu in 1st house gives unconventional personality, foreign connections, worldly ambition.',
    Rahu_2: 'Rahu in 2nd house brings unusual wealth patterns and unconventional speech.',
    Rahu_3: 'Rahu in 3rd house gives bold communication and media talent.',
    Rahu_4: 'Rahu in 4th house creates restlessness at home, foreign property connections.',
    Rahu_5: 'Rahu in 5th house gives speculative intelligence, unconventional education.',
    Rahu_6: 'Rahu in 6th house is powerful — victory over hidden enemies, foreign service.',
    Rahu_7: 'Rahu in 7th house brings foreign or unconventional spouse, karmic marriage.',
    Rahu_8: 'Rahu in 8th house gives occult interest, sudden transformations, mysterious health.',
    Rahu_9: 'Rahu in 9th house gives unconventional spirituality and foreign guru.',
    Rahu_10: 'Rahu in 10th house — unconventional career, foreign companies, technology, worldly fame.',
    Rahu_11: 'Rahu in 11th house brings large gains, powerful networks, worldly desire fulfillment.',
    Rahu_12: 'Rahu in 12th house gives foreign residence, vivid dreams, spiritual confusion.',
    Ketu_1: 'Ketu in 1st house gives spiritual personality and past-life wisdom.',
    Ketu_2: 'Ketu in 2nd house brings detachment from family wealth, unique speech.',
    Ketu_3: 'Ketu in 3rd house gives intuitive courage, psychic communication.',
    Ketu_4: 'Ketu in 4th house creates inner emotional detachment, spiritual home.',
    Ketu_5: 'Ketu in 5th house gives past-life spiritual merit, intuitive intelligence.',
    Ketu_6: 'Ketu in 6th house is good — victory through spiritual means, alternative healing.',
    Ketu_7: 'Ketu in 7th house brings karmic relationships, spiritual spouse.',
    Ketu_8: 'Ketu in 8th house is powerful — deep transformation, past-life occult knowledge.',
    Ketu_9: 'Ketu in 9th house gives past-life spiritual wisdom, alternative dharma.',
    Ketu_10: 'Ketu in 10th house — spiritual work, research, detachment from worldly ambition.',
    Ketu_11: 'Ketu in 11th house gives spiritual gains, detachment from worldly desires.',
    Ketu_12: 'Ketu in 12th house is excellent for liberation — strong meditation, past-life attainment.',
  };
  return effects[key] || (planet + ' in house ' + house + ' adds its unique energy to the affairs of this house.');
}

// ─── Rashi Trait Text ──────────────────

function getRashiTraitText(rashiIndex: number): string {
  const traits: string[] = [
    'Aries (Mesha): Pioneering, courageous, competitive, impulsive, natural leader. Ruled by Mars.',
    'Taurus (Vrishabha): Stable, sensual, patient, possessive, lover of beauty and comfort. Ruled by Venus.',
    'Gemini (Mithuna): Curious, communicative, versatile, restless, dual-natured. Ruled by Mercury.',
    'Cancer (Karka): Nurturing, emotional, protective, intuitive, deeply connected to home. Ruled by Moon.',
    'Leo (Simha): Regal, creative, generous, proud, natural performer. Ruled by Sun.',
    'Virgo (Kanya): Analytical, meticulous, service-oriented, critical, health-conscious. Ruled by Mercury.',
    'Libra (Tula): Harmonious, diplomatic, aesthetic, indecisive, partnership-oriented. Ruled by Venus.',
    'Scorpio (Vrischika): Intense, transformative, secretive, powerful, deeply perceptive. Ruled by Mars.',
    'Sagittarius (Dhanu): Optimistic, philosophical, adventurous, blunt, truth-seeking. Ruled by Jupiter.',
    'Capricorn (Makara): Disciplined, ambitious, practical, reserved, authority-building. Ruled by Saturn.',
    'Aquarius (Kumbha): Innovative, humanitarian, eccentric, detached, future-oriented. Ruled by Saturn.',
    'Pisces (Meena): Compassionate, imaginative, spiritual, escapist, boundary-dissolving. Ruled by Jupiter.',
  ];
  return traits[rashiIndex] || traits[0];
}

function getDashaEffects(planet: string): string {
  const effects: Record<string, string> = {
    Ketu: 'A period of spiritual awakening, detachment, sudden changes, and past-life karmic resolution.',
    Venus: 'A period of love, beauty, luxury, marriage, artistic expression, and material comforts.',
    Sun: 'A period of authority, recognition, government connections, father themes, and self-realization.',
    Moon: 'A period of emotional growth, mother themes, public life, travel, and mental expansion.',
    Mars: 'A period of courage, property, siblings, competition, surgery, and assertive action.',
    Rahu: 'A period of worldly ambition, foreign connections, unconventional paths, and intense desires.',
    Jupiter: 'A period of wisdom, expansion, children, education, dharma, and spiritual growth.',
    Saturn: 'A period of discipline, hard work, delays, chronic challenges, service, and eventual mastery.',
    Mercury: 'A period of communication, trade, intellect, education, writing, and nervous energy.',
  };
  return effects[planet] || 'A period of unique karmic experiences.';
}

// ─── Report Generators (using correct PlanetPosition/DashaPeriod interfaces) ──

function generatePersonalityReport(
  lagnaRashi: number, lagnaSign: string, moonRashi: number, moonSign: string,
  moonNakshatra: number, moonNakshatraName: string, moonNakshatraPada: number,
  gana: string, yoni: string, atmakaraka: { planet: string; degree: number; meaning: string }
): string {
  let r = '## Your Core Personality\n\n';
  r += '**Ascendant (Lagna):** ' + lagnaSign + '\n\n';
  r += getRashiTraitText(lagnaRashi) + '\n\n';
  r += 'Your Lagna defines how the world perceives you — your physical body and natural approach to life.\n\n';
  r += '**Moon Sign:** ' + moonSign + '\n\n';
  r += getRashiTraitText(moonRashi) + '\n\n';
  r += 'Your Moon sign reveals your emotional nature and subconscious patterns.\n\n';
  r += '**Birth Nakshatra:** ' + moonNakshatraName + ' (Pada ' + moonNakshatraPada + ')\n\n';
  const deity = NAKSHATRA_DEITIES[moonNakshatra] || 'the divine';
  r += 'Your nakshatra is ruled by ' + deity + ', granting unique spiritual gifts.\n\n';
  r += '**Gana (Temperament):** ' + gana + '\n';
  if (gana === 'Deva') r += 'Divine, sattvic temperament — gentle, noble, drawn to higher pursuits.\n\n';
  else if (gana === 'Manushya') r += 'Balanced, human temperament — practical, social, grounded.\n\n';
  else r += 'Intense, rakshasa temperament — powerful, independent, fiercely protective.\n\n';
  r += '**Yoni (Animal Nature):** ' + yoni + '\n';
  r += 'This reflects your instinctual nature and compatibility patterns.\n\n';
  r += '**Atmakaraka (Soul Planet):** ' + atmakaraka.planet + ' at ' + atmakaraka.degree.toFixed(2) + '\n\n';
  r += atmakaraka.meaning + '\n';
  return r;
}

function generateHouseAnalysis(planets: PlanetPosition[], lagnaRashi: number): string {
  let r = '## Houses of Your Chart\n\n';
  for (let h = 1; h <= 12; h++) {
    const houseName = HOUSE_NAMES[h - 1] || ('House ' + h);
    const houseMeaning = HOUSE_MEANINGS[h - 1] || '';
    r += '### ' + h + '. ' + houseName + '\n';
    r += '*' + houseMeaning + '*\n\n';
    const planetsInHouse = planets.filter(p => p.house === h);
    if (planetsInHouse.length === 0) {
      r += 'No planets occupy this house. Its effects are determined by its lord and aspects.\n\n';
    } else {
      for (const p of planetsInHouse) {
        r += '**' + p.name + '** in ' + p.rashi + ' (' + p.siderealLongitude.toFixed(1) + ')';
        if (p.retrograde) r += ' (Retrograde)';
        r += '\n';
        r += getPlanetInHouseEffect(p.name, h) + '\n\n';
      }
    }
  }
  return r;
}

function generateLifeTimeline(birthYear: number, dashaTimeline: DashaPeriod[]): string {
  let r = '## Your Life Timeline\n\n';
  const decades = [
    { label: 'Childhood (0-10)', start: birthYear, end: birthYear + 10 },
    { label: 'Youth (10-20)', start: birthYear + 10, end: birthYear + 20 },
    { label: 'Young Adult (20-30)', start: birthYear + 20, end: birthYear + 30 },
    { label: 'Prime (30-40)', start: birthYear + 30, end: birthYear + 40 },
    { label: 'Maturity (40-50)', start: birthYear + 40, end: birthYear + 50 },
    { label: 'Wisdom (50-60)', start: birthYear + 50, end: birthYear + 60 },
    { label: 'Elder (60-70)', start: birthYear + 60, end: birthYear + 70 },
    { label: 'Sage (70-80)', start: birthYear + 70, end: birthYear + 80 },
  ];
  for (const decade of decades) {
    r += '### ' + decade.label + '\n';
    const relevant = dashaTimeline.filter(d =>
      d.startYear < decade.end && d.endYear > decade.start
    );
    for (const d of relevant) {
      r += '**' + d.planet + ' Mahadasha** (' + d.startYear + '-' + d.endYear + '): ';
      r += getDashaEffects(d.planet) + '\n';
    }
    r += '\n';
  }
  return r;
}

function generateLoveReport(
  planets: PlanetPosition[], lagnaRashi: number, manglik: ManglikStatus, maritalStatus: string
): string {
  let r = '## Love & Relationships\n\n';
  const seventhRashi = (lagnaRashi + 6) % 12;
  const seventhSign = VEDIC_RASHIS[seventhRashi];
  r += '**7th House Sign:** ' + seventhSign + '\n\n';
  r += 'Your 7th house of partnerships falls in ' + seventhSign + '.\n\n';
  const venus = planets.find(p => p.name === 'Venus');
  if (venus) {
    r += '**Venus** in ' + venus.rashi + ': shapes your romantic nature. ';
    if (venus.retrograde) r += 'Venus retrograde suggests past-life romantic karma. ';
    r += '\n\n';
  }
  const planetsIn7 = planets.filter(p => p.house === 7);
  if (planetsIn7.length > 0) {
    r += '**Planets in 7th house:**\n';
    for (const p of planetsIn7) r += '- ' + p.name + ': ' + getPlanetInHouseEffect(p.name, 7) + '\n';
    r += '\n';
  }
  r += '**Manglik Status:** ' + (manglik.isManglik ? 'Manglik (Mangal Dosha present)' : 'Non-Manglik') + '\n\n';
  if (manglik.isManglik) {
    r += 'Remedies include Mangal Shanti puja, wearing red coral, and matching with another Manglik.\n\n';
  }
  if (maritalStatus === 'married') r += 'As a married person, focus on strengthening the existing bond.\n';
  else if (maritalStatus === 'single') r += 'For those seeking partnership, planetary transits indicate timing.\n';
  else if (maritalStatus === 'divorced') r += 'Past relationship patterns hold lessons. New opportunities ahead.\n';
  r += '\n';
  return r;
}

function generateCareerReport(
  planets: PlanetPosition[], lagnaRashi: number, employment: string
): string {
  let r = '## Career & Wealth\n\n';
  const tenthRashi = (lagnaRashi + 9) % 12;
  r += '**10th House Sign:** ' + VEDIC_RASHIS[tenthRashi] + '\n\n';
  const planetsIn10 = planets.filter(p => p.house === 10);
  if (planetsIn10.length > 0) {
    r += '**Planets in 10th house:**\n';
    for (const p of planetsIn10) r += '- ' + p.name + ': ' + getPlanetInHouseEffect(p.name, 10) + '\n';
    r += '\n';
  }
  const planetsIn2 = planets.filter(p => p.house === 2);
  const planetsIn11 = planets.filter(p => p.house === 11);
  if (planetsIn2.length + planetsIn11.length > 0) {
    r += '**Dhana Yoga Indicators:**\n';
    for (const p of planetsIn2) r += '- ' + p.name + ' in 2nd house supports wealth accumulation.\n';
    for (const p of planetsIn11) r += '- ' + p.name + ' in 11th house supports income gains.\n';
    r += '\n';
  }
  if (employment === 'employed') r += 'In your current employment, leverage your 10th house energies for advancement.\n';
  else if (employment === 'self-employed') r += 'As an entrepreneur, your chart supports independent ventures.\n';
  else if (employment === 'student') r += 'Your educational phase aligns with 5th and 9th house learning energies.\n';
  else if (employment === 'unemployed') r += 'This period is temporary. Opportunities emerge through planetary transits.\n';
  r += '\n';
  return r;
}

function generateHealthReport(planets: PlanetPosition[], lagnaRashi: number): string {
  let r = '## Health & Wellness\n\n';
  const lagnaSign = VEDIC_RASHIS[lagnaRashi];
  const lagnaBody = ZODIAC_BODY_MAP[lagnaSign] || 'general vitality';
  r += '**Ascendant Health Focus:** ' + lagnaSign + ' governs ' + lagnaBody + '.\n\n';
  const planetsIn6 = planets.filter(p => p.house === 6);
  const planetsIn8 = planets.filter(p => p.house === 8);
  if (planetsIn6.length > 0) {
    r += '**6th House (Disease):**\n';
    for (const p of planetsIn6) r += '- ' + p.name + ': Watch for health issues related to ' + p.name + ' significations.\n';
    r += '\n';
  }
  if (planetsIn8.length > 0) {
    r += '**8th House (Chronic/Hidden):**\n';
    for (const p of planetsIn8) r += '- ' + p.name + ': Potential for hidden or chronic conditions.\n';
    r += '\n';
  }
  r += '**General Recommendations:**\n';
  r += '- Follow dietary and lifestyle practices aligned with your Lagna sign.\n';
  r += '- Regular yoga asanas suited to your body constitution are recommended.\n\n';
  return r;
}

function generateSpiritualReport(
  planets: PlanetPosition[], lagnaRashi: number,
  atmakaraka: { planet: string; degree: number; meaning: string }, moonNakshatra: number
): string {
  let r = '## Spiritual Path\n\n';
  const ninthRashi = (lagnaRashi + 8) % 12;
  const twelfthRashi = (lagnaRashi + 11) % 12;
  r += '**9th House (Dharma):** ' + VEDIC_RASHIS[ninthRashi] + '\n';
  r += '**12th House (Moksha):** ' + VEDIC_RASHIS[twelfthRashi] + '\n\n';
  const planetsIn9 = planets.filter(p => p.house === 9);
  const planetsIn12 = planets.filter(p => p.house === 12);
  if (planetsIn9.length > 0) {
    r += '**Dharma Indicators:**\n';
    for (const p of planetsIn9) r += '- ' + p.name + ': ' + getPlanetInHouseEffect(p.name, 9) + '\n';
    r += '\n';
  }
  if (planetsIn12.length > 0) {
    r += '**Moksha Indicators:**\n';
    for (const p of planetsIn12) r += '- ' + p.name + ': ' + getPlanetInHouseEffect(p.name, 12) + '\n';
    r += '\n';
  }
  r += '**Atmakaraka Spiritual Message:**\n';
  r += 'Your soul planet ' + atmakaraka.planet + ' at ' + atmakaraka.degree.toFixed(2) + ' ';
  r += 'indicates the primary spiritual lesson of this incarnation.\n\n';
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  if (rahu && ketu) {
    r += '**Rahu-Ketu Axis:** Rahu in ' + rahu.rashi + ' / Ketu in ' + ketu.rashi + '\n';
    r += 'Rahu shows where you are heading; Ketu shows past-life mastery you carry.\n\n';
  }
  const nDeity = NAKSHATRA_DEITIES[moonNakshatra] || 'the cosmic divine';
  r += '**Nakshatra Deity:** ' + nDeity + '\n';
  r += 'Worship and meditation on ' + nDeity + ' aligns you with your birth star.\n\n';
  return r;
}

function generateEgyptianDecanReport(decan: { sign: string; decanNumber: number; ruler: string; deity: string; traits: string }): string {
  let r = '## Egyptian Decan Reading\n\n';
  r += '**Sign:** ' + decan.sign + ' | **Decan:** ' + decan.decanNumber + ' | **Ruler:** ' + decan.ruler + '\n';
  r += '**Deity:** ' + decan.deity + ' | **Traits:** ' + decan.traits + '\n\n';
  const meanings: Record<string, string> = {
    Mars: 'The warrior spirit of ancient Egypt flows through you. Like Montu, you are destined for conquest.',
    Sun: 'The solar deity Ra illuminates your path. You carry the pharaoh\'s natural authority.',
    Venus: 'Hathor\'s beauty and love grace your existence. Art and sensual pleasure are your birthright.',
    Mercury: 'Thoth, the ibis-headed god of wisdom, guides your intellect.',
    Moon: 'Khonsu, the moon god, shapes your emotional tides.',
    Saturn: 'The ancient builder\'s patience lives in you. You create structures that endure.',
    Jupiter: 'Amun-Ra\'s expansive blessing flows through you. Temples of wisdom are your legacy.',
  };
  r += (meanings[decan.ruler] || 'The ancient Egyptian mysteries speak through your birth decan.') + '\n\n';
  return r;
}

function generateMayanReport(mayan: { daySign: string; tone: number; meaning: string }): string {
  let r = '## Mayan Tzolkin Reading\n\n';
  r += '**Day Sign:** ' + mayan.daySign + ' | **Galactic Tone:** ' + mayan.tone + '\n\n';
  r += mayan.meaning + '\n\n';
  r += '**Galactic Tone ' + mayan.tone + ':** This tone shapes how your day sign expresses itself.\n\n';
  return r;
}

function generateHistoricalPatterns(moonNakshatra: number): string {
  let r = '## Historical Patterns\n\n';
  const nName = NAKSHATRAS[moonNakshatra];
  r += '**Your Nakshatra:** ' + nName + '\n\n';
  const famous = NAKSHATRA_FAMOUS[nName];
  if (famous && famous.length > 0) {
    r += 'Notable figures born under ' + nName + ':\n\n';
    for (const person of famous) r += '- **' + person + '**\n';
    r += '\nYou share cosmic DNA with these individuals.\n\n';
  } else {
    r += 'Those born under ' + nName + ' carry unique cosmic gifts.\n\n';
  }
  return r;
}

function generateRemedies(
  lagnaRashi: number, moonNakshatra: number, manglik: ManglikStatus,
  sadeSati: SadeSatiStatus, planets: PlanetPosition[]
): string {
  let r = '## Remedies & Recommendations\n\n';
  const deity = NAKSHATRA_DEITIES[moonNakshatra] || 'the divine';
  r += '### Nakshatra Remedies\n';
  r += '- Worship ' + deity + ' regularly for nakshatra blessings.\n';
  r += '- Chant the nakshatra mantra when Moon transits ' + NAKSHATRAS[moonNakshatra] + '.\n\n';
  if (manglik.isManglik) {
    r += '### Manglik Remedies\n';
    r += '- Perform Mangal Shanti Puja on Tuesdays.\n';
    r += '- Wear red coral (Moonga) on the ring finger after energization.\n';
    r += '- Offer red flowers to Hanuman ji on Tuesdays.\n';
    r += '- Fast on Tuesdays and donate red lentils (masoor dal).\n\n';
  }
  if (sadeSati.isActive) {
    r += '### Sade Sati Remedies\n';
    r += '- Worship Lord Shani on Saturdays.\n';
    r += '- Light a sesame oil lamp under a Peepal tree on Saturday evenings.\n';
    r += '- Donate black items (sesame, oil, iron) on Saturdays.\n';
    r += '- Chant "Om Sham Shanaishcharaya Namah" 108 times on Saturdays.\n\n';
  }
  const retroPlanets = planets.filter(p => p.retrograde);
  if (retroPlanets.length > 0) {
    r += '### Retrograde Planet Remedies\n';
    for (const p of retroPlanets) {
      r += '- ' + p.name + ' retrograde: Reflect on past patterns. Inner growth is prioritized.\n';
    }
    r += '\n';
  }
  r += '### Daily Practices\n';
  r += '- Rise before sunrise and offer water to the Sun (Surya Arghya).\n';
  r += '- Practice pranayama for mental clarity.\n';
  r += '- Wear gemstones only after thorough astrological consultation.\n\n';
  return r;
}

// ─── Story Generators ──────────────────

export interface StoryEvent {
  year: number;
  title: string;
  description: string;
  planet: string;
  type: 'birth' | 'childhood' | 'education' | 'career' | 'love' | 'spiritual' | 'challenge' | 'triumph';
}

function generateStoryNarrative(
  name: string, lagnaSign: string, moonSign: string, moonNakshatraName: string,
  atmakaraka: { planet: string; degree: number; meaning: string }
): string {
  let s = '## Your Cosmic Story\n\n';
  s += 'In the grand tapestry of the cosmos, at the precise moment of your birth, ';
  s += 'the heavens aligned in a unique configuration that had not occurred before.\n\n';
  s += name + ', you entered this world under the rising sign of ' + lagnaSign + ', ';
  s += 'with the Moon resting in ' + moonSign + ' within the sacred nakshatra of ' + moonNakshatraName + '. ';
  s += 'Your soul, guided by ' + atmakaraka.planet + ' as its Atmakaraka, chose this very moment.\n\n';
  s += 'The ancient rishis would say that the configuration of stars at your birth is a map — ';
  s += 'not of fate carved in stone, but of potential waiting to be unlocked.\n\n';
  s += 'As you read what follows, remember: the stars impel, they do not compel. ';
  s += 'You are the author of your story, and the cosmos is your co-creator.\n\n';
  return s;
}

function generateStoryEvents(
  birthYear: number, dashaTimeline: DashaPeriod[], lagnaSign: string
): StoryEvent[] {
  const events: StoryEvent[] = [];
  events.push({
    year: birthYear,
    title: 'Birth Under ' + lagnaSign,
    description: 'You arrived in this world with ' + lagnaSign + ' rising on the eastern horizon.',
    planet: 'Lagna',
    type: 'birth',
  });
  for (const dasha of dashaTimeline) {
    if (dasha.startYear <= birthYear) continue;
    let type: StoryEvent['type'] = 'career';
    if (dasha.startYear < birthYear + 12) type = 'childhood';
    else if (dasha.startYear < birthYear + 22) type = 'education';
    else if (dasha.startYear < birthYear + 35) type = 'career';
    else if (dasha.startYear < birthYear + 50) type = 'love';
    else type = 'spiritual';
    events.push({
      year: dasha.startYear,
      title: dasha.planet + ' Mahadasha Begins',
      description: getDashaEffects(dasha.planet),
      planet: dasha.planet,
      type,
    });
  }
  return events;
}

// ─── Public Interfaces ──────────────────

export interface ReadingInput {
  name: string;
  dob: string;
  timeOfBirth: string;
  birthLat: number;
  birthLng: number;
  birthCity: string;
  currentLat: number;
  currentLng: number;
  currentCity: string;
  gender: string;
  maritalStatus: string;
  employment: string;
  concern: string;
  chartType: 'north' | 'south';
  language: string;
}

export interface FullReading {
  name: string;
  dob: string;
  birthCity: string;
  currentCity: string;
  gender: string;
  lagnaRashi: number;
  lagnaSign: string;
  moonRashi: number;
  moonSign: string;
  sunRashi: number;
  sunSign: string;
  moonNakshatra: number;
  moonNakshatraName: string;
  moonNakshatraPada: number;
  planets: PlanetPosition[];
  chartType: 'north' | 'south';
  panchanga: Panchanga;
  dashaTimeline: DashaPeriod[];
  currentDasha: string;
  currentAntardasha: string;
  manglik: ManglikStatus;
  sadeSati: SadeSatiStatus;
  atmakaraka: { planet: string; degree: number; meaning: string };
  westernSunSign: string;
  egyptianDecan: { sign: string; decanNumber: number; ruler: string; deity: string; traits: string };
  mayanTzolkin: { daySign: string; tone: number; meaning: string };
  personalityReport: string;
  houseAnalysis: string;
  lifeTimeline: string;
  loveReport: string;
  careerReport: string;
  healthReport: string;
  spiritualReport: string;
  egyptianReport: string;
  mayanReport: string;
  historicalPatterns: string;
  remedies: string;
  storyNarrative: string;
  storyEvents: StoryEvent[];
}

// ─── Master Function ──────────────────

export function generateFullReading(input: ReadingInput): FullReading {
  const [yearStr, monthStr, dayStr] = input.dob.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  let hour = 12;
  let minute = 0;
  if (input.timeOfBirth) {
    const [hStr, mStr] = input.timeOfBirth.split(':');
    hour = parseInt(hStr, 10) || 12;
    minute = parseInt(mStr, 10) || 0;
  }
  const fractionalHour = hour + minute / 60;

  // Julian Day & centuries
  const jd = julianDay(year, month, day, fractionalHour);
  const T = julianCenturies(jd);

  // Ayanamsa (lahiriAyanamsa takes a year number)
  const ayanamsa = lahiriAyanamsa(year);

  // Sun
  const sunTropical = sunTropicalLongitude(T);
  const sunSidereal = toSidereal(sunTropical, ayanamsa);
  const sunRashi = Math.floor(sunSidereal / 30) % 12;
  const sunSign = VEDIC_RASHIS[sunRashi];

  // Moon (moonTropicalLongitude takes T and sunTropLon)
  const moonTropical = moonTropicalLongitude(T, sunTropical);
  const moonSidereal = toSidereal(moonTropical, ayanamsa);
  const moonRashi = Math.floor(moonSidereal / 30) % 12;
  const moonSign = VEDIC_RASHIS[moonRashi];
  const NAKSHATRA_SPAN = 360 / 27;
  const moonNakshatra = Math.floor(moonSidereal / NAKSHATRA_SPAN) % 27;
  const moonNakshatraName = NAKSHATRAS[moonNakshatra];
  const nakshatraDeg = moonSidereal % NAKSHATRA_SPAN;
  const moonNakshatraPada = Math.min(Math.floor(nakshatraDeg / (360 / 108)) + 1, 4);

  // Lagna (calculateLagna takes jd, T, lat, lng, ayanamsa)
  const lagnaLong = calculateLagna(jd, T, input.birthLat, input.birthLng, ayanamsa);
  const lagnaRashi = Math.floor(lagnaLong / 30) % 12;
  const lagnaSign = VEDIC_RASHIS[lagnaRashi];

  // Planets (calculatePlanetPositions takes T, sunTropical, ayanamsa, lagnaRashiIndex)
  const planets = calculatePlanetPositions(T, sunTropical, ayanamsa, lagnaRashi);

  // Panchanga (calculatePanchanga takes sunSidereal, moonSidereal, jd)
  const panchanga = calculatePanchanga(sunSidereal, moonSidereal, jd);

  // Dasha (calculateDashaTimeline takes moonSidereal, birthYear)
  const dashaTimeline = calculateDashaTimeline(moonSidereal, year);
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - year;
  let currentDasha = '';
  let currentAntardasha = '';
  for (const d of dashaTimeline) {
    if (currentAge >= d.startAge && currentAge <= d.endAge) {
      currentDasha = d.planet;
      for (const sub of d.subPeriods) {
        if (currentAge >= sub.startAge && currentAge <= sub.endAge) {
          currentAntardasha = sub.planet;
          break;
        }
      }
      break;
    }
  }

  // Manglik (checkManglik takes planets, moonRashiIdx)
  const manglik = checkManglik(planets, moonRashi);

  // Sade Sati (checkSadeSati takes saturnRashiIdx, moonRashiIdx)
  const saturnPos = planets.find(p => p.name === 'Saturn');
  const saturnRashi = saturnPos ? saturnPos.rashiIndex : 0;
  const sadeSati = checkSadeSati(saturnRashi, moonRashi);

  // Atmakaraka
  const atmakaraka = calculateAtmakaraka(planets);

  // Multi-tradition
  const westernSunSign = getWesternSunSign(month, day);
  // getEgyptianDecan takes sunDegree (sidereal longitude of sun)
  const egyptianDecan = getEgyptianDecan(sunSidereal);
  // getMayanTzolkin takes jd
  const mayanTzolkin = getMayanTzolkin(jd);

  // Gana and Yoni
  const gana = NAKSHATRA_GANAS[moonNakshatra] || 'Manushya';
  const yoni = NAKSHATRA_YONIS[moonNakshatra] || 'Unknown';

  // Generate reports
  const personalityReport = generatePersonalityReport(
    lagnaRashi, lagnaSign, moonRashi, moonSign,
    moonNakshatra, moonNakshatraName, moonNakshatraPada,
    gana, yoni, atmakaraka
  );
  const houseAnalysis = generateHouseAnalysis(planets, lagnaRashi);
  const lifeTimeline = generateLifeTimeline(year, dashaTimeline);
  const loveReport = generateLoveReport(planets, lagnaRashi, manglik, input.maritalStatus);
  const careerReport = generateCareerReport(planets, lagnaRashi, input.employment);
  const healthReport = generateHealthReport(planets, lagnaRashi);
  const spiritualReport = generateSpiritualReport(planets, lagnaRashi, atmakaraka, moonNakshatra);
  const egyptianReport = generateEgyptianDecanReport(egyptianDecan);
  const mayanReport = generateMayanReport(mayanTzolkin);
  const historicalPatternsReport = generateHistoricalPatterns(moonNakshatra);
  const remedies = generateRemedies(lagnaRashi, moonNakshatra, manglik, sadeSati, planets);
  const storyNarrative = generateStoryNarrative(input.name, lagnaSign, moonSign, moonNakshatraName, atmakaraka);
  const storyEvents = generateStoryEvents(year, dashaTimeline, lagnaSign);

  return {
    name: input.name,
    dob: input.dob,
    birthCity: input.birthCity,
    currentCity: input.currentCity,
    gender: input.gender,
    lagnaRashi,
    lagnaSign,
    moonRashi,
    moonSign,
    sunRashi,
    sunSign,
    moonNakshatra,
    moonNakshatraName,
    moonNakshatraPada,
    planets,
    chartType: input.chartType || 'north',
    panchanga,
    dashaTimeline,
    currentDasha,
    currentAntardasha,
    manglik,
    sadeSati,
    atmakaraka,
    westernSunSign,
    egyptianDecan,
    mayanTzolkin,
    personalityReport,
    houseAnalysis,
    lifeTimeline,
    loveReport,
    careerReport,
    healthReport,
    spiritualReport,
    egyptianReport,
    mayanReport,
    historicalPatterns: historicalPatternsReport,
    remedies,
    storyNarrative,
    storyEvents,
  };
}
