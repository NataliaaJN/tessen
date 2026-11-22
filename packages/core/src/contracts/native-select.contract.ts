import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const nativeSelectVariants = defineVariants({
  base: 't-native-select',
  variants: { size: ['sm', 'md', 'lg'], invalid: 'boolean' },
  defaults: { size: 'md', invalid: false },
});

export type NativeSelectVariantProps = NonNullable<Parameters<typeof nativeSelectVariants>[0]>;

/**
 * Fixture: `NativeSelect` (aria-label "Country") with native options Spain (es), France (fr),
 * Italy (it). The root is the wrapper `div`; the `<select>` is `.t-native-select__control`.
 */
const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a native select named by its label, first option selected',
    props: {},
    expect: {
      tag: 'div',
      classes: ['t-native-select'],
      attrs: { 'data-size': 'md', 'data-invalid': null },
      queries: [
        {
          role: 'combobox',
          name: 'Country',
          props: { value: 'es' },
          attrs: { 'aria-invalid': null },
        },
      ],
    },
  },
  {
    id: 'default-value',
    describe: 'defaultValue selects an option without reporting it',
    props: { extra: { defaultValue: 'fr' } },
    expect: {
      emitted: [],
      queries: [{ role: 'combobox', name: 'Country', props: { value: 'fr' } }],
    },
  },
  {
    id: 'choosing-reports-value',
    describe: 'choosing an option reports its value',
    props: {},
    steps: [{ do: 'select', value: 'it', target: 'select' }],
    expect: {
      emitted: ['it'],
      queries: [{ role: 'combobox', name: 'Country', props: { value: 'it' } }],
    },
  },
  {
    id: 'invalid-sets-aria',
    describe: 'invalid sets aria-invalid and a data attribute',
    props: { extra: { invalid: true } },
    expect: {
      attrs: { 'data-invalid': '' },
      queries: [{ role: 'combobox', name: 'Country', attrs: { 'aria-invalid': 'true' } }],
    },
  },
  {
    id: 'disabled-silent',
    describe: 'disabled uses the native attribute and never reports',
    props: { extra: { disabled: true } },
    steps: [{ do: 'select', value: 'it', target: 'select' }],
    expect: {
      emitted: [],
      queries: [{ role: 'combobox', name: 'Country', attrs: { disabled: '' } }],
    },
  },
  {
    id: 'size-reflects-attr',
    describe: 'size becomes a data attribute',
    props: { size: 'sm' },
    expect: { attrs: { 'data-size': 'sm' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the wrapper class',
    props: { class: 'custom' },
    expect: { classes: ['t-native-select', 'custom'] },
  },
];

export const nativeSelectContract = defineContract({
  name: 'NativeSelect',
  names: { vue: 'TNativeSelect', react: 'NativeSelect' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element',
  anatomy: ['root', 'control'],
  props: [
    {
      name: 'size',
      type: 'enum',
      values: nativeSelectVariants.config.variants.size,
      default: 'md',
    },
    { name: 'value', type: 'string' },
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
  ],
  cases,
});
