/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
        blue: {
          600: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
