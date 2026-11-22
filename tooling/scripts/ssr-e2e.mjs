// @ts-check
/**
 * `pnpm ssr:e2e` - hydration of the SSR consumer projects in a real browser.
 *
 * Starts the PRODUCTION servers of `integration/next`, `integration/nuxt` and `integration/vite-react18` and `integration/vite-vue352` (version matrix) (already installed
 * from the tarballs and built by `pnpm integration:test`) and runs `tooling/e2e/ssr`. Set
 * `PW_CHANNEL=chrome` to use the installed Chrome locally; CI installs Playwright's Chromium.
 */
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, stopServer } from '../../integration/shared/ssr-server.mjs';
import { root } from './pack-all.mjs';

async function main() {
  const next = await startServer(
    join(root, 'integration', 'next'),
    'pnpm',
    ['exec', 'next', 'start', '-p', '3421'],
    3421,
  );
  const nuxt = await startServer(
    join(root, 'integration', 'nuxt'),
    'node',
    ['.output/server/index.mjs'],
    3422,
  );
  // Version matrix: the React 18.3 consumer, built and served as static files.
  const react18 = await startServer(
    join(root, 'integration', 'vite-react18'),
    'pnpm',
    ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', '3423', '--strictPort'],
    3423,
  );
  const vue352 = await startServer(
    join(root, 'integration', 'vite-vue352'),
    'pnpm',
    ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', '3424', '--strictPort'],
    3424,
  );
  /** @type {number} */
  let status;
  try {
    const result = spawnSync('pnpm', ['--filter', '@tessen-ui/e2e', 'run', 'ssr'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        SSR_NEXT_URL: next.url,
        SSR_NUXT_URL: nuxt.url,
        MATRIX_REACT18_URL: react18.url,
        MATRIX_VUE352_URL: vue352.url,
      },
    });
    status = result.status ?? 1;
  } finally {
    stopServer(next.child);
    stopServer(nuxt.child);
    stopServer(react18.child);
    stopServer(vue352.child);
  }
  process.exit(status);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
