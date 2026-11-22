import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const dividerVariants = defineVariants({
  base: 't-divider',
  variants: { orientation: ['horizontal', 'vertical'] },
  defaults: { orientation: 'horizontal' },
});

export type DividerVariantProps = NonNullable<Parameters<typeof dividerVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'horizontal-is-hr',
    describe: 'horizontal is a native hr (implicit separator role)',
    props: {},
    expect: {
      tag: 'hr',
      role: 'separator',
      classes: ['t-divider'],
      attrs: { 'data-orientation': 'horizontal', 'aria-orientation': null },
    },
  },
  {
    id: 'vertical-is-separator',
    describe: 'vertical is a separator with aria-orientation',
    props: { extra: { orientation: 'vertical' } },
    expect: {
      role: 'separator',
      attrs: { 'data-orientation': 'vertical', 'aria-orientation': 'vertical' },
    },
  },
  {
    id: 'decorative-has-no-role',
    describe: 'decorative hides it from assistive technology',
    props: { extra: { decorative: true } },
    expect: { attrs: { role: 'none', 'aria-orientation': null } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-divider', 'custom'] },
  },
];

export const dividerContract = defineContract({
  name: 'Divider',
  names: { vue: 'TDivider', react: 'Divider' },
  category: 'layout',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/separator/',
  anatomy: ['root'],
  props: [
    {
      name: 'orientation',
      type: 'enum',
      values: dividerVariants.config.variants.orientation,
      default: 'horizontal',
    },
    { name: 'decorative', type: 'boolean', default: false },
  ],
  cases,
});
