const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

const { color, duration, ease, translate } = {
  color: {
    dark: '#6496ff',
    light: colors.blue[600],
  },
  duration: {
    overlay: '320ms',
    panel: '560ms',
  },
  ease: {
    panel: 'cubic-bezier(0.52, 0.16, 0.24, 1)',
    opacity: 'cubic-bezier(0.4,0,0.6,1)',
  },
  translate: {
    '3d-bottom-dialog': 'translate3d(-50%, calc(-50% + 30px), 0)',
    '3d-bottom-full': 'translate3d(0,100%,0)',
    '3d-center': 'translate3d(-50%,-50%,0)',
    '3d-0': 'translate3d(0,0,0)',
    'z-0': 'translateZ(0)',
  },
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'dialog-in': `dialog-in ${duration['panel']} ${ease['panel']}`,
        'dialog-out': `dialog-out ${duration['panel']} ${ease['panel']}`,
        'overlay-in': `overlay-in ${duration['overlay']} ${ease['opacity']}`,
        'overlay-out': `overlay-out ${duration['overlay']} ${ease['opacity']}`,
        'slide-up': `slide-up ${duration['panel']} ${ease['panel']}`,
        'slide-down': `slide-down ${duration['panel']} ${ease['panel']}`,
      },
      boxShadow: {
        outline: `0 0 0 2px ${color.dark}`,
        focus: `0 0 0 2px ${colors.amber[500]}`,
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
        devider: 'rgba(147 147 147 / 0.2)',
      },
      fontFamily: {
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        base: ['16px', '24px'],
        hero: ['30px', '34px'],
      },
      keyframes: {
        'dialog-in': {
          from: { opacity: '0', transform: translate['3d-bottom-dialog'] },
          to: { opacity: '1', transform: translate['3d-center'] },
        },
        'dialog-out': {
          from: { opacity: '1', transform: translate['3d-center'] },
          to: { opacity: '0', transform: translate['3d-bottom-dialog'] },
        },
        'overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '0.50' },
        },
        'overlay-out': {
          from: { opacity: '0.50' },
          to: { opacity: '0' },
        },
        'slide-up': {
          from: { transform: translate['3d-bottom-full'] },
          to: { transform: translate['3d-0'] },
        },
        'slide-down': {
          from: { transform: translate['3d-0'] },
          to: { transform: translate['3d-bottom-full'] },
        },
      },
      letterSpacing: {
        base: '0.0013em',
        hero: '0.0125em',
      },
      screens: {
        sm: '525px',
        tc: '1024px',
      },
      transitionDuration: { ...duration },
      transitionProperty: {
        fade: 'transform, opacity, visibility',
        shadow: 'box-shadow',
      },
      transitionTimingFunction: { ...ease },
    },
  },
  plugins: [
    require('@kobalte/tailwindcss'),
    ({ addUtilities }) => {
      addUtilities({
        '.backface-hidden': { 'backface-visibility': 'hidden' },

        // Transform
        '.translate-z-0': { transform: translate['z-0'] },
        '.translate-3d-0': { transform: translate['3d-0'] },
        '.translate-3d-center': { transform: translate['3d-center'] },

        // Safearea
        '.env-b-4': { 'padding-bottom': 'max(env(safe-area-inset-bottom), 16px)' },
        '.env-ml-0': { 'margin-left': 'max(env(safe-area-inset-left))' },
        '.env-mr-0': { 'margin-right': 'max(env(safe-area-inset-right))' },
      })
    },
  ],
}
