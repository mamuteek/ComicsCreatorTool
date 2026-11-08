/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        comic: ['"Comic Neue"', 'cursive', 'sans-serif'],
        bangers: ['"Bangers"', 'cursive', 'sans-serif'],
      },
      aspectRatio: {
        'a4': '1 / 1.4142',
      },
    },
  },
  plugins: [],
};

