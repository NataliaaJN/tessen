import { defineConfig } from '@playwright/test';

// CI installs Playwright's own Chromium (`playwright install --with-deps chromium`). Locally,
// set PW_CHANNEL=chrome to use the Chrome that is already installed and download nothing.
const channel = process.env['PW_CHANNEL'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  outputDir: './.out/results',
  use: {
    baseURL: 'http://localhost:5199',
    ...(channel ? { channel } : {}),
    viewport: { width: 800, height: 900 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'vite --config harness/vite.config.ts --port 5199 --strictPort',
    url: 'http://localhost:5199/',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
