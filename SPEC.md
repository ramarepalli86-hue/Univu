# UNIVU — Complete Application Specification (Last updated: April 14, 2026)

## PROJECT INFO
- **Path:** `/Users/ramgopesharepalli/Desktop/Univu/`
- **Live:** https://univu.vercel.app
- **GitHub:** `ramarepalli86-hue/univu` (private, credentials in ~/.git-credentials)
- **Stack:** Next.js 14, React 18, TypeScript 5.4, Tailwind 3.4, Framer Motion 11, Three.js (vanilla), react-icons 5
- **i18n:** 19 languages (en, te, hi, zh, es, fr, de, it, pt, ru, ta, kn, ml, mr, gu, pa, bn, or, as)
- **AI backend:** 3-tier fallback — Gemini 2.5 Flash (primary, free) → Cerebras llama3.1-8b (secondary, free) → Groq llama-3.3-70b-versatile (tertiary, $0.59/M tokens)
- **Deploy:** Vercel free tier
- **Machine:** MacBook Air Apple Silicon, zsh, Node v25.8.2
- **Build:** `npx next build`
- **Deploy:** `npx vercel --yes --prod`
- **Git:** `git add -A && git commit -m "msg" && git push origin main`
- **RULE:** Commit every 3-5 minutes. Build after every major change. Never let work pile up.

---

## 1. ASTROLOGY ENGINE — `src/lib/astrology.ts` (~2060 lines)

### How It Works
The user enters their **Date of Birth, Time of Birth, and Place of Birth** via the intake form.
The engine computes all astrological data dynamically for that specific user — no hardcoded results.

**All readings are generated dynamically per user input. No data is stored or shared.**

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
- Sun sidereal longitude = (L0 + C) - Ayanamsa
- **Sun Rashi** = floor(sidereal_sun / 30) → index 0-11

### C. Moon Position (determines Rashi and Nakshatra)
- Moon mean longitude L' = 218.3165 + 481267.8813 × T
- Corrections: Evection, Annual equation, Equation of center, A4 correction
- Moon sidereal longitude = Moon_tropical - Ayanamsa
- **Moon Rashi** = floor(sidereal_moon / 30) → 0-11
- **Nakshatra** = floor(sidereal_moon / 13.3333) → 0-26
- **Nakshatra Pada** = floor((sidereal_moon % 13.3333) / 3.3333) + 1 → pada 1-4

### D. Ascendant (Lagna) — requires time of birth + birthplace coordinates
- Greenwich Sidereal Time → Local Sidereal Time → RAMC → Lagna formula
- Lagna sidereal = RAMC-based atan2 computation - Ayanamsa
- **Lagna Rashi** = floor(sidereal_lagna / 30)
- All 12 houses start from Lagna rashi (equal house system)

### E. Navagraha (9 Planet) Positions

| Planet | Formula base | Period |
|--------|-------------|--------|
| Sun | 280.466 + 36000.770 × T | 1 year |
| Moon | 218.317 + 481267.881 × T | 27.3 days |
| Mercury | 252.251 + 149472.675 × T | 88 days |
| Venus | 181.980 + 58517.816 × T | 225 days |
| Mars | 355.433 + 19140.299 × T | 687 days |
| Jupiter | 34.351 + 3034.906 × T | 11.86 years |
| Saturn | 50.077 + 1222.114 × T | 29.46 years |
| Rahu (North Node) | 125.045 - 1934.136 × T | 18.6 years |
| Ketu (South Node) | Rahu + 180° | 18.6 years |

### F. Tithi (Lunar Day)
```
Tithi_number = floor((Moon_longitude - Sun_longitude) / 12) + 1 (1-30)
```
Tithis 1-15 = Shukla Paksha (waxing), 16-30 = Krishna Paksha (waning)

### G. Yoga (Sun + Moon combination)
```
Yoga_index = floor((Sun_sidereal + Moon_sidereal) / 13.3333) (0-26)
```
27 Yogas: Vishkambha through Vaidhriti

### H. Karana (Half-Tithi)
```
Karana_index = floor(Angular_difference / 6) cycling through 11 karanas
```

