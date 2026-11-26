/**
 * Some browsers ship a trimmed ICU: Chromium builds report `kk` (Kazakh) as
 * supported but format dates as "M09 3" and numbers with English separators.
 * This module detects locales without real Intl data and substitutes built-in
 * Kazakh formatting (matching full-ICU CLDR output), or English otherwise.
 */

export interface Formatter<V> {
  format(value: V): string;
}

const missing = new Map<string, boolean>();

/** True when Intl has no real data for the locale's language (root-locale output). */
export function lacksIntlData(locale: string): boolean {
  const lang = locale.toLowerCase().split(/[-_]/)[0] ?? locale;
  let result = missing.get(lang);
  if (result === undefined) {
    try {
      const month = new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' }).format(
        Date.UTC(2025, 0, 15),
      );
      result = /^M\d{1,2}$/.test(month);
    } catch {
      result = true;
    }
    missing.set(lang, result);
  }
  return result;
}

const KK_MONTHS_LONG = [
  'қаңтар',
  'ақпан',
  'наурыз',
  'сәуір',
  'мамыр',
  'маусым',
  'шілде',
  'тамыз',
  'қыркүйек',
  'қазан',
  'қараша',
  'желтоқсан',
];
const KK_MONTHS_SHORT = [
  'қаң.',
  'ақп.',
  'нау.',
  'сәу.',
  'мам.',
  'мау.',
  'шіл.',
  'там.',
  'қыр.',
  'қаз.',
  'қар.',
  'жел.',
];
const KK_WEEKDAYS_LONG = [
  'жексенбі',
  'дүйсенбі',
  'сейсенбі',
  'сәрсенбі',
  'бейсенбі',
  'жұма',
  'сенбі',
];
const KK_WEEKDAYS_SHORT = ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'];
const KK_COMPACT: Array<[number, string]> = [
  [1e12, 'трлн'],
  [1e9, 'млрд'],
  [1e6, 'млн'],
  [1e3, 'мың'],
];

/** Kazakh date formatting for the option combinations charts use (CLDR `kk` patterns). */
export function kazakhDateFormat(
  options: Intl.DateTimeFormatOptions = {},
): Formatter<number | Date> {
  const utc = options.timeZone === 'UTC';
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    format(value) {
      const d = new Date(typeof value === 'number' ? value : value.getTime());
      const y = utc ? d.getUTCFullYear() : d.getFullYear();
      const m = utc ? d.getUTCMonth() : d.getMonth();
      const day = utc ? d.getUTCDate() : d.getDate();
      const wd = utc ? d.getUTCDay() : d.getDay();
      const h = utc ? d.getUTCHours() : d.getHours();
      const min = utc ? d.getUTCMinutes() : d.getMinutes();
      const sec = utc ? d.getUTCSeconds() : d.getSeconds();
      const ms = utc ? d.getUTCMilliseconds() : d.getMilliseconds();

      const hasDay = options.day !== undefined;
      const hasYear = options.year !== undefined;
      const year = options.year === '2-digit' ? pad(y % 100) : String(y);
      let month = '';
      if (options.month === 'long') month = KK_MONTHS_LONG[m] as string;
      else if (options.month === 'short' || options.month === 'narrow')
        month = KK_MONTHS_SHORT[m] as string;
      else if (options.month === 'numeric') month = String(m + 1);
      else if (options.month === '2-digit') month = pad(m + 1);
      const dayText = options.day === '2-digit' ? pad(day) : String(day);

      let date: string;
      if (options.month === 'numeric' || options.month === '2-digit') {
        date = [hasDay ? pad(day) : '', month, hasYear ? year : ''].filter(Boolean).join('.');
      } else if (month) {
        // Standalone month names are capitalised in CLDR `kk`.
        const standalone =
          !hasDay && !hasYear && options.month === 'long'
            ? month.charAt(0).toUpperCase() + month.slice(1)
            : month;
        const body = hasDay ? `${dayText} ${month}` : standalone;
        date = hasYear ? `${year} ж. ${body}` : body;
      } else {
        date = [hasYear ? year : '', hasDay ? dayText : ''].filter(Boolean).join(' ');
      }
      if (options.weekday) {
        const name = options.weekday === 'long' ? KK_WEEKDAYS_LONG[wd] : KK_WEEKDAYS_SHORT[wd];
        date = date ? `${name}, ${date}` : (name as string);
      }

      let time = '';
      if (
        options.hour !== undefined ||
        options.minute !== undefined ||
        options.second !== undefined
      ) {
        const parts: string[] = [];
        if (options.hour !== undefined) parts.push(pad(h));
        if (options.minute !== undefined) parts.push(pad(min));
        if (options.second !== undefined) parts.push(pad(sec));
        time = parts.join(':');
        if (options.fractionalSecondDigits)
          time += `.${String(ms).padStart(3, '0').slice(0, options.fractionalSecondDigits)}`;
      }
      return date && time ? `${date}, ${time}` : date || time;
    },
  };
}

/**
 * Kazakh number formatting: grouping and decimals as in `ru` (non-breaking
 * space, comma), percent without a space, compact suffixes мың/млн/млрд/трлн.
 */
export function kazakhNumberFormat(options: Intl.NumberFormatOptions = {}): Formatter<number> {
  const { notation, ...rest } = options;
  if (notation === 'compact') {
    const base = new Intl.NumberFormat('ru', {
      ...rest,
      maximumFractionDigits: rest.maximumFractionDigits ?? 1,
    });
    return {
      format(value) {
        const abs = Math.abs(value);
        for (const [unit, suffix] of KK_COMPACT) {
          // Round first so 999 950 becomes "1 млн", not "1 000 мың".
          if (abs >= unit * 0.99995) return `${base.format(value / unit)}\u00a0${suffix}`;
        }
        return base.format(value);
      },
    };
  }
  const f = new Intl.NumberFormat('ru', rest);
  if (rest.style === 'percent') {
    return {
      format: (value) =>
        f
          .formatToParts(value)
          .filter((p) => !(p.type === 'literal' && /\s/.test(p.value)))
          .map((p) => p.value)
          .join(''),
    };
  }
  return f;
}

/** Locale to hand to Intl, or the built-in formatter to use instead. */
export function resolveFormatLocale(locale: string): { builtin: 'kk' | null; locale: string } {
  if (!lacksIntlData(locale)) return { builtin: null, locale };
  const lang = locale.toLowerCase().split(/[-_]/)[0];
  if (lang === 'kk') return { builtin: 'kk', locale };
  return { builtin: null, locale: 'en' };
}
