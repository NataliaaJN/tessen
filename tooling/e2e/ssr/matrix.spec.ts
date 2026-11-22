// Version matrix, runtime part: the built consumers on the OLD end of the peer ranges, in a real
// browser: React 18.3 (integration/vite-react18) and Vue 3.5.2 (integration/vite-vue352). The
// Zag-based parts (Tabs, Dialog) and the native controls must behave as on the newest versions.
import { expect, test } from '@playwright/test';

const targets = [
  { name: 'React 18.3 consumer', url: process.env['MATRIX_REACT18_URL'] },
  { name: 'Vue 3.5.2 consumer', url: process.env['MATRIX_VUE352_URL'] },
];

for (const { name, url } of targets) {
  test.describe(name, () => {
    test.skip(!url, 'server URL not provided (use pnpm ssr:e2e)');

    test('runs without console errors and its widgets work', async ({ page }) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('response', (r) => {
        if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`);
      });
      page.on('console', (m) => {
        if (
          ['error', 'warning'].includes(m.type()) &&
          !m.text().startsWith('Failed to load resource')
        )
          problems.push(`${m.type()}: ${m.text()}`);
      });
      await page.goto(url!);

      await expect(page.getByRole('tab', { name: 'Account' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await page.getByRole('tab', { name: 'Billing' }).click();
      await expect(page.getByText('Billing is read-only.')).toBeVisible();

      await page.getByRole('tab', { name: 'Account' }).click();
      const box = page.getByRole('checkbox', { name: 'Accept the terms' });
      await page.getByText('Accept the terms').click();
      await expect(box).toBeChecked();

      await page.getByRole('button', { name: 'Delete account' }).click();
      const dialog = page.getByRole('dialog', { name: 'Delete account?' });
      await expect(dialog).toBeVisible();
      await expect
        .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
        .toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delete account' })).toBeFocused();

      expect(problems).toEqual([]);
    });
  });
}
