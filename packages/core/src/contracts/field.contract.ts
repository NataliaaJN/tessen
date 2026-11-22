import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const fieldVariants = defineVariants({
  base: 't-field',
  variants: { invalid: 'boolean', required: 'boolean', disabled: 'boolean', readOnly: 'boolean' },
  defaults: { invalid: false, required: false, disabled: false, readOnly: false },
});

export type FieldVariantProps = NonNullable<Parameters<typeof fieldVariants>[0]>;

/**
 * The fixture every adapter builds for these cases:
 * `Field` > `FieldLabel` "Email" + `Input` (+ `FieldDescription` / `FieldError` from the neutral
 * `extra.description` / `extra.error`). Field props come from `extra`.
 */
const cases: ContractCase[] = [
  {
    id: 'label-names-the-control',
    describe: 'the label is the accessible name of the control',
    props: {},
    expect: {
      classes: ['t-field'],
      queries: [{ role: 'textbox', name: 'Email' }],
      within: { label: { present: true } },
    },
  },
  {
    id: 'description-describes-the-control',
    describe: 'the description is the accessible description of the control',
    props: { extra: { description: 'We never share it' } },
    expect: { queries: [{ role: 'textbox', name: 'Email', description: 'We never share it' }] },
  },
  {
    id: 'invalid-shows-error',
    describe: 'invalid marks the control, describes it with the error and announces it politely',
    props: { extra: { invalid: true, error: 'Required' } },
    expect: {
      attrs: { 'data-invalid': '' },
      queries: [
        {
          role: 'textbox',
          name: 'Email',
          description: 'Required',
          attrs: { 'aria-invalid': 'true' },
        },
      ],
      within: { '.t-field__error': { text: 'Required', attrs: { 'aria-live': 'polite' } } },
    },
  },
  {
    id: 'error-hidden-while-valid',
    describe: 'the error is not rendered (nor described) while the field is valid',
    props: { extra: { error: 'Required' } },
    expect: {
      queries: [{ role: 'textbox', name: 'Email', attrs: { 'aria-invalid': null } }],
      within: { '.t-field__error': { present: false } },
    },
  },
  {
    id: 'required-propagates',
    describe: 'required reaches the control and the root',
    props: { extra: { required: true } },
    expect: {
      attrs: { 'data-required': '' },
      queries: [{ role: 'textbox', name: 'Email', attrs: { required: '' } }],
    },
  },
  {
    id: 'disabled-propagates',
    describe: 'disabled reaches the control and the root',
    props: { extra: { disabled: true } },
    expect: {
      attrs: { 'data-disabled': '' },
      queries: [{ role: 'textbox', name: 'Email', attrs: { disabled: '' } }],
    },
  },
  {
    id: 'readonly-propagates',
    describe: 'readOnly reaches the control',
    props: { extra: { readOnly: true } },
    expect: { queries: [{ role: 'textbox', name: 'Email', attrs: { readonly: '' } }] },
  },
  {
    id: 'typing-reports-values',
    describe: 'typing reports each new value through the value-change event',
    props: {},
    steps: [{ do: 'type', text: 'ab', target: 'input' }],
    expect: {
      emitted: ['a', 'ab'],
      queries: [{ role: 'textbox', name: 'Email', props: { value: 'ab' } }],
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-field', 'custom'] },
  },
];

export const fieldContract = defineContract({
  name: 'Field',
  names: { vue: 'TField', react: 'Field' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/',
  anatomy: ['root', 'label', 'control', 'description', 'error'],
  props: [
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'required', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'readOnly', type: 'boolean', default: false },
  ],
  cases,
});
