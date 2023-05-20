import solidPlugin from 'vite-plugin-solid'
import VitePluginInjectPreload from 'vite-plugin-inject-preload'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    solidPlugin(),
    VitePluginInjectPreload({
      files: [{ match: /[a-z-0-9]*.css$/ }],
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },
  resolve: {
    alias: [{ find: /\@\app\//, replacement: '/src/' }],
  },
  server: { port: 3000 },
  preview: { port: 3000 },
})
