import { waitFor, within } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import type { Adapter, Kind } from './adapter.ts';

async function expectNoViolations(root: HTMLElement = document.body) {
  const result = await axe.run(root, {
    rules: { region: { enabled: false }, 'color-contrast': { enabled: false } },
  });
  expect(
    result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

/**
 * Focus restoration, outside-click dismissal and some pointer/selection flows behave differently
 * from run to run in jsdom (no layout, no real focus). Those cases run only in a real browser:
 * `pnpm test:browser`. Everything else (ARIA, structure, hydration) runs in both.
 */
const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
const real = isJsdom ? it.skip : it;

const body = () => within(document.body);
const closed = (role: string) => waitFor(() => expect(body().queryByRole(role)).toBeNull());

/**
 * Behavior contract shared by every framework. It talks to the DOM only, so the same assertions
 * run against Vue and React: that is what "same observable behavior" means here.
 */
export function defineContract(adapter: Adapter) {
  // ------------------------------------------------------------------ Select
  describe(`${adapter.name}: Select`, () => {
    const trigger = () => body().getByRole('combobox', { name: /Fruit/ });

    it('is a labelled select-only combobox, closed by default', () => {
      adapter.mount('select');
      expect(trigger()).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(body().queryByRole('listbox')).toBeNull();
    });

    it('opens by click, exposes options with disabled state, and moves focus to the list', async () => {
      const user = userEvent.setup();
      adapter.mount('select');
      await user.click(trigger());
      const list = await body().findByRole('listbox');
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      const options = within(list).getAllByRole('option');
      expect(options.map((o) => o.textContent?.replace('✓', ''))).toEqual([
        'Apple',
        'Banana',
        'Cherry',
        'Date',
        'Elderberry',
      ]);
      expect(within(list).getByRole('option', { name: /Banana/ })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    real(
      'navigates with arrows (skipping disabled), selects with Enter, and returns focus',
      async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        adapter.mount('select', { onValueChange });
        trigger().focus();
        // The first ArrowDown opens the list and highlights Apple; the next skips disabled Banana.
        await user.keyboard('{ArrowDown}');
        await body().findByRole('listbox');
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{Enter}');
        await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('cherry'));
        await closed('listbox');
        await waitFor(() => expect(trigger()).toHaveTextContent('Cherry'));
        await waitFor(() => expect(document.activeElement).toBe(trigger()));
      },
    );

    real(
      'supports Home, End and typeahead on the open list, skipping disabled options',
      async () => {
        const user = userEvent.setup();
        adapter.mount('select');
        await user.click(trigger());
        await body().findByRole('listbox');
        const active = () =>
          document
            .getElementById(
              within(document.body).getByRole('listbox').getAttribute('aria-activedescendant') ??
                '',
            )
            ?.textContent?.replace('✓', '');
        await user.keyboard('{End}');
        await waitFor(() => expect(active()).toBe('Elderberry'));
        await user.keyboard('{Home}');
        await waitFor(() => expect(active()).toBe('Apple'));
        await user.keyboard('d');
        await waitFor(() => expect(active()).toBe('Date'));
        await user.keyboard('b'); // Banana is disabled: typeahead must not land on it
        await waitFor(() => expect(active()).not.toBe('Banana'));
      },
    );

    real('closes with Escape and returns focus without changing the value', async () => {
      const user = userEvent.setup();
      adapter.mount('select', { defaultValue: 'apple' });
      await user.click(trigger());
      await body().findByRole('listbox');
      await user.keyboard('{Escape}');
      await closed('listbox');
      expect(trigger()).toHaveTextContent('Apple');
      await waitFor(() => expect(document.activeElement).toBe(trigger()));
    });

    it('does not select a disabled option', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('select', { onValueChange });
      await user.click(trigger());
      await user.click(await body().findByRole('option', { name: /Banana/ }));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(body().queryByRole('listbox')).not.toBeNull();
    });

    real(
      'is controlled when value is given: reports the choice, shows what the parent says',
      async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        adapter.mount('select', { value: 'apple', onValueChange });
        expect(trigger()).toHaveTextContent('Apple');
        await user.click(trigger());
        await user.click(await body().findByRole('option', { name: /Date/ }));
        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('date'));
        expect(trigger()).toHaveTextContent('Apple');
      },
    );

    it('is uncontrolled with defaultValue and a disabled select does not open', async () => {
      const user = userEvent.setup();
      adapter.mount('select', { defaultValue: 'elderberry', disabled: true });
      expect(trigger()).toHaveTextContent('Elderberry');
      await user.click(trigger());
      expect(body().queryByRole('listbox')).toBeNull();
    });

    it('renders its list in document.body, outside the component container', async () => {
      const user = userEvent.setup();
      const handle = adapter.mount('select');
      await user.click(trigger());
      const list = await body().findByRole('listbox');
      expect(handle.container.contains(list)).toBe(false);
      expect(document.body.contains(list)).toBe(true);
    });

    it('has no axe violations closed or open', async () => {
      const user = userEvent.setup();
      adapter.mount('select');
      await expectNoViolations();
      await user.click(trigger());
      await body().findByRole('listbox');
      await expectNoViolations();
    });
  });

  // ---------------------------------------------------------------- Combobox
  describe(`${adapter.name}: Combobox`, () => {
    const input = () => body().getByRole('combobox', { name: /Fruit/ });
    const optionNames = () =>
      body()
        .queryAllByRole('option')
        .map((o) => o.textContent);

    it('is a labelled editable combobox with list autocomplete, closed by default', () => {
      adapter.mount('combobox');
      expect(input().tagName).toBe('INPUT');
      expect(input()).toHaveAttribute('aria-autocomplete', 'list');
      expect(input()).toHaveAttribute('aria-expanded', 'false');
      expect(input()).toHaveAttribute('aria-controls');
    });

    it('opens while typing and filters the options', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox');
      await user.click(input());
      await user.type(input(), 'rr');
      await waitFor(() => expect(optionNames()).toEqual(['Cherry', 'Elderberry']));
      expect(input()).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows a no-results message when nothing matches', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox');
      await user.type(input(), 'zzz');
      await waitFor(() => expect(body().getByText('No results')).toBeInTheDocument());
    });

    // With the list open Zag highlights the first/last option (and keeps focus on the input);
    // with it closed Home/End move the caret as in any text field.
    it('uses Home and End to highlight the first and last option while open', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox');
      await user.type(input(), 'e');
      await body().findByRole('listbox');
      const active = () =>
        document.getElementById(input().getAttribute('aria-activedescendant') ?? '')?.textContent;
      await user.keyboard('{End}');
      await waitFor(() => expect(active()).toBe('Elderberry'));
      await user.keyboard('{Home}');
      await waitFor(() => expect(active()).toBe('Apple'));
      expect(document.activeElement).toBe(input());
    });

    real('navigates with arrows (skipping disabled) and selects with Enter', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('combobox', { onValueChange });
      await user.click(input());
      await user.keyboard('{ArrowDown}');
      await body().findByRole('listbox');
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(input().getAttribute('aria-activedescendant')).toBeTruthy());
      await user.keyboard('{Enter}');
      await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('cherry'));
      expect(input()).toHaveValue('Cherry');
      await closed('listbox');
    });

    it('keeps focus on the input while navigating (aria-activedescendant pattern)', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox');
      await user.click(input());
      await user.keyboard('{ArrowDown}');
      await body().findByRole('listbox');
      expect(document.activeElement).toBe(input());
    });

    it('closes with Escape and clears on a second Escape', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox');
      await user.type(input(), 'ch');
      await body().findByRole('listbox');
      await user.keyboard('{Escape}');
      await closed('listbox');
      expect(input()).toHaveValue('ch');
    });

    it('does not select a disabled option', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('combobox', { onValueChange });
      await user.type(input(), 'ban');
      await user.click(await body().findByRole('option', { name: 'Banana' }));
      expect(onValueChange).not.toHaveBeenCalled();
    });

    real('is controlled when value is given and uncontrolled with defaultValue', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('combobox', { value: 'apple', onValueChange });
      await waitFor(() => expect(input()).toHaveValue('Apple'));
      await user.click(input());
      await user.clear(input());
      // Pasted, not typed key by key: with a selected value, user-event's synthetic typing loses
      // keys in React (not with real key events, see S2 doc, "Findings"). Typing is covered by
      // the uncontrolled tests above.
      await user.paste('dat');
      await user.click(await body().findByRole('option', { name: 'Date' }));
      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('date'));
    });

    it('does nothing when disabled', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox', { disabled: true });
      expect(input()).toBeDisabled();
      await user.click(input());
      expect(body().queryByRole('listbox')).toBeNull();
    });

    it('has no axe violations closed or open', async () => {
      const user = userEvent.setup();
      adapter.mount('combobox');
      await expectNoViolations();
      await user.type(input(), 'e');
      await body().findByRole('listbox');
      await expectNoViolations();
    });
  });

  // -------------------------------------------------------------------- Menu
  describe(`${adapter.name}: Menu`, () => {
    const trigger = () => body().getByRole('button', { name: 'Open' });

    it('has a trigger with menu semantics, closed by default', () => {
      adapter.mount('menu');
      expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(body().queryByRole('menu')).toBeNull();
    });

    it('opens with click and exposes menu items with disabled state', async () => {
      const user = userEvent.setup();
      adapter.mount('menu');
      await user.click(trigger());
      const menu = await body().findByRole('menu');
      expect(
        within(menu)
          .getAllByRole('menuitem')
          .map((i) => i.textContent),
      ).toEqual(['Edit', 'Duplicate', 'Delete']);
      expect(within(menu).getByRole('menuitem', { name: 'Duplicate' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('opens with ArrowDown, focuses the first item, skips disabled, selects with Enter', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      adapter.mount('menu', { onSelect });
      trigger().focus();
      await user.keyboard('{ArrowDown}');
      await body().findByRole('menu');
      await waitFor(() => expect(document.activeElement).toHaveTextContent('Edit'));
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toHaveTextContent('Delete'));
      await user.keyboard('{Enter}');
      await waitFor(() => expect(onSelect).toHaveBeenCalledWith('delete'));
      await closed('menu');
    });

    real('supports Home and End, skipping disabled items', async () => {
      const user = userEvent.setup();
      adapter.mount('menu');
      await user.click(trigger());
      await body().findByRole('menu');
      await user.keyboard('{End}');
      await waitFor(() => expect(document.activeElement).toHaveTextContent('Delete'));
      await user.keyboard('{Home}');
      await waitFor(() => expect(document.activeElement).toHaveTextContent('Edit'));
    });

    it('closes with Escape and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      adapter.mount('menu');
      await user.click(trigger());
      await body().findByRole('menu');
      await user.keyboard('{Escape}');
      await closed('menu');
      await waitFor(() => expect(document.activeElement).toBe(trigger()));
    });

    real('closes when interacting outside', async () => {
      const user = userEvent.setup();
      adapter.mount('menu');
      await user.click(trigger());
      await body().findByRole('menu');
      await user.click(document.body);
      await closed('menu');
    });

    it('does not select a disabled item', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      adapter.mount('menu', { onSelect });
      await user.click(trigger());
      await user.click(await body().findByRole('menuitem', { name: 'Duplicate' }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('is controlled when open is given', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      adapter.mount('menu', { open: false, onOpenChange });
      await user.click(trigger());
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
      expect(body().queryByRole('menu')).toBeNull();
    });

    it('can start open (uncontrolled)', async () => {
      adapter.mount('menu', { defaultOpen: true });
      await body().findByRole('menu');
    });

    it('has no axe violations while open', async () => {
      const user = userEvent.setup();
      adapter.mount('menu');
      await user.click(trigger());
      await body().findByRole('menu');
      await expectNoViolations();
    });
  });

  // ------------------------------------------------- Portals: Popover/Dialog/Tooltip
  describe(`${adapter.name}: Popover`, () => {
    const trigger = () => body().getByRole('button', { name: 'Open' });

    it('opens in a portal, is labelled by its title, closes with Escape and returns focus', async () => {
      const user = userEvent.setup();
      const handle = adapter.mount('popover');
      await user.click(trigger());
      const content = await body().findByRole('dialog', { name: 'Details' });
      expect(handle.container.contains(content)).toBe(false);
      await user.keyboard('{Escape}');
      await closed('dialog');
      await waitFor(() => expect(document.activeElement).toBe(trigger()));
    });

    real('closes when interacting outside and keeps focus management consistent', async () => {
      const user = userEvent.setup();
      adapter.mount('popover');
      await user.click(trigger());
      await body().findByRole('dialog');
      await user.click(document.body);
      await closed('dialog');
    });

    it('is controlled when open is given', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      adapter.mount('popover', { open: false, onOpenChange });
      await user.click(trigger());
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
      expect(body().queryByRole('dialog')).toBeNull();
    });
  });

  describe(`${adapter.name}: Dialog in a portal`, () => {
    const trigger = () => body().getByRole('button', { name: 'Open' });

    it('renders outside the container, traps focus, labels and describes the dialog', async () => {
      const user = userEvent.setup();
      const handle = adapter.mount('dialog');
      await user.click(trigger());
      const dialog = await body().findByRole('dialog', { name: 'Delete item' });
      expect(handle.container.contains(dialog)).toBe(false);
      expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    });

    it('makes the rest of the page inert while open and restores it afterwards', async () => {
      const user = userEvent.setup();
      const handle = adapter.mount('dialog');
      await user.click(trigger());
      await body().findByRole('dialog');
      await waitFor(() => expect(handle.container.getAttribute('aria-hidden')).toBe('true'));
      await user.keyboard('{Escape}');
      await closed('dialog');
      await waitFor(() => expect(handle.container.getAttribute('aria-hidden')).toBeNull());
      await waitFor(() => expect(document.body.style.pointerEvents).toBe(''));
    });

    it('cleans up the portal, aria-hidden and body styles when unmounted while open', async () => {
      const user = userEvent.setup();
      const handle = adapter.mount('dialog');
      await user.click(trigger());
      await body().findByRole('dialog');
      handle.unmount();
      await waitFor(() => expect(document.querySelector('[role=dialog]')).toBeNull());
      expect(document.body.style.pointerEvents).toBe('');
      expect(document.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
    });

    it('closes with Escape and returns focus', async () => {
      const user = userEvent.setup();
      adapter.mount('dialog');
      await user.click(trigger());
      await body().findByRole('dialog');
      await user.keyboard('{Escape}');
      await closed('dialog');
      await waitFor(() => expect(document.activeElement).toBe(trigger()));
    });

    it('has no axe violations open', async () => {
      const user = userEvent.setup();
      adapter.mount('dialog');
      await user.click(trigger());
      await body().findByRole('dialog');
      await expectNoViolations();
    });
  });

  describe(`${adapter.name}: Tooltip in a portal`, () => {
    it('shows outside the container, describes the trigger, hides with Escape, cleans up', async () => {
      const user = userEvent.setup();
      const handle = adapter.mount('tooltip');
      const trigger = body().getByRole('button', { name: 'Save' });
      await user.tab();
      const tip = await body().findByRole('tooltip');
      expect(handle.container.contains(tip)).toBe(false);
      expect(trigger).toHaveAccessibleDescription('Save the file');
      await user.keyboard('{Escape}');
      await closed('tooltip');
      await user.tab({ shift: true });
      await user.tab();
      await body().findByRole('tooltip');
      handle.unmount();
      await waitFor(() => expect(document.querySelector('[role=tooltip]')).toBeNull());
    });
  });

  // -------------------------------------------------------------- DatePicker
  describe(`${adapter.name}: DatePicker`, () => {
    const input = () => body().getByRole('textbox');
    const openCalendar = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(body().getByRole('button', { name: 'Open calendar' }));
      return body().findByRole('grid');
    };
    const day = (grid: HTMLElement, name: RegExp | string) =>
      within(grid).getByRole('button', { name });
    const nov = (n: number) => new RegExp(`November ${n}, 2026`);

    it('shows the initial value in the input and exposes a labelled textbox', () => {
      adapter.mount('datepicker');
      expect(input()).toHaveValue('11/15/2026');
      expect(body().getByText('Date')).toBeInTheDocument();
    });

    it('opens a calendar grid with weekday headers and focuses the selected day', async () => {
      const user = userEvent.setup();
      adapter.mount('datepicker');
      const grid = await openCalendar(user);
      // Zag marks the weekday header row aria-hidden: each day button carries its full date instead.
      expect(grid.querySelectorAll('thead th')).toHaveLength(7);
      expect(within(grid).getAllByRole('gridcell').length).toBeGreaterThanOrEqual(28);
      await waitFor(() => expect(document.activeElement).toHaveTextContent('15'));
    });

    it('moves with arrows, selects with Enter and reports an ISO date', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('datepicker', { onValueChange });
      await openCalendar(user);
      await waitFor(() => expect(document.activeElement).toHaveTextContent('15'));
      await user.keyboard('{ArrowRight}');
      await waitFor(() => expect(document.activeElement).toHaveTextContent('16'));
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toHaveTextContent('23'));
      await user.keyboard('{Enter}');
      await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('2026-11-23'));
    });

    real('marks disabled dates and min/max as unavailable and does not select them', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('datepicker', {
        onValueChange,
        disabledDates: ['2026-11-20'],
        min: '2026-11-10',
        max: '2026-11-25',
      });
      const grid = await openCalendar(user);
      const cell = (n: string) =>
        within(grid)
          .getAllByRole('button')
          .find((b) => b.textContent === n && !b.hasAttribute('data-outside-range'))!;
      expect(cell('20')).toHaveAttribute('aria-disabled', 'true');
      expect(cell('5')).toHaveAttribute('aria-disabled', 'true');
      await user.click(cell('20'));
      expect(onValueChange).not.toHaveBeenCalled();
      await user.click(cell('18'));
      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('2026-11-18'));
    });

    it('localizes the month heading, weekday names and input format', async () => {
      const user = userEvent.setup();
      adapter.mount('datepicker', { locale: 'es-ES' });
      expect(input()).toHaveValue('15/11/2026');
      const grid = await openCalendar(user);
      expect(body().getByText(/noviembre de 2026|noviembre 2026/i)).toBeInTheDocument();
      expect(
        [...grid.querySelectorAll('thead th')].map((h) => h.getAttribute('aria-label')),
      ).toContain('lunes');
    });

    real('is controlled when value is given and uncontrolled with defaultValue', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('datepicker', { value: '2026-11-15', defaultValue: undefined, onValueChange });
      const grid = await openCalendar(user);
      await user.click(day(grid, nov(17)));
      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('2026-11-17'));
      expect(input()).toHaveValue('11/15/2026');
    });

    it('parses typed text on blur', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      adapter.mount('datepicker', { onValueChange });
      await user.clear(input());
      await user.type(input(), '12/25/2026{Enter}');
      await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('2026-12-25'));
    });

    it('closes with Escape and returns focus', async () => {
      const user = userEvent.setup();
      adapter.mount('datepicker');
      await openCalendar(user);
      await user.keyboard('{Escape}');
      await closed('grid');
    });

    it('has no axe violations closed or open', async () => {
      const user = userEvent.setup();
      adapter.mount('datepicker');
      await expectNoViolations();
      await openCalendar(user);
      await expectNoViolations();
    });
  });

  // ------------------------------------------------ Layering: portal in portal
  describe(`${adapter.name}: Select inside a Dialog (portal in portal)`, () => {
    const select = () => body().getByRole('combobox', { name: /Fruit/ });

    real('lets the select work inside the modal: choose an option, dialog stays open', async () => {
      const user = userEvent.setup();
      adapter.mount('nested');
      await user.click(body().getByRole('button', { name: 'Open' }));
      await body().findByRole('dialog', { name: 'Settings' });
      await user.click(select());
      await user.click(await body().findByRole('option', { name: /Cherry/ }));
      await waitFor(() => expect(select()).toHaveTextContent('Cherry'));
      expect(body().queryByRole('dialog', { name: 'Settings' })).not.toBeNull();
    });

    real('dismisses one layer per Escape: the list first, then the dialog', async () => {
      const user = userEvent.setup();
      adapter.mount('nested');
      await user.click(body().getByRole('button', { name: 'Open' }));
      await body().findByRole('dialog', { name: 'Settings' });
      await user.click(select());
      await body().findByRole('listbox');
      await user.keyboard('{Escape}');
      await closed('listbox');
      expect(body().queryByRole('dialog', { name: 'Settings' })).not.toBeNull();
      await user.keyboard('{Escape}');
      await closed('dialog');
    });

    real(
      'stacks the list above the modal only if its layer is higher (token finding)',
      async () => {
        const style = document.createElement('style');
        style.dataset.spike = '';
        // Positions and the layer values of @tessen-ui/tokens: dropdown 1000, modal 1300, popover 1400.
        const css = (dropdown: number) => `
        .t-dialog { position: fixed; inset: 0; z-index: 1300 }
        .t-dialog__positioner { display: grid; place-items: center; height: 100% }
        .t-dialog__content { min-width: 360px; min-height: 240px; background: white }
        .t-select__positioner { z-index: ${dropdown} !important }`;
        document.head.append(style);
        const user = userEvent.setup();
        adapter.mount('nested');
        await user.click(body().getByRole('button', { name: 'Open' }));
        await body().findByRole('dialog', { name: 'Settings' });
        await user.click(select());
        const list = await body().findByRole('listbox');
        // Both layers are positioned children of <body> (portals), so their z-index decides.
        const layerOf = (el: Element) => {
          let node: Element = el;
          while (node.parentElement !== document.body) node = node.parentElement!;
          const cs = getComputedStyle(node);
          return { position: cs.position, z: Number(cs.zIndex) };
        };
        const dialogLayer = () => layerOf(body().getByRole('dialog', { name: 'Settings' }));
        const listIsOnTop = () => {
          const list_ = layerOf(list);
          expect(['fixed', 'absolute']).toContain(list_.position);
          expect(dialogLayer().position).toBe('fixed');
          return list_.z > dialogLayer().z;
        };
        style.textContent = css(1000);
        expect(listIsOnTop()).toBe(false); // hidden behind the dialog
        style.textContent = css(1400);
        expect(listIsOnTop()).toBe(true); // above it
      },
    );
  });

  // -------------------------------------------------------------- Hydration
  describe(`${adapter.name}: SSR hydration`, () => {
    const kinds: Kind[] = [
      'select',
      'combobox',
      'menu',
      'popover',
      'dialog',
      'tooltip',
      'datepicker',
    ];

    it.each(kinds)('%s hydrates without warnings and keeps working', async (kind) => {
      const hydrated = await adapter.hydrate(kind);
      expect(hydrated.messages).toEqual([]);
      const user = userEvent.setup();
      switch (kind) {
        case 'select':
          await user.click(within(hydrated.container).getByRole('combobox', { name: /Fruit/ }));
          await body().findByRole('listbox');
          break;
        case 'combobox':
          await user.type(within(hydrated.container).getByRole('combobox', { name: /Fruit/ }), 'c');
          await body().findByRole('listbox');
          break;
        case 'menu':
          await user.click(within(hydrated.container).getByRole('button', { name: 'Open' }));
          await body().findByRole('menu');
          break;
        case 'popover':
        case 'dialog':
          await user.click(within(hydrated.container).getByRole('button', { name: 'Open' }));
          await body().findByRole('dialog');
          break;
        case 'tooltip':
          await user.tab();
          await body().findByRole('tooltip');
          break;
        case 'datepicker':
          await user.click(
            within(hydrated.container).getByRole('button', { name: 'Open calendar' }),
          );
          await body().findByRole('grid');
          break;
      }
    });

    it('server and client agree on ids and ARIA relationships before interaction', async () => {
      const hydrated = await adapter.hydrate('select');
      const trigger = within(hydrated.container).getByRole('combobox', { name: /Fruit/ });
      const labelledBy = trigger.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(hydrated.container.querySelector(`[id="${labelledBy}"]`)).not.toBeNull();
    });

    it('hydrates controlled and open-by-default state', async () => {
      const hydrated = await adapter.hydrate('select', { value: 'cherry' });
      expect(hydrated.messages).toEqual([]);
      expect(within(hydrated.container).getByRole('combobox', { name: /Fruit/ })).toHaveTextContent(
        'Cherry',
      );
    });
  });
}
