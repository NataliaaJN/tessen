import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { textareaContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Textarea } from './Textarea.tsx';

runContract(
  textareaContract,
  reactAdapter('React (RTL)', Textarea, { labelAs: 'none', valueEvent: 'onValueChange' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: { 'aria-label': 'Notes' } },
  { name: 'invalid', props: { 'aria-label': 'Notes', invalid: true } },
  { name: 'disabled', props: { 'aria-label': 'Notes', disabled: true } },
];

describe('Textarea · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Textarea as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
