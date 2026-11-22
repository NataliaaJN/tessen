import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { linkContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Link } from './Link.tsx';

runContract(linkContract, reactAdapter('React (RTL)', Link, {}));

const states: { name: string; props?: Record<string, unknown>; slot?: string }[] = [
  { name: 'inline', props: { href: '/docs' }, slot: 'Docs' },
  { name: 'standalone', props: { href: '/docs', variant: 'standalone' }, slot: 'Docs' },
  { name: 'external', props: { href: 'https://example.com', external: true }, slot: 'Docs' },
];

describe('Link · axe', () => {
  it.each(states)('$name has no violations', async ({ props, slot }) => {
    const { container, unmount } = render(
      createElement(Link as unknown as ComponentType<Record<string, unknown>>, props, slot),
    );
    await expectNoA11yViolations(container);
    unmount();
  });
});
