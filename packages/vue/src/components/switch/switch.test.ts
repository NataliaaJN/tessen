import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { switchContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TSwitch from './Switch.vue';

runContract(
  switchContract,
  vueAdapter('Vue (VTU)', TSwitch, { valueEvent: 'onUpdate:modelValue' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'off', slot: 'Wi-Fi' },
  { name: 'on', props: { defaultChecked: true }, slot: 'Wi-Fi' },
  { name: 'disabled', props: { disabled: true }, slot: 'Wi-Fi' },
];

describe('TSwitch · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TSwitch, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
