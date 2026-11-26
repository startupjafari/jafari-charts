/**
 * Coerces raw input into a finite number. Everything that cannot be plotted
 * (null, undefined, NaN, ±Infinity, empty or non-numeric strings, objects)
 * becomes NaN, which every geometry generator treats as a gap.
 */
export function toNumber(value: unknown): number {
  switch (typeof value) {
    case 'number':
      return Number.isFinite(value) ? value : Number.NaN;
    case 'bigint': {
      const n = Number(value);
      return Number.isFinite(n) ? n : Number.NaN;
    }
    case 'string': {
      const s = value.trim();
      if (s === '') return Number.NaN;
      const n = Number(s);
      return Number.isFinite(n) ? n : Number.NaN;
    }
    case 'object':
      if (value instanceof Date) {
        const t = value.getTime();
        return Number.isFinite(t) ? t : Number.NaN;
      }
      return Number.NaN;
    default:
      return Number.NaN;
  }
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

const ISO_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;
const ISO_DATETIME =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

/** True for strings shaped like ISO dates ("2025-03-01", "2025-03", "2025-03-01T10:00Z"). */
export function isDateString(value: string): boolean {
  return ISO_DATE.test(value) || ISO_DATETIME.test(value);
}

/**
 * Converts dates, timestamps and ISO strings to epoch milliseconds (NaN when invalid).
 * Date-only strings are read as local midnight so "2025-03-01" never shifts to the
 * previous day in negative UTC offsets.
 */
export function toTime(value: unknown): number {
  if (value instanceof Date) return toNumber(value);
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value === 'string') {
    const s = value.trim();
    const m = ISO_DATE.exec(s);
    if (m) {
      const t = new Date(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1).getTime();
      return Number.isFinite(t) ? t : Number.NaN;
    }
    if (s === '') return Number.NaN;
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : Number.NaN;
  }
  return Number.NaN;
}

/** Human-readable label for a category value. */
export function toLabel(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
