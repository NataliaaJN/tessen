import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { cardContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TCard from './Card.vue';

runContract(
  cardContract,
  vueAdapter('Vue (VTU)', TCard, { leadingAs: 'header', trailingAs: 'footer' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'Content' },
  { name: 'elevated', props: { variant: 'elevated', padding: 'lg' }, slot: 'Content' },
];

describe('TCard · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TCard, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
