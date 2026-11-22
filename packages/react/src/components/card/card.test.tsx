import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { cardContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Card } from './Card.tsx';

runContract(
  cardContract,
  reactAdapter('React (RTL)', Card, { leadingAs: 'header', trailingAs: 'footer' }),
);

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'Content' },
  { name: 'elevated', props: { variant: 'elevated', padding: 'lg' }, slot: 'Content' },
];

describe('Card · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Card as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
