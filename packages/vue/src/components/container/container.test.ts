import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { containerContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TContainer from './Container.vue';

runContract(containerContract, vueAdapter('Vue (VTU)', TContainer, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'full', props: { size: 'full', gutters: false }, slot: 'x' },
];

describe('TContainer · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TContainer, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
