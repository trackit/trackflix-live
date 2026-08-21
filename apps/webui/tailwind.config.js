const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#047AFF',
          'primary-content': '#FFFFFF',
        },
      },
      'night',
    ],
    darkTheme: 'night',
  },
  darkMode: ['selector', '[data-theme="night"]'],
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // TrackIt brand red (matches trackit.io's marketing-brand colour), used for the
        // "Connect with TrackIt" CTA so it reads as the real brand, not the theme's error red.
        'trackit-red': '#da1010',
        'trackit-red-hover': '#b90e0e',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
