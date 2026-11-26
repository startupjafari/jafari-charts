import { describe, expect, it } from 'vitest';
import { buildCartesianModel } from '../charts/cartesian';
import { buildScatterModel } from '../charts/scatter';
import { mapPositions, sortIndices, permute } from '../data/group';
import { timeColumn } from '../data/columns';
import { estimateTextWidth, truncateText, wrapText } from '../formatting/text';
import { createBandScale } from '../scales/band';
import { createLinearScale } from '../scales/linear';
import { createLogScale } from '../scales/log';
import { bandTicks, continuousTicks, maxLabelWidth, tickLabelWidth, type AxisTick } from './axis';
import { baselinePosition, computeCartesianFrame, resolveValueDomain } from './cartesian';
import { computePolarFrame, hitTestSlices, pieLayout, pointAngle, TAU } from './polar';

describe('resolveValueDomain', () => {
  it('includes zero and nices by default', () => {
    expect(resolveValueDomain([12, 87])).toEqual([0, 100]);
  });

  it('handles all-zero, all-equal, empty and negative data', () => {
    expect(resolveValueDomain([0, 0])).toEqual([0, 1]);
    expect(resolveValueDomain([5, 5], { includeZero: false })).toEqual([4.4, 5.6]);
    expect(resolveValueDomain([5, 5], { includeZero: false, nice: false })).toEqual([4.5, 5.5]);
    expect(resolveValueDomain([5, 5])).toEqual([0, 5]);
    expect(resolveValueDomain([Number.NaN, Number.NaN])).toEqual([0, 1]);
    expect(resolveValueDomain([-30, -10])).toEqual([-30, 0]);
    expect(resolveValueDomain([-7, 13])).toEqual([-10, 15]);
  });

  it('applies the auto zero heuristic', () => {
    expect(resolveValueDomain([10, 100], { includeZero: 'auto' })[0]).toBe(0);
    expect(resolveValueDomain([150, 160], { includeZero: 'auto' })[0]).toBeGreaterThan(100);
  });

  it('honours fixed bounds and log domains', () => {
    expect(resolveValueDomain([3, 40], { min: 0, max: 50 })).toEqual([0, 50]);
    const log = resolveValueDomain([0, 500], { log: true });
    expect(log[0]).toBeGreaterThan(0);
  });

  it('copes with very large and fractional numbers', () => {
    expect(resolveValueDomain([0, 9.3e11])).toEqual([0, 1e12]);
    expect(resolveValueDomain([0.0012, 0.0087])).toEqual([0, 0.01]);
  });
});

describe('axis ticks', () => {
  it('never lets x labels overlap', () => {
    const scale = createLinearScale({ domain: [0, 1_000_000_000], range: [40, 300] });
    const ticks = continuousTicks({ scale, direction: 'x', fontSize: 11 });
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < ticks.length; i++) {
      const gap = ticks[i]!.position - ticks[i - 1]!.position;
      const need =
        (estimateTextWidth(ticks[i]!.label, 11) + estimateTextWidth(ticks[i - 1]!.label, 11)) / 2;
      expect(gap).toBeGreaterThanOrEqual(need);
    }
  });

  it('uses compact labels for large values and locale-aware decimals', () => {
    const big = continuousTicks({
      scale: createLinearScale({ domain: [0, 50_000], range: [200, 0] }),
      direction: 'y',
    });
    expect(big.map((t) => t.label)).toContain('50K');
    const ru = continuousTicks({
      scale: createLinearScale({ domain: [0, 1], range: [200, 0] }),
      direction: 'y',
      locale: 'ru',
    });
    expect(ru.map((t) => t.label)).toContain('0,2');
  });

  it('thins and truncates long category labels', () => {
    const labels = Array.from(
      { length: 40 },
      (_, i) => `Al-Farabi Kazakh National University ${i}`,
    );
    const scale = createBandScale({ domain: labels, range: [0, 400] });
    const ticks = bandTicks({ scale, direction: 'x', fontSize: 11 });
    expect(ticks.length).toBeLessThan(40);
    for (const t of ticks) expect(estimateTextWidth(t.label, 11)).toBeLessThanOrEqual(141);
  });

  it('drops a neighbour that would collide with an inward-shifted edge label', () => {
    const labels = ['a', 'b', 'c', 'scatter · 365', 'scatter · 100k'];
    const scale = createBandScale({
      domain: labels,
      range: [10, 300],
      paddingInner: 0.3,
      paddingOuter: 0,
    });
    const ticks = bandTicks({ scale, direction: 'x', fontSize: 11, bounds: [0, 300] });
    for (let i = 1; i < ticks.length; i++) {
      const w = (t: (typeof ticks)[number]) => estimateTextWidth(t.label, 11);
      const right = (t: (typeof ticks)[number]) =>
        t.anchor === 'start'
          ? t.position + w(t)
          : t.anchor === 'end'
            ? t.position
            : t.position + w(t) / 2;
      const left = (t: (typeof ticks)[number]) =>
        t.anchor === 'start'
          ? t.position
          : t.anchor === 'end'
            ? t.position - w(t)
            : t.position - w(t) / 2;
      expect(left(ticks[i]!)).toBeGreaterThan(right(ticks[i - 1]!));
    }
  });

  it('anchors edge labels inside the bounds', () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 300] });
    const ticks = continuousTicks({ scale, direction: 'x', bounds: [0, 300] });
    expect(ticks[0]!.anchor).toBe('start');
    expect(ticks.at(-1)!.anchor).toBe('end');
  });
});

