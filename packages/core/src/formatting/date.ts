export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Cached `Intl.DateTimeFormat`. */
export function getDateFormat(
  locale = 'en',
  options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    if (formatters.size > 200) formatters.clear();
    formatters.set(key, f);
  }
  return f;
}

export function formatDate(
  value: number | Date | null | undefined,
  options: DateFormatOptions = {},
): string {
  if (value === null || value === undefined) return '—';
  const time = typeof value === 'number' ? value : value.getTime();
  if (!Number.isFinite(time)) return '—';
  const { locale = 'en', ...rest } = options;
  return getDateFormat(locale, rest).format(time);
}

/**
 * Chooses a tooltip date format matching the data resolution: values that are all
 * midnight get a date-only label, otherwise time is included.
 */
export function inferDateFormat(times: ArrayLike<number>, utc = false): Intl.DateTimeFormatOptions {
  let hasTime = false;
  let hasSeconds = false;
  const n = Math.min(times.length, 500);
  for (let i = 0; i < n; i++) {
    const t = times[i] as number;
    if (!Number.isFinite(t)) continue;
    const d = new Date(t);
    const h = utc ? d.getUTCHours() : d.getHours();
    const m = utc ? d.getUTCMinutes() : d.getMinutes();
    const s = utc ? d.getUTCSeconds() : d.getSeconds();
    if (h !== 0 || m !== 0) hasTime = true;
    if (s !== 0) hasSeconds = true;
  }
  const base: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  if (utc) base.timeZone = 'UTC';
  if (hasSeconds) return { ...base, hour: 'numeric', minute: '2-digit', second: '2-digit' };
  if (hasTime) return { ...base, hour: 'numeric', minute: '2-digit' };
  return base;
}
