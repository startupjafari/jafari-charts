import { formatNumber } from '@startupjafari/charts';
import type { Lang } from './lang';

/**
 * Russian plural form: one (1, 21, 101), few (2–4, 22–24) or many (0, 5–20, 11–14, 25…).
 * `ruPlural(5, ['диаграмма', 'диаграммы', 'диаграмм'])` → `диаграмм`.
 */
export function ruPlural(n: number, [one, few, many]: readonly [string, string, string]): string {
  const abs = Math.abs(Math.trunc(n));
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

let kkRules: Intl.PluralRules | null | undefined;

/**
 * Kazakh plural category from `Intl.PluralRules('kk')` (CLDR: `one` for 1, `other` for the
 * rest). Some browsers ship an ICU without Kazakh; the same CLDR rule is applied then.
 */
export function kkPluralCategory(n: number): 'one' | 'other' {
  if (kkRules === undefined) {
    kkRules = Intl.PluralRules.supportedLocalesOf(['kk']).length
      ? new Intl.PluralRules('kk')
      : null;
  }
  if (kkRules) return kkRules.select(n) === 'one' ? 'one' : 'other';
  return n === 1 ? 'one' : 'other';
}

/**
 * Kazakh plural form. A noun after a numeral stays singular in Kazakh (`5 диаграмма`), so
 * both forms are usually the same word; the split exists for phrases that do change.
 */
export function kkPlural(n: number, [one, other]: readonly [string, string]): string {
  return kkPluralCategory(n) === 'one' ? one : other;
}

/** English plural form: `enPlural(2, ['chart', 'charts'])` → `charts`. */
export function enPlural(n: number, [one, other]: readonly [string, string]): string {
  return n === 1 ? one : other;
}

/**
 * A number in the interface language (`10,000` / `10 000`). Kazakh falls back to built-in
 * CLDR data where the browser's ICU lacks it, exactly like the charts.
 */
export function formatNum(lang: Lang, n: number, options?: Intl.NumberFormatOptions): string {
  return formatNumber(n, { locale: lang, maximumFractionDigits: 0, ...options });
}
