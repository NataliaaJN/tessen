import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const sliderVariants = defineVariants({
  base: 't-slider',
  variants: { orientation: ['horizontal', 'vertical'] },
  defaults: { orientation: 'horizontal' },
});

export type SliderVariantProps = NonNullable<Parameters<typeof sliderVariants>[0]>;

const thumb = '.t-slider__thumb';

/**
 * Fixture: `Slider` with `label` "Volume" and one thumb. Props come from `extra` (`min` 0,
 * `max` 100 and `step` 1 by default). The root is the wrapper element. The value is a number;
 * the runner receives what the component reports as a string.
 */
const cases: ContractCase[] = [
  {
    id: 'structure-and-aria',
    describe: 'a named slider thumb exposes its range and current value',
    props: { extra: { defaultValue: 30 } },
    expect: {
      classes: ['t-slider'],
      attrs: { 'data-orientation': 'horizontal' },
      queries: [
        {
          role: 'slider',
          name: 'Volume',
          attrs: {
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            'aria-valuenow': '30',
            'aria-orientation': 'horizontal',
          },
        },
      ],
    },
  },
  {
    id: 'default-is-the-minimum',
    describe: 'without a value the thumb sits at the minimum',
    props: {},
    expect: { queries: [{ role: 'slider', attrs: { 'aria-valuenow': '0' } }] },
  },
  {
    id: 'arrow-keys-step-and-report',
    describe: 'ArrowRight raises the value by one step and reports it',
    props: { extra: { defaultValue: 30 } },
    steps: [
      { do: 'focus', target: thumb },
      { do: 'key', key: 'ArrowRight', target: thumb },
    ],
    expect: { emitted: ['31'], queries: [{ role: 'slider', attrs: { 'aria-valuenow': '31' } }] },
  },
  {
    id: 'step-prop',
    describe: 'step sets the size of the keyboard step',
    props: { extra: { defaultValue: 30, step: 10 } },
    steps: [
      { do: 'focus', target: thumb },
      { do: 'key', key: 'ArrowRight', target: thumb },
    ],
    expect: { emitted: ['40'] },
  },
  {
    id: 'home-and-end',
    describe: 'End goes to the maximum and Home to the minimum',
    props: { extra: { defaultValue: 30 } },
    steps: [
      { do: 'focus', target: thumb },
      { do: 'key', key: 'End', target: thumb },
      { do: 'key', key: 'Home', target: thumb },
    ],
    expect: { emitted: ['100', '0'] },
  },
  {
    id: 'clamped-to-the-range',
    describe: 'the value never leaves min..max',
    props: { extra: { defaultValue: 100 } },
    steps: [
      { do: 'focus', target: thumb },
      { do: 'key', key: 'ArrowRight', target: thumb },
    ],
    expect: { emitted: [], queries: [{ role: 'slider', attrs: { 'aria-valuenow': '100' } }] },
  },
  {
    id: 'controlled-reports-the-request',
    describe: 'with value set the parent decides: the change is reported but the thumb stays',
    props: { extra: { value: 30 } },
    steps: [
      { do: 'focus', target: thumb },
      { do: 'key', key: 'ArrowRight', target: thumb },
    ],
    expect: { emitted: ['31'], queries: [{ role: 'slider', attrs: { 'aria-valuenow': '30' } }] },
  },
  {
    id: 'disabled',
    describe: 'disabled ignores the keyboard and is announced as disabled',
    props: { disabled: true, extra: { defaultValue: 30 } },
    steps: [{ do: 'key', key: 'ArrowRight', target: thumb }],
    expect: { emitted: [], within: { [thumb]: { attrs: { 'aria-disabled': 'true' } } } },
  },
  {
    id: 'vertical-orientation',
    describe: 'vertical reflects on the root and on the thumb',
    props: { extra: { orientation: 'vertical', defaultValue: 30 } },
    expect: {
      attrs: { 'data-orientation': 'vertical' },
      queries: [{ role: 'slider', attrs: { 'aria-orientation': 'vertical' } }],
    },
  },
  {
    id: 'native-field-for-forms',
    describe: 'name creates a hidden input with the value so it reaches a <form>',
    props: { extra: { name: 'volume', defaultValue: 30 } },
    expect: { within: { 'input[name="volume"]': { attrs: { value: '30' } } } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-slider', 'custom'] },
  },
];

export const sliderContract = defineContract({
  name: 'Slider',
  names: { vue: 'TSlider', react: 'Slider' },
  category: 'forms',
  tier: 'T2',
  engine: 'zag',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/',
  anatomy: ['root', 'label', 'value', 'control', 'track', 'range', 'thumb'],
  props: [
    { name: 'value', type: 'string' },
    { name: 'defaultValue', type: 'string' },
    { name: 'min', type: 'string', default: '0' },
    { name: 'max', type: 'string', default: '100' },
    { name: 'step', type: 'string', default: '1' },
    { name: 'label', type: 'string', required: true },
    { name: 'name', type: 'string' },
    { name: 'disabled', type: 'boolean', default: false },
    {
      name: 'orientation',
      type: 'enum',
      values: sliderVariants.config.variants.orientation,
      default: 'horizontal',
    },
  ],
  cases,
});
