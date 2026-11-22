/**
 * P3 visual parity: renders the same Button matrix in Vue and React (harness page), screenshots
 * each panel and diffs them pixel by pixel. System Chrome through playwright-core: nothing is
 * downloaded. Exit code 1 when any scenario exceeds the threshold.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { chromium, type Page } from 'playwright-core';
import { PNG } from 'pngjs';
import { createServer } from 'vite';

const THRESHOLD_PERCENT = 0.1; // docs/planning/06 §4: <= 0.1 % of different pixels
const OUT = join(import.meta.dirname, '..', '.out');
mkdirSync(OUT, { recursive: true });

const server = await createServer({
  configFile: join(import.meta.dirname, '..', 'harness', 'vite.config.ts'),
  server: { port: 5199, strictPort: true },
  logLevel: 'error',
});
await server.listen();

const browser = await chromium.launch({ channel: 'chrome' });
interface Result {
  scenario: string;
  pixels: number;
  different: number;
  percent: number;
  pass: boolean;
}
const results: Result[] = [];

type Prepare = (page: Page, root: 'vue' | 'react') => Promise<void>;
const scenarios: { name: string; theme: 'light' | 'dark'; prepare?: Prepare }[] = [];
for (const theme of ['light', 'dark'] as const) {
  scenarios.push({ name: `${theme} · static`, theme });
  scenarios.push({
    name: `${theme} · hover first button`,
    theme,
    prepare: (page, root) => page.locator(`#${root} button`).first().hover(),
  });
  scenarios.push({
    name: `${theme} · keyboard focus first button`,
    theme,
    prepare: async (page, root) => {
      await page.keyboard.press('Shift'); // last input = keyboard, so :focus-visible matches
      await page.locator(`#${root} button`).first().focus();
    },
  });
  scenarios.push({
    name: `${theme} · pressed first button`,
    theme,
    prepare: async (page, root) => {
      await page.locator(`#${root} button`).first().hover();
      await page.mouse.down();
    },
  });
}

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: 900, height: 1800 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5199/');
    await page.evaluate(
      (t) => document.documentElement.setAttribute('data-tessen-theme', t),
      scenario.theme,
    );
    await page.waitForSelector('#vue button');
    await page.waitForSelector('#react button');
    await page.evaluate(() => document.fonts.ready);
    // Freeze transitions and the spinner so frames are deterministic.
    await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });

    const shots: Record<'vue' | 'react', PNG> = {} as never;
    for (const root of ['vue', 'react'] as const) {
      await page.mouse.move(0, 0);
      await page.mouse.up();
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await scenario.prepare?.(page, root);
      const buffer = await page.locator(`#${root}`).screenshot();
      shots[root] = PNG.sync.read(buffer);
      writeFileSync(join(OUT, `${slug(scenario.name)}.${root}.png`), buffer);
    }
    const { width, height } = shots.vue;
    if (shots.react.width !== width || shots.react.height !== height) {
      results.push({
        scenario: scenario.name,
        pixels: width * height,
        different: width * height,
        percent: 100,
        pass: false,
      });
      await context.close();
      continue;
    }
    const diff = new PNG({ width, height });
    const different = pixelmatch(shots.vue.data, shots.react.data, diff.data, width, height, {
      threshold: 0.1,
    });
    const percent = (different / (width * height)) * 100;
    if (different > 0)
      writeFileSync(join(OUT, `${slug(scenario.name)}.diff.png`), PNG.sync.write(diff));
    results.push({
      scenario: scenario.name,
      pixels: width * height,
      different,
      percent,
      pass: percent <= THRESHOLD_PERCENT,
    });
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

function slug(text: string) {
  return text.replaceAll(/[^a-z0-9]+/gi, '-').toLowerCase();
}

console.log(
  '\nVisual parity Vue vs React (threshold <= ' + THRESHOLD_PERCENT + ' % different pixels)\n',
);
for (const r of results) {
  console.log(
    `${r.pass ? 'PASS' : 'FAIL'}  ${r.scenario.padEnd(36)} ${String(r.different).padStart(6)} / ${r.pixels} px  (${r.percent.toFixed(4)} %)`,
  );
}
process.exit(results.every((r) => r.pass) ? 0 : 1);
