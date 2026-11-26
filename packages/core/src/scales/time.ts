import type { Extent } from '../types';
import { formatDate } from '../formatting/date';
import { linearTicks, tickStep } from './ticks';

export type TimeUnit =
  'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TimeInterval {
  unit: TimeUnit;
  step: number;
}

export const DURATION: Record<TimeUnit, number> = {
  millisecond: 1,
  second: 1e3,
  minute: 6e4,
  hour: 36e5,
  day: 864e5,
  week: 6048e5,
  month: 2592e6,
  year: 31536e6,
};

const CANDIDATES: readonly TimeInterval[] = [
  { unit: 'second', step: 1 },
  { unit: 'second', step: 5 },
  { unit: 'second', step: 15 },
  { unit: 'second', step: 30 },
  { unit: 'minute', step: 1 },
  { unit: 'minute', step: 5 },
  { unit: 'minute', step: 15 },
  { unit: 'minute', step: 30 },
  { unit: 'hour', step: 1 },
  { unit: 'hour', step: 3 },
  { unit: 'hour', step: 6 },
  { unit: 'hour', step: 12 },
  { unit: 'day', step: 1 },
  { unit: 'day', step: 2 },
  { unit: 'week', step: 1 },
  { unit: 'month', step: 1 },
  { unit: 'month', step: 3 },
  { unit: 'year', step: 1 },
];

export interface TimeOptions {
  /** Use UTC instead of local time for tick alignment and labels. */
  utc?: boolean;
  /** First day of the week for weekly ticks: 0 = Sunday, 1 = Monday. */
  weekStartsOn?: number;
}

/** Picks the calendar interval whose length is closest to `span / count`. */
export function chooseTimeInterval(span: number, count: number): TimeInterval {
  const target = Math.abs(span) / Math.max(1, count);
  if (target < DURATION.second) {
    return { unit: 'millisecond', step: Math.max(1, tickStep(0, Math.abs(span), count)) };
  }
  if (target > DURATION.year) {
    return {
      unit: 'year',
      step: Math.max(1, Math.round(tickStep(0, span / DURATION.year, count))),
    };
  }
  let best = CANDIDATES[0] as TimeInterval;
  let bestErr = Number.POSITIVE_INFINITY;
  for (const c of CANDIDATES) {
    const err = Math.abs(Math.log((DURATION[c.unit] * c.step) / target));
    if (err < bestErr) {
      bestErr = err;
      best = c;
    }
  }
  return best;
}

interface DateParts {
  get(d: Date, f: 'FullYear' | 'Month' | 'Date' | 'Day' | 'Hours' | 'Minutes' | 'Seconds'): number;
  set(
    d: Date,
    f: 'FullYear' | 'Month' | 'Date' | 'Hours' | 'Minutes' | 'Seconds' | 'Milliseconds',
    v: number,
  ): void;
}

const LOCAL: DateParts = {
  get: (d, f) => d[`get${f}`](),
  set: (d, f, v) => void d[`set${f}`](v),
};
const UTC: DateParts = {
  get: (d, f) => d[`getUTC${f}`](),
  set: (d, f, v) => void d[`setUTC${f}`](v),
};

