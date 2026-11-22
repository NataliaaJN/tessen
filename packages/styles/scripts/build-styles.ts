/** `pnpm build`: assembles dist/ (layers, tokens, reset, base, index, components) from src/. */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStyles } from './lib/build.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokensPath = fileURLToPath(import.meta.resolve('@tessen-ui/tokens/tokens.css'));

const outputs = buildStyles({
  srcDir: `${root}src`,
  tokensCss: readFileSync(tokensPath, 'utf8'),
});

rmSync(`${root}dist`, { recursive: true, force: true });
for (const [file, content] of Object.entries(outputs)) {
  mkdirSync(dirname(`${root}dist/${file}`), { recursive: true });
  writeFileSync(`${root}dist/${file}`, content);
}
console.log(`built ${Object.keys(outputs).join(', ')}`);
