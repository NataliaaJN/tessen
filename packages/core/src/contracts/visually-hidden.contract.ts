import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const visuallyHiddenVariants = defineVariants({
  base: 't-visually-hidden',
  variants: { focusable: 'boolean' },
  defaults: { focusable: false },
});

export type VisuallyHiddenVariantProps = NonNullable<Parameters<typeof visuallyHiddenVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'keeps-text-in-dom',
    describe: 'renders its text in a span with the hiding class',
    props: { label: 'Skip to content' },
    expect: {
      tag: 'span',
      classes: ['t-visually-hidden'],
      text: 'Skip to content',
      attrs: { 'data-focusable': null },
    },
  },
  {
    id: 'focusable',
    describe: 'focusable reflects a data attribute so it becomes visible on focus',
    props: { label: 'Skip', extra: { focusable: true } },
    expect: { attrs: { 'data-focusable': '' } },
  },
];

export const visuallyHiddenContract = defineContract({
  name: 'VisuallyHidden',
  names: { vue: 'TVisuallyHidden', react: 'VisuallyHidden' },
  category: 'utilities',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/WCAG22/Techniques/css/C7',
  anatomy: ['root'],
  props: [{ name: 'focusable', type: 'boolean', default: false }],
  cases,
});
