import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { aspectRatioContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { AspectRatio } from './AspectRatio.tsx';

runContract(aspectRatioContract, reactAdapter('React (RTL)', AspectRatio, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'x' },
  { name: 'square', props: { ratio: '1/1' }, slot: 'x' },
];

describe('AspectRatio · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(AspectRatio as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
