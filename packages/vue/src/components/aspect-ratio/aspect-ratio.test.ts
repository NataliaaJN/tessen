import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { aspectRatioContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TAspectRatio from './AspectRatio.vue';

runContract(aspectRatioContract, vueAdapter('Vue (VTU)', TAspectRatio, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'square', props: { ratio: '1/1' }, slot: 'x' },
];

describe('TAspectRatio · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TAspectRatio, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
