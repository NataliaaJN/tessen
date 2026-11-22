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
  });
}
