import solidPlugin from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    transformMode: {
      web: [/\.tsx?$/],
    },
    // setupFiles: './setupVitest.js',
    deps: {
      inline: ['@solidjs/testing-library'],
    },
  },
  resolve: {
    alias: [{ find: /\@\app\//, replacement: '/src/' }],
    conditions: ['development', 'browser'],
  },
})
