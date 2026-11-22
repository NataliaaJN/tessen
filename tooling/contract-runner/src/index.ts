/**
 * Contract runner shared by the framework packages. It never imports Vue or React: an adapter
 * mounts the component with the neutral props of a case and the runner executes the case's
 * steps and expectations. Used from tests only (ADR 0009).
 */
import type { Contract, NeutralProps } from '@tessen-ui/core';
import { getByRole } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

export interface Mounted {
  /** Root element of the component (the `<button>`). */
  root: HTMLElement;
  /** Times the consumer's click handler ran. */
  clicks(): number;
  unmount(): void;
}

export interface Adapter {
  name: string;
  mount(props: NeutralProps): Mounted;
}

export function runContract(contract: Contract, adapter: Adapter) {
  describe(`${contract.name} contract · ${adapter.name}`, () => {
    for (const testCase of contract.cases) {
      it(`${testCase.id}: ${testCase.describe}`, async () => {
        const user = userEvent.setup();
        const mounted = adapter.mount(testCase.props ?? {});
        try {
          for (const step of testCase.steps ?? []) {
            if (step.do === 'click') await user.click(mounted.root);
            else if (step.do === 'focus') mounted.root.focus();
            else await user.keyboard(step.key === 'Enter' ? '{Enter}' : ' ');
          }
          const want = testCase.expect;
          if (want.role) {
            const found = getByRole(document.body, want.role, want.name ? { name: want.name } : {});
            expect(found).toBe(mounted.root);
          }
          for (const [name, value] of Object.entries(want.attrs ?? {})) {
            if (value === null)
              expect(mounted.root.hasAttribute(name), `${name} absent`).toBe(false);
            else expect(mounted.root.getAttribute(name), name).toBe(value);
          }
          for (const cls of want.classes ?? [])
            expect(mounted.root.classList.contains(cls), cls).toBe(true);
          for (const [selector, present] of Object.entries(want.parts ?? {})) {
            expect(mounted.root.querySelector(selector) !== null, selector).toBe(present);
          }
          if (want.clicks !== undefined) expect(mounted.clicks()).toBe(want.clicks);
          if (want.focused !== undefined)
            expect(document.activeElement === mounted.root).toBe(want.focused);
        } finally {
          mounted.unmount();
        }
      });
    }
  });
}

/**
 * Runs axe on `root`. jsdom has no layout, so the rules that need rendering (colour contrast,
 * visibility of regions) are off here; contrast is checked by `tokens:check` and visually.
 */
export async function expectNoA11yViolations(root: Element): Promise<void> {
  const result = await axe.run(root, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  const summary = result.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.html).join(' | ')})`,
  );
  expect(summary).toEqual([]);
}
