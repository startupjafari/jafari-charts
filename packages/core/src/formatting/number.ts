import { precisionForStep } from '../scales/ticks';

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  locale?: string;
}

const formatters = new Map<string, Intl.NumberFormat>();

/** Cached `Intl.NumberFormat` (constructing one costs far more than formatting). */
export function getNumberFormat(
  locale = 'en',
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    if (formatters.size > 200) formatters.clear();
    formatters.set(key, f);
  }
  return f;
}

/** Placeholder printed for missing values. */
export const MISSING_VALUE = '—';

export function formatNumber(
  value: number | null | undefined,
  options: NumberFormatOptions = {},
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return MISSING_VALUE;
  const { locale = 'en', ...rest } = options;
  return getNumberFormat(locale, rest).format(Object.is(value, -0) ? 0 : value);
}

/** 1 234 567 → "1.2M" (en), "1,2 млн" (ru), "1,2 млн" (kk). */
export function formatCompact(
  value: number | null | undefined,
  locale = 'en',
  maximumFractionDigits = 1,
): string {
  return formatNumber(value, { locale, notation: 'compact', maximumFractionDigits });
}

/** Formats a ratio (0.25 → "25%"). */
export function formatPercent(
  value: number | null | undefined,
  locale = 'en',
  maximumFractionDigits = 1,
): string {
  return formatNumber(value, { locale, style: 'percent', maximumFractionDigits });
}

export function formatCurrency(
  value: number | null | undefined,
  currency: string,
  locale = 'en',
  options: Intl.NumberFormatOptions = {},
): string {
  // Narrow symbols (₸, $, €) read better in charts than ISO codes ("KZT").
  return formatNumber(value, {
    locale,
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    ...options,
  });
}

/**
 * Builds a formatter for a set of axis ticks: uses just enough decimals to tell
 * neighbouring ticks apart and switches to compact notation for large magnitudes.
 */
export function createTickFormat(
  ticks: readonly number[],
  locale = 'en',
): (value: number) => string {
  let maxAbs = 0;
  for (const t of ticks) maxAbs = Math.max(maxAbs, Math.abs(t));
  const step = ticks.length > 1 ? Math.abs((ticks[1] as number) - (ticks[0] as number)) : 0;
  if (maxAbs >= 1e4) {
    // Compact notation: decimals needed relative to the compact unit.
    const unit = maxAbs >= 1e12 ? 1e12 : maxAbs >= 1e9 ? 1e9 : maxAbs >= 1e6 ? 1e6 : 1e3;
    const digits = step > 0 ? Math.min(3, precisionForStep(step / unit)) : 1;
    const f = getNumberFormat(locale, {
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
    return (v) => f.format(v);
  }
  const digits = step > 0 ? Math.min(10, precisionForStep(step)) : 2;
  const f = getNumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits });
  return (v) => f.format(Object.is(v, -0) ? 0 : v);
}

/** Auto formatter for single values (tooltips): compact above 1M, up to 2 decimals otherwise. */
export function formatAuto(value: number | null | undefined, locale = 'en'): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return MISSING_VALUE;
  const abs = Math.abs(value);
  if (abs >= 1e6) return formatCompact(value, locale, 2);
  return formatNumber(value, { locale, maximumFractionDigits: abs >= 100 ? 0 : abs >= 1 ? 2 : 4 });
}
