const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
  // eslint-disable-next-line prettier/prettier
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx,ejs}',
    './src/autouma/**/*.{js,jsx,ts,tsx,ejs}',
    './src/main/**/*.{js,jsx,ts,tsx,ejs}',
  ],
  safelist: [
    'text-ground-1',
    'text-ground-2',
    'text-ground-3',
    'text-ground-4',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--uma-font-sans)'],
      mono: ['var(--uma-font-mono)'],
    },
    extend: {
      transitionProperty: {
        ui: 'color, background-color, border-color, box-shadow, opacity, transform',
      },
      transitionDuration: {
        DEFAULT: 'var(--uma-motion-fast, 160ms)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--uma-ease-out, cubic-bezier(0.23, 1, 0.32, 1))',
      },
      fontSize: {
        caption: ['var(--uma-type-caption)', { lineHeight: '1.5' }],
        label: ['var(--uma-type-label)', { lineHeight: '1.5' }],
        data: ['var(--uma-type-data)', { lineHeight: '1.5' }],
        body: ['var(--uma-type-body)', { lineHeight: '1.65' }],
        section: ['var(--uma-type-section)', { lineHeight: '1.4' }],
        title: ['var(--uma-type-title)', { lineHeight: '1.35' }],
        display: ['var(--uma-type-display)', { lineHeight: '1.2' }],
      },
      colors: {
        sky: colors.sky,
        cyan: colors.cyan,
        surface: '#5DC714',
        ground: {
          1: '#EF8334',
          2: '#9A8BA6',
          3: '#798AED',
          4: '#8EDFE8',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('fine-hover', '@media (hover: hover) and (pointer: fine) { &:hover }');
    }),
  ],
};