describe('computeCartesianFrame', () => {
  it('reserves room for y labels and keeps the plot inside the box', () => {
    const frame = computeCartesianFrame({
      width: 600,
      height: 300,
      x: { kind: 'band', labels: ['Mon', 'Tue', 'Wed'] },
      y: { kind: 'linear', domain: [0, 120_000] },
    });
    expect(frame.plot.x).toBeGreaterThan(20);
    expect(frame.plot.x + frame.plot.width).toBeLessThanOrEqual(600);
    expect(frame.plot.y + frame.plot.height).toBeLessThan(300);
    expect(frame.xTicks.map((t) => t.label)).toEqual(['Mon', 'Tue', 'Wed']);
    expect(frame.y.kind).toBe('linear');
  });

  it('puts categories on the y axis for horizontal layouts', () => {
    const frame = computeCartesianFrame({
      width: 400,
      height: 200,
      x: { kind: 'linear', domain: [0, 10] },
      y: { kind: 'band', labels: ['first', 'second'] },
    });
    const y = frame.y as ReturnType<typeof createBandScale>;
    expect(y.center(0)).toBeLessThan(y.center(1));
  });

  it('collapses hidden axes and survives tiny sizes', () => {
    const frame = computeCartesianFrame({
      width: 80,
      height: 30,
      x: { kind: 'linear', domain: [0, 1], hidden: true },
      y: { kind: 'linear', domain: [0, 1], hidden: true },
      padding: { top: 2, right: 2, bottom: 2, left: 2 },
    });
    expect(frame.plot).toEqual({ x: 2, y: 2, width: 76, height: 26 });
    expect(frame.yTicks.length).toBeGreaterThan(0); // still available for gridlines
    const zero = computeCartesianFrame({
      width: 0,
      height: 0,
      x: { kind: 'linear', domain: [0, 1] },
      y: { kind: 'linear', domain: [0, 1] },
    });
    expect(zero.plot.width).toBeGreaterThanOrEqual(0);
    expect(zero.plot.height).toBeGreaterThanOrEqual(0);
  });

  it('places the baseline at zero, clamped to the plot', () => {
    expect(baselinePosition(createLinearScale({ domain: [-10, 10], range: [100, 0] }))).toBe(50);
    expect(baselinePosition(createLinearScale({ domain: [5, 10], range: [100, 0] }))).toBe(100);
  });
});

const width = (text: string) => estimateTextWidth(text, 11);
const UNIVERSITIES = [
  'Казахская национальная академия искусств',
  'Казахская национальная аграрная исследовательский университет',
  'Казахский национальный университет имени аль-Фараби',
  'Евразийский национальный университет имени Л. Н. Гумилёва',
  'Satbayev University',
];

