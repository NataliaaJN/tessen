import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const linkVariants = defineVariants({
  base: 't-link',
  variants: { variant: ['inline', 'standalone'], external: 'boolean' },
  defaults: { variant: 'inline', external: false },
});

export type LinkVariantProps = NonNullable<Parameters<typeof linkVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'role-name-defaults',
    describe: 'is a link with its text as name and the inline variant',
    props: { label: 'Docs', extra: { href: '/docs' } },
    expect: {
      role: 'link',
      name: 'Docs',
      tag: 'a',
      classes: ['t-link'],
      attrs: { href: '/docs', 'data-variant': 'inline', target: null, rel: null },
    },
  },
  {
    id: 'external-opens-safely',
    describe: 'external opens in a new tab with noopener noreferrer and says so to screen readers',
    props: { label: 'Docs', extra: { href: 'https://example.com', external: true } },
    expect: {
      attrs: { target: '_blank', rel: 'noopener noreferrer', 'data-external': '' },
      parts: { '.t-link__external': true },
    },
  },
  {
    id: 'standalone-variant',
    describe: 'standalone is reflected as a data attribute',
    props: { label: 'Docs', variant: 'standalone', extra: { href: '/docs' } },
    expect: { attrs: { 'data-variant': 'standalone' } },
  },
  {
    id: 'click-emits',
    describe: 'a click fires the handler',
    props: { label: 'Docs', extra: { href: '#x' } },
    steps: [{ do: 'click' }],
    expect: { clicks: 1 },
  },
  {
    id: 'keyboard-enter',
    describe: 'Enter activates it',
    props: { label: 'Docs', extra: { href: '#x' } },
    steps: [{ do: 'focus' }, { do: 'key', key: 'Enter' }],
    expect: { clicks: 1, focused: true },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Docs', class: 'custom', extra: { href: '/docs' } },
    expect: { classes: ['t-link', 'custom'] },
  },
];

export const linkContract = defineContract({
  name: 'Link',
  names: { vue: 'TLink', react: 'Link' },
  category: 'actions',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/',
  anatomy: ['root', 'external'],
  props: [
    {
      name: 'variant',
      type: 'enum',
      values: linkVariants.config.variants.variant,
      default: 'inline',
    },
    { name: 'href', type: 'string', required: true },
    { name: 'external', type: 'boolean', default: false },
  ],
  cases,
});
