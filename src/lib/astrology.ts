/**
 * Univu Astrology Engine — Complete Vedic + Western Calculations
 *
 * Implements: Lahiri Ayanamsa, Sun/Moon/Planet positions, Lagna,
 * Nakshatras, Tithis, Yogas, Karanas, Vimshottari Dasha, Manglik,
 * Sade Sati, Egyptian Decans, Mayan Tzolkin, and full report generation.
 *
 * Planet positions powered by astronomy-engine (VSOP87 theory, arcsecond accuracy).
 * DISCLAIMER: For ENTERTAINMENT and INFORMATION only.
 */

import * as Astro from 'astronomy-engine';

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
  lagnaRashiIndex: number,
  birthDateUTC?: Date
): PlanetPosition[] {
  // ── True geocentric positions via astronomy-engine (VSOP87, arcsecond accuracy) ──
  // Falls back to mean longitudes only if no birth date is provided (should never happen in practice)

  let sunTropical = sunTropLon;
  let moonTropical = moonTropicalLongitude(T, sunTropLon);
  const truePlanetTropical: Record<string, number> = {};
  const retrogradeFlags: Record<string, boolean> = {};

  if (birthDateUTC) {
    // Sun: geocentric tropical ecliptic longitude
    sunTropical = Astro.SunPosition(birthDateUTC).elon;

    // Moon: geocentric tropical ecliptic longitude
    moonTropical = Astro.EclipticGeoMoon(birthDateUTC).lon;

    // Five visible planets: geocentric tropical ecliptic longitude + retrograde detection
    const nextDay = new Date(birthDateUTC.getTime() + 86400000);
    const fivePlanets: Astro.Body[] = [
      Astro.Body.Mercury, Astro.Body.Venus, Astro.Body.Mars,
      Astro.Body.Jupiter, Astro.Body.Saturn,
    ];
    for (const body of fivePlanets) {
      const name = body as string;
      const vec = Astro.GeoVector(body, birthDateUTC, true);
      const ecl = Astro.Ecliptic(vec);
      truePlanetTropical[name] = ecl.elon;

      // Retrograde: compare ecliptic longitude today vs tomorrow
      const vec2 = Astro.GeoVector(body, nextDay, true);
      const ecl2 = Astro.Ecliptic(vec2);
      let dailyMotion = ecl2.elon - ecl.elon;
      if (dailyMotion > 300) dailyMotion -= 360;
      if (dailyMotion < -300) dailyMotion += 360;
      retrogradeFlags[name] = dailyMotion < 0;
    }
  } else {
    // Fallback: mean longitudes (less accurate, kept for safety)
    const meanLons: Record<string, number> = {
      Mercury: normalize360(252.251 + 149472.675 * T),
      Venus: normalize360(181.980 + 58517.816 * T),
      Mars: normalize360(355.433 + 19140.299 * T),
      Jupiter: normalize360(34.351 + 3034.906 * T),
      Saturn: normalize360(50.077 + 1222.114 * T),
    };
    for (const name of Object.keys(meanLons)) {
      truePlanetTropical[name] = meanLons[name];
      retrogradeFlags[name] = false;
    }
  }

  // Rahu: Mean lunar node (standard in Vedic astrology — most jyotish software uses mean node)
  const rahuTropical = normalize360(125.045 - 1934.136 * T);
  const ketuTropical = normalize360(rahuTropical + 180);

  // Convert all to sidereal
  const sunSidereal = toSidereal(sunTropical, ayanamsa);
  const moonSidereal = toSidereal(moonTropical, ayanamsa);
  const rahuSidereal = toSidereal(rahuTropical, ayanamsa);
  const ketuSidereal = normalize360(rahuSidereal + 180);

  const planetData: { name: string; sidereal: number; tropical: number; retrograde: boolean }[] = [
    { name: 'Sun', sidereal: sunSidereal, tropical: sunTropical, retrograde: false },
    { name: 'Moon', sidereal: moonSidereal, tropical: moonTropical, retrograde: false },
    { name: 'Mercury', sidereal: toSidereal(truePlanetTropical['Mercury'], ayanamsa), tropical: truePlanetTropical['Mercury'], retrograde: retrogradeFlags['Mercury'] ?? false },
    { name: 'Venus', sidereal: toSidereal(truePlanetTropical['Venus'], ayanamsa), tropical: truePlanetTropical['Venus'], retrograde: retrogradeFlags['Venus'] ?? false },
    { name: 'Mars', sidereal: toSidereal(truePlanetTropical['Mars'], ayanamsa), tropical: truePlanetTropical['Mars'], retrograde: retrogradeFlags['Mars'] ?? false },
    { name: 'Jupiter', sidereal: toSidereal(truePlanetTropical['Jupiter'], ayanamsa), tropical: truePlanetTropical['Jupiter'], retrograde: retrogradeFlags['Jupiter'] ?? false },
    { name: 'Saturn', sidereal: toSidereal(truePlanetTropical['Saturn'], ayanamsa), tropical: truePlanetTropical['Saturn'], retrograde: retrogradeFlags['Saturn'] ?? false },
    { name: 'Rahu', sidereal: rahuSidereal, tropical: rahuTropical, retrograde: true },
    { name: 'Ketu', sidereal: ketuSidereal, tropical: ketuTropical, retrograde: true },
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
// Cancellation rules sourced from Brihat Parashara Hora Shastra (BPHS)
// and Jataka Parijata — the two primary classical authorities.
// Only universally-accepted cancellations are applied here.

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
  const venus = planets.find(p => p.name === 'Venus');
  const saturn = planets.find(p => p.name === 'Saturn');
  const rahu = planets.find(p => p.name === 'Rahu');
  if (!mars) return { isManglik: false, fromLagna: false, fromMoon: false, details: 'Mars not found', cancellations: [] };

  // Step 1: Standard house check — Mars in 1, 2, 4, 7, 8, 12 from Lagna and Moon
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const fromLagna = manglikHouses.includes(mars.house);
  const marsHouseFromMoon = ((mars.rashiIndex - moonRashiIdx + 12) % 12) + 1;
  const fromMoon = manglikHouses.includes(marsHouseFromMoon);
  const rawPresent = fromLagna || fromMoon;

  // Step 2: Classical cancellation rules (BPHS, Jataka Parijata)
  const cancellations: string[] = [];

  // C1: Mars in own sign (Aries / Scorpio) — dignified Mars, aggression is constructive
  if (mars.rashi.includes('Mesha') || mars.rashi.includes('Vrischika')) {
    cancellations.push('Mars in own sign (Aries/Scorpio) — dignified, Dosha cancelled');
  }

  // C2: Mars exalted in Capricorn — Mars at peak strength, universally accepted full cancellation
  if (mars.rashi.includes('Makara')) {
    cancellations.push('Mars exalted in Capricorn — full cancellation per BPHS');
  }

  // C3: Jupiter conjuncts or aspects Mars (Vedic aspects: conjunction, 5th, 7th, 9th house from Jupiter)
  if (jupiter) {
    const jupFromMars = ((jupiter.rashiIndex - mars.rashiIndex + 12) % 12);
    if (jupFromMars === 0 || jupFromMars === 4 || jupFromMars === 6 || jupFromMars === 8) {
      cancellations.push('Jupiter aspects/conjoins Mars — benefic influence reduces Dosha');
    }
  }

  // C4: Venus or Jupiter in the 7th house — benefic presence protects marriage house
  if (venus && venus.house === 7) {
    cancellations.push('Venus in 7th house — natural benefic protects marriage');
  }
  if (jupiter && jupiter.house === 7) {
    cancellations.push('Jupiter in 7th house — greatest benefic protects marriage');
  }

  // C5: Mars in Jupiter-ruled sign (Sagittarius / Pisces) — benefic lordship softens Mars
  if (mars.rashi.includes('Dhanu') || mars.rashi.includes('Meena')) {
    cancellations.push('Mars in Jupiter-ruled sign — benefic sign lordship softens Dosha');
  }

  // C6: Saturn conjoins Mars (same rashi) — Saturn restricts and disciplines Mars energy
  if (saturn && saturn.rashiIndex === mars.rashiIndex) {
    cancellations.push('Saturn conjoins Mars — Saturn restricts Mars aggression');
  }

  // C7: Rahu conjoins Mars (same rashi) — modifies standard Manglik pattern (Angarak Yoga)
  if (rahu && rahu.rashiIndex === mars.rashiIndex) {
    cancellations.push('Rahu conjoins Mars — modifies standard Manglik pattern');
  }

  // Step 3: Determine final result
  // Any cancellation means the Dosha is at minimum reduced; 2+ means effectively cancelled
  const effectivelyCancelled = cancellations.length >= 2;
  const partiallyReduced = cancellations.length === 1;
  const isManglik = rawPresent && !effectivelyCancelled;

  // Step 4: Build detailed explanation
  let details = '';
  if (rawPresent) {
    details = 'Mars is placed in house ' + mars.house + ' from Lagna';
    if (fromMoon) details += ' and house ' + marsHouseFromMoon + ' from Moon sign';
    details += ', indicating Manglik Dosha (Kuja Dosha). ';

    if (effectivelyCancelled) {
      details += 'However, multiple cancellation conditions apply: ' + cancellations.join('; ') + '. ';
      details += 'The Dosha is effectively cancelled. Most Vedic astrologers would classify this as non-Manglik.';
    } else if (partiallyReduced) {
      details += 'A partial cancellation applies: ' + cancellations[0] + '. ';
      details += 'The Dosha is present but reduced in intensity. After age 28, it weakens further per tradition.';
    } else {
      details += 'No significant cancellation conditions are present. ';
      details += 'Remedies include worship of Lord Hanuman on Tuesdays, recitation of Mangal Stotra, and matching with another Manglik partner. ';
      details += 'After age 28, the Dosha is traditionally considered to weaken.';
    }
  } else {
    details = 'Mars is in house ' + mars.house + ' from Lagna and house ' + marsHouseFromMoon + ' from Moon sign. ';
    details += 'Mars is NOT in houses 1, 2, 4, 7, 8, or 12 from either reference. No Manglik Dosha is present.';
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

// ─── Chinese Zodiac ──────────────────────────────────────────

const CHINESE_ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'] as const;
const CHINESE_ELEMENTS = ['Wood','Fire','Earth','Metal','Water'] as const;
const HEAVENLY_STEMS = ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'] as const;
const EARTHLY_BRANCHES = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'] as const;

const CHINESE_ANIMAL_MEANINGS: Record<string, string> = {
  Rat:     'Resourceful, quick-witted, charming, and versatile. You are a natural strategist who can navigate complex situations with ease. Rats are the first sign — representing the pioneer\'s energy, adaptability, and the intelligence to seize opportunity when others are still sleeping.',
  Ox:      'Dependable, methodical, and powerfully determined. You build slowly but permanently. The Ox is the backbone of civilization — patient, honest, and capable of bearing immense burdens without complaint. What you commit to, you complete.',
  Tiger:   'Brave, competitive, unpredictable, and magnetic. You command attention without trying. The Tiger is the guardian of the forest — fierce in protection of what it loves, electric in presence, and incapable of boredom or mediocrity.',
  Rabbit:  'Gracious, tactful, refined, and deeply intuitive. You create beauty and peace wherever you go. The Rabbit moves through life with elegance — avoiding unnecessary conflict while quietly achieving everything it sets out to do.',
  Dragon:  'Visionary, charismatic, and larger-than-life. You are the only mythical creature in the Chinese zodiac — born to stand out. Dragons carry an innate sense of destiny and the force to manifest visions that others call impossible.',
  Snake:   'Wise, intuitive, elegant, and intensely perceptive. You see beneath surfaces. The Snake is the zodiac\'s philosopher — processing the world through deep inner knowing rather than surface-level logic. Your insights arrive whole, like gifts.',
  Horse:   'Energetic, free-spirited, and passionately independent. You are most alive in motion — new experiences, new landscapes, new connections. The Horse embodies the joy of being fully in the present moment.',
  Goat:    'Creative, empathic, and deeply artistic. You bring beauty, gentleness, and healing into the world. The Goat is the zodiac\'s artist and healer — sensitive to everything, nourished by beauty, and powerfully kind.',
  Monkey:  'Clever, innovative, and electric with creative intelligence. You love solving puzzles and transforming ideas into action. Monkeys are the zodiac\'s inventors — quick, adaptable, and impossible to put in a box.',
  Rooster: 'Meticulous, honest, and brilliantly observant. You notice everything — and you are unafraid to speak what you see. The Rooster is the zodiac\'s truth-teller: precise, hardworking, and deeply committed to excellence.',
  Dog:     'Loyal, just, and deeply protective of those you love. You have an innate moral compass and will stand for what is right even alone. Dogs are the zodiac\'s guardians — reliable, faithful, and filled with the rare integrity the world needs more of.',
  Pig:     'Generous, sincere, and abundantly good-natured. You approach life with genuine joy and complete commitment. The Pig is the zodiac\'s benefactor — warm-hearted, fortunate, and capable of finding pleasure and meaning in every chapter.',
};

const ELEMENT_MEANINGS: Record<string, string> = {
  Wood:  'Growth, flexibility, and the creative force of spring. Wood people are visionary, optimistic, and driven by the desire to create and expand. They are the planters of seeds — always looking forward.',
  Fire:  'Passion, brilliance, and dynamic leadership. Fire people illuminate every room they enter. They lead through charisma and inspiration, and their enthusiasm is genuinely contagious.',
  Earth: 'Stability, reliability, and the deep wisdom of accumulated experience. Earth people are the foundations of their families and communities — trustworthy, practical, and profoundly grounding.',
  Metal: 'Precision, discipline, and the strength to cut through ambiguity. Metal people have clear values, strong wills, and an extraordinary capacity for focused effort. They finish what they start.',
  Water: 'Wisdom, depth, and the flowing intelligence of the unconscious. Water people are perceptive, adaptable, and carry profound inner knowing. They navigate complexity with an almost effortless ease.',
};

const ANIMAL_LUCKY_COLORS: Record<string, string> = {
  Rat: 'Blue, Gold, Green', Ox: 'White, Yellow, Green', Tiger: 'Blue, Grey, Orange',
  Rabbit: 'Red, Pink, Purple, Blue', Dragon: 'Gold, Silver, Grey', Snake: 'Black, Red, Yellow',
  Horse: 'Yellow, Green', Goat: 'Brown, Red, Purple', Monkey: 'White, Blue, Gold',
  Rooster: 'Gold, Brown, Yellow', Dog: 'Red, Green, Purple', Pig: 'Yellow, Grey, Brown',
};

const ANIMAL_LUCKY_NUMBERS: Record<string, string> = {
  Rat: '2, 3', Ox: '1, 4', Tiger: '1, 3, 4', Rabbit: '3, 4, 6',
  Dragon: '1, 6, 7', Snake: '2, 8, 9', Horse: '2, 3, 7', Goat: '2, 7',
  Monkey: '4, 9', Rooster: '5, 7, 8', Dog: '3, 4, 9', Pig: '2, 5, 8',
};

const ANIMAL_COMPATIBILITY: Record<string, string> = {
  Rat: 'Ox, Dragon, Monkey', Ox: 'Rat, Snake, Rooster', Tiger: 'Dragon, Horse, Pig',
  Rabbit: 'Goat, Monkey, Dog, Pig', Dragon: 'Rat, Tiger, Snake, Monkey', Snake: 'Ox, Rooster',
  Horse: 'Tiger, Goat, Rabbit', Goat: 'Rabbit, Horse, Pig', Monkey: 'Rat, Dragon',
  Rooster: 'Ox, Snake', Dog: 'Tiger, Rabbit, Horse', Pig: 'Tiger, Rabbit, Goat',
};

/**
 * Chinese Lunar New Year starts between Jan 20–Feb 20 depending on the year.
 * We use a simplified lookup for years 1900–2100 based on the Gregorian offset.
 * The Chinese year cycle: 1924 is the Rat year (cycle base).
 */
export function getChineseZodiac(year: number, month: number, day: number): {
  animal: string;
  element: string;
  yinYang: 'Yin' | 'Yang';
  heavenlyStem: string;
  earthlyBranch: string;
  luckyColors: string;
  luckyNumbers: string;
  compatibility: string;
  meaning: string;
  elementMeaning: string;
} {
  // Chinese New Year is approximately Feb 4–20; use Feb 4 as simple cutoff
  const chineseYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;

  // Cycle base: 1924 = Rat, Wood, Yang
  const offset = ((chineseYear - 1924) % 60 + 60) % 60;
  const animalIdx = offset % 12;
  const stemIdx = offset % 10;
  const branchIdx = offset % 12;
  // Element: each element governs 2 consecutive years
  const elementIdx = Math.floor(stemIdx / 2);
  // Yin/Yang: odd stems = Yin, even stems = Yang
  const yinYang: 'Yin' | 'Yang' = stemIdx % 2 === 0 ? 'Yang' : 'Yin';

  const animal = CHINESE_ANIMALS[animalIdx];
  const element = CHINESE_ELEMENTS[elementIdx];
  const heavenlyStem = HEAVENLY_STEMS[stemIdx];
  const earthlyBranch = EARTHLY_BRANCHES[branchIdx];

  return {
    animal,
    element,
    yinYang,
    heavenlyStem,
    earthlyBranch,
    luckyColors: ANIMAL_LUCKY_COLORS[animal],
    luckyNumbers: ANIMAL_LUCKY_NUMBERS[animal],
    compatibility: ANIMAL_COMPATIBILITY[animal],
    meaning: CHINESE_ANIMAL_MEANINGS[animal] || 'A unique cosmic energy.',
    elementMeaning: ELEMENT_MEANINGS[element] || 'A powerful elemental force.',
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
    Ketu: `A period of profound spiritual disruption and karmic reckoning. Ketu strips away the familiar — career stagnation, relationship detachment, a feeling of "what is the point?" are common. Past-life patterns surface painfully. You may lose interest in things that once excited you, feel isolated or misunderstood, and question your identity deeply. Health vulnerabilities around wounds, surgery, or mysterious ailments can arise. **However:** this is the most spiritually fertile period. Those who surrender to Ketu's lessons emerge with clarity, intuition, and psychic depth that no other planet gives. Siddhis (spiritual powers) are developed here. The key: don't resist the dissolution — let go and go within.`,
    Venus: `A period of love, pleasure, and material abundance — but also the dangers of excess and indulgence. Relationships intensify; new romances bloom and existing bonds deepen. Financial gains through art, beauty, or partnerships are likely. **However:** Venus dasha can also bring over-attachment, jealousy, financial overspending, and relationship drama. If Venus is afflicted in your chart, this period may bring heartbreak, unrequited love, or conflict with women. Health vulnerabilities around kidneys, reproductive organs, and sugar metabolism arise. **Opportunity:** Channel Venus energy into creative output, genuine love, and beauty that serves others rather than merely consuming it.`,
    Sun: `A period of authority, visibility, and ego confrontation. Career recognition, government dealings, and father-related themes dominate. Your willpower surges and leadership opportunities arrive. **However:** Sun dasha also brings ego clashes, conflict with authority figures, and health issues around the heart and eyes. Those with an afflicted Sun may face humiliation, political enemies, or a fall from grace. The father's health may be a concern. **Opportunity:** This is the time to step into your authentic leadership role — not through domination but through dharmic authority. The Sun asks: "Are you living your truth or just performing?"`,
    Moon: `A period of heightened emotional sensitivity, public life, and maternal themes. The mind becomes more intuitive and psychic. Travel, popularity, and public exposure increase. **However:** Moon dasha brings emotional volatility, anxiety, sleep disturbances, and mental health challenges. If the Moon is afflicted, depression, fear, or paranoia can emerge. Relationships with women (especially the mother) become complicated. Water-related health issues, digestive problems, and fluctuating energy are common. **Opportunity:** Moon dasha is ideal for deepening emotional intelligence, healing childhood wounds, and building genuine public connection. The Moon asks you to feel — not escape — your emotional truth.`,
    Mars: `A period of energy, courage, and assertive action — but also conflict, accidents, and inflammatory conditions. Property acquisition, sibling matters, and competitive endeavors come to the fore. **However:** Mars dasha is notorious for accidents, surgery, legal disputes, and relationship aggression. Temper flares lead to broken relationships. Manglik individuals experience this most intensely. Blood-related health issues, fevers, and injuries require caution — especially on roads and in physical confrontations. **Opportunity:** Mars energy, when channeled consciously, builds extraordinary physical and professional strength. Martial arts, athletics, surgery, real estate, and military pursuits all thrive. The key is redirecting aggression into disciplined action.`,
    Rahu: `A period of obsessive ambition, worldly hunger, and karmic acceleration — one of the most volatile dashas. Rahu gives sudden rises but also sudden falls. Foreign opportunities, technology, unconventional relationships, and fame arrive. **However:** Rahu dasha brings confusion, deception (self-deception and from others), addictions, fear, anxiety, and an insatiable hunger that nothing satisfies. Relationships are unstable; unexpected betrayals occur. Health challenges are difficult to diagnose. The mind races with desires that feel urgent but lead nowhere. **Opportunity:** Rahu dasha is where worldly mastery is forged. Those who maintain clarity of dharma while riding Rahu's intensity can achieve what no other period allows. Ground yourself in daily ritual and clear values.`,
    Jupiter: `A period of expansion, wisdom, and genuine good fortune — but also complacency and overextension. Children, education, legal matters, and spiritual guidance bring blessings. Wealth grows. Meaningful relationships deepen. **However:** Jupiter dasha can breed excess — weight gain, overconfidence, financial overextension, and self-righteousness. Those who take Jupiter's blessings for granted accumulate debts (material and karmic). Legal matters can also go wrong. **Opportunity:** Jupiter dasha is the period to invest in education, start meaningful ventures, deepen your spiritual practice, and give generously. The wealth and wisdom gained here, when shared, multiplies. The key: maintain humility and discipline even as doors open.`,
    Saturn: `A period of profound testing, restructuring, and slow but permanent transformation — the most demanding mahadasha. Saturn strips away what is false, artificial, and comfortable. Career delays, relationship pressures, health challenges, and a sense of existential heaviness are common. This is where your karma arrives with receipts. **However:** Saturn dasha is NOT punishment — it is purification. The foundations built during Saturn's long tenure are the most durable of any dasha. Career breakthroughs come late but are permanent. Relationships that survive Saturn are for life. Health patterns are reshaped for long-term resilience. **Opportunity:** Embrace discipline, hard work, and radical honesty. Those who commit to their dharma during Saturn dasha emerge as the most solid, respected, and wise individuals. Saturn rewards patience and punishes shortcuts.`,
    Mercury: `A period of intellectual sharpening, communication, trade, and education — but also anxiety, scattered focus, and nervous exhaustion. Writing, teaching, business, and technical skills all come alive. Social connections multiply. **However:** Mercury dasha brings overthinking, indecision, nervous system strain, skin issues, and communication misunderstandings. Those with an afflicted Mercury may face deception in business deals, exam failures, or reputation damage through wrong words. Respiratory and digestive sensitivity increases. **Opportunity:** Mercury dasha is ideal for learning new skills, launching communication businesses, writing, and building intellectual networks. The key is focus — Mercury's gift is wasted on scattered pursuits. Choose one direction and go deep.`,
  };
  return effects[planet] || 'A period of unique karmic experiences that challenge and transform the soul in ways specific to this planetary energy.';
}

// ─── Report Generators (using correct PlanetPosition/DashaPeriod interfaces) ──

// ─── Detailed Nakshatra Descriptions (for expanded personality) ──────

const NAKSHATRA_DETAILED: Record<string, string> = {
  'Ashwini': 'Ashwini is the first nakshatra, symbolized by a horse\'s head. Ruled by the Ashwini Kumaras (divine physicians), it bestows speed, healing ability, and a pioneering spirit. People born under Ashwini are quick in thought and action, naturally inclined towards medicine, horses, and new beginnings. They possess youthful energy throughout life and are drawn to helping others recover from illness or difficulty. The Ashwini Kumaras represent the twin forces of dawn — you are a bringer of light into dark situations. Per Brihat Parashara Hora Shastra, Ashwini natives have a beautiful countenance, fondness for ornaments, and skillful hands.',
  'Bharani': 'Bharani is ruled by Yama, the god of death and dharma. This is a powerful nakshatra of transformation, representing the womb of creation. Bharani natives carry an intensity that others feel immediately. They are passionate about their values, fiercely protective of those they love, and unafraid of life\'s deeper mysteries. The symbol is the yoni (female reproductive organ), representing creative power and the ability to bear great burdens. Bharani people go through many transformative cycles in life, each one making them stronger. Per Saravali by Kalyana Varma, they are truthful, resolute, and free from disease.',
  'Krittika': 'Krittika spans Aries and Taurus, ruled by Agni (fire god). The symbol is a razor or flame. Krittika natives are sharp, purifying, and transformative. They cut through illusion and falsehood with the precision of a blade. This nakshatra bestows courage in the face of criticism, a strong digestive fire (both physical and intellectual), and the ability to nourish others even while maintaining strict standards. In Vedic mythology, the six Krittika stars (Pleiades) nursed baby Kartikeya (Murugan). Per ancient texts, Krittika natives are brilliant eaters, famous, and fond of others\' spouses (this is a karmic pattern to be aware of and overcome).',
  'Rohini': 'Rohini, ruled by Brahma the creator, is considered the most creative and fertile nakshatra. Symbolized by an ox-cart or a growing plant, it bestows beauty, artistic talent, and material abundance. The Moon is exalted in Rohini, making these natives emotionally rich and magnetically attractive. They have a natural talent for agriculture, arts, fashion, and anything that grows or creates beauty. Krishna was born under Rohini, embodying its charm and divine playfulness. Per Brihat Jataka, Rohini natives are truthful, pure, sweet-spoken, and have a steady mind.',
  'Mrigashira': 'Mrigashira means "deer\'s head," symbolizing the eternal search. Ruled by Soma (the Moon), this nakshatra bestows curiosity, gentleness, and a perpetual quest for knowledge or beauty. Mrigashira natives are restless seekers — they search for the perfect partner, the perfect home, the perfect truth. This searching nature makes them excellent researchers, travelers, and philosophers. In mythology, Mrigashira represents the head of the deer that Brahma took the form of while chasing his daughter Rohini. The lesson is about desire and the wisdom to channel it properly.',
  'Ardra': 'Ardra is ruled by Rudra, the fierce form of Shiva. The symbol is a teardrop or diamond. This is one of the most transformative nakshatras — it brings destruction followed by renewal, like a thunderstorm that clears the air. Ardra natives have penetrating intellects, are excellent at research and technology, and often go through major life upheavals that reshape them entirely. Albert Einstein was born under Ardra, exemplifying its explosive intellectual power. Per classical texts, Ardra natives are ungrateful, wicked, and proud — but these are karmic tendencies to be transcended through self-awareness.',
  'Punarvasu': 'Punarvasu means "return of the light." Ruled by Aditi, the mother of all gods, this nakshatra bestows optimism, wisdom, and the ability to bounce back from any adversity. Punarvasu natives are philosophical, generous, and always find their way home — whether literally or metaphorically. Lord Rama was born under Punarvasu, embodying dharma\'s ultimate return. The symbol is a quiver of arrows, representing both preparedness and the ability to aim true. Per Parashara, Punarvasu natives are self-controlled, happy, good-natured, and dull (the "dullness" is actually meditative calm).',
  'Pushya': 'Pushya is considered the most auspicious nakshatra for spiritual growth and nourishment. Ruled by Brihaspati (Jupiter), it bestows wisdom, generosity, and the ability to nurture others\' growth. The symbol is a cow\'s udder or a lotus, representing abundant nourishment. Pushya natives make excellent teachers, counselors, parents, and spiritual guides. They have an innate understanding of dharma and naturally gravitate towards service. Per Saravali, Pushya natives are liked by all, learned, wealthy, and inclined to dharma.',
  'Ashlesha': 'Ashlesha is ruled by the Nagas (serpent deities). The symbol is a coiled serpent, representing kundalini energy, hypnotic power, and deep psychological insight. Ashlesha natives possess penetrating intuition, can read others\' motives instantly, and have a natural talent for psychology, research, and occult sciences. They are fiercely private and protective. The serpent energy can manifest as either poison or medicine — the choice defines their life path. Per classical texts, Ashlesha natives are cruel in speech, ungrateful, and eat others\' food — these are shadow qualities to be consciously transformed.',
  'Magha': 'Magha means "the great one." Ruled by the Pitris (ancestral spirits), this nakshatra connects you directly to your lineage and royal heritage. Magha natives carry themselves with natural authority and dignity. They are drawn to positions of power, respect tradition, and have a strong connection to their ancestors. The symbol is a throne room or palanquin. Per Brihat Parashara, Magha natives are very rich, have many servants, enjoy constant pleasures, worship gods and ancestors, and are very industrious.',
  'Purva Phalguni': 'Purva Phalguni is ruled by Bhaga, the god of marital bliss and fortune. The symbol is a swinging hammock or the front legs of a bed, representing rest, luxury, and creative enjoyment. These natives are born to create, perform, entertain, and enjoy life\'s pleasures. They have magnetic charisma and attract others naturally. Per classical texts, they are generous, sweet-spoken, and wandering — always seeking new experiences and pleasures.',
  'Uttara Phalguni': 'Uttara Phalguni is ruled by Aryaman, the god of patronage and contracts. The symbol is the back legs of a bed, representing commitment and the fruits of partnership. While Purva Phalguni starts the party, Uttara Phalguni brings it to fruition through steady commitment. These natives are excellent in partnerships, business contracts, and marriage. They are known for their reliability and ability to build lasting structures.',
  'Hasta': 'Hasta means "the hand." Ruled by Savitar (the vivifying Sun), this nakshatra bestows incredible manual skill, craftsmanship, and the ability to manifest ideas into reality. Hasta natives are skilled with their hands — surgeons, artists, magicians, healers, and craftspeople. They are resourceful, witty, and can turn any situation to their advantage. The symbol is an open palm, representing both giving and receiving. Per Parashara, Hasta natives are industrious, bold, merciless to enemies, and thieves — the "thieving" quality is actually their ability to acquire skills rapidly.',
  'Chitra': 'Chitra means "the brilliant one." Ruled by Tvashtar, the celestial architect, this nakshatra bestows creative brilliance, artistic vision, and the ability to design and build beautiful things. Chitra natives are natural architects — whether of buildings, businesses, or ideas. They have an eye for beauty and proportion. The Taj Mahal\'s commissioner Shah Jahan and Michelangelo both exemplify Chitra energy. Per classical texts, Chitra natives wear colorful garments and garlands, have beautiful eyes and limbs.',
  'Swati': 'Swati means "the independent one" or "the sword." Ruled by Vayu (the wind god), this nakshatra bestows independence, adaptability, and the ability to thrive in any environment. Swati natives are like coral — they bend with the currents but are incredibly strong. They are diplomatic, business-savvy, and value personal freedom above all. The symbol is a young plant blown by the wind, representing flexibility and growth despite adversity. Mahatma Gandhi\'s birth in Swati demonstrates its independent, justice-seeking nature.',
  'Vishakha': 'Vishakha means "forked branch" or "triumphal arch." Ruled jointly by Indra and Agni, this nakshatra bestows single-minded determination, ambition, and the energy to achieve seemingly impossible goals. Vishakha natives set their sights on a target and pursue it relentlessly — they are natural leaders and conquerors. The symbol is a triumphal gateway or a potter\'s wheel, representing both achievement and the shaping of destiny. Per Saravali, Vishakha natives are jealous, greedy, and of bright appearance — the jealousy and greed are fuel for their extraordinary ambition.',
  'Anuradha': 'Anuradha means "following Radha" or "subsequent success." Ruled by Mitra, the god of friendship and alliances, this nakshatra bestows the ability to build deep, lasting relationships and achieve success through collaboration. Anuradha natives are loyal, emotionally intelligent, and excellent organizers. They often succeed in foreign lands. The symbol is a lotus, representing the ability to bloom beautifully even in muddy circumstances. Per classical texts, Anuradha natives wander in foreign countries, cannot bear hunger, and are fond of their friends.',
  'Jyeshtha': 'Jyeshtha means "the eldest" or "the chief." Ruled by Indra, king of the gods, this nakshatra bestows authority, protective instinct, and the weight of responsibility. Jyeshtha natives are natural leaders who feel compelled to protect others. They carry heavy burdens gracefully and often rise to positions of supreme authority. The symbol is a circular amulet or earring, representing protection and rank. However, Jyeshtha natives face the loneliness that comes with being at the top. Per Parashara, they are contented, virtuous, but irascible.',
  'Moola': 'Moola means "the root." Ruled by Nirriti, the goddess of dissolution, this nakshatra goes to the very foundation of things. Moola natives are natural investigators — they dig to the root of every problem, question, and mystery. This can make them scientists, philosophers, or spiritual seekers of the highest order. The symbol is a bundle of roots or a lion\'s tail. Destruction of the surface to reveal the truth beneath is Moola\'s function. Per classical texts, Moola natives are proud, wealthy, happy, firm-minded, and luxurious.',
  'Purva Ashadha': 'Purva Ashadha means "the invincible" or "early victory." Ruled by Apas (the water deity), this nakshatra bestows invincibility through purification and renewal. These natives are optimistic, persuasive, and naturally victorious. They have the ability to inspire others and spread their influence far and wide, like water that finds its way everywhere. The symbol is a fan or winnowing basket, representing the separation of truth from falsehood.',
  'Uttara Ashadha': 'Uttara Ashadha means "later victory" — the final, lasting triumph. Ruled by the Vishvedevas (universal gods), this nakshatra bestows leadership through universal principles, integrity, and ultimate perseverance. These natives may start slowly, but their victories are permanent and unchallengeable. The symbol is an elephant\'s tusk, representing unstoppable strength and penetrating wisdom. George Washington embodied this energy — slow to rise but impossible to defeat.',
  'Shravana': 'Shravana means "hearing" or "learning." Ruled by Vishnu, the preserver, this nakshatra bestows the supreme power of listening, learning, and connecting. Shravana natives absorb knowledge through all channels and have an extraordinary memory. They are natural teachers who preserve and transmit wisdom. The symbol is three footprints or an ear, representing Vishnu\'s three steps across the universe and the power of sacred listening.',
  'Dhanishta': 'Dhanishta means "the most famous" or "the richest." Ruled by the Vasus (eight elemental gods), this nakshatra bestows wealth, musical talent, and fame. Dhanishta natives are naturally rhythmic — whether in music, dance, speech, or business timing. They accumulate wealth through talent and timing. The symbol is a drum (mridanga), representing cosmic rhythm and the beat of creation.',
  'Shatabhisha': 'Shatabhisha means "hundred physicians." Ruled by Varuna, the cosmic ocean god, this nakshatra bestows healing powers, secretive nature, and the ability to penetrate veils of illusion. Shatabhisha natives are natural healers who work with hidden energies — electricity, frequencies, alternative medicine, and cosmic waters. The symbol is an empty circle, representing the vast ocean of consciousness. Nikola Tesla exemplified Shatabhisha\'s electrical healing genius.',
  'Purva Bhadrapada': 'Purva Bhadrapada is ruled by Ajaikapada, the one-footed serpent of the cosmic fire. The symbol is a two-faced man or a funeral cot, representing the transformation between death and rebirth. These natives live on the edge between worlds — the material and the spiritual. They possess intense transformative energy that can either uplift or destroy. Per classical texts, they are sorrowful, under the control of their spouses, wealthy, and clever.',
  'Uttara Bhadrapada': 'Uttara Bhadrapada is ruled by Ahir Budhnya, the serpent of the cosmic depths. The symbol is the back legs of a funeral cot or twins, representing the completion of the cosmic journey. These natives are deeply wise, compassionate, and detached from worldly glamour. They possess oceanic depth of understanding. Rumi exemplified this nakshatra\'s unfathomable spiritual wisdom. Per Parashara, they are eloquent, happy, blessed with children, and conquer enemies.',
  'Revati': 'Revati is the final nakshatra — the omega point of the zodiac. Ruled by Pushan, the shepherd of souls, it bestows compassion, protection of the helpless, and safe passage through transitions. Revati natives are gentle souls who guide others to their destination. They are natural caretakers, musicians, and spiritual guides. The symbol is a fish or a pair of fish, representing the infinite ocean of consciousness where all journeys end. Per classical texts, Revati natives are clean in body, heroic, wealthy, and loved.',
};

// ─── Guna descriptions ──────

const GUNA_DESCRIPTIONS: Record<string, string> = {
  Sattva: 'Sattva Guna — The quality of purity, truth, and spiritual luminosity. Those with strong Sattva are naturally drawn to meditation, study, compassion, vegetarian diet, and the pursuit of wisdom. They maintain balance even in difficulty and see the divine in all beings. Classical texts recommend strengthening Sattva through regular worship, service to elders, truthful speech, and early morning practices.',
  Rajas: 'Rajas Guna — The quality of passion, action, and worldly engagement. Those with strong Rajas are ambitious, driven, and constantly in motion. They build empires, create art, pursue relationships with intensity, and are the movers of civilization. The challenge is to channel Rajasic energy towards dharma rather than mere accumulation. Balance Rajas with periods of rest and reflection.',
  Tamas: 'Tamas Guna — The quality of inertia, darkness, and material attachment. Those with strong Tamas may struggle with laziness, confusion, or attachment to comfort. However, Tamas also provides stability, groundedness, and the ability to endure. The path for Tamasic individuals is to gradually introduce Rajasic activity and Sattvic practices to transform heavy energy into light.',
};

function getNakshatraGuna(nakshatraIdx: number): string {
  const sattvicNakshatras = [0, 4, 6, 7, 12, 14, 16, 21, 26]; // Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Revati
  const rajasicNakshatras = [1, 3, 5, 10, 11, 19, 20, 24, 25]; // Bharani, Rohini, Ardra, P.Phalguni, U.Phalguni, P.Ashadha, U.Ashadha, P.Bhadra, U.Bhadra
  if (sattvicNakshatras.includes(nakshatraIdx)) return 'Sattva';
  if (rajasicNakshatras.includes(nakshatraIdx)) return 'Rajas';
  return 'Tamas';
}

function generatePersonalityReport(
  lagnaRashi: number, lagnaSign: string, moonRashi: number, moonSign: string,
  moonNakshatra: number, moonNakshatraName: string, moonNakshatraPada: number,
  gana: string, yoni: string, atmakaraka: { planet: string; degree: number; meaning: string }
): string {
  const lagnaLord = RASHI_LORDS[lagnaRashi];
  const moonLord = RASHI_LORDS[moonRashi];
  const deity = NAKSHATRA_DEITIES[moonNakshatra] || 'the divine';
  const ruler = NAKSHATRA_RULERS[moonNakshatra] || 'a celestial ruler';
  const guna = getNakshatraGuna(moonNakshatra);
  const nakshatraDetail = NAKSHATRA_DETAILED[moonNakshatraName] || '';

  let r = '## Your Core Personality — A Multi-Traditional Analysis\n\n';

  // Vedic disclaimer
  r += '*The following analysis draws from Brihat Parashara Hora Shastra, Saravali by Kalyana Varma, Brihat Jataka by Varahamihira, and Hellenistic astrological traditions. For ENTERTAINMENT and INFORMATION purposes only. Consult a qualified astrologer for personal guidance.*\n\n';

  // Lagna Analysis
  r += '### Ascendant (Lagna) — ' + lagnaSign + '\n\n';
  r += getRashiTraitText(lagnaRashi) + '\n\n';
  r += 'Your Ascendant (Lagna) is the zodiac sign that was rising on the eastern horizon at your exact moment of birth at your specific birth location. In Vedic astrology, the Lagna is considered the most important factor in the chart — it shapes your physical body, your natural temperament, how others perceive you, and your approach to life itself. The Lagna is the lens through which all planetary energies filter before manifesting in your life.\n\n';
  r += 'Your Lagna lord is **' + lagnaLord + '**, which is the ruling planet of your Ascendant sign. The placement and condition of ' + lagnaLord + ' in your chart determines the overall direction and vitality of your life. A well-placed Lagna lord brings health, success, and clear purpose; a challenged Lagna lord indicates areas requiring conscious effort.\n\n';

  // Moon Sign
  r += '### Moon Sign (Chandra Rashi) — ' + moonSign + '\n\n';
  r += getRashiTraitText(moonRashi) + '\n\n';
  r += 'In Vedic astrology, the Moon sign is equally important to the Lagna — it reveals your emotional nature, subconscious patterns, mental constitution, and relationship with your mother. The Moon represents the mind (manas) in Jyotish, and its condition determines your emotional resilience, intuition, and capacity for contentment. Your Moon lord is **' + moonLord + '**, governing the flow of your emotional life.\n\n';

  // Nakshatra
  r += '### Birth Nakshatra — ' + moonNakshatraName + ' (Pada ' + moonNakshatraPada + ')\n\n';
  r += nakshatraDetail + '\n\n';
  r += 'Your nakshatra ruler is **' + ruler + '**, and the presiding deity is **' + deity + '**. The nakshatra pada (quarter) further refines your personality — Pada ' + moonNakshatraPada + ' of ' + moonNakshatraName + ' places you in a specific navamsha (D-9 chart) that colors your married life and dharmic path.\n\n';

  // Gana
  r += '### Gana (Cosmic Temperament) — ' + gana + ' Gana\n\n';
  if (gana === 'Deva') {
    r += 'You belong to the **Deva Gana** (divine temperament). Deva Gana individuals are naturally gentle, compassionate, spiritual, and drawn to higher pursuits. You have an innate sense of dharma and tend to resolve conflicts through diplomacy rather than force. In relationships, you are most compatible with other Deva Gana or Manushya Gana individuals. The Deva Gana temperament is associated with Sattva — purity of thought and action. You naturally gravitate towards temples, sacred spaces, and uplifting company.\n\n';
  } else if (gana === 'Manushya') {
    r += 'You belong to the **Manushya Gana** (human temperament). Manushya Gana individuals are balanced, practical, and socially adept. You navigate the material and spiritual worlds with equal competence. In relationships, you are adaptable and can connect with all three Gana types. The Manushya Gana temperament is associated with Rajas — the energy of action, creation, and worldly engagement. You are the backbone of society — the builders, the workers, the connectors.\n\n';
  } else {
    r += 'You belong to the **Rakshasa Gana** (fierce temperament). Rakshasa Gana individuals are powerful, independent, and fiercely protective of those they love. Do not mistake this classification as negative — in Vedic cosmology, Rakshasa energy is the raw power of transformation. You challenge conventions, break barriers, and refuse to submit to injustice. In relationships, you need a partner who can match your intensity. The Rakshasa Gana temperament is associated with Tamas — the grounding force that provides stability and the courage to face darkness directly.\n\n';
  }

  // Yoni
  r += '### Yoni (Instinctual Animal Nature) — ' + yoni + '\n\n';
  r += 'The Yoni system assigns one of 14 animal archetypes to each nakshatra, representing your deepest instinctual nature and physical/intimate compatibility patterns. Your Yoni is the **' + yoni + '**, which governs how you relate to others at the most primal level. This is particularly important in marriage compatibility (Ashta Koota matching). Compatible Yoni pairs create harmony; opposing Yoni pairs require conscious effort to bridge natural differences.\n\n';

  // Guna
  r += '### Guna (Quality of Consciousness) — ' + guna + '\n\n';
  r += (GUNA_DESCRIPTIONS[guna] || '') + '\n\n';

  // Atmakaraka
  r += '### Atmakaraka (Soul Indicator) — ' + atmakaraka.planet + '\n\n';
  r += 'The Atmakaraka is the planet with the highest degree in any sign in your chart — it is your soul\'s primary desire in this incarnation. Your Atmakaraka is **' + atmakaraka.planet + '** at ' + atmakaraka.degree.toFixed(2) + '° within its sign.\n\n';
  r += atmakaraka.meaning + '\n\n';
  r += 'In Jaimini Sutras, the Atmakaraka is the king of the chart — its placement in the Navamsha (D-9) reveals the Karakamsha, which indicates the soul\'s deepest spiritual direction. Understanding your Atmakaraka helps you align your worldly actions with your soul\'s purpose.\n\n';

  // Western Integration
  r += '### Western Psychological Profile\n\n';
  r += 'From the Western astrological perspective, your chart reveals a personality shaped by multiple archetypes. The Ascendant sign gives your social persona, the Sun sign your core identity and will, and the Moon sign your emotional intelligence and instincts. Unlike Vedic astrology which uses the sidereal zodiac (fixed stars), Western astrology uses the tropical zodiac (seasons), creating a complementary rather than contradictory picture of your personality. Both traditions, when understood correctly, illuminate different facets of the same truth.\n\n';

  return r;
}

function generateHouseAnalysis(planets: PlanetPosition[], lagnaRashi: number): string {
  let r = '## The Twelve Houses of Your Chart (Bhava Phala)\n\n';
  r += '*Per Brihat Parashara Hora Shastra, Phala Deepika by Mantreshwara, and Saravali by Kalyana Varma. This is the foundation of predictive Vedic astrology — each house governs specific life domains. For ENTERTAINMENT and INFORMATION only.*\n\n';

  const houseDescriptions: string[] = [
    'The 1st House (Tanu Bhava) is the house of Self — your body, physical constitution, personality, head, brain, and general vitality. It is the foundation upon which the entire chart rests. The strength of this house and its lord determines your overall life force and the ability to actualize the promises of other houses. In Hellenistic (Greek) astrology, this was called "Horoskopos" — the life marker. In Egyptian tradition, this house corresponds to the rising decan that greeted you at birth.',
    'The 2nd House (Dhana Bhava) is the house of Wealth — accumulated money, family heritage, speech quality, right eye, food habits, and face. This is not just material wealth but also the richness of your voice, your ability to nourish others through words, and the values instilled by your family. In Middle Eastern astrology (Arabic Parts), the Part of Fortune often connects strongly to this house. The 2nd house also governs early childhood education and your relationship with food.',
    'The 3rd House (Sahaja Bhava) is the house of Valor — courage, younger siblings, short journeys, communication skills, arms, shoulders, and willpower. This house determines your ability to take initiative, your relationship with brothers and sisters, and your skill in writing, media, and self-expression. In Hellenistic astrology, this house was associated with the Moon goddess and travel. A strong 3rd house gives entrepreneurial courage.',
    'The 4th House (Sukha Bhava) is the house of Happiness — mother, home, property, vehicles, land, chest/heart area, emotional peace, and inner contentment. This is one of the four Kendra (angular) houses, making it extremely powerful. It represents your roots, your homeland, your private sanctuary, and your emotional foundation. In Vastu Shastra (the Vedic architecture science), the 4th house governs the energy of your dwelling place. Egyptian astrology linked this house to the Nadir — the hidden foundation of the soul.',
    'The 5th House (Putra Bhava) is the house of Intelligence — children, creative intelligence, education, romance, stomach, past-life merit (Purva Punya), and speculation. This is a trikona (trine) house, one of the most auspicious positions in the chart. The 5th house reveals your relationship with your children, your creative genius, and the spiritual merit you carry from previous incarnations. In Western astrology, this is the house of Leo — self-expression and joy.',
    'The 6th House (Ripu Bhava) is the house of Enemies — diseases, debts, daily service, maternal uncle, intestines, and obstacles. While seemingly negative, a strong 6th house gives the ability to overcome all challenges. This is a Dusthana (malefic) house, but planets here can also give tremendous competitive advantage. The 6th house governs your immune system, your daily work routine, and your relationship with employees/servants. In Arabic astrology, this house was linked to "bad fortune" but also to the healing arts.',
    'The 7th House (Kalatra Bhava) is the house of Partnership — marriage, spouse, business partnerships, lower abdomen, and public dealings. Directly opposite the 1st house, the 7th represents everything that complements you — your mirror in another person. The condition of this house, its lord, and planets within it determine the quality, timing, and nature of your married life. In all astrological traditions — Vedic, Western, Egyptian, and Mesopotamian — the 7th house governs the "other" who completes you.',
    'The 8th House (Ayu Bhava) is the house of Transformation — lifespan, sudden events, inheritance, in-laws\' wealth, reproductive organs, occult knowledge, and hidden things. This is the most mysterious house in astrology, governing everything that lies beneath the surface. A strong 8th house gives longevity, inheritance, and deep occult knowledge. A troubled 8th house brings sudden upheavals. In Egyptian mystery schools, the 8th house was linked to the underworld journey of Osiris — death and resurrection.',
    'The 9th House (Dharma Bhava) is the house of Fortune — father, guru, religion, long-distance travel, higher education, thighs, hips, and luck. This is the most auspicious trikona house, representing dharma (righteous path), bhagya (fortune), and the grace of the divine. The 9th house governs your relationship with your father, your guru/teacher, and your philosophical/religious orientation. In all traditions, this house represents the connection between the individual and the cosmic order.',
    'The 10th House (Karma Bhava) is the house of Action — profession, fame, government, public reputation, knees, and worldly authority. This is the highest point of the chart (Midheaven in Western astrology), representing the pinnacle of your worldly achievement. The 10th house determines your career, your public image, and your relationship with authority. In Mesopotamian astrology, the 10th house was linked to the visible heavens — what the world sees of you. Saturn (Shani) naturally rules this house\'s themes.',
    'The 11th House (Labha Bhava) is the house of Gains — income, elder siblings, friends, desires fulfilled, ankles/calves, and social networks. This is a house of abundance and wish fulfillment. Strong planets here bring wealth, influential friends, and the realization of your deepest ambitions. The 11th house governs your relationship with large groups, organizations, and your ability to earn from your profession. In modern astrology, this house also governs technology, innovation, and collective movements.',
    'The 12th House (Vyaya Bhava) is the house of Liberation — expenses, foreign travel/residence, hospitals, spiritual liberation (Moksha), feet, isolation, sleep, and the subconscious. This is the final house of the zodiac, representing the end of the material journey and the beginning of spiritual transcendence. A strong 12th house can give foreign success, deep meditation ability, and ultimate liberation. In Buddhist astrology, this house represents the dissolution of ego. In Sufi tradition, it represents fana (annihilation of the self in the divine).',
  ];

  for (let h = 1; h <= 12; h++) {
    const houseName = HOUSE_NAMES[h - 1] || ('House ' + h);
    const houseRashi = (lagnaRashi + h - 1) % 12;
    const houseSign = VEDIC_RASHIS[houseRashi];
    const houseLord = RASHI_LORDS[houseRashi];
    r += '### ' + h + '. ' + houseName + '\n';
    r += '**Sign:** ' + houseSign + ' | **Lord:** ' + houseLord + '\n\n';
    r += houseDescriptions[h - 1] + '\n\n';
    const planetsInHouse = planets.filter(p => p.house === h);
    if (planetsInHouse.length === 0) {
      r += 'No planets occupy this house in your chart. Its effects are determined by the placement and condition of its lord (**' + houseLord + '**) and any aspects it receives from other planets.\n\n';
    } else {
      for (const p of planetsInHouse) {
        r += '**' + p.name + '** in ' + p.rashi + ' (' + p.siderealLongitude.toFixed(1) + '°)';
        if (p.retrograde) r += ' ℞ (Retrograde — internalized energy, past-life karmic connection)';
        r += '\n';
        r += getPlanetInHouseEffect(p.name, h) + '\n\n';
      }
    }
  }
  return r;
}

function generateLifeTimeline(birthYear: number, dashaTimeline: DashaPeriod[]): string {
  let r = '## Your Life Timeline — Decade by Decade with Dasha Correlation\n\n';
  r += '*This timeline correlates your Vimshottari Dasha periods with major life stages. Saturn returns (~29, ~59), Jupiter returns (~12, ~24, ~36, ~48, ~60), and Rahu returns (~18, ~36, ~54) are universal astrological milestones. For ENTERTAINMENT and INFORMATION only.*\n\n';

  const decades = [
    { label: 'Childhood (Ages 0-10)', start: birthYear, end: birthYear + 10, ageStart: 0, ageEnd: 10,
      description: 'The formative years when your Lagna sign\'s energy first manifests — physical body development, early personality traits emerge, relationship with parents (especially mother — 4th house), and the seeds of your life path are planted. In Vedic tradition, the Vidyarambha (beginning of education) occurs during this period.',
      milestones: 'Jupiter\'s first return at age ~12 begins the next phase of intellectual awakening.' },
    { label: 'Youth & Education (Ages 10-20)', start: birthYear + 10, end: birthYear + 20, ageStart: 10, ageEnd: 20,
      description: 'The awakening of intelligence (5th house) and formation of identity. Education, first friendships, discovery of talents, and early encounters with the wider world. This period is strongly influenced by the 5th house (education, intelligence) and 3rd house (courage, communication).',
      milestones: 'Rahu\'s first return at age ~18 brings karmic intensity — major life decisions about education and career direction. Jupiter return at ~12 opens intellectual horizons.' },
    { label: 'Young Adult (Ages 20-30)', start: birthYear + 20, end: birthYear + 30, ageStart: 20, ageEnd: 30,
      description: 'Career launch (10th house activation), first serious relationships (7th house), and the building of an independent life. This is the most dynamic decade, when the person establishes their position in the world.',
      milestones: '**Saturn Return at age ~29-30** is the most significant transit — a fundamental restructuring of life. Saturn demands maturity, responsibility, and alignment with your true path. Those who resist Saturn\'s lessons face external crises; those who embrace them emerge with unshakeable foundations. Jupiter return at ~24 brings expansion opportunities.' },
    { label: 'Establishment (Ages 30-40)', start: birthYear + 30, end: birthYear + 40, ageStart: 30, ageEnd: 40,
      description: 'Post-Saturn return consolidation — marriage, family building, career advancement, and deepening of professional expertise. The 7th house (marriage), 5th house (children), and 10th house (career peak) are most active.',
      milestones: '**Rahu return at age ~36** brings another karmic shift — identity questioning, potential for major life changes, and a push toward your soul\'s true purpose. Jupiter return at ~36 simultaneously expands possibilities.' },
    { label: 'Maturity (Ages 40-50)', start: birthYear + 40, end: birthYear + 50, ageStart: 40, ageEnd: 50,
      description: 'Peak professional years — leadership, authority, and the harvest of decades of effort. The 11th house (fulfillment of desires) becomes prominent. Health awareness increases (6th house). Spiritual awakening may begin (9th house).',
      milestones: 'Jupiter return at ~48 brings philosophical expansion and a preview of life\'s deeper purpose. The midlife period often triggers a re-evaluation of priorities.' },
    { label: 'Wisdom (Ages 50-60)', start: birthYear + 50, end: birthYear + 60, ageStart: 50, ageEnd: 60,
      description: 'The transition from worldly achievement to spiritual depth. The 9th house (dharma) and 12th house (liberation) gain prominence. Many experience a natural turning inward — from acquisition to contribution, from building to legacy.',
      milestones: '**Saturn\'s 2nd return at age ~58-60** is the great wisdom transit — a final restructuring that prepares you for the elder years. Rahu return at ~54 brings one more karmic recalibration.' },
    { label: 'Elder Wisdom (Ages 60-70)', start: birthYear + 60, end: birthYear + 70, ageStart: 60, ageEnd: 70,
      description: 'The sage years — accumulation of wisdom, transmission of knowledge to younger generations, grandchildren, spiritual deepening, and the gradual release of worldly attachments. The 9th house (guru) and 5th house (grandchildren) are active.',
      milestones: 'Jupiter return at ~60 brings benevolence and philosophical peace. This is the Vanaprastha stage in Vedic tradition — gradual withdrawal from worldly duties.' },
    { label: 'Transcendence (Ages 70-80+)', start: birthYear + 70, end: birthYear + 80, ageStart: 70, ageEnd: 80,
      description: 'The final chapter — spiritual liberation, legacy, and preparation for the soul\'s next journey. The 12th house (Moksha) becomes the dominant influence. This is the Sannyasa stage — complete spiritual dedication. The life story comes full circle.',
      milestones: 'Each day is a gift. The accumulated karma of a lifetime ripens into wisdom that transcends the chart itself.' },
  ];

  for (const decade of decades) {
    r += '### ' + decade.label + ' (' + decade.start + '-' + decade.end + ')\n\n';
    r += decade.description + '\n\n';
    r += '**Key Milestone:** ' + decade.milestones + '\n\n';

    const relevant = dashaTimeline.filter(d =>
      d.startYear < decade.end && d.endYear > decade.start
    );
    if (relevant.length > 0) {
      r += '**Active Mahadasha Periods:**\n\n';
      for (const d of relevant) {
        const startInDecade = Math.max(d.startYear, decade.start);
        const endInDecade = Math.min(d.endYear, decade.end);
        r += '**' + d.planet + ' Mahadasha** (~' + startInDecade + ' to ~' + endInDecade + '): ';
        r += getDashaEffects(d.planet) + '\n\n';
      }
    }
  }

  r += '### Understanding the Dasha System\n\n';
  r += 'The Vimshottari Dasha is a 120-year planetary period system unique to Vedic astrology. Each planet rules a specific number of years, and the sequence begins from the ruler of your birth nakshatra. Within each Mahadasha (major period), there are Antardashas (sub-periods) that bring more nuanced influences. The key is not to fear challenging dashas (Saturn, Rahu) but to understand their purpose — they are the cosmic curriculum designed for your soul\'s growth.\n\n';

  return r;
}

function generateLoveReport(
  planets: PlanetPosition[], lagnaRashi: number, manglik: ManglikStatus, maritalStatus: string
): string {
  let r = '## Love, Marriage & Relationships — A Deep Dive\n\n';
  r += '*Analysis based on classical Vedic texts (Brihat Parashara, Phala Deepika), Western psychology of relationships, and ancient compatibility systems. For ENTERTAINMENT and INFORMATION only. Consult a professional astrologer for personal guidance.*\n\n';

  const seventhRashi = (lagnaRashi + 6) % 12;
  const seventhSign = VEDIC_RASHIS[seventhRashi];
  const seventhLord = RASHI_LORDS[seventhRashi];
  const fifthRashi = (lagnaRashi + 4) % 12;
  const eighthRashi = (lagnaRashi + 7) % 12;

  // 7th House Analysis
  r += '### The 7th House — Your Partnership Blueprint\n\n';
  r += 'Your 7th house falls in **' + seventhSign + '**, ruled by **' + seventhLord + '**.\n\n';

  const signPartnerTraits: Record<number, string> = {
    0: 'a partner who is independent, assertive, athletic, and pioneering. They bring fiery energy and initiative into your relationship. They may be in military, sports, engineering, or entrepreneurship.',
    1: 'a partner who values stability, beauty, comfort, and sensuality. They bring groundedness and financial wisdom. They may be in arts, banking, agriculture, or luxury goods.',
    2: 'a partner who is intellectually stimulating, communicative, and versatile. Conversations never get boring. They may be in media, writing, trade, or technology.',
    3: 'a partner who is nurturing, emotionally intelligent, and deeply attached to home and family. They bring emotional security. They may be in hospitality, nursing, real estate, or food industry.',
    4: 'a partner who is charismatic, confident, generous, and wants to be admired. They bring warmth and creative energy. They may be in entertainment, leadership, politics, or the arts.',
    5: 'a partner who is analytical, health-conscious, detail-oriented, and service-minded. They bring order and practical support. They may be in healthcare, accounting, editing, or wellness.',
    6: 'a partner who values harmony, aesthetics, justice, and social grace. They bring balance and diplomacy. They may be in law, design, diplomacy, or beauty industries.',
    7: 'a partner who is intense, transformative, secretive, and deeply passionate. They bring depth and emotional honesty. They may be in research, psychology, medicine, or occult sciences.',
    8: 'a partner who is philosophical, adventurous, optimistic, and loves freedom. They bring expansion and higher learning. They may be in education, travel, publishing, or religion.',
    9: 'a partner who is disciplined, ambitious, structured, and older in spirit. They bring stability and long-term planning. They may be in government, construction, management, or traditional businesses.',
    10: 'a partner who is unconventional, independent, intellectual, and socially aware. They bring innovation and freedom. They may be in technology, humanitarian work, science, or social activism.',
    11: 'a partner who is compassionate, artistic, spiritual, and somewhat mysterious. They bring intuition and creative flow. They may be in music, film, healing, or spiritual work.',
  };
  r += 'This indicates attraction to ' + (signPartnerTraits[seventhRashi] || 'a unique partnership dynamic.') + '\n\n';

  // Venus Analysis
  const venus = planets.find(p => p.name === 'Venus');
  if (venus) {
    r += '### Venus — The Planet of Love\n\n';
    r += 'Venus is the natural karaka (significator) of marriage, romance, beauty, and sensual pleasure in Vedic astrology. Your Venus is in **' + venus.rashi + '** (House ' + venus.house + ').\n\n';
    r += getPlanetInHouseEffect('Venus', venus.house) + '\n\n';
    if (venus.retrograde) {
      r += '**Venus Retrograde:** This powerful placement suggests deep past-life romantic karma. You may find that relationships bring up old patterns and soul-level lessons. There can be delays in finding the right partner, or a tendency to re-connect with past loves. The retrograde Venus ultimately bestows great wisdom about love through experience.\n\n';
    }
  }

  // Planets in 7th house
  const planetsIn7 = planets.filter(p => p.house === 7);
  if (planetsIn7.length > 0) {
    r += '### Planets Influencing Your 7th House\n\n';
    for (const p of planetsIn7) {
      r += '**' + p.name + ' in 7th House:** ' + getPlanetInHouseEffect(p.name, 7) + '\n\n';
    }
  }

  // 5th House (Romance)
  r += '### The 5th House — Romance Before Marriage\n\n';
  r += 'Your 5th house of romance, love affairs, and creative expression falls in **' + VEDIC_RASHIS[fifthRashi] + '**. ';
  const planetsIn5 = planets.filter(p => p.house === 5);
  if (planetsIn5.length > 0) {
    for (const p of planetsIn5) r += p.name + ' here influences your romantic nature: ' + getPlanetInHouseEffect(p.name, 5) + ' ';
  } else {
    r += 'No planets are placed here, so romantic patterns are primarily determined by the 5th lord\'s placement and aspects. ';
  }
  r += '\n\n';

  // Manglik
  r += '### Manglik (Kuja Dosha) Analysis\n\n';
  r += '**Status:** ' + (manglik.isManglik ? '🔴 Manglik Dosha Present' : '🟢 Non-Manglik') + '\n\n';
  r += manglik.details + '\n\n';
  if (manglik.isManglik) {
    r += '**Traditional Remedies (per Lal Kitab and classical texts):**\n';
    r += '- Perform Mangal Shanti Puja on Tuesdays\n';
    r += '- Wear red coral (Moonga) after proper energization\n';
    r += '- Offer sindoor to Hanuman ji on Tuesdays\n';
    r += '- Fast on Tuesdays and donate red lentils (masoor dal)\n';
    r += '- Kumbh Vivah (symbolic marriage to a pot before actual marriage) is a traditional remedy\n';
    r += '- Matching with another Manglik partner neutralizes the dosha\n\n';
    r += '**Important Note:** Many modern astrologers consider Manglik Dosha to be overemphasized in popular culture. Several cancellation conditions exist, and a holistic chart analysis is essential before drawing conclusions. Please consult a qualified astrologer.\n\n';
  }

  // Ashta Koota Compatibility Traits
  r += '### Your Ashta Koota Compatibility Profile\n\n';
  r += 'The Ashta Koota (eight-fold compatibility) system is used in Vedic marriage matching. While we cannot match you with a specific person here, we can describe what your chart indicates about your ideal compatibility:\n\n';
  const moonNakIdx = planets.find(p => p.name === 'Moon')?.nakshatraIndex || 0;
  const moonGana = NAKSHATRA_GANAS[moonNakIdx] || 'Manushya';
  const moonYoni = NAKSHATRA_YONIS[moonNakIdx] || 'Unknown';
  r += '- **Varna (Spiritual Class):** Based on your Moon sign, you resonate with partners of compatible spiritual orientation\n';
  r += '- **Vashya (Power Dynamics):** Your Moon sign determines the natural power balance in relationships\n';
  r += '- **Gana (Temperament):** Your **' + moonGana + ' Gana** is most harmonious with ';
  if (moonGana === 'Deva') r += 'Deva and Manushya Gana partners\n';
  else if (moonGana === 'Manushya') r += 'all three Gana types, with best compatibility with Manushya\n';
  else r += 'Rakshasa Gana partners; Deva Gana matches require conscious effort\n';
  r += '- **Yoni (Physical Compatibility):** Your **' + moonYoni + '** yoni seeks its natural counterpart\n';
  r += '- **Nadi (Health/Genetic):** Important for progeny — same Nadi is traditionally avoided\n\n';

  // Marital Status specific advice
  r += '### Tailored Insights for Your Current Status\n\n';
  if (maritalStatus === 'married') {
    r += 'As a married person, the focus shifts from finding a partner to nurturing and deepening your existing bond. Your current planetary periods (dashas) influence the quality of your married life — favorable dashas of Venus, Jupiter, or your 7th lord bring harmony and growth. Challenging dashas may bring tests that ultimately strengthen the relationship. Mutual respect, shared spiritual practices, and honest communication are the foundations of a lasting Vedic marriage.\n\n';
  } else if (maritalStatus === 'single') {
    r += 'For those seeking partnership, timing is governed by the transits and dashas of Jupiter, Venus, and the 7th house lord. Watch for periods when these planets are active — they often coincide with meeting significant people. The classical texts say: "When Jupiter transits the 7th house or aspects it, and Venus is simultaneously favorable, marriage opportunities arise." Focus on self-development during the waiting period — the right partner often appears when you have become the right person.\n\n';
  } else if (maritalStatus === 'divorced') {
    r += 'A past relationship ending is often reflected in challenging transits (Saturn, Rahu) through the 7th or 8th houses. The astrological perspective views divorce not as failure but as a karmic completion — the souls involved had a specific purpose that has been fulfilled. Your chart indicates the possibility of new partnerships; the timing depends on your current dasha cycle and Jupiter/Venus transits. Healing comes through understanding the astrological patterns that contributed to the difficulty, allowing you to approach future relationships with greater wisdom.\n\n';
  } else if (maritalStatus === 'widowed') {
    r += 'The loss of a spouse is one of the deepest experiences in human life. Astrologically, the 8th house (longevity of marriage) and Saturn\'s transits often correlate with such events. The Vedic tradition honors the depth of marital bonds that persist beyond physical separation. Your chart shows continuing capacity for connection and love, whether through family, community, or — when the time is right — a new partnership. The departed spouse\'s blessings remain a protective force in your life.\n\n';
  }

  return r;
}

function generateCareerReport(
  planets: PlanetPosition[], lagnaRashi: number, employment: string
): string {
  let r = '## Career, Wealth & Professional Destiny\n\n';
  r += '*Based on Brihat Parashara Hora Shastra (Karma Bhava analysis), Phala Deepika, and Jataka Parijata. For ENTERTAINMENT and INFORMATION only.*\n\n';

  const tenthRashi = (lagnaRashi + 9) % 12;
  const tenthSign = VEDIC_RASHIS[tenthRashi];
  const tenthLord = RASHI_LORDS[tenthRashi];
  const secondRashi = (lagnaRashi + 1) % 12;
  const eleventhRashi = (lagnaRashi + 10) % 12;

  r += '### The 10th House — Your Karma Bhava\n\n';
  r += 'Your 10th house of career and public reputation falls in **' + tenthSign + '**, ruled by **' + tenthLord + '**.\n\n';

  const careerBySign: Record<number, string> = {
    0: 'Aries in 10th: Military, police, fire service, surgery, engineering, competitive sports, entrepreneurship, metal work, adventure tourism. Mars-ruled careers demand action, courage, and physical energy.',
    1: 'Taurus in 10th: Banking, agriculture, luxury goods, art dealing, real estate, food industry, vocal arts, fashion, finance, beauty products. Venus-ruled careers emphasize beauty, stability, and material accumulation.',
    2: 'Gemini in 10th: Information technology, journalism, writing, translation, trading, teaching, telecommunications, social media, logistics, astrology. Mercury-ruled careers emphasize communication and intellectual versatility.',
    3: 'Cancer in 10th: Hospitality, nursing, real estate, water industries, shipping, dairy, motherhood/childcare, interior design, counseling, food preparation. Moon-ruled careers involve nurturing and emotional intelligence.',
    4: 'Leo in 10th: Government administration, politics, entertainment, theatre, gold trade, leadership coaching, corporate management, luxury hospitality. Sun-ruled careers demand authority and creative self-expression.',
    5: 'Virgo in 10th: Healthcare, pharmaceuticals, accounting, data analysis, quality control, editing, veterinary science, wellness industry, herbalism. Mercury-ruled careers emphasize detail-orientation and service.',
    6: 'Libra in 10th: Law, diplomacy, design, interior decoration, fashion, cosmetics, partnership businesses, arbitration, art galleries, public relations. Venus-ruled careers emphasize harmony and aesthetic judgment.',
    7: 'Scorpio in 10th: Research, investigation, surgery, psychology, insurance, inheritance law, occult sciences, mining, transformative healing, tantra. Mars-ruled (deep) careers probe beneath surfaces.',
    8: 'Sagittarius in 10th: Higher education, law, publishing, religious ministry, international trade, travel industry, philosophy, foreign affairs, archery, horses. Jupiter-ruled careers emphasize wisdom and expansion.',
    9: 'Capricorn in 10th: Government contracts, construction, manufacturing, mining, agriculture, bureaucracy, traditional medicine, time-keeping, archaeology. Saturn-ruled careers demand patience, structure, and endurance.',
    10: 'Aquarius in 10th: Technology, electronics, social reform, NGOs, aviation, space research, networking, humanitarian organizations, futurism, electrical engineering. Saturn-ruled (innovative) careers serve collective progress.',
    11: 'Pisces in 10th: Music, film, spiritual teaching, charity work, hospital administration, marine biology, oil/petroleum, art therapy, meditation, dreams. Jupiter-ruled careers involve compassion and transcendence.',
  };
  r += (careerBySign[tenthRashi] || '') + '\n\n';

  // Planets in 10th
  const planetsIn10 = planets.filter(p => p.house === 10);
  if (planetsIn10.length > 0) {
    r += '### Planets in Your 10th House\n\n';
    for (const p of planetsIn10) {
      r += '**' + p.name + ':** ' + getPlanetInHouseEffect(p.name, 10) + '\n\n';
    }
  }

  // Dhana Yogas
  r += '### Dhana Yogas (Wealth Combinations)\n\n';
  r += 'Dhana Yogas are specific planetary combinations that indicate wealth accumulation potential. In your chart:\n\n';

  const secondLord = RASHI_LORDS[secondRashi];
  const eleventhLord = RASHI_LORDS[eleventhRashi];
  const planetsIn2 = planets.filter(p => p.house === 2);
  const planetsIn11 = planets.filter(p => p.house === 11);
  const planetsIn5 = planets.filter(p => p.house === 5);
  const planetsIn9 = planets.filter(p => p.house === 9);

  let dhanaYogaCount = 0;
  if (planetsIn2.length > 0) {
    for (const p of planetsIn2) {
      r += '- **' + p.name + ' in 2nd house** (Dhana Bhava): Directly strengthens wealth accumulation. ' + getPlanetInHouseEffect(p.name, 2) + '\n';
      dhanaYogaCount++;
    }
  }
  if (planetsIn11.length > 0) {
    for (const p of planetsIn11) {
      r += '- **' + p.name + ' in 11th house** (Labha Bhava): Strengthens income and gains. ' + getPlanetInHouseEffect(p.name, 11) + '\n';
      dhanaYogaCount++;
    }
  }

  const jupiter = planets.find(p => p.name === 'Jupiter');
  if (jupiter && [2, 5, 9, 11].includes(jupiter.house)) {
    r += '- **Jupiter in house ' + jupiter.house + '**: Jupiter, the great benefic, in a wealth-related house is a powerful Dhana Yoga. This promises expansion of wealth through righteous means.\n';
    dhanaYogaCount++;
  }

  // Lakshmi Yoga check
  if (planetsIn5.length > 0 && planetsIn9.length > 0) {
    r += '- **Lakshmi Yoga Indicators**: Planets in both 5th (Purva Punya) and 9th (Bhagya) houses create powerful fortune combinations.\n';
    dhanaYogaCount++;
  }

  if (dhanaYogaCount === 0) {
    r += 'No classical Dhana Yogas are prominently visible. Wealth comes through the lord of the 2nd and 11th houses — their dasha periods bring financial opportunities.\n';
  }
  r += '\n';

  // Employment-specific guidance
  r += '### Guidance for Your Current Professional Situation\n\n';
  if (employment === 'employed') {
    r += 'As an employed professional, your current planetary period (Mahadasha/Antardasha) determines the pace of advancement. If the 10th lord or its antardasha is active, this is a period of professional growth and recognition. If Saturn\'s influence is strong, career progress may be slow but ultimately more solid and permanent. Leverage your 10th house sign\'s natural career inclinations for maximum alignment.\n\n';
  } else if (employment === 'self-employed') {
    r += 'As an entrepreneur, your chart\'s 7th house (business partnerships), 10th house (professional action), and 11th house (gains) form a trinity of success. The current dasha period determines whether this is a time for expansion (Jupiter/Venus period) or consolidation (Saturn period). Business success in Vedic astrology is strongly tied to the 3rd house of courage — your willingness to take calculated risks.\n\n';
  } else if (employment === 'student') {
    r += 'As a student, the 5th house (intelligence and education) and 4th house (foundational learning) are your primary indicators. Jupiter\'s transit through these houses brings academic breakthroughs. Mercury\'s condition in your chart determines your learning style — strong Mercury favors analytical/technical subjects, while Jupiter favors philosophical/legal studies, and Venus favors creative/artistic pursuits.\n\n';
  } else if (employment === 'unemployed') {
    r += 'The current period of unemployment is temporary. In Vedic astrology, unemployment often correlates with a transitional dasha period — particularly when Saturn transits the 10th house or when the 10th lord is between major periods. Watch for upcoming Jupiter or Venus dashas/transits, which frequently bring new career opportunities. Use this period for skill development aligned with your 10th house sign.\n\n';
  } else if (employment === 'retired') {
    r += 'In the wisdom years of retirement, the 9th house (higher purpose) and 12th house (spiritual liberation) become more relevant than the 10th house. This is a time for pursuing dharma, sharing accumulated wisdom, and investing in spiritual growth. Many retirees find renewed purpose through teaching, counseling, or charitable work — activities aligned with Jupiter and Saturn\'s mature energies.\n\n';
  }

  return r;
}

function generateHealthReport(planets: PlanetPosition[], lagnaRashi: number): string {
  let r = '## Health & Wellness — Astrological Body Mapping\n\n';
  r += '*Based on Ashtanga Hridaya correlations with Jyotish, Charaka Samhita body constitution mapping, and classical zodiac-body correlations found in both Vedic and Hippocratic (Greek) medical astrology. This is for ENTERTAINMENT and INFORMATION only — NOT medical advice. Always consult qualified healthcare professionals for health concerns.*\n\n';

  const lagnaSign = VEDIC_RASHIS[lagnaRashi];
  const lagnaBody = ZODIAC_BODY_MAP[lagnaSign] || 'general vitality';
  const sixthRashi = (lagnaRashi + 5) % 12;
  const eighthRashi = (lagnaRashi + 7) % 12;
  const sixthSign = VEDIC_RASHIS[sixthRashi];
  const eighthSign = VEDIC_RASHIS[eighthRashi];

  r += '### Ascendant Health Profile\n\n';
  r += 'Your Lagna in **' + lagnaSign + '** primarily governs: **' + lagnaBody + '**\n\n';
  r += 'In the ancient zodiac-body mapping system (shared by both Vedic and Hellenistic traditions), each sign governs specific body parts and organ systems. The sign on your Ascendant indicates your constitutional strengths and potential vulnerabilities:\n\n';

  // Full body mapping
  r += '### Complete Zodiac-Body Correlation (per classical texts)\n\n';
  for (let i = 0; i < 12; i++) {
    const house = i + 1;
    const rashi = (lagnaRashi + i) % 12;
    const sign = VEDIC_RASHIS[rashi];
    const bodyPart = ZODIAC_BODY_MAP[sign] || 'general';
    const planetsHere = planets.filter(p => p.house === house);
    r += '**House ' + house + ' (' + sign + '):** ' + bodyPart;
    if (planetsHere.length > 0) {
      r += ' — Planets here: ' + planetsHere.map(p => p.name + (p.retrograde ? '℞' : '')).join(', ');
    }
    r += '\n';
  }
  r += '\n';

  // 6th House Analysis
  r += '### The 6th House — Chronic Vulnerabilities\n\n';
  r += 'Your 6th house of disease falls in **' + sixthSign + '**, governing ' + (ZODIAC_BODY_MAP[sixthSign] || 'general health') + '.\n\n';
  const planetsIn6 = planets.filter(p => p.house === 6);
  if (planetsIn6.length > 0) {
    for (const p of planetsIn6) {
      r += '**' + p.name + ' in 6th house:** ';
      if (p.name === 'Saturn') r += 'Saturn here indicates chronic conditions (bone/joint issues, slow metabolism) but also gives tremendous endurance. Saturn in 6th actually helps defeat enemies and chronic illness over time through sheer persistence.\n';
      else if (p.name === 'Mars') r += 'Mars here can indicate inflammatory conditions, fevers, surgical interventions, and accident-proneness. However, Mars in 6th also gives strong immune response and the fighting spirit to overcome any disease.\n';
      else if (p.name === 'Rahu') r += 'Rahu here indicates mysterious, hard-to-diagnose conditions, chemical sensitivities, or unusual health challenges. It also gives victory over hidden enemies and success in healing professions.\n';
      else if (p.name === 'Ketu') r += 'Ketu here indicates skin conditions, allergies, psychosomatic issues, and past-life health karma. It also gives intuitive healing abilities and success in alternative medicine.\n';
      else if (p.name === 'Moon') r += 'Moon here brings emotional health fluctuations, digestive sensitivity, and stress-related conditions. Mental wellness practices are especially important.\n';
      else if (p.name === 'Sun') r += 'Sun here can indicate eye issues, heart strain, or constitutional heat. However, Sun in 6th gives strong vitality to overcome enemies and disease.\n';
      else r += getPlanetInHouseEffect(p.name, 6) + '\n';
      r += '\n';
    }
  } else {
    r += 'No planets occupy your 6th house, suggesting that chronic health issues are less prominent in your chart. Health matters are primarily governed by the 6th lord and its transits.\n\n';
  }

  // 8th House Analysis
  r += '### The 8th House — Acute/Hidden Health Events\n\n';
  r += 'Your 8th house of sudden events falls in **' + eighthSign + '**, governing ' + (ZODIAC_BODY_MAP[eighthSign] || 'general health') + '.\n\n';
  const planetsIn8 = planets.filter(p => p.house === 8);
  if (planetsIn8.length > 0) {
    for (const p of planetsIn8) {
      r += '**' + p.name + ' in 8th house:** ';
      if (p.name === 'Jupiter') r += 'Jupiter in 8th is actually protective — it grants longevity and shields against sudden health crises. This is one of the best placements for a long life.\n';
      else if (p.name === 'Saturn') r += 'Saturn in 8th gives exceptional longevity (Saturn is the planet of endurance). While chronic conditions may develop, you have the stamina to manage them.\n';
      else r += 'This placement requires attention to sudden health events related to the body areas governed by ' + eighthSign + '.\n';
      r += '\n';
    }
  }

  // Ayurvedic Constitution
  r += '### Ayurvedic Constitution (Prakriti) Indicators\n\n';
  r += 'Based on your Lagna and planetary influences, your likely Ayurvedic constitution:\n\n';
  if ([0, 4, 8].includes(lagnaRashi)) { // Fire signs
    r += '**Pitta Dominant (Fire Constitution):** You have strong digestive fire, warm body temperature, and sharp intellect. Prone to inflammation, acidity, skin rashes, and heat-related conditions. Recommended: cooling foods, meditation, avoiding excessive competition and spicy diet. Favorable season: winter/autumn.\n\n';
  } else if ([1, 5, 9].includes(lagnaRashi)) { // Earth signs
    r += '**Kapha Dominant (Earth-Water Constitution):** You have a sturdy frame, strong immunity, and calm temperament. Prone to weight gain, congestion, lethargy, and water retention. Recommended: regular vigorous exercise, light warm foods, early rising, avoiding dairy excess. Favorable season: spring.\n\n';
  } else if ([2, 6, 10].includes(lagnaRashi)) { // Air signs
    r += '**Vata Dominant (Air Constitution):** You have a light frame, quick mind, and creative energy. Prone to anxiety, joint pain, dry skin, and nervous system sensitivity. Recommended: warm oil massage (abhyanga), regular routine, warm nourishing foods, grounding meditation. Favorable season: summer.\n\n';
  } else { // Water signs
    r += '**Kapha-Pitta (Water-Fire Constitution):** You combine emotional depth with inner intensity. Prone to digestive fluctuations, emotional eating, and fluid-related conditions. Recommended: balanced diet, emotional regulation practices, moderate exercise, regular hydration. Favorable season: autumn.\n\n';
  }

  r += '### General Wellness Recommendations\n\n';
  r += '- **Yoga Asanas:** Practice postures that strengthen the body areas governed by your Lagna sign\n';
  r += '- **Pranayama:** Nadi Shodhana (alternate nostril breathing) balances all three doshas\n';
  r += '- **Diet:** Follow seasonal eating (Ritucharya) aligned with your constitution\n';
  r += '- **Sleep:** Maintain consistent sleep-wake cycles aligned with your Moon sign\'s rhythms\n';
  r += '- **Planet-specific remedies:** Each planetary period brings specific health themes — awareness allows prevention\n\n';
  r += '**⚠️ IMPORTANT: This is NOT medical advice. Always consult qualified healthcare professionals for health concerns. Astrological health indications are observational patterns from ancient texts and should be treated as supplementary cultural knowledge only.**\n\n';

  return r;
}

function generateSpiritualReport(
  planets: PlanetPosition[], lagnaRashi: number,
  atmakaraka: { planet: string; degree: number; meaning: string }, moonNakshatra: number
): string {
  let r = '## Spiritual Path & Dharmic Destiny\n\n';
  r += '*Drawing from the Bhagavad Gita, Yoga Sutras of Patanjali, Jaimini Sutras, Sufi mystical traditions, Buddhist astrology, and Egyptian Book of the Dead. For ENTERTAINMENT and INFORMATION only.*\n\n';

  const ninthRashi = (lagnaRashi + 8) % 12;
  const twelfthRashi = (lagnaRashi + 11) % 12;
  const ninthSign = VEDIC_RASHIS[ninthRashi];
  const twelfthSign = VEDIC_RASHIS[twelfthRashi];
  const ninthLord = RASHI_LORDS[ninthRashi];
  const twelfthLord = RASHI_LORDS[twelfthRashi];

  // 9th House
  r += '### The 9th House (Dharma Bhava) — Your Fortune & Faith\n\n';
  r += '**Sign:** ' + ninthSign + ' | **Lord:** ' + ninthLord + '\n\n';
  r += 'The 9th house is the most auspicious trikona (trine), governing your relationship with the divine, your guru, your father, higher education, long-distance travel, and the cumulative fortune (bhagya) of your life. In Sufi tradition, this house corresponds to the seeker\'s relationship with the Murshid (spiritual guide). In Buddhist astrology, it represents the potential for Bodhi (enlightenment) through wisdom.\n\n';

  const planetsIn9 = planets.filter(p => p.house === 9);
  if (planetsIn9.length > 0) {
    r += '**Dharma Indicators in Your Chart:**\n\n';
    for (const p of planetsIn9) {
      r += '**' + p.name + ' in 9th house:** ' + getPlanetInHouseEffect(p.name, 9) + '\n\n';
    }
  }

  // 12th House
  r += '### The 12th House (Moksha Bhava) — Liberation & Transcendence\n\n';
  r += '**Sign:** ' + twelfthSign + ' | **Lord:** ' + twelfthLord + '\n\n';
  r += 'The 12th house is the final house of the zodiac, representing the dissolution of the ego and return to the cosmic source. In the Egyptian Book of the Dead, this corresponds to the soul\'s journey through the Duat (underworld) toward the Field of Reeds. In Buddhist cosmology, it represents the potential for Nirvana. In Vedantic philosophy, it is the house of Moksha — liberation from the cycle of birth and death.\n\n';
  r += 'A strong 12th house indicates: capacity for deep meditation, vivid dreams and astral experiences, potential for foreign residence, charitable nature, and spiritual sensitivity. The 12th house also governs sleep quality, hospital stays, and expenses — both material and spiritual investments.\n\n';

  const planetsIn12 = planets.filter(p => p.house === 12);
  if (planetsIn12.length > 0) {
    r += '**Moksha Indicators in Your Chart:**\n\n';
    for (const p of planetsIn12) {
      r += '**' + p.name + ' in 12th house:** ' + getPlanetInHouseEffect(p.name, 12) + '\n\n';
    }
  }

  // Rahu-Ketu Axis
  r += '### The Rahu-Ketu Axis — Your Karmic Journey\n\n';
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  if (rahu && ketu) {
    r += '**Rahu (North Node)** in ' + rahu.rashi + ' (House ' + rahu.house + ')\n';
    r += '**Ketu (South Node)** in ' + ketu.rashi + ' (House ' + ketu.house + ')\n\n';
    r += 'The Rahu-Ketu axis is the most profound karmic indicator in Vedic astrology. **Ketu** represents where you have been — the skills, wisdom, and patterns carried from previous incarnations. You are already a master in Ketu\'s domain, but over-reliance on these familiar patterns leads to stagnation.\n\n';
    r += '**Rahu** represents where you are headed — the unfamiliar territory that your soul needs to explore in this lifetime. Rahu\'s house and sign indicate the area of life where you will experience the greatest growth, obsession, and eventual mastery. The journey from Ketu to Rahu is your soul\'s evolutionary path.\n\n';
    r += 'In Kabbalistic astrology (Jewish mystical tradition), the North Node (Rahu) represents the Tikkun — the soul\'s specific mission for cosmic repair. In Sufi tradition, the axis represents the journey from nafs (ego) to ruh (spirit). Understanding this axis helps you navigate life\'s challenges with greater acceptance and purpose.\n\n';
  }

  // Atmakaraka Spiritual Message
  r += '### Atmakaraka — Your Soul\'s Deepest Desire\n\n';
  r += 'Your Atmakaraka is **' + atmakaraka.planet + '** at ' + atmakaraka.degree.toFixed(2) + '° in its sign.\n\n';
  r += atmakaraka.meaning + '\n\n';
  r += 'In Jaimini astrology, the Atmakaraka\'s Navamsha (D-9) placement reveals the Karakamsha — the sign where your soul\'s deepest spiritual work occurs. The Atmakaraka is considered the king of the chart; all other planets serve its purpose. Understanding your Atmakaraka helps you identify the central theme of this incarnation.\n\n';

  // Nakshatra Deity
  const nDeity = NAKSHATRA_DEITIES[moonNakshatra] || 'the cosmic divine';
  const nakshatraName = NAKSHATRAS[moonNakshatra];
  r += '### Ishta Devata (Personal Deity) Connection\n\n';
  r += 'Your birth nakshatra **' + nakshatraName + '** is presided over by **' + nDeity + '**.\n\n';
  r += 'In the Vedic tradition, the nakshatra deity is considered your Ishta Devata — the form of the divine that most naturally resonates with your soul. Regular worship, meditation, and mantra practice focused on ' + nDeity + ' accelerates your spiritual evolution and brings protection. This is not about religion — it is about the specific cosmic frequency that your birth moment connected you to.\n\n';

  // Cross-cultural spiritual synthesis
  r += '### Cross-Cultural Spiritual Connections\n\n';
  r += '**Vedantic View:** Every soul (Atman) is on a journey of self-realization. Your chart is a map of the specific challenges and gifts designed for this particular incarnation. The ultimate goal is recognition of your identity with Brahman (the cosmic absolute).\n\n';
  r += '**Buddhist View:** Your chart reflects the specific patterns of attachment, aversion, and ignorance that this lifetime is designed to help you transcend. The planets represent karmic formations (samskaras) that create your experience.\n\n';
  r += '**Sufi View:** Each planetary period is a "maqam" (spiritual station) on the soul\'s journey toward divine union. The challenges represented by Saturn and Rahu are the "dark nights" that purify the heart.\n\n';
  r += '**Egyptian View:** Your birth chart is the "Book of Breathings" — the spiritual blueprint that your Ka (vital essence) carries through this lifetime toward Ma\'at (cosmic truth and balance).\n\n';

  return r;
}

function generateEgyptianDecanReport(decan: { sign: string; decanNumber: number; ruler: string; deity: string; traits: string }): string {
  let r = '## Egyptian Decan Reading — The Ancient Star Clocks\n\n';
  r += '*Based on the Dendera Zodiac ceiling (Temple of Hathor, ~50 BCE), the Seti I astronomical ceiling (Valley of the Kings, ~1279 BCE), and the Chaldean decan system transmitted through Hellenistic astrology. For ENTERTAINMENT and INFORMATION only.*\n\n';

  r += '### Your Egyptian Decan\n\n';
  r += '**Sign:** ' + decan.sign + ' | **Decan:** ' + decan.decanNumber + '/3 | **Planetary Ruler:** ' + decan.ruler + '\n';
  r += '**Associated Deity:** ' + decan.deity + ' | **Core Traits:** ' + decan.traits + '\n\n';

  r += '### The Decan System — History\n\n';
  r += 'The Egyptian decan system is one of the oldest astrological frameworks in human history, dating back to at least 2100 BCE. The ancient Egyptians divided the night sky into 36 decans — groups of stars that rose consecutively on the horizon, each ruling 10° of the zodiac. These decans served as "star clocks" — the rising of each decan marked a specific time of night and season of the year.\n\n';
  r += 'The Chaldean order of planetary rulers (Mars → Sun → Venus → Mercury → Moon → Saturn → Jupiter, repeating) was applied to the 36 decans by Hellenistic astrologers who synthesized Egyptian and Mesopotamian traditions. Each decan thus carries the energy of both its zodiac sign and its planetary ruler.\n\n';

  r += '### Your Decan\'s Meaning\n\n';
  const decanMeanings: Record<string, Record<number, string>> = {
    Mars: {
      1: 'The First Face of Mars: You carry the raw initiating energy of the warrior. Like Montu (the Egyptian war god), you charge into life with courage and determination. You are a pioneer who opens paths for others to follow. Your challenge is to channel aggression into constructive action.',
      2: 'The Second Face of Mars: Your warrior energy has gained experience and strategy. Like Sekhmet (the lioness), you combine fierce protection with targeted precision. You fight not for glory but for those who cannot fight for themselves.',
      3: 'The Third Face of Mars: The mature warrior who has learned the cost of battle. Like Neith (the goddess of war and weaving), you understand that true strength lies in knowing when NOT to fight. You are a strategist and protector.',
    },
    Sun: {
      1: 'The First Face of the Sun: You carry the dawn energy of Ra rising over the horizon. Leadership comes naturally. You illuminate whatever you touch, bringing clarity and vitality to those around you.',
      2: 'The Second Face of the Sun: You are Ra at noon — at the height of creative power. Authority, recognition, and creative expression are your birthright. You shine brightest in positions of visible leadership.',
      3: 'The Third Face of the Sun: You are Ra descending toward the underworld — wisdom earned through experience. You understand the cycles of rise and fall, and your light illuminates the hidden depths.',
    },
    Venus: {
      1: 'The First Face of Venus: You carry Hathor\'s energy of love, beauty, and artistic creation. The world is more beautiful because of your presence. You naturally create harmony in any environment.',
      2: 'The Second Face of Venus: Your beauty has depth — like Isis, you combine grace with magical power. You attract abundance through the sheer force of your aesthetic and emotional intelligence.',
      3: 'The Third Face of Venus: Mature Venusian energy — you understand that true beauty lies in the soul. Like Bastet (the cat goddess), you combine sensuality with fierce independence and refined taste.',
    },
    Mercury: {
      1: 'The First Face of Mercury: You carry Thoth\'s gift of sacred writing and knowledge. Your mind is a telescope that sees patterns invisible to others. Communication and intellectual discovery are your powers.',
      2: 'The Second Face of Mercury: Like Thoth as the measurer of time, you have precision and analytical skill. You organize the chaotic into the comprehensible. Science, mathematics, and systematic thinking are your domains.',
      3: 'The Third Face of Mercury: Thoth as the psychopomp — you guide others through transitions of understanding. Teaching, counseling, and translating complex ideas into accessible wisdom are your gifts.',
    },
    Moon: {
      1: 'The First Face of the Moon: You carry Khonsu\'s energy of intuitive perception and emotional depth. Your feelings are your compass, and your sensitivity is your strength. You understand the tides of human emotion.',
      2: 'The Second Face of the Moon: Like Khonsu the healer, your emotional attunement allows you to sense and soothe the pain of others. You are a natural counselor and nurturer whose presence brings peace.',
      3: 'The Third Face of the Moon: The mature Moon — your emotional wisdom encompasses both light and shadow. You understand that darkness is not the enemy of light but its partner. Dreams and visions guide your path.',
    },
    Saturn: {
      1: 'The First Face of Saturn: You carry the ancient builder\'s determination. Like Ptah (the creator god who shaped the world through speech), your patience and discipline create lasting structures.',
      2: 'The Second Face of Saturn: Endurance personified. You understand that the greatest achievements require the greatest patience. Like the pyramids themselves, what you build is designed to last millennia.',
      3: 'The Third Face of Saturn: Saturn as liberator — through discipline and detachment, you achieve freedom. Your understanding of limitation paradoxically liberates you from its grip. You are an old soul.',
    },
    Jupiter: {
      1: 'The First Face of Jupiter: You carry Amun-Ra\'s expansive blessing. Wisdom, generosity, and philosophical depth define you. You naturally attract abundance and share it with others.',
      2: 'The Second Face of Jupiter: Like Amun (the hidden god), your spiritual power works beneath the surface. You are a teacher and sage whose influence grows with time. Temples of wisdom are your legacy.',
      3: 'The Third Face of Jupiter: The culmination of Jupiterian energy — you are a master teacher, a philosophical beacon, a generous soul who has integrated worldly success with spiritual wisdom.',
    },
  };
  const decanDetail = decanMeanings[decan.ruler]?.[decan.decanNumber];
  if (decanDetail) r += decanDetail + '\n\n';

  r += '### Middle Eastern Astrological Traditions\n\n';
  r += 'The Egyptian decan system did not exist in isolation. It was part of a rich tapestry of Middle Eastern astrological science:\n\n';
  r += '**Mesopotamian (Babylonian) Influence:** The Enuma Anu Enlil (astronomical omen series, ~1800 BCE) provided the foundation for systematic celestial observation. Babylonian astrologers developed the zodiac itself and many of the planetary signification systems still used today.\n\n';
  r += '**Persian (Zoroastrian) Astrology:** The concept of planetary "lots" (Arabic Parts) and the use of fixed stars in predictive work came from the Persian magi tradition. The idea that the soul chooses its birth moment connects to the Zoroastrian concept of Fravashi (guardian spirit).\n\n';
  r += '**Arabic Astrology:** The golden age of Islamic astronomy (8th-13th centuries CE) preserved and expanded Greek and Indian astrological knowledge. Abu Ma\'shar, al-Biruni, and others created synthesis systems that bridged Eastern and Western traditions.\n\n';
  r += '**Kabbalistic Astrology:** The Jewish mystical tradition assigned each zodiac sign to a Hebrew letter and a path on the Tree of Life, connecting astrological archetypes to the very structure of creation.\n\n';

  return r;
}

function generateMayanReport(mayan: { daySign: string; tone: number; meaning: string }): string {
  let r = '## Mayan Tzolkin Reading — The Sacred Calendar\n\n';
  r += '*Based on the Tzolkin (260-day sacred calendar) of the ancient Maya civilization, as documented in the Dresden Codex (~13th century CE) and various inscriptions at Palenque, Tikal, and Copán. For ENTERTAINMENT and INFORMATION only.*\n\n';

  r += '### Your Mayan Birth Energy\n\n';
  r += '**Day Sign (Nahual):** ' + mayan.daySign + '\n';
  r += '**Galactic Tone:** ' + mayan.tone + ' out of 13\n\n';
  r += mayan.meaning + '\n\n';

  r += '### The Tzolkin System\n\n';
  r += 'The Tzolkin is a 260-day sacred calendar created by the ancient Maya, combining 20 day signs (representing archetypal energies) with 13 galactic tones (representing cosmic intentions). The resulting 260 unique combinations (20 × 13) create a complete cycle that mirrors the human gestation period of approximately 260 days.\n\n';
  r += 'Unlike the Western/Vedic zodiac, which is based on the annual solar cycle, the Tzolkin operates on a different rhythmic basis entirely — it is more closely related to biological and galactic rhythms than seasonal ones. The Maya believed that each day of the Tzolkin carries a specific energy that influences everything born or initiated on that day.\n\n';

  r += '### Galactic Tone ' + mayan.tone + ' — Your Cosmic Purpose\n\n';
  const toneDescriptions: Record<number, string> = {
    1: 'Unity, new beginnings, the power of attraction. You are a magnetic initiator — you begin cycles and attract the resources needed for creation. Your purpose is to unify diverse elements into a single vision.',
    2: 'Duality, challenge, stabilization. You hold the tension of opposites and create stability from apparent contradiction. Your purpose is to bring balance where there is polarization.',
    3: 'Rhythm, activation, bonding. You are a catalyst who activates dormant potential in others. Your purpose is to create movement and rhythm in stagnant situations.',
    4: 'Measurement, form, definition. You give shape to abstract ideas. Your purpose is to establish foundations, create structures, and define clear boundaries.',
    5: 'Empowerment, center, command. You are the center of your circle — a natural commander who empowers others. Your purpose is to radiate stability and authority.',
    6: 'Flow, equality, balance. You bring organic balance to every situation. Your purpose is to create systems of equal exchange and harmonious flow.',
    7: 'Resonance, attunement, purpose. You are a mystic channel — you resonate with frequencies that others cannot perceive. Your purpose is to align others with their highest potential.',
    8: 'Harmony, integrity, modeling. You harmonize through example. Your purpose is to demonstrate integrity so thoroughly that others naturally follow your lead.',
    9: 'Intention, patience, completion. You carry the energy of the greater cycle — your intentions take time to manifest but are deeply powerful. Your purpose is to complete what others have begun.',
    10: 'Manifestation, production, challenge. You are a manifester — you take abstract potential and make it real. Your purpose is to produce tangible results from visionary ideas.',
    11: 'Liberation, release, change. You are a liberator who releases old patterns and opens doors to new possibilities. Your purpose is to dissolve structures that no longer serve.',
    12: 'Cooperation, understanding, sharing. You are a bridge-builder who creates understanding between different people and perspectives. Your purpose is to share knowledge and create community.',
    13: 'Presence, transcendence, endurance. You carry the full energy of the cosmic cycle. Your purpose is to transcend limitations and bring the entire cycle to its highest expression.',
  };
  r += (toneDescriptions[mayan.tone] || 'This tone carries a unique cosmic signature that shapes your life purpose.') + '\n\n';

  r += '### Cross-Cultural Calendar Connections\n\n';
  r += 'The 260-day cycle of the Tzolkin appears across Mesoamerican cultures (Aztec Tonalpohualli, Zapotec Piye), suggesting a profound astronomical or biological significance that transcends any single civilization. Some researchers note correlations between the Tzolkin and Vedic Nakshatra cycles — both systems use ~27-day sub-cycles and both assign animal/deity energies to specific time periods. Whether this represents independent discovery of universal patterns or ancient cross-cultural contact remains an open question.\n\n';

  return r;
}

function generateHistoricalPatterns(moonNakshatra: number): string {
  let r = '## Historical Patterns — Famous Souls Under Your Star\n\n';
  r += '*The nakshatra system has been used for thousands of years to identify personality patterns. The following historical parallels are drawn from documented birth data and classical astrological texts. For ENTERTAINMENT and INFORMATION only.*\n\n';

  const nName = NAKSHATRAS[moonNakshatra];
  const deity = NAKSHATRA_DEITIES[moonNakshatra] || 'the cosmic divine';
  const ruler = NAKSHATRA_RULERS[moonNakshatra] || 'a celestial ruler';

  r += '### Your Nakshatra: ' + nName + '\n\n';
  r += '**Ruling Planet:** ' + ruler + ' | **Presiding Deity:** ' + deity + '\n\n';

  const famous = NAKSHATRA_FAMOUS[nName];
  if (famous && famous.length > 0) {
    r += '### Notable Figures Born Under ' + nName + '\n\n';
    for (const person of famous) {
      r += '- **' + person + '**\n';
    }
    r += '\n';
    r += 'These individuals demonstrate the characteristic energy of ' + nName + ' nakshatra — ruled by ' + ruler + ' and blessed by ' + deity + '. You share cosmic DNA with these figures, meaning that the celestial frequency at your birth created similar archetypal potential. However, how this potential manifests depends entirely on your choices, circumstances, and conscious development.\n\n';
  } else {
    r += 'Those born under ' + nName + ' carry the unique gifts of ' + deity + ' and the energy of ' + ruler + '. Every nakshatra produces remarkable individuals when its energy is channeled consciously.\n\n';
  }

  r += '### Nakshatra Pattern Analysis\n\n';
  r += 'The nakshatra you are born under does not determine your destiny — it illuminates your potential. ' + nName + ' natives historically demonstrate:\n\n';
  r += '- **Strengths:** The gifts bestowed by ' + deity + ' — study the mythology of this deity to understand your deepest gifts\n';
  r += '- **Challenges:** Each nakshatra has shadow qualities that serve as growth opportunities\n';
  r += '- **Life Themes:** Recurring patterns that appear across generations of ' + nName + ' natives\n';
  r += '- **Career Inclinations:** Professions that naturally resonate with ' + ruler + '\'s energy\n\n';
  r += 'The ancient rishis observed these patterns over centuries of careful documentation, creating a living database of human potential mapped to celestial positions. Modern astrologers continue this tradition of empirical observation.\n\n';

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
  atmakaraka: { planet: string; degree: number; meaning: string },
  planets: PlanetPosition[], dashaTimeline: DashaPeriod[], birthYear: number,
  manglik: ManglikStatus, sadeSati: SadeSatiStatus
): string {
  let s = '## Your Cosmic Life Story\n\n';
  s += '*This narrative weaves Vedic, Western, Egyptian, and Mayan astrological traditions into one honest life tapestry — including real challenges, growth periods, and turning points. It is a poetic interpretation for ENTERTAINMENT and INFORMATION only.*\n\n';

  // Chapter 1: Birth
  const deity = NAKSHATRA_DEITIES[NAKSHATRAS.indexOf(moonNakshatraName)] || 'the cosmos';
  s += '### Chapter 1 — The Arrival\n\n';
  s += 'In the year ' + birthYear + ', at a moment ordained by the dance of celestial bodies, a soul entered the world. The eastern horizon held **' + lagnaSign + '** rising, shaping the body, instincts, and life approach. The Moon rested in **' + moonSign + '** within **' + moonNakshatraName + '** nakshatra, presided over by **' + deity + '** — the emotional blueprint for this lifetime.\n\n';
  s += name + ', the ancient traditions are unanimous: the stars do not bring only ease. The same chart that shows your gifts maps your deepest struggles. Both are the curriculum. Both are sacred.\n\n';

  // Chapter 2: Childhood Dasha — real picture
  const firstDasha = dashaTimeline[0];
  const secondDasha = dashaTimeline[1];
  s += '### Chapter 2 — The Formative Years (Childhood)\n\n';
  s += 'Your earliest years unfolded under the **' + (firstDasha?.planet || 'planetary') + ' Mahadasha**:\n\n';
  s += getDashaEffects(firstDasha?.planet || '') + '\n\n';
  if (secondDasha) {
    s += 'As childhood deepened, the **' + secondDasha.planet + ' Mahadasha** began (around age ' + (secondDasha.startAge || '?') + '). ';
    s += 'The foundation you were given — emotional, financial, social — carried both gifts and wounds that would take years to understand. The Moon in ' + moonSign + ' means your emotional world was vivid and absorbing: you felt everything deeply, and early disappointments left marks alongside early joys.\n\n';
  }

  // Chapter 3: Youth & Education
  s += '### Chapter 3 — The Awakening (Youth)\n\n';
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const mercury = planets.find(p => p.name === 'Mercury');
  s += 'Adolescence brought the awakening of identity — and its challenges. Jupiter\'s placement in your chart shaped how you learned:\n';
  if (jupiter) {
    if ([4, 5, 9].includes(jupiter.house)) {
      s += 'With Jupiter in house ' + jupiter.house + ', education came naturally — but so did overconfidence and the temptation to coast on natural talent rather than discipline.\n\n';
    } else if (jupiter.house === 8 || jupiter.house === 12) {
      s += 'With Jupiter in house ' + jupiter.house + ', your learning path was unconventional, perhaps disrupted, with gaps or detours that ultimately brought deeper wisdom than a straight path would have.\n\n';
    } else {
      s += 'Jupiter in house ' + jupiter.house + ' directed your curiosity toward ' + jupiter.rashi + ' themes — learning was shaped by both genuine enthusiasm and real-world pressures.\n\n';
    }
  }
  if (mercury) {
    s += 'Mercury in ' + mercury.rashi + ' (house ' + mercury.house + ') colored your communication style and studies. ';
    if (mercury.retrograde) s += 'Mercury retrograde brought a tendency to second-guess yourself, relearn old lessons, and sometimes miscommunicate at crucial moments — but it also gave deep reflection and original thinking.\n\n';
    else s += 'This gave specific intellectual strengths but also areas of anxiety and nervous strain.\n\n';
  }

  // Chapter 4: Saturn Return — the real test
  s += '### Chapter 4 — The Forge (Ages 28–31: Saturn Return)\n\n';
  s += '**This chapter is the pivot point of your life.** Around ages 29–30, Saturn returns to its natal position — the most significant transit anyone experiences. It does not come gently.\n\n';
  s += 'The Saturn Return demands an accounting: Is your career built on authentic strength or social expectation? Is your relationship chosen freely or out of fear of loneliness? Is your home truly yours or are you living someone else\'s version of your life?\n\n';
  s += 'For ' + lagnaSign + ' rising, Saturn\'s return challenged the themes of ';
  const saturnHouse = planets.find(p => p.name === 'Saturn')?.house;
  if (saturnHouse) {
    s += 'your ' + saturnHouse + 'th house — bringing concrete tests in ' + (saturnHouse === 7 ? 'marriage and commitment' : saturnHouse === 10 ? 'career and public reputation' : saturnHouse === 4 ? 'home, family, and inner security' : saturnHouse === 1 ? 'your physical body, health, and identity' : 'the life area of house ' + saturnHouse) + '.\n\n';
  } else {
    s += 'the foundations of your adult life — career, relationships, and identity all demanded honest re-evaluation.\n\n';
  }
  s += 'Those who resist Saturn\'s restructuring face external breakdown. Those who embrace it — even painfully — emerge with a life finally built on truth.\n\n';

  // Chapter 5: Maturity Dasha — honest picture
  s += '### Chapter 5 — The Harvest and the Tests (Maturity)\n\n';
  // Find the dasha active around ages 35-50
  const maturityDasha = dashaTimeline.find(d => d.startAge >= 30 && d.startAge <= 50) || dashaTimeline[3];
  if (maturityDasha) {
    s += 'Your **' + maturityDasha.planet + ' Mahadasha** (ages ~' + maturityDasha.startAge + '–' + maturityDasha.endAge + ') brings the following real picture:\n\n';
    s += getDashaEffects(maturityDasha.planet) + '\n\n';
  }
  if (manglik.isManglik) {
    s += '**Manglik Pattern:** The Mars energy in your chart has brought intensity to your closest relationships. This is not a curse — it is a call for conscious choice. The same fire that creates passion creates conflict when unexamined. Understanding this pattern breaks its automatic hold.\n\n';
  }
  s += 'Career peaks and pressures coexist in this chapter. The 10th house of public action becomes your arena — and the world can be both rewarding and brutal. The key: separate your self-worth from your professional performance.\n\n';

  // Chapter 6: Rahu/Ketu and the Sade Sati
  s += '### Chapter 6 — The Deep Testing (Sade Sati & Rahu)\n\n';
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  if (rahu && ketu) {
    s += 'Your **Rahu** in ' + rahu.rashi + ' (house ' + rahu.house + ') represents where you are being pulled — intense, obsessive, and often deceptive desires that feel like they will complete you but require careful navigation. Your **Ketu** in ' + ketu.rashi + ' (house ' + ketu.house + ') represents what you already mastered in past lives — familiar territory that offers comfort but not growth.\n\n';
    s += 'The Rahu-Ketu axis is your soul\'s growth edge: you must walk into Rahu\'s unfamiliar territory while releasing Ketu\'s comfortable but limiting patterns. This is not painless. It is purposeful.\n\n';
  }
  if (sadeSati.isActive) {
    s += '**Sade Sati is currently active in your chart** — Saturn transiting near your Moon sign. This 7.5-year period is traditionally feared in Vedic astrology, and with reason: it brings delays, emotional heaviness, health concerns, and a stripping away of support structures. What it is really doing is revealing which foundations in your life are real. Those that survive Sade Sati are the real ones. Do not fight it — work with it through discipline, service, and honest self-examination.\n\n';
  }

  // Chapter 7: Wisdom years
  s += '### Chapter 7 — The Deepening (Wisdom Years)\n\n';
  s += 'The fifties and sixties bring a quieter but deeper challenge: meaning. The 9th house of dharma and 12th house of liberation begin to call more loudly than the 10th house of ambition.\n\n';
  s += 'Your Atmakaraka — **' + atmakaraka.planet + '** — has been whispering its message throughout your life. Its meaning: **' + atmakaraka.meaning + '** This is the central thread of your existence. Looking back, you will see it has been present in every chapter — in your choices, your struggles, and your moments of deepest satisfaction.\n\n';

  // Epilogue — honest, not just positive
  s += '### Epilogue — The Honest Truth\n\n';
  s += name + ', your chart shows both extraordinary gifts and real struggles. The same nakshatra that gives you creative brilliance also brings perfectionism\'s suffering. The same lagna that gives you resilience also brings stubbornness in the wrong moments. The same Venus that gives you capacity for deep love makes heartbreak sharper.\n\n';
  s += '**This is the contract you signed at birth.** Not as punishment — as curriculum. Every planet that challenges you is a teacher you chose before you arrived. Every difficult dasha is a corridor toward a more honest version of yourself.\n\n';
  s += 'The Vedic tradition ends its teachings not with a solution but with a question: **"Ko aham?"** — Who am I? The stars point. You walk. The journey is the answer.\n\n';
  s += '*⚠️ For entertainment & informational purposes only. Consult a professional astrologer for personal guidance.*\n\n';

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
  vedicSystem: 'parashari' | 'kp' | 'jaimini' | 'lal_kitab';
  tradition: 'vedic' | 'western' | 'chinese' | 'egyptian' | 'mayan' | 'all';
  language: string;
}

export interface FullReading {
  name: string;
  dob: string;
  birthCity: string;
  currentCity: string;
  currentLat: number;
  currentLng: number;
  gender: string;
  tradition: 'vedic' | 'western' | 'chinese' | 'egyptian' | 'mayan' | 'all';
  language: string;
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
  vedicSystem: 'parashari' | 'kp' | 'jaimini' | 'lal_kitab';
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
  chineseZodiac: { animal: string; element: string; yinYang: 'Yin' | 'Yang'; heavenlyStem: string; earthlyBranch: string; luckyColors: string; luckyNumbers: string; compatibility: string; meaning: string; elementMeaning: string };
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
  // User profile pass-through (for AI personalization)
  maritalStatus: string;
  employment: string;
  concern: string;
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
  // Convert local birth time to UT using birth longitude (≈15° per hour)
  // This fixes the Lagna/Ascendant calculation — without this, a birth at 06:30 IST (+5:30)
  // would be treated as 06:30 UT, shifting the Ascendant by ~82° (5.5 hrs × 15°/hr)
  const localHour = hour + minute / 60;
  const utcOffsetHours = input.birthLng / 15; // longitude → UTC offset (fractional hours)
  const fractionalHour = localHour - utcOffsetHours; // local time → UT

  // Julian Day & centuries
  const jd = julianDay(year, month, day, fractionalHour);
  const T = julianCenturies(jd);

  // Construct UTC Date for astronomy-engine (true geocentric positions)
  // fractionalHour may be negative (e.g. IST 01:00 = UT -4:30 = previous day 19:30)
  // Using JD→Date conversion to handle day rollover correctly
  const birthDateUTC = new Date((jd - 2440587.5) * 86400000);

  // Ayanamsa (lahiriAyanamsa takes a year number)
  const ayanamsa = lahiriAyanamsa(year);

  // Sun — true geocentric position via astronomy-engine
  const sunTropical = Astro.SunPosition(birthDateUTC).elon;
  const sunSidereal = toSidereal(sunTropical, ayanamsa);
  const sunRashi = Math.floor(sunSidereal / 30) % 12;
  // Sign labels depend on tradition: western uses tropical zodiac names, vedic uses sidereal rashis
  const isWestern = input.tradition === 'western';
  const sunSign = isWestern ? WESTERN_SIGNS[sunRashi] : VEDIC_RASHIS[sunRashi];

  // Moon — true geocentric position via astronomy-engine
  const moonTropical = Astro.EclipticGeoMoon(birthDateUTC).lon;
  const moonSidereal = toSidereal(moonTropical, ayanamsa);
  const moonRashi = Math.floor(moonSidereal / 30) % 12;
  const moonSign = isWestern ? WESTERN_SIGNS[moonRashi] : VEDIC_RASHIS[moonRashi];
  const NAKSHATRA_SPAN = 360 / 27;
  const moonNakshatra = Math.floor(moonSidereal / NAKSHATRA_SPAN) % 27;
  const moonNakshatraName = NAKSHATRAS[moonNakshatra];
  const nakshatraDeg = moonSidereal % NAKSHATRA_SPAN;
  const moonNakshatraPada = Math.min(Math.floor(nakshatraDeg / (360 / 108)) + 1, 4);

  // Lagna (calculateLagna takes jd, T, lat, lng, ayanamsa)
  const lagnaLong = calculateLagna(jd, T, input.birthLat, input.birthLng, ayanamsa);
  const lagnaRashi = Math.floor(lagnaLong / 30) % 12;
  const lagnaSign = isWestern ? WESTERN_SIGNS[lagnaRashi] : VEDIC_RASHIS[lagnaRashi];

  // Planets — true geocentric positions via astronomy-engine (VSOP87 theory)
  const planets = calculatePlanetPositions(T, sunTropical, ayanamsa, lagnaRashi, birthDateUTC);

  // Panchanga (calculatePanchanga takes sunSidereal, moonSidereal, jd)
  const panchanga = calculatePanchanga(sunSidereal, moonSidereal, jd);

  // Dasha (calculateDashaTimeline takes moonSidereal, birthYear)
  const dashaTimeline = calculateDashaTimeline(moonSidereal, year);
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - year;
  let currentDasha = '';
  let currentAntardasha = '';
  for (const d of dashaTimeline) {
    // Match by calendar year bracket (avoids float age drift and double-planet ambiguity)
    if (currentYear >= d.startYear && currentYear <= d.endYear) {
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
  // getChineseZodiac takes birth year/month/day
  const chineseZodiac = getChineseZodiac(year, month, day);

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
  const storyNarrative = generateStoryNarrative(input.name, lagnaSign, moonSign, moonNakshatraName, atmakaraka, planets, dashaTimeline, year, manglik, sadeSati);
  const storyEvents = generateStoryEvents(year, dashaTimeline, lagnaSign);

  return {
    name: input.name,
    dob: input.dob,
    birthCity: input.birthCity,
    currentCity: input.currentCity,
    currentLat: input.currentLat,
    currentLng: input.currentLng,
    gender: input.gender,
    tradition: input.tradition ?? 'all',
    language: input.language ?? 'en',
    vedicSystem: input.vedicSystem ?? 'parashari',
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
    chineseZodiac,
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
    maritalStatus: input.maritalStatus ?? '',
    employment: input.employment ?? '',
    concern: input.concern ?? '',
  };
}
