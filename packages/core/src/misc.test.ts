import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contrastRatio,
  mixColors,
  parseColor,
  readableTextColor,
  sampleRamp,
  withAlpha,
} from './color/color';
import { formatDate, inferDateFormat } from './formatting/date';
import { getMessages } from './formatting/messages';
import {
  createTickFormat,
  formatAuto,
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
} from './formatting/number';
import { estimateTextWidth, truncateText } from './formatting/text';
import { frameThrottle } from './interaction/scheduler';
import { createStore } from './interaction/store';
import {
  clampDomain,
  isFullDomain,
  panDomain,
  wheelZoomFactor,
  zoomDomain,
} from './interaction/zoom';
import { resolveEasing } from './interpolation/easing';
import { interpolateArray, tween } from './interpolation/tween';
import { batchMarks, markPath } from './scene/draw';
import { areaGradient, type Mark } from './scene/marks';
import { transitionMarks } from './scene/transition';

describe('number formatting', () => {
  it('formats per locale', () => {
    expect(formatNumber(1234.5, { locale: 'en' })).toBe('1,234.5');
    expect(formatNumber(1234.5, { locale: 'ru' })).toBe('1 234,5');
    expect(formatNumber(1234.5, { locale: 'kk' })).toMatch(/^1\s234,5$/);
  });

  it('prints a placeholder for missing values and no negative zero', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatNumber(-0)).toBe('0');
  });

  it('supports compact, percent and currency', () => {
    expect(formatCompact(1_250_000)).toBe('1.3M');
    expect(formatCompact(12_000, 'ru')).toMatch(/12\s?тыс/);
    expect(formatPercent(0.256)).toBe('25.6%');
    expect(formatCurrency(1500, 'KZT', 'ru')).toMatch(/1\s500.*₸/);
    expect(formatAuto(0.12345)).toBe('0.1235');
    expect(formatAuto(2_500_000)).toBe('2.5M');
  });

  it('tick formats use just enough decimals', () => {
    expect([0, 0.25, 0.5].map(createTickFormat([0, 0.25, 0.5]))).toEqual(['0', '0.25', '0.5']);
    expect([0, 20_000, 40_000].map(createTickFormat([0, 20_000, 40_000]))).toEqual([
      '0',
      '20K',
      '40K',
    ]);
    expect([0, 2500, 5000].map(createTickFormat([0, 2500, 5000], 'en'))).toEqual([
      '0',
      '2,500',
      '5,000',
    ]);
  });
});

