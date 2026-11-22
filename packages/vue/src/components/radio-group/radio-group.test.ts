import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { radioGroupContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { h } from 'vue';
import { TRadio, TRadioGroup } from './index.js';

/** Fixture of the contract: RadioGroup "Plan" > Radio Free (free), Pro (pro), Team (team). */
function mountFixture(props: Record<string, unknown>, emitted: (string | boolean)[] = []) {
  return mount(TRadioGroup, {
    props: {
      'aria-label': 'Plan',
      ...props,
      'onUpdate:modelValue': (value?: string) => {
        if (value !== undefined) emitted.push(value);
      },
    },
    slots: {
      default: () => [
        h(TRadio, { value: 'free' }, () => 'Free'),
        h(TRadio, { value: 'pro' }, () => 'Pro'),
        h(TRadio, { value: 'team' }, () => 'Team'),
      ],
    },
    attachTo: document.body,
  });
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const wrapper = mountFixture({ ...neutral.extra, class: neutral.class }, emitted);
    return {
      root: wrapper.element as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(radioGroupContract, vueAdapter);

describe('TRadioGroup · axe', () => {
  it.each([
    ['default', {}],
    ['with a selection', { defaultValue: 'pro' }],
    ['horizontal invalid', { orientation: 'horizontal', invalid: true }],
    ['disabled', { disabled: true }],
  ])('%s has no violations', async (_name, props) => {
    const wrapper = mountFixture(props);
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