describe('wrapText', () => {
  it('keeps text that fits on one line unchanged', () => {
    expect(wrapText('Satbayev University', 200, 2, 11)).toEqual({
      lines: ['Satbayev University'],
      cut: -1,
    });
  });

  it('breaks Cyrillic labels at word boundaries so similar names stay distinct', () => {
    const a = wrapText(UNIVERSITIES[0]!, 160, 2, 11);
    const b = wrapText(UNIVERSITIES[1]!, 160, 2, 11);
    expect(a).toEqual({
      lines: ['Казахская национальная', 'академия искусств'],
      cut: -1,
    });
    expect(b.lines[0]).toBe('Казахская национальная');
    expect(b.lines[1]).toMatch(/^аграрная/);
    for (const name of UNIVERSITIES) {
      for (const line of wrapText(name, 160, 2, 11).lines)
        expect(width(line)).toBeLessThanOrEqual(160);
    }
  });

  it('breaks after a hyphen inside a word', () => {
    expect(wrapText('имени аль-Фараби', width('имени аль-'), 2, 11).lines).toEqual([
      'имени аль-',
      'Фараби',
    ]);
  });

  it('balances the lines instead of filling the first one', () => {
    expect(wrapText('Al-Farabi Kazakh National University', 180, 2, 11).lines).toEqual([
      'Al-Farabi Kazakh',
      'National University',
    ]);
  });

  it('ends the last line with an ellipsis when the text needs more lines', () => {
    const w = wrapText(UNIVERSITIES[3]!, 110, 2, 11);
    expect(w.lines).toHaveLength(2);
    expect(w.cut).toBe(1);
    expect(w.lines[1]!.endsWith('…')).toBe(true);
    for (const line of w.lines) expect(width(line)).toBeLessThanOrEqual(110);
    expect(wrapText(UNIVERSITIES[3]!, 110, 3, 11).lines).toHaveLength(3);
  });

  it('shortens a single word wider than a line and continues on the next line', () => {
    const w = wrapText('Международный университет', 70, 2, 11);
    expect(w.cut).toBe(0);
    expect(w.lines[0]!.endsWith('…')).toBe(true);
    expect(width(w.lines[0]!)).toBeLessThanOrEqual(70);
    expect(w.lines[1]).toBe('университет');
    const single = wrapText('Ақпараттандырудың', 50, 2, 11);
    expect(single).toEqual({ lines: [truncateText('Ақпараттандырудың', 50, 11)], cut: 0 });
    expect(single.lines[0]!.endsWith('…')).toBe(true);
  });

  it('shortens cut lines to cutWidth', () => {
    const w = wrapText(UNIVERSITIES[3]!, 110, 2, 11, 90);
    expect(w.lines[0]).toBe(wrapText(UNIVERSITIES[3]!, 110, 2, 11).lines[0]);
    expect(w.lines[1]!.endsWith('…')).toBe(true);
    expect(width(w.lines[1]!)).toBeLessThanOrEqual(90);
  });

  it('truncates like truncateText with one line', () => {
    expect(wrapText(UNIVERSITIES[2]!, 120, 1, 11).lines).toEqual([
      truncateText(UNIVERSITIES[2]!, 120, 11),
    ]);
  });
});

