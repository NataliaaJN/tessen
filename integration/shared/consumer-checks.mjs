// @ts-check
/**
 * Checks shared by the `integration/*` projects (ADR 0016). They run as a consumer would:
 * every import goes through `node` with the project as cwd, so resolution only sees what
 * the installed tarballs expose through `exports`. Only Node built-ins are used here.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Subpaths a consumer may import as JavaScript. */
export const JS_ENTRIES = [
  '@tessen-ui/tokens',
  '@tessen-ui/core',
  '@tessen-ui/core/variants',
  '@tessen-ui/core/codegen',
  '@tessen-ui/core/contracts',
  '@tessen-ui/core/contracts/button',
  '@tessen-ui/core/contracts/dialog',
  '@tessen-ui/core/contracts/tabs',
  '@tessen-ui/motion',
];

/** Files a consumer may resolve (CSS/JSON/SVG), checked with `import.meta.resolve`. */
export const FILE_ENTRIES = [
  '@tessen-ui/tokens/tokens.css',
  '@tessen-ui/tokens/tokens.json',
  '@tessen-ui/styles',
  '@tessen-ui/styles/index.css',
  '@tessen-ui/styles/layers.css',
  '@tessen-ui/styles/tokens.css',
  '@tessen-ui/styles/reset.css',
  '@tessen-ui/styles/base.css',
  '@tessen-ui/styles/components/button.css',
  '@tessen-ui/styles/components/dialog.css',
  '@tessen-ui/styles/components/tabs.css',
  '@tessen-ui/styles/components/layout.css',
  '@tessen-ui/styles/components/toggles.css',
  '@tessen-ui/motion/motion.css',
  '@tessen-ui/icons/sprite.svg',
  '@tessen-ui/icons/manifest.json',
  '@tessen-ui/icons/svg/check.svg',
];

/** Paths that exist inside the tarballs but are not part of the public `exports`. */
export const PRIVATE_PATHS = [
  '@tessen-ui/core/dist/js/variants.js',
  '@tessen-ui/tokens/src/primitives/color.json',
  '@tessen-ui/styles/dist/layers.css',
  '@tessen-ui/icons/dist/vue/index.js',
];

/**
 * @param {string} cwd project dir
 * @param {string} code module code (top-level await allowed)
 */
function node(cwd, code) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd,
    encoding: 'utf8',
  });
}

/**
 * @param {string} cwd project dir
 * @param {string[]} iconEntries `@tessen-ui/icons/vue` or `/react`, depending on the framework
 * @returns {string[]} errors
 */
export function checkResolution(cwd, iconEntries) {
  /** @type {string[]} */
  const errors = [];
  for (const spec of [...JS_ENTRIES, ...iconEntries]) {
    const r = node(
      cwd,
      `const m = await import(${JSON.stringify(spec)}); if (Object.keys(m).length === 0) throw new Error('no exports');`,
    );
    if (r.status !== 0) {
      errors.push(
        `import("${spec}") failed: ${r.stderr.split('\n').find((l) => /Error/.test(l)) ?? r.stderr}`,
      );
    }
  }
  for (const spec of FILE_ENTRIES) {
    const r = node(cwd, `import.meta.resolve(${JSON.stringify(spec)});`);
    if (r.status !== 0) errors.push(`resolve("${spec}") failed`);
  }
  for (const spec of PRIVATE_PATHS) {
    const r = node(cwd, `await import(${JSON.stringify(spec)});`);
    if (!/ERR_PACKAGE_PATH_NOT_EXPORTED/.test(r.stderr)) {
      errors.push(`"${spec}" should NOT be importable (not in exports)`);
    }
  }
  return errors;
}

/**
 * @param {string} cwd project dir
 * @returns {string[]} errors
 */
export function checkBuildOutput(cwd) {
  /** @type {string[]} */
  const errors = [];
  const assets = join(cwd, 'dist', 'assets');
  if (!existsSync(assets)) return ['dist/assets not found: run the build first'];
  const files = readdirSync(assets);
  const read = (/** @type {string} */ ext) =>
    files
      .filter((f) => f.endsWith(ext))
      .map((f) => readFileSync(join(assets, f), 'utf8'))
      .join('\n');
  const css = read('.css');
  const js = read('.js');

  // CSS reaches the consumer build with the layer order intact and tokens present.
  // The minifier may split one `@layer a, b, c;` statement into several, so compare the
  // effective order (first appearance of each layer name), not the literal text.
  /** @type {string[]} */
  const seen = [];
  for (const m of css.matchAll(/@layer\s+([^;{]+)[;{]/g)) {
    for (const name of (m[1] ?? '').split(',').map((s) => s.trim())) {
      if (name.startsWith('tessen.') && !seen.includes(name)) seen.push(name);
    }
  }
  const expected = [
    'tessen.reset',
    'tessen.tokens',
    'tessen.base',
    'tessen.components',
    'tessen.utilities',
  ];
  if (seen.join() !== expected.join()) {
    errors.push(`built CSS layer order is [${seen.join(', ')}], expected [${expected.join(', ')}]`);
  }
  if (!css.includes('--tessen-color-neutral-50')) errors.push('built CSS has no design tokens');
  if (!css.includes('@keyframes'))
    errors.push('built CSS has no motion keyframes (motion.css missing)');

  // Tree-shaking: the app uses the Button component, never the contract cases.
  for (const marker of [
    'role-name-defaults',
    'loading-keeps-focus',
    'escape-closes-and-restores-focus',
    'defineContract',
  ]) {
    if (js.includes(marker))
      errors.push(`bundle contains "${marker}": unused core exports were not tree-shaken`);
  }
  for (const cls of ['t-button', 't-dialog', 't-tabs', 't-field', 't-checkbox']) {
    if (!js.includes(cls)) errors.push(`bundle has no "${cls}": core is not wired into the app`);
  }
  return errors;
}

/**
 * Prints the result and exits non-zero when anything failed.
 * @param {string} label
 * @param {string[]} errors
 */
export function report(label, errors) {
  if (errors.length > 0) {
    console.error(`${label} failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`${label} passed`);
}
