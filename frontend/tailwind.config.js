/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dancing: ['"Dancing Script"', 'cursive'],
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'parisienne': ['"Parisienne"', 'cursive'],
        'alex-brush': ['"Alex Brush"', 'cursive'],
      },
    },
  },
  plugins: [],
}
