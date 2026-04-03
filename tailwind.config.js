/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Luxury pearl / off-white background tones ──────────────────────
        pearl: {
          50:  '#FFFFFF',
          100: '#F8F6F2',  // main page bg — warm off-white pearl
          200: '#F0EDE7',  // card bg
          300: '#E6E1D9',  // elevated card / input bg
          400: '#D4CEC4',  // border light
          500: '#B8B0A4',  // muted border
          600: '#8A8278',  // placeholder
          700: '#5E584F',  // secondary text
          800: '#3A3530',  // body text
          900: '#1E1B17',  // heading dark
        },
        // ─── Maroon-gold — rich traditional luxury ──────────────────────────
        maroon: {
          950: '#2D0000',
          900: '#4A0A0A',
          800: '#6B1414',  // deep maroon
          700: '#8B1A1A',  // primary maroon
          600: '#A32020',
          500: '#B83232',
          400: '#C84848',
          300: '#D46A6A',
          200: '#E0A0A0',
          100: '#F0D0D0',
          50:  '#FBF0F0',
        },
        // ─── Amber-gold — orangish gold, luxury brand warmth ────────────────
        amber: {
          950: '#3D1A00',
          900: '#5C2800',
          800: '#7A3800',
          700: '#9C5000',
          600: '#B86800',
          500: '#C4820A',  // main gold-amber accent
          400: '#D49820',
          300: '#E0B040',
          200: '#EDCA70',
          100: '#F5DFA0',
          50:  '#FBF0D0',
        },
        // ─── Deep teal — dark cool accent for borders & interactive ─────────
        teal: {
          950: '#010F0F',
          900: '#052020',
          800: '#0A3535',
          700: '#114A4A',  // border default
          600: '#1A6060',  // border hover / active
          500: '#226F6F',  // icon / badge bg
          400: '#2E8888',
          300: '#3EA4A4',
          200: '#68C4C4',
          100: '#A8E0E0',
          50:  '#E0F5F5',
        },
        // ─── Slate-blue — secondary cool accent ─────────────────────────────
        slate: {
          900: '#0F1E35',
          800: '#1A2E4A',
          700: '#243D60',
          600: '#2E4E78',
          500: '#3A6090',
          400: '#5A80AA',
          300: '#80A4C4',
          200: '#AACAE0',
          100: '#D0E4F0',
          50:  '#EEF5FA',
        },
        // ─── Legacy aliases so existing JSX doesn't break ───────────────────
        warm: {
          50: '#F8F6F2', 100: '#F0EDE7', 200: '#E6E1D9',
          300: '#D4CEC4', 400: '#B8B0A4', 500: '#8A8278',
        },
        gold: {
          50: '#FBF0D0', 100: '#F5DFA0', 200: '#EDCA70',
          300: '#E0B040', 400: '#D49820', 500: '#C4820A',
          600: '#B86800', 700: '#9C5000', 800: '#7A3800',
        },
        copper: {
          50: '#FBF0E8', 100: '#F0D8C0', 200: '#D4A070',
          300: '#B87840', 400: '#9A5C20', 500: '#8B1A1A',
          600: '#6B1414',
        },
        saffron: {
          50: '#FBF0F0', 100: '#F0D0D0', 200: '#D46A6A',
          300: '#B83232', 400: '#A32020', 500: '#8B1A1A',
          600: '#6B1414', 700: '#4A0A0A',
        },
      },
      fontFamily: {
        display: ['"Noto Serif Devanagari"', 'Georgia', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'luxury-bg': 'radial-gradient(ellipse at 30% 0%, rgba(196,130,10,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(17,74,74,0.07) 0%, transparent 55%)',
        'maroon-gold': 'linear-gradient(135deg, #8B1A1A 0%, #C4820A 50%, #8B1A1A 100%)',
        'gold-shimmer': 'linear-gradient(135deg, #C4820A 0%, #E0B040 50%, #C4820A 100%)',
      },
      boxShadow: {
        'luxury': '0 4px 24px rgba(139,26,26,0.08), 0 1px 4px rgba(0,0,0,0.06)',
        'luxury-md': '0 8px 40px rgba(139,26,26,0.10), 0 2px 8px rgba(0,0,0,0.08)',
        'teal-ring': '0 0 0 3px rgba(34,111,111,0.18)',
        'card': '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'spin-slow': 'spin 30s linear infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '0%,100%': { opacity: '0.85' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
