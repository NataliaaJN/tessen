import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const comboboxVariants = defineVariants({
  base: 't-combobox',
  variants: { size: ['sm', 'md', 'lg'] },
  defaults: { size: 'md' },
});

export type ComboboxVariantProps = NonNullable<Parameters<typeof comboboxVariants>[0]>;

/** Case-insensitive "contains" filter used by `Combobox` on the text typed. */
export function filterItems<T extends { label: string }>(items: readonly T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  return needle ? items.filter((item) => item.label.toLowerCase().includes(needle)) : [...items];
}

const input = '.t-combobox__input';
const trigger = '.t-combobox__trigger';
const option = (value: string) => `[role="option"][data-value="${value}"]`;

/**
 * Fixture: `Combobox` with `label` "Fruit" and `items` Apple (apple), Banana (banana, disabled),
 * Cherry (cherry). Props come from `extra`. The root is the wrapper element; the list is
 * rendered in a portal. The component filters the items by the text typed (`filterItems`).
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'a named combobox with list autocompletion; the list is closed',
    props: {},
    expect: {
      classes: ['t-combobox'],
      attrs: { 'data-size': 'md' },
      queries: [
        {
          role: 'combobox',
          name: 'Fruit',
          attrs: { 'aria-autocomplete': 'list', 'aria-expanded': 'false' },
        },
      ],
    },
  },
  {
    id: 'trigger-opens-the-list',
    describe: 'the arrow button opens the full list',
    props: {},
    steps: [{ do: 'click', target: trigger }],
    expect: {
      queries: [
        { role: 'combobox', attrs: { 'aria-expanded': 'true' } },
        { role: 'listbox', name: 'Fruit' },
        { role: 'option', name: 'Apple' },
        { role: 'option', name: 'Banana', attrs: { 'aria-disabled': 'true' } },
        { role: 'option', name: 'Cherry' },
      ],
    },
  },
  {
    id: 'typing-filters',
    describe: 'typing narrows the options to the matching ones',
    props: {},
    steps: [
      { do: 'type', text: 'ch', target: input },
      { do: 'wait', selector: option('cherry') },
    ],
    expect: {
      within: { [option('cherry')]: { present: true }, [option('apple')]: { present: false } },
    },
  },
  {
    id: 'no-results',
    describe: 'when nothing matches it says so',
    props: {},
    steps: [
      { do: 'type', text: 'zzz', target: input },
      { do: 'wait', selector: '.t-combobox__empty' },
    ],
    expect: { within: { '.t-combobox__empty': { text: 'No results' } } },
  },
  {
    id: 'click-selects-and-fills-the-input',
    describe: 'choosing an option reports its value and writes its label in the input',
    props: {},
    steps: [
      { do: 'click', target: trigger },
      { do: 'click', target: option('cherry') },
    ],
    expect: {
      emitted: ['cherry'],
      queries: [
        { role: 'combobox', props: { value: 'Cherry' }, attrs: { 'aria-expanded': 'false' } },
      ],
    },
  },
  {
    id: 'keyboard-filter-and-choose',
    describe: 'type, ArrowDown to highlight and Enter to choose, without leaving the input',
    props: {},
    steps: [
      { do: 'type', text: 'ch', target: input },
      { do: 'wait', selector: option('cherry') },
      { do: 'key', key: 'ArrowDown', target: input },
      { do: 'key', key: 'Enter', target: input },
    ],
    expect: { emitted: ['cherry'], queries: [{ role: 'combobox', props: { value: 'Cherry' } }] },
  },
  {
    id: 'disabled-option-ignored',
    describe: 'a disabled option cannot be chosen',
    props: {},
    steps: [
      { do: 'click', target: trigger },
      { do: 'click', target: option('banana') },
    ],
    expect: { emitted: [] },
  },
  {
    id: 'default-value',
    describe: 'defaultValue fills the input with that option without reporting it',
    props: { extra: { defaultValue: 'cherry' } },
    expect: { emitted: [], queries: [{ role: 'combobox', props: { value: 'Cherry' } }] },
  },
  {
    id: 'disabled',
    describe: 'disabled disables the input and the button',
    props: { disabled: true },
    expect: {
      within: { [input]: { attrs: { disabled: '' } }, [trigger]: { attrs: { disabled: '' } } },
    },
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
    expect: { classes: ['t-combobox', 'custom'] },
  },
];

export const comboboxContract = defineContract({
  name: 'Combobox',
  names: { vue: 'TCombobox', react: 'Combobox' },
  category: 'forms',
  tier: 'T2',
  engine: 'zag',
  apgPattern:
    'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/',
  anatomy: ['root', 'label', 'control', 'input', 'trigger', 'content', 'item', 'empty'],
  props: [
    { name: 'items', type: 'string', required: true },
    { name: 'label', type: 'string', required: true },
    { name: 'value', type: 'string' },
    { name: 'defaultValue', type: 'string' },
    { name: 'placeholder', type: 'string' },
    { name: 'emptyText', type: 'string', default: 'No results' },
    { name: 'disabled', type: 'boolean', default: false },
    { name: 'open', type: 'boolean' },
    { name: 'defaultOpen', type: 'boolean', default: false },
    { name: 'size', type: 'enum', values: comboboxVariants.config.variants.size, default: 'md' },
  ],
  cases,
});
