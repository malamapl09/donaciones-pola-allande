/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pola-blue': '#1e40af',
        'pola-red': '#dc2626',
        'dominican-blue': '#002d62',
        'dominican-red': '#ce1126'
      }
    },
  },
  plugins: [],
}