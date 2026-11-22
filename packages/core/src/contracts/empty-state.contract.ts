import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const emptyStateVariants = defineVariants({
  base: 't-empty-state',
  variants: { size: ['md', 'sm'] },
  defaults: { size: 'md' },
});

export type EmptyStateVariantProps = NonNullable<Parameters<typeof emptyStateVariants>[0]>;

/** Fixture: EmptyState title "No projects", description "Create one to start.", one Create button. */
const cases: ContractCase[] = [
  {
    id: 'title-description-actions',
    describe: 'shows the title, the description and the actions it is given',
    expect: {
      tag: 'div',
      classes: ['t-empty-state'],
      attrs: { 'data-size': 'md' },
      within: {
        '.t-empty-state__title': { text: 'No projects' },
        '.t-empty-state__description': { text: 'Create one to start.' },
      },
      queries: [{ role: 'button', name: 'Create' }],
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'size becomes a data attribute',
    props: { extra: { size: 'sm' } },
    expect: { attrs: { 'data-size': 'sm' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-empty-state', 'custom'] },
  },
];

export const emptyStateContract = defineContract({
  name: 'EmptyState',
  names: { vue: 'TEmptyState', react: 'EmptyState' },
  category: 'feedback',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root', 'icon', 'title', 'description', 'actions'],
  props: [
    { name: 'title', type: 'string', required: true },
    { name: 'description', type: 'string' },
    { name: 'size', type: 'enum', values: emptyStateVariants.config.variants.size, default: 'md' },
  ],
  cases,
});
