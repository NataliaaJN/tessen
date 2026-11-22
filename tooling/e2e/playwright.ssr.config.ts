import { defineConfig } from '@playwright/test';

// Hydration tests for the SSR consumers. No web server here: `pnpm ssr:e2e` starts the production
// servers of integration/next and integration/nuxt and passes their URLs in the environment.
const channel = process.env['PW_CHANNEL'];

export default defineConfig({
  testDir: './ssr',
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  outputDir: './.out/ssr-results',
  use: { ...(channel ? { channel } : {}), viewport: { width: 800, height: 900 } },
});