/** Rounds `time` down to the start of its interval. */
export function floorTime(time: number, interval: TimeInterval, options: TimeOptions = {}): number {
  const { unit, step } = interval;
  if (unit === 'millisecond') return Math.floor(time / step) * step;
  const p = options.utc ? UTC : LOCAL;
  const d = new Date(time);
  p.set(d, 'Milliseconds', 0);
  if (unit === 'second') {
    p.set(d, 'Seconds', Math.floor(p.get(d, 'Seconds') / step) * step);
    return d.getTime();
  }
  p.set(d, 'Seconds', 0);
  if (unit === 'minute') {
    p.set(d, 'Minutes', Math.floor(p.get(d, 'Minutes') / step) * step);
    return d.getTime();
  }
  p.set(d, 'Minutes', 0);
  if (unit === 'hour') {
    p.set(d, 'Hours', Math.floor(p.get(d, 'Hours') / step) * step);
    return d.getTime();
  }
  p.set(d, 'Hours', 0);
  if (unit === 'day') {
    const date = p.get(d, 'Date');
    p.set(d, 'Date', date - ((date - 1) % step));
    return d.getTime();
  }
  if (unit === 'week') {
    const weekStart = options.weekStartsOn ?? 1;
    const back = (p.get(d, 'Day') - weekStart + 7) % 7;
    p.set(d, 'Date', p.get(d, 'Date') - back);
    return d.getTime();
  }
  p.set(d, 'Date', 1);
  if (unit === 'month') {
    p.set(d, 'Month', Math.floor(p.get(d, 'Month') / step) * step);
    return d.getTime();
  }
  p.set(d, 'Month', 0);
  p.set(d, 'FullYear', Math.floor(p.get(d, 'FullYear') / step) * step);
  return d.getTime();
}

/** Adds `count` intervals to `time`. */
export function offsetTime(
  time: number,
  interval: TimeInterval,
  count = 1,
  options: TimeOptions = {},
): number {
  const { unit, step } = interval;
  const n = step * count;
  if (unit === 'millisecond') return time + n;
  const p = options.utc ? UTC : LOCAL;
  const d = new Date(time);
  switch (unit) {
    case 'second':
      return time + n * DURATION.second;
    case 'minute':
      return time + n * DURATION.minute;
    case 'hour':
      // Hours via the calendar keep ticks on the hour across DST shifts.
      p.set(d, 'Hours', p.get(d, 'Hours') + n);
      break;
    case 'day':
      p.set(d, 'Date', p.get(d, 'Date') + n);
      break;
    case 'week':
      p.set(d, 'Date', p.get(d, 'Date') + n * 7);
      break;
    case 'month':
      p.set(d, 'Month', p.get(d, 'Month') + n);
      break;
    case 'year':
      p.set(d, 'FullYear', p.get(d, 'FullYear') + n);
      break;
  }
  return d.getTime();
}

/** Calendar-aligned tick values (ms timestamps) within `[start, stop]`. */
export function timeTicks(
  start: number,
  stop: number,
  count = 6,
  options: TimeOptions = {},
): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(stop)) return [];
  const reverse = stop < start;
  const lo = reverse ? stop : start;
  const hi = reverse ? start : stop;
  if (lo === hi) return [lo];
  const interval = chooseTimeInterval(hi - lo, count);
  let ticks: number[];
  if (interval.unit === 'millisecond') {
    ticks = linearTicks(lo, hi, count);
  } else if (interval.unit === 'day' && interval.step > 1) {
    // Day steps restart on the 1st of each month, like a printed calendar.
    ticks = [];
    const daily = { unit: 'day' as const, step: 1 };
    let t = floorTime(lo, daily, options);
    if (t < lo) t = offsetTime(t, daily, 1, options);
    const p = options.utc ? UTC : LOCAL;
    for (let guard = 0; t <= hi && guard < 10000; guard++) {
      if ((p.get(new Date(t), 'Date') - 1) % interval.step === 0) ticks.push(t);
      t = offsetTime(t, daily, 1, options);
    }
  } else {
    ticks = [];
    let t = floorTime(lo, interval, options);
    if (t < lo) t = offsetTime(t, interval, 1, options);
    for (let guard = 0; t <= hi && guard < 10000; guard++) {
      ticks.push(t);
      const next = offsetTime(t, interval, 1, options);
      if (next <= t) break;
      t = next;
    }
  }
  return reverse ? ticks.reverse() : ticks;
}

/**
 * Returns a formatter that labels ticks at the granularity of `interval`, promoting
 * boundary ticks to the coarser unit (e.g. "2025" on the first month of a year).
 */
