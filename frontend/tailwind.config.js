/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          50: '#fdfbf2',
          100: '#fbf5d9',
          200: '#f5e6ad',
          300: '#f0d478',
          400: '#e5bc48',
          500: '#d4af37',
          600: '#b89124',
          700: '#94701c',
          800: '#78591c',
          900: '#64491b',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#404040',
          700: '#2a2a2a',
          800: '#1c1c1c',
          900: '#0c0c0c',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['"Rubik"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Gveret Levin"', '"Dancing Script"', 'cursive'],
        luxury: ['"Gveret Levin"', '"Dancing Script"', 'cursive'],
        dancing: ['"Gveret Levin"', '"Dancing Script"', 'cursive'],
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'parisienne': ['"Parisienne"', 'cursive'],
        'alex-brush': ['"Alex Brush"', 'cursive'],
      },
    },
  },
  plugins: [],
}
