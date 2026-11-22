import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const checkboxVariants = defineVariants({
  base: 't-checkbox',
  variants: { size: ['sm', 'md', 'lg'], invalid: 'boolean' },
  defaults: { size: 'md', invalid: false },
});

export type CheckboxVariantProps = NonNullable<Parameters<typeof checkboxVariants>[0]>;

/** The root is the wrapping `label`; the native input is `.t-checkbox__input`. */
const cases: ContractCase[] = [
  {
    id: 'role-name-defaults',
    describe: 'is a native checkbox named by its text, unchecked',
    props: { label: 'Accept' },
    expect: {
      tag: 'label',
      classes: ['t-checkbox'],
      attrs: { 'data-size': 'md', 'data-state': 'unchecked' },
      queries: [
        { role: 'checkbox', name: 'Accept', props: { checked: false, indeterminate: false } },
      ],
    },
  },
  {
    id: 'default-checked',
    describe: 'defaultChecked starts checked without reporting it',
    props: { label: 'Accept', extra: { defaultChecked: true } },
    expect: {
      emitted: [],
      attrs: { 'data-state': 'checked' },
      queries: [{ role: 'checkbox', name: 'Accept', props: { checked: true } }],
    },
  },
  {
    id: 'click-toggles',
    describe: 'a click toggles it and reports the new state',
    props: { label: 'Accept' },
    steps: [
      { do: 'click', target: 'input' },
      { do: 'click', target: 'input' },
    ],
    expect: { emitted: [true, false], attrs: { 'data-state': 'unchecked' } },
  },
  {
    id: 'space-toggles',
    describe: 'Space toggles it',
    props: { label: 'Accept' },
    steps: [
      { do: 'focus', target: 'input' },
      { do: 'key', key: 'Space' },
    ],
    expect: { emitted: [true], attrs: { 'data-state': 'checked' } },
  },
  {
    id: 'indeterminate',
    describe: 'indeterminate sets the DOM property (mixed to assistive technology) and the state',
    props: { label: 'All', extra: { indeterminate: true } },
    expect: {
      attrs: { 'data-state': 'indeterminate' },
      queries: [{ role: 'checkbox', name: 'All', props: { indeterminate: true } }],
    },
  },
  {
    id: 'disabled-silent',
    describe: 'disabled uses the native attribute and never reports',
    props: { label: 'Accept', disabled: true },
    steps: [{ do: 'click', target: 'input' }],
    expect: {
      emitted: [],
      queries: [{ role: 'checkbox', name: 'Accept', attrs: { disabled: '' } }],
    },
  },
  {
    id: 'invalid-sets-aria',
    describe: 'invalid sets aria-invalid and a data attribute',
    props: { label: 'Accept', extra: { invalid: true } },
    expect: {
      attrs: { 'data-invalid': '' },
      queries: [{ role: 'checkbox', name: 'Accept', attrs: { 'aria-invalid': 'true' } }],
    },
  },
  {
    id: 'form-participation',
    describe: 'name and value reach the native input so it takes part in forms',
    props: { label: 'Accept', extra: { name: 'terms', value: 'yes' } },
    expect: {
      queries: [{ role: 'checkbox', name: 'Accept', attrs: { name: 'terms', value: 'yes' } }],
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Accept', class: 'custom' },
    expect: { classes: ['t-checkbox', 'custom'] },
  },
];

export const checkboxContract = defineContract({
  name: 'Checkbox',
  names: { vue: 'TCheckbox', react: 'Checkbox' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/',
  anatomy: ['root', 'input', 'box', 'label'],
  props: [
    { name: 'size', type: 'enum', values: checkboxVariants.config.variants.size, default: 'md' },
    { name: 'checked', type: 'boolean' },
    { name: 'indeterminate', type: 'boolean', default: false },
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
  ],
  cases,
});
