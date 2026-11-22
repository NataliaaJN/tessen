import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const spinnerVariants = defineVariants({
  base: 't-spinner',
  variants: { size: ['sm', 'md', 'lg'] },
  defaults: { size: 'md' },
});

export type SpinnerVariantProps = NonNullable<Parameters<typeof spinnerVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'status-with-default-label',
    describe: 'is a status region whose text is the default label',
    props: {},
    expect: {
      role: 'status',
      classes: ['t-spinner'],
      text: 'Loading',
      attrs: { 'data-size': 'md' },
      parts: { '.t-spinner__circle': true, '.t-spinner__label': true },
    },
  },
  {
    id: 'custom-label-and-size',
    describe: 'a custom label replaces the text and the size is reflected',
    props: { label: 'Saving', size: 'lg' },
    expect: { text: 'Saving', attrs: { 'data-size': 'lg' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-spinner', 'custom'] },
  },
];

export const spinnerContract = defineContract({
  name: 'Spinner',
  names: { vue: 'TSpinner', react: 'Spinner' },
  category: 'feedback',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/TR/wai-aria-1.2/#status',
  anatomy: ['root', 'circle', 'label'],
  props: [
    { name: 'size', type: 'enum', values: spinnerVariants.config.variants.size, default: 'md' },
    { name: 'label', type: 'string', default: 'Loading' },
  ],
  cases,
});
