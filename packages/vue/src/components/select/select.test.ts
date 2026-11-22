import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { selectContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TSelect from './Select.vue';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

runContract(
  selectContract,
  vueAdapter('Vue (VTU)', TSelect, {
    labelAs: 'none',
    valueEvent: 'onUpdate:modelValue',
    rename: { value: 'modelValue' },
    props: { items, label: 'Fruit', placeholder: 'Pick a fruit' },
  }),
);

describe('TSelect · axe', () => {
  it('has no violations closed or open', async () => {
    const wrapper = mount(TSelect, { props: { items, label: 'Fruit' }, attachTo: document.body });
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-select__trigger')!);
    await expect
      .poll(() => document.body.querySelector('[role="listbox"]:not([hidden])'))
      .not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
