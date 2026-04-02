# UNIVU V2 — Complete Application Specification

## PROJECT INFO
- **Path:** `/Users/ramgopesharepalli/Desktop/Univu/`
- **Live:** https://univu.vercel.app
- **GitHub:** `ramarepalli86-hue/Univu` (private, credentials in ~/.git-credentials)
- **Stack:** Next.js 14, React 18, TypeScript 5.4, Tailwind 3.4, Framer Motion 11, Three.js (vanilla), react-icons 5
- **i18n:** 19 languages (en, te, hi, zh, es, fr, de, it, pt, ru, ta, kn, ml, mr, gu, pa, bn, or, as)
- **Deploy:** Vercel free tier
- **Machine:** MacBook Air Apple Silicon, zsh, Node v25.8.2
- **Build:** `npx next build`
- **Deploy:** `npx vercel --yes --prod`
- **Git:** `git add -A && git commit -m "msg" && git push origin main`
- **RULE:** Commit every 3-5 minutes. Build after every major change. Never let work pile up.

---

## 1. ASTROLOGY ENGINE — `src/lib/astrology.ts` — COMPLETE REWRITE

### Test Case
**DOB 1986-11-28, Time 18:00 (6PM), Birthplace: Vijayawada, AP, India**
Expected results:
- Western Sun Sign: **Sagittarius** (Nov 22 – Dec 21)
- Vedic Sun Rashi: **Vrischika (Scorpio)** — Lahiri ayanamsa ~23°40' for 1986 shifts sidereal back
- Moon Nakshatra: **Chitra** (star #14, spans 23°20' Kanya to 6°40' Tula)
- Moon Rashi: **Kanya (Virgo)** — Chitra's first half falls in Kanya
- Tithi: computed from Sun-Moon angular separation

### A. Lahiri Ayanamsa Calculation
```
Ayanamsa(year) = 23.856° + (year - 2000) × 0.01397°
Sidereal_longitude = Tropical_longitude - Ayanamsa
If result < 0, add 360°
```

### B. Sun Position (tropical → sidereal)
- Julian Day Number from DOB
- T = (JD - 2451545.0) / 36525 (Julian centuries from J2000.0)
- Mean longitude L0 = 280.46646 + 36000.76983 × T + 0.0003032 × T²
- Mean anomaly M = 357.52911 + 35999.05029 × T - 0.0001537 × T²
- Equation of center C = (1.9146 - 0.004817 × T) × sin(M) + (0.019993 - 0.000101 × T) × sin(2M) + 0.00029 × sin(3M)
- Sun true longitude = L0 + C (normalize to 0-360)
- Sun sidereal longitude = Sun_true_longitude - Ayanamsa
- **Sun Rashi** = floor(sidereal_sun / 30) → index 0-11 maps to 12 rashis

### C. Moon Position (determines Rashi and Nakshatra)
- Moon mean longitude L' = 218.3165 + 481267.8813 × T
- Moon mean anomaly M' = 134.9634 + 477198.8676 × T
- Mean elongation D = 297.8502 + 445267.1115 × T
- Corrections:
  - Evection = 1.2739 × sin(2D - M')
  - Annual equation = 0.1858 × sin(M_sun)
  - Correction A3 = 0.37 × sin(M_sun)
  - Corrected anomaly M'c = M' + Evection - Annual_eq - A3
  - Equation of center = 6.2894 × sin(M'c) + 0.214 × sin(2×M'c)
  - Correction A4 = 0.6583 × sin(2(corrected_longitude - Sun_longitude))
  - Final Moon tropical longitude = L' + Evection + Center + A4 - Annual_eq
- Moon sidereal longitude = Moon_tropical - Ayanamsa
- **Moon Rashi** = floor(sidereal_moon / 30) → 0-11
- **Nakshatra** = floor(sidereal_moon / 13.3333) → 0-26
- **Nakshatra Pada** = floor((sidereal_moon % 13.3333) / 3.3333) + 1 → pada 1-4

### D. Ascendant (Lagna) — requires time of birth + birthplace coordinates
- Calculate Greenwich Sidereal Time at 0h UT for the DOB
- Local Sidereal Time = GST + UT_hours × 1.00274 + (longitude_east / 15)
- RAMC = LST × 15 (in degrees)
- Obliquity ε = 23.4393 - 0.0130 × T
- Lagna = atan2(cos(RAMC), -(sin(ε) × tan(latitude) + cos(ε) × sin(RAMC)))
- Convert to 0-360, then to sidereal
- **Lagna Rashi** = floor(sidereal_lagna / 30)
- All 12 houses start from Lagna rashi (equal house system for South Indian)

### E. Navagraha (9 Planet) Positions
Calculate approximate sidereal longitudes for each:

| Planet | Mean Longitude Formula | Period |
|--------|----------------------|--------|
| Sun | 280.466 + 36000.770 × T | 1 year |
| Moon | 218.317 + 481267.881 × T | 27.3 days |
| Mercury | 252.251 + 149472.675 × T | 88 days |
| Venus | 181.980 + 58517.816 × T | 225 days |
| Mars | 355.433 + 19140.299 × T | 687 days |
| Jupiter | 34.351 + 3034.906 × T | 11.86 years |
| Saturn | 50.077 + 1222.114 × T | 29.46 years |
| Rahu (North Node) | 125.045 - 1934.136 × T | 18.6 years |
| Ketu (South Node) | Rahu + 180° | 18.6 years |

Each planet → sidereal sign → house number (relative to Lagna)

### F. Tithi (Lunar Day)
```
Angular_difference = Moon_longitude - Sun_longitude (normalize 0-360)
Tithi_number = floor(Angular_difference / 12) + 1 (1-30)
Tithis 1-15 = Shukla Paksha (waxing): Pratipada, Dwitiya, Tritiya, Chaturthi, Panchami, Shashthi, Saptami, Ashtami, Navami, Dashami, Ekadashi, Dwadashi, Trayodashi, Chaturdashi, Purnima
Tithis 16-30 = Krishna Paksha (waning): same names, ending with Amavasya
```

### G. Yoga (Sun + Moon combination)
```
Sum = Sun_sidereal + Moon_sidereal (normalize 0-360)
Yoga_index = floor(Sum / 13.3333) (0-26)
```
27 Yogas: Vishkambha, Preeti, Ayushman, Saubhagya, Shobhana, Atiganda, Sukarma, Dhriti, Shoola, Ganda, Vriddhi, Dhruva, Vyaghata, Harshana, Vajra, Siddhi, Vyatipata, Variyan, Parigha, Shiva, Siddha, Sadhya, Shubha, Shukla, Brahma, Indra, Vaidhriti

### H. Karana (Half-Tithi)
```
Karana_index = floor(Angular_difference / 6) (0-59, but cycles through 11 karanas)
```
11 Karanas: Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (Bhadra), Shakuni, Chatushpada, Naga, Kimstughna

### I. Vimshottari Dasha System
Based on Moon's nakshatra at birth. Each nakshatra ruled by a planet:

| Nakshatra | Ruler | Dasha Years |
|-----------|-------|------------|
| Ashwini, Magha, Moola | Ketu | 7 |
| Bharani, P.Phalguni, P.Ashadha | Venus | 20 |
| Krittika, U.Phalguni, U.Ashadha | Sun | 6 |
| Rohini, Hasta, Shravana | Moon | 10 |
| Mrigashira, Chitra, Dhanishta | Mars | 7 |
| Ardra, Swati, Shatabhisha | Rahu | 18 |
| Punarvasu, Vishakha, P.Bhadrapada | Jupiter | 16 |
| Pushya, Anuradha, U.Bhadrapada | Saturn | 19 |
| Ashlesha, Jyeshtha, Revati | Mercury | 17 |

**Total cycle = 120 years**

Balance of birth dasha:
```
Nakshatra_span = 13°20' = 13.3333°
Position_within_nakshatra = sidereal_moon % 13.3333
Fraction_remaining = 1 - (position / 13.3333)
Birth_dasha_balance = Fraction_remaining × Total_dasha_years_of_ruler
```

Then sequence through: Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury (repeating)
Starting from the birth nakshatra's ruler, with the remaining balance.

Generate Mahadasha (major period) → Antardasha (sub-period) timeline from birth to age 80+.

### J. Manglik (Kuja Dosha) Check
Mars in houses 1, 2, 4, 7, 8, or 12 from Lagna = Manglik
Also check from Moon sign and Venus sign for partial Manglik
Cancellation conditions: Mars in own sign, Mars aspected by Jupiter, both partners Manglik

### K. Sade Sati Check
Saturn transiting 12th, 1st, or 2nd house from natal Moon = Sade Sati period (~7.5 years)
Calculate current Saturn position and check

---

## 2. DETAILED REPORT CONTENT — EACH SECTION 500-1000+ WORDS

### A. Panchanga Summary
Display: Tithi, Nakshatra (with pada), Yoga, Karana, Vara (day of week)
This is the traditional five-limbed Vedic calendar data for the birth moment.

### B. Planetary Positions Table
All 9 planets with: sidereal longitude (degrees), rashi, house number, nakshatra, retrograde status
Display in both table format and in the visual birth chart

### C. Personality & Character — Lagna Analysis
- Lagna (Ascendant) sign characteristics — physical appearance, temperament, natural disposition
- Lagna lord: which house it sits in and what that means
- Planets in 1st house: each planet's specific effect when placed in Lagna
- Moon sign personality (emotional nature, instinctive reactions)
- Sun sign personality (ego, vitality, father relationship)
- Nakshatra personality: the ruling deity (devata), the animal symbol (yoni pairing), gana classification:
  - **Deva Gana** (divine temperament): Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Revati
  - **Manushya Gana** (human temperament): Bharani, Rohini, Ardra, P.Phalguni, U.Phalguni, P.Ashadha, U.Ashadha, P.Bhadrapada, U.Bhadrapada
  - **Rakshasa Gana** (fierce temperament): Krittika, Ashlesha, Magha, Chitra, Vishakha, Jyeshtha, Moola, Dhanishta, Shatabhisha
- Guna: Sattva (pure/spiritual), Rajas (active/passionate), Tamas (inert/materialistic)
- Reference texts: Brihat Parashara Hora Shastra chapters on Lagna Bhava, Saravali by Kalyana Varma

### D. House-by-House Analysis (Bhava Phala)
For each of the 12 houses, state:
- Which rashi occupies this house
- Which planets (if any) are placed here
- The effect of each planet in this house per classical texts
- The lord of this house and where it sits

**House meanings:**
1. **Tanu Bhava** (Self): body, personality, general health, head
2. **Dhana Bhava** (Wealth): money, family, speech, right eye, food habits
3. **Sahaja Bhava** (Siblings): courage, siblings, short travel, arms/shoulders, communication
4. **Sukha Bhava** (Happiness): mother, home, vehicles, land, chest, emotional peace
5. **Putra Bhava** (Children): children, intelligence, education, romance, stomach, past life merit (Purva Punya)
6. **Ripu Bhava** (Enemies): enemies, disease, debts, service, maternal uncle, intestines
7. **Kalatra Bhava** (Spouse): marriage, partnerships, business partners, lower abdomen
8. **Ayu Bhava** (Longevity): lifespan, sudden events, inheritance, hidden things, reproductive organs, occult
9. **Dharma Bhava** (Fortune): father, guru, religion, long travel, higher education, thighs, luck
10. **Karma Bhava** (Career): profession, fame, government, authority, knees, public reputation
11. **Labha Bhava** (Gains): income, elder siblings, friends, desires fulfilled, ankles/calves
12. **Vyaya Bhava** (Loss): expenses, foreign travel, hospitals, spiritual liberation, feet, isolation, sleep

### E. Life Timeline — Decade by Decade with Dasha Correlation

**Ages 0-10:** Birth dasha effects, childhood health, education beginning, parent dynamics
**Ages 10-20:** Education peak, personality formation, first career thoughts, Jupiter return at ~12
**Ages 20-30:** Career launch, relationships, Saturn return at ~29-30 (major restructuring, reality check, maturity test — happens to everyone)
**Ages 30-40:** Marriage/family consolidation, career growth, Rahu return at ~36 (karmic shift, identity questioning)
**Ages 40-50:** Peak professional years, children's growth, health awareness, Jupiter return at ~48
**Ages 50-60:** Retirement planning, spiritual awakening, Saturn's 2nd return approaching
**Ages 60+:** Saturn 2nd return at ~59, wisdom years, legacy, grandchildren, spiritual deepening

For each decade: state which Mahadasha/Antardasha is running and its specific effects.

### F. Love & Marriage Report — 7th House Deep Dive
- 7th house sign and what kind of partner it attracts
- 7th house lord placement — where it sits determines marriage quality and timing
- Venus placement and aspects — Venus is the natural significator (karaka) of marriage
- Mars in 7th (Manglik Dosha) — check and explain, with cancellation conditions
- 5th house (romance, love affairs before marriage)
- 8th house (longevity of marriage, in-laws)
- Upapada Lagna (UL) = sign as many signs from 12th lord as 12th lord is from 12th — indicates marriage partner qualities
- **Ashta Koota matching characteristics** (not matching with a specific person, but describing what kind of partner is compatible):
  - Varna: spiritual compatibility class (Brahmin/Kshatriya/Vaishya/Shudra based on sign)
  - Vashya: power dynamics in relationship (based on sign animal classification)
  - Tara: destiny compatibility (based on nakshatra count)
  - Yoni: physical/intimate compatibility (14 animal pairs from nakshatras)
  - Graha Maitri: mental compatibility (based on Moon sign lords' friendship)
  - Gana: temperament match (Deva/Manushya/Rakshasa)
  - Bhakoot: emotional compatibility (based on Moon sign distance)
  - Nadi: health/genetic compatibility (Adi/Madhya/Antya based on nakshatra)
- Marriage timing indicators: Jupiter/Venus transiting 7th, 7th lord dasha running
- For married users: analyze current marriage phase based on running dasha
- For divorced users: identify likely astrological factors (6th house conflicts, Saturn/Rahu in 7th, etc.)

### G. Career & Wealth Report — 10th House + Dhana Yogas
- 10th house sign → career industry inclination
- 10th house lord → where professional focus goes
- Planets in 10th → specific career manifestation:
  - **Sun in 10th**: government service, administrative authority, politics, father's business
  - **Moon in 10th**: public-facing career, nursing, hospitality, food industry, frequent job changes
  - **Mars in 10th**: military, police, engineering, surgery, sports, real estate, fire-related
  - **Mercury in 10th**: IT, communication, writing, accounting, trade, teaching, astrology
  - **Jupiter in 10th**: law, education, banking, religious work, counseling, finance
  - **Venus in 10th**: arts, entertainment, fashion, luxury goods, beauty, diplomacy
  - **Saturn in 10th**: slow but steady rise, labor, mining, agriculture, manufacturing, government contractor
  - **Rahu in 10th**: unconventional career, foreign companies, technology, speculation
  - **Ketu in 10th**: spiritual work, research, alternative medicine, detachment from worldly ambition
- **Dhana Yogas** (wealth combinations):
  - 2nd lord + 11th lord conjunction or mutual aspect = strong wealth yoga
  - 5th lord + 9th lord connection = Lakshmi Yoga (fortune)
  - 1st lord + 2nd lord + 11th lord all strong = Dhan Yoga
  - Jupiter in 2nd or 5th or 9th or 11th = natural wealth indicator
- 2nd house (accumulated wealth, bank balance, family wealth)
- 11th house (regular income, gains, fulfillment of desires)
- 12th house (expenses, losses, foreign income)
- Career timing: 10th lord dasha periods bring career peaks

### H. Health Analysis — 6th + 8th House + Sign-Body Mapping
- **Zodiac-Body correlation:**
  - Mesha (Aries) = Head, brain, face
  - Vrishabha (Taurus) = Throat, neck, thyroid
  - Mithuna (Gemini) = Arms, lungs, nervous system
  - Karka (Cancer) = Chest, stomach, breasts
  - Simha (Leo) = Heart, spine, upper back
  - Kanya (Virgo) = Intestines, digestive system
  - Tula (Libra) = Kidneys, lower back, skin
  - Vrischika (Scorpio) = Reproductive organs, bladder
  - Dhanu (Sagittarius) = Thighs, liver, hips
  - Makara (Capricorn) = Knees, bones, joints, teeth
  - Kumbha (Aquarius) = Ankles, calves, circulation
  - Meena (Pisces) = Feet, lymphatic system, immune system
- 6th house planets/sign = chronic health vulnerabilities
- 8th house planets/sign = acute/sudden health events
- Saturn afflicting a house = chronic problems related to that body part
- Mars afflicting = inflammation, surgery, accidents related to that area
- Rahu afflicting = mysterious/hard-to-diagnose conditions
- Ketu afflicting = skin conditions, allergies, spiritual/psychosomatic issues
- Health timing: 6th lord dasha or planets transiting 6th/8th bring health challenges

### I. Spiritual & Dharmic Path — 9th + 12th House
- 9th house (Dharma Bhava): guru influence, father's role, religious inclination, pilgrimage, higher wisdom
- 12th house (Moksha Bhava): spiritual liberation potential, meditation capacity, foreign residence, isolation tendencies
- Ketu's placement: past life karmic imprint — what the soul already mastered
- Rahu's placement: current life karmic direction — what the soul needs to learn
- **Atmakaraka** (planet with highest degree in any sign): the soul's primary desire
  - Sun as AK: desire for recognition, leadership, self-realization
  - Moon as AK: desire for emotional fulfillment, nurturing
  - Mars as AK: desire for strength, courage, competition
  - Mercury as AK: desire for knowledge, communication, skill
  - Jupiter as AK: desire for wisdom, children, dharma
  - Venus as AK: desire for love, beauty, comfort
  - Saturn as AK: desire for discipline, service, detachment
- 5th house (Purva Punya): past life spiritual merit carried forward

### J. Egyptian Decan Analysis
Each zodiac sign = 3 decans of 10° each = 36 total decans
Based on the Dendera zodiac ceiling (Temple of Hathor, ~50 BCE):

**Map the Sun's position to its decan:**
- Aries Decan 1 (0-10°): ruled by Mars — warrior spirit, initiative
- Aries Decan 2 (10-20°): ruled by Sun — leadership, authority
- Aries Decan 3 (20-30°): ruled by Jupiter — wisdom through action
- (similarly for all 12 signs × 3 decans = 36 entries)

Each decan has:
- A ruling planet (Chaldean order: Mars, Sun, Venus, Mercury, Moon, Saturn, Jupiter cycling)
- An associated Egyptian deity
- Specific personality traits from Hellenistic astrology tradition

### K. Mayan Calendar Correlation
- Tzolkin day sign based on DOB (20 day signs × 13 numbers = 260-day cycle)
- 20 Mayan day signs: Imix (Crocodile), Ik (Wind), Akbal (Night), Kan (Seed), Chicchan (Serpent), Cimi (Death), Manik (Deer), Lamat (Star), Muluc (Water), Oc (Dog), Chuen (Monkey), Eb (Grass), Ben (Reed), Ix (Jaguar), Men (Eagle), Cib (Owl), Caban (Earth), Etznab (Flint), Cauac (Storm), Ahau (Sun)
- Calculate: (DOB as Julian Day Number + offset) mod 20 = day sign, mod 13 = tone number
- Each combination has a specific meaning and energy

### L. Comparative Historical Patterns
For each nakshatra, list 3-5 well-known historical/famous persons born under the same star with brief life pattern notes showing how the nakshatra energy manifested in their lives.

Example for Chitra nakshatra: ruled by Mars, deity Tvashtar (celestial architect) — creative builders, designers, people who reshape the world. Famous Chitra natives tend to be artistic, architectural, or transformative figures.

---

## 3. INTAKE FORM — `src/components/IntakeForm.tsx`

### Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | text | Yes | |
| Date of Birth | date picker | Yes | max = today |
| Time of Birth | time picker | No | "Check birth certificate" hint. Improves Lagna precision |
| Place of Birth | CityAutocomplete | Yes | Uses `src/lib/cities.ts` database. Type "Vijayawada" → shows "Vijayawada, AP, India" |
| Current Location | CityAutocomplete | Yes | **Must use autocomplete**, not plain text input |
| Gender | toggle: Male / Female / Other | Yes | |
| Marital Status | toggle: Single / Married / Divorced / Widowed | Yes | **NEW** |
| Employment | toggle: Employed / Unemployed / Student / Self-employed / Retired | Yes | **NEW** |
| Chart System | toggle: Vedic (South Indian) / Western | Yes | |
| Primary Concern | textarea | Yes | |
| Language | LanguageSelector dropdown | Yes | **MUST be visible** — uses `src/components/LanguageSelector.tsx` |
| Consent | checkbox | Yes | Entertainment disclaimer |

- **Age gate: 21 years** — under 21 gets encouraging summary only, no full detailed report
- Marital status and employment feed into the report (e.g., marriage section emphasizes timing for singles, current phase for married, recovery for divorced; career section adjusts for unemployed vs employed)

---

## 4. API ROUTE — `src/app/api/reading/route.ts`

Accept fields: `name, dob, timeOfBirth, birthplace, gender, location, chartType, concern, maritalStatus, employment, language`

Return expanded reading object with ALL sections:
```typescript
interface FullReading {
  name: string;
  isUnderage: boolean;
  panchanga: { tithi, nakshatra, nakshatraPada, yoga, karana, vara };
  planets: Array<{ name, siderealLongitude, rashi, rashiIndex, house, nakshatra, retrograde }>;
  lagna: { rashi, degree, lord };
  vedic: { rashi, nakshatra, summary };
  western: { sunSign, moonSign, rising, summary };
  personality: string;      // 500+ words
  houseAnalysis: string;    // 12-house breakdown
  lifeTimeline: string;     // decade by decade with dashas
  loveReport: string;       // 7th house deep dive, manglik, compatibility traits
  careerReport: string;     // 10th house, dhana yogas
  healthReport: string;     // body mapping, vulnerable areas
  spiritualReport: string;  // 9th/12th house, atmakaraka
  egyptianDecan: string;    // decan analysis
  mayanSign: string;        // Tzolkin correlation
  historicalPatterns: string; // famous people same nakshatra
  dashaTimeline: Array<{ planet, startAge, endAge, effects }>;
  manglikStatus: { isManglik, details };
  sadeSati: { isActive, details };
  story: string;            // life narrative for anime
  storyEvents: Array<{ age, event, type }>; // structured events for video
}
```

---

## 5. REPORT UI — `src/components/ReportCard.tsx`

### Tabs
1. **Overview** — Panchanga, planet table, quick stats, birth chart visual
2. **Personality** — Lagna analysis, nakshatra traits, gana/guna/yoni, Moon+Sun character
3. **Houses** — All 12 houses with planets and interpretations
4. **Life Timeline** — Decade-by-decade predictions with Mahadasha/Antardasha periods, Saturn returns, Jupiter returns, Rahu-Ketu cycles, Sade Sati periods
5. **Love & Marriage** — 7th house, Venus, Manglik check, Ashta Koota compatibility traits, marriage timing, tailored to marital status
6. **Career & Wealth** — 10th house, Dhana yogas, planet-career mapping, tailored to employment status
7. **Health** — Sign-body mapping, vulnerable areas, health timing
8. **Spiritual** — 9th/12th house, Atmakaraka, past life patterns, Rahu-Ketu axis
9. **Traditions** — Egyptian decan, Mayan Tzolkin, historical pattern comparisons
10. **Birth Chart** — Visual Vedic (South Indian square) + Western (wheel) with actual planet placements
11. **Story** — Anime life story video based on reading

Each tab = detailed content, minimum 500 words, drawn from actual astrological rules. Not generic motivation.

---

## 6. VISUAL BIRTH CHARTS

### `src/components/VedicChart.tsx` — South Indian Square
- 4×4 grid, center 2×2 = label
- **Signs are FIXED** in South Indian style (Pisces top-left, clockwise: Ar, Ta, Ge down right column, etc.)
- Place computed planets in their correct rashi boxes
- Highlight Lagna house with distinct border
- Show planet abbreviations: Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke

### `src/components/WesternChart.tsx` — Wheel
- SVG circular chart, 12 houses
- Zodiac glyphs (♈♉♊♋♌♍♎♏♐♑♒♓) around outer ring
- Planet symbols placed at computed degree positions
- Aspect lines: conjunction (0°), opposition (180°), trine (120°), square (90°), sextile (60°) — with orb of ±8°

---

## 7. ANIME LIFE STORY VIDEO — `src/components/StoryAnimator.tsx`

### What the video should show:
A Three.js animated sequence showing the person's life story from birth to old age, based on their astrological reading:

- **Scene 1 — Birth:** Baby born, stars visible, nakshatra constellation highlighted, parents present
- **Scene 2 — Childhood (0-10):** School, playing, personality traits emerging per Lagna sign
- **Scene 3 — Teen years (10-20):** Education, first ambitions per 5th house, Jupiter return growth
- **Scene 4 — Young adult (20-30):** Career launch per 10th house, relationships per 7th house, Saturn return crisis/maturity at 29
- **Scene 5 — Established (30-40):** Marriage scene (IF chart indicates — skip if no strong 7th house), children (IF 5th house indicates), career peak, Rahu return at 36
- **Scene 6 — Midlife (40-50):** Leadership/authority if indicated, wealth accumulation per 2nd/11th house, Jupiter return at 48
- **Scene 7 — Later years (50-60):** Spiritual awakening per 9th/12th house, grandchildren if indicated, legacy building
- **Scene 8 — Elder (60+):** Wisdom, Saturn 2nd return, peaceful scenes

**Key rules:**
- Only show events that the chart actually indicates (if no house ownership, don't show house purchase scene)
- Characters should be **sharp-featured anime style** — defined eyes, structured hair, clean faces
- Use the `storyEvents` array from the reading to determine which scenes to show
- Each scene has a timeline label showing the age range and running Mahadasha
- Background music feeling: warm, cinematic (no actual audio needed, just visual atmosphere)
- Scenes transition with smooth camera movements

### Technical approach:
- Three.js vanilla (React Three Fiber doesn't work with React 18)
- Pre-built scene geometries: simple human figure (head sphere + body cylinder + limb cylinders with anime-style proportions)
- Background scenes: home (box geometry), office (rectangular prisms), temple (dome), nature (plane with texture)
- Use canvas-based text sprites for timeline labels
- Animate with requestAnimationFrame, scene transitions every ~5 seconds

---

## 8. 3D CELESTIAL SCENE — `src/components/CelestialScene.tsx`

Already exists. Enhance to:
- Show planets at their **actual computed sidereal positions** (not decorative random orbits)
- Scale orbits proportionally
- Label each planet
- Highlight the user's Sun sign constellation area

---

## 9. COLOR PALETTE — LUXURY AESTHETIC

### Rules:
- **NO PURPLE / VIOLET / LAVENDER anywhere** — user explicitly hates it
- **Saffron is OK** and should be used as warm accent
- App name "Univu" = ONE consistent color everywhere, not rainbow/gradient

### Palette:
| Token | Hex | Usage |
|-------|-----|-------|
| navy-900 | #0C1B33 | Headings, primary text emphasis |
| navy-700 | #1B3A5C | Section headers |
| teal-700 | #0F4444 | Primary buttons, app name |
| teal-500 | #2E7D7D | Button hover, links |
| teal-100 | #D5E8E8 | Light highlights |
| gold-500 | #C9A84C | Accent borders, premium elements |
| gold-300 | #E2C97E | Lighter gold accents |
| copper-500 | #B87333 | Warm accents, chart elements |
| copper-200 | #D4A574 | Light copper |
| saffron-500 | #F97316 | Warm highlights, active states |
| saffron-100 | #FFEDD5 | Light saffron backgrounds |
| white | #FFFFFF | Card backgrounds |
| warm-50 | #FDFCFB | Page background |
| warm-100 | #F9F6F2 | Section backgrounds |
| gray-800 | #1F2937 | Body text |
| gray-500 | #6B7280 | Secondary text |
| gray-200 | #E5E7EB | Borders |

### Component Styles:
- **Cards:** White background, 1px gray-200 border, subtle shadow, rounded-2xl
- **Buttons:** Solid teal-700, white text, rounded-xl, hover → teal-500
- **Input fields:** White bg, gray-200 border, teal focus ring
- **Tabs:** White active tab on warm-100 background bar
- **Charts:** Copper borders and labels on warm-50 background
- **Disclaimer:** Small saffron-50 bar, single line, dismissible — NOT a giant red screaming banner
- **Must look premium on mobile** — proper padding, readable fonts, no overflow

---

## 10. LANGUAGE SELECTOR — MUST BE VISIBLE

The LanguageSelector component exists at `src/components/LanguageSelector.tsx`.
It uses `src/i18n/index.ts` which exports `LANGUAGES`, `getTranslations()`, `detectLocale()`, `setLocale()`.

**It MUST appear in the IntakeForm**, not hidden. The 19 supported languages:
English, Telugu, Hindi, Chinese, Spanish, French, German, Italian, Portuguese, Russian, Tamil, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Odia, Assamese

The report content stays in English (generated by engine) but UI labels, form labels, section headings render in the selected language from the JSON translation files.

---

## 11. FILE MAP

```
src/
├── app/
│   ├── api/reading/route.ts    ← API endpoint (update to accept all fields)
│   ├── globals.css             ← Tailwind component classes (luxury colors)
│   ├── layout.tsx              ← Root layout with Google Fonts
│   └── page.tsx                ← Main page (form → report flow)
├── components/
│   ├── AgeGate.tsx             ← Underage overlay (age 21)
│   ├── CelestialScene.tsx      ← Three.js 3D planet scene
│   ├── CityAutocomplete.tsx    ← Smart city search dropdown
│   ├── DisclaimerBanner.tsx    ← Small top disclaimer bar
│   ├── IntakeForm.tsx          ← Form with all fields
│   ├── LanguageSelector.tsx    ← Language dropdown
│   ├── ReportCard.tsx          ← Tabbed report display
│   ├── StarField.tsx           ← Background floating particles
│   ├── StoryAnimator.tsx       ← Anime life story video
│   ├── VedicChart.tsx          ← South Indian square chart
│   └── WesternChart.tsx        ← Western wheel chart
├── i18n/
│   ├── index.ts                ← i18n logic
│   └── [19 language].json      ← Translation files
└── lib/
    ├── astrology.ts            ← MAIN ENGINE (complete rewrite)
    └── cities.ts               ← City database with lat/lng
tailwind.config.js              ← Theme colors (no purple)
SPEC.md                         ← This file
```

---

## 12. EXECUTION ORDER

1. **Rewrite `src/lib/astrology.ts`** with correct Vedic math (Sections 1A through 1K above) → commit
2. **Update `IntakeForm.tsx`** — add marital/employment fields, restore language selector, ensure both city fields use CityAutocomplete → commit
3. **Update `src/app/api/reading/route.ts`** — accept all new fields, return full reading object → commit
4. **`npx next build`** — fix any errors → commit & deploy
5. **Rewrite `ReportCard.tsx`** — 11 tabs with full detailed content → commit
6. **Update `VedicChart.tsx` + `WesternChart.tsx`** — show actual computed planet positions → commit
7. **Build & deploy** → `npx next build && npx vercel --yes --prod`
8. **Rewrite colors** in `tailwind.config.js` + `globals.css` + all components → commit & deploy
9. **Build `StoryAnimator.tsx`** — Three.js anime life scenes based on storyEvents array → commit & deploy
10. **Polish & final deploy**

**COMMIT AFTER EVERY WORKING STATE. BUILD FREQUENTLY. DEPLOY AFTER EACH MILESTONE.**
