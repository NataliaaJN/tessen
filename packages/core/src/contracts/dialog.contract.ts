import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const dialogVariants = defineVariants({
  base: 't-dialog',
  variants: { size: ['sm', 'md', 'lg'] },
  defaults: { size: 'md' },
});

export type DialogVariantProps = NonNullable<Parameters<typeof dialogVariants>[0]>;

export const dialogRoles = ['dialog', 'alertdialog'] as const;

const dialogEl = '[role="dialog"], [role="alertdialog"]';

/**
 * Fixture: `Dialog` > `DialogTrigger` "Open" + `DialogContent` (rendered in a portal) holding
 * `DialogTitle` "Delete item", `DialogDescription` "This cannot be undone.", a button "Inside"
 * and `DialogClose` "Close". Dialog props come from `extra`. There is no wrapper element: the
 * root is the trigger button.
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'the trigger announces a dialog and nothing is rendered',
    props: {},
    expect: {
      role: 'button',
      name: 'Open',
      classes: ['t-dialog__trigger'],
      attrs: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
      within: { [dialogEl]: { present: false } },
    },
  },
  {
    id: 'opens-labelled-described-modal',
    describe: 'a click opens a modal dialog named by its title and described by its description',
    props: {},
    steps: [{ do: 'click' }, { do: 'wait', selector: dialogEl }],
    expect: {
      attrs: { 'aria-expanded': 'true' },
      queries: [
        {
          role: 'dialog',
          name: 'Delete item',
          description: 'This cannot be undone.',
          attrs: { 'aria-modal': 'true' },
        },
      ],
      within: { '.t-dialog__backdrop': { present: true }, '.t-dialog__content': { present: true } },
    },
  },
  {
    id: 'default-open',
    describe: 'defaultOpen renders it open from the start',
    props: { extra: { defaultOpen: true } },
    steps: [{ do: 'wait', selector: dialogEl }],
    expect: { queries: [{ role: 'dialog', name: 'Delete item' }] },
  },
  {
    id: 'escape-closes-and-restores-focus',
    describe: 'Escape closes it and returns focus to the trigger',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: dialogEl },
      { do: 'key', key: 'Escape' },
      { do: 'wait', selector: dialogEl, absent: true },
    ],
    expect: { focused: true, within: { [dialogEl]: { present: false } } },
  },
  {
    id: 'close-button-closes',
    describe: 'the close button closes it',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: dialogEl },
      { do: 'click', target: '.t-dialog__close' },
      { do: 'wait', selector: dialogEl, absent: true },
    ],
    expect: { emitted: [true, false], within: { [dialogEl]: { present: false } } },
  },
  {
    id: 'escape-can-be-disabled',
    describe: 'closeOnEscape=false keeps it open on Escape',
    props: { extra: { defaultOpen: true, closeOnEscape: false } },
    steps: [
      { do: 'wait', selector: dialogEl },
      { do: 'key', key: 'Escape' },
    ],
    expect: { within: { [dialogEl]: { present: true } } },
  },
  {
    id: 'controlled-reports-the-request',
    describe: 'with open=false a click reports the request but the parent decides',
    props: { extra: { open: false } },
    steps: [{ do: 'click' }],
    expect: { emitted: [true], within: { [dialogEl]: { present: false } } },
  },
  {
    id: 'alertdialog-role',
    describe: 'role=alertdialog opens as an alertdialog',
    props: { extra: { role: 'alertdialog' } },
    steps: [{ do: 'click' }, { do: 'wait', selector: dialogEl }],
    expect: { queries: [{ role: 'alertdialog', name: 'Delete item' }] },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the trigger class',
    props: { class: 'custom' },
    expect: { classes: ['t-dialog__trigger', 'custom'] },
  },
];

export const dialogContract = defineContract({
  name: 'Dialog',
  names: { vue: 'TDialog', react: 'Dialog' },
  category: 'overlays',
  tier: 'T1',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  anatomy: ['trigger', 'backdrop', 'content', 'title', 'description', 'close'],
  props: [
    { name: 'open', type: 'boolean' },
    { name: 'defaultOpen', type: 'boolean', default: false },
    { name: 'modal', type: 'boolean', default: true },
    { name: 'role', type: 'enum', values: dialogRoles, default: 'dialog' },
    { name: 'closeOnEscape', type: 'boolean', default: true },
    { name: 'closeOnInteractOutside', type: 'boolean', default: true },
    { name: 'size', type: 'enum', values: dialogVariants.config.variants.size, default: 'md' },
  ],
  cases,
});
