// Type-checks the code the Playground generates (US-03: "the snippets compile in CI").
// Every recipe, at its defaults and with each control moved on its own, is written as a real
// `.vue` / `.tsx` file next to the app and checked by vue-tsc against the BUILT packages, so a
// wrong prop name or type in either framework fails here. Build first (`pnpm build`).
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const root = new URL('../', import.meta.url);
const out = new URL('.snippets/', root);

const { snippetCases } = await import(new URL('src/features/recipes/cases.ts', root).href);
/** @type {{ id: string; vue: string; react: string }[]} */
const cases = snippetCases();

rmSync(out, { recursive: true, force: true });
mkdirSync(new URL('vue/', out), { recursive: true });
mkdirSync(new URL('react/', out), { recursive: true });
for (const c of cases) {
  writeFileSync(new URL(`vue/${c.id}.vue`, out), c.vue);
  writeFileSync(new URL(`react/${c.id}.tsx`, out), c.react);
}
console.log(
  `snippets:check: ${cases.length} cases x 2 frameworks written to apps/playground/.snippets`,
);

const require = createRequire(import.meta.url);
const vueTsc = require.resolve('vue-tsc/bin/vue-tsc.js');
const result = spawnSync(
  process.execPath,
  [
    vueTsc,
    '--noEmit',
    '-p',
    new URL('tsconfig.snippets.json', root).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  ],
  { stdio: 'inherit' },
);
if (result.status !== 0) {
  console.error('snippets:check: generated code does not compile.');
  process.exit(result.status ?? 1);
}
console.log('snippets:check: every generated snippet compiles (Vue and React).');
