import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Three pages: the Playground and one isolated preview page per framework (embedded in iframes).
// Built with base `/playground/` so the docs site can serve the output under that path (local only).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/playground/' : '/',
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        previewVue: resolve(import.meta.dirname, 'preview-vue.html'),
        previewReact: resolve(import.meta.dirname, 'preview-react.html'),
      },
    },
  },
  test: { environment: 'node', include: ['test/**/*.test.ts'] },
}));
