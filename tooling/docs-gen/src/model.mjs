// Pure functions that turn contracts + the exports of the built packages into documentation data.
// No file system, no framework runtime: everything here is testable with plain objects.

/**
 * Contract prop names are neutral. Each framework spells some of them its own way
 * (`value` is `v-model` in Vue, `aria-label` is `ariaLabel`), so a contract prop is "covered" when
 * the Vue component has the prop itself or one of these spellings.
 */
/** @type {Record<string, string[]>} */
export const VUE_ALIASES = {
  value: ['modelValue'],
  checked: ['modelValue'],
  'aria-label': ['ariaLabel'],
};

/**
 * Contract props a Vue component deliberately does not declare, with the reason. Anything not
 * listed here that is missing is drift and fails `docs:check`.
 */
export const KNOWN_EXCEPTIONS = {
  'Dialog.size': 'lives on DialogContent (the part that is sized)',
  'AlertDialog.size': 'lives on AlertDialogContent (the part that is sized)',
  'Input.placeholder': 'native attribute, forwarded to the <input> (attribute passthrough)',
  'Textarea.placeholder': 'native attribute, forwarded to the <textarea> (attribute passthrough)',
};

/**
 * `ButtonGroup` -> `button-group`
 * @param {string} name
 */
export function slugOf(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * How a contract prop shows up in a Vue component: `own` (same name), `alias:<name>`,
 * `exception` (listed in KNOWN_EXCEPTIONS) or `missing` (drift).
 * @param {string} component
 * @param {string} prop
 * @param {string[]} vueProps
 */
export function vuePropStatus(component, prop, vueProps) {
  if (vueProps.includes(prop)) return 'own';
  const alias = (VUE_ALIASES[prop] ?? []).find((a) => vueProps.includes(a));
  if (alias) return `alias:${alias}`;
  if (`${component}.${prop}` in KNOWN_EXCEPTIONS) return 'exception';
  return 'missing';
}

/**
 * Compound parts of a component, from the export names of one framework: `TDialogContent` and
 * `TDialogTrigger` belong to `Dialog`, but `TButtonGroup` does not belong to `Button` because it is
 * the root of another contract.
 * @param {string} name contract name (`Dialog`)
 * @param {string[]} exportNames framework export names, already mapped to plain names
 * @param {string[]} allRoots plain root names of every contract
 */
export function partsOf(name, exportNames, allRoots) {
  const roots = new Set(allRoots);
  return exportNames
    .filter((e) => e !== name && e.startsWith(name) && /^[A-Z]/.test(e.slice(name.length)))
    .filter((e) => !roots.has(e))
    .sort();
}

/**
 * @typedef {object} FrameworkApi
 * @property {string[]} exports plain (unprefixed) export names
 * @property {Record<string, string[]>} [props] runtime prop names per plain component name
 */

/**
 * The part of a contract that the docs need (structurally what defineContract returns). Declared
 * here, not imported, so the root typecheck does not need the packages to be built first.
 * @typedef {object} Contract
 * @property {string} name
 * @property {{ vue: string, react: string }} names
 * @property {string} category
 * @property {string} tier
 * @property {string} engine
 * @property {string} apgPattern
 * @property {readonly string[]} anatomy
 * @property {readonly { name: string, type: string, values?: readonly string[], default?: string | boolean, required?: boolean }[]} props
 * @property {readonly { id: string, describe: string, [key: string]: unknown }[]} cases
 */

/**
 * @typedef {object} PropDoc
 * @property {string} name
 * @property {string} type
 * @property {string[]} [values]
 * @property {string | boolean} [default]
 * @property {boolean} required
 * @property {string} vue how the Vue component spells it (`own`, `alias:<name>`, `exception`, `missing`)
 */

/**
 * @typedef {object} ComponentDoc
 * @property {string} name
 * @property {string} slug
 * @property {{ vue: string, react: string }} names
 * @property {string} category
 * @property {string} tier
 * @property {string} engine
 * @property {string} apgPattern
 * @property {string[]} anatomy
 * @property {{ vue: boolean, react: boolean }} frameworks
 * @property {{ vue: string[], react: string[] }} parts
 * @property {PropDoc[]} props
 * @property {{ id: string, describe: string }[]} behaviours
 * @property {{ vue: string, react: string }} example
 */

/**
 * @param {Contract} contract
 * @param {{ vue: FrameworkApi, react: FrameworkApi, roots: string[], snippets: { vue: string, react: string } }} ctx
 * @returns {ComponentDoc}
 */
export function buildComponentDoc(contract, ctx) {
  const key = contract.names.react; // the exported (plain) name; differs from `name` for Toast -> Toaster
  const vueProps = ctx.vue.props?.[key] ?? [];
  const compound = partsOf(key, ctx.react.exports, ctx.roots);
  return {
    name: contract.name,
    slug: slugOf(contract.name),
    names: contract.names,
    category: contract.category,
    tier: contract.tier,
    engine: contract.engine,
    apgPattern: contract.apgPattern,
    anatomy: [...contract.anatomy],
    frameworks: {
      vue: ctx.vue.exports.includes(key),
      react: ctx.react.exports.includes(key),
    },
    parts: {
      vue: partsOf(key, ctx.vue.exports, ctx.roots).map((p) => `T${p}`),
      react: partsOf(key, ctx.react.exports, ctx.roots),
    },
    props: contract.props.map((p) => ({
      name: p.name,
      type: p.type,
      values: p.values ? [...p.values] : undefined,
      default: p.default,
      required: p.required === true,
      vue: vuePropStatus(contract.name, p.name, vueProps),
    })),
    // The behaviours the component is tested for, in the contract's own words.
    behaviours: contract.cases.map((c) => ({ id: c.id, describe: c.describe })),
    example: compound.length > 0 ? compoundSnippets(contract.names, compound) : ctx.snippets,
  };
}

/**
 * Problems that make `docs:check` fail.
 * @param {ComponentDoc[]} docs
 */
export function checkDocs(docs) {
  /** @type {string[]} */
  const problems = [];
  for (const d of docs) {
    if (!d.frameworks.vue) problems.push(`${d.name}: not exported by @tessen-ui/vue`);
    if (!d.frameworks.react) problems.push(`${d.name}: not exported by @tessen-ui/react`);
    if (d.behaviours.length === 0) problems.push(`${d.name}: contract has no cases`);
    for (const p of d.props)
      if (p.vue === 'missing')
        problems.push(
          `${d.name}.${p.name}: in the contract but not a prop of ${d.names.vue} (add it, or list it in KNOWN_EXCEPTIONS with the reason)`,
        );
  }
  for (const key of Object.keys(KNOWN_EXCEPTIONS)) {
    const [component, prop] = key.split('.');
    const d = docs.find((x) => x.name === component);
    const p = d?.props.find((x) => x.name === prop);
    if (p && p.vue !== 'exception')
      problems.push(`KNOWN_EXCEPTIONS has a stale entry: ${key} is now declared`);
  }
  return problems;
}

/**
 * Light index used by the catalogue and search.
 * @param {ComponentDoc[]} docs
 */
export function buildIndex(docs) {
  return docs
    .map((d) => ({
      name: d.name,
      slug: d.slug,
      category: d.category,
      tier: d.tier,
      engine: d.engine,
      propCount: d.props.length,
      parts: d.parts.react.length,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

/**
 * `llms.txt` (llmstxt.org shape): a map of the documentation for language models.
 * @param {ComponentDoc[]} docs
 * @param {string} [base]
 */
export function buildLlmsTxt(docs, base = '') {
  const lines = [
    '# Tessen',
    '',
    '> Design system for Vue 3 and React with one contract per component: the same props, behaviour and accessibility in both frameworks. Vue exports T-prefixed names (TButton), React plain names (Button).',
    '',
    '## Components',
    '',
  ];
  for (const d of buildIndex(docs)) {
    const full = docs.find((x) => x.name === d.name);
    if (!full) continue;
    lines.push(
      `- [${d.name}](${base}/components/${d.slug}.json): ${full.category}, ${full.engine} engine, ${d.propCount} props`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * A generic one-line snippet reads wrong for compound components (`<Dialog>Dialog</Dialog>`), so
 * these get a skeleton that lists their parts, one per line.
 * @param {{ vue: string, react: string }} names
 * @param {string[]} parts plain part names
 */
export function compoundSnippets(names, parts) {
  /** @type {(root: string, prefix: string) => string} */
  const skeleton = (root, prefix) =>
    [`<${root}>`, ...parts.map((p) => `  <${prefix}${p} />`), `</${root}>`].join('\n');
  return { vue: skeleton(names.vue, 'T'), react: skeleton(names.react, '') };
}
