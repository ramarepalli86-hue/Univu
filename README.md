# 🌌 Univu — See the Universe. Know Yourself.

> **⚠️ IMPORTANT DISCLAIMER:** Univu is for **INFORMATION and ENTERTAINMENT purposes ONLY**. It should **NOT** be used as guidance or a path for any life decisions. Please **CONSULT A PROFESSIONAL ASTROLOGER** for true and accurate details about your horoscope and life path.

---

## What is Univu?

Univu is a multilingual astrology web app that combines **Vedic (Telugu/Jyotish)** and **Western** astrology to generate cosmic readings. It features:

- 🌍 **19 languages** — English, Telugu, Hindi, Mandarin, Spanish, French, German, Italian, Portuguese, Russian, Tamil, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Odia, Assamese
- 🔮 **Vedic analysis** — Rashi, Nakshatra, planetary influences
- ⭐ **Western analysis** — Sun, Moon, Rising signs
- 🎭 **Anime-style celestial story** — animated narrative of your cosmic journey
- 🧘 **Remedies & guidance** — traditional Vedic remedies
- 🔞 **Age gating** — 18+ gets honest/blunt readings, under-18 gets positive encouragement only
- 🛡️ **Prominent disclaimers** — multiple impossible-to-miss disclaimer banners

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS 3.4, Framer Motion
- **Backend:** Next.js API Routes (serverless)
- **Astrology Engine:** Custom rule-based TypeScript engine (Vedic + Western)
- **Icons:** react-icons
- **Hosting:** Vercel (recommended)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/ramarepalli86-hue/univu.git
cd univu

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
univu/
├── src/
│   ├── app/
│   │   ├── api/reading/route.ts   # API endpoint for readings
│   │   ├── globals.css             # Tailwind + custom styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Main page (form + report)
│   ├── components/
│   │   ├── AgeGate.tsx             # Underage overlay
│   │   ├── DisclaimerBanner.tsx    # BIG disclaimer banner
│   │   ├── IntakeForm.tsx          # User input form
│   │   ├── LanguageSelector.tsx    # 19-language switcher
│   │   ├── ReportCard.tsx          # Full reading display
│   │   ├── StarField.tsx           # Animated star background
│   │   └── StoryAnimator.tsx       # Anime-style story component
│   ├── i18n/
│   │   ├── index.ts                # i18n loader + utilities
│   │   ├── en.json                 # English
│   │   ├── te.json                 # Telugu
│   │   └── ... (17 more languages)
│   └── lib/
│       └── astrology.ts            # Vedic + Western astrology engine
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── .env.example
├── .gitignore
├── LICENSE (MIT)
└── README.md
```

## Disclaimer

**This application is for INFORMATION and ENTERTAINMENT purposes ONLY.**

- It should NOT be used as guidance, direction, or a path for any real-life decisions.
- These readings are computer-generated using classical rule-sets — they are NOT accurate predictions.
- Always CONSULT A PROFESSIONAL ASTROLOGER for true details about your horoscope and life.
- The creators of Univu are not responsible for any actions taken based on these readings.

## License

MIT © 2026 Univu
