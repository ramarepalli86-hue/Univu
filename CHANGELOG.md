# Univu — Changelog

> All changes across the ~36-hour build sprint: **Apr 2–4, 2026**

---

## [Apr 4, 2026] — Maintenance & Local Dev

### `91466d3` · chore: lock prod in maintenance
- Added clear launch instructions inside `middleware.ts` as comments
- Documents the exact 3-step process to go live when ready

### `1737ab8` · fix: hardcode MAINTENANCE=true, exempt localhost
- Switched from env-var approach to hardcoded `const MAINTENANCE = true`
- `localhost` and `127.0.0.1` are always exempt — dev works normally
- Prod (`univu.vercel.app`) always shows Coming Soon page

### `7111975` · fix: use server-side MAINTENANCE_MODE for edge middleware
- Switched from `NEXT_PUBLIC_` prefix (baked at build time) to unprefixed env var
- Edge middleware can't read `NEXT_PUBLIC_` at runtime — this was the bug

### `4097a6c` · chore: initial maintenance mode setup
- Created `/src/app/maintenance/page.tsx` — branded Coming Soon page
- Created `/src/middleware.ts` — redirects prod visitors to `/maintenance`
- Added `.env.production` with `MAINTENANCE_MODE=true`

---

## [Apr 3–4, 2026] — Language & Panchangam

### `8e12f3d` · fix: language selector always visible
- Moved `LanguageSelector` from inside `IntakeForm` to the top-level page header
- Now visible on both the Astrology tab and the Panchangam tab
- Removed duplicate import from `IntakeForm.tsx`

### `2091324` · feat: full locale-aware Panchangam
- Complete rewrite of `Panchangam.tsx` — all hardcoded Telugu text replaced
- Added per-locale lookup maps: `SAMVATSARA_NAMES`, `MASA_NAMES`, `TITHI_NAMES`,
  `YOGA_NAMES`, `KARANA_NAMES`, `VARA_NAMES`, `PAKSHA_LABELS`, `ANGA_LABELS`
- Supports: Telugu · Tamil · Malayalam · Kannada · Hindi · English fallback
- Tamil uses solar calendar months (சித்திரை / Chittirai etc.)
- `computeTodayPanchang(locale)` takes locale param, returns localised strings
- Hero header title switches script based on language

### `4071b22` · fix: restore Panchangam.tsx, clean up hero subtitle
- Restored accidentally overwritten Panchangam component
- Removed hardcoded "Panchangam" label from hero subtitle

### `d2be714` · fix: remove Telugu-specific references from hero
- Hero subtitle now language-agnostic

### `ae5d7da` · fix: Panchangam button label localises
- Nav tab button shows पंचांग / పంచాంగం / பஞ்சாங்கம் etc. based on selected language

### `ac4e7d5` · fix: full Panchanga localisation
- Regional title, Yoga & Karana names in native script
- All five Angas (Tithi, Vara, Nakshatra, Yoga, Karana) localised

### `c92b9ce` · feat: Vedic system selector + chart layout + gender
- Added Vedic system selector: Parashari / KP System / Jaimini / Lal Kitab
- Chart layout toggle: North Indian 🔷 / South Indian 🔶
- Gender options simplified: Male / Female / Other (removed verbose labels)
- Nav tab labels renamed for clarity

---

## [Apr 3, 2026] — Language, Security & Privacy

### `b31ec65` · feat: live language selector on report
- Language dropdown on the reading report — Panchanga script switches instantly

### `56c4bf5` · docs: rewrite SPEC.md
- Full rewrite to reflect actual codebase state (April 2026)
- Documents all 5 traditions, API routes, components, security model

### `70af8b0` · fix: replace AI-hallucinated names
- AI was generating placeholder names (Emily, Alex) instead of user's real name
- Fixed prompt to always inject anonymised token mapped back to real name

### `2a67df5` · legal: prominent disclaimer on reading output
- Bold disclaimer added at top of every reading: "For entertainment only"
- "Consult a qualified professional" call-out on all AI-generated sections

### `7e2f2c1` · security: headers, rate limiting, input sanitisation
- Added `apiGuard.ts` — per-IP rate limiting (20 req/min), origin check, size limit
- HTTP security headers: CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy
- Input sanitisation: strips HTML tags and injection characters on all API inputs
- Legal meta tags + JSON-LD schema markup added to `layout.tsx`

### `f5fb13b` · feat: 18+ checkbox + Panchanga in chosen language
- Removed hard age gate — replaced with 18+ consent checkbox on the form
- "I am 18 or older, or a parent/guardian" wording
- Panchanga now renders in the user's chosen language from the start

### `4749f86` · feat: Chinese zodiac card + all 5 traditions
- Chinese zodiac animal, element, and personality card added to report
- Full tradition-aware rendering: Vedic · Western · Chinese · Egyptian · Mayan
- Each tradition only renders its relevant cards

### `01f0b69` · privacy: name anonymisation + PII disclosure
- User's name is replaced with a random token before being sent to AI
- Token is mapped back to real name in the final output
- Added Privacy & Data Notice panel in the form listing exactly what is/isn't sent to AI
- Removed "current location" field — birth city is sufficient

---

## [Apr 3, 2026] — Panchangam Feature Launch

### `d7d3f31` · feat: Panchangam as standalone nav section
- Panchangam accessible directly from home nav — no birth data required
- Added tab-based navigation: 🔮 My Astrology Reading | 🪔 Panchangam

