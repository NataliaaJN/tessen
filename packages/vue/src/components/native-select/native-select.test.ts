import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { nativeSelectContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { h } from 'vue';
import TNativeSelect from './NativeSelect.vue';

/** Fixture of the contract: NativeSelect "Country" with Spain (es), France (fr), Italy (it). */
function mountFixture(props: Record<string, unknown>, emitted: (string | boolean)[] = []) {
  return mount(TNativeSelect, {
    props: {
      'aria-label': 'Country',
      ...props,
      'onUpdate:modelValue': (value: string) => emitted.push(value),
    } as never,
    slots: {
      default: () => [
        h('option', { value: 'es' }, 'Spain'),
        h('option', { value: 'fr' }, 'France'),
        h('option', { value: 'it' }, 'Italy'),
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
      { ...neutral.extra, size: neutral.size, class: neutral.class },
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

runContract(nativeSelectContract, vueAdapter);

describe('TNativeSelect · axe', () => {
  it.each([
    ['default', {}],
    ['invalid', { invalid: true }],
    ['disabled', { disabled: true }],
  ])('%s has no violations', async (_name, props) => {
    const wrapper = mountFixture(props);
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
