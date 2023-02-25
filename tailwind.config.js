/** @type {import('tailwindcss').Config} */
const twPlugin = require('tailwindcss/plugin');
module.exports = {
  theme: {
    extend: {
      screens: {
        xs: '540px',
      },
      colors: {
        blue: '#1fb6ff',
        pink: '#ff49db',
        orange: '#ff7849',
        green: '#13ce66',
        'gray-dark': '#273444',
        gray: '#8492a6',
        'gray-light': '#d3dce6',
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      boxShadow: {
        // Examples of custom box shadows
        header: 'inset 0px -1px 0px rgba(15, 31, 44, 0.18)',
        footer: 'inset 0px 1px 0px rgba(0, 0, 0, 0.08)',
      },
      lineClamp: {
        14: '14',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms'),
    twPlugin(({ forms, addBase, addComponents, addUtilities, theme }) => {
      // Examples of using base layer custom styles in a plugin to match designs
      addBase({
        h1: {
          fontSize: '14px',
          lineHeight: '16px',
        },
        p: {
          fontSize: '10px',
          lineHeight: '12px',
        },
      });
    }),
  ],
  content: ['./src/**/*.{js,jsx,ts,tsx,html}', './public/index.html'],
};
