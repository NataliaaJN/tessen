import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const aspectRatioVariants = defineVariants({
  base: 't-aspect-ratio',
  variants: { ratio: ['1/1', '4/3', '3/2', '16/9', '21/9'] },
  defaults: { ratio: '16/9' },
});

export type AspectRatioVariantProps = NonNullable<Parameters<typeof aspectRatioVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a div with the 16/9 ratio',
    props: { label: 'x' },
    expect: { tag: 'div', classes: ['t-aspect-ratio'], attrs: { 'data-ratio': '16/9' } },
  },
  {
    id: 'ratio-reflects-attr',
    describe: 'ratio becomes a data attribute',
    props: { label: 'x', extra: { ratio: '1/1' } },
    expect: { attrs: { 'data-ratio': '1/1' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'x', class: 'custom' },
    expect: { classes: ['t-aspect-ratio', 'custom'] },
  },
];

export const aspectRatioContract = defineContract({
  name: 'AspectRatio',
  names: { vue: 'TAspectRatio', react: 'AspectRatio' },
  category: 'layout',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root'],
  props: [
    {
      name: 'ratio',
      type: 'enum',
      values: aspectRatioVariants.config.variants.ratio,
      default: '16/9',
    },
  ],
  cases,
});
