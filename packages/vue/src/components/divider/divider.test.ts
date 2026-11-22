import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { dividerContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TDivider from './Divider.vue';

runContract(dividerContract, vueAdapter('Vue (VTU)', TDivider, { labelAs: 'none' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'horizontal', props: {} },
  { name: 'vertical', props: { orientation: 'vertical' } },
  { name: 'decorative', props: { decorative: true } },
];

describe('TDivider · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TDivider, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
