import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const progressVariants = defineVariants({
  base: 't-progress',
  variants: {
    size: ['sm', 'md', 'lg'],
    tone: ['brand', 'success', 'warning', 'danger'],
  },
  defaults: { size: 'md', tone: 'brand' },
});

export type ProgressVariantProps = NonNullable<Parameters<typeof progressVariants>[0]>;

/** Clamps the value into `[0, max]`; `undefined` means indeterminate. Shared by Vue and React. */
export function progressPercent(value: number | undefined, max: number): number | undefined {
  if (value === undefined || !Number.isFinite(value) || max <= 0) return undefined;
  return (Math.min(Math.max(value, 0), max) / max) * 100;
}

const cases: ContractCase[] = [
  {
    id: 'indeterminate-by-default',
    describe: 'without a value it is an indeterminate progressbar',
    props: { attrs: { 'aria-label': 'Loading data' } },
    expect: {
      tag: 'div',
      role: 'progressbar',
      name: 'Loading data',
      classes: ['t-progress'],
      attrs: {
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': null,
        'data-state': 'indeterminate',
        'data-size': 'md',
        'data-tone': 'brand',
      },
    },
  },
  {
    id: 'determinate',
    describe: 'a value exposes aria-valuenow and the determinate state',
    props: { attrs: { 'aria-label': 'Upload' }, extra: { value: 40 } },
    expect: {
      attrs: { 'aria-valuenow': '40', 'aria-valuemax': '100', 'data-state': 'determinate' },
    },
  },
  {
    id: 'custom-max',
    describe: 'max changes the scale and the value is clamped into it',
    props: { attrs: { 'aria-label': 'Steps' }, extra: { value: 9, max: 4 } },
    expect: { attrs: { 'aria-valuenow': '4', 'aria-valuemax': '4' } },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'size and tone become data attributes',
    props: { attrs: { 'aria-label': 'x' }, extra: { size: 'lg', tone: 'success', value: 10 } },
    expect: { attrs: { 'data-size': 'lg', 'data-tone': 'success' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { attrs: { 'aria-label': 'x' }, class: 'custom' },
    expect: { classes: ['t-progress', 'custom'] },
  },
];

export const progressContract = defineContract({
  name: 'Progress',
  names: { vue: 'TProgress', react: 'Progress' },
  category: 'feedback',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/TR/wai-aria-1.2/#progressbar',
  anatomy: ['root', 'bar'],
  props: [
    { name: 'value', type: 'string' },
    { name: 'max', type: 'string', default: '100' },
    { name: 'size', type: 'enum', values: progressVariants.config.variants.size, default: 'md' },
    { name: 'tone', type: 'enum', values: progressVariants.config.variants.tone, default: 'brand' },
  ],
  cases,
});
