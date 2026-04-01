/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutrals — copper, saffron, teal (no purple)
        cream: { 50: '#FAFAF8', 100: '#F5F5F0', 200: '#EEEEE6', 300: '#E0E0D6' },
        copper: { 50: '#FBF5F0', 100: '#F0DDD0', 200: '#D4A574', 300: '#B8864F', 400: '#9A6B35', 500: '#7D5526', 600: '#5E3D1A' },
        saffron: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74', 400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C' },
        teal: { 50: '#F0F7F7', 100: '#D5E8E8', 200: '#A8D0D0', 300: '#6BAFAF', 400: '#4A9494', 500: '#2E7D7D', 600: '#1B5E5E', 700: '#0F4444' },
        warm: { 50: '#FDFCFB', 100: '#F9F6F2', 200: '#F0EBE3', 300: '#E2D9CC', 400: '#C4B8A8', 500: '#A69B8B' },
      },
      fontFamily: {
        display: ['Georgia', 'Noto Serif Devanagari', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'spin-slow': 'spin 30s linear infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
