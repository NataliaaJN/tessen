// @ts-check
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBuildOutput, checkResolution, report } from '../../shared/consumer-checks.mjs';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
report('vite-vue consumer checks', [
  ...checkResolution(cwd, ['@tessen-ui/icons/vue', '@tessen-ui/vue']),
  ...checkBuildOutput(cwd),
]);
