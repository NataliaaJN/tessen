import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { alertContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TAlert from './Alert.vue';

runContract(alertContract, vueAdapter('Vue (VTU)', TAlert, { leadingAs: 'icon' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'info', slot: 'Saved in drafts' },
  { name: 'danger with title', props: { tone: 'danger', title: 'Error' }, slot: 'Could not save' },
  { name: 'success', props: { tone: 'success' }, slot: 'Saved' },
];

describe('TAlert · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TAlert, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
