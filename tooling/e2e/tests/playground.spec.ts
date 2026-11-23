import { expect, test } from '@playwright/test';
import type { FrameLocator, Page } from '@playwright/test';

/**
 * Playground in a real browser (F6): the same scene mounted in a Vue and a React iframe, the
 * generated code, forced states, theme, responsive width and the state in the URL. It runs from
 * its Vite dev server (see playwright.config.ts) against the built workspace packages.
 */
const PLAYGROUND = 'http://localhost:5175/';

const frame = (page: Page, framework: 'Vue' | 'React'): FrameLocator =>
  page.frameLocator(`iframe[title="Vista previa en ${framework}"]`);

const problems = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  problems.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') list.push(m.text());
  });
});

// Any console error or uncaught exception during a test fails it.
test.afterEach(({ page }) => {
  expect(problems.get(page) ?? []).toEqual([]);
});

async function open(page: Page, hash = ''): Promise<void> {
  await page.goto(`${PLAYGROUND}${hash}`);
  await expect(frame(page, 'Vue').locator('#stage > *')).toHaveCount(1);
  await expect(frame(page, 'React').locator('#stage > *')).toHaveCount(1);
}

test('shows the same button in Vue and React and the code for both', async ({ page }) => {
  await open(page);
  await expect(page).toHaveTitle(/Playground/);
  await expect(frame(page, 'Vue').getByRole('button', { name: 'Button' })).toBeVisible();
  await expect(frame(page, 'React').getByRole('button', { name: 'Button' })).toBeVisible();
  await expect(page.getByTestId('code')).toContainText('<TButton>Button</TButton>');
  await page.getByRole('button', { name: 'React', exact: true }).last().click();
  await expect(page.getByTestId('code')).toContainText("from '@tessen-ui/react'");
});

test('a prop change updates both previews and the code (US-03)', async ({ page }) => {
  await open(page);
  await page.locator('[data-control="variant"] select').selectOption('outline');
  await page.locator('[data-control="size"] select').selectOption('lg');
  await page.locator('[data-control="loading"]').click();
  for (const fw of ['Vue', 'React'] as const) {
    const button = frame(page, fw).locator('#stage button');
    await expect(button).toHaveAttribute('data-variant', 'outline');
    await expect(button).toHaveAttribute('data-size', 'lg');
  }
  await expect(page.getByTestId('code')).toContainText(
    '<TButton variant="outline" size="lg" loading>Button</TButton>',
  );
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('code')).toContainText('<TButton>Button</TButton>');
});

test('every component renders in Vue and React without errors', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page);
  const slugs = await page
    .locator('#component option')
    .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
  expect(slugs.length).toBe(41);
  for (const slug of slugs) {
    await page.locator('#component').selectOption(slug);
    for (const fw of ['Vue', 'React'] as const) {
      await expect(
        frame(page, fw).locator('#stage .stage-inner > *'),
        `${slug} in ${fw}`,
      ).not.toHaveCount(0);
    }
    await expect(page.getByTestId('code'), slug).not.toBeEmpty();
  }
});

test('forcing hover restyles the component without a real hover', async ({ page }) => {
  await open(page, '#c=button');
  const background = (fw: 'Vue' | 'React') =>
    frame(page, fw)
      .getByRole('button', { name: 'Button' })
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  const normal = await background('Vue');
  await page.getByTestId('force-hover').click();
  await expect.poll(() => background('Vue')).not.toBe(normal);
  await expect.poll(() => background('React')).not.toBe(normal);
  await page.getByTestId('force-none').click();
  await expect.poll(() => background('Vue')).toBe(normal);
});

test('forcing focus shows the focus ring', async ({ page }) => {
  await open(page, '#c=input');
  const outline = () =>
    frame(page, 'React')
      .locator('.t-input')
      .evaluate((el) => getComputedStyle(el).outlineStyle + getComputedStyle(el).boxShadow);
  const before = await outline();
  await page.getByTestId('force-focus').click();
  await expect.poll(outline).not.toBe(before);
});

test('theme and mode reach the previews', async ({ page }) => {
  await open(page);
  const radius = (fw: 'Vue' | 'React') =>
    frame(page, fw)
      .locator('#stage')
      .evaluate((el) =>
        getComputedStyle(el.ownerDocument.documentElement)
          .getPropertyValue('--tessen-radius-base')
          .trim(),
      );
  expect(await radius('Vue')).toBe('6px');
  await page.getByTestId('theme').selectOption('ambar');
  await expect.poll(() => radius('Vue')).toBe('14px');
  await expect.poll(() => radius('React')).toBe('14px');
  await page.getByTestId('mode-dark').click();
  await expect
    .poll(() =>
      frame(page, 'Vue')
        .locator('#stage')
        .evaluate((el) => el.ownerDocument.documentElement.dataset['tessenTheme']),
    )
    .toBe('dark');
});

test('the preview width can be fixed for responsive checks', async ({ page }) => {
  await open(page);
  await page.getByTestId('view-react').click();
  await page.getByTestId('width-320').click();
  const box = await page.locator('iframe[title="Vista previa en React"]').boundingBox();
  expect(Math.round(box?.width ?? 0)).toBe(320);
});

test('the state lives in the URL and survives a reload', async ({ page }) => {
  await open(page);
  await page.locator('[data-control="tone"] select').selectOption('danger');
  await expect.poll(() => page.url()).toContain('#s=v1.');
  const url = page.url();
  await page.goto(url);
  await page.reload();
  await expect(page.locator('[data-control="tone"] select')).toHaveValue('danger');
  await expect(frame(page, 'React').getByRole('button', { name: 'Button' })).toHaveAttribute(
    'data-tone',
    'danger',
  );
});

test('the docs link #c=slug&fw=react opens that component with the React code', async ({
  page,
}) => {
  await open(page, '#c=dialog&fw=react');
  await expect(page.locator('#component')).toHaveValue('dialog');
  await expect(page.getByTestId('code')).toContainText('export default function Example');
});

test('copies and downloads the generated code', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '#c=badge');
  await page.getByTestId('copy').click();
  await expect(page.getByTestId('copy')).toContainText('Copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '<TBadge>Badge</TBadge>',
  );
  const download = page.waitForEvent('download');
  await page.getByTestId('download').click();
  expect((await download).suggestedFilename()).toBe('BadgeExample.vue');
});

test('the toast recipe wires its setup in both frameworks', async ({ page }) => {
  await open(page, '#c=toast');
  await expect(page.getByTestId('code')).toContainText('const toaster = createToaster();');
  for (const fw of ['Vue', 'React'] as const) {
    await frame(page, fw).getByRole('button', { name: 'Notify' }).click();
    await expect(frame(page, fw).getByText('Changes stored')).toBeVisible();
  }
});

test('an overlay opens inside its own preview', async ({ page }) => {
  await open(page, '#c=dialog');
  for (const fw of ['Vue', 'React'] as const) {
    await frame(page, fw).getByRole('button', { name: 'Delete account' }).click();
    await expect(frame(page, fw).getByRole('dialog')).toBeVisible();
  }
});
