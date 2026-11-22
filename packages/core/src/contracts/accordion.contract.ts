import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const accordionVariants = defineVariants({
  base: 't-accordion',
  variants: { variant: ['plain', 'bordered'] },
  defaults: { variant: 'plain' },
});

export type AccordionVariantProps = NonNullable<Parameters<typeof accordionVariants>[0]>;

/** Splits the neutral string form of a list value (`'one,three'`); the real API uses arrays. */
export function parseAccordionValue(value: string | undefined): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

const trigger = (value: string) => `.t-accordion__trigger[data-value="${value}"]`;

/**
 * Fixture: `Accordion` > three `AccordionItem` (one, two, three; "two" disabled), each with an
 * `AccordionTrigger` "Item one"/"Item two"/"Item three" and an `AccordionContent` "Content
 * one"... Props come from `extra`; `defaultValue` is a comma separated string here. The
 * reported value is joined with commas. The root is the Accordion container.
 */
const cases: ContractCase[] = [
  {
    id: 'structure-and-aria',
    describe: 'each trigger is a button inside a heading, collapsed, controlling its region',
    props: {},
    expect: {
      classes: ['t-accordion'],
      attrs: { 'data-variant': 'plain' },
      queries: [
        { role: 'button', name: 'Item one', attrs: { 'aria-expanded': 'false' } },
        { role: 'heading', name: 'Item one' },
      ],
      within: { '.t-accordion__content[data-state="closed"]': { present: true } },
    },
  },
  {
    id: 'click-expands-and-reports',
    describe: 'a click expands the item, shows its content as a named region and reports it',
    props: {},
    steps: [{ do: 'click', target: trigger('one') }],
    expect: {
      emitted: ['one'],
      queries: [
        { role: 'button', name: 'Item one', attrs: { 'aria-expanded': 'true' } },
        { role: 'region', name: 'Item one' },
      ],
    },
  },
  {
    id: 'single-mode-closes-the-other',
    describe: 'by default opening one closes the one that was open',
    props: {},
    steps: [
      { do: 'click', target: trigger('one') },
      { do: 'click', target: trigger('three') },
    ],
    expect: {
      emitted: ['one', 'three'],
      queries: [
        { role: 'button', name: 'Item one', attrs: { 'aria-expanded': 'false' } },
        { role: 'button', name: 'Item three', attrs: { 'aria-expanded': 'true' } },
      ],
    },
  },
  {
    id: 'multiple-keeps-both-open',
    describe: 'multiple lets several items stay open',
    props: { extra: { multiple: true } },
    steps: [
      { do: 'click', target: trigger('one') },
      { do: 'click', target: trigger('three') },
    ],
    expect: {
      emitted: ['one', 'one,three'],
      queries: [
        { role: 'button', name: 'Item one', attrs: { 'aria-expanded': 'true' } },
        { role: 'button', name: 'Item three', attrs: { 'aria-expanded': 'true' } },
      ],
    },
  },
  {
    id: 'collapsible-by-default',
    describe: 'clicking the open item closes it',
    props: { extra: { defaultValue: 'one' } },
    steps: [{ do: 'click', target: trigger('one') }],
    expect: {
      emitted: [''],
      queries: [{ role: 'button', name: 'Item one', attrs: { 'aria-expanded': 'false' } }],
    },
  },
  {
    id: 'not-collapsible-keeps-one-open',
    describe: 'collapsible=false keeps the open item open',
    props: { extra: { defaultValue: 'one', collapsible: false } },
    steps: [{ do: 'click', target: trigger('one') }],
    expect: {
      emitted: [],
      queries: [{ role: 'button', name: 'Item one', attrs: { 'aria-expanded': 'true' } }],
    },
  },
  {
    id: 'default-value',
    describe: 'defaultValue opens that item without reporting it',
    props: { extra: { defaultValue: 'three' } },
    expect: {
      emitted: [],
      queries: [{ role: 'button', name: 'Item three', attrs: { 'aria-expanded': 'true' } }],
    },
  },
  {
    id: 'disabled-item-ignored',
    describe: 'a disabled item cannot be expanded',
    props: {},
    steps: [{ do: 'click', target: trigger('two') }],
    expect: {
      emitted: [],
      queries: [{ role: 'button', name: 'Item two', attrs: { 'aria-expanded': 'false' } }],
    },
  },
  {
    id: 'arrow-keys-skip-disabled-and-loop',
    describe: 'ArrowDown moves focus to the next enabled trigger and loops',
    props: {},
    steps: [
      { do: 'focus', target: trigger('one') },
      { do: 'key', key: 'ArrowDown', target: trigger('one') },
    ],
    expect: { queries: [{ role: 'button', name: 'Item three', focused: true }] },
  },
  {
    id: 'home-and-end',
    describe: 'End focuses the last trigger and Home the first',
    props: {},
    steps: [
      { do: 'focus', target: trigger('one') },
      { do: 'key', key: 'End', target: trigger('one') },
      { do: 'wait', selector: `${trigger('three')}:focus` },
      { do: 'key', key: 'Home', target: trigger('three') },
    ],
    expect: { queries: [{ role: 'button', name: 'Item one', focused: true }] },
  },
  {
    id: 'variant-reflects-attr',
    describe: 'variant becomes a data attribute',
    props: { variant: 'bordered' },
    expect: { attrs: { 'data-variant': 'bordered' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-accordion', 'custom'] },
  },
];

export const accordionContract = defineContract({
  name: 'Accordion',
  names: { vue: 'TAccordion', react: 'Accordion' },
  category: 'disclosure',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
  anatomy: ['root', 'item', 'heading', 'trigger', 'indicator', 'content'],
  props: [
    { name: 'value', type: 'string' },
    { name: 'defaultValue', type: 'string' },
    { name: 'multiple', type: 'boolean', default: false },
    { name: 'collapsible', type: 'boolean', default: true },
    { name: 'disabled', type: 'boolean', default: false },
    {
      name: 'variant',
      type: 'enum',
      values: accordionVariants.config.variants.variant,
      default: 'plain',
    },
  ],
  cases,
});
