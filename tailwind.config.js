/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm light palette
        cream: { 50: '#FFFDF7', 100: '#FFF9E8', 200: '#FFF3D0', 300: '#FFE8A8', 400: '#FFDA7A' },
        saffron: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74', 400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C' },
        terra: { 50: '#FDF2F0', 100: '#FADCD6', 200: '#F5B8AD', 300: '#E8917F', 400: '#D97056', 500: '#C4553A', 600: '#A3412B' },
        sage: { 50: '#F4F7F4', 100: '#E4ECE4', 200: '#C8D9C8', 300: '#A3BEA3', 400: '#7DA17D', 500: '#5F8A5F', 600: '#4A6F4A' },
        vedic: { 50: '#FFF8F0', 100: '#FFE4C4', 200: '#DEB887', 300: '#CD853F', 400: '#B8860B', 500: '#8B6914', 600: '#704214' },
        cosmic: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        gold: { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      },
      fontFamily: {
        display: ['Georgia', 'Noto Serif Devanagari', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'spin-slow': 'spin 30s linear infinite',
        'orbit': 'orbit 12s linear infinite',
      },
      keyframes: {
        twinkle: { '0%,100%': { opacity: '0.3' }, '50%': { opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(249,115,22,0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(249,115,22,0.6), 0 0 50px rgba(249,115,22,0.2)' },
        },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};
