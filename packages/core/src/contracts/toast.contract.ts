import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const toastVariants = defineVariants({
  base: 't-toast',
  variants: { type: ['info', 'success', 'warning', 'error', 'loading'] },
  defaults: { type: 'info' },
});

export type ToastVariantProps = NonNullable<Parameters<typeof toastVariants>[0]>;

/** `placement` is an option of `createToaster`, not a prop of `Toaster`. */
export const toastPlacements = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
] as const;

const toastEl = '.t-toast';

/**
 * Fixture: a `Toaster` plus a button "Notify" that, when clicked, creates a toast titled
 * "Saved" with the description "Changes stored" and a close button (the fixture's own wiring:
 * `toaster.create`). Fixture props come from `extra`: `type` and `duration` (milliseconds)
 * go to the toast. The root is the "Notify" button. Dismissing by time is the engine's timer: it
 * is checked in a real browser (`tooling/e2e`), where animation frames are not starved.
 */
const cases: ContractCase[] = [
  {
    id: 'region-is-always-there',
    describe: 'the notifications region exists and is named, even with no toast',
    props: {},
    expect: {
      within: { [toastEl]: { present: false } },
      queries: [{ role: 'region', name: 'Notifications, bottom-end (alt+T)' }],
    },
  },
  {
    id: 'shows-title-and-description',
    describe: 'creating a toast shows its title and description inside the live region',
    props: {},
    steps: [{ do: 'click' }, { do: 'wait', selector: toastEl }],
    expect: {
      within: {
        '.t-toast__title': { text: 'Saved' },
        '.t-toast__description': { text: 'Changes stored' },
      },
      queries: [{ role: 'status' }],
    },
  },
  {
    id: 'type-reflects-attr',
    describe: 'the toast type becomes a data attribute for styling',
    props: { extra: { type: 'success' } },
    steps: [{ do: 'click' }, { do: 'wait', selector: toastEl }],
    expect: { within: { [toastEl]: { attrs: { 'data-type': 'success' } } } },
  },
  {
    id: 'close-button-dismisses',
    describe: 'the close button removes the toast',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: toastEl },
      { do: 'click', target: '.t-toast__close' },
      { do: 'wait', selector: toastEl, absent: true, timeout: 10_000 },
    ],
    expect: { within: { [toastEl]: { present: false } } },
  },
  {
    id: 'several-toasts-stack',
    describe: 'each creation adds one toast',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: toastEl },
      { do: 'click' },
      { do: 'wait', selector: '.t-toast + .t-toast' },
    ],
    expect: { within: { '.t-toast + .t-toast': { present: true } } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the button the fixture renders',
    props: { class: 'custom' },
    expect: { classes: ['custom'] },
  },
];

export const toastContract = defineContract({
  name: 'Toast',
  names: { vue: 'TToaster', react: 'Toaster' },
  category: 'feedback',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/',
  anatomy: ['region', 'toast', 'title', 'description', 'action', 'close'],
  props: [
    { name: 'toaster', type: 'string', required: true },
    { name: 'label', type: 'string', default: 'Notifications' },
  ],
  cases,
});
