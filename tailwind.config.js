/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hacktion-orange': '#FF6B35',
        'hacktion-blue': '#004E89',
        'hacktion-dark': '#0A0A0B',
        'hacktion-gray': '#1A1B23',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}