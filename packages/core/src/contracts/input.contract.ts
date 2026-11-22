import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const inputVariants = defineVariants({
  base: 't-input',
  variants: { size: ['sm', 'md', 'lg'], invalid: 'boolean' },
  defaults: { size: 'md', invalid: false },
});

export type InputVariantProps = NonNullable<Parameters<typeof inputVariants>[0]>;

export const inputTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'] as const;

/** The root is the wrapper `div`; the native `<input>` is `.t-input__control`. */
const cases: ContractCase[] = [
  {
    id: 'defaults',
    describe: 'is a text box inside a wrapper with the documented defaults',
    props: { attrs: { 'aria-label': 'Name' } },
    expect: {
      tag: 'div',
      classes: ['t-input'],
      attrs: { 'data-size': 'md', 'data-invalid': null },
      queries: [{ role: 'textbox', name: 'Name', attrs: { type: 'text', 'aria-invalid': null } }],
      parts: { '.t-input__leading': false, '.t-input__trailing': false },
    },
  },
  {
    id: 'type-and-placeholder',
    describe: 'type and placeholder reach the native control',
    props: {
      extra: { type: 'email', placeholder: 'you@example.com' },
      attrs: { 'aria-label': 'Mail' },
    },
    expect: {
      queries: [
        { role: 'textbox', name: 'Mail', attrs: { type: 'email', placeholder: 'you@example.com' } },
      ],
    },
  },
  {
    id: 'typing-reports-values',
    describe: 'typing reports each new value through the value-change event',
    props: { attrs: { 'aria-label': 'Name' } },
    steps: [{ do: 'type', text: 'hi', target: '.t-input__control' }],
    expect: {
      emitted: ['h', 'hi'],
      queries: [{ role: 'textbox', name: 'Name', props: { value: 'hi' } }],
    },
  },
  {
    id: 'default-value',
    describe: 'defaultValue sets the initial value without reporting it',
    props: { extra: { defaultValue: 'abc' }, attrs: { 'aria-label': 'Name' } },
    expect: { emitted: [], queries: [{ role: 'textbox', name: 'Name', props: { value: 'abc' } }] },
  },
  {
    id: 'invalid-sets-aria',
    describe: 'invalid sets aria-invalid on the control and a data attribute on the wrapper',
    props: { extra: { invalid: true }, attrs: { 'aria-label': 'Name' } },
    expect: {
      attrs: { 'data-invalid': '' },
      queries: [{ role: 'textbox', name: 'Name', attrs: { 'aria-invalid': 'true' } }],
    },
  },
  {
    id: 'disabled-readonly',
    describe: 'disabled and readOnly use the native attributes',
    props: { extra: { disabled: true, readOnly: true }, attrs: { 'aria-label': 'Name' } },
    expect: {
      queries: [{ role: 'textbox', name: 'Name', attrs: { disabled: '', readonly: '' } }],
    },
  },
  {
    id: 'size-reflects-attr',
    describe: 'size becomes a data attribute',
    props: { size: 'lg', attrs: { 'aria-label': 'Name' } },
    expect: { attrs: { 'data-size': 'lg' } },
  },
  {
    id: 'leading-and-trailing',
    describe: 'leading and trailing content render only when provided',
    props: { leading: 'L', trailing: 'T', attrs: { 'aria-label': 'Name' } },
    expect: {
      parts: { '.t-input__leading': true, '.t-input__trailing': true },
      within: { '.t-input__leading': { text: 'L' }, '.t-input__trailing': { text: 'T' } },
    },
  },
  {
    id: 'passthrough',
    describe: 'class goes to the wrapper; native attributes go to the control',
    props: { class: 'custom', attrs: { 'aria-label': 'Name', 'data-testid': 'x' } },
    expect: {
      classes: ['t-input', 'custom'],
      within: { '.t-input__control': { attrs: { 'data-testid': 'x' } } },
    },
  },
];

export const inputContract = defineContract({
  name: 'Input',
  names: { vue: 'TInput', react: 'Input' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://html.spec.whatwg.org/multipage/input.html',
  anatomy: ['root', 'leading', 'control', 'trailing'],
  props: [
    { name: 'size', type: 'enum', values: inputVariants.config.variants.size, default: 'md' },
    { name: 'type', type: 'enum', values: inputTypes, default: 'text' },
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'readOnly', type: 'boolean', default: false },
    { name: 'placeholder', type: 'string' },
  ],
  cases,
});
