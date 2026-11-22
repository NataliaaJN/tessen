import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

/** Spacing steps of `--tessen-space-*` that layout components accept. */
export const spaceSteps = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12'] as const;

export const stackVariants = defineVariants({
  base: 't-stack',
  variants: {
    direction: ['vertical', 'horizontal'],
    gap: spaceSteps,
    align: ['stretch', 'start', 'center', 'end'],
    justify: ['start', 'center', 'end', 'between'],
    wrap: 'boolean',
  },
  defaults: { direction: 'vertical', gap: '4', align: 'stretch', justify: 'start', wrap: false },
});

export type StackVariantProps = NonNullable<Parameters<typeof stackVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a div that stacks vertically with gap 4',
    props: { label: 'x' },
    expect: {
      tag: 'div',
      classes: ['t-stack'],
      attrs: {
        'data-direction': 'vertical',
        'data-gap': '4',
        'data-align': 'stretch',
        'data-justify': 'start',
        'data-wrap': null,
      },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'direction, gap, align, justify and wrap become data attributes',
    props: {
      label: 'x',
      extra: { direction: 'horizontal', gap: '2', align: 'center', justify: 'between', wrap: true },
    },
    expect: {
      attrs: {
        'data-direction': 'horizontal',
        'data-gap': '2',
        'data-align': 'center',
        'data-justify': 'between',
        'data-wrap': '',
      },
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'x', class: 'custom' },
    expect: { classes: ['t-stack', 'custom'] },
  },
];

export const stackContract = defineContract({
  name: 'Stack',
  names: { vue: 'TStack', react: 'Stack' },
  category: 'layout',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root'],
  props: [
    {
      name: 'direction',
      type: 'enum',
      values: stackVariants.config.variants.direction,
      default: 'vertical',
    },
    { name: 'gap', type: 'enum', values: spaceSteps, default: '4' },
    {
      name: 'align',
      type: 'enum',
      values: stackVariants.config.variants.align,
      default: 'stretch',
    },
    {
      name: 'justify',
      type: 'enum',
      values: stackVariants.config.variants.justify,
      default: 'start',
    },
    { name: 'wrap', type: 'boolean', default: false },
  ],
  cases,
});
