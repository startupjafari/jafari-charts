import { formatDate } from '../formatting/date';
import { estimateTextWidth } from '../formatting/text';
import type { Mark, RectMark, TextMark } from '../scene/marks';
import type { Rect } from '../types';
import {
  heatmapActiveMarks,
  heatmapCellStyle,
  resolveHeatmapColors,
  sortHeatmapCells,
  type HeatmapColorOptions,
  type HeatmapColorScale,
} from './heatmap';

// ---------------------------------------------------------------------------------------------
// Calendar days: integer day numbers on the local calendar (DST-proof date arithmetic)
// ---------------------------------------------------------------------------------------------

const DAY = 864e5;

/** Day number of a timestamp on the local calendar (days since 1970-01-01, local date). */
export function toCalendarDay(time: number): number {
  if (!Number.isFinite(time)) return Number.NaN;
  const d = new Date(time);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
}

/** Local midnight (epoch ms) of a day number. */
export function fromCalendarDay(day: number): number {
  const d = new Date(day * DAY);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime();
}

/** Weekday of a day number: 0 = Sunday … 6 = Saturday. */
export function calendarWeekday(day: number): number {
  return (((day + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
}

/** `{ year, month (0–11), date }` of a day number. */
export function calendarDate(day: number): { year: number; month: number; date: number } {
  const d = new Date(day * DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), date: d.getUTCDate() };
}

/** Day number of a calendar date (month may overflow, as with `Date`). */
export function calendarDay(year: number, month: number, date: number): number {
  return Math.round(Date.UTC(year, month, date) / DAY);
}

/** ISO `YYYY-MM-DD` of a day number. */
export function calendarIso(day: number): string {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

interface WeekInfoLocale {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
}

/**
 * First day of the week for a locale: 0 = Sunday (en, en-US…), 1 = Monday (ru, kk,
 * en-GB…). Uses `Intl.Locale` week info where available, else a small table.
 */
export function localeWeekStart(locale = 'en'): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & WeekInfoLocale;
    const info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
    if (info && Number.isInteger(info.firstDay)) return info.firstDay % 7; // 7 = Sunday
  } catch {
    // Invalid tag: fall through to the table.
  }
  const [lang = '', region = ''] = locale.toLowerCase().split(/[-_]/);
  const sundayRegions = new Set(['us', 'ca', 'jp', 'il', 'br', 'mx', 'ph', 'kr', 'tw', 'hk', 'in']);
  if (region) return sundayRegions.has(region) ? 0 : 1;
  return ['en', 'he', 'ja', 'ko', 'pt', 'zh', 'hi'].includes(lang) ? 0 : 1;
}

export interface CalendarDays {
  /** Day number of the first and last day of the range (inclusive). */
  first: number;
  last: number;
  /** Summed value per day (`value[day - first]`); NaN = no data. */
  values: Float64Array;
  /** First data index per day (-1 = none). */
  source: Int32Array;
}

/**
 * Aggregates raw (time, value) pairs into one value per calendar day, summing
 * duplicates. The range is `[from, to]` when given, else the data extent. Data
 * outside the range is ignored.
 */
export function aggregateCalendarDays(
  times: ArrayLike<number>,
  values: ArrayLike<number>,
  range: { from?: number; to?: number } = {},
): CalendarDays | null {
  const n = Math.min(times.length, values.length);
  const days = new Float64Array(n);
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < n; i++) {
    const d = toCalendarDay(times[i] as number);
    days[i] = d;
    if (Number.isFinite(d)) {
      if (d < lo) lo = d;
      if (d > hi) hi = d;
    }
  }
  const from = range.from !== undefined ? toCalendarDay(range.from) : Number.NaN;
  const to = range.to !== undefined ? toCalendarDay(range.to) : Number.NaN;
  if (Number.isFinite(from)) lo = from;
  if (Number.isFinite(to)) hi = to;
  if (Number.isFinite(from) && !Number.isFinite(to) && !(hi >= lo)) hi = lo;
  if (Number.isFinite(to) && !Number.isFinite(from) && !(lo <= hi)) lo = hi;
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) return null;
  // Guard against absurd ranges (a 100-year calendar is still only ~36 500 cells).
  if (hi - lo > 36_600) lo = hi - 36_600;
  const len = hi - lo + 1;
  const out = new Float64Array(len).fill(Number.NaN);
  const source = new Int32Array(len).fill(-1);
  for (let i = 0; i < n; i++) {
    const d = days[i] as number;
    if (!(d >= lo && d <= hi)) continue;
    const k = d - lo;
    const v = values[i] as number;
    if (source[k] === -1) source[k] = i;
    if (!Number.isFinite(v)) continue;
    const prev = out[k] as number;
    out[k] = Number.isFinite(prev) ? prev + v : v;
  }
  return { first: lo, last: hi, values: out, source };
}

