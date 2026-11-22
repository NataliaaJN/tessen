import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const iconButtonVariants = defineVariants({
  base: 't-icon-button',
  variants: {
    variant: ['primary', 'secondary', 'outline', 'ghost'],
    size: ['sm', 'md', 'lg'],
    tone: ['default', 'danger'],
  },
  defaults: { variant: 'ghost', size: 'md', tone: 'default' },
});

export type IconButtonVariantProps = NonNullable<Parameters<typeof iconButtonVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'name-from-label',
    describe: 'the required label becomes the accessible name (aria-label) and the icon is hidden',
    props: { label: 'Close', leading: 'X' },
    expect: {
      role: 'button',
      name: 'Close',
      classes: ['t-icon-button'],
      attrs: {
        type: 'button',
        'aria-label': 'Close',
        'data-variant': 'ghost',
        'data-size': 'md',
        'data-tone': 'default',
      },
      parts: { '.t-icon-button__icon': true },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variant, size and tone become data attributes',
    props: { label: 'Close', variant: 'primary', size: 'lg', tone: 'danger' },
    expect: { attrs: { 'data-variant': 'primary', 'data-size': 'lg', 'data-tone': 'danger' } },
  },
  {
    id: 'click-emits',
    describe: 'a click fires the handler once',
    props: { label: 'Close' },
    steps: [{ do: 'click' }],
    expect: { clicks: 1 },
  },
  {
    id: 'keyboard-enter-space',
    describe: 'Enter and Space activate it',
    props: { label: 'Close' },
    steps: [{ do: 'focus' }, { do: 'key', key: 'Enter' }, { do: 'key', key: 'Space' }],
    expect: { clicks: 2, focused: true },
  },
  {
    id: 'disabled-silent',
    describe: 'disabled uses the native attribute and never emits',
    props: { label: 'Close', disabled: true },
    steps: [{ do: 'click' }],
    expect: { clicks: 0, attrs: { disabled: '' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Close', class: 'custom' },
    expect: { classes: ['t-icon-button', 'custom'] },
  },
];

export const iconButtonContract = defineContract({
  name: 'IconButton',
  names: { vue: 'TIconButton', react: 'IconButton' },
  category: 'actions',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  anatomy: ['root', 'icon'],
  props: [
    {
      name: 'variant',
      type: 'enum',
      values: iconButtonVariants.config.variants.variant,
      default: 'ghost',
    },
    {
      name: 'tone',
      type: 'enum',
      values: iconButtonVariants.config.variants.tone,
      default: 'default',
    },
    { name: 'size', type: 'enum', values: iconButtonVariants.config.variants.size, default: 'md' },
    { name: 'label', type: 'string', required: true },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'type', type: 'enum', values: ['button', 'submit', 'reset'], default: 'button' },
  ],
  cases,
});
