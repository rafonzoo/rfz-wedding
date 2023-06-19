const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const { THEME } = require('./src/config/theme')

const { color, animation } = THEME
const { easing, duration } = animation

const translate = {
  '3d-bottom-dialog': 'translate3d(-50%, calc(-50% + 30px), 0)',
  '3d-bottom-full': 'translate3d(0,100%,0)',
  '3d-center': 'translate3d(-50%,-50%,0)',
  '3d-0': 'translate3d(0,0,0)',
  'z-0': 'translateZ(0)',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        spinner: `spinner 1s ${duration['overlay']}ms infinite`,
      },
      boxShadow: {
        outline: `0 0 0 2px ${color.dark}`,
        focus: `0 0 0 2px ${colors.amber[500]}`,
        layer: '0px 0px 24px rgba(0, 0, 0, 0.2)',
      },
      colors: {
        primary: {
          DEFAULT: color.light,
          dark: color.dark,
        },
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        'blur-light': 'rgba(255 255 255 / 0.7)',
        'blur-dark': 'rgba(0 0 0 / 0.7)',
      },
      fontFamily: {
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        small: ['11px', '15px'],
        caption: ['12px', '16px'],
        base: ['17px', '24px'],
        lead: ['19px', '24px'],
        heading: ['24px', '28px'],
        hero: ['30px', '34px'],
      },
      gridTemplateRows: {
        7: 'repeat(7, minmax(0, 1fr))',
      },
      keyframes: {
        spinner: {
          '0%': {
            opacity: '1',
            'stroke-dasharray': '1 98',
            'stroke-dashoffset': '-105',
          },
          '50%': {
            'stroke-dasharray': '80 10',
            'stroke-dashoffset': '-160',
          },
          '100%': {
            'stroke-dasharray': '1 98',
            'stroke-dashoffset': '-300',
            opacity: '1',
          },
        },
      },
      letterSpacing: {
        base: '0.013em',
        lead: '0.015em',
        heading: '0.021em',
        hero: '0.0125em',
      },
      spacing: {
        21: 84,
      },
      screens: {
        xxs: '359px',
        sm: '525px',
        tc: '1024px',
      },
      transitionDuration: {
        panel: duration.panel + 'ms',
        overlay: duration.overlay + 'ms',
      },
      transitionProperty: {
        fade: 'transform, opacity, visibility',
        shadow: 'box-shadow',
      },
      transitionTimingFunction: { ...easing },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.perspective-1000': { perspective: '700px' },
        '.preserve-3d': { 'transform-style': 'preserve-3d' },
        '.backface-hidden': { 'backface-visibility': 'hidden' },
        '.translate-z-0': { transform: translate['z-0'] },
        '.translate-3d-0': { transform: translate['3d-0'] },
        '.translate-3d-center': { transform: translate['3d-center'] },
      })
    },
  ],
}