describe('wrapped category ticks', () => {
  /** Band scale whose step is `step` px for `n` categories (no padding). */
  const scaleWithStep = (labels: readonly string[], step: number) =>
    createBandScale({
      domain: labels,
      range: [0, step * labels.length],
      paddingInner: 0,
      paddingOuter: 0,
    });

  it('wraps y labels when the band step fits the lines (fontSize × 1.2 per line)', () => {
    const tall = bandTicks({
      scale: scaleWithStep(UNIVERSITIES, 40),
      direction: 'y',
      fontSize: 11,
      maxLabelWidth: 160,
      maxLines: 3,
    });
    // (40 − 2) / 13.2 → 2 lines fit even though 3 are allowed.
    expect(tall.map((t) => t.lines?.length ?? 1)).toEqual([2, 2, 2, 2, 1]);
    expect(tall[0]!.lines).toEqual(['Казахская национальная', 'академия искусств']);
    expect(tall[0]!.label).toBe('Казахская национальная академия искусств');
    expect(
      bandTicks({
        scale: scaleWithStep(UNIVERSITIES, 60),
        direction: 'y',
        fontSize: 11,
        maxLabelWidth: 160,
        maxLines: 3,
      })[3]!.lines,
    ).toHaveLength(3);

    // A step of 25 px has room for one line only: truncated as before.
    const short = bandTicks({
      scale: scaleWithStep(UNIVERSITIES, 25),
      direction: 'y',
      fontSize: 11,
      maxLabelWidth: 160,
      maxLines: 2,
    });
    expect(short.every((t) => t.lines === undefined)).toBe(true);
    expect(short[0]!.label.endsWith('…')).toBe(true);
  });

  it('wraps x labels instead of thinning when every word fits a category', () => {
    const ticks = bandTicks({
      scale: scaleWithStep(UNIVERSITIES, 145),
      direction: 'x',
      maxLines: 2,
    });
    expect(ticks).toHaveLength(UNIVERSITIES.length);
    expect(ticks[0]!.lines).toEqual(['Казахская национальная', 'академия искусств']);
    for (const t of ticks)
      for (const l of t.lines ?? [t.label]) expect(width(l)).toBeLessThanOrEqual(137);
    // Without wrapping the same axis is thinned.
    const thinned = bandTicks({ scale: scaleWithStep(UNIVERSITIES, 145), direction: 'x' });
    expect(thinned.length).toBeLessThan(UNIVERSITIES.length);
    expect(thinned.every((t) => t.lines === undefined)).toBe(true);
  });

  it('wraps x labels when their first words fit, even if a long word is cut later', () => {
    // 95 px per category: "исследовательский" is wider than a line, but every label starts
    // with whole words, so all six categories keep a label.
    const ticks = bandTicks({
      scale: scaleWithStep(UNIVERSITIES, 95),
      direction: 'x',
      maxLines: 2,
    });
    expect(ticks).toHaveLength(UNIVERSITIES.length);
    expect(ticks[1]!.lines![0]).toBe('Казахская');
    expect(ticks[1]!.lines![1]!.endsWith('…')).toBe(true);
    // Shortened lines stop minGap (8 px) short of the 87 px line to keep neighbours apart.
    for (const t of ticks)
      for (const l of t.lines ?? [])
        expect(width(l)).toBeLessThanOrEqual(l.endsWith('…') ? 79 : 87);
  });

  it('keeps thinning x labels whose first word is wider than a category', () => {
    const months = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
    ];
    const ticks = bandTicks({ scale: scaleWithStep(months, 50), direction: 'x', maxLines: 2 });
    expect(ticks.length).toBeLessThan(months.length);
    expect(ticks.every((t) => t.lines === undefined && !t.label.endsWith('…'))).toBe(true);
    // Dense multi-word labels whose first word does not fit are thinned too.
    const faculties = Array.from({ length: 12 }, (_, i) => `Faculty of studies ${i + 1}`);
    const dense = bandTicks({ scale: scaleWithStep(faculties, 36), direction: 'x', maxLines: 2 });
    expect(dense.length).toBeLessThan(faculties.length);
    expect(dense.every((t) => t.lines === undefined)).toBe(true);
  });

  it('measures wrapped labels by their widest line', () => {
    const tick: AxisTick = {
      value: 0,
      position: 0,
      label: 'Казахская национальная академия искусств',
      lines: ['Казахская национальная', 'академия искусств'],
      anchor: 'middle',
    };
    expect(tickLabelWidth(tick, 11)).toBe(width('Казахская национальная'));
    expect(maxLabelWidth([tick], 11)).toBe(width('Казахская национальная'));
  });
});

