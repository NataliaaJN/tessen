import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Theme Studio in a real browser (F5): the preview iframe, presets, undo/redo, contrast audit,
 * export, import, share links and saved themes. The Studio runs from its Vite dev server (see
 * playwright.config.ts), against the built workspace packages.
 */
const STUDIO = 'http://localhost:5174/';

// Preset buttons only (the accent swatches share some names, e.g. Ámbar).
const preview = (page: Page) => page.frameLocator('iframe[title="Vista previa del tema"]');

/** Reads a CSS custom property from the preview document. */
async function previewVar(page: Page, name: string): Promise<string> {
  return page.evaluate((n) => {
    const frame = document.querySelector('iframe') as HTMLIFrameElement;
    const doc = frame.contentDocument as Document;
    return getComputedStyle(doc.documentElement).getPropertyValue(n).trim();
  }, name);
}

const problems = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  problems.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') list.push(m.text());
  });
  await page.goto(STUDIO);
  await expect(preview(page).getByRole('button', { name: 'Principal' })).toBeVisible();
});

// Any console error or uncaught exception during a test fails it.
test.afterEach(({ page }) => {
  expect(problems.get(page) ?? []).toEqual([]);
});

test('renders the real components in the preview iframe with the base theme', async ({ page }) => {
  await expect(page).toHaveTitle(/Theme Studio/);
  expect(await previewVar(page, '--tessen-radius-base')).toBe('6px');
  await expect(page.getByText(/120 pares correctos/)).toBeVisible();
});

test('a dark preset retheme the preview live and writes the share link', async ({ page }) => {
  await page.locator('.preset', { hasText: 'Brasa' }).click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('0px');
  const mode = await page.evaluate(
    () =>
      (document.querySelector('iframe') as HTMLIFrameElement).contentDocument?.documentElement
        .dataset['tessenTheme'],
  );
  expect(mode).toBe('dark');
  await expect.poll(() => page.url()).toContain('#t=v1.');
});

test('undo and redo walk back through edits (button and keyboard)', async ({ page }) => {
  await page.locator('.preset', { hasText: 'Ámbar' }).click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('14px');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('6px');
  await page.getByRole('button', { name: 'Rehacer' }).click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('14px');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Control+z');
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('6px');
});

test('the compare switch shows the base theme and back', async ({ page }) => {
  await page.locator('.preset', { hasText: 'Ámbar' }).click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('14px');
  await page.getByText('Comparar con la base').click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('6px');
  await page.getByText('Comparar con la base').click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('14px');
});

test('a bad override fails the contrast audit and the proposed fix clears it', async ({ page }) => {
  await page.getByRole('tab', { name: 'Avanzado' }).click();
  await page
    .getByLabel('color.text.primary, modo claro')
    .selectOption({ value: '{color.neutral.200}' });
  const summary = page.locator('.audit__summary');
  await expect(summary).toContainText('no cumplen');
  await summary.click();
  await page.locator('.audit__list li button').first().click();
  await expect(summary).toContainText(/pares correctos|no cumplen/);
  // Fixing one foreground repairs every pair it takes part in; others may remain, never the same one.
  await expect(page.locator('.audit__list li', { hasText: 'text.primary' })).toHaveCount(0);
});

test('the exported CSS reproduces the preview in a plain page (US-02)', async ({
  page,
  browser,
}) => {
  await page.locator('.preset', { hasText: 'Bosque' }).click();
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('10px');
  await page.getByRole('button', { name: 'Exportar' }).click();
  const css = await page.locator('[role="tabpanel"]:not([hidden]) pre code').first().innerText();
  expect(css).toContain('--tessen-radius-base: 10px;');

  const inPreview = await previewVar(page, '--tessen-color-action-primary-default');
  const other = await browser.newPage();
  await other.goto(`${STUDIO}preview.html`);
  await other.addStyleTag({ content: css });
  const reproduced = await other.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--tessen-color-action-primary-default')
      .trim(),
  );
  expect(reproduced.toLowerCase()).toBe(inPreview.toLowerCase());
  const radius = await other.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--tessen-radius-base').trim(),
  );
  expect(radius).toBe('10px');
  await other.close();
});

test('a share link opens exactly the same theme', async ({ page, browser }) => {
  await page.locator('.preset', { hasText: 'Aurora' }).click();
  await expect.poll(() => page.url()).toContain('#t=v1.');
  const url = page.url();
  const other = await browser.newPage();
  await other.goto(url);
  await expect(other.getByLabel('Nombre del tema')).toHaveValue('aurora');
  await expect(other.getByText(/enlace compartido/)).toBeVisible();
  await other.close();
});

test('imports a theme file and reports a bad one', async ({ page }) => {
  const good = {
    version: 1,
    name: 'importado',
    accent: '#C2409B',
    radius: 3,
    density: 'compact',
    motion: 'full',
    fonts: { sans: 'Inter', display: 'Outfit', mono: 'JetBrains Mono' },
    previewMode: 'light',
    overrides: { primitives: {}, light: {}, dark: {} },
  };
  await page.locator('input[type="file"]').setInputFiles({
    name: 'tema.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(good)),
  });
  await expect(page.getByLabel('Nombre del tema')).toHaveValue('importado');
  await expect.poll(() => previewVar(page, '--tessen-radius-base')).toBe('3px');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'roto.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{ no es json'),
  });
  await expect(page.locator('.notice')).toContainText('no es JSON válido');
  await expect(page.getByLabel('Nombre del tema')).toHaveValue('importado');
});

test('saves a theme in this browser and reopens it', async ({ page }) => {
  await page.locator('.preset', { hasText: 'Bosque' }).click();
  await page.getByLabel('Nombre para guardar').fill('Mi marca');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.locator('.notice')).toContainText('«Mi marca» guardado');
  await page.locator('.preset', { hasText: 'Brasa' }).click();
  await page.getByRole('button', { name: 'Mi marca', exact: true }).click();
  await expect(page.getByLabel('Nombre del tema')).toHaveValue('bosque');
});

test('the draft survives a reload', async ({ page }) => {
  await page.locator('.preset', { hasText: 'Ámbar' }).click();
  await expect.poll(() => page.url()).toContain('#t=');
  // Wait for the debounced draft write, then reload without the hash.
  await page.waitForTimeout(500);
  await page.goto(STUDIO);
  await expect(page.getByLabel('Nombre del tema')).toHaveValue('ambar');
});
