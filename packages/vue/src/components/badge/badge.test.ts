import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { badgeContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TBadge from './Badge.vue';

runContract(badgeContract, vueAdapter('Vue (VTU)', TBadge, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'New' },
  { name: 'solid danger', props: { variant: 'solid', tone: 'danger' }, slot: 'Failed' },
];

describe('TBadge · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TBadge, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
