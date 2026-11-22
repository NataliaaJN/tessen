import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const dropdownMenuVariants = defineVariants({
  base: 't-menu',
  variants: { placement: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
  defaults: { placement: 'bottom-start' },
});

export type DropdownMenuVariantProps = NonNullable<Parameters<typeof dropdownMenuVariants>[0]>;

const menuEl = '[role="menu"]';
const item = (value: string) => `[role="menuitem"][data-value="${value}"]`;

/**
 * Fixture: `DropdownMenu` > `DropdownMenuTrigger` "Actions" + `DropdownMenuContent` (in a
 * portal) with `DropdownMenuItem` Edit (edit), Duplicate (duplicate, disabled), a
 * `DropdownMenuSeparator` and Delete (delete). The root reports the chosen value (`select`).
 * There is no wrapper element: the root is the trigger button. For actions, never navigation.
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'the trigger announces a menu and nothing is rendered',
    props: {},
    expect: {
      role: 'button',
      name: 'Actions',
      classes: ['t-menu__trigger'],
      attrs: { 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
      within: { [menuEl]: { present: false } },
    },
  },
  {
    id: 'opens-a-named-menu',
    describe: 'a click opens a menu named by the trigger with its items; disabled is marked',
    props: {},
    steps: [{ do: 'click' }, { do: 'wait', selector: menuEl }],
    expect: {
      attrs: { 'aria-expanded': 'true' },
      queries: [
        { role: 'menu', name: 'Actions' },
        { role: 'menuitem', name: 'Edit' },
        { role: 'menuitem', name: 'Duplicate', attrs: { 'aria-disabled': 'true' } },
        { role: 'menuitem', name: 'Delete' },
        { role: 'separator' },
      ],
    },
  },
  {
    id: 'click-reports-and-closes',
    describe: 'choosing an item reports its value and closes the menu',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: menuEl },
      { do: 'click', target: item('delete') },
      { do: 'wait', selector: menuEl, absent: true },
    ],
    expect: { emitted: ['delete'], within: { [menuEl]: { present: false } } },
  },
  {
    id: 'disabled-item-ignored',
    describe: 'a disabled item cannot be chosen',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: menuEl },
      { do: 'click', target: item('duplicate') },
    ],
    expect: { emitted: [], within: { [menuEl]: { present: true } } },
  },
  {
    id: 'keyboard-opens-and-chooses',
    describe: 'ArrowDown on the trigger opens it on the first item and Enter chooses it',
    props: {},
    steps: [
      { do: 'focus' },
      { do: 'key', key: 'ArrowDown' },
      { do: 'wait', selector: menuEl },
      { do: 'wait', selector: '[role="menu"] [data-highlighted]' },
      { do: 'key', key: 'Enter', target: menuEl },
    ],
    expect: { emitted: ['edit'] },
  },
  {
    id: 'arrow-keys-skip-disabled',
    describe: 'ArrowDown skips the disabled item',
    props: {},
    steps: [
      { do: 'focus' },
      { do: 'key', key: 'ArrowDown' },
      { do: 'wait', selector: menuEl },
      { do: 'wait', selector: '[role="menu"] [data-highlighted]' },
      { do: 'key', key: 'ArrowDown', target: menuEl },
      { do: 'key', key: 'Enter', target: menuEl },
    ],
    expect: { emitted: ['delete'] },
  },
  {
    id: 'escape-closes-and-restores-focus',
    describe: 'Escape closes it and returns focus to the trigger',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: menuEl },
      { do: 'key', key: 'Escape', target: menuEl },
      { do: 'wait', selector: menuEl, absent: true },
    ],
    expect: { focused: true },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the trigger class',
    props: { class: 'custom' },
    expect: { classes: ['t-menu__trigger', 'custom'] },
  },
];

export const dropdownMenuContract = defineContract({
  name: 'DropdownMenu',
  names: { vue: 'TDropdownMenu', react: 'DropdownMenu' },
  category: 'overlays',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
  anatomy: ['trigger', 'content', 'item', 'separator', 'label'],
  props: [
    { name: 'open', type: 'boolean' },
    { name: 'defaultOpen', type: 'boolean', default: false },
    {
      name: 'placement',
      type: 'enum',
      values: dropdownMenuVariants.config.variants.placement,
      default: 'bottom-start',
    },
  ],
  cases,
});