// ---------------------------------------------------------------------------------------------
// Calendar heatmap model
// ---------------------------------------------------------------------------------------------

export interface CalendarSpec {
  width: number;
  /** Fixed height; omit for the natural height of the computed cell size. */
  height?: number;
  /** Aggregated days (see `aggregateCalendarDays`). */
  days: CalendarDays;
  /** First weekday row: 0 = Sunday, 1 = Monday … (default from the locale). */
  weekStartsOn?: number;
  locale?: string;
  /**
   * Colour steps. Defaults: 4 steps above an "empty" level for zero/missing days
   * (when all values are ≥ 0), like an activity calendar.
   */
  colors?: HeatmapColorOptions;
  /** `continuous` weeks, or one block per calendar `years` stacked vertically. */
  layout?: 'auto' | 'continuous' | 'years';
  /** Visual gap between months, px (`true` = one cell gap). */
  monthGap?: boolean | number;
  /** Largest cell size, px (default 14). */
  maxCellSize?: number;
  /** Smallest cell size before the oldest weeks are cut off, px (default 6). */
  minCellSize?: number;
  /** Gap between cells, px (default 3, less for small cells). */
  gap?: number;
  cornerRadius?: number;
  /** Weekday labels: three of seven (Mon/Wed/Fri), `all`, or none. */
  weekdayLabels?: boolean | 'all';
  monthLabels?: boolean;
  fontSize?: number;
}

export interface CalendarBlock {
  /** Year of the block (years layout) or of the first visible day. */
  year: number;
  y: number;
  /** Top of the cell grid. */
  gridY: number;
  first: number;
  last: number;
}

export interface CalendarModel {
  width: number;
  height: number;
  cellSize: number;
  gap: number;
  /** Distance between neighbouring cells (cell + gap). */
  step: number;
  weekStartsOn: number;
  /** Day number of index 0 (`days.first`). */
  first: number;
  /** Number of days in the range (`index` runs 0…count-1). */
  count: number;
  /** First and last visible index (narrow layouts drop the oldest weeks). */
  visible: [number, number];
  /** Number of visible days with a value. */
  defined: number;
  layout: 'continuous' | 'years';
  blocks: CalendarBlock[];
  scale: HeatmapColorScale;
  /** Bucket per day index (-1 = empty). */
  dayBuckets: Int8Array;
  /** Bounding box of the cells. */
  plot: Rect;
  marks: RectMark[];
  labels: TextMark[];
  /** Day index under the point, or -1 (O(1) date arithmetic, binary search over ≤ 12 months). */
  hitTest(x: number, y: number): number;
  cellRect(index: number): Rect | null;
  activeMarks(index: number): Mark[];
  /** Local midnight of a day index. */
  timeOf(index: number): number;
  /** Index of a timestamp's day, or -1 outside the range. */
  indexOf(time: number): number;
}

interface Segment {
  /** First/last day drawn in this segment. */
  first: number;
  last: number;
  /** Week start of the segment's first column. */
  origin: number;
  x: number;
}

const BLOCK_GAP = 14;

