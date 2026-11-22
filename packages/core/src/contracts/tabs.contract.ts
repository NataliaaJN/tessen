import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const tabsVariants = defineVariants({
  base: 't-tabs',
  variants: {
    variant: ['underline', 'pill', 'segmented'],
    orientation: ['horizontal', 'vertical'],
  },
  defaults: { variant: 'underline', orientation: 'horizontal' },
});

export type TabsVariantProps = NonNullable<Parameters<typeof tabsVariants>[0]>;

export const tabsActivationModes = ['automatic', 'manual'] as const;

const tab = (value: string) => `[role="tab"][data-value="${value}"]`;

/**
 * Fixture: `Tabs` > `TabList` (aria-label "Letters") > `Tab` Alpha (alpha), Beta (beta, disabled),
 * Gamma (gamma), then one `TabPanel` per tab ("Alpha panel"...). Tabs props come from `extra`.
 * The root is the Tabs container.
 */
const cases: ContractCase[] = [
  {
    id: 'structure-and-aria',
    describe: 'exposes a named tablist, tabs and the selected panel wired with ARIA',
    props: {},
    expect: {
      classes: ['t-tabs'],
      attrs: { 'data-variant': 'underline', 'data-orientation': 'horizontal' },
      queries: [
        { role: 'tablist', name: 'Letters', attrs: { 'aria-orientation': 'horizontal' } },
        { role: 'tab', name: 'Alpha', attrs: { 'aria-selected': 'true', tabindex: '0' } },
        { role: 'tab', name: 'Gamma', attrs: { 'aria-selected': 'false', tabindex: '-1' } },
        { role: 'tabpanel', name: 'Alpha' },
      ],
      within: { '[role="tabpanel"]:not([hidden])': { text: 'Alpha panel' } },
    },
  },
  {
    id: 'default-value',
    describe: 'defaultValue selects another tab without reporting it',
    props: { extra: { defaultValue: 'gamma' } },
    expect: {
      emitted: [],
      queries: [
        { role: 'tab', name: 'Gamma', attrs: { 'aria-selected': 'true' } },
        { role: 'tabpanel', name: 'Gamma' },
      ],
    },
  },
  {
    id: 'click-selects-and-reports',
    describe: 'a click selects that tab, shows only its panel and reports the value',
    props: {},
    steps: [{ do: 'click', target: tab('gamma') }],
    expect: {
      emitted: ['gamma'],
      queries: [
        { role: 'tab', name: 'Gamma', attrs: { 'aria-selected': 'true' } },
        { role: 'tabpanel', name: 'Gamma' },
      ],
      within: { '[role="tabpanel"]:not([hidden])': { text: 'Gamma panel' } },
    },
  },
  {
    id: 'disabled-tab-ignored',
    describe: 'a disabled tab cannot be selected',
    props: {},
    steps: [{ do: 'click', target: tab('beta') }],
    expect: {
      emitted: [],
      queries: [
        { role: 'tab', name: 'Beta', attrs: { 'aria-selected': 'false' } },
        { role: 'tab', name: 'Alpha', attrs: { 'aria-selected': 'true' } },
      ],
    },
  },
  {
    id: 'arrow-keys-skip-disabled-and-loop',
    describe: 'arrow keys move focus, skipping disabled tabs and looping',
    props: {},
    steps: [
      { do: 'focus', target: tab('alpha') },
      { do: 'key', key: 'ArrowRight' },
    ],
    expect: { queries: [{ role: 'tab', name: 'Gamma', focused: true }] },
  },
  {
    id: 'arrow-left-loops-back',
    describe: 'ArrowLeft from the first tab goes to the last enabled one',
    props: {},
    steps: [
      { do: 'focus', target: tab('alpha') },
      { do: 'key', key: 'ArrowLeft' },
    ],
    expect: { queries: [{ role: 'tab', name: 'Gamma', focused: true }] },
  },
  {
    id: 'home-and-end',
    describe: 'End focuses the last tab and Home the first',
    props: {},
    steps: [
      { do: 'focus', target: tab('alpha') },
      { do: 'key', key: 'End' },
      { do: 'wait', selector: `${tab('gamma')}:focus` },
      { do: 'key', key: 'Home' },
    ],
    expect: { queries: [{ role: 'tab', name: 'Alpha', focused: true }] },
  },
  {
    id: 'vertical-orientation',
    describe: 'vertical reflects on the root and the tablist',
    props: { extra: { orientation: 'vertical' } },
    expect: {
      attrs: { 'data-orientation': 'vertical' },
      queries: [{ role: 'tablist', name: 'Letters', attrs: { 'aria-orientation': 'vertical' } }],
    },
  },
  {
    id: 'variant-reflects-attr',
    describe: 'variant becomes a data attribute',
    props: { variant: 'pill' },
    expect: { attrs: { 'data-variant': 'pill' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-tabs', 'custom'] },
  },
];

export const tabsContract = defineContract({
  name: 'Tabs',
  names: { vue: 'TTabs', react: 'Tabs' },
  category: 'navigation',
  tier: 'T1',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
  anatomy: ['root', 'list', 'tab', 'panel'],
  props: [
    { name: 'value', type: 'string' },
    { name: 'defaultValue', type: 'string' },
    {
      name: 'variant',
      type: 'enum',
      values: tabsVariants.config.variants.variant,
      default: 'underline',
    },
    {
      name: 'orientation',
      type: 'enum',
      values: tabsVariants.config.variants.orientation,
      default: 'horizontal',
    },
    { name: 'activationMode', type: 'enum', values: tabsActivationModes, default: 'automatic' },
  ],
  cases,
});
