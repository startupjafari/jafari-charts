import { expect, test, type Page } from '@playwright/test';
import { openScene } from './helpers';

/** Product names and formats that stay as they are in every language. */
const ALLOWED = new Set(['Jafari', 'Charts', 'SVG', 'Canvas']);

/**
 * Latin words in the interface chrome: everything outside the charts (`.jc-root`, demo data),
 * key caps, code and the language switch's own `lang`-tagged labels, plus every
 * `aria-label` and `title` there and the document title.
 */
async function latinWordsInChrome(page: Page): Promise<string[]> {
  const words = await page.evaluate(() => {
    // The language switch labels each language in that language (`lang` attribute).
    const skip = (el: Element) => el.closest('.jc-root, kbd, code, body [lang]') !== null;
    const texts: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || skip(parent) || parent.closest('script, style')) continue;
      texts.push(node.textContent ?? '');
    }
    for (const el of document.body.querySelectorAll('[aria-label], [title]')) {
      if (skip(el)) continue;
      texts.push(el.getAttribute('aria-label') ?? '', el.getAttribute('title') ?? '');
    }
    texts.push(document.title);
    return texts.join(' ').match(/[A-Za-z]{2,}/g) ?? [];
  });
  return [...new Set(words)].filter((w) => !ALLOWED.has(w));
}

test.describe('interface languages', () => {
  test('English by default, with no stored choice', async ({ page }) => {
    await openScene(page, 'gallery');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gallery');
    await expect(page.getByRole('button', { name: 'EN', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  for (const [lang, titles] of [
    ['ru', { gallery: 'Галерея', polar: 'Полярные диаграммы' }],
    ['kk', { gallery: 'Галерея', polar: 'Полярлық диаграмма' }],
  ] as const) {
    test(`${lang}: no English left in the chrome of the gallery and polar scenes`, async ({
      page,
    }) => {
      for (const scene of ['gallery', 'polar'] as const) {
        const errors = await openScene(page, scene, `&lang=${lang}`);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[scene]);
        await expect(page).toHaveTitle(new RegExp(`^${titles[scene]} · `));
        expect(await latinWordsInChrome(page), `${lang} ${scene}`).toEqual([]);
        expect(errors).toEqual([]);
      }
    });
  }

  test('the switch translates in place, is remembered and ?lang= overrides it', async ({
    page,
  }) => {
    await openScene(page, 'gallery');
    await page.getByRole('button', { name: 'RU', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Галерея');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    // Card test ids stay English; titles are translated.
    await expect(page.getByTestId('Bar chart').getByRole('heading')).toHaveText(
      'Столбчатая диаграмма',
    );
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Галерея');
    await page.getByRole('link', { name: 'Тепловая карта' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Тепловая карта');
    await page.getByRole('button', { name: 'ҚАЗ', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Жылу картасы');
    await openScene(page, 'gallery', '&lang=en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gallery');
  });

  test('chart numbers and dates follow the interface language unless a locale is picked', async ({
    page,
  }) => {
    const donut = page.getByTestId('Donut chart');
    await openScene(page, 'polar', '&lang=kk');
    await expect(donut.locator('.jc-center-label')).toHaveText('Барлығы');
    await expect(donut.locator('.jc-center-value')).toHaveText('20 078');
    await openScene(page, 'polar', '&lang=ru&locale=en');
    await expect(donut.locator('.jc-center-label')).toHaveText('Total');
    await openScene(page, 'polar', '&lang=ru');
    await expect(donut.locator('.jc-center-label')).toHaveText('Итого');
    // Picking a locale in the sidebar overrides the interface language.
    await page.getByRole('combobox', { name: 'Локаль чисел и дат' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(donut.locator('.jc-center-label')).toHaveText('Total');
    await expect(page).toHaveURL(/locale=en/);
  });

  test('the phone drawer has the switch too', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await openScene(page, 'polar');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog', { name: 'Navigation' });
    await drawer.getByRole('button', { name: 'ҚАЗ', exact: true }).click();
    const translated = page.getByRole('dialog', { name: 'Навигация' });
    await expect(translated).toBeVisible();
    await expect(translated.getByRole('link', { name: 'Полярлық диаграмма' })).toBeVisible();
    // The page behind the modal drawer is hidden from assistive tech until it closes.
    await page.getByRole('button', { name: 'Навигацияны жабу' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Полярлық диаграмма');
    await expect(page.getByRole('button', { name: 'Навигацияны ашу' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
