import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const buttonVariants = defineVariants({
  base: 't-button',
  variants: {
    variant: ['primary', 'secondary', 'outline', 'ghost', 'link'],
    size: ['sm', 'md', 'lg'],
    tone: ['default', 'danger'],
    block: 'boolean',
  },
  defaults: { variant: 'primary', size: 'md', tone: 'default', block: false },
});

export type ButtonVariantProps = NonNullable<Parameters<typeof buttonVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'role-name-defaults',
    describe: 'is a button with its text as name and the documented defaults',
    props: { label: 'Save' },
    expect: {
      role: 'button',
      name: 'Save',
      classes: ['t-button'],
      attrs: {
        type: 'button',
        'data-variant': 'primary',
        'data-size': 'md',
        'data-tone': 'default',
        'data-block': null,
        'aria-busy': null,
        'aria-disabled': null,
      },
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variant, size, tone and block become data attributes',
    props: { label: 'Save', variant: 'outline', size: 'lg', tone: 'danger', block: true },
    expect: {
      attrs: {
        'data-variant': 'outline',
        'data-size': 'lg',
        'data-tone': 'danger',
        'data-block': '',
      },
    },
  },
  {
    id: 'type-never-implicit-submit',
    describe: 'type is "button" unless asked, so it never submits a form implicitly',
    props: { label: 'Save', type: 'submit' },
    expect: { attrs: { type: 'submit' } },
  },
  {
    id: 'click-emits',
    describe: 'a click fires the handler once',
    props: { label: 'Save' },
    steps: [{ do: 'click' }],
    expect: { clicks: 1 },
  },
  {
    id: 'keyboard-enter',
    describe: 'Enter activates it',
    props: { label: 'Save' },
    steps: [{ do: 'focus' }, { do: 'key', key: 'Enter' }],
    expect: { clicks: 1, focused: true },
  },
  {
    id: 'keyboard-space',
    describe: 'Space activates it',
    props: { label: 'Save' },
    steps: [{ do: 'focus' }, { do: 'key', key: 'Space' }],
    expect: { clicks: 1, focused: true },
  },
  {
    id: 'disabled-silent',
    describe: 'disabled uses the native attribute and never emits',
    props: { label: 'Save', disabled: true },
    steps: [{ do: 'click' }],
    expect: { clicks: 0, attrs: { disabled: '' } },
  },
  {
    id: 'loading-aria-no-click',
    describe: 'loading sets aria-busy and aria-disabled, shows the spinner and suppresses click',
    props: { label: 'Save', loading: true },
    steps: [{ do: 'click' }],
    expect: {
      clicks: 0,
      attrs: { 'aria-busy': 'true', 'aria-disabled': 'true', disabled: null },
      parts: { '.t-button__spinner': true },
    },
  },
  {
    id: 'loading-keeps-focus',
    describe: 'loading stays focusable (not natively disabled), keeps focus and ignores Enter',
    props: { label: 'Save', loading: true },
    steps: [{ do: 'focus' }, { do: 'key', key: 'Enter' }],
    expect: { clicks: 0, focused: true },
  },
  {
    id: 'icons-parts',
    describe: 'leading and trailing content render only when provided',
    props: { label: 'Save', leading: 'L', trailing: 'T' },
    expect: {
      parts: { '.t-button__label': true, '.t-button__icon': true, '.t-button__spinner': false },
    },
  },
  {
    id: 'no-icons-no-wrapper',
    describe: 'without icons there is no icon wrapper',
    props: { label: 'Save' },
    expect: { parts: { '.t-button__icon': false, '.t-button__spinner': false } },
  },
];

export const buttonContract = defineContract({
  name: 'Button',
  names: { vue: 'TButton', react: 'Button' },
  category: 'actions',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  anatomy: ['root', 'leading', 'label', 'trailing', 'spinner'],
  props: [
    {
      name: 'variant',
      type: 'enum',
      values: buttonVariants.config.variants.variant,
      default: 'primary',
    },
    { name: 'tone', type: 'enum', values: buttonVariants.config.variants.tone, default: 'default' },
    { name: 'size', type: 'enum', values: buttonVariants.config.variants.size, default: 'md' },
    { name: 'block', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'loading', type: 'boolean', default: false },
    { name: 'type', type: 'enum', values: ['button', 'submit', 'reset'], default: 'button' },
  ],
  cases,
});
