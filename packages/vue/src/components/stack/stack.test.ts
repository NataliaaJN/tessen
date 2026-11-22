import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { stackContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TStack from './Stack.vue';

runContract(stackContract, vueAdapter('Vue (VTU)', TStack, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'horizontal', props: { direction: 'horizontal', wrap: true }, slot: 'x' },
];

describe('TStack · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TStack, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