describe('computeCartesianFrame with wrapped labels', () => {
  const horizontal = (maxLines: number) =>
    computeCartesianFrame({
      width: 600,
      height: 240,
      x: { kind: 'linear', domain: [0, 100] },
      y: { kind: 'band', labels: UNIVERSITIES, maxLines },
    });

  it('sizes the left margin from the widest wrapped line', () => {
    const wrapped = horizontal(2);
    const lines = wrapped.yTicks.flatMap((t) => t.lines ?? [t.label]);
    const widest = Math.max(...lines.map(width));
    expect(wrapped.yTicks.some((t) => t.lines?.length === 2)).toBe(true);
    expect(wrapped.plot.x).toBe(4 + Math.ceil(widest) + 8);
    expect(wrapped.plot.x).toBeLessThanOrEqual(4 + Math.ceil(600 * 0.32) + 8);
    expect(wrapped.yTicks.filter((t) => t.label.endsWith('…'))).toHaveLength(0);
    // One line per label: truncated at 32% of the width.
    const single = horizontal(1);
    expect(single.yTicks.every((t) => t.lines === undefined)).toBe(true);
    expect(single.yTicks.filter((t) => t.label.endsWith('…'))).toHaveLength(4);
    // Balanced lines of a long name need less room than its truncated single line.
    const one = (maxLines: number) =>
      computeCartesianFrame({
        width: 600,
        height: 120,
        x: { kind: 'linear', domain: [0, 100] },
        y: { kind: 'band', labels: [UNIVERSITIES[2]!, 'Satbayev University'], maxLines },
      }).plot.x;
    expect(one(2)).toBeLessThan(one(1) - 10);
  });

  it('reserves a second line under the plot for wrapped x labels', () => {
    const frame = (maxLines: number) =>
      computeCartesianFrame({
        width: 900,
        height: 280,
        x: { kind: 'band', labels: UNIVERSITIES, maxLines },
        y: { kind: 'linear', domain: [0, 100] },
      });
    const one = frame(1);
    const two = frame(2);
    expect(two.xTicks.length).toBe(UNIVERSITIES.length);
    expect(Math.max(...two.xTicks.map((t) => t.lines?.length ?? 1))).toBe(2);
    expect(one.plot.height - two.plot.height).toBe(Math.ceil(11 * 1.2 * 2) - Math.ceil(11 * 1.2));
    // Short labels never wrap and keep the one-line layout.
    const short = computeCartesianFrame({
      width: 900,
      height: 280,
      x: { kind: 'band', labels: ['Mon', 'Tue'], maxLines: 2 },
      y: { kind: 'linear', domain: [0, 100] },
    });
    expect(short.plot.height).toBe(one.plot.height);
    // Deterministic: the same input gives the same layout.
    const again = frame(2);
    expect([again.plot, again.xTicks, again.yTicks]).toEqual([two.plot, two.xTicks, two.yTicks]);
  });

  it('never draws more x label lines than the layout reserved', () => {
    for (const w of [320, 480, 640, 800, 1000]) {
      const f = computeCartesianFrame({
        width: w,
        height: 280,
        x: { kind: 'band', labels: UNIVERSITIES, maxLines: 3 },
        y: { kind: 'linear', domain: [0, 100] },
      });
      const lines = Math.max(...f.xTicks.map((t) => t.lines?.length ?? 1));
      expect(f.plot.y + f.plot.height + 8 + Math.ceil(11 * 1.2 * lines) + 4).toBeLessThanOrEqual(
        280,
      );
    }
  });
});

