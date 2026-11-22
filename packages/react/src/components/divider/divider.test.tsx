import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { dividerContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Divider } from './Divider.tsx';

runContract(dividerContract, reactAdapter('React (RTL)', Divider, { labelAs: 'none' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'horizontal', props: {} },
  { name: 'vertical', props: { orientation: 'vertical' } },
  { name: 'decorative', props: { decorative: true } },
];

describe('Divider · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Divider as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
