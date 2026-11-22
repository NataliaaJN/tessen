import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { sceneNames, type SceneName } from '../harness/scene-names.ts';
import { openScene, type Framework } from './harness.ts';

/**
 * Visual parity Vue <-> React (docs/planning/06 §4): the same scene is rendered by both packages
 * in the same browser and the two screenshots are diffed. No stored baselines: fonts and
 * anti-aliasing differ per OS, but a difference between the two frameworks never should.
 */
const THRESHOLD_PERCENT = 0.1;
const OUT = join(import.meta.dirname, '..', '.out', 'parity');
mkdirSync(OUT, { recursive: true });

// Reduced motion plus the stylesheet below freeze transitions, so frames are deterministic.
test.use({ reducedMotion: 'reduce' });

type Prepare = (page: Page, framework: Framework) => Promise<void>;

const states: { name: string; scenes: SceneName[]; prepare?: Prepare }[] = [
  {
    name: 'static',
    scenes: sceneNames.filter((n) => n !== 'tooltip'),
  },
  {
    name: 'tooltip-open',
    scenes: ['tooltip'],
    prepare: async (page) => {
      await page.keyboard.press('Shift');
      await page.keyboard.press('Tab');
      await page.getByRole('tooltip').waitFor();
    },
  },
  {
    name: 'keyboard-focus',
    scenes: ['buttons', 'forms'],
    prepare: async (page) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
    },
  },
  {
    name: 'tabs-second',
    scenes: ['tabs'],
    prepare: async (page) => {
      await page.getByRole('tab', { name: 'Team' }).click();
      await page.mouse.move(0, 0);
    },
  },
];

async function capture(page: Page, framework: Framework, scene: SceneName, theme: string) {
  await openScene(page, framework, scene, theme as 'light' | 'dark');
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  return page;
}

for (const theme of ['light', 'dark']) {
  for (const state of states) {
    for (const scene of state.scenes) {
      test(`${scene} · ${state.name} · ${theme}: Vue and React render the same`, async ({
        browser,
      }) => {
        const shots: Partial<Record<Framework, PNG>> = {};
        for (const framework of ['vue', 'react'] as const) {
          const context = await browser.newContext({
            viewport: { width: 800, height: 900 },
            deviceScaleFactor: 1,
            reducedMotion: 'reduce',
          });
          const page = await capture(await context.newPage(), framework, scene, theme);
          await state.prepare?.(page, framework);
          const buffer = await page.screenshot({ fullPage: true });
          const name = `${scene}.${state.name}.${theme}`;
          writeFileSync(join(OUT, `${name}.${framework}.png`), buffer);
          shots[framework] = PNG.sync.read(buffer);
          await context.close();
        }
        const vue = shots.vue!;
        const react = shots.react!;
        expect(
          { width: react.width, height: react.height },
          'both frameworks lay out to the same size',
        ).toEqual({ width: vue.width, height: vue.height });
        const diff = new PNG({ width: vue.width, height: vue.height });
        const different = pixelmatch(vue.data, react.data, diff.data, vue.width, vue.height, {
          threshold: 0.1,
        });
        const percent = (different / (vue.width * vue.height)) * 100;
        if (different > 0)
          writeFileSync(
            join(OUT, `${scene}.${state.name}.${theme}.diff.png`),
            PNG.sync.write(diff),
          );
        expect(percent, `${different} different pixels`).toBeLessThanOrEqual(THRESHOLD_PERCENT);
      });
    }
  }
}