### I. Vimshottari Dasha System
Based on Moon's nakshatra at birth. Total cycle = 120 years.
Sequence: Ketu(7) → Venus(20) → Sun(6) → Moon(10) → Mars(7) → Rahu(18) → Jupiter(16) → Saturn(19) → Mercury(17)
Generates Mahadasha + Antardasha timeline from birth to 80+.

### J. Manglik (Kuja Dosha) Check
Mars in houses 1, 2, 4, 7, 8, or 12 from Lagna OR from Moon sign = Manglik.
Checked via `checkManglik(planets, moonRashiIdx)` — returns `{ isManglik, fromLagna, fromMoon, details, cancellations }`.

### K. Sade Sati Check
Saturn in 12th, 1st, or 2nd house from natal Moon.
Checked via `checkSadeSati(saturnRashiIdx, moonRashiIdx)` — returns `{ isActive, phase, details }`.

### L. Egyptian Decan Analysis
36 decans (12 signs × 3 decans of 10° each). Each decan: ruling planet (Chaldean order), Egyptian deity, personality traits.
Computed via `getEgyptianDecan(sunSiderealDegree)`.

### M. Mayan Tzolkin Calendar
260-day cycle (20 day signs × 13 tones). Based on Julian Day Number offset.
Computed via `getMayanTzolkin(jd)` → `{ daySign, tone, meaning }`.

### N. Chinese Zodiac
Based on lunar year (Chinese New Year boundary). Returns animal, element (5-year cycle), yin/yang, heavenly stem, earthly branch, lucky colors/numbers, compatibility, meanings.
Computed via `getChineseZodiac(year, month, day)`.

### O. Atmakaraka
Planet with highest degree in any sign (among Sun through Saturn, excluding Rahu/Ketu).
Returns `{ planet, degree, meaning }`.

### P. Report Generation Functions (all in astrology.ts)
- `generatePersonalityReport(params)` — Lagna, Moon, nakshatra, gana/guna, Western sun sign (~1000+ words)
- `generateHouseAnalysis(params)` — All 12 houses, signs, planets, lords (~1500+ words)
- `generateLifeTimeline(params)` — Decade-by-decade with dashas (~1000+ words)
- `generateLoveReport(params)` — 7th house deep dive, Manglik, Ashta Koota, marital-status-aware (~1200+ words)
- `generateCareerReport(params)` — 10th house, Dhana yogas, employment-status-aware (~1000+ words)
- `generateHealthReport(params)` — Zodiac-body mapping, 6th/8th houses (~1000+ words)
- `generateSpiritualReport(params)` — 9th/12th house, Atmakaraka, Rahu-Ketu axis (~1000+ words)
- `generateEgyptianReport(params)` — Decan traits, historical context (~500+ words)
- `generateMayanReport(params)` — Tzolkin meaning, life energy (~400+ words)
- `generateHistoricalPatterns(nakshatra)` — 3-5 famous people same nakshatra
- `generateRemedies(params)` — Lal Kitab + classical remedies
- `generateStoryNarrative(params)` — Prose life narrative for StoryAnimator

---

## 2. `FullReading` INTERFACE — `src/lib/astrology.ts`

