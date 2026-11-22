// Loads the real contracts and the BUILT framework packages (what a consumer gets) and runs the
// pure model over them. Build first (`pnpm build`).
//
// The specifiers are variables on purpose: the root `tsc` (checkJs over tooling/) runs before any
// package is built, so it must not try to resolve them. Same approach as parity-api.mjs.

import { buildComponentDoc } from './model.mjs';

/**
 * `TButton` -> `Button`; other names are kept.
 * @param {string} n
 */
const plain = (n) => (/^T[A-Z]/.test(n) ? n.slice(1) : n);

/**
 * @param {string} specifier
 * @returns {Promise<any>}
 */
const load = (specifier) => import(specifier);

export async function loadDocs() {
  const [vue, react, contracts, codegen] = await Promise.all([
    load('@tessen-ui/vue'),
    load('@tessen-ui/react'),
    load('@tessen-ui/core/contracts'),
    load('@tessen-ui/core/codegen'),
  ]);

  /** @type {import('./model.mjs').Contract[]} */
  const list = Object.values(contracts)
    .filter((v) => typeof v === 'object' && v !== null && 'names' in v && 'cases' in v)
    .sort((a, b) => a.name.localeCompare(b.name));

  const vueExports = Object.keys(vue).map(plain);
  /** @type {Record<string, string[]>} */
  const vueProps = {};
  for (const [key, value] of Object.entries(vue)) {
    if (value && typeof value === 'object' && value.props)
      vueProps[plain(key)] = Object.keys(value.props);
  }
  const roots = list.map((c) => c.names.react);
  return list.map((contract) =>
    buildComponentDoc(contract, {
      vue: { exports: vueExports, props: vueProps },
      react: { exports: Object.keys(react) },
      roots,
      snippets: {
        vue: codegen.generateSnippet(contract, 'vue', { label: contract.name }),
        react: codegen.generateSnippet(contract, 'react', { label: contract.name }),
      },
    }),
  );
}
