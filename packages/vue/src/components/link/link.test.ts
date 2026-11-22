import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { linkContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TLink from './Link.vue';

runContract(linkContract, vueAdapter('Vue (VTU)', TLink, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'inline', props: { href: '/docs' }, slot: 'Docs' },
  { name: 'standalone', props: { href: '/docs', variant: 'standalone' }, slot: 'Docs' },
  { name: 'external', props: { href: 'https://example.com', external: true }, slot: 'Docs' },
];

describe('TLink · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const wrapper = mount(TLink, {
      props: props as never,
      slots: slot ? { default: slot } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
