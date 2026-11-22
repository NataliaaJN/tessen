import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { badgeContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Badge } from './Badge.tsx';

runContract(badgeContract, reactAdapter('React (RTL)', Badge, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'New' },
  { name: 'solid danger', props: { variant: 'solid', tone: 'danger' }, slot: 'Failed' },
];

describe('Badge · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Badge as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
