import { defineContract, type ContractCase } from './contract.ts';
import { spaceSteps } from './stack.contract.ts';
import { defineVariants } from '../variants.ts';

export const gridVariants = defineVariants({
  base: 't-grid',
  variants: {
    columns: ['1', '2', '3', '4', '6', '12', 'auto'],
    gap: spaceSteps,
  },
  defaults: { columns: '1', gap: '4' },
});

export type GridVariantProps = NonNullable<Parameters<typeof gridVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a div with one column and gap 4',
    props: { label: 'x' },
    expect: {
      tag: 'div',
      classes: ['t-grid'],
      attrs: { 'data-columns': '1', 'data-gap': '4' },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'columns and gap become data attributes',
    props: { label: 'x', extra: { columns: 'auto', gap: '6' } },
    expect: { attrs: { 'data-columns': 'auto', 'data-gap': '6' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'x', class: 'custom' },
    expect: { classes: ['t-grid', 'custom'] },
  },
];

export const gridContract = defineContract({
  name: 'Grid',
  names: { vue: 'TGrid', react: 'Grid' },
  category: 'layout',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root'],
  props: [
    { name: 'columns', type: 'enum', values: gridVariants.config.variants.columns, default: '1' },
    { name: 'gap', type: 'enum', values: spaceSteps, default: '4' },
  ],
  cases,
});
