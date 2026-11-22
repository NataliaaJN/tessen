import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: the Studio itself and the isolated preview it embeds in an iframe.
// Built with base `/studio/` so the docs site can serve the output under that path (local only).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/studio/' : '/',
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        preview: resolve(import.meta.dirname, 'preview.html'),
      },
    },
  },
  test: { environment: 'node', include: ['test/**/*.test.ts'] },
}));
