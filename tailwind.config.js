/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Deep cosmic palette — dark charcoal + muted gold ───────────────
        // Background tones: deep warm charcoal (not black, not white)
        cosmic: {
          950: '#0E0C09',  // near-black warm
          900: '#141109',  // main app bg — deep charcoal-brown
          850: '#1A1610',  // card bg
          800: '#221D14',  // elevated card
          750: '#2A2418',  // border / divider
          700: '#33291E',  // subtle hover
          600: '#4A3C2A',  // muted border
          500: '#6B5840',  // placeholder text
          400: '#9A8468',  // secondary text
          300: '#C4A87A',  // body text
          200: '#D4B98A',  // headings
          100: '#E8D4A8',  // bright text
          50:  '#F5EDD8',  // near-white text
        },
        // Muted gold — not shiny, like aged temple gold
        gold: {
          950: '#1A1200',
          900: '#2A1E00',
          800: '#3D2D00',
          700: '#5C4400',
          600: '#7A5C00',
          500: '#9C7A1A',  // main accent gold
          400: '#B8922A',
          300: '#CC A84A',
          200: '#D4B86A',
          100: '#E8D090',
          50:  '#F5EAC0',
        },
        // Teal — kept for interactive elements but deeper
        teal: {
          950: '#030F0F',
          900: '#061818',
          800: '#0A2828',
          700: '#0F3D3D',
          600: '#155555',
          500: '#1E7070',
          400: '#2E8E8E',
          300: '#4AACAC',
          200: '#7AC8C8',
          100: '#B0E0E0',
          50:  '#E0F5F5',
        },
        // Copper/saffron for highlights
        copper: {
          50: '#FBF0E8', 100: '#F0D8C0', 200: '#D4A070',
          300: '#B87840', 400: '#9A5C20', 500: '#7D4410',
          600: '#5E3008',
        },
        saffron: {
          50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA',
          300: '#FDBA74', 400: '#FB923C', 500: '#F97316',
          600: '#EA580C', 700: '#C2410C',
        },
        // Keep warm for any legacy references
        warm: {
          50: '#1A1610', 100: '#221D14', 200: '#2A2418',
          300: '#33291E', 400: '#4A3C2A', 500: '#6B5840',
        },
      },
      fontFamily: {
        display: ['"Noto Serif Devanagari"', 'Georgia', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        // Subtle cosmic gradient for the main page
        'cosmic-bg': 'radial-gradient(ellipse at top, #1E1A0F 0%, #0E0C09 60%, #080604 100%)',
        'gold-shimmer': 'linear-gradient(135deg, #9C7A1A 0%, #B8922A 50%, #9C7A1A 100%)',
        'card-glow': 'radial-gradient(ellipse at top left, #2A2418 0%, #141109 100%)',
      },
      boxShadow: {
        'gold-sm': '0 0 0 1px rgba(156,122,26,0.2), 0 2px 8px rgba(0,0,0,0.4)',
        'gold-md': '0 0 0 1px rgba(156,122,26,0.3), 0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(156,122,26,0.05)',
        'gold-glow': '0 0 20px rgba(156,122,26,0.15), 0 0 60px rgba(156,122,26,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'spin-slow': 'spin 30s linear infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseGold: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
