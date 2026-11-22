import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// The Vue scenes are written as templates, so the build with the runtime compiler is needed.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [vue()],
  resolve: { alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' }] },
});
