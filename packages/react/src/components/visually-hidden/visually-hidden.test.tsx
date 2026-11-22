import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { visuallyHiddenContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { VisuallyHidden } from './VisuallyHidden.tsx';

runContract(visuallyHiddenContract, reactAdapter('React (RTL)', VisuallyHidden, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', slot: 'Hidden text' },
  { name: 'focusable', props: { focusable: true }, slot: 'Skip' },
];

describe('VisuallyHidden · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(
        VisuallyHidden as unknown as ComponentType<Record<string, unknown>>,
        props,
        slot,
      ),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
