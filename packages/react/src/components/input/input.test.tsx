import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { inputContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Input } from './Input.tsx';

runContract(
  inputContract,
  reactAdapter('React (RTL)', Input, {
    labelAs: 'none',
    valueEvent: 'onValueChange',
    leadingAs: 'leading',
    trailingAs: 'trailing',
  }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: { 'aria-label': 'Name' } },
  {
    name: 'email with placeholder',
    props: { 'aria-label': 'Mail', type: 'email', placeholder: 'you@example.com' },
  },
  { name: 'invalid', props: { 'aria-label': 'Name', invalid: true } },
  { name: 'disabled', props: { 'aria-label': 'Name', disabled: true } },
];

describe('Input · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Input as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
