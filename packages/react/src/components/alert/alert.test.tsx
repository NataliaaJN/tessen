import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { alertContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Alert } from './Alert.tsx';

runContract(alertContract, reactAdapter('React (RTL)', Alert, { leadingAs: 'icon' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'info', slot: 'Saved in drafts' },
  { name: 'danger with title', props: { tone: 'danger', title: 'Error' }, slot: 'Could not save' },
  { name: 'success', props: { tone: 'success' }, slot: 'Saved' },
];

describe('Alert · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Alert as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
