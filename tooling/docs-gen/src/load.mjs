// Loads the real contracts and the BUILT framework packages (what a consumer gets) and runs the
// pure model over them. Build first (`pnpm build`).

import * as vue from '@tessen-ui/vue';
import * as react from '@tessen-ui/react';
import * as contracts from '@tessen-ui/core/contracts';
import { generateSnippet } from '@tessen-ui/core/codegen';
import { buildComponentDoc } from './model.mjs';

/**
 * `TButton` -> `Button`; other names are kept.
 * @param {string} n
 */
const plain = (n) => (/^T[A-Z]/.test(n) ? n.slice(1) : n);

/** @returns {import('@tessen-ui/core').Contract[]} */
export function loadContracts() {
  const all = /** @type {unknown[]} */ (Object.values(contracts));
  const found = all.filter(
    (value) => typeof value === 'object' && value !== null && 'names' in value && 'cases' in value,
  );
  return /** @type {import('@tessen-ui/core').Contract[]} */ (found).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function loadDocs() {
  const list = loadContracts();
  const vueModule = /** @type {Record<string, unknown>} */ (vue);
  const vueExports = Object.keys(vueModule).map(plain);
  /** @type {Record<string, string[]>} */
  const vueProps = {};
  for (const [key, value] of Object.entries(vueModule)) {
    const props = /** @type {{ props?: object } | null} */ (value)?.props;
    if (props) vueProps[plain(key)] = Object.keys(props);
  }
  const roots = list.map((c) => c.names.react);
  return list.map((contract) =>
    buildComponentDoc(contract, {
      vue: { exports: vueExports, props: vueProps },
      react: { exports: Object.keys(react) },
      roots,
      snippets: {
        vue: generateSnippet(contract, 'vue', { label: contract.name }),
        react: generateSnippet(contract, 'react', { label: contract.name }),
      },
    }),
  );
}
