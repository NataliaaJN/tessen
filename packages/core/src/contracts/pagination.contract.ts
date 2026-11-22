import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const paginationVariants = defineVariants({
  base: 't-pagination',
  variants: { size: ['sm', 'md'] },
  defaults: { size: 'md' },
});

export type PaginationVariantProps = NonNullable<Parameters<typeof paginationVariants>[0]>;

export type PaginationItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: string };

/**
 * Pages to show: always the first and last, the current page with `siblings` on each side and an
 * ellipsis where numbers are skipped. The length is constant (2 * siblings + 5) once there are
 * enough pages, so the control does not jump while paging. Shared by Vue and React.
 */
export function paginationRange(page: number, pageCount: number, siblings = 1): PaginationItem[] {
  const total = Math.max(0, Math.floor(pageCount));
  const slots = siblings * 2 + 5;
  const pages = (from: number, to: number): PaginationItem[] =>
    Array.from({ length: to - from + 1 }, (_, i) => ({ type: 'page', page: from + i }));
  if (total <= slots) return pages(1, total);

  const current = Math.min(Math.max(page, 1), total);
  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftDots = left > 3;
  const showRightDots = right < total - 2;
  const edge = 3 + 2 * siblings;
  if (!showLeftDots)
    return [...pages(1, edge), { type: 'ellipsis', key: 'end' }, ...pages(total, total)];
  if (!showRightDots)
    return [...pages(1, 1), { type: 'ellipsis', key: 'start' }, ...pages(total - edge + 1, total)];
  return [
    ...pages(1, 1),
    { type: 'ellipsis', key: 'start' },
    ...pages(left, right),
    { type: 'ellipsis', key: 'end' },
    ...pages(total, total),
  ];
}

const cases: ContractCase[] = [
  {
    id: 'landmark',
    describe: 'is a navigation landmark with the current page marked',
    props: { attrs: { 'aria-label': 'Results' }, extra: { pageCount: 5, defaultPage: 2 } },
    expect: {
      tag: 'nav',
      role: 'navigation',
      name: 'Results',
      classes: ['t-pagination'],
      queries: [
        { role: 'button', name: 'Page 2', attrs: { 'aria-current': 'page' } },
        { role: 'button', name: 'Page 3', attrs: { 'aria-current': null } },
        { role: 'button', name: 'Previous page' },
        { role: 'button', name: 'Next page' },
      ],
    },
  },
  {
    id: 'next-and-previous',
    describe: 'next and previous move one page and report it',
    props: { attrs: { 'aria-label': 'Results' }, extra: { pageCount: 5, defaultPage: 2 } },
    steps: [
      { do: 'click', target: '[data-part="next"]' },
      { do: 'click', target: '[data-part="next"]' },
      { do: 'click', target: '[data-part="previous"]' },
    ],
    expect: {
      emitted: ['3', '4', '3'],
      queries: [{ role: 'button', name: 'Page 3', attrs: { 'aria-current': 'page' } }],
    },
  },
  {
    id: 'page-button',
    describe: 'a page button goes to that page',
    props: { attrs: { 'aria-label': 'Results' }, extra: { pageCount: 5, defaultPage: 1 } },
    steps: [{ do: 'click', target: '[data-page="4"]' }],
    expect: {
      emitted: ['4'],
      queries: [{ role: 'button', name: 'Page 4', attrs: { 'aria-current': 'page' } }],
    },
  },
  {
    id: 'edges-disable-arrows',
    describe: 'previous is disabled on the first page and next on the last',
    props: { attrs: { 'aria-label': 'Results' }, extra: { pageCount: 3, defaultPage: 1 } },
    expect: {
      within: {
        '[data-part="previous"]': { attrs: { disabled: '' } },
        '[data-part="next"]': { attrs: { disabled: null } },
      },
    },
  },
  {
    id: 'truncates-long-ranges',
    describe: 'a long range is shortened with ellipses',
    props: { attrs: { 'aria-label': 'Results' }, extra: { pageCount: 20, defaultPage: 10 } },
    expect: {
      parts: {
        '[data-page="1"]': true,
        '[data-page="10"]': true,
        '[data-page="20"]': true,
        '[data-page="5"]': false,
        '[data-part="ellipsis"]': true,
      },
    },
  },
];

export const paginationContract = defineContract({
  name: 'Pagination',
  names: { vue: 'TPagination', react: 'Pagination' },
  category: 'navigation',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root', 'list', 'previous', 'page', 'ellipsis', 'next'],
  props: [
    { name: 'page', type: 'string' },
    { name: 'defaultPage', type: 'string', default: '1' },
    { name: 'pageCount', type: 'string', required: true },
    { name: 'siblings', type: 'string', default: '1' },
    { name: 'size', type: 'enum', values: paginationVariants.config.variants.size, default: 'md' },
  ],
  cases,
});
