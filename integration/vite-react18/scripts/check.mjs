// @ts-check
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBuildOutput, checkResolution, report } from '../../shared/consumer-checks.mjs';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The whole point of this project: the packages must work on the OLD end of the peer range.
const installed = JSON.parse(readFileSync(resolve(cwd, 'node_modules/react/package.json'), 'utf8'));
const problems = installed.version.startsWith('18.3.')
  ? []
  : [`expected React 18.3.x, found ${installed.version}`];
report('vite-react18 consumer checks', [
  ...problems,
  ...checkResolution(cwd, ['@tessen-ui/icons/react', '@tessen-ui/react']),
  ...checkBuildOutput(cwd),
]);
