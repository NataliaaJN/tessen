import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { skeletonContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TSkeleton from './Skeleton.vue';

runContract(skeletonContract, vueAdapter('Vue (VTU)', TSkeleton, { labelAs: 'none' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: {} },
  { name: 'circle static', props: { shape: 'circle', animated: false } },
];

describe('TSkeleton · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TSkeleton, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
