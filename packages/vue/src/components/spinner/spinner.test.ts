import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { spinnerContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TSpinner from './Spinner.vue';

runContract(spinnerContract, vueAdapter('Vue (VTU)', TSpinner, { labelAs: 'prop' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: {} },
  { name: 'custom label', props: { label: 'Saving', size: 'lg' } },
];

describe('TSpinner · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TSpinner, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
