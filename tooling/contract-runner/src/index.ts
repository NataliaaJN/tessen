/**
 * Contract runner shared by the framework packages. It never imports Vue or React: an adapter
 * mounts the component with the neutral props of a case and the runner executes the case's
 * steps and expectations. Used from tests only (ADR 0009).
 */
import type { Contract, ElementExpectation, NeutralProps, Step } from '@tessen-ui/core';
import { getByRole } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

export interface Mounted {
  /** Root element of the component (the `<button>`, the `<input>`, the wrapper...). */
  root: HTMLElement;
  /** Times the consumer's click handler ran. */
  clicks(): number;
  /** Values reported through the value-change event (`onValueChange`, `update:modelValue`...). */
  emitted?(): (string | boolean)[];
  unmount(): void;
}

export interface Adapter {
  name: string;
  mount(props: NeutralProps): Mounted;
}

const KEYS: Record<string, string> = { Enter: '{Enter}', Space: ' ', Tab: '{Tab}' };
const keyToken = (key: string) => KEYS[key] ?? `{${key}}`;

function find(root: HTMLElement, selector: string | undefined): HTMLElement {
  if (!selector) return root;
  const el = document.body.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`No element matches "${selector}"`);
  return el;
}

function check(selector: string, el: Element | null, want: ElementExpectation) {
  if (want.present === false) return expect(el, `${selector} absent`).toBeNull();
  expect(el, `${selector} present`).not.toBeNull();
  if (!el) return;
  for (const [name, value] of Object.entries(want.attrs ?? {})) {
    if (value === null) expect(el.hasAttribute(name), `${selector} ${name} absent`).toBe(false);
    else expect(el.getAttribute(name), `${selector} ${name}`).toBe(value);
  }
  if (want.text !== undefined) expect(el.textContent?.trim(), `${selector} text`).toBe(want.text);
  if (want.focused !== undefined)
    expect(document.activeElement === el, `${selector} focused`).toBe(want.focused);
  if (want.role) expect(el.getAttribute('role'), `${selector} role`).toBe(want.role);
}

export function runContract(contract: Contract, adapter: Adapter) {
  describe(`${contract.name} contract · ${adapter.name}`, () => {
    for (const testCase of contract.cases) {
      it(`${testCase.id}: ${testCase.describe}`, async () => {
        const user = userEvent.setup();
        const mounted = adapter.mount(testCase.props ?? {});
        try {
          const run = async (step: Step) => {
            const el = find(mounted.root, 'target' in step ? step.target : undefined);
            if (step.do === 'click') await user.click(el);
            else if (step.do === 'hover') await user.hover(el);
            else if (step.do === 'unhover') await user.unhover(el);
            else if (step.do === 'focus') el.focus();
            else if (step.do === 'type') {
              el.focus();
              await user.keyboard(step.text);
            } else {
              if (step.target) el.focus();
              await user.keyboard(keyToken(step.key));
            }
          };
          for (const step of testCase.steps ?? []) await run(step);
          const want = testCase.expect;
          if (want.role) {
            const found = getByRole(document.body, want.role, want.name ? { name: want.name } : {});
            expect(found).toBe(mounted.root);
          } else if (want.name) {
            expect(mounted.root.getAttribute('aria-label')).toBe(want.name);
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
          if (want.tag) expect(mounted.root.tagName.toLowerCase()).toBe(want.tag);
          if (want.text !== undefined) expect(mounted.root.textContent?.trim()).toBe(want.text);
          for (const [selector, el] of Object.entries(want.within ?? {}))
            check(selector, document.body.querySelector(selector), el);
          if (want.clicks !== undefined) expect(mounted.clicks()).toBe(want.clicks);
          if (want.emitted !== undefined) expect(mounted.emitted?.() ?? []).toEqual(want.emitted);
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
