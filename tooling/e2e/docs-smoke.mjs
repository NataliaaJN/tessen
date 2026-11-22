// Visits every docs component page, scrolls so every island hydrates, and fails on console errors.
// Needs the docs site served on DOCS_URL (default http://localhost:4321): `pnpm docs:smoke`.
import { chromium } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.env.DOCS_URL ?? 'http://localhost:4321';
const dir = fileURLToPath(new URL('../../apps/docs/src/generated/components/', import.meta.url));
const slugs = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''));

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const page = await browser.newPage();
/** @type {string[]} */
const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`${page.url()} ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`${page.url()} ${e.message}`));

for (const slug of slugs) {
  await page.goto(`${base}/components/${slug}/`, { waitUntil: 'networkidle' });
  // client:visible islands hydrate on scroll: walk the page.
  await page.evaluate(`(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  })()`);
  await page.waitForTimeout(150);
}
await browser.close();

if (problems.length > 0) {
  console.error(`docs smoke: ${problems.length} problem(s)\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`docs smoke OK: ${slugs.length} pages without console errors`);
