// Serves Theme Studio under /studio/ from the docs build output (local only, ADR 0014).
// The Studio is built with base `/studio/`, so its files copy over unchanged.
import { cpSync, existsSync, rmSync } from 'node:fs';

const from = new URL('../../theme-studio/dist/', import.meta.url);
const to = new URL('../dist/studio/', import.meta.url);

if (!existsSync(from)) {
  console.error('apps/theme-studio/dist not found: build the Studio first (pnpm build).');
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log('copied theme-studio/dist -> docs/dist/studio');
