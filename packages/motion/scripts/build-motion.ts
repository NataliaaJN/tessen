/** `pnpm build` (CSS half): generates dist/css/motion.css from the preset data. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderMotionCss } from './lib/css.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokensCss = readFileSync(
  fileURLToPath(import.meta.resolve('@tessen-ui/tokens/tokens.css')),
  'utf8',
);

mkdirSync(`${root}dist/css`, { recursive: true });
writeFileSync(`${root}dist/css/motion.css`, renderMotionCss(tokensCss));
console.log('built dist/css/motion.css');
