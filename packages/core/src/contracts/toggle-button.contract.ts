import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const toggleButtonVariants = defineVariants({
  base: 't-toggle-button',
  variants: { variant: ['outline', 'ghost'], size: ['sm', 'md', 'lg'] },
  defaults: { variant: 'outline', size: 'md' },
});

export type ToggleButtonVariantProps = NonNullable<Parameters<typeof toggleButtonVariants>[0]>;

export const buttonGroupVariants = defineVariants({
  base: 't-button-group',
  variants: { orientation: ['horizontal', 'vertical'], attached: 'boolean' },
  defaults: { orientation: 'horizontal', attached: false },
});

export type ButtonGroupVariantProps = NonNullable<Parameters<typeof buttonGroupVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'not-pressed-by-default',
    describe: 'is a button that reports its pressed state',
    props: { label: 'Bold' },
    expect: {
      tag: 'button',
      role: 'button',
      name: 'Bold',
      classes: ['t-toggle-button'],
      attrs: { type: 'button', 'aria-pressed': 'false', 'data-state': 'off' },
    },
  },
  {
    id: 'default-pressed',
    describe: 'defaultPressed starts it pressed',
    props: { label: 'Bold', extra: { defaultPressed: true } },
    expect: { attrs: { 'aria-pressed': 'true', 'data-state': 'on' } },
  },
  {
    id: 'click-toggles',
    describe: 'clicking toggles it and reports every change',
    props: { label: 'Bold' },
    steps: [{ do: 'click' }, { do: 'click' }],
    expect: { emitted: [true, false], attrs: { 'aria-pressed': 'false' } },
  },
  {
    id: 'keyboard-toggles',
    describe: 'Space toggles it',
    props: { label: 'Bold' },
    steps: [{ do: 'focus' }, { do: 'key', key: ' ' }],
    expect: { emitted: [true], attrs: { 'aria-pressed': 'true' } },
  },
  {
    id: 'disabled',
    describe: 'disabled does not toggle',
    props: { label: 'Bold', disabled: true },
    steps: [{ do: 'click' }],
    expect: { emitted: [], attrs: { 'aria-pressed': 'false' } },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'variant and size become data attributes',
    props: { label: 'Bold', extra: { variant: 'ghost', size: 'lg' } },
    expect: { attrs: { 'data-variant': 'ghost', 'data-size': 'lg' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Bold', class: 'custom' },
    expect: { classes: ['t-toggle-button', 'custom'] },
  },
];

export const toggleButtonContract = defineContract({
  name: 'ToggleButton',
  names: { vue: 'TToggleButton', react: 'ToggleButton' },
  category: 'actions',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  anatomy: ['root'],
  props: [
    { name: 'pressed', type: 'boolean' },
    { name: 'defaultPressed', type: 'boolean', default: false },
    {
      name: 'variant',
      type: 'enum',
      values: toggleButtonVariants.config.variants.variant,
      default: 'outline',
    },
    {
      name: 'size',
      type: 'enum',
      values: toggleButtonVariants.config.variants.size,
      default: 'md',
    },
    { name: 'disabled', type: 'boolean', default: false },
  ],
  cases,
});

/** Fixture: ButtonGroup "Alignment" > three buttons. */
const groupCases: ContractCase[] = [
  {
    id: 'group-role',
    describe: 'is a labelled group of buttons',
    expect: {
      tag: 'div',
      role: 'group',
      name: 'Alignment',
      classes: ['t-button-group'],
      attrs: { 'data-orientation': 'horizontal' },
    },
  },
  {
    id: 'group-variants-reflect-attrs',
    describe: 'orientation and attached become data attributes',
    props: { extra: { orientation: 'vertical', attached: true } },
    expect: { attrs: { 'data-orientation': 'vertical', 'data-attached': '' } },
  },
  {
    id: 'group-passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-button-group', 'custom'] },
  },
];

export const buttonGroupContract = defineContract({
  name: 'ButtonGroup',
  names: { vue: 'TButtonGroup', react: 'ButtonGroup' },
  category: 'actions',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/',
  anatomy: ['root'],
  props: [
    {
      name: 'orientation',
      type: 'enum',
      values: buttonGroupVariants.config.variants.orientation,
      default: 'horizontal',
    },
    { name: 'attached', type: 'boolean', default: false },
  ],
  cases: groupCases,
});
