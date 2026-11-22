import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const tooltipVariants = defineVariants({
  base: 't-tooltip',
  variants: { placement: ['top', 'bottom', 'left', 'right'] },
  defaults: { placement: 'top' },
});

export type TooltipVariantProps = NonNullable<Parameters<typeof tooltipVariants>[0]>;

/**
 * Fixture: `Tooltip` > `TooltipTrigger` "Save" + `TooltipContent` "Save the file". Tooltip props
 * come from `extra` (`openDelay` is 0 in the cases so they do not wait). There is no wrapper
 * element: the root is the trigger button.
 */
const cases: ContractCase[] = [
  {
    id: 'closed-by-default',
    describe: 'the trigger is a focusable button and the tooltip is not rendered',
    props: {},
    expect: {
      tag: 'button',
      classes: ['t-tooltip__trigger'],
      attrs: { type: 'button', 'aria-describedby': null },
      within: { '[role="tooltip"]': { present: false } },
    },
  },
  {
    id: 'focus-opens-and-describes',
    describe: 'keyboard focus opens it and it becomes the description of the trigger',
    props: { extra: { openDelay: 0 } },
    steps: [
      { do: 'key', key: 'Tab' },
      { do: 'wait', selector: '[role="tooltip"]' },
    ],
    expect: {
      queries: [{ role: 'button', name: 'Save', description: 'Save the file' }],
      within: { '[role="tooltip"]': { text: 'Save the file' } },
    },
  },
  {
    id: 'escape-closes',
    describe: 'Escape closes it while focus stays on the trigger',
    props: { extra: { openDelay: 0 } },
    steps: [
      { do: 'key', key: 'Tab' },
      { do: 'wait', selector: '[role="tooltip"]' },
      { do: 'key', key: 'Escape' },
      { do: 'wait', selector: '[role="tooltip"]', absent: true },
    ],
    expect: { focused: true, within: { '[role="tooltip"]': { present: false } } },
  },
  {
    id: 'hover-opens-and-leaving-closes',
    describe: 'hover opens it and moving away closes it',
    props: { extra: { openDelay: 0, closeDelay: 0 } },
    steps: [
      { do: 'hover' },
      { do: 'wait', selector: '[role="tooltip"]' },
      { do: 'unhover' },
      { do: 'wait', selector: '[role="tooltip"]', absent: true },
    ],
    expect: { within: { '[role="tooltip"]': { present: false } } },
  },
  {
    id: 'placement-reflects-attr',
    describe: 'placement is reflected on the content',
    props: { extra: { openDelay: 0, placement: 'bottom' } },
    steps: [
      { do: 'key', key: 'Tab' },
      { do: 'wait', selector: '[role="tooltip"]' },
    ],
    expect: { within: { '[role="tooltip"]': { attrs: { 'data-placement': 'bottom' } } } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the trigger class',
    props: { class: 'custom' },
    expect: { classes: ['t-tooltip__trigger', 'custom'] },
  },
];

export const tooltipContract = defineContract({
  name: 'Tooltip',
  names: { vue: 'TTooltip', react: 'Tooltip' },
  category: 'feedback',
  tier: 'T1',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/',
  anatomy: ['trigger', 'content'],
  props: [
    {
      name: 'placement',
      type: 'enum',
      values: tooltipVariants.config.variants.placement,
      default: 'top',
    },
    { name: 'openDelay', type: 'string', default: '400' },
    { name: 'closeDelay', type: 'string', default: '150' },
  ],
  cases,
});
