import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { comboboxContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Combobox } from './Combobox.tsx';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

runContract(
  comboboxContract,
  reactAdapter('React (RTL)', Combobox, {
    labelAs: 'none',
    valueEvent: 'onValueChange',
    props: { items, label: 'Fruit' },
  }),
);

describe('Combobox · behaviour and axe', () => {
  it('keeps every option available after one was chosen', async () => {
    const { unmount } = render(<Combobox items={items} label="Fruit" defaultValue="cherry" />);
    await userEvent.setup().click(document.body.querySelector('.t-combobox__trigger')!);
    await expect
      .poll(() => document.body.querySelectorAll('[role="option"]').length)
      .toBe(items.length);
    unmount();
  });

  it('has no violations closed or open', async () => {
    const { unmount } = render(<Combobox items={items} label="Fruit" />);
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-combobox__trigger')!);
    await expect
      .poll(() => document.body.querySelector('[role="listbox"]:not([hidden])'))
      .not.toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
