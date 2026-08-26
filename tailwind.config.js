/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff8a00',
        neon: '#00d1ff',
        dark: '#0a0a0a',
      },
      fontFamily: { sans: ['Outfit', 'sans-serif'] },
    }
  },
  plugins: [],
}
