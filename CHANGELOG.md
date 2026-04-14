# Univu — Changelog

> Build sprint: **Apr 2–4, 2026** · Major upgrade session: **Apr 13–14, 2026**

---

## [Apr 14, 2026] — Admin Dashboard + Cost Fix

### `c5a561a` · feat: admin dashboard + usage tracker + per-provider cost fix

**New files (3):**
- `src/lib/usageTracker.ts` — Detailed per-request usage tracking in memory
  - Tracks: route, provider, tokens, cost, latency, success/fail, fallback count, error messages
  - Aggregates: by provider, by route, hourly buckets (last 48h), monthly totals
  - Cost model: gemini=$0, cerebras=$0, groq=$0.59/M tokens
  - Max 5000 logs in memory, auto-resets on new month
- `src/app/api/admin/stats/route.ts` — Secure GET endpoint
  - localhost: auto-allowed (no auth)
  - Production: requires `?secret=ADMIN_SECRET` query param
  - Returns full `DashboardData` JSON
- `src/app/admin/dashboard/page.tsx` — 4-tab admin dashboard
  - Overview: total requests/tokens/cost/success rate, API key status, provider cards
  - Cost: budget meter, cost by provider, cost by route, pricing reference table
  - Usage: bar charts (requests by route, tokens by provider, latency), hourly activity, fallback frequency
  - Logs: last 20 requests, recent errors panel
  - Light warm theme: cream/amber gradient, white cards, auto-refresh 10s

**Modified files (6):**
- `src/lib/aiProvider.ts` — Added `trackRequest()` instrumentation to every provider attempt in `callAI()`; added `route` param to `AIRequestOptions`
- `src/lib/budget.ts` — **Fixed cost calculation**: was charging flat $0.59/M for ALL providers (including free Gemini + Cerebras). Now uses per-provider rates: gemini=$0, cerebras=$0, groq=$0.59/M
- `src/app/api/chat/route.ts` — Added `route: 'chat'` to callAI, pass provider to addTokens
- `src/app/api/enrich-story/route.ts` — Added `route: 'enrich-story'` to callAI, pass provider to addTokens
- `src/app/api/personal-reading/route.ts` — Added `route: 'personal-reading'` to callAI, pass provider to addTokens
- `src/middleware.ts` — Allow `/admin` routes through maintenance mode

---

## [Apr 13, 2026] — Accuracy, Interactivity, Timing

### `5d6501d` · fix: dasha-first timing with 3-year antardasha scan for all ages 21+
- Chat API: rewrote timing rules 9-14 as strict 4-step sequence:
  1. Identify current Maha Dasha & Antardasha
  2. Scan upcoming antardashas in ~3-year blocks from NOW
  3. Pick the best near-term window within 5 years
  4. Only THEN mention next Maha Dasha as secondary
- Marriage cap lowered from age 55→45
- Age threshold lowered from 35→21 (applies to everyone)
- Love reading prompt: same dasha-first + 3-year antardasha scan structure
- Fixes: 39yo getting 2043 prediction (was skipping to far-future dasha)

### `31b8fa9` · fix: add age-realism guardrails for timing predictions
- Added 6 timing-realism rules to chat API system prompt
- Current year injected dynamically
- "For anyone 35+, give timing within 3 years"
- "Never predict marriage beyond 55"
- "Never give only far-future Maha Dasha without near-term antardasha window"

### `ea9aabd` · fix: enrich follow-up chat with full chart data
- Root cause: follow-up answers were generic because chartSummary was sparse
- Fix: enriched chartSummary with ALL planets (degree, retrograde), all 12 house lords, Manglik details + cancellations, Sade Sati phase, full dasha timeline
- Increased sanitise limit from 2000→6000 chars
- Added 8 follow-up rules requiring chart-specific citations
- maxTokens 500→800 for richer answers

### `21c54be` · feat: NASA-grade planet accuracy + interactive follow-up chat
- **Planet accuracy:** Replaced mean longitude formulas (±40-52° errors) with `astronomy-engine` v2.1.19 (VSOP87, arcsecond accuracy)
- **Follow-up chat:** Added inline follow-up to ALL reading sections (6 AI tabs, WeeklyForecast, VastuFengShui). Each sends full chartContext to `/api/chat`

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
