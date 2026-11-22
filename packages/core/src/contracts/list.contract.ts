import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const listVariants = defineVariants({
  base: 't-list',
  variants: { variant: ['plain', 'divided', 'bulleted'], ordered: 'boolean' },
  defaults: { variant: 'plain', ordered: false },
});

export type ListVariantProps = NonNullable<Parameters<typeof listVariants>[0]>;

/** Fixture: List > ListItem Apples, Pears, Plums. */
const cases: ContractCase[] = [
  {
    id: 'unordered-by-default',
    describe: 'is a list with one item per entry',
    expect: {
      tag: 'ul',
      role: 'list',
      classes: ['t-list'],
      attrs: { 'data-variant': 'plain' },
      parts: { 'li.t-list__item': true },
    },
  },
  {
    id: 'ordered',
    describe: 'ordered renders an ol',
    props: { extra: { ordered: true } },
    expect: { tag: 'ol', attrs: { 'data-ordered': '' } },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variant becomes a data attribute',
    props: { extra: { variant: 'divided' } },
    expect: { attrs: { 'data-variant': 'divided' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-list', 'custom'] },
  },
];

export const listContract = defineContract({
  name: 'List',
  names: { vue: 'TList', react: 'List' },
  category: 'data-display',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root', 'item'],
  props: [
    {
      name: 'variant',
      type: 'enum',
      values: listVariants.config.variants.variant,
      default: 'plain',
    },
    { name: 'ordered', type: 'boolean', default: false },
  ],
  cases,
});
