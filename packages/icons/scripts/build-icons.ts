/** `pnpm build`: turns src/svg into dist/ (Vue and React components, plain SVG, sprite, manifest). */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './lib/icons.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const svgDir = `${root}src/svg`;

const sources = Object.fromEntries(
  readdirSync(svgDir)
    .filter((file) => file.endsWith('.svg'))
    .map((file) => [file.slice(0, -4), readFileSync(`${svgDir}/${file}`, 'utf8')]),
);

const outputs = buildAll(sources);
rmSync(`${root}dist`, { recursive: true, force: true });
for (const [file, content] of Object.entries(outputs)) {
  mkdirSync(dirname(`${root}dist/${file}`), { recursive: true });
  writeFileSync(`${root}dist/${file}`, content);
}
console.log(`built ${Object.keys(sources).length} icons -> Vue, React, svg/, sprite.svg`);
