import { describe, expect, it } from 'vitest';
import { batchMarks } from '../scene/draw';
import type { Mark } from '../scene/marks';
import {
  aggregateCalendarDays,
  buildCalendarModel,
  calendarDay,
  calendarIso,
  calendarWeekday,
  fromCalendarDay,
  localeWeekStart,
  toCalendarDay,
  type CalendarDays,
  type CalendarSpec,
} from './calendar';

const local = (y: number, m: number, d: number, h = 0) => new Date(y, m - 1, d, h).getTime();

/** One value per day from `from` to `to` (local dates). */
function series(from: number, to: number, fn: (i: number) => number): CalendarDays {
  const days: number[] = [];
  const values: number[] = [];
  for (let d = toCalendarDay(from), i = 0; d <= toCalendarDay(to); d++, i++) {
    days.push(fromCalendarDay(d));
    values.push(fn(i));
  }
  return aggregateCalendarDays(days, values)!;
}

const spec = (days: CalendarDays, extra: Partial<CalendarSpec> = {}): CalendarSpec => ({
  width: 1000,
  days,
  weekStartsOn: 0,
  ...extra,
});

function pathCount(marks: readonly Mark[]): number {
  const groups = new Map<number, Mark[]>();
  for (const m of marks) groups.set(m.series ?? -1, [...(groups.get(m.series ?? -1) ?? []), m]);
  let n = 0;
  for (const g of groups.values()) n += batchMarks(g).length;
  return n;
}

describe('calendar days', () => {
  it('round-trips local dates through day numbers, across DST changes', () => {
    for (let d = calendarDay(2025, 0, 1); d <= calendarDay(2025, 11, 31); d++) {
      const t = fromCalendarDay(d);
      expect(new Date(t).getHours()).toBe(0);
      expect(toCalendarDay(t)).toBe(d);
      expect(toCalendarDay(t + 23 * 36e5)).toBe(d); // late evening, same day
    }
    expect(calendarIso(calendarDay(2025, 2, 1))).toBe('2025-03-01');
    expect(calendarWeekday(calendarDay(2025, 2, 1))).toBe(6); // Saturday
    expect(calendarWeekday(calendarDay(1969, 11, 31))).toBe(3); // negative day numbers
    expect(toCalendarDay(Number.NaN)).toBeNaN();
  });

  it('picks the week start from the locale', () => {
    expect(localeWeekStart('en')).toBe(0);
    expect(localeWeekStart('en-US')).toBe(0);
    expect(localeWeekStart('ru')).toBe(1);
    expect(localeWeekStart('kk')).toBe(1);
    expect(localeWeekStart('en-GB')).toBe(1);
    expect(localeWeekStart('not a locale!')).toBe(1);
  });

  it('sums duplicate dates and keeps the first source row', () => {
    const agg = aggregateCalendarDays(
      [local(2025, 3, 1, 9), local(2025, 3, 1, 18), local(2025, 3, 3), Number.NaN],
      [2, 3, Number.NaN, 5],
    )!;
    expect(agg.first).toBe(calendarDay(2025, 2, 1));
    expect(agg.last).toBe(calendarDay(2025, 2, 3));
    expect(Array.from(agg.values)).toEqual([5, Number.NaN, Number.NaN]);
    expect(Array.from(agg.source)).toEqual([0, -1, 2]);
  });

  it('clips to an explicit range and returns null without data', () => {
    const agg = aggregateCalendarDays([local(2025, 1, 5), local(2025, 2, 5)], [1, 1], {
      from: local(2025, 1, 1),
      to: local(2025, 1, 31),
    })!;
    expect(agg.values).toHaveLength(31);
    expect(agg.values[4]).toBe(1);
    expect(aggregateCalendarDays([], [])).toBeNull();
    expect(aggregateCalendarDays([], [], { from: local(2025, 1, 1) })!.values).toHaveLength(1);
    expect(
      aggregateCalendarDays([], [], { from: local(2025, 2, 1), to: local(2025, 1, 1) }),
    ).toBeNull();
  });
});

