import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const badgeVariants = defineVariants({
  base: 't-badge',
  variants: {
    variant: ['subtle', 'solid', 'outline'],
    tone: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'],
    size: ['sm', 'md'],
  },
  defaults: { variant: 'subtle', tone: 'neutral', size: 'md' },
});

export type BadgeVariantProps = NonNullable<Parameters<typeof badgeVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is an inline span with its text and the documented defaults',
    props: { label: 'New' },
    expect: {
      tag: 'span',
      text: 'New',
      classes: ['t-badge'],
      attrs: { 'data-variant': 'subtle', 'data-tone': 'neutral', 'data-size': 'md' },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variant, tone and size become data attributes',
    props: { label: 'New', variant: 'solid', tone: 'danger', size: 'sm' },
    expect: { attrs: { 'data-variant': 'solid', 'data-tone': 'danger', 'data-size': 'sm' } },
  },
  {
    id: 'passthrough-class-attrs',
    describe: 'consumer class and attributes reach the root',
    props: { label: 'New', class: 'custom', attrs: { 'data-testid': 'b' } },
    expect: { classes: ['t-badge', 'custom'], attrs: { 'data-testid': 'b' } },
  },
];

export const badgeContract = defineContract({
  name: 'Badge',
  names: { vue: 'TBadge', react: 'Badge' },
  category: 'feedback',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root'],
  props: [
    {
      name: 'variant',
      type: 'enum',
      values: badgeVariants.config.variants.variant,
      default: 'subtle',
    },
    { name: 'tone', type: 'enum', values: badgeVariants.config.variants.tone, default: 'neutral' },
    { name: 'size', type: 'enum', values: badgeVariants.config.variants.size, default: 'md' },
  ],
  cases,
});
