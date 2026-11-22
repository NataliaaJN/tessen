import type { Page } from '@playwright/test';
import type { SceneName } from '../harness/scene-names.ts';

export const frameworks = ['vue', 'react'] as const;
export type Framework = (typeof frameworks)[number];

/** Opens one scene in one framework and waits until it is mounted and painted. */
export async function openScene(
  page: Page,
  framework: Framework,
  scene: SceneName,
  theme: 'light' | 'dark' = 'light',
) {
  await page.goto(`/?scene=${scene}&fw=${framework}&theme=${theme}`);
  await page.locator('#root[data-ready="true"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
