import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { gridContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Grid } from './Grid.tsx';

runContract(gridContract, reactAdapter('React (RTL)', Grid, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'auto', props: { columns: 'auto' }, slot: 'x' },
];

describe('Grid · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Grid as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
