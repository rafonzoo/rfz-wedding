import { blue } from 'tailwindcss/colors'

export const THEME = {
  color: {
    dark: '#6496ff',
    light: blue[600],
  },
  size: {
    height: {
      navbar: 48,
      drawer: 290,
    },
  },
  animation: {
    easing: {
      panel: 'cubic-bezier(0.52, 0.16, 0.24, 1)',
      opacity: 'cubic-bezier(0.4,0,0.6,1)',
    },
    duration: {
      panel: 560,
      overlay: 320,
    },
  },
} as const
