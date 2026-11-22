import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const alertDialogVariants = defineVariants({
  base: 't-dialog',
  variants: { size: ['sm', 'md', 'lg'] },
  defaults: { size: 'sm' },
});

export type AlertDialogVariantProps = NonNullable<Parameters<typeof alertDialogVariants>[0]>;

const alertEl = '[role="alertdialog"]';

/**
 * Fixture: `AlertDialog` > `AlertDialogTrigger` "Delete" + `AlertDialogContent` (in a portal)
 * holding `AlertDialogTitle` "Delete item?", `AlertDialogDescription` "This cannot be undone.",
 * `AlertDialogCancel` "Keep" and `AlertDialogAction` "Remove". There is no wrapper element: the
 * root is the trigger button. It is a `Dialog` that asks for a decision: no close button, and a
 * click outside does not dismiss it.
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'the trigger is a button and nothing is rendered',
    props: {},
    expect: {
      role: 'button',
      name: 'Delete',
      classes: ['t-dialog__trigger'],
      within: { [alertEl]: { present: false } },
    },
  },
  {
    id: 'opens-as-a-modal-alertdialog',
    describe: 'a click opens a modal alertdialog named by its title and described by its text',
    props: {},
    steps: [{ do: 'click' }, { do: 'wait', selector: alertEl }],
    expect: {
      queries: [
        {
          role: 'alertdialog',
          name: 'Delete item?',
          description: 'This cannot be undone.',
          attrs: { 'aria-modal': 'true' },
        },
      ],
      within: { '.t-dialog__close': { present: false } },
    },
  },
  {
    id: 'cancel-closes',
    describe: 'Cancel closes it and returns focus to the trigger',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: alertEl },
      { do: 'click', target: '.t-alert-dialog__cancel' },
      { do: 'wait', selector: alertEl, absent: true },
    ],
    expect: { emitted: [true, false], focused: true },
  },
  {
    id: 'action-closes',
    describe: 'the action closes it too (the consumer runs its work in onClick)',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: alertEl },
      { do: 'click', target: '.t-alert-dialog__action' },
      { do: 'wait', selector: alertEl, absent: true },
    ],
    expect: { emitted: [true, false] },
  },
  {
    id: 'escape-closes',
    describe: 'Escape closes it',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: alertEl },
      { do: 'key', key: 'Escape' },
      { do: 'wait', selector: alertEl, absent: true },
    ],
    expect: { emitted: [true, false] },
  },
  {
    id: 'default-open',
    describe: 'defaultOpen renders it open from the start',
    props: { extra: { defaultOpen: true } },
    steps: [{ do: 'wait', selector: alertEl }],
    expect: { queries: [{ role: 'alertdialog', name: 'Delete item?' }] },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the trigger class',
    props: { class: 'custom' },
    expect: { classes: ['t-dialog__trigger', 'custom'] },
  },
];

export const alertDialogContract = defineContract({
  name: 'AlertDialog',
  names: { vue: 'TAlertDialog', react: 'AlertDialog' },
  category: 'overlays',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/',
  anatomy: ['trigger', 'backdrop', 'content', 'title', 'description', 'cancel', 'action'],
  props: [
    { name: 'open', type: 'boolean' },
    { name: 'defaultOpen', type: 'boolean', default: false },
    { name: 'closeOnEscape', type: 'boolean', default: true },
    { name: 'size', type: 'enum', values: alertDialogVariants.config.variants.size, default: 'sm' },
  ],
  cases,
});
