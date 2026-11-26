import { describe, expect, it } from 'vitest';
import { kazakhDateFormat, kazakhNumberFormat, lacksIntlData } from './locale-data';

// Node ships full ICU, so its `kk` output is the oracle for the built-in fallback
// that browsers with trimmed ICU (e.g. some Chromium builds) depend on.
const oracle = (o: Intl.DateTimeFormatOptions, t: number) =>
  new Intl.DateTimeFormat('kk', o).format(t);

describe('Kazakh fallback formatting', () => {
  it('detects real Intl data in Node', () => {
    expect(lacksIntlData('kk')).toBe(false);
    expect(lacksIntlData('ru-RU')).toBe(false);
  });

  const combos: Intl.DateTimeFormatOptions[] = [
    { month: 'short' },
    { month: 'long' },
    { month: 'short', day: 'numeric' },
    { month: 'long', day: 'numeric' },
    { year: 'numeric', month: 'short', day: 'numeric' },
    { year: 'numeric', month: 'long', day: 'numeric' },
    { year: 'numeric', month: 'short' },
    { year: 'numeric' },
    { hour: 'numeric', minute: '2-digit' },
    { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
    { weekday: 'short' },
    { weekday: 'long' },
  ];

  it('matches full-ICU kk output for every month, weekday and option set used by charts', () => {
    for (let m = 0; m < 12; m++) {
      for (const day of [1, 9, 28]) {
        const t = Date.UTC(2025, m, day, 14, 5);
        for (const c of combos) {
          const opts = { ...c, timeZone: 'UTC' };
          expect(kazakhDateFormat(opts).format(t), JSON.stringify(c)).toBe(oracle(opts, t));
        }
      }
    }
  });

  it('matches full-ICU kk number formatting', () => {
    const cases: Array<[Intl.NumberFormatOptions, number]> = [
      [{}, 20078.5],
      [{}, -1234.5],
      [{ maximumFractionDigits: 0 }, 1234567],
      [{ style: 'percent' }, 0.256],
      [{ style: 'percent', maximumFractionDigits: 1 }, 0.256],
      [{ style: 'currency', currency: 'KZT', currencyDisplay: 'narrowSymbol' }, 1500],
      [{ notation: 'compact', maximumFractionDigits: 1 }, 12_500],
      [{ notation: 'compact', maximumFractionDigits: 1 }, 1_250_000],
      [{ notation: 'compact', maximumFractionDigits: 1 }, 3.2e9],
      [{ notation: 'compact', maximumFractionDigits: 1 }, 4e12],
      [{ notation: 'compact', maximumFractionDigits: 1 }, 950],
    ];
    for (const [o, v] of cases) {
      expect(kazakhNumberFormat(o).format(v), `${JSON.stringify(o)} ${v}`).toBe(
        new Intl.NumberFormat('kk', o).format(v),
      );
    }
  });
});