```typescript
export interface FullReading {
  // Identity
  name: string;
  dob: string;
  birthCity: string;
  currentCity: string;
  gender: string;
  tradition: 'vedic' | 'western' | 'chinese' | 'egyptian' | 'mayan' | 'all';
  language: string;               // ISO code e.g. 'en', 'hi', 'te'

  // Chart positions
  lagnaRashi: number;             // 0-11
  lagnaSign: string;              // e.g. "Aries (Mesha)"
  moonRashi: number;
  moonSign: string;
  sunRashi: number;
  sunSign: string;
  moonNakshatra: number;          // 0-26
  moonNakshatraName: string;
  moonNakshatraPada: number;      // 1-4
  planets: PlanetPosition[];
  chartType: 'north' | 'south';

  // Five limbs
  panchanga: Panchanga;           // tithi, nakshatra, yoga, karana, vara

  // Dasha timeline
  dashaTimeline: DashaPeriod[];
  currentDasha: string;
  currentAntardasha: string;

  // Special indicators
  manglik: ManglikStatus;
  sadeSati: SadeSatiStatus;
  atmakaraka: { planet: string; degree: number; meaning: string };

  // Traditions
  westernSunSign: string;
  egyptianDecan: { sign, decanNumber, ruler, deity, traits };
  mayanTzolkin: { daySign, tone, meaning };
  chineseZodiac: { animal, element, yinYang, heavenlyStem, earthlyBranch,
                   luckyColors, luckyNumbers, compatibility, meaning, elementMeaning };

  // Static reports (generated by astrology.ts, 500-1500 words each)
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

  // Story
  storyNarrative: string;
  storyEvents: StoryEvent[];

  // User profile pass-through (AI personalization)
  maritalStatus: string;
  employment: string;
  concern: string;
}
```

> **Note:** `isUnderage` field removed — age gate removed in April 2026 (see §3 below).

---

## 3. INTAKE FORM — `src/components/IntakeForm.tsx`

### Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | text | Yes | placeholder: "e.g. Arjun Mehta" |
| Date of Birth | date picker | Yes | max = today |
| Time of Birth | time picker | No | "Check birth certificate" hint. Improves Lagna precision |
| Place of Birth | CityAutocomplete | Yes | Uses `src/lib/cities.ts` database |
| Current Location | CityAutocomplete | Yes | Smart autocomplete dropdown |
| Gender | chip toggle: Male / Female / Non-binary / They/Them / Prefer not to say | Yes | |
| Marital Status | chip toggle: Single / Married / Divorced / Widowed | Yes | |
| Employment | chip toggle: Employed / Self-employed / Student / Unemployed / Retired | Yes | |
| Astrology Tradition | card toggle: 🌍 All / 🕉️ Vedic / ♈ Western / ☯️ Chinese / 𓂀 Egyptian / ☀️ Mayan | Yes | |
| Primary Concern | textarea | Yes | placeholder: career growth, relationships, health... |
| Language | LanguageSelector dropdown | Yes | 19 languages, visible in form |
| Consent | checkbox | Yes | "I am 18+ or a parent/guardian — entertainment purposes only" |

### Age Policy (updated April 2026)
- **No age gate or minimum age restriction.** Any date of birth is accepted.
- If age < 18: shows a small note "If you are under 18, please have a parent or guardian present."
- `isUnderage` field has been removed from `FullReading`.

### Marital + Employment Context
- `maritalStatus` and `employment` are passed through to the AI prompts so sections adapt:
  - Love section: timing for singles, phase analysis for married, recovery for divorced
  - Career section: growth for employed, opportunities for unemployed, business for self-employed, etc.

---

## 4. API ROUTES

### `src/app/api/reading/route.ts` (74 lines)
Accepts POST body:
```
name, dob, timeOfBirth, birthLat, birthLng, birthCity, currentLat, currentLng, currentCity,
gender, maritalStatus, employment, concern, chartType, tradition, language
```
Runs `generateFullReading(input)` from `astrology.ts` and returns the full `FullReading` object as JSON.
All inputs sanitised via `sanitise(value, maxLen)` from `apiGuard.ts`.

### `src/app/api/personal-reading/route.ts` (314 lines)
Accepts POST body: `{ section: string, context: ReadingContext }`

Sections: `overview | love | career | health | timeline | spiritual`

- Anonymises the user's name to `"the Seeker"` before sending to AI (PII protection).
- Returns `{ text: string }` — AI-generated prose, ~700-900 tokens each.
- System prompt rule 1: *"Use ONLY 'the Seeker' — NEVER invent or substitute any other name (e.g. Emily, Alex, Priya, John)."*
- Client-side (ReportCard.tsx): replaces `"the Seeker"` / `"The Seeker"` with the user's real first name before display.
- AI model: Groq `llama-3.3-70b-versatile`, max_tokens: 900.

