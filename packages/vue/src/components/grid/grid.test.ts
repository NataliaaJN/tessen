import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { gridContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TGrid from './Grid.vue';

runContract(gridContract, vueAdapter('Vue (VTU)', TGrid, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'auto', props: { columns: 'auto' }, slot: 'x' },
];

describe('TGrid · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TGrid, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
