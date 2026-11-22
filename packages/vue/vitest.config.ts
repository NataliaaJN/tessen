import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    // Zag toasts remove themselves on animation-frame timers; under a loaded CI runner that is slow.
    testTimeout: 15_000,
  },
});
