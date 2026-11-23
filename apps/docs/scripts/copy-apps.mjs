// Serves the two SPAs from the docs build output (local only, ADR 0014):
// Theme Studio under /studio/ and the Playground under /playground/.
// Each is built with its own base path, so its files copy over unchanged.
import { cpSync, existsSync, rmSync } from 'node:fs';

const apps = [
  { name: 'theme-studio', path: 'studio' },
  { name: 'playground', path: 'playground' },
];

for (const { name, path } of apps) {
  const from = new URL(`../../${name}/dist/`, import.meta.url);
  const to = new URL(`../dist/${path}/`, import.meta.url);
  if (!existsSync(from)) {
    console.error(`apps/${name}/dist not found: build it first (pnpm build).`);
    process.exit(1);
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`copied ${name}/dist -> docs/dist/${path}`);
}
