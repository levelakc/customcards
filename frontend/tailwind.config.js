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
          50: '#faf8f4',
          100: '#f4f1ea',
          200: '#e8e4db',
          300: '#d6d0c4',
          400: '#aba496',
          500: '#7e786d',
          600: '#4c4840',
          700: '#33302b',
          800: '#201e1b',
          900: '#121210',
          950: '#0a0a09',
        },
      },
      fontFamily: {
        sans: ['"Assistant"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Frank Ruhl Libre"', '"Playfair Display"', 'Georgia', 'serif'],
        luxury: ['"Frank Ruhl Libre"', '"Playfair Display"', 'Georgia', 'serif'],
        dancing: ['"Frank Ruhl Libre"', '"Playfair Display"', 'Georgia', 'serif'],
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'parisienne': ['"Parisienne"', 'cursive'],
        'alex-brush': ['"Alex Brush"', 'cursive'],
      },
    },
  },
  plugins: [],
}
