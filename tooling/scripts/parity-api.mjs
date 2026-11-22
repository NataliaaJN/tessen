// parity:api — the Vue and React packages must expose the same components.
//
// Vue exports `T`-prefixed names (TButton), React plain names (Button): ADR 0011. This script loads the
// BUILT bundles (what a consumer gets), maps both to the plain name and fails on any component that
// exists in one framework and not in the other. A deliberate asymmetry has to be listed in
// `ALLOWED_ONLY_IN` with its reason, so it shows up in review.
//
// Run `pnpm build` first (`pnpm verify` does).

import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Exports that legitimately exist in only one framework. */
export const ALLOWED_ONLY_IN = {
  vue: {},
  react: {},
};

/** `TButton` -> `Button`; anything that is not a `T`-prefixed PascalCase name is kept as is. */
/** @param {string} vueName */
export function plainName(vueName) {
  return /^T[A-Z]/.test(vueName) ? vueName.slice(1) : vueName;
}

/**
 * @param {string[]} vueNames export names of @tessen-ui/vue
 * @param {string[]} reactNames export names of @tessen-ui/react
 * @param {{ vue?: Record<string, string>, react?: Record<string, string> }} allowed
 */
export function compareApi(vueNames, reactNames, allowed = ALLOWED_ONLY_IN) {
  const vue = new Set(vueNames.map(plainName));
  const react = new Set(reactNames);
  const onlyInVue = [...vue].filter((n) => !react.has(n) && !(n in (allowed.vue ?? {}))).sort();
  const onlyInReact = [...react].filter((n) => !vue.has(n) && !(n in (allowed.react ?? {}))).sort();
  const unprefixedInVue = vueNames.filter(
    (n) => /^[A-Z]/.test(n) && !/^T[A-Z]/.test(n) && !(n in (allowed.vue ?? {})),
  );
  return { onlyInVue, onlyInReact, unprefixedInVue, shared: [...vue].filter((n) => react.has(n)) };
}

/** @param {string} pkg */
async function exportsOf(pkg) {
  const entry = pathToFileURL(resolve(root, 'packages', pkg, 'dist', 'index.js')).href;
  return Object.keys(await import(entry));
}

async function main() {
  const [vueNames, reactNames] = await Promise.all([exportsOf('vue'), exportsOf('react')]);
  const result = compareApi(vueNames, reactNames);
  const problems = [];
  for (const n of result.onlyInVue) problems.push(`only in @tessen-ui/vue: T${n}`);
  for (const n of result.onlyInReact) problems.push(`only in @tessen-ui/react: ${n}`);
  for (const n of result.unprefixedInVue)
    problems.push(`@tessen-ui/vue export without T prefix: ${n}`);
  if (problems.length > 0) {
    console.error(`parity:api FAILED\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`parity:api OK: ${result.shared.length} components exported by both frameworks.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
