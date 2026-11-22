/**
 * Post-build step: `vue-tsc` emits `Button.vue.d.ts` but leaves `from './Button.vue'` in the other
 * declarations, which `moduleResolution: node16/nodenext` consumers cannot resolve (attw reports
 * "Internal resolution error"). `./Button.vue.js` is mapped by TypeScript to `Button.vue.d.ts`
 * on every resolution mode, so the specifiers are rewritten to that. The JS bundle is unaffected:
 * `vite build` inlines the components.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));

function* declarations(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* declarations(path);
    else if (entry.name.endsWith('.d.ts')) yield path;
  }
}

let rewritten = 0;
for (const file of declarations(dist)) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/(from\s+['"]\.{1,2}\/[^'"]*\.vue)(['"])/g, '$1.js$2');
  if (after !== before) {
    writeFileSync(file, after);
    rewritten++;
  }
}
console.log(`fixed .vue specifiers in ${rewritten} declaration file(s)`);
