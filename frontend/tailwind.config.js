/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  extend: {
    fontFamily: {
      pretendard: ["Pretendard", "sans-serif"],
      playfair: ["Playfair Display", "serif"],
    },
  },
};
