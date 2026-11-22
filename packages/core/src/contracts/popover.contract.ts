import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const popoverVariants = defineVariants({
  base: 't-popover',
  variants: { placement: ['top', 'bottom', 'left', 'right'] },
  defaults: { placement: 'bottom' },
});

export type PopoverVariantProps = NonNullable<Parameters<typeof popoverVariants>[0]>;

const dialogEl = '[role="dialog"]';

/**
 * Fixture: `Popover` > `PopoverTrigger` "Details" + `PopoverContent` (rendered in a portal)
 * holding `PopoverTitle` "Shipping", `PopoverDescription` "Arrives in two days.", a button
 * "Inside" and `PopoverClose` "Close". Popover props come from `extra`. There is no wrapper
 * element: the root is the trigger button. Unlike `Dialog` it is not modal: the page behind
 * stays reachable.
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'the trigger announces a popup dialog and nothing is rendered',
    props: {},
    expect: {
      role: 'button',
      name: 'Details',
      classes: ['t-popover__trigger'],
      attrs: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
      within: { [dialogEl]: { present: false } },
    },
  },
  {
    id: 'opens-labelled-and-described',
    describe: 'a click opens a non-modal dialog named by its title and described by its text',
    props: {},
    steps: [{ do: 'click' }, { do: 'wait', selector: dialogEl }],
    expect: {
      attrs: { 'aria-expanded': 'true' },
      queries: [
        {
          role: 'dialog',
          name: 'Shipping',
          description: 'Arrives in two days.',
          attrs: { 'aria-modal': null },
        },
      ],
      within: { '.t-popover__arrow': { present: false } },
    },
  },
  {
    id: 'default-open',
    describe: 'defaultOpen renders it open from the start',
    props: { extra: { defaultOpen: true } },
    steps: [{ do: 'wait', selector: dialogEl }],
    expect: { queries: [{ role: 'dialog', name: 'Shipping' }] },
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
    describe: 'the close button closes it and reports the change',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: dialogEl },
      { do: 'click', target: '.t-popover__close' },
      { do: 'wait', selector: dialogEl, absent: true },
    ],
    expect: { emitted: [true, false], within: { [dialogEl]: { present: false } } },
  },
  {
    id: 'second-click-toggles',
    describe: 'clicking the trigger again closes it',
    props: {},
    steps: [
      { do: 'click' },
      { do: 'wait', selector: dialogEl },
      { do: 'click' },
      { do: 'wait', selector: dialogEl, absent: true },
    ],
    expect: { emitted: [true, false] },
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
    id: 'passthrough-class',
    describe: 'a consumer class is added to the trigger class',
    props: { class: 'custom' },
    expect: { classes: ['t-popover__trigger', 'custom'] },
  },
];

export const popoverContract = defineContract({
  name: 'Popover',
  names: { vue: 'TPopover', react: 'Popover' },
  category: 'overlays',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  anatomy: ['trigger', 'content', 'title', 'description', 'close'],
  props: [
    { name: 'open', type: 'boolean' },
    { name: 'defaultOpen', type: 'boolean', default: false },
    {
      name: 'placement',
      type: 'enum',
      values: popoverVariants.config.variants.placement,
      default: 'bottom',
    },
    { name: 'closeOnEscape', type: 'boolean', default: true },
    { name: 'closeOnInteractOutside', type: 'boolean', default: true },
  ],
  cases,
});
