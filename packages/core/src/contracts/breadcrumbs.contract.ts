import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const breadcrumbsVariants = defineVariants({
  base: 't-breadcrumbs',
  variants: {},
  defaults: {},
});

/** Fixture: Breadcrumbs "Breadcrumb" > Home (/), Docs (/docs), Button (current page). */
const cases: ContractCase[] = [
  {
    id: 'landmark',
    describe: 'is a navigation landmark holding an ordered list',
    expect: {
      tag: 'nav',
      role: 'navigation',
      name: 'Breadcrumb',
      classes: ['t-breadcrumbs'],
      parts: { 'ol > li': true },
    },
  },
  {
    id: 'links-and-current',
    describe: 'earlier items are links and the current one is marked and is not a link',
    expect: {
      queries: [
        { role: 'link', name: 'Home', attrs: { href: '/' } },
        { role: 'link', name: 'Docs', attrs: { href: '/docs' } },
      ],
      within: { '[aria-current="page"]': { text: 'Button' } },
      parts: { 'a[aria-current]': false },
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-breadcrumbs', 'custom'] },
  },
];

export const breadcrumbsContract = defineContract({
  name: 'Breadcrumbs',
  names: { vue: 'TBreadcrumbs', react: 'Breadcrumbs' },
  category: 'navigation',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
  anatomy: ['root', 'list', 'item', 'link', 'current'],
  props: [{ name: 'aria-label', type: 'string', default: 'Breadcrumb' }],
  cases,
});