### `src/app/api/enrich-story/route.ts` (193 lines)
Accepts POST body: `{ name, gender, sceneIndex, lagnaSign, moonSign, sunSign, birthYear, currentDasha, planets }`
Returns `{ enriched: string }` — cinematic scene narrative for StoryAnimator.
Same anonymisation + client-side name replacement as personal-reading.

### `src/app/api/chat/route.ts`
CosmicOracle chat endpoint.

### `src/app/api/usage-alert/route.ts`
Budget monitoring.

---

## 5. SECURITY — `src/lib/apiGuard.ts` (122 lines)

All API routes call `apiGuard(req)` first:
- **Rate limiting:** 20 requests/IP/minute → 429 with `Retry-After: 60`
- **Origin check:** Only `univu.vercel.app`, Vercel preview URLs (`.vercel.app`), and `localhost`
- **Input sanitisation:** `sanitise(value, maxLen)` — strips HTML tags, injection chars (`<>'";\`\\`), truncates

### `src/lib/budget.ts` (67 lines)
`budgetGuard()` — daily/monthly spend cap on AI API. Returns 503 when over budget.

### HTTP Security Headers — `next.config.js`
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy`
- API routes: `Cache-Control: no-store`

---

## 6. REPORT UI — `src/components/ReportCard.tsx` (~1030 lines)

### Tabs (8 total)
| # | Tab ID | Label | Content |
|---|--------|-------|---------|
| 1 | `overview` | ✨ Overview | Panchanga (with 11-language localisation), planet table, stat badges, Nakshatra banner (Vedic), Chinese zodiac card, VedicChart/WesternChart preview |
| 2 | `love` | 💞 Love | AI-generated love & marriage reading |
| 3 | `career` | 🏆 Career | AI-generated career & wealth reading |
| 4 | `health` | 🌿 Health | AI-generated health reading |
| 5 | `timeline` | 🗓 Timeline | AI-generated life timeline (decade-by-decade with dashas) |
| 6 | `spiritual` | 🔮 Purpose | AI-generated spiritual & karmic reading |
| 7 | `charts` | 🪐 Charts | Full VedicChart + WesternChart with planet placements, Manglik/Sade Sati badges, Egyptian/Mayan/Chinese tradition cards |
| 8 | `story` | 🎬 Story | StoryAnimator cinematic life scenes |

Tabs 1–6 (AI tabs) use the `AISection` component which fetches from `/api/personal-reading`.

### Disclaimer (added April 2026)
Three locations:
1. **Top of reading** — amber `⚠️ Important Notice` banner: *"For entertainment and informational purposes only. Not professional advice of any kind — medical, psychological, legal, or financial. Consult a qualified professional before making any major life decision."*
2. **After each AI tab result** — small grey one-liner: *"For entertainment & information only · Not professional advice · Consult a qualified professional before making any major life decision"*
3. **Footer** — styled teal-bordered box with full legal text + © year

### Key Sub-components in ReportCard.tsx
- `PersonalText` — renders AI markdown text (bold headings, paragraph formatting)
- `AISection` — fetches AI reading on mount, shows skeleton loader, replaces "the Seeker" → real first name
- `ConcernBanner` — shows user's question in Overview tab
- `ReadingSkeleton` — animated loading placeholder
- `NakshatraBanner` — nakshatra strip (Vedic traditions only)
- `ConcernBanner` — displays the user's primary concern

### Panchanga i18n
11 regional languages have localised Panchanga labels and values:
`hi, te, ta, ml, kn, mr, bn, pa, gu, or, as`

---

## 7. VISUAL BIRTH CHARTS

### `src/components/VedicChart.tsx` — South Indian Square
- 4×4 grid, center 2×2 = label
- Signs FIXED in South Indian style (Pisces top-left, clockwise)
- Planets placed in correct rashi boxes with abbreviations: Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke
- Lagna house highlighted with distinct border

### `src/components/WesternChart.tsx` — Wheel
- SVG circular chart, 12 houses
- Zodiac glyphs (♈♉♊♋♌♍♎♏♐♑♒♓) around outer ring
- Planets placed at computed degree positions
- Aspect lines: conjunction, opposition, trine, square, sextile (±8° orb)

---

## 8. CINEMATIC STORY — `src/components/StoryAnimator.tsx` (~918 lines)

### Architecture
- SVG-based animated scenes (not Three.js — changed due to React 18 compatibility)
- 8 life chapters: Birth, Childhood (0-10), Teens (10-20), Young Adult (20-30), Established (30-40), Midlife (40-50), Later Years (50-60), Elder (60+)
- Each scene: animated character SVG + cinematic background + planet orbital ring + Challenge + Lesson text
- AI enrichment: each scene fetches from `/api/enrich-story` on demand (lazy load)
- Enriched text: `"the Seeker"` replaced with real first name client-side
- Voice narration: Web Speech API (selects appropriate voice per gender/language)
- Scene transitions: Framer Motion `AnimatePresence`

### Scene Data
Built by `buildScenes(name, gender, storyText, storyEvents, lagnaSign, moonSign, sunSign, birthYear, planets)`.
Uses `storyEvents` array from `FullReading` plus static per-age-range configuration.

---

## 9. 3D CELESTIAL INTRO — `src/components/CelestialScene.tsx`

Shown on the landing page while form loads.
Three.js vanilla canvas with animated star field, planet orbits, and glow effects.

---

## 10. COSMIC ORACLE CHAT — `src/components/CosmicOracle.tsx`

Floating chat widget. Sends messages to `/api/chat` with the user's reading context.
Uses the Groq model. Positioned fixed bottom-right, z-index above all other content.

---

## 11. COLOR PALETTE — LUXURY AESTHETIC

### Rules
- **NO PURPLE / VIOLET / LAVENDER anywhere** — explicitly forbidden
- **Saffron is OK** — used as warm accent
- TEAL = `#1A6B6B` (primary brand color — used in code as constant `TEAL`)
- AMBER = `#D4880A` (warning/accent — used in code as constant `AMBER`)

