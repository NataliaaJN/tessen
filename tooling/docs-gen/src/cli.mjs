// docs-gen CLI.
//   generate  writes apps/docs/src/generated/*.json and apps/docs/public/llms.txt (gitignored)
//   check     fails on drift between the contracts and the two framework packages
//
// Build first (`pnpm build`): it reads the built bundles, like a consumer.

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, buildLlmsTxt, checkDocs } from './model.mjs';
import { loadDocs } from './load.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const docsApp = resolve(root, 'apps', 'docs');

/**
 * @param {string} path
 * @param {unknown} value
 */
async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const command = process.argv[2];
  const docs = loadDocs();
  const problems = checkDocs(docs);

  if (command === 'check') {
    if (problems.length > 0) {
      console.error(`docs:check FAILED\n  ${problems.join('\n  ')}`);
      process.exit(1);
    }
    console.log(`docs:check OK: ${docs.length} components, no drift between contracts and APIs.`);
    return;
  }

  if (command === 'generate') {
    if (problems.length > 0) {
      console.error(`docs:generate refused: drift found\n  ${problems.join('\n  ')}`);
      process.exit(1);
    }
    const out = resolve(docsApp, 'src', 'generated');
    await rm(out, { recursive: true, force: true });
    await writeJson(resolve(out, 'index.json'), buildIndex(docs));
    for (const d of docs) await writeJson(resolve(out, 'components', `${d.slug}.json`), d);
    await mkdir(resolve(docsApp, 'public'), { recursive: true });
    await writeFile(resolve(docsApp, 'public', 'llms.txt'), buildLlmsTxt(docs));
    console.log(`docs:generate OK: ${docs.length} components -> apps/docs/src/generated`);
    return;
  }

  console.error('usage: docs-gen <generate|check>');
  process.exit(2);
}

await main();