export function timeTickFormat(
  interval: TimeInterval,
  locale = 'en',
  options: TimeOptions = {},
): (time: number) => string {
  const timeZone = options.utc ? 'UTC' : undefined;
  const p = options.utc ? UTC : LOCAL;
  const fmt = (t: number, o: Intl.DateTimeFormatOptions) =>
    formatDate(t, { locale, ...o, timeZone });
  return (time) => {
    const d = new Date(time);
    const month = p.get(d, 'Month');
    const date = p.get(d, 'Date');
    const isYearStart = month === 0 && date === 1;
    switch (interval.unit) {
      case 'year':
        return fmt(time, { year: 'numeric' });
      case 'month':
        return isYearStart ? fmt(time, { year: 'numeric' }) : fmt(time, { month: 'short' });
      case 'week':
      case 'day':
        return isYearStart
          ? fmt(time, { year: 'numeric' })
          : fmt(time, { month: 'short', day: 'numeric' });
      case 'hour':
      case 'minute':
        return p.get(d, 'Hours') === 0 && p.get(d, 'Minutes') === 0
          ? fmt(time, { month: 'short', day: 'numeric' })
          : fmt(time, { hour: 'numeric', minute: '2-digit' });
      case 'second':
        return fmt(time, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      default:
        return fmt(time, { minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    }
  };
}

export interface TimeScaleOptions extends TimeOptions {
  /** Domain as timestamps (ms) or Dates. */
  domain: readonly [number | Date, number | Date];
  range: Extent;
  /** Snap the domain to the enclosing tick interval. */
  nice?: boolean | number;
  clamp?: boolean;
}

export interface TimeScale {
  readonly kind: 'time';
  readonly domain: Extent;
  readonly range: Extent;
  readonly utc: boolean;
  map(value: number | Date): number;
  invert(pixel: number): number;
  ticks(count?: number): number[];
  tickInterval(count?: number): TimeInterval;
  tickFormat(count?: number, locale?: string): (time: number) => string;
}

export function createTimeScale(options: TimeScaleOptions): TimeScale {
  const toMs = (v: number | Date) => (typeof v === 'number' ? v : v.getTime());
  let d0 = toMs(options.domain[0]);
  let d1 = toMs(options.domain[1]);
  const timeOptions: TimeOptions = {
    utc: options.utc ?? false,
    weekStartsOn: options.weekStartsOn ?? 1,
  };
  if (options.nice && d1 !== d0) {
    const count = typeof options.nice === 'number' ? options.nice : 6;
    const lo = Math.min(d0, d1);
    const hi = Math.max(d0, d1);
    const interval = chooseTimeInterval(hi - lo, count);
    const nLo = floorTime(lo, interval, timeOptions);
    let nHi = floorTime(hi, interval, timeOptions);
    if (nHi < hi) nHi = offsetTime(nHi, interval, 1, timeOptions);
    [d0, d1] = d0 <= d1 ? [nLo, nHi] : [nHi, nLo];
  }
  const [r0, r1] = options.range;
  const dSpan = d1 - d0;
  const rSpan = r1 - r0;
  const rMin = Math.min(r0, r1);
  const rMax = Math.max(r0, r1);
  const clamp = options.clamp ?? false;

  return {
    kind: 'time',
    domain: [d0, d1],
    range: options.range,
    utc: timeOptions.utc ?? false,
    map(value) {
      if (dSpan === 0) return (r0 + r1) / 2;
      const px = r0 + ((toMs(value) - d0) / dSpan) * rSpan;
      return clamp ? Math.min(rMax, Math.max(rMin, px)) : px;
    },
    invert(pixel) {
      if (rSpan === 0) return d0;
      return d0 + ((pixel - r0) / rSpan) * dSpan;
    },
    ticks(count = 6) {
      return timeTicks(d0, d1, count, timeOptions);
    },
    tickInterval(count = 6) {
      return chooseTimeInterval(Math.abs(dSpan), count);
    },
    tickFormat(count = 6, locale = 'en') {
      return timeTickFormat(chooseTimeInterval(Math.abs(dSpan), count), locale, timeOptions);
    },
  };
}
