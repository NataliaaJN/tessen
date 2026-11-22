import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { inputContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TInput from './Input.vue';

runContract(
  inputContract,
  vueAdapter('Vue (VTU)', TInput, { labelAs: 'none', valueEvent: 'onUpdate:modelValue' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: { 'aria-label': 'Name' } },
  {
    name: 'email with placeholder',
    props: { 'aria-label': 'Mail', type: 'email', placeholder: 'you@example.com' },
  },
  { name: 'invalid', props: { 'aria-label': 'Name', invalid: true } },
  { name: 'disabled', props: { 'aria-label': 'Name', disabled: true } },
];

describe('TInput · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TInput, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
