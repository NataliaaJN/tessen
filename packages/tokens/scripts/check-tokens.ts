/** `pnpm tokens:check`: validates the DTCG sources (see scripts/lib/checks.ts). */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runChecks } from './lib/checks.ts';
import { buildColorPrimitives } from './lib/scales.ts';
import { loadSources } from './lib/source.ts';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const sources = loadSources(srcDir);

const { issues, stats } = await runChecks(sources, {
  generatedScales: {
    expected: buildColorPrimitives(),
    actual: JSON.parse(readFileSync(`${srcDir}/primitives/color.json`, 'utf8')),
  },
});

if (issues.length > 0) {
  console.error(`tokens:check found ${issues.length} problem(s):\n`);
  for (const { check, message } of issues) console.error(`  [${check}] ${message}`);
  process.exit(1);
}
console.log(
  `tokens:check ok - ${stats.tokens} tokens, ${stats.contrastPairs} contrast pairs verified across ${2} themes`,
);
