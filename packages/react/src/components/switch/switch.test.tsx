import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { switchContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Switch } from './Switch.tsx';

runContract(switchContract, reactAdapter('React (RTL)', Switch, { valueEvent: 'onCheckedChange' }));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'off', slot: 'Wi-Fi' },
  { name: 'on', props: { defaultChecked: true }, slot: 'Wi-Fi' },
  { name: 'disabled', props: { disabled: true }, slot: 'Wi-Fi' },
];

describe('Switch · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Switch as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
