import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const radioGroupVariants = defineVariants({
  base: 't-radio-group',
  variants: { orientation: ['vertical', 'horizontal'], invalid: 'boolean' },
  defaults: { orientation: 'vertical', invalid: false },
});

export type RadioGroupVariantProps = NonNullable<Parameters<typeof radioGroupVariants>[0]>;

export const radioVariants = defineVariants({
  base: 't-radio',
  variants: { size: ['sm', 'md', 'lg'] },
  defaults: { size: 'md' },
});

export type RadioVariantProps = NonNullable<Parameters<typeof radioVariants>[0]>;

/**
 * Fixture: `RadioGroup` (aria-label "Plan") > `Radio` "Free" (free), "Pro" (pro), "Team" (team).
 * The root is the group; group props come from `extra`.
 */
const cases: ContractCase[] = [
  {
    id: 'group-role-and-radios',
    describe: 'is a named radiogroup holding native radios that share a name, none selected',
    props: {},
    expect: {
      classes: ['t-radio-group'],
      attrs: { role: 'radiogroup', 'data-orientation': 'vertical', 'aria-orientation': null },
      queries: [
        { role: 'radiogroup', name: 'Plan' },
        { role: 'radio', name: 'Free', props: { checked: false } },
        { role: 'radio', name: 'Pro', props: { checked: false } },
      ],
    },
  },
  {
    id: 'default-value',
    describe: 'defaultValue selects one radio without reporting it',
    props: { extra: { defaultValue: 'pro' } },
    expect: {
      emitted: [],
      queries: [
        { role: 'radio', name: 'Pro', props: { checked: true } },
        { role: 'radio', name: 'Free', props: { checked: false } },
      ],
    },
  },
  {
    id: 'click-selects-and-reports',
    describe: 'a click selects that radio, unselects the rest and reports its value',
    props: { extra: { defaultValue: 'free' } },
    steps: [{ do: 'click', target: 'input[value="team"]' }],
    expect: {
      emitted: ['team'],
      queries: [
        { role: 'radio', name: 'Team', props: { checked: true } },
        { role: 'radio', name: 'Free', props: { checked: false } },
      ],
    },
  },
  {
    id: 'arrow-keys-move-selection',
    describe: 'arrow keys move the selection through the group (native behaviour)',
    props: { extra: { defaultValue: 'free' } },
    steps: [
      { do: 'focus', target: 'input[value="free"]' },
      { do: 'key', key: 'ArrowDown' },
    ],
    expect: {
      emitted: ['pro'],
      queries: [{ role: 'radio', name: 'Pro', props: { checked: true }, focused: true }],
    },
  },
  {
    id: 'horizontal-orientation',
    describe: 'horizontal is reflected as a data attribute',
    props: { extra: { orientation: 'horizontal' } },
    expect: { attrs: { 'data-orientation': 'horizontal' } },
  },
  {
    id: 'disabled-group',
    describe: 'disabled disables every radio and never reports',
    props: { extra: { disabled: true } },
    steps: [{ do: 'click', target: 'input[value="pro"]' }],
    expect: {
      emitted: [],
      attrs: { 'data-disabled': '' },
      queries: [{ role: 'radio', name: 'Pro', attrs: { disabled: '' } }],
    },
  },
  {
    id: 'invalid-group',
    describe: 'invalid marks the group and each radio',
    props: { extra: { invalid: true } },
    expect: {
      attrs: { 'data-invalid': '', 'aria-invalid': 'true' },
      queries: [{ role: 'radio', name: 'Pro', attrs: { 'aria-invalid': 'true' } }],
    },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { class: 'custom' },
    expect: { classes: ['t-radio-group', 'custom'] },
  },
];

export const radioGroupContract = defineContract({
  name: 'RadioGroup',
  names: { vue: 'TRadioGroup', react: 'RadioGroup' },
  category: 'forms',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
  anatomy: ['root', 'radio', 'input', 'indicator', 'label'],
  props: [
    {
      name: 'orientation',
      type: 'enum',
      values: radioGroupVariants.config.variants.orientation,
      default: 'vertical',
    },
    { name: 'value', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'invalid', type: 'boolean', default: false },
    { name: 'disabled', type: 'boolean', default: false },
  ],
  cases,
});
