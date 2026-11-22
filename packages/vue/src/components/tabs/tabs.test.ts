import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { tabsContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { h } from 'vue';
import { TTab, TTabList, TTabPanel, TTabs } from './index.js';

/** Fixture of the contract: Tabs > TabList "Letters" > Alpha, Beta (disabled), Gamma + panels. */
function mountFixture(props: Record<string, unknown>, emitted: (string | boolean)[] = []) {
  return mount(TTabs, {
    props: {
      ...props,
      'onUpdate:modelValue': (value?: string) => {
        if (value !== undefined) emitted.push(value);
      },
    } as never,
    slots: {
      default: () => [
        h(TTabList, { 'aria-label': 'Letters' }, () => [
          h(TTab, { value: 'alpha' }, () => 'Alpha'),
          h(TTab, { value: 'beta', disabled: true }, () => 'Beta'),
          h(TTab, { value: 'gamma' }, () => 'Gamma'),
        ]),
        h(TTabPanel, { value: 'alpha' }, () => 'Alpha panel'),
        h(TTabPanel, { value: 'beta' }, () => 'Beta panel'),
        h(TTabPanel, { value: 'gamma' }, () => 'Gamma panel'),
      ],
    },
    attachTo: document.body,
  });
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const wrapper = mountFixture(
      { ...neutral.extra, variant: neutral.variant, class: neutral.class },
      emitted,
    );
    return {
      root: wrapper.element as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(tabsContract, vueAdapter);

describe('TTabs · axe', () => {
  it.each([
    ['default', {}],
    ['vertical pill', { orientation: 'vertical', variant: 'pill' }],
    ['manual activation', { activationMode: 'manual', defaultValue: 'gamma' }],
  ])('%s has no violations', async (_name, props) => {
    const wrapper = mountFixture(props);
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
