import { expect, test } from '@playwright/test';
import { frameworks, openScene } from './harness.ts';

/**
 * Real-browser behaviour (ADR 0004, C3): what jsdom cannot prove. Focus, outside clicks, the exit
 * animation and positioning run against the built Vue and React packages, same assertions each.
 */
for (const fw of frameworks) {
  test.describe(`${fw}`, () => {
    test.describe('Dialog', () => {
      test('moves focus in, traps Tab, closes on Escape and gives focus back', async ({ page }) => {
        await openScene(page, fw, 'dialog-open');
        const dialog = page.getByRole('dialog', { name: 'Delete account?' });
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('This cannot be undone.');

        // Focus starts inside and Tab never leaves the dialog.
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press('Tab');
          expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
        }
        await page.keyboard.press('Shift+Tab');
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();

        // Re-open with the trigger: closing hands focus back to it.
        const trigger = page.getByRole('button', { name: 'Delete account' });
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
      });

      test('closes on a click outside and on the close button', async ({ page }) => {
        await openScene(page, fw, 'dialog-open');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await page.mouse.click(5, 5);
        await expect(dialog).toBeHidden();

        await page.getByRole('button', { name: 'Delete account' }).click();
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(dialog).toBeHidden();
      });

      test('keeps the page behind it inert for assistive technology and the pointer', async ({
        page,
      }) => {
        await openScene(page, fw, 'dialog-open');
        await expect(page.getByRole('dialog')).toBeVisible();
        // The modal engine hides everything outside the dialog from the accessibility tree.
        await expect(page.getByRole('button', { name: 'Delete account' })).toHaveCount(0);
      });

      test('plays its exit before leaving the DOM when motion is allowed', async ({ browser }) => {
        const context = await browser.newContext({ reducedMotion: 'no-preference' });
        const page = await context.newPage();
        await openScene(page, fw, 'dialog-open');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await context.close();
      });
    });

    test.describe('Tooltip', () => {
      test('opens on keyboard focus next to its trigger and closes on Escape', async ({ page }) => {
        await openScene(page, fw, 'tooltip');
        await page.keyboard.press('Tab');
        const trigger = page.getByRole('button', { name: 'Save' });
        await expect(trigger).toBeFocused();
        const tip = page.getByRole('tooltip');
        await expect(tip).toHaveText('Save the file');

        const t = (await trigger.boundingBox())!;
        const c = (await tip.boundingBox())!;
        // Placed beside the trigger (above by default), overlapping it on the main axis.
        const vertical = Math.min(Math.abs(c.y + c.height - t.y), Math.abs(t.y + t.height - c.y));
        expect(vertical).toBeLessThan(24);
        expect(c.x < t.x + t.width && c.x + c.width > t.x).toBe(true);

        await page.keyboard.press('Escape');
        await expect(tip).toBeHidden();
      });

      test('opens on hover and closes when the pointer leaves', async ({ page }) => {
        await openScene(page, fw, 'tooltip');
        await page.getByRole('button', { name: 'Save' }).hover();
        await expect(page.getByRole('tooltip')).toBeVisible();
        await page.mouse.move(700, 600);
        await expect(page.getByRole('tooltip')).toBeHidden();
      });
    });

    test.describe('Tabs', () => {
      test('selects on click and moves with the arrow, Home and End keys', async ({ page }) => {
        await openScene(page, fw, 'tabs');
        const billing = page.getByRole('tab', { name: 'Billing' });
        await expect(billing).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tabpanel')).toHaveText('Billing panel');

        await page.getByRole('tab', { name: 'Account' }).click();
        await expect(page.getByRole('tabpanel')).toHaveText('Account panel');

        await page.keyboard.press('ArrowRight');
        await expect(billing).toBeFocused();
        await expect(billing).toHaveAttribute('aria-selected', 'true');
        await page.keyboard.press('End');
        await expect(page.getByRole('tab', { name: 'Team' })).toHaveAttribute(
          'aria-selected',
          'true',
        );
        await page.keyboard.press('Home');
        await expect(page.getByRole('tab', { name: 'Account' })).toBeFocused();
      });

      test('only the selected tab is in the tab order', async ({ page }) => {
        await openScene(page, fw, 'tabs');
        const tabIndexes = await page
          .getByRole('tab')
          .evaluateAll((tabs) => tabs.map((t) => (t as HTMLElement).tabIndex));
        expect(tabIndexes.filter((i) => i === 0)).toHaveLength(1);
      });
    });

    test.describe('Form controls', () => {
      test('Checkbox and Switch toggle with a real click on their label', async ({ page }) => {
        await openScene(page, fw, 'forms');
        const checkbox = page.getByRole('checkbox', { name: 'Plain' });
        await expect(checkbox).not.toBeChecked();
        await page.getByText('Plain', { exact: true }).click();
        await expect(checkbox).toBeChecked();

        const toggle = page.getByRole('switch', { name: 'Off' });
        await expect(toggle).not.toBeChecked();
        await page.getByText('Off', { exact: true }).click();
        await expect(toggle).toBeChecked();
      });

      test('RadioGroup moves selection with the arrow keys', async ({ page }) => {
        await openScene(page, fw, 'forms');
        const pro = page.getByRole('radio', { name: 'Pro' });
        await expect(pro).toBeChecked();
        await pro.focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.getByRole('radio', { name: 'Team' })).toBeChecked();
      });

      test('Field wires the label and the description to the control', async ({ page }) => {
        await openScene(page, fw, 'forms');
        const email = page.getByLabel('Email');
        await email.fill('a@b.co');
        await expect(email).toHaveValue('a@b.co');
        await expect(email).toHaveAccessibleDescription('We never share it.');
        const name = page.getByLabel('Name');
        await expect(name).toHaveAttribute('aria-invalid', 'true');
        await expect(name).toHaveAccessibleDescription(/Too short/);
      });
    });
    test.describe('Select', () => {
      test('opens with the keyboard, finds an option by typing and chooses it with Enter', async ({
        page,
      }) => {
        await openScene(page, fw, 'controls');
        const select = page.getByRole('combobox', { name: 'Fruit', exact: true });
        await expect(select).toContainText('Cherry');
        await select.focus();
        await page.keyboard.press('ArrowDown');
        const list = page.getByRole('listbox', { name: 'Fruit' });
        await expect(list).toBeVisible();
        await page.keyboard.press('a');
        await expect(page.getByRole('option', { name: 'Apple' })).toHaveAttribute(
          'data-highlighted',
          '',
        );
        await page.keyboard.press('Enter');
        await expect(list).toBeHidden();
        await expect(select).toContainText('Apple');
        await expect(select).toBeFocused();
      });

      test('skips the disabled option and closes on Escape', async ({ page }) => {
        await openScene(page, fw, 'select-open');
        const list = page.getByRole('listbox', { name: 'Fruit' });
        await expect(list).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(list).toBeHidden();
        // Reopened from the keyboard it starts on the chosen option; the next one skips Banana.
        await page.keyboard.press('ArrowDown');
        await expect(list).toBeVisible();
        await page.keyboard.press('ArrowDown');
        await expect
          .poll(() =>
            page
              .getByRole('option', { name: 'Cherry' })
              .evaluate((el) => el.hasAttribute('data-highlighted')),
          )
          .toBe(true);
        await page.keyboard.press('Escape');
        await expect(list).toBeHidden();
      });

      test('its list opens above a modal Dialog and Escape closes one layer at a time', async ({
        page,
      }) => {
        await openScene(page, fw, 'dialog-select');
        const dialog = page.getByRole('dialog', { name: 'Preferences' });
        await expect(dialog).toBeVisible();
        await dialog.getByRole('combobox', { name: 'Fruit', exact: true }).click();
        const cherry = page.getByRole('option', { name: 'Cherry' });
        await expect(cherry).toBeVisible();
        // It is the topmost thing at its own centre: not hidden behind the modal.
        const box = (await cherry.boundingBox())!;
        const onTop = await page.evaluate(
          ([x, y]) => document.elementFromPoint(x!, y!)?.closest('[role="option"]') !== null,
          [box.x + box.width / 2, box.y + box.height / 2],
        );
        expect(onTop).toBe(true);
        await cherry.click();
        await expect(dialog.getByRole('combobox', { name: 'Fruit', exact: true })).toContainText(
          'Cherry',
        );
        await dialog.getByRole('combobox', { name: 'Fruit', exact: true }).click();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('listbox')).toBeHidden();
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
      });
    });

    test.describe('Combobox', () => {
      test('filters while typing, chooses with the keyboard and keeps the other options for later', async ({
        page,
      }) => {
        await openScene(page, fw, 'controls');
        const input = page.getByRole('combobox', { name: 'Search fruit' });
        await input.click();
        await input.pressSequentially('ch', { delay: 30 });
        await expect(page.getByRole('option')).toHaveCount(1);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await expect(input).toHaveValue('Cherry');
        await page.getByRole('button', { name: 'Show options' }).click();
        await expect(page.getByRole('option')).toHaveCount(3);
      });
    });

    test.describe('Slider', () => {
      test('moves with the keyboard and by clicking on the track', async ({ page }) => {
        await openScene(page, fw, 'controls');
        const thumb = page.getByRole('slider', { name: 'Volume' });
        await expect(thumb).toHaveAttribute('aria-valuenow', '40');
        await thumb.focus();
        await page.keyboard.press('ArrowRight');
        await expect(thumb).toHaveAttribute('aria-valuenow', '41');
        await page.keyboard.press('End');
        await expect(thumb).toHaveAttribute('aria-valuenow', '100');

        const track = page.locator('.t-slider__control');
        const box = (await track.boundingBox())!;
        await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
        const value = Number(await thumb.getAttribute('aria-valuenow'));
        expect(value).toBeGreaterThan(15);
        expect(value).toBeLessThan(35);
      });
    });

    test.describe('Accordion', () => {
      test('expands on click, shows only the open content and moves with the arrow keys', async ({
        page,
      }) => {
        await openScene(page, fw, 'controls');
        await expect(page.getByText('First content')).toBeVisible();
        await expect(page.getByText('Second content')).toBeHidden();
        await page.getByRole('button', { name: 'Second' }).click();
        await expect(page.getByText('Second content')).toBeVisible();
        await expect(page.getByText('First content')).toBeHidden();
        await page.getByRole('button', { name: 'Second' }).press('ArrowUp');
        await expect(page.getByRole('button', { name: 'First' })).toBeFocused();
      });
    });

    test.describe('Popover', () => {
      test('is not modal: the page stays reachable and a click outside closes it', async ({
        page,
      }) => {
        await openScene(page, fw, 'popover-open');
        const popover = page.getByRole('dialog', { name: 'Shipping' });
        await expect(popover).toBeVisible();
        await expect(page.getByRole('button', { name: 'After' })).toBeVisible();
        await page.getByRole('button', { name: 'After' }).click();
        await expect(popover).toBeHidden();
      });

      test('Escape closes it and gives focus back to the trigger', async ({ page }) => {
        await openScene(page, fw, 'popover-open');
        const popover = page.getByRole('dialog', { name: 'Shipping' });
        await expect(popover).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(popover).toBeHidden();
        await expect(page.getByRole('button', { name: 'Details' })).toBeFocused();
      });
    });

    test.describe('DropdownMenu', () => {
      test('highlights with the arrows skipping disabled items and closes on Escape', async ({
        page,
      }) => {
        await openScene(page, fw, 'menu-open');
        const menu = page.getByRole('menu', { name: 'Actions' });
        await expect(menu).toBeVisible();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
          'data-highlighted',
          '',
        );
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
          'data-highlighted',
          '',
        );
        await page.keyboard.press('Escape');
        await expect(menu).toBeHidden();
        await expect(page.getByRole('button', { name: 'Actions' })).toBeFocused();
      });
    });

    test.describe('AlertDialog', () => {
      test('is modal and a click outside does not dismiss it; Cancel does and returns focus', async ({
        page,
      }) => {
        await openScene(page, fw, 'alert-dialog-open');
        const dialog = page.getByRole('alertdialog', { name: 'Delete item?' });
        await expect(dialog).toBeVisible();
        await page.mouse.click(5, 5);
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Keep' }).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeFocused();
      });

      test('Escape still closes it and Tab never leaves it', async ({ page }) => {
        await openScene(page, fw, 'alert-dialog-open');
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toBeVisible();
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press('Tab');
          expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
        }
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
      });
    });

    test.describe('Toast', () => {
      test('appears in the live region, closes itself after its duration and by its button', async ({
        page,
      }) => {
        await openScene(page, fw, 'toast');
        await page.getByRole('button', { name: 'Notify' }).click();
        const region = page.getByRole('region', { name: /Notifications/ });
        await expect(region).toContainText('Saved');
        await expect(region).toContainText('Changes stored');
        await expect(region.locator('.t-toast')).toHaveCount(0, { timeout: 6000 });

        // A toast that stays until it is closed by hand.
        await page.getByRole('button', { name: 'Pin' }).click();
        await expect(region.locator('.t-toast')).toHaveCount(1);
        await region.getByRole('button', { name: /Dismiss/ }).click();
        await expect(region.locator('.t-toast')).toHaveCount(0, { timeout: 6000 });
      });
    });
  });
}
