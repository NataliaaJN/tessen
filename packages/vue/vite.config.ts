import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Library build: one ES module, Vue and TESSEN packages stay external. Declarations come from vue-tsc.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: { external: ['vue', /^@tessen-ui\//, /^@zag-js\//] },
    sourcemap: false,
    emptyOutDir: true,
  },
});