### Active Palette
| Token | Hex | Usage |
|-------|-----|-------|
| TEAL | #1A6B6B | Primary buttons, active tabs, headings, brand color |
| AMBER | #D4880A | Warning banners, disclaimer borders, accent |
| gray-800 | #1F2937 | Body text, headings |
| gray-500 | #6B7280 | Secondary text, subtitles |
| gray-400 | #9CA3AF | Muted text, footer |
| white | #FFFFFF | Card backgrounds |
| warm-50 | #FDFCFB | Page background |
| Amber bg | rgba(212,136,10,0.07) | Disclaimer banner background |
| Teal bg | rgba(26,107,107,0.05) | Footer disclaimer background |

### Component Styles
- **Cards:** White background, subtle border, rounded-2xl, shadow
- **Buttons:** Solid TEAL (#1A6B6B), white text, rounded-xl
- **Tabs:** Active = white pill with TEAL text; inactive = transparent with gray text
- **Disclaimer (top):** Amber-tinted box with `⚠️ Important Notice` header
- **Disclaimer (footer):** Teal-tinted box with full legal text

---

## 12. LANGUAGE SELECTOR

`src/components/LanguageSelector.tsx` — visible in IntakeForm.
`src/i18n/index.ts` exports `LANGUAGES`, `getTranslations()`, `detectLocale()`, `setLocale()`.

19 supported languages:
English, Telugu, Hindi, Chinese, Spanish, French, German, Italian, Portuguese, Russian, Tamil, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Odia, Assamese

UI labels/form headings render in selected language. Report content stays in English (AI-generated).
Panchanga values additionally localised for 11 Indic scripts (hi/te/ta/ml/kn/mr/bn/pa/gu/or/as).

---

## 13. LEGAL & METADATA — `src/app/layout.tsx`

- JSON-LD schema with `"genre": "Entertainment"` and explicit disclaimer
- `<meta name="disclaimer">` machine-readable
- Full OpenGraph + Twitter cards
- `robots.txt` — disallows `/api/`
- `.well-known/security.txt` — responsible disclosure contact

---

## 14. FILE MAP (current)

```
src/
├── app/
│   ├── admin/
│   │   └── dashboard/page.tsx         ← Admin dashboard UI — 4 tabs (Overview, Cost, Usage, Logs)
│   ├── api/
│   │   ├── admin/stats/route.ts       ← Secure GET endpoint for dashboard data
│   │   ├── chat/route.ts              ← CosmicOracle chat + follow-up with chart context
│   │   ├── enrich-story/route.ts      ← Cinematic scene AI enrichment (193 lines)
│   │   ├── personal-reading/route.ts  ← AI tab readings — dasha-first timing
│   │   ├── reading/route.ts           ← Main reading endpoint (74 lines)
│   │   └── usage-alert/route.ts       ← Budget alert webhook
│   ├── maintenance/page.tsx           ← Coming Soon page for production
│   ├── globals.css                    ← Tailwind base styles
│   ├── layout.tsx                     ← Root layout, legal meta, JSON-LD
│   └── page.tsx                       ← Main page: form → report flow
├── components/
│   ├── AgeGate.tsx                    ← (legacy, not currently shown for any age)
│   ├── CelestialScene.tsx             ← Three.js 3D intro scene
│   ├── CityAutocomplete.tsx           ← Smart city search dropdown
│   ├── CosmicOracle.tsx               ← Floating AI chat widget
│   ├── DisclaimerBanner.tsx           ← Top-of-page disclaimer bar
│   ├── IntakeForm.tsx                 ← Full intake form with all fields
│   ├── LanguageSelector.tsx           ← 19-language dropdown
│   ├── Panchangam.tsx                 ← Locale-aware Panchangam (Hindu calendar)
│   ├── ReportCard.tsx                 ← 10-tab report with follow-up chat (~2064 lines)
│   ├── StarField.tsx                  ← Background floating particles
│   ├── StoryAnimator.tsx              ← Cinematic life story (918 lines)
│   ├── VastuFengShui.tsx              ← Vastu & Feng Shui tab with follow-up
│   ├── VedicChart.tsx                 ← South Indian square chart
│   ├── WeeklyForecast.tsx             ← Weekly forecast with follow-up
│   └── WesternChart.tsx               ← Western wheel chart
├── i18n/
│   ├── index.ts                       ← i18n logic
│   └── [19 language].json             ← Translation files
└── lib/
    ├── aiProvider.ts                  ← 3-tier AI fallback + usage tracking instrumentation
    ├── apiGuard.ts                    ← Rate limiting + sanitisation (122 lines)
    ├── astrology.ts                   ← MAIN ENGINE (~2169 lines, astronomy-engine v2.1.19)
    ├── budget.ts                      ← Per-provider cost guard ($100 monthly budget)
    ├── cities.ts                      ← City database with lat/lng
    └── usageTracker.ts                ← Detailed per-request usage tracking (in-memory)
next.config.js                         ← Security headers (CSP, HSTS, etc.)
tailwind.config.js                     ← Theme colors (no purple)
SPEC.md                                ← This file
```

---

## 15. AI PROVIDER SYSTEM — `src/lib/aiProvider.ts`

### 3-Tier Automatic Fallback
```
Gemini 2.5 Flash (primary, free) → Cerebras llama3.1-8b (secondary, free) → Groq llama-3.3-70b (tertiary, $0.59/M)
```

- Each provider tried in order. If one fails (rate limit, network, missing key), next tried automatically.
- `thinkingBudget: 0` on Gemini to disable thinking tokens (they consume 70%+ of maxOutputTokens).
- Lazy singleton clients — instantiated once per warm instance.
- Every `callAI()` call auto-tracks timing, tokens, route label, fallback count, and errors via `usageTracker.ts`.

### Cost Model
| Provider | Model | $/1M tokens | Tier |
|----------|-------|-------------|------|
| Gemini | gemini-2.5-flash | $0.00 | Free |
| Cerebras | llama3.1-8b | $0.00 | Free |
| Groq | llama-3.3-70b-versatile | $0.59 | 100K/day free |

---

## 16. USAGE TRACKER — `src/lib/usageTracker.ts`

In-memory per-request metrics tracker. Resets on cold start / redeploy.

### What It Tracks
- **Per request:** route, provider, tokens, cost, latency, success/fail, fallback count, error message
- **Aggregations:** by provider, by route, hourly buckets (last 48h), monthly totals
- **Budget:** $100/month hard limit, percentage tracking

### API
- `trackRequest(log)` — called by `callAI()` on every provider attempt (success and failure)
- `getDashboardData()` — returns full `DashboardData` object for the admin dashboard

---

## 17. ADMIN DASHBOARD — `/admin/dashboard`

### Access
- **localhost:** auto-allowed (no auth needed)
- **Production:** requires `?secret=ADMIN_SECRET` query param on `/api/admin/stats`

### 4 Tabs
1. **Overview** — Total requests/tokens/cost/success rate, API key status, per-provider cards
2. **Cost** — Budget meter bar, cost by provider table, cost by route table, pricing reference
3. **Usage** — Bar charts (requests by route, tokens by provider, latency by provider), hourly activity histogram, fallback frequency
4. **Logs** — Last 20 requests table, recent errors panel

### Design
- Light warm theme: cream/amber gradient background, white cards, amber accents
- Auto-refreshes every 10 seconds (toggleable)
- No external dependencies — CSS-only bar charts

---

## 18. FOLLOW-UP CHAT SYSTEM

Every reading section has inline follow-up chat. User can ask questions about their specific reading.

### How It Works
1. User generates a reading (any tab)
2. A "Ask a follow-up" input appears below the reading
3. User's question + their full chart context is sent to `/api/chat`
4. The chat API has the user's ACTUAL chart data (all planets, houses, retrograde status, Manglik, Sade Sati, dasha timeline, house lords) so it can give chart-specific answers

### Chart Context Includes
- All 9 planet positions (name, rashi, house, degree, retrograde status)
- House lords for all 12 houses
- Manglik status + cancellations
- Sade Sati phase
- Full Vimshottari Dasha timeline
- User's age, birth year, concern

### Timing Method (Dasha-First, 4-Step)
For any timing question (marriage, career, etc.) for ages 21+:
1. **Step 1:** Identify current Maha Dasha + Antardasha
2. **Step 2:** Scan upcoming antardashas in ~3-year blocks from NOW
3. **Step 3:** Pick the strongest window within 5 years
4. **Step 4:** Only THEN mention next Maha Dasha as secondary

Hard limits: Marriage cap age 45, never predict >7 years without closer window.

---

## 19. PLANET ACCURACY — `astronomy-engine` v2.1.19

### Before (mean longitude formulas)
- ±40-52° errors on outer planets
- Simple `L = L0 + rate × T` equations — no perturbation corrections

### After (VSOP87 via astronomy-engine)
- **Arcsecond-level accuracy** for all planets
- `Astronomy.SunPosition()` for Sun
- `Astronomy.EclipticGeoMoon()` for Moon
- `Astronomy.GeoVector() → Astronomy.Ecliptic()` for Mercury through Saturn
- Rahu/Ketu still use mean node formula (standard practice)
- All positions converted: tropical → sidereal via Lahiri ayanamsa

---

## 20. KNOWN GAPS (not yet built)

| Gap | Detail |
|-----|--------|
| **Personality tab** | No dedicated tab — personality content is embedded in Overview/static reports. Could add as a 9th tab. |
| **Houses tab** | No dedicated 12-house tab — house analysis content generated in `astrology.ts` but not surfaced in its own tab. |
| **Traditions tab** | Egyptian + Mayan + historical patterns shown inside Charts tab area only, not a dedicated tab. |
| **CelestialScene planet accuracy** | Shows decorative orbits, not actual computed sidereal positions |

---

## 16. DEPLOYMENT & WORKFLOW

```bash
# Build
npx next build

# Deploy to production
npx vercel --yes --prod

# Full commit + deploy
git add -A && git commit -m "msg" && git push origin main && npx vercel --yes --prod

# Quick check
npx next build 2>&1 | tail -20
```

**COMMIT AFTER EVERY WORKING STATE. BUILD FREQUENTLY. DEPLOY AFTER EACH MILESTONE.**
