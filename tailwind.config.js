const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '525px'
      },
      keyframes: {
        'dialog-in': {
          from: { opacity: '0', transform: 'translate(-50%, calc(-50% + 30px))' },
          to: { opacity: '1', transform: 'translate(-50%, -50%)' },
        },
        'dialog-out': {
          from: { opacity: '1', transform: 'translate(-50%, -50%)' },
          to: { opacity: '0', transform: 'translate(-50%, calc(-50% + 30px))' },
        },
        'overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '0.75' },
        },
        'overlay-out': {
          from: { opacity: '0.75' },
          to: { opacity: '0' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        }
      },
      animation: {
        'dialog-in': ['dialog-in', '560ms', 'cubic-bezier(0.52, 0.16, 0.24, 1)'].join(' '),
        'dialog-out': ['dialog-out', '560ms', 'cubic-bezier(0.52, 0.16, 0.24, 1)'].join(' '),
        'overlay-in': ['overlay-in', '320ms', 'cubic-bezier(0.4,0,0.6,1)'].join(' '),
        'overlay-out': ['overlay-out', '320ms', 'cubic-bezier(0.4,0,0.6,1)'].join(' '),
        'slide-up': ['slide-up', '560ms', 'cubic-bezier(0.52, 0.16, 0.24, 1)'].join(' '),
        'slide-down': ['slide-down', '560ms', 'cubic-bezier(0.52, 0.16, 0.24, 1)'].join(' '),
      },
      fontSize: {
        base: ['16px', '24px'],
        hero: ['30px', '34px'],
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      letterSpacing: {
        base: '0.0013em',
        hero: '0.0125em'
      },
      transitionProperty: {
        fade: 'transform, opacity, visibility',
        base: 'cubic-bezier(0.4,0,0.6,1)'
      },
      colors: {
        primary: {
          DEFAULT: colors.blue[600],
          dark: '#6496ff'
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
          900: '#18181B'
        },
        devider: 'rgba(147 147 147 / 0.2)'
      }
    },
  },
  plugins: [
    require("@kobalte/tailwindcss")
  ],
}
