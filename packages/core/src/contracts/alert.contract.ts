import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const alertVariants = defineVariants({
  base: 't-alert',
  variants: { tone: ['info', 'success', 'warning', 'danger'] },
  defaults: { tone: 'info' },
});

export type AlertVariantProps = NonNullable<Parameters<typeof alertVariants>[0]>;

/** `alert` interrupts the reader (assertive); `status` is polite. Severity decides. */
export const alertRoles = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
} as const;

const cases: ContractCase[] = [
  {
    id: 'info-is-status',
    describe: 'info is a polite status region with the documented defaults',
    props: { label: 'Saved in drafts' },
    expect: {
      role: 'status',
      classes: ['t-alert'],
      attrs: { 'data-tone': 'info' },
      parts: { '.t-alert__title': false, '.t-alert__icon': false, '.t-alert__body': true },
    },
  },
  {
    id: 'success-is-status',
    describe: 'success is a polite status region',
    props: { label: 'Saved', tone: 'success' },
    expect: { role: 'status', attrs: { 'data-tone': 'success' } },
  },
  {
    id: 'warning-is-alert',
    describe: 'warning is announced assertively',
    props: { label: 'Disk almost full', tone: 'warning' },
    expect: { role: 'alert', attrs: { 'data-tone': 'warning' } },
  },
  {
    id: 'danger-is-alert',
    describe: 'danger is announced assertively',
    props: { label: 'Could not save', tone: 'danger' },
    expect: { role: 'alert', attrs: { 'data-tone': 'danger' } },
  },
  {
    id: 'title-and-icon',
    describe: 'the title and the icon render only when provided',
    props: { label: 'Body', leading: 'i', extra: { title: 'Heads up' } },
    expect: {
      parts: { '.t-alert__title': true, '.t-alert__icon': true },
      within: { '.t-alert__title': { text: 'Heads up' } },
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { label: 'Body', class: 'custom' },
    expect: { classes: ['t-alert', 'custom'] },
  },
];

export const alertContract = defineContract({
  name: 'Alert',
  names: { vue: 'TAlert', react: 'Alert' },
  category: 'feedback',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/',
  anatomy: ['root', 'icon', 'title', 'body'],
  props: [
    { name: 'tone', type: 'enum', values: alertVariants.config.variants.tone, default: 'info' },
    { name: 'title', type: 'string' },
  ],
  cases,
});
