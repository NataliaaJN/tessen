import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { selectContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Select } from './Select.tsx';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

runContract(
  selectContract,
  reactAdapter('React (RTL)', Select, {
    labelAs: 'none',
    valueEvent: 'onValueChange',
    props: { items, label: 'Fruit', placeholder: 'Pick a fruit' },
  }),
);

describe('Select · axe', () => {
  it('has no violations closed or open', async () => {
    const { unmount } = render(<Select items={items} label="Fruit" />);
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-select__trigger')!);
    await expect
      .poll(() => document.body.querySelector('[role="listbox"]:not([hidden])'))
      .not.toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
