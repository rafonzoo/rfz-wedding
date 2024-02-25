import type { Config } from 'tailwindcss'
import { default as plugin } from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './tools/hook.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: 'var(--font-inter)',
      },
      fontSize: {
        root: ['16px', '24px'],
        base: ['17px', '24px'],
        lead: ['19px', '27px'],
        '2.5xl': ['28px', '32px'],
        '6.5xl': ['64px', '68px'],
        '7.5xl': ['80px', '84px'],
      },
      letterSpacing: {
        base: '0.013em',
        lead: '0.021em',
      },
      boxShadow: {
        focus: '0 0 0px 4px #60a5fa',
        error: '0 0 0px 4px #ffb4b4',
        outlined: '0 0 0 4px rgb(133 133 133 / 40%)',
      },
      screens: {
        sm: { max: '360px' },
        mn: { min: '440px' },
      },
      transitionTimingFunction: {
        panel: 'cubic-bezier(.32,.72,0,1)',
      },
      transitionDuration: {
        panel: '640ms',
      },
      animation: {
        'dropdown-show': 'dropdown-show 320ms cubic-bezier(0.4, 0, 0.2, 1) forwards', // prettier-ignore
        'dropdown-hide': 'dropdown-hide 320ms cubic-bezier(0.4, 0, 0.2, 1) forwards', // prettier-ignore
        'sheet-show': 'sheet-show 640ms cubic-bezier(.32,.72,0,1) forwards',
        'sheet-hide': 'sheet-hide 640ms cubic-bezier(.32,.72,0,1) forwards',
        'alert-show': 'alert-show 320ms cubic-bezier(.32,.72,0,1) forwards',
        'alert-hide': 'alert-hide 320ms cubic-bezier(.32,.72,0,1) forwards',
        'alert-wait': 'alert-wait 0ms cubic-bezier(.32,.72,0,1) 320ms forwards',
        'fade-in': 'fade-in 320ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-out': 'fade-out 320ms cubic-bezier(0.4, 0, 0.2, 1) 160ms forwards', // prettier-ignore
        'song-play': 'song-play 20s linear infinite',
      },
      keyframes: {
        'alert-wait': {
          '0%': { visibility: 'visible' },
          '100%': { visibility: 'hidden' },
        },

        'alert-show': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },

        'alert-hide': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        },

        'sheet-show': {
          '0%': { transform: 'translate3d(0,calc(100% + 1px),0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },

        'sheet-hide': {
          '0%': { transform: 'translate3d(0,0,0)scale(1)' },
          '100%': { transform: 'translate3d(0,calc(100% + 1px),0)scale(1)' },
        },

        'dropdown-show': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        'dropdown-hide': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },

        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },

        'song-play': {
          '0%': { transform: 'rotate(0)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.overflow-touch': { '-webkit-overflow-scrolling': 'touch' },
        '.translate-z-0': { transform: 'translateZ(0)' },
        '.translate-3d-0': { transform: 'translate3d(0,0,0)' },
        '.translate-3d-y-full': {
          transform: 'translate3d(0,calc(100% + 1px),0)',
        },
      })
    }),
  ],
}
export default config
