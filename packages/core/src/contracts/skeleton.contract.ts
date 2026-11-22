import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const skeletonVariants = defineVariants({
  base: 't-skeleton',
  variants: { shape: ['text', 'rect', 'circle'], animated: 'boolean' },
  defaults: { shape: 'text', animated: true },
});

export type SkeletonVariantProps = NonNullable<Parameters<typeof skeletonVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'decorative-and-animated',
    describe: 'is hidden from assistive technology and animated by default',
    props: {},
    expect: {
      tag: 'span',
      classes: ['t-skeleton'],
      attrs: { 'aria-hidden': 'true', 'data-shape': 'text', 'data-animated': '' },
    },
  },
  {
    id: 'shape-and-static',
    describe: 'shape is reflected and animated can be turned off',
    props: { extra: { shape: 'circle', animated: false } },
    expect: { attrs: { 'data-shape': 'circle', 'data-animated': null } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-skeleton', 'custom'] },
  },
];

export const skeletonContract = defineContract({
  name: 'Skeleton',
  names: { vue: 'TSkeleton', react: 'Skeleton' },
  category: 'feedback',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/TR/wai-aria-1.2/#aria-busy',
  anatomy: ['root'],
  props: [
    {
      name: 'shape',
      type: 'enum',
      values: skeletonVariants.config.variants.shape,
      default: 'text',
    },
    { name: 'animated', type: 'boolean', default: true },
  ],
  cases,
});
