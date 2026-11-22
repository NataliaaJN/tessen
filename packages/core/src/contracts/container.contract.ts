import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const containerVariants = defineVariants({
  base: 't-container',
  variants: { size: ['sm', 'md', 'lg', 'xl', 'full'], gutters: 'boolean' },
  defaults: { size: 'lg', gutters: true },
});

export type ContainerVariantProps = NonNullable<Parameters<typeof containerVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a div with the lg max width and gutters',
    props: { label: 'x' },
    expect: {
      tag: 'div',
      classes: ['t-container'],
      attrs: { 'data-size': 'lg', 'data-gutters': '' },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'size is reflected and gutters can be turned off',
    props: { label: 'x', size: 'sm', extra: { gutters: false } },
    expect: { attrs: { 'data-size': 'sm', 'data-gutters': null } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'x', class: 'custom' },
    expect: { classes: ['t-container', 'custom'] },
  },
];

export const containerContract = defineContract({
  name: 'Container',
  names: { vue: 'TContainer', react: 'Container' },
  category: 'layout',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root'],
  props: [
    { name: 'size', type: 'enum', values: containerVariants.config.variants.size, default: 'lg' },
    { name: 'gutters', type: 'boolean', default: true },
  ],
  cases,
});
