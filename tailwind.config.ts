import type { Config } from 'tailwindcss'
import { default as plugin } from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './tools/**/*.{js,ts,jsx,tsx,mdx}',
    './**/components/**/*.{js,ts,jsx,tsx,mdx}',
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
      colors: {
        fall: '#000',
        unity: '#000',
        rainbow: '#000',
      },
      screens: {
        sm: { max: '360px' },
      },
      transitionTimingFunction: {
        panel: 'cubic-bezier(.32,.72,0,1)',
      },
      transitionDuration: {
        panel: '640ms',
      },
      animation: {
        'dialog-show': 'dialog-show 640ms cubic-bezier(.32,.72,0,1) 320ms',
        'dialog-hide': 'dialog-hide 640ms cubic-bezier(.32,.72,0,1)',
        'fade-in': 'fade-in 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fade-out 320ms cubic-bezier(0.4, 0, 0.2, 1) 160ms',
        'song-play': 'song-play 20s linear infinite',
      },
      keyframes: {
        'dialog-show': {
          '0%': { transform: 'translate3d(0,100%,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },

        'dialog-hide': {
          '0%': { transform: 'translate3d(0,0,0)scale(1)' },
          '100%': { transform: 'translate3d(0,100%,0)scale(1)' },
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
        '.translate-z-0': { transform: 'translateZ(0)' },
        '.translate-3d-0': { transform: 'translate3d(0,0,0)' },
        '.translate-3d-y-full': { transform: 'translate3d(0,100%,0)' },
        '.overflow-touch': { '-webkit-overflow-scrolling': 'touch' },
      })
    }),
  ],
}
export default config
