/** Regenerates `src/primitives/color.json` from the seeds in `scripts/lib/scales.ts`. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { buildColorPrimitives } from './lib/scales.ts';

const target = fileURLToPath(new URL('../src/primitives/color.json', import.meta.url));
const options = (await resolveConfig(target)) ?? {};
// Written through Prettier so `pnpm format:check` stays green after regenerating.
const content = await format(JSON.stringify(buildColorPrimitives()), {
  ...options,
  filepath: target,
});

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, content);
console.log('wrote src/primitives/color.json');
