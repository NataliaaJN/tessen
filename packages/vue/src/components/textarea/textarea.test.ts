import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { textareaContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TTextarea from './Textarea.vue';

runContract(
  textareaContract,
  vueAdapter('Vue (VTU)', TTextarea, { labelAs: 'none', valueEvent: 'onUpdate:modelValue' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: { 'aria-label': 'Notes' } },
  { name: 'invalid', props: { 'aria-label': 'Notes', invalid: true } },
  { name: 'disabled', props: { 'aria-label': 'Notes', disabled: true } },
];

describe('TTextarea · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TTextarea, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
