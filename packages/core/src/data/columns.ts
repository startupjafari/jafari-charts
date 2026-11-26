import { isDateString, toLabel, toNumber, toTime } from './values';

/** Reads a field by key or computes it with a function. */
export type Accessor<T, V = unknown> = (keyof T & string) | ((datum: T, index: number) => V);

export function access<T, V = unknown>(
  datum: T,
  accessor: Accessor<T, V>,
  index: number,
): V | unknown {
  return typeof accessor === 'function'
    ? accessor(datum, index)
    : (datum as Record<string, unknown>)[accessor];
}

export type DimensionType = 'number' | 'time' | 'category';

// Integer timestamps between 2000-01-01 and 2100-01-01 (ms) are read as time.
const EPOCH_MS_MIN = 946_684_800_000;
const EPOCH_MS_MAX = 4_102_444_800_000;

/**
 * Infers how the x dimension should be scaled from the first defined values.
 * Dates, ISO date strings and integer epoch-millisecond numbers become `time`.
 */
export function detectDimensionType<T>(data: readonly T[], accessor: Accessor<T>): DimensionType {
  let sawNumber = false;
  let allEpochMs = true;
  for (let i = 0, checked = 0; i < data.length && checked < 20; i++) {
    const v = access(data[i] as T, accessor, i);
    if (v === null || v === undefined) continue;
    checked++;
    if (v instanceof Date) return 'time';
    if (typeof v === 'string') return isDateString(v.trim()) ? 'time' : 'category';
    if (typeof v === 'number' || typeof v === 'bigint') {
      sawNumber = true;
      const n = Number(v);
      if (!Number.isInteger(n) || n < EPOCH_MS_MIN || n > EPOCH_MS_MAX) allEpochMs = false;
    } else return 'category';
  }
  if (!sawNumber) return 'category';
  return allEpochMs ? 'time' : 'number';
}

/** Extracts a numeric column as a Float64Array; invalid values become NaN (gaps). */
export function numericColumn<T>(data: readonly T[], accessor: Accessor<T>): Float64Array {
  const out = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = toNumber(access(data[i] as T, accessor, i));
  return out;
}

/** Extracts a time column (epoch ms); invalid values become NaN. */
export function timeColumn<T>(data: readonly T[], accessor: Accessor<T>): Float64Array {
  const out = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = toTime(access(data[i] as T, accessor, i));
  return out;
}

export function labelColumn<T>(data: readonly T[], accessor: Accessor<T>): string[] {
  const out: string[] = new Array<string>(data.length);
  for (let i = 0; i < data.length; i++) out[i] = toLabel(access(data[i] as T, accessor, i));
  return out;
}

/** Count of finite values in a column. */
export function countDefined(values: ArrayLike<number>): number {
  let n = 0;
  for (let i = 0; i < values.length; i++) if (Number.isFinite(values[i] as number)) n++;
  return n;
}
