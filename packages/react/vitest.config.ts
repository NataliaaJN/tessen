import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
    // Zag toasts remove themselves on animation-frame timers; under a loaded CI runner that is slow.
    testTimeout: 15_000,
  },
});