describe('calendar model', () => {
  const year = series(local(2025, 1, 1), local(2025, 12, 31), (i) => i % 9);

  it('lays out weeks as columns and weekdays as rows (Sunday start)', () => {
    const m = buildCalendarModel(spec(year));
    expect(m.marks).toHaveLength(365);
    expect(m.cellSize).toBe(14);
    expect(m.gap).toBe(3);
    // 2025-01-01 is a Wednesday: row 3 of the first column.
    const jan1 = m.cellRect(0)!;
    const jan4 = m.cellRect(3)!; // Saturday
    const jan5 = m.cellRect(4)!; // Sunday → next column, top row
    expect(jan4.x).toBe(jan1.x);
    expect(jan4.y - jan1.y).toBe(3 * m.step);
    expect(jan5.x - jan1.x).toBe(m.step);
    expect(jan5.y).toBe(jan1.y - 3 * m.step);
    expect(m.marks.find((c) => c.key === 'd|2025-01-01')).toBeDefined();
  });

  it('aligns rows to Monday for Monday-start weeks', () => {
    const m = buildCalendarModel(spec(year, { weekStartsOn: 1 }));
    const jan1 = m.cellRect(0)!; // Wednesday → row 2
    const jan5 = m.cellRect(4)!; // Sunday → row 6, same column
    const jan6 = m.cellRect(5)!; // Monday → next column, row 0
    expect(jan5.x).toBe(jan1.x);
    expect(jan5.y - jan1.y).toBe(4 * m.step);
    expect(jan6.x - jan1.x).toBe(m.step);
    expect(jan6.y).toBe(jan1.y - 2 * m.step);
    const weekdays = m.labels.filter((l) => l.key.startsWith('wd|')).map((l) => l.text);
    expect(weekdays).toEqual(['Mon', 'Wed', 'Fri']);
    expect(m.weekStartsOn).toBe(1);
  });

  it('uses the locale for week start, weekday and month names', () => {
    const m = buildCalendarModel({ width: 1000, days: year, locale: 'ru' });
    expect(m.weekStartsOn).toBe(1);
    const months = m.labels.filter((l) => l.key.startsWith('m|')).map((l) => l.text);
    expect(months[0]).toMatch(/^янв/);
    expect(months).toHaveLength(12);
    const weekdays = m.labels.filter((l) => l.key.startsWith('wd|')).map((l) => l.text);
    expect(weekdays).toEqual(['пн', 'ср', 'пт']);
    const en = buildCalendarModel(spec(year));
    expect(en.labels.filter((l) => l.key.startsWith('wd|')).map((l) => l.text)).toEqual([
      'Mon',
      'Wed',
      'Fri',
    ]);
    expect(en.labels.find((l) => l.key.startsWith('m|2025-1'))!.text).toBe('Feb');
  });

  it('hit tests every day back to its index', () => {
    for (const extra of [{}, { monthGap: true }, { weekStartsOn: 1 }] as const) {
      const m = buildCalendarModel(spec(year, extra));
      for (let i = 0; i < m.count; i++) {
        const r = m.cellRect(i)!;
        expect(m.hitTest(r.x + r.width / 2, r.y + r.height / 2)).toBe(i);
      }
      expect(m.hitTest(-5, -5)).toBe(-1);
      expect(m.hitTest(5000, 50)).toBe(-1);
    }
  });

  it('quantizes zero and missing days to the empty level and batches by bucket', () => {
    const m = buildCalendarModel(spec(year));
    expect(m.scale.buckets).toHaveLength(4);
    const zero = m.marks.find((c) => c.key === 'd|2025-01-01')!; // value 0
    expect(zero.fill).toBe('var(--jc-track)');
    expect(zero.series).toBe(0);
    expect(m.dayBuckets[0]).toBe(-1);
    expect(m.dayBuckets[8]).toBe(3); // the maximum
    expect(pathCount(m.marks)).toBeLessThanOrEqual(5);
    const sparse = buildCalendarModel(
      spec(aggregateCalendarDays([local(2025, 1, 1), local(2025, 3, 1)], [3, 1])!),
    );
    expect(sparse.marks.filter((c) => c.series === 0)).toHaveLength(sparse.count - 2);
    expect(sparse.defined).toBe(2);
  });

  it('keeps negative values on the scale instead of emptying them', () => {
    const m = buildCalendarModel(spec(series(local(2025, 1, 1), local(2025, 1, 10), (i) => i - 5)));
    expect(m.dayBuckets[0]).toBe(0);
    expect(m.dayBuckets[5]).toBeGreaterThan(0);
  });

  it('shrinks cells to fit and then keeps only the most recent weeks', () => {
    const roomy = buildCalendarModel(spec(year, { width: 1200 }));
    expect(roomy.cellSize).toBe(14);
    const mid = buildCalendarModel(spec(year, { width: 600 }));
    expect(mid.cellSize).toBeLessThan(14);
    expect(mid.cellSize).toBeGreaterThanOrEqual(6);
    expect(mid.visible).toEqual([0, 364]);
    expect(Math.max(...mid.marks.map((c) => c.x + c.width))).toBeLessThanOrEqual(600);
    const narrow = buildCalendarModel(spec(year, { width: 220 }));
    expect(narrow.visible[0]).toBeGreaterThan(0);
    expect(narrow.visible[1]).toBe(364);
    expect(narrow.marks.length).toBeLessThan(365);
    expect(Math.max(...narrow.marks.map((c) => c.x + c.width))).toBeLessThanOrEqual(220);
    expect(narrow.cellRect(0)).toBeNull();
    expect(narrow.hitTest(narrow.plot.x + 1, narrow.plot.y + 1)).toBeGreaterThan(0);
    expect(narrow.height).toBeLessThan(roomy.height);
  });

  it('stacks years vertically with months aligned', () => {
    const two = series(local(2024, 3, 15), local(2025, 12, 31), (i) => i % 5);
    const m = buildCalendarModel(spec(two, { width: 1000 }));
    expect(m.layout).toBe('years');
    expect(m.blocks.map((b) => b.year)).toEqual([2024, 2025]);
    expect(m.blocks[1]!.y).toBeGreaterThan(m.blocks[0]!.gridY + 7 * m.step - m.gap);
    expect(m.labels.filter((l) => l.key.startsWith('year|')).map((l) => l.text)).toEqual([
      '2024',
      '2025',
    ]);
    // 1 June sits in the same column offset from 1 January in both years (aligned months).
    const x = (y: number, mo: number, d: number) => m.cellRect(m.indexOf(local(y, mo, d)))!.x;
    expect(x(2024, 3, 15)).toBeGreaterThan(m.plot.x); // drawn from mid-March
    expect(x(2025, 1, 1)).toBe(m.plot.x);
    expect(Math.abs(x(2024, 6, 1) - x(2025, 6, 1))).toBeLessThanOrEqual(m.step);
    expect(m.height).toBeGreaterThan(2 * 7 * m.step);
    const flat = buildCalendarModel(spec(two, { width: 1000, layout: 'continuous' }));
    expect(flat.blocks).toHaveLength(1);
    expect(flat.labels.some((l) => l.text === '2025')).toBe(true); // January shows the year
  });

  it('separates months with a visual gap', () => {
    const m = buildCalendarModel(spec(year, { monthGap: true, width: 1200 }));
    const jan31 = m.cellRect(30)!;
    const feb1 = m.cellRect(31)!;
    expect(feb1.x - jan31.x).toBeGreaterThan(m.step);
    // Too narrow for gaps: they are dropped before weeks are.
    const narrow = buildCalendarModel(spec(year, { monthGap: true, width: 520 }));
    expect(narrow.visible).toEqual([0, 364]);
  });

  it('drops colliding month labels and fits a fixed height', () => {
    const late = series(local(2025, 1, 29), local(2025, 4, 30), () => 1);
    const m = buildCalendarModel(spec(late));
    const months = m.labels.filter((l) => l.key.startsWith('m|')).map((l) => l.text);
    expect(months).toEqual(['Feb', 'Mar', 'Apr']);
    const fixed = buildCalendarModel(spec(year, { height: 80 }));
    expect(fixed.height).toBe(80);
    const bottom = Math.max(...fixed.marks.map((c) => c.y + c.height));
    expect(bottom).toBeLessThanOrEqual(80);
  });

  it('emphasises the active day', () => {
    const m = buildCalendarModel(spec(year));
    expect(m.activeMarks(10)).toHaveLength(3);
    expect(m.activeMarks(-1)).toEqual([]);
    expect(m.timeOf(0)).toBe(local(2025, 1, 1));
    expect(m.indexOf(local(2026, 1, 1))).toBe(-1);
  });
});
