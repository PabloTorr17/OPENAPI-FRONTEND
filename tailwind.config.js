/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:   '#0a0a0a',
        paper: '#f5f0e8',
        acid:  '#d4f000',
        danger:'#ff2d2d',
        primary: {
          50:  '#f5f0e8',
          100: '#e8e0cf',
          500: '#0a0a0a',
          600: '#0a0a0a',
          700: '#1a1a1a',
          900: '#000000',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body:    ['Barlow', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
        sans:    ['Barlow', 'sans-serif'],
      },
      boxShadow: {
        brut:    '4px 4px 0 #0a0a0a',
        'brut-lg':'6px 6px 0 #0a0a0a',
      },
    },
  },
  plugins: [],
}
