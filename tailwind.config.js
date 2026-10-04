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
        ivory: {
          DEFAULT: '#F9F8F6',
          paper: '#F4F2ED',
          dark: '#EAE6DF',
        },
        charcoal: {
          DEFAULT: '#2C2B29',
          light: '#42403D',
          dark: '#1A1A1A',
        },
        terracotta: {
          DEFAULT: '#C28F7B',
          soft: '#D4A390',
          dark: '#A8715E',
        },
        dustyrose: '#C8A9A9',
        mutedgreen: {
          DEFAULT: '#8A9A86',
          soft: '#A4B3A0',
        },
        warmamber: '#D9A05B',
        taupe: '#E3DCD2',
        softgray: '#D1D0CE',
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
    },
  },
  plugins: [],
};
