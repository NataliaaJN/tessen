import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { visuallyHiddenContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TVisuallyHidden from './VisuallyHidden.vue';

runContract(visuallyHiddenContract, vueAdapter('Vue (VTU)', TVisuallyHidden, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'Hidden text' },
  { name: 'focusable', props: { focusable: true }, slot: 'Skip' },
];

describe('TVisuallyHidden · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TVisuallyHidden, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
