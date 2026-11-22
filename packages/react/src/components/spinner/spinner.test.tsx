import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { spinnerContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Spinner } from './Spinner.tsx';

runContract(spinnerContract, reactAdapter('React (RTL)', Spinner, { labelAs: 'prop' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'default', props: {} },
  { name: 'custom label', props: { label: 'Saving', size: 'lg' } },
];

describe('Spinner · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Spinner as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
