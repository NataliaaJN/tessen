// @ts-check
/**
 * `pnpm new:component <Name> [--tag span] [--category feedback] [--variant size=sm,md,lg]... [--boolean block]...`
 *
 * Scaffolds a "plain element + variants" component end to end: contract (core), CSS (styles),
 * Vue, React and their contract tests, plus the export lines. The first value of each variant is
 * its default. Compound or engine-backed components (Zag) start from the same contract file but
 * need their own anatomy; this covers the repeated part (F2 cost measurement: docs/planning/F2-closing.md).
 */
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} name */
export const toKebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

/** @param {string} name */
export const toPascal = (name) =>
  toKebab(name)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** @param {string} name */
const toCamel = (name) => {
  const pascal = toPascal(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * @typedef {{ name: string; values: string[] }} EnumVariant
 * @typedef {{ name: string; tag: string; category: string; variants: EnumVariant[]; booleans: string[] }} Spec
 */

const DOM_TYPES = {
  div: 'HTMLDivElement',
  span: 'HTMLSpanElement',
  p: 'HTMLParagraphElement',
  section: 'HTMLElement',
  article: 'HTMLElement',
  nav: 'HTMLElement',
  header: 'HTMLElement',
  footer: 'HTMLElement',
  ul: 'HTMLUListElement',
};

/** @param {Spec} spec @returns {Record<string, string>} path (relative to the repo) -> content */
export function renderComponent(spec) {
  const kebab = toKebab(spec.name);
  const Name = toPascal(spec.name);
  const camel = toCamel(spec.name);
  const dom = /** @type {Record<string, string>} */ (DOM_TYPES)[spec.tag] ?? 'HTMLElement';
  const lit = (/** @type {string[]} */ values) => values.map((v) => `'${v}'`).join(' | ');
  const props = [
    ...spec.variants.map((v) => ({ name: v.name, type: lit(v.values), bool: false })),
    ...spec.booleans.map((b) => ({ name: b, type: 'boolean', bool: true })),
  ];

  const variantsConfig = [
    ...spec.variants.map((v) => `    ${v.name}: [${v.values.map((x) => `'${x}'`).join(', ')}],`),
    ...spec.booleans.map((b) => `    ${b}: 'boolean',`),
  ].join('\n');
  const defaults = [
    ...spec.variants.map((v) => `${v.name}: '${v.values[0]}'`),
    ...spec.booleans.map((b) => `${b}: false`),
  ].join(', ');
  const defaultAttrs = spec.variants
    .map((v) => `        'data-${v.name}': '${v.values[0]}',`)
    .join('\n');
  const nonDefault = spec.variants.map((v) => ({
    name: v.name,
    value: v.values[1] ?? v.values[0],
  }));
  const reflectProps = [
    ...nonDefault.map((v) => `${v.name}: '${v.value}'`),
    ...spec.booleans.map((b) => `${b}: true`),
  ].join(', ');
  const reflectAttrs = [
    ...nonDefault.map((v) => `'data-${v.name}': '${v.value}'`),
    ...spec.booleans.map((b) => `'data-${b}': ''`),
  ].join(', ');
  const propSpecs = [
    ...spec.variants.map(
      (v) =>
        `    { name: '${v.name}', type: 'enum', values: ${camel}Variants.config.variants.${v.name}, default: '${v.values[0]}' },`,
    ),
    ...spec.booleans.map((b) => `    { name: '${b}', type: 'boolean', default: false },`),
  ].join('\n');

  const contract = `import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const ${camel}Variants = defineVariants({
  base: 't-${kebab}',
  variants: {
${variantsConfig}
  },
  defaults: { ${defaults} },
});

export type ${Name}VariantProps = NonNullable<Parameters<typeof ${camel}Variants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a ${spec.tag} with its content and the documented defaults',
    props: { label: 'x' },
    expect: {
      tag: '${spec.tag}',
      text: 'x',
      classes: ['t-${kebab}'],
      attrs: {
${defaultAttrs}
      },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variants become data attributes',
    props: { label: 'x', extra: { ${reflectProps} } },
    expect: { attrs: { ${reflectAttrs} } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'x', class: 'custom' },
    expect: { classes: ['t-${kebab}', 'custom'] },
  },
];

export const ${camel}Contract = defineContract({
  name: '${Name}',
  names: { vue: 'T${Name}', react: '${Name}' },
  category: '${spec.category}',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root'],
  props: [
${propSpecs}
  ],
  cases,
});
`;

  const vueProps = props.map((p) => `    ${p.name}?: ${p.type};`).join('\n');
  const vueDefaults = props.map((p) => `${p.name}: undefined`).join(', ');
  const call = props.map((p) => `${p.name}: props.${p.name}`).join(', ');
  const vue = `<script setup lang="ts">
import { ${camel}Variants } from '@tessen-ui/core/contracts/${kebab}';
import { computed } from 'vue';

defineOptions({ name: 'T${Name}' });

const props = withDefaults(
  defineProps<{
${vueProps}
  }>(),
  { ${vueDefaults} },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => ${camel}Variants({ ${call} }));
</script>

<template>
  <${spec.tag} :class="resolved.class" v-bind="resolved.attrs"><slot /></${spec.tag}>
</template>
`;
  const names = props.map((p) => p.name).join(', ');
  const react = `'use client';

import { ${camel}Variants, type ${Name}VariantProps } from '@tessen-ui/core/contracts/${kebab}';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface ${Name}Props
  extends ${Name}VariantProps, Omit<HTMLAttributes<${dom}>, keyof ${Name}VariantProps> {}

export const ${Name} = forwardRef<${dom}, ${Name}Props>(function ${Name}(
  { ${names}, className, ...rest },
  ref,
) {
  const resolved = ${camel}Variants({ ${names} });
  return <${spec.tag} {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />;
});
`;
  const vueTest = `import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { ${camel}Contract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import T${Name} from './${Name}.vue';

runContract(${camel}Contract, vueAdapter('Vue (VTU)', T${Name}));

describe('T${Name} · axe', () => {
  it('has no violations', async () => {
    const wrapper = mount(T${Name}, { slots: { default: 'x' }, attachTo: document.body });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
`;
  const reactTest = `import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { ${camel}Contract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { ${Name} } from './${Name}.tsx';

runContract(${camel}Contract, reactAdapter('React (RTL)', ${Name}));

describe('${Name} · axe', () => {
  it('has no violations', async () => {
    const { container, unmount } = render(<${Name}>x</${Name}>);
    await expectNoA11yViolations(container);
    unmount();
  });
});
`;
  const css = `/* ${Name}. Contract: @tessen-ui/core ${camel}Contract. Only semantic tokens and --t-${kebab}-* overrides. */
@layer tessen.components {
  .t-${kebab} {
    box-sizing: border-box;
    font-family: var(--tessen-font-family-sans);
    color: var(--tessen-color-text-primary);
  }
}
`;

  return {
    [`packages/core/src/contracts/${kebab}.contract.ts`]: contract,
    [`packages/vue/src/components/${kebab}/${Name}.vue`]: vue,
    [`packages/vue/src/components/${kebab}/index.ts`]: `export { default as T${Name} } from './${Name}.vue';\n`,
    [`packages/vue/src/components/${kebab}/${kebab}.test.ts`]: vueTest,
    [`packages/react/src/components/${kebab}/${Name}.tsx`]: react,
    [`packages/react/src/components/${kebab}/index.ts`]: `export { ${Name} } from './${Name}.tsx';\nexport type { ${Name}Props } from './${Name}.tsx';\n`,
    [`packages/react/src/components/${kebab}/${kebab}.test.tsx`]: reactTest,
    [`packages/styles/src/components/${kebab}.css`]: css,
  };
}

/** Lines appended to the existing barrel files. @param {Spec} spec @returns {Record<string, string>} */
export function renderExports(spec) {
  const kebab = toKebab(spec.name);
  const Name = toPascal(spec.name);
  const camel = toCamel(spec.name);
  return {
    'packages/core/src/contracts/index.ts': `export { ${camel}Contract, ${camel}Variants } from './${kebab}.contract.ts';\nexport type { ${Name}VariantProps } from './${kebab}.contract.ts';\n`,
    'packages/vue/src/index.ts': `export * from './components/${kebab}/index.js';\n`,
    'packages/react/src/index.ts': `export * from './components/${kebab}/index.ts';\n`,
  };
}

/** @param {string[]} argv @returns {Spec} */
export function parseArgs(argv) {
  const [name, ...rest] = argv;
  if (!name || name.startsWith('--'))
    throw new Error(
      'Usage: new:component <Name> [--tag span] [--category x] [--variant size=sm,md] [--boolean block]',
    );
  /** @type {Spec} */
  const spec = { name, tag: 'div', category: 'misc', variants: [], booleans: [] };
  for (let i = 0; i < rest.length; i += 2) {
    const flag = rest[i];
    const value = rest[i + 1];
    if (value === undefined) throw new Error(`Missing value for ${flag}`);
    if (flag === '--tag') spec.tag = value;
    else if (flag === '--category') spec.category = value;
    else if (flag === '--boolean') spec.booleans.push(value);
    else if (flag === '--variant') {
      const [variant, values] = value.split('=');
      if (!variant || !values) throw new Error(`Bad --variant "${value}" (expected name=a,b,c)`);
      spec.variants.push({ name: variant, values: values.split(',') });
    } else throw new Error(`Unknown flag ${flag}`);
  }
  return spec;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const spec = parseArgs(process.argv.slice(2));
  const files = renderComponent(spec);
  for (const path of Object.keys(files)) {
    if (existsSync(join(root, path))) throw new Error(`Refusing to overwrite ${path}`);
  }
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  for (const [path, content] of Object.entries(renderExports(spec))) {
    appendFileSync(join(root, path), content);
  }
  console.log(
    `Created ${spec.name}: ${Object.keys(files).length} files. Now run pnpm format && pnpm verify.`,
  );
}