describe('integer ticks', () => {
  it('uses step 1 for tiny domains and nice steps otherwise', () => {
    const values = (domain: [number, number], count?: number, integer = true) =>
      continuousTicks({
        scale: createLinearScale({ domain, range: [400, 0] }),
        direction: 'y',
        integer,
        ...(count ? { count } : {}),
      }).map((t) => t.value);
    expect(values([0, 2])).toEqual([0, 1, 2]);
    expect(values([0, 1], 10)).toEqual([0, 1]);
    expect(values([-2, 2])).toEqual([-2, -1, 0, 1, 2]);
    // Wide domains keep their usual nice steps.
    expect(values([0, 100])).toEqual(values([0, 100], undefined, false));
    expect(values([0.5, 1.2])).toEqual([1]);
    expect(values([0.2, 0.8])).toEqual([]);
    expect(values([0, 7])).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('labels a count axis with whole numbers only', () => {
    const scale = createLinearScale({ domain: [0, 2], range: [300, 0] });
    expect(continuousTicks({ scale, direction: 'y' }).some((t) => !Number.isInteger(t.value))).toBe(
      true,
    );
    const ticks = continuousTicks({ scale, direction: 'y', integer: true });
    expect(ticks.map((t) => t.label)).toEqual(['0', '1', '2']);
    const log = continuousTicks({
      scale: createLogScale({ domain: [0.1, 1000], range: [300, 0] }),
      direction: 'y',
      integer: true,
    });
    expect(log.length).toBeGreaterThan(1);
    expect(log.every((t) => Number.isInteger(t.value))).toBe(true);
  });

  it('rounds a nice domain out to whole numbers', () => {
    expect(resolveValueDomain([0, 2.3])).toEqual([0, 2.5]);
    expect(resolveValueDomain([0, 2.3], { integer: true })).toEqual([0, 3]);
    expect(resolveValueDomain([0, 0], { integer: true })).toEqual([0, 1]);
    expect(resolveValueDomain([0.2, 2.3], { integer: true, min: 0.5 })).toEqual([0.5, 3]);
  });

  it('applies to cartesian value axes (y and y2) and scatter axes', () => {
    const model = (integer: boolean) =>
      buildCartesianModel({
        width: 400,
        height: 300,
        x: { type: 'category', values: new Float64Array(0), labels: ['a', 'b', 'c'] },
        y: { integer },
        y2: { integer },
        series: [
          { id: 'n', label: 'n', color: 'red', type: 'bar', values: Float64Array.of(0, 1, 2) },
          {
            id: 'm',
            label: 'm',
            color: 'blue',
            type: 'line',
            values: Float64Array.of(1, 0, 1),
            axis: 'y2',
          },
        ],
      });
    expect(model(false).frame.yTicks.some((t) => !Number.isInteger(t.value))).toBe(true);
    expect(model(true).frame.yTicks.map((t) => t.label)).toEqual(['0', '1', '2']);
    expect(model(true).frame.y2Ticks.map((t) => t.label)).toEqual(['0', '1']);
    const scatter = buildScatterModel({
      width: 400,
      height: 300,
      groups: [
        {
          id: 'g',
          label: 'g',
          color: 'red',
          xs: Float64Array.of(0, 1, 3),
          ys: Float64Array.of(0, 2, 1),
        },
      ],
      x: { integer: true },
      y: { integer: true },
    });
    for (const t of [...scatter.frame.xTicks, ...scatter.frame.yTicks])
      expect(Number.isInteger(t.value)).toBe(true);
  });
});

describe('per-datum colours', () => {
  it('maps colours of unsorted time data to sorted positions', () => {
    const data = [
      { day: '2025-01-03', n: 3, color: 'red' },
      { day: '2025-01-01', n: 1, color: 'green' },
      { day: '2025-01-02', n: 2, color: undefined },
    ];
    const times = timeColumn(data, 'day');
    const order = sortIndices(times);
    const indices: number[] = [];
    const colors = mapPositions(data, order, data.length, (d, i) => {
      indices.push(i);
      return d.color;
    });
    expect(indices).toEqual([1, 2, 0]);
    expect(colors).toEqual(['green', undefined, 'red']);
    expect(mapPositions(data, null, 2, (d) => d.n)).toEqual([3, 1]);

    const model = buildCartesianModel({
      width: 400,
      height: 300,
      x: { type: 'time', values: permute(times, order), labels: [], band: true },
      series: [
        {
          id: 'n',
          label: 'n',
          color: 'blue',
          type: 'bar',
          values: permute(numbers(data), order),
          colors,
        },
      ],
    });
    const bars = model.marks.filter((m) => m.type === 'rect');
    expect(bars.map((m) => [m.index, m.fill])).toEqual([
      [0, 'green'],
      [1, 'blue'],
      [2, 'red'],
    ]);
  });
});

function numbers(data: readonly { n: number }[]): Float64Array {
  return Float64Array.from(data, (d) => d.n);
}

describe('polar layout', () => {
  it('allocates angles proportionally and skips invalid values', () => {
    const slices = pieLayout([1, 0, 3, Number.NaN, -2]);
    expect(slices.map((s) => s.index)).toEqual([0, 2]);
    expect(slices[0]!.share).toBe(0.25);
    expect(slices[1]!.endAngle).toBeCloseTo(TAU);
    expect(pieLayout([0, 0])).toEqual([]);
  });

  it('sorts slices when requested', () => {
    expect(pieLayout([1, 5, 3], { sort: true }).map((s) => s.index)).toEqual([1, 2, 0]);
  });

  it('measures angles from 12 o’clock clockwise', () => {
    expect(pointAngle(0, -10, 0, 0)).toBeCloseTo(0);
    expect(pointAngle(10, 0, 0, 0)).toBeCloseTo(Math.PI / 2);
    expect(pointAngle(-10, 0, 0, 0)).toBeCloseTo(Math.PI * 1.5);
  });

  it('hit tests slices within the ring only', () => {
    const slices = pieLayout([1, 1, 1, 1]);
    const frame = { cx: 0, cy: 0, innerRadius: 10, outerRadius: 20 };
    expect(hitTestSlices(slices, 15, -1, frame)).toBe(0); // just right of 12 o'clock
    expect(hitTestSlices(slices, 15, 1, frame)).toBe(1);
    expect(hitTestSlices(slices, -15, 1, frame)).toBe(2);
    expect(hitTestSlices(slices, 0, 0, frame)).toBe(-1); // in the hole
    expect(hitTestSlices(slices, 100, 0, frame)).toBe(-1); // outside
  });

  it('fits semicircles using their real bounding box', () => {
    const full = computePolarFrame(400, 200, { padding: 0 });
    const semi = computePolarFrame(400, 200, {
      padding: 0,
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2,
    });
    expect(full.radius).toBe(100);
    expect(semi.radius).toBe(200);
    expect(semi.cy).toBe(200);
  });
});
