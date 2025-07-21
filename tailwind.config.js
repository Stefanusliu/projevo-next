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
        'tender-blue': '#2373FF',
        'tender-blue-hover': '#1a5ce6',
      },
      ringColor: {
        'tender-blue': '#2373FF',
      }
    },
  },
  plugins: [],
}
