import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const selectVariants = defineVariants({
  base: 't-select',
  variants: { size: ['sm', 'md', 'lg'] },
  defaults: { size: 'md' },
});

export type SelectVariantProps = NonNullable<Parameters<typeof selectVariants>[0]>;

/** One option of `Select` and `Combobox`. */
export interface SelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

const trigger = '.t-select__trigger';

/**
 * Fixture: `Select` with `label` "Fruit", `placeholder` "Pick a fruit" and `items` Apple (apple),
 * Banana (banana, disabled), Cherry (cherry). Props come from `extra`. The root is the wrapper
 * element; the list is rendered in a portal.
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'a named combobox button shows the placeholder and the list is closed',
    props: {},
    expect: {
      classes: ['t-select'],
      attrs: { 'data-size': 'md' },
      queries: [
        {
          role: 'combobox',
          name: 'Fruit',
          attrs: { 'aria-haspopup': 'listbox', 'aria-expanded': 'false' },
        },
      ],
      within: { [trigger]: { text: 'Pick a fruit' } },
    },
  },
  {
    id: 'opens-a-named-listbox',
    describe: 'a click opens a listbox with the options; disabled ones are marked',
    props: {},
    steps: [{ do: 'click', target: trigger }],
    expect: {
      queries: [
        { role: 'combobox', attrs: { 'aria-expanded': 'true' } },
        { role: 'listbox', name: 'Fruit' },
        { role: 'option', name: 'Apple', attrs: { 'aria-disabled': null } },
        { role: 'option', name: 'Banana', attrs: { 'aria-disabled': 'true' } },
        { role: 'option', name: 'Cherry' },
      ],
    },
  },
  {
    id: 'click-selects-reports-and-closes',
    describe: 'choosing an option reports its value, shows its label and closes the list',
    props: {},
    steps: [
      { do: 'click', target: trigger },
      { do: 'click', target: '[role="option"][data-value="cherry"]' },
      { do: 'wait', selector: '[role="listbox"]:not([hidden])', absent: true },
    ],
    expect: {
      emitted: ['cherry'],
      within: { [trigger]: { text: 'Cherry' } },
      queries: [{ role: 'combobox', attrs: { 'aria-expanded': 'false' } }],
    },
  },
  {
    id: 'disabled-option-ignored',
    describe: 'a disabled option cannot be chosen',
    props: {},
    steps: [
      { do: 'click', target: trigger },
      { do: 'click', target: '[role="option"][data-value="banana"]' },
    ],
    expect: { emitted: [], within: { [trigger]: { text: 'Pick a fruit' } } },
  },
  {
    id: 'default-value',
    describe: 'defaultValue shows that option without reporting it',
    props: { extra: { defaultValue: 'cherry' } },
    expect: { emitted: [], within: { [trigger]: { text: 'Cherry' } } },
  },
  {
    id: 'controlled-reports-the-request',
    describe: 'with value set the parent decides: the choice is reported but the label stays',
    props: { extra: { value: 'apple' } },
    steps: [
      { do: 'click', target: trigger },
      { do: 'click', target: '[role="option"][data-value="cherry"]' },
    ],
    expect: { emitted: ['cherry'], within: { [trigger]: { text: 'Apple' } } },
  },
  {
    id: 'keyboard-opens-and-chooses',
    describe:
      'ArrowDown on the focused trigger opens the list and Enter chooses the highlighted option',
    props: {},
    steps: [
      { do: 'focus', target: trigger },
      { do: 'key', key: 'ArrowDown', target: trigger },
      { do: 'wait', selector: '[role="listbox"]:not([hidden])' },
      { do: 'wait', selector: '[role="listbox"]:focus-within [role="option"][data-highlighted]' },
      { do: 'key', key: 'Enter' },
    ],
    expect: { emitted: ['apple'], within: { [trigger]: { text: 'Apple' } } },
  },
  {
    id: 'disabled',
    describe: 'disabled disables the trigger so it cannot open',
    props: { disabled: true },
    steps: [{ do: 'click', target: trigger }],
    expect: {
      within: { [trigger]: { attrs: { disabled: '' } } },
      queries: [{ role: 'combobox', attrs: { 'aria-expanded': 'false' } }],
    },
  },
  {
    id: 'native-field-for-forms',
    describe: 'name creates a hidden native select so the value reaches a <form>',
    props: { extra: { name: 'fruit', defaultValue: 'cherry' } },
    expect: { within: { 'select[name="fruit"]': { present: true } } },
  },
  {
    id: 'size-reflects-attr',
    describe: 'size becomes a data attribute',
    props: { size: 'lg' },
    expect: { attrs: { 'data-size': 'lg' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-select', 'custom'] },
  },
];

export const selectContract = defineContract({
  name: 'Select',
  names: { vue: 'TSelect', react: 'Select' },
  category: 'forms',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/',
  anatomy: ['root', 'label', 'control', 'trigger', 'content', 'item', 'item-indicator'],
  props: [
    { name: 'items', type: 'string', required: true },
    { name: 'label', type: 'string', required: true },
    { name: 'value', type: 'string' },
    { name: 'defaultValue', type: 'string' },
    { name: 'placeholder', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'open', type: 'boolean' },
    { name: 'defaultOpen', type: 'boolean', default: false },
    { name: 'size', type: 'enum', values: selectVariants.config.variants.size, default: 'md' },
  ],
  cases,
});
