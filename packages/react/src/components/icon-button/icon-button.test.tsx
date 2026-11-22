import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { iconButtonContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { IconButton } from './IconButton.tsx';

runContract(
  iconButtonContract,
  reactAdapter('React (RTL)', IconButton, { labelAs: 'prop', leadingAs: 'children' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: { label: 'Close' } },
  { name: 'primary danger', props: { label: 'Delete', variant: 'primary', tone: 'danger' } },
  { name: 'disabled', props: { label: 'Close', disabled: true } },
];

describe('IconButton · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(IconButton as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
