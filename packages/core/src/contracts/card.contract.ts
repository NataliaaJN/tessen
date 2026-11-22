import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const cardVariants = defineVariants({
  base: 't-card',
  variants: { variant: ['outlined', 'elevated', 'filled'], padding: ['none', 'sm', 'md', 'lg'] },
  defaults: { variant: 'outlined', padding: 'md' },
});

export type CardVariantProps = NonNullable<Parameters<typeof cardVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a div with a body and the documented defaults; no header or footer',
    props: { label: 'Content' },
    expect: {
      tag: 'div',
      classes: ['t-card'],
      attrs: { 'data-variant': 'outlined', 'data-padding': 'md' },
      parts: { '.t-card__body': true, '.t-card__header': false, '.t-card__footer': false },
      within: { '.t-card__body': { text: 'Content' } },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variant and padding become data attributes',
    props: { label: 'Content', variant: 'elevated', extra: { padding: 'lg' } },
    expect: { attrs: { 'data-variant': 'elevated', 'data-padding': 'lg' } },
  },
  {
    id: 'header-and-footer',
    describe: 'header and footer render only when provided',
    props: { label: 'Content', leading: 'Head', trailing: 'Foot' },
    expect: {
      parts: { '.t-card__header': true, '.t-card__footer': true },
      within: { '.t-card__header': { text: 'Head' }, '.t-card__footer': { text: 'Foot' } },
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Content', class: 'custom' },
    expect: { classes: ['t-card', 'custom'] },
  },
];

export const cardContract = defineContract({
  name: 'Card',
  names: { vue: 'TCard', react: 'Card' },
  category: 'data-display',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root', 'header', 'body', 'footer'],
  props: [
    {
      name: 'variant',
      type: 'enum',
      values: cardVariants.config.variants.variant,
      default: 'outlined',
    },
    { name: 'padding', type: 'enum', values: cardVariants.config.variants.padding, default: 'md' },
  ],
  cases,
});
