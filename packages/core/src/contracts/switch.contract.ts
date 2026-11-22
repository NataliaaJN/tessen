import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const switchVariants = defineVariants({
  base: 't-switch',
  variants: { size: ['sm', 'md', 'lg'], invalid: 'boolean' },
  defaults: { size: 'md', invalid: false },
});

export type SwitchVariantProps = NonNullable<Parameters<typeof switchVariants>[0]>;

/** The root is the wrapping `label`; the native input (`role="switch"`) is `.t-switch__input`. */
const cases: ContractCase[] = [
  {
    id: 'role-name-defaults',
    describe: 'is a switch named by its text, off',
    props: { label: 'Wi-Fi' },
    expect: {
      tag: 'label',
      classes: ['t-switch'],
      attrs: { 'data-size': 'md', 'data-state': 'unchecked' },
      queries: [{ role: 'switch', name: 'Wi-Fi', props: { checked: false } }],
    },
  },
  {
    id: 'default-checked',
    describe: 'defaultChecked starts on without reporting it',
    props: { label: 'Wi-Fi', extra: { defaultChecked: true } },
    expect: {
      emitted: [],
      attrs: { 'data-state': 'checked' },
      queries: [{ role: 'switch', name: 'Wi-Fi', props: { checked: true } }],
    },
  },
  {
    id: 'click-toggles',
    describe: 'a click toggles it and reports the new state',
    props: { label: 'Wi-Fi' },
    steps: [
      { do: 'click', target: 'input' },
      { do: 'click', target: 'input' },
    ],
    expect: { emitted: [true, false] },
  },
  {
    id: 'space-toggles',
    describe: 'Space toggles it',
    props: { label: 'Wi-Fi' },
    steps: [
      { do: 'focus', target: 'input' },
      { do: 'key', key: 'Space' },
    ],
    expect: { emitted: [true], attrs: { 'data-state': 'checked' } },
  },
  {
    id: 'disabled-silent',
    describe: 'disabled uses the native attribute and never reports',
    props: { label: 'Wi-Fi', disabled: true },
    steps: [{ do: 'click', target: 'input' }],
    expect: { emitted: [], queries: [{ role: 'switch', name: 'Wi-Fi', attrs: { disabled: '' } }] },
  },
  {
    id: 'invalid-sets-aria',
    describe: 'invalid sets aria-invalid and a data attribute',
    props: { label: 'Wi-Fi', extra: { invalid: true } },
    expect: {
      attrs: { 'data-invalid': '' },
      queries: [{ role: 'switch', name: 'Wi-Fi', attrs: { 'aria-invalid': 'true' } }],
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Wi-Fi', class: 'custom' },
    expect: { classes: ['t-switch', 'custom'] },
  },
];

export const switchContract = defineContract({
  name: 'Switch',
  names: { vue: 'TSwitch', react: 'Switch' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/',
  anatomy: ['root', 'input', 'track', 'thumb', 'label'],
  props: [
    { name: 'size', type: 'enum', values: switchVariants.config.variants.size, default: 'md' },
    { name: 'checked', type: 'boolean' },
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
  ],
  cases,
});
