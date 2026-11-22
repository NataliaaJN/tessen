import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { checkboxContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TCheckbox from './Checkbox.vue';

runContract(
  checkboxContract,
  vueAdapter('Vue (VTU)', TCheckbox, { valueEvent: 'onUpdate:modelValue' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'Accept' },
  { name: 'checked', props: { defaultChecked: true }, slot: 'Accept' },
  { name: 'indeterminate', props: { indeterminate: true }, slot: 'All' },
  { name: 'invalid', props: { invalid: true }, slot: 'Accept' },
  { name: 'disabled', props: { disabled: true }, slot: 'Accept' },
];

describe('TCheckbox · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TCheckbox, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
