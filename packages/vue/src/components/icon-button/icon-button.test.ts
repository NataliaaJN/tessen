import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { iconButtonContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TIconButton from './IconButton.vue';

runContract(
  iconButtonContract,
  vueAdapter('Vue (VTU)', TIconButton, { labelAs: 'prop', leadingAs: 'default' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: { label: 'Close' } },
  { name: 'primary danger', props: { label: 'Delete', variant: 'primary', tone: 'danger' } },
  { name: 'disabled', props: { label: 'Close', disabled: true } },
];

describe('TIconButton · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TIconButton, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
