import type { Page } from '@playwright/test';

/** Opens a playground scene with animations off and fails on console errors. */
export async function openScene(page: Page, scene: string, params = '') {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`/?scene=${scene}&animation=off${params}`);
  await page.locator('.jc-root').first().waitFor();
  return errors;
}

/** Bounding box of a card's chart surface. */
export async function surfaceBox(page: Page, testId: string) {
  const box = await page.getByTestId(testId).locator('svg.jc-surface').last().boundingBox();
  if (!box) throw new Error(`No surface in ${testId}`);
  return box;
}
