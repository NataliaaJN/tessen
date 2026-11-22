/** `pnpm build`: generates dist/ (CSS, TypeScript and JSON) from the DTCG sources. */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss, renderDts, renderJs, renderJson } from './lib/emit.ts';
import { buildModel } from './lib/model.ts';
import { loadSources } from './lib/source.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const model = await buildModel(loadSources(`${root}src`));

const outputs: Record<string, string> = {
  'dist/css/tokens.css': renderCss(model),
  'dist/js/index.js': renderJs(model),
  'dist/js/index.d.ts': renderDts(model),
  'dist/json/tokens.json': renderJson(model),
};

rmSync(`${root}dist`, { recursive: true, force: true });
for (const [file, content] of Object.entries(outputs)) {
  mkdirSync(dirname(`${root}${file}`), { recursive: true });
  writeFileSync(`${root}${file}`, content);
}
console.log(`built ${model.tokens.length} tokens -> ${Object.keys(outputs).join(', ')}`);