describe('date formatting', () => {
  it('formats and infers resolution', () => {
    expect(
      formatDate(Date.UTC(2025, 0, 15), {
        locale: 'en',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    ).toBe('Jan 15');
    expect(formatDate(null)).toBe('—');
    expect(
      inferDateFormat([Date.UTC(2025, 0, 1), Date.UTC(2025, 0, 2)], true).hour,
    ).toBeUndefined();
    expect(inferDateFormat([Date.UTC(2025, 0, 1, 13, 30)], true).hour).toBe('numeric');
  });
});

describe('messages', () => {
  it('resolves locales with fallback and overrides', () => {
    expect(getMessages('ru-RU').noData).toBe('Нет данных');
    expect(getMessages('kk').noData).toBe('Деректер жоқ');
    expect(getMessages('de').noData).toBe('No data');
    expect(getMessages('en', { noData: 'Nothing' }).noData).toBe('Nothing');
    expect(
      getMessages('ru').describe({ type: 'Линейный график', series: 2, points: 21 }),
    ).toContain('21 точка');
  });
});

describe('text estimation', () => {
  it('is monotonic and truncates with an ellipsis', () => {
    expect(estimateTextWidth('MMMM')).toBeGreaterThan(estimateTextWidth('iiii'));
    const t = truncateText('Satbayev University of Technology', 80, 12);
    expect(t.endsWith('…')).toBe(true);
    expect(estimateTextWidth(t, 12)).toBeLessThanOrEqual(80);
    expect(truncateText('short', 200)).toBe('short');
    expect(truncateText('anything', 1)).toBe('');
  });
});

describe('colors', () => {
  it('parses and mixes', () => {
    expect(parseColor('#3B82F6')).toEqual({ r: 59, g: 130, b: 246, a: 1 });
    expect(parseColor('rgb(1 2 3 / 50%)')).toEqual({ r: 1, g: 2, b: 3, a: 0.5 });
    expect(parseColor('var(--x)')).toBeNull();
    expect(mixColors('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixColors('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(sampleRamp(['#ffffff', '#000000'], 0.5)).not.toBe('#ffffff');
    expect(withAlpha('#ffffff', 0.5)).toBe('#ffffff80');
  });

  it('picks readable text colours', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21);
    // WCAG 2 contrast: white on blue-500 is only 3.7:1, near-black is 5.3:1.
    expect(readableTextColor('#3B82F6')).toBe('#0b0d12');
    expect(readableTextColor('#1E3A8A')).toBe('#ffffff');
    expect(readableTextColor('#F59E0B')).toBe('#0b0d12');
  });
});

describe('store', () => {
  it('notifies only on real changes', () => {
    const store = createStore({ a: 1, b: 'x' });
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.setState({ a: 1 });
    expect(listener).not.toHaveBeenCalled();
    store.setState((s) => ({ a: s.a + 1 }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState()).toEqual({ a: 2, b: 'x' });
    off();
    store.setState({ a: 3 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('frame scheduling', () => {
  afterEach(() => vi.useRealTimers());

  it('coalesces calls to one per frame with the latest arguments', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = frameThrottle(fn);
    throttled(1);
    throttled(2);
    throttled(3);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
    throttled(4);
    throttled.cancel();
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('tweens to completion and can be cancelled', () => {
    vi.useFakeTimers();
    const values: number[] = [];
    const done = vi.fn();
    tween({
      duration: 100,
      easing: resolveEasing('linear'),
      onUpdate: (t) => values.push(t),
      onComplete: done,
    });
    vi.advanceTimersByTime(300);
    expect(values.at(-1)).toBe(1);
    expect(done).toHaveBeenCalledOnce();
    const cancelled = vi.fn();
    const cancel = tween({ duration: 100, easing: resolveEasing('linear'), onUpdate: cancelled });
    cancel();
    vi.advanceTimersByTime(300);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('interpolates arrays of different lengths', () => {
    expect(Array.from(interpolateArray([0, 10], [10, 20], 0.5))).toEqual([5, 15]);
    expect(interpolateArray([0, 10], [0, 0, 0], 0).length).toBe(3);
    expect(Array.from(interpolateArray([Number.NaN], [4], 0.5))).toEqual([4]);
  });
});

describe('zoom math', () => {
  const limits = { bounds: [0, 100] as const, minSpan: 5 };
  it('zooms around the anchor and clamps to bounds', () => {
    expect(zoomDomain([0, 100], 50, 0.5, limits)).toEqual([25, 75]);
    expect(zoomDomain([0, 100], 0, 0.5, limits)).toEqual([0, 50]);
    expect(zoomDomain([40, 60], 50, 0.01, limits)).toEqual([47.5, 52.5]);
    expect(zoomDomain([25, 75], 50, 10, limits)).toEqual([0, 100]);
  });

  it('pans without leaving the bounds', () => {
    expect(panDomain([10, 30], -50, limits)).toEqual([0, 20]);
    expect(panDomain([70, 90], 50, limits)).toEqual([80, 100]);
    expect(clampDomain([60, 20], limits)).toEqual([20, 60]);
    expect(isFullDomain([0, 100], [0, 100])).toBe(true);
    expect(isFullDomain([0, 90], [0, 100])).toBe(false);
  });

  it('turns wheel deltas into bounded factors', () => {
    expect(wheelZoomFactor(-100)).toBeLessThan(1);
    expect(wheelZoomFactor(100)).toBeGreaterThan(1);
    expect(wheelZoomFactor(100_000)).toBeCloseTo(Math.E);
  });
});

describe('scene', () => {
  const bar = (key: string, x: number, fill = 'var(--jc-series-1)'): Mark => ({
    type: 'rect',
    key,
    x,
    y: 10,
    width: 10,
    height: 50,
    fill,
    enter: { y: 60, height: 0 },
  });

  it('batches same-style marks into one path', () => {
    const batches = batchMarks([
      bar('a', 0),
      bar('b', 20),
      bar('c', 40, 'red'),
      bar('d', 60, 'red'),
    ]);
    expect(batches).toHaveLength(2);
    expect(batches[0]!.count).toBe(2);
    expect(batches[0]!.d.match(/M/g)).toHaveLength(2);
    expect(batches[1]!.style.fill).toBe('red');
  });

  it('never merges areas or lines', () => {
    const line = (key: string): Mark => ({
      type: 'line',
      key,
      xs: Float64Array.of(0, 1),
      ys: Float64Array.of(0, 1),
      curve: 'linear',
      stroke: 'red',
    });
    expect(batchMarks([line('a'), line('b')])).toHaveLength(2);
  });

  it('transitions update, enter and exit by key', () => {
    const t = transitionMarks([bar('a', 0), bar('gone', 50)], [bar('a', 100), bar('new', 200)]);
    expect(t.static).toBe(false);
    const mid = t.at(0.5);
    expect(mid).toHaveLength(3);
    const a = mid.find((m) => m.key === 'a') as Extract<Mark, { type: 'rect' }>;
    expect(a.x).toBe(50);
    const entering = mid.find((m) => m.key === 'new') as Extract<Mark, { type: 'rect' }>;
    expect(entering.height).toBe(25);
    const exiting = mid.find((m) => m.key === 'gone') as Extract<Mark, { type: 'rect' }>;
    expect(exiting.height).toBe(25);
    expect(t.at(1).map((m) => m.key)).toEqual(['a', 'new']);
  });

  it('detects static transitions', () => {
    const marks = [bar('a', 0)];
    expect(transitionMarks(marks, marks).static).toBe(true);
  });

  it('renders every mark type to a path', () => {
    const marks: Mark[] = [
      bar('r', 0),
      {
        type: 'arc',
        key: 'arc',
        cx: 50,
        cy: 50,
        innerRadius: 10,
        outerRadius: 20,
        startAngle: 0,
        endAngle: 1,
      },
      {
        type: 'line',
        key: 'l',
        xs: Float64Array.of(0, 1),
        ys: Float64Array.of(0, 1),
        curve: 'monotone',
      },
      {
        type: 'area',
        key: 'ar',
        xs: Float64Array.of(0, 1),
        y1s: Float64Array.of(0, 1),
        y0s: 5,
        curve: 'linear',
      },
      {
        type: 'symbol',
        key: 's',
        xs: Float64Array.of(1, Number.NaN),
        ys: Float64Array.of(1, 1),
        size: 8,
        shape: 'square',
      },
      {
        type: 'polygon',
        key: 'p',
        xs: Float64Array.of(0, 1, 1),
        ys: Float64Array.of(0, 0, 1),
        closed: true,
      },
      { type: 'rule', key: 'ru', x1: 0, y1: 0, x2: 10, y2: 0 },
    ];
    for (const m of marks) expect(markPath(m).length).toBeGreaterThan(3);
  });

  it('builds area gradients that fade towards the baseline', () => {
    const g = areaGradient('#3B82F6', 0, 100, 100, 0.3);
    expect(g.stops.map((s) => s.opacity)).toEqual([0.3, 0]);
    const mixed = areaGradient('#3B82F6', 0, 50, 100, 0.3);
    expect(mixed.stops).toHaveLength(3);
    expect(mixed.stops[1]).toMatchObject({ offset: 0.5, opacity: 0 });
  });
});
