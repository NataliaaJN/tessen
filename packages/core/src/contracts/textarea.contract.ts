import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const textareaVariants = defineVariants({
  base: 't-textarea',
  variants: { size: ['sm', 'md', 'lg'], invalid: 'boolean' },
  defaults: { size: 'md', invalid: false },
});

export type TextareaVariantProps = NonNullable<Parameters<typeof textareaVariants>[0]>;

const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a native textarea with the documented defaults',
    props: { attrs: { 'aria-label': 'Notes' } },
    expect: {
      tag: 'textarea',
      role: 'textbox',
      name: 'Notes',
      classes: ['t-textarea'],
      attrs: { 'data-size': 'md', 'aria-invalid': null },
    },
  },
  {
    id: 'typing-reports-values',
    describe: 'typing reports each new value through the value-change event',
    props: { attrs: { 'aria-label': 'Notes' } },
    steps: [{ do: 'type', text: 'hi', target: 'textarea' }],
    expect: { emitted: ['h', 'hi'] },
  },
  {
    id: 'invalid-sets-aria',
    describe: 'invalid sets aria-invalid and a data attribute',
    props: { extra: { invalid: true }, attrs: { 'aria-label': 'Notes' } },
    expect: { attrs: { 'aria-invalid': 'true', 'data-invalid': '' } },
  },
  {
    id: 'rows-and-placeholder',
    describe: 'rows and placeholder reach the native control',
    props: { extra: { rows: 5, placeholder: 'Write...' }, attrs: { 'aria-label': 'Notes' } },
    expect: { attrs: { rows: '5', placeholder: 'Write...' } },
  },
  {
    id: 'disabled-readonly',
    describe: 'disabled and readOnly use the native attributes',
    props: { extra: { disabled: true, readOnly: true }, attrs: { 'aria-label': 'Notes' } },
    expect: { attrs: { disabled: '', readonly: '' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom', attrs: { 'aria-label': 'Notes' } },
    expect: { classes: ['t-textarea', 'custom'] },
  },
];

export const textareaContract = defineContract({
  name: 'Textarea',
  names: { vue: 'TTextarea', react: 'Textarea' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element',
  anatomy: ['root'],
  props: [
    { name: 'size', type: 'enum', values: textareaVariants.config.variants.size, default: 'md' },
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'readOnly', type: 'boolean', default: false },
    { name: 'placeholder', type: 'string' },
  ],
  cases,
});
