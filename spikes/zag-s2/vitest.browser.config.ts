import { preview } from '@vitest/browser-preview';
import { defineConfig } from 'vitest/config';

/**
 * Same contract suite, run in a real browser (layout, focus, animations) instead of jsdom.
 * `pnpm test:browser` prints a URL; open it in any Chromium-based browser.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.{ts,tsx}'],
    exclude: ['test/boundary.test.ts'],
    setupFiles: ['test/setup.ts'],
    testTimeout: 15000,
    browser: {
      enabled: true,
      provider: preview(),
      instances: [{ browser: 'chromium' }],
      headless: false,
      api: { port: 63315, strictPort: true },
    },
  },
});
