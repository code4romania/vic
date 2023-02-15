/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        current: 'currentColor',
        transparent: 'transparent',
        white: '#FFFFFF',
        turquoise: {
          DEFAULT: '#12B6B6',
          50: '#EEF8F8',
          100: '#DBF7F5',
          200: '#C1EDEA',
          300: '#A7E2E2',
          400: '#88D7D8',
          500: '#12B6B6',
          600: '#4AC3C4',
          700: '#0AA5A5',
          800: '#2E8D8E',
          900: '#246F6F',
        },
        'cool-gray': {
          DEFAULT: '#1F2937',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#121620',
        },
        red: {
          DEFAULT: '#DC2626',
          300: '#FCA5A5',
          500: '#EF4444',
          600: '#DC2626',
          700: '#D42424',
          800: '#CC2323',
          900: '#7F1D1D',
        },
        yellow: {
          900: '#F57F17',
        },
      },
      transitionProperty: {
        width: 'width',
      },
      flex: {
        2: '2 2 0%',
        3: '3 3 0%',
      },
      fontFamily: {
        roboto: 'Roboto',
        robotoMedium: 'Roboto-Medium',
        robotoBold: 'Roboto-Bold',
        titilliumBold: 'TitilliumWeb-Bold',
      },
      boxShadow: {
        blur: '0px 3px 6px rgba(48, 60, 108, 0.1)',
        header: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        section: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        yellow: '0 1px 2px #0000000d, 0 0 0 2px #fff, 0 0 0 4px #ffde33;',
        blue: '0 1px 2px #0000000d, 0 0 0 2px #fff, 0 0 0 4px #6366f1;',
      },
      borderWidth: {
        1: '1px',
      },
      fontSize: {
        '4xl': ['2rem', '2.375rem'],
      },
      aspectRatio: {
        square: '1/1',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')],
};
