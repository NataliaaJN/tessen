import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { checkboxContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Checkbox } from './Checkbox.tsx';

runContract(
  checkboxContract,
  reactAdapter('React (RTL)', Checkbox, { valueEvent: 'onCheckedChange' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'Accept' },
  { name: 'checked', props: { defaultChecked: true }, slot: 'Accept' },
  { name: 'indeterminate', props: { indeterminate: true }, slot: 'All' },
  { name: 'invalid', props: { invalid: true }, slot: 'Accept' },
  { name: 'disabled', props: { disabled: true }, slot: 'Accept' },
];

describe('Checkbox · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Checkbox as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
