import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { skeletonContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Skeleton } from './Skeleton.tsx';

runContract(skeletonContract, reactAdapter('React (RTL)', Skeleton, { labelAs: 'none' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: {} },
  { name: 'circle static', props: { shape: 'circle', animated: false } },
];

describe('Skeleton · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Skeleton as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