### `cfc9629` · feat: Telugu Panchangam tab (initial)
- First version of Panchangam component
- Shows today's Tithi, Vara, Nakshatra, Yoga, Karana
- Muhurtham guide and auspicious activity list

---

## [Apr 3, 2026] — Report & UX Polish

### `25cbeae` · feat: 3D gender-aware characters + health cards
- Story scene uses gender-aware 3D SVG characters
- Added health section: food recommendations + exercise guidance
- Disclaimer auto-dismisses after 6 seconds

### `66eb43e` · fix: dasha timing + marriage age guardrail
- Dasha year matching now uses calendar year brackets (not just birth year)
- Marriage timing prediction: guardrailed to not predict below age 18

### `3777baf` · fix: smaller nakshatra banner + API key refresh
- Nakshatra strip resized — was too large on mobile
- Refreshed Groq API key

### `61dd444` · fix: gender pronouns + UI sizing
- Gender pronouns (he/she/they) used correctly throughout AI output
- Story scene height fixed
- Nakshatra strip size reduced further
- CosmicOracle chat button z-index fixed (was hiding behind report cards)

### `59f6a7d` · feat: deep personalised planet cards + CosmicOracle
- Planet-in-sign cards with personalised AI interpretation
- Egyptian decan cards and Mayan day-sign cards added
- Component renamed from AstroChat → CosmicOracle

### `e518a90` · feat: feedback widget
- Star rating (1–5) + optional comment field below each reading
- Submits to Formspree endpoint (fire-and-forget, no account needed)

### `446d65b` · feat: budget kill-switch + AI chat
- Hard budget kill-switch: shuts down AI calls at $100/month
- `FORCE_SHUTDOWN` env var for manual override
- Interactive AI astrology chat (CosmicOracle) always visible on page

### `21a61bf` · fix: concern banner + expanded tradition cards
- User's concern/question shown on the overview card
- Egyptian, Mayan, and Nakshatra cards expanded with more detail
- Planet-in-house meanings added to Vedic section

---

## [Apr 2–3, 2026] — Core Reading Engine

### `2dcd49b` · feat: timing predictions
- "When will X happen?" predictions for marriage / career / health / purpose
- Clickable site link in footer

### `8e3cdaa` · feat: nakshatra banner + story cards
- Nakshatra banner replaces 3D animated scene (lighter, faster)
- Story challenge/lesson cards added to narrative section
- AI prompts sharpened to 800 tokens for higher quality output

### `64bb7fd` · feat: AI-personalised report sections
- New `/api/personal-reading` route
- Separate AI calls for: Love · Career · Health · Timeline · Spiritual · Overview
- Each section rendered as its own card with icon

### `2454d8d` · fix: lagna timezone + honest story + theme
- Lagna calculation fixed for UTC timezone offset
- Story/Dasha narrative made more honest and less generic
- Warm amber background introduced
- Gradient UNIVU wordmark logo added

### `9dbc4d9` · fix: live city search + GPS
- City autocomplete uses live Nominatim (OpenStreetMap) API — global coverage
- GPS lat/lng correctly passed to astrology engine

### `e403ddc` · fix: DOB state + wordmark logo
- Date of birth internal state bug fixed (was resetting on re-render)
- Graphic UNIVU wordmark logo finalised

---

## [Apr 2, 2026] — Foundation

### `8c22d6e` · 🌟 Phase 9: Teal-amber theme
- Final teal (`#1A6B6B`) + amber (`#D4880A`) colour system locked in
- Tradition selector (All / Vedic / Western / Chinese / Egyptian / Mayan)
- GPS location support
- Mobile-friendly layout

### `7017a68` · 🎨 Phase 6: Luxury pearl + maroon-gold-teal theme
- Premium visual design iteration

### `686d30f` · 🎨 Phase 5: Dark cosmic gold theme
- DOB and birth time dropdown pickers introduced

### `9219508` · 💰 Cost alert system
- Logs AI API usage, sends alert at 80% of monthly budget

### `ca18348` · 🔑 Groq API key env var pattern
- `Grok_Univu_Key` env var (scalable naming for future keys)

### `aa80046` · 🔧 Fix: lazy-init Groq client
- Build was failing when `GROQ_API_KEY` not set at build time
- Fixed with lazy initialisation

### `672c971` · 🆓 Phase 3: Switch to Groq (free)
- Replaced OpenAI with Groq `llama-3.3-70b-versatile` — zero cost
- Story enrichment via `/api/enrich-story`

### `aa2e0a3` · 🎬 Phase 2: StoryAnimator
- 7 animated life scenes with SVG characters
- Framer Motion page transitions

### `7a841ee` · ✅ Phase 1: Clean build
- Initial working build
- Expanded birth chart report, VedicChart + ReportCard components

---

## Current State (Apr 4, 2026)

| | |
|---|---|
| **Local dev** | `http://localhost:3000` — full app |
| **Prod** | `https://univu.vercel.app` — 🔒 Coming Soon |
| **GitHub** | https://github.com/ramarepalli86-hue/Univu |
| **AI model** | Groq `llama-3.3-70b-versatile` (free tier) |
| **Stack** | Next.js 14 · React 18 · TypeScript · Tailwind CSS |
| **Traditions** | Vedic · Western · Chinese · Egyptian · Mayan |
| **Languages** | 19 (EN · TE · HI · TA · ML · KN · MR · GU · PA · BN · OR · AS · ZH · ES · FR · DE · IT · PT · RU) |

### To launch when ready
1. Open `src/middleware.ts`
2. Change `const MAINTENANCE = true` → `false`
3. `git add -A && git commit -m "chore: launch" && git push`
