import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const tableVariants = defineVariants({
  base: 't-table',
  variants: { density: ['comfortable', 'compact'], striped: 'boolean' },
  defaults: { density: 'comfortable', striped: false },
});

export type TableVariantProps = NonNullable<Parameters<typeof tableVariants>[0]>;

/** Fixture: Table > TableCaption "Team", TableHead (Name, Role[numeric]), TableBody (Ada, Admin). */
const cases: ContractCase[] = [
  {
    id: 'semantic-table',
    describe: 'is a real table with caption, header cells and data cells',
    expect: {
      tag: 'table',
      role: 'table',
      name: 'Team',
      classes: ['t-table'],
      attrs: { 'data-density': 'comfortable' },
      queries: [
        { role: 'columnheader', name: 'Name', attrs: { scope: 'col' } },
        { role: 'cell', name: 'Ada' },
      ],
      parts: { 'caption.t-table__caption': true, 'thead > tr > th': true, 'tbody > tr > td': true },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'density and striped become data attributes',
    props: { extra: { density: 'compact', striped: true } },
    expect: { attrs: { 'data-density': 'compact', 'data-striped': '' } },
  },
  {
    id: 'numeric-cells',
    describe: 'numeric cells are marked so they can align to the end',
    expect: { parts: { 'th[data-numeric]': true } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-table', 'custom'] },
  },
];

export const tableContract = defineContract({
  name: 'Table',
  names: { vue: 'TTable', react: 'Table' },
  category: 'data-display',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/table/',
  anatomy: ['root', 'caption', 'head', 'body', 'row', 'header-cell', 'cell'],
  props: [
    {
      name: 'density',
      type: 'enum',
      values: tableVariants.config.variants.density,
      default: 'comfortable',
    },
    { name: 'striped', type: 'boolean', default: false },
  ],
  cases,
});
