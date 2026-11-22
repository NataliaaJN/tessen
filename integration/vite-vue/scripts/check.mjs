// @ts-check
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateScale } from '@tessen-ui/theme';
import { checkBuildOutput, checkResolution, report } from '../../shared/consumer-checks.mjs';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * US-02: the theme exported from Studio must reach the built app after the library's own CSS,
 * with the values it was generated from.
 * @returns {string[]} errors
 */
function checkExportedTheme() {
  const assets = join(cwd, 'dist', 'assets');
  if (!existsSync(assets)) return ['dist/assets not found: run the build first'];
  const css = readdirSync(assets)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(assets, f), 'utf8'))
    .join('\n');
  /** @type {string[]} */
  const errors = [];
  const accent = generateScale('#D9822B');
  const brand800 = `--tessen-color-brand-800:${accent[800].toLowerCase()}`;
  const normalised = css.toLowerCase().replace(/\s+/g, '');
  if (!normalised.includes(brand800)) errors.push(`built CSS lacks the theme's ${brand800}`);
  if (!normalised.includes('--tessen-radius-base:12px'))
    errors.push('built CSS lacks --tessen-radius-base:12px');
  if (!normalised.includes('--tessen-density-scale:.875'))
    errors.push('built CSS lacks the compact density scale');
  // The theme is unlayered CSS that comes after the library tokens, so it wins without !important.
  const first = normalised.indexOf('--tessen-color-brand-800:');
  const last = normalised.lastIndexOf(brand800);
  if (last <= first) errors.push('the theme must come after the library tokens in the built CSS');
  return errors;
}

report('vite-vue consumer checks', [
  ...checkResolution(cwd, ['@tessen-ui/icons/vue', '@tessen-ui/vue']),
  ...checkBuildOutput(cwd),
  ...checkExportedTheme(),
]);