export function buildCalendarModel(spec: CalendarSpec): CalendarModel {
  const { days } = spec;
  const locale = spec.locale ?? 'en';
  const fontSize = spec.fontSize ?? 11;
  const ws = (((spec.weekStartsOn ?? localeWeekStart(locale)) % 7) + 7) % 7;
  const count = days.last - days.first + 1;
  const rowOf = (day: number) => (calendarWeekday(day) - ws + 7) % 7;
  const weekOrigin = (day: number) => day - rowOf(day);

  const firstYear = calendarDate(days.first).year;
  const lastYear = calendarDate(days.last).year;
  const layout: 'continuous' | 'years' =
    spec.layout === 'continuous' || spec.layout === 'years'
      ? spec.layout
      : count > 371 && lastYear > firstYear
        ? 'years'
        : 'continuous';

  // ---- Colour scale over the drawn range -------------------------------------------------------
  let nonNegative = true;
  for (const v of days.values) if (v < 0) nonNegative = false;
  const scale = resolveHeatmapColors(days.values, {
    buckets: 4,
    zeroAsEmpty: nonNegative,
    ...spec.colors,
  });
  const nb = scale.buckets.length;

  // ---- Labels column ---------------------------------------------------------------------------
  const weekdayMode = spec.weekdayLabels === undefined ? true : spec.weekdayLabels;
  const weekdayText = (row: number) =>
    formatDate(fromCalendarDay(calendarDay(2023, 0, 1 + ((row + ws) % 7))), {
      locale,
      weekday: 'short',
    }); // 2023-01-01 was a Sunday
  let labelW = 0;
  if (weekdayMode)
    for (let r = 0; r < 7; r++)
      labelW = Math.max(labelW, estimateTextWidth(weekdayText(r), fontSize));
  if (layout === 'years')
    labelW = Math.max(labelW, estimateTextWidth(String(lastYear), fontSize) * 1.08);
  const left = labelW > 0 ? Math.ceil(labelW) + 8 : 0;
  const showMonths = spec.monthLabels ?? true;
  const headerH = showMonths || layout === 'years' ? Math.ceil(fontSize * 1.2) + 6 : 0;

  // ---- Blocks (one per year, or one) -----------------------------------------------------------
  // `start`/`end` is the span the columns are laid out for (whole years in the years
  // layout, so months line up vertically); `first`/`last` the days actually drawn.
  interface Range {
    year: number;
    first: number;
    last: number;
    start: number;
    end: number;
  }
  const ranges: Range[] = [];
  if (layout === 'years') {
    for (let y = firstYear; y <= lastYear; y++) {
      const start = calendarDay(y, 0, 1);
      const end = calendarDay(y, 11, 31);
      ranges.push({
        year: y,
        first: Math.max(days.first, start),
        last: Math.min(days.last, end),
        start,
        end,
      });
    }
  } else {
    ranges.push({
      year: firstYear,
      first: days.first,
      last: days.last,
      start: days.first,
      end: days.last,
    });
  }

  /** Calendar months of `[start, end]` as clipped day spans. */
  const monthsOf = (start: number, end: number) => {
    const out: Array<{ first: number; last: number }> = [];
    for (let d = start; d <= end;) {
      const { year, month } = calendarDate(d);
      const last = Math.min(end, calendarDay(year, month + 1, 0));
      out.push({ first: d, last });
      d = last + 1;
    }
    return out;
  };
  const colsBetween = (a: number, b: number) => Math.floor((weekOrigin(b) - weekOrigin(a)) / 7) + 1;

  // ---- Cell size from the available width (and height when fixed) ----------------------------
  const maxCell = Math.max(2, spec.maxCellSize ?? 14);
  const minCell = Math.max(2, Math.min(maxCell, spec.minCellSize ?? 6));
  const gapFor = (c: number) => (spec.gap !== undefined ? spec.gap : c >= 10 ? 3 : c >= 7 ? 2 : 1);
  const monthGapOpt = spec.monthGap ?? false;
  let withGaps = monthGapOpt !== false;
  const columnsOf = (r: Range) => {
    if (!withGaps) return { cols: colsBetween(r.start, r.end), gaps: 0 };
    const months = monthsOf(r.start, r.end);
    let cols = 0;
    for (const m of months) cols += colsBetween(m.first, m.last);
    return { cols, gaps: Math.max(0, months.length - 1) };
  };
  const avail = Math.max(0, spec.width - left - 2);
  const monthGapPx = (step: number, g: number) =>
    !withGaps
      ? 0
      : typeof monthGapOpt === 'number'
        ? Math.max(0, monthGapOpt)
        : Math.max(4, step - g);
  const fits = (c: number) => {
    const g = gapFor(c);
    const st = c + g;
    return ranges.every((r) => {
      const { cols, gaps } = columnsOf(r);
      return cols * st - g + gaps * monthGapPx(st, g) <= avail;
    });
  };
  let cell = maxCell;
  while (cell > minCell && !fits(cell)) cell--;
  if (!fits(cell) && withGaps) {
    // Too narrow for month gaps: drop them before dropping weeks.
    withGaps = false;
    cell = maxCell;
    while (cell > minCell && !fits(cell)) cell--;
  }
  if (spec.height !== undefined) {
    const n = ranges.length;
    const perRow = (spec.height - n * headerH - (n - 1) * BLOCK_GAP - 2) / (7 * n);
    while (cell > 2 && cell + gapFor(cell) - gapFor(cell) / 7 > perRow) cell--;
  }
  const gap = gapFor(cell);
  const step = cell + gap;
  const mGap = monthGapPx(step, gap);

  // Too narrow even at the smallest cell: keep the most recent weeks that fit.
  const maxCols = Math.max(1, Math.floor((avail + gap) / step));
  for (const r of ranges) {
    if (columnsOf(r).cols <= maxCols) continue;
    r.end = Math.min(r.end, r.last);
    r.start = Math.max(r.start, weekOrigin(r.end) - (maxCols - 1) * 7);
    r.first = Math.max(r.first, r.start);
  }

  // ---- Geometry --------------------------------------------------------------------------------
  const blocks: CalendarBlock[] = [];
  const segments: Segment[][] = [];
  const blockH = headerH + 7 * step - gap;
  let y = 1;
  for (const r of ranges) {
    const segs: Segment[] = [];
    if (withGaps) {
      let x = left;
      for (const m of monthsOf(r.start, r.end)) {
        const origin = weekOrigin(m.first);
        const first = Math.max(m.first, r.first);
        const last = Math.min(m.last, r.last);
        if (first <= last) segs.push({ first, last, origin, x });
        x += colsBetween(m.first, m.last) * step + mGap;
      }
    } else if (r.first <= r.last) {
      segs.push({ first: r.first, last: r.last, origin: weekOrigin(r.start), x: left });
    }
    blocks.push({ year: r.year, y, gridY: y + headerH, first: r.first, last: r.last });
    segments.push(segs);
    y += blockH + BLOCK_GAP;
  }
  const height = spec.height ?? Math.ceil(y - BLOCK_GAP + 1);
  const visibleFirst = (blocks[0] as CalendarBlock).first - days.first;
  const visibleLast = (blocks.at(-1) as CalendarBlock).last - days.first;

  /** Block and segment of a day (O(1) for blocks, binary search over ≤ 12 month segments). */
  const locate = (day: number): { b: number; s: Segment } | null => {
    if (!(day >= days.first && day <= days.last)) return null;
    const b = layout === 'years' ? calendarDate(day).year - firstYear : 0;
    const block = blocks[b];
    const segs = segments[b];
    if (!block || !segs?.length || day < block.first || day > block.last) return null;
    let lo = 0;
    let hi = segs.length - 1;
    while (lo < hi) {
      const m = (lo + hi + 1) >>> 1;
      if ((segs[m] as Segment).first <= day) lo = m;
      else hi = m - 1;
    }
    const s = segs[lo] as Segment;
    return day >= s.first && day <= s.last ? { b, s } : null;
  };
  const cellRect = (index: number): Rect | null => {
    const day = days.first + index;
    const at = locate(day);
    if (!at) return null;
    const block = blocks[at.b] as CalendarBlock;
    return {
      x: at.s.x + Math.floor((day - at.s.origin) / 7) * step,
      y: block.gridY + rowOf(day) * step,
      width: cell,
      height: cell,
    };
  };

  // ---- Marks -----------------------------------------------------------------------------------
  const radius = Math.max(0, Math.min(spec.cornerRadius ?? 2, cell / 4));
  const dayBuckets = new Int8Array(count).fill(-1);
  const marks: RectMark[] = [];
  let defined = 0;
  let right = left;
  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b] as CalendarBlock;
    for (const s of segments[b] as Segment[]) {
      for (let day = s.first; day <= s.last; day++) {
        const index = day - days.first;
        const v = days.values[index] as number;
        const bucket = scale.bucketOf(v);
        dayBuckets[index] = bucket;
        if (Number.isFinite(v)) defined++;
        const x = s.x + Math.floor((day - s.origin) / 7) * step;
        if (x + cell > right) right = x + cell;
        marks.push({
          type: 'rect',
          key: `d|${calendarIso(day)}`,
          x,
          y: block.gridY + rowOf(day) * step,
          width: cell,
          height: cell,
          radius,
          ...heatmapCellStyle(scale, bucket),
          // Legend slot 0 is the empty level, then the colour steps.
          series: bucket + 1,
          index,
          enter: { opacity: 0 },
        });
      }
    }
  }

  // ---- Labels ----------------------------------------------------------------------------------
  const labels: TextMark[] = [];
  const multiYear = layout === 'continuous' && lastYear > firstYear;
  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b] as CalendarBlock;
    if (layout === 'years') {
      labels.push({
        key: `year|${block.year}`,
        x: 0,
        y: block.y + fontSize,
        text: String(block.year),
        anchor: 'start',
        tone: 'primary',
        fontWeight: 600,
      });
    }
    if (weekdayMode) {
      const rows = weekdayMode === 'all' && step >= fontSize ? [0, 1, 2, 3, 4, 5, 6] : null;
      // Three of seven rows, like GitHub: Monday, Wednesday, Friday.
      const shown = rows ?? [1, 3, 5].map((wd) => (wd - ws + 7) % 7).sort((p, q) => p - q);
      for (const r of shown) {
        labels.push({
          key: `wd|${block.year}|${r}`,
          x: left - 8,
          y: block.gridY + r * step + cell / 2,
          text: weekdayText(r),
          anchor: 'end',
          baseline: 'middle',
        });
      }
    }
    if (showMonths) {
      const candidates: Array<{ x: number; text: string; partial: boolean; key: string }> = [];
      for (const { first: d, last: end } of monthsOf(block.first, block.last)) {
        const { year, month } = calendarDate(d);
        const at = locate(d);
        if (at) {
          const col = Math.floor((d - at.s.origin) / 7);
          // Over the first column holding at least four days of the month.
          const shift = !withGaps && rowOf(d) > 3 && end >= weekOrigin(d) + 7 ? 1 : 0;
          const t = fromCalendarDay(calendarDay(year, month, 1));
          candidates.push({
            x: at.s.x + (col + shift) * step,
            text:
              multiYear && month === 0 ? String(year) : formatDate(t, { locale, month: 'short' }),
            partial: calendarDate(d).date > 1 && end - d < 14,
            key: `m|${year}-${month}`,
          });
        }
      }
      const kept: typeof candidates = [];
      for (const c of candidates) {
        const prev = kept.at(-1);
        if (prev && c.x < prev.x + estimateTextWidth(prev.text, fontSize) + 6) {
          // Collision: a short partial month at the start yields to the full month.
          if (prev.partial && kept.length === 1) kept[0] = c;
          continue;
        }
        kept.push(c);
      }
      for (const c of kept) {
        if (c.x + estimateTextWidth(c.text, fontSize) > spec.width + 2) continue;
        labels.push({
          key: `${c.key}|${block.year}`,
          x: c.x,
          y: block.y + fontSize,
          text: c.text,
          anchor: 'start',
        });
      }
    }
  }

  const gridTop = (blocks[0] as CalendarBlock).gridY;
  const plot: Rect = {
    x: left,
    y: gridTop,
    width: Math.max(0, right - left),
    height: Math.max(0, (blocks.at(-1) as CalendarBlock).gridY + 7 * step - gap - gridTop),
  };

  return {
    width: spec.width,
    height,
    cellSize: cell,
    gap,
    step,
    weekStartsOn: ws,
    first: days.first,
    count,
    visible: [visibleFirst, visibleLast],
    defined,
    layout,
    blocks,
    scale,
    dayBuckets,
    plot,
    marks: sortHeatmapCells(marks, nb + 1),
    labels,
    hitTest(x, yy) {
      // Block by y (equal heights), month segment by x, then week column and weekday row.
      const b = Math.floor((yy - 1) / (blockH + BLOCK_GAP));
      const block = blocks[b];
      const segs = segments[b];
      if (!block || !segs?.length) return -1;
      const ry = yy - block.gridY + gap / 2;
      if (ry < 0 || ry >= 7 * step) return -1;
      const row = Math.floor(ry / step);
      let lo = 0;
      let hi = segs.length - 1;
      while (lo < hi) {
        const m = (lo + hi + 1) >>> 1;
        if ((segs[m] as Segment).x <= x + gap / 2) lo = m;
        else hi = m - 1;
      }
      const s = segs[lo] as Segment;
      const rx = x - s.x + gap / 2;
      if (rx < 0) return -1;
      const day = s.origin + Math.floor(rx / step) * 7 + row;
      if (day < s.first || day > s.last) return -1;
      return day - days.first;
    },
    cellRect,
    activeMarks(index) {
      const r = cellRect(index);
      if (!r) return [];
      return heatmapActiveMarks(
        r,
        heatmapCellStyle(scale, dayBuckets[index] as number),
        String(index),
        radius,
        Math.min(1.5, gap),
      );
    },
    timeOf: (index) => fromCalendarDay(days.first + index),
    indexOf(time) {
      const d = toCalendarDay(time);
      return d >= days.first && d <= days.last ? d - days.first : -1;
    },
  };
}
