import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { stackContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Stack } from './Stack.tsx';

runContract(stackContract, reactAdapter('React (RTL)', Stack, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'horizontal', props: { direction: 'horizontal', wrap: true }, slot: 'x' },
];

describe('Stack · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Stack as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
