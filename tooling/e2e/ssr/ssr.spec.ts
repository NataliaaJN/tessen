// Hydration of the SSR consumer projects (integration/next, integration/nuxt), in a real browser.
// Run through `pnpm ssr:e2e`, which starts their production servers. Same assertions for both.
import { expect, test } from '@playwright/test';

const targets = [
  { name: 'Next.js (React)', url: process.env['SSR_NEXT_URL'] },
  { name: 'Nuxt (Vue)', url: process.env['SSR_NUXT_URL'] },
];

for (const target of targets) {
  test.describe(target.name, () => {
    test.skip(!target.url, 'server URL not provided (use pnpm ssr:e2e)');

    test('hydrates without errors or mismatch warnings', async ({ page }) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('response', (r) => {
        if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`);
      });
      page.on('console', (m) => {
        // The generic "Failed to load resource" line is reported with its URL by the response listener.
        if (
          ['error', 'warning'].includes(m.type()) &&
          !m.text().startsWith('Failed to load resource')
        )
          problems.push(`${m.type()}: ${m.text()}`);
      });
      await page.goto(target.url!);
      // Hydrated = the dialog that only exists on the client is there.
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(problems).toEqual([]);
    });

    test('defaultOpen dialog: modal, traps focus, closes with Escape (F3-progress §1 limit)', async ({
      page,
    }) => {
      await page.goto(target.url!);
      const dialog = page.getByRole('dialog', { name: 'Opened on load' });
      await expect(dialog).toBeVisible();
      await expect
        .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
        .toBe(true);
      // The rest of the page is hidden from assistive technology while the dialog is open.
      await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    test('server-rendered widgets become interactive after hydration', async ({ page }) => {
      await page.goto(target.url!);
      // The dialog only exists once hydrated; then close it.
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);

      // Tabs: the server rendered "Second" selected; a click switches.
      await expect(page.getByRole('tab', { name: 'Second' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await page.getByRole('tab', { name: 'First' }).click();
      await expect(page.getByRole('tab', { name: 'First' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page.getByText('Panel A')).toBeVisible();

      // Select: keeps the server-rendered value, then opens and chooses.
      const select = page.getByRole('combobox', { name: 'Fruit' });
      await expect(select).toContainText('Banana');
      await select.click();
      await page.getByRole('option', { name: 'Apple' }).click();
      await expect(select).toContainText('Apple');

      // Accordion: open on the server, closes after hydration.
      const trigger = page.getByRole('button', { name: 'One' });
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
}
