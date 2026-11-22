// @ts-check
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBuildOutput, checkResolution, report } from '../../shared/consumer-checks.mjs';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The whole point of this project: the packages must work on the OLD end of the peer range.
const installed = JSON.parse(readFileSync(resolve(cwd, 'node_modules/vue/package.json'), 'utf8'));
const problems =
  installed.version === '3.5.2' ? [] : [`expected Vue 3.5.2, found ${installed.version}`];
report('vite-vue352 consumer checks', [
  ...problems,
  ...checkResolution(cwd, ['@tessen-ui/icons/vue', '@tessen-ui/vue']),
  ...checkBuildOutput(cwd),
]);
