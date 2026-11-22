import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { comboboxContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TCombobox from './Combobox.vue';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

runContract(
  comboboxContract,
  vueAdapter('Vue (VTU)', TCombobox, {
    labelAs: 'none',
    valueEvent: 'onUpdate:modelValue',
    rename: { value: 'modelValue' },
    props: { items, label: 'Fruit' },
  }),
);

describe('TCombobox · behaviour and axe', () => {
  it('keeps every option available after one was chosen', async () => {
    const wrapper = mount(TCombobox, {
      props: { items, label: 'Fruit', defaultValue: 'cherry' },
      attachTo: document.body,
    });
    await userEvent.setup().click(document.body.querySelector('.t-combobox__trigger')!);
    await expect
      .poll(() => document.body.querySelectorAll('[role="option"]').length)
      .toBe(items.length);
    wrapper.unmount();
  });

  it('has no violations closed or open', async () => {
    const wrapper = mount(TCombobox, {
      props: { items, label: 'Fruit' },
      attachTo: document.body,
    });
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-combobox__trigger')!);
    await expect
      .poll(() => document.body.querySelector('[role="listbox"]:not([hidden])'))
      .not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
