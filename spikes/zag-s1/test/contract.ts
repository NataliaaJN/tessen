import { waitFor, within } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import type { Adapter, Kind } from './adapter.ts';

async function expectNoViolations(root: HTMLElement) {
  const result = await axe.run(root, { rules: { region: { enabled: false } } });
  expect(
    result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

/**
 * Behavior contract shared by every framework. It only talks to the DOM, so the exact same
 * assertions run against Vue and React: that is what criterion 1 (parity) measures.
 */
export function defineContract(adapter: Adapter) {
  const body = () => within(document.body);

  describe(`${adapter.name}: Dialog`, () => {
    it('starts closed with a correctly described trigger', () => {
      adapter.dialog();
      const trigger = body().getByRole('button', { name: 'Open' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(body().queryByRole('dialog')).toBeNull();
    });

    it('opens as a labelled, described, modal dialog and moves focus inside', async () => {
      const user = userEvent.setup();
      adapter.dialog({ description: 'This cannot be undone.' });
      await user.click(body().getByRole('button', { name: 'Open' }));
      const dialog = await body().findByRole('dialog', { name: 'Delete item' });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    });

    it('closes with Escape and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      adapter.dialog();
      const trigger = body().getByRole('button', { name: 'Open' });
      await user.click(trigger);
      await body().findByRole('dialog');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });

    it('closes with its close button', async () => {
      const user = userEvent.setup();
      adapter.dialog();
      await user.click(body().getByRole('button', { name: 'Open' }));
      await user.click(await body().findByRole('button', { name: 'Close' }));
      await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    });

    it('is controllable: reports the request and stays as the parent says', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      adapter.dialog({ open: false, onOpenChange });
      await user.click(body().getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
      expect(body().queryByRole('dialog')).toBeNull();
    });

    // The exit animation (content stays mounted until it ends) is NOT asserted here: jsdom has no
    // getAnimations(), so Zag's presence machine cannot tell whether an animation runs and the
    // outcome depends on frame timing. It was measured in Chromium instead (see RESULTS.md).
    it('unmounts at once when nothing animates', async () => {
      const user = userEvent.setup();
      adapter.dialog({ defaultOpen: true });
      await body().findByRole('dialog');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    });

    it('has no axe violations closed or open', async () => {
      const user = userEvent.setup();
      const handle = adapter.dialog({ description: 'This cannot be undone.' });
      await expectNoViolations(handle.container);
      await user.click(body().getByRole('button', { name: 'Open' }));
      await body().findByRole('dialog');
      await expectNoViolations(document.body);
    });
  });

  describe(`${adapter.name}: Tabs`, () => {
    const tab = (name: string) => body().getByRole('tab', { name });

    it('exposes tablist, tabs and one visible panel wired with ARIA', () => {
      adapter.tabs();
      expect(body().getByRole('tablist')).toBeInTheDocument();
      expect(body().getAllByRole('tab')).toHaveLength(3);
      expect(tab('Alpha')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Gamma')).toHaveAttribute('aria-selected', 'false');
      const panel = body().getByRole('tabpanel');
      expect(panel).toHaveAccessibleName('Alpha');
      expect(panel).toHaveTextContent('Alpha panel');
      expect(tab('Alpha')).toHaveAttribute('aria-controls', panel.id);
    });

    it('uses roving tabindex', () => {
      adapter.tabs();
      expect(tab('Alpha')).toHaveAttribute('tabindex', '0');
      expect(tab('Gamma')).toHaveAttribute('tabindex', '-1');
    });

    // jsdom limit: Zag selects the focused tab in a requestAnimationFrame that reads the focus
    // state, and that read never sees the new tab in jsdom. In Chromium, automatic activation
    // works in both frameworks (see RESULTS.md), so here only the focus movement is asserted.
    it('moves focus with arrows, skips disabled tabs, loops, and supports Home/End', async () => {
      const user = userEvent.setup();
      adapter.tabs();
      tab('Alpha').focus();
      const focused = () => document.activeElement?.textContent;
      await user.keyboard('{ArrowRight}');
      await waitFor(() => expect(focused()).toBe('Gamma'));
      await user.keyboard('{ArrowRight}');
      await waitFor(() => expect(focused()).toBe('Alpha'));
      await user.keyboard('{ArrowLeft}');
      await waitFor(() => expect(focused()).toBe('Gamma'));
      await user.keyboard('{Home}');
      await waitFor(() => expect(focused()).toBe('Alpha'));
      await user.keyboard('{End}');
      await waitFor(() => expect(focused()).toBe('Gamma'));
    });

    it('selects on click, not on a disabled tab, and shows only that panel', async () => {
      const user = userEvent.setup();
      adapter.tabs();
      await user.click(tab('Beta'));
      expect(tab('Alpha')).toHaveAttribute('aria-selected', 'true');
      await user.click(tab('Gamma'));
      await waitFor(() => expect(body().getByRole('tabpanel')).toHaveTextContent('Gamma panel'));
      expect(body().getAllByRole('tabpanel')).toHaveLength(1);
    });

    it('has no axe violations', async () => {
      const handle = adapter.tabs();
      await expectNoViolations(handle.container);
    });
  });

  describe(`${adapter.name}: Tooltip`, () => {
    it('shows a described tooltip on focus and hides it with Escape', async () => {
      const user = userEvent.setup();
      adapter.tooltip({ openDelay: 0 });
      const trigger = body().getByRole('button', { name: 'Save' });
      expect(body().queryByRole('tooltip')).toBeNull();
      await user.tab();
      expect(document.activeElement).toBe(trigger);
      const tooltip = await body().findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Save the file');
      expect(trigger).toHaveAccessibleDescription('Save the file');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(body().queryByRole('tooltip')).toBeNull());
    });

    it('shows on hover after the delay and hides on leave', async () => {
      const user = userEvent.setup();
      adapter.tooltip({ openDelay: 0 });
      const trigger = body().getByRole('button', { name: 'Save' });
      await user.hover(trigger);
      await body().findByRole('tooltip');
      await user.unhover(trigger);
      await waitFor(() => expect(body().queryByRole('tooltip')).toBeNull(), { timeout: 3000 });
    });

    it('has no axe violations while open', async () => {
      const user = userEvent.setup();
      adapter.tooltip({ openDelay: 0 });
      await user.tab();
      await body().findByRole('tooltip');
      await expectNoViolations(document.body);
    });
  });

  describe(`${adapter.name}: SSR hydration`, () => {
    const kinds: Kind[] = ['dialog', 'tabs', 'tooltip'];

    it.each(kinds)('%s hydrates without warnings and stays interactive', async (kind) => {
      const hydrated = await adapter.hydrate(kind);
      expect(hydrated.messages).toEqual([]);
      const user = userEvent.setup();
      if (kind === 'dialog') {
        await user.click(within(hydrated.container).getByRole('button', { name: 'Open' }));
        await body().findByRole('dialog');
      } else if (kind === 'tabs') {
        await user.click(within(hydrated.container).getByRole('tab', { name: 'Gamma' }));
        await waitFor(() =>
          expect(within(hydrated.container).getByRole('tabpanel')).toHaveTextContent('Gamma panel'),
        );
      } else {
        await user.tab();
        await body().findByRole('tooltip');
      }
    });
  });
}
