import { estimateTextWidth } from '@jafari/charts-core';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScatterChart } from '../scatter/ScatterChart';
import { BarChart, ComboChart, HorizontalBarChart, LineChart } from './charts';

const universities = [
  { name: 'Казахская национальная академия искусств имени Т. Жургенова', users: 2 },
  { name: 'Казахская национальная аграрная исследовательский университет', users: 1 },
  { name: 'Казахский национальный университет имени аль-Фараби', users: 0 },
  { name: 'Satbayev University', users: 2 },
];

type Position = 'bottom' | 'left' | 'right';

const axis = (c: HTMLElement, position: Position) =>
  c.querySelector(`.jc-axis[data-position="${position}"]`);

/** Tick labels of an axis; wrapped labels as their lines joined by " / ". */
function tickLabels(c: HTMLElement, position: Position): string[] {
  return Array.from(axis(c, position)?.querySelectorAll('text:not(.jc-axis-title)') ?? []).map(
    (t) => {
      const spans = t.querySelectorAll('tspan');
      return spans.length
        ? Array.from(spans, (s) => s.textContent).join(' / ')
        : (t.textContent ?? '');
    },
  );
}

const title = (c: HTMLElement, position: Position) =>
  axis(c, position)?.querySelector('.jc-axis-title')?.textContent ?? null;

describe('axis props in horizontal charts', () => {
  it('xAxis configures the category axis and yAxis the value axis on any side', () => {
    const hideValues = render(
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="users"
        yAxis={{ hidden: true }}
        animation={false}
      />,
    );
    expect(axis(hideValues.container, 'bottom')).toBeNull();
    expect(tickLabels(hideValues.container, 'left')).toHaveLength(universities.length);
    expect(tickLabels(hideValues.container, 'left')[3]).toBe('Satbayev University');
    hideValues.unmount();

    const hideCategories = render(
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="users"
        xAxis={false}
        animation={false}
      />,
    );
    expect(axis(hideCategories.container, 'left')).toBeNull();
    expect(tickLabels(hideCategories.container, 'bottom')).toContain('2');
    // The category labels' margin is released, the value axis keeps its row.
    const plotLeft = Number(
      hideCategories.container.querySelector('.jc-axis-line')?.getAttribute('x1') ?? 0,
    );
    expect(plotLeft).toBeLessThan(20);
    hideCategories.unmount();

    // Vertical charts are unchanged: yAxis is the left value axis.
    const vertical = render(
      <BarChart
        data={universities}
        xKey="name"
        yKey="users"
        yAxis={{ hidden: true }}
        animation={false}
      />,
    );
    expect(axis(vertical.container, 'left')).toBeNull();
    expect(tickLabels(vertical.container, 'bottom').length).toBeGreaterThan(0);
  });

  it('puts titles and baselines on the axis of their dimension', () => {
    const { container, rerender } = render(
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="users"
        xAxis={{ title: 'University' }}
        yAxis={{ title: 'Users' }}
        animation={false}
      />,
    );
    expect(title(container, 'left')).toBe('University');
    expect(title(container, 'bottom')).toBe('Users');
    // Bars draw the category baseline by default, never the value baseline.
    expect(axis(container, 'left')?.querySelector('.jc-axis-line')).not.toBeNull();
    expect(axis(container, 'bottom')?.querySelector('.jc-axis-line')).toBeNull();
    rerender(
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="users"
        xAxis={{ line: false }}
        yAxis={{ line: true }}
        animation={false}
      />,
    );
    expect(axis(container, 'left')?.querySelector('.jc-axis-line')).toBeNull();
    expect(axis(container, 'bottom')?.querySelector('.jc-axis-line')).not.toBeNull();
  });
});

describe('wrapped category labels', () => {
  it('wraps long names on the left axis of horizontal bars, vertically centred', () => {
    const { container } = render(
      <HorizontalBarChart data={universities} xKey="name" yKey="users" animation={false} />,
    );
    const labels = tickLabels(container, 'left');
    expect(labels).toEqual([
      'Казахская национальная академия / искусств имени Т. Жургенова',
      'Казахская национальная аграрная / исследовательский университет',
      'Казахский национальный / университет имени аль-Фараби',
      'Satbayev University',
    ]);
    const spans = axis(container, 'left')?.querySelectorAll('text')[0]?.querySelectorAll('tspan');
    expect(Array.from(spans ?? [], (s) => s.getAttribute('dy'))).toEqual(['-0.6em', '1.2em']);
    // The data table keeps the full names.
    expect(container.querySelector('table')?.textContent).toContain(universities[0]!.name);
  });

  it('honours maxLines and maxLabelWidth on the category axis', () => {
    const { container, rerender } = render(
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="users"
        xAxis={{ maxLines: 1 }}
        animation={false}
      />,
    );
    expect(axis(container, 'left')?.querySelector('tspan')).toBeNull();
    expect(tickLabels(container, 'left')[0]!.endsWith('…')).toBe(true);

    rerender(
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="users"
        height={240}
        xAxis={{ maxLabelWidth: 110, maxLines: 3 }}
        animation={false}
      />,
    );
    const lines = Array.from(axis(container, 'left')?.querySelectorAll('tspan') ?? []).map(
      (s) => s.textContent ?? '',
    );
    expect(lines.length).toBeGreaterThan(6);
    for (const line of lines) expect(estimateTextWidth(line, 11)).toBeLessThanOrEqual(110);
    expect(tickLabels(container, 'left')[2]!.split(' / ')).toHaveLength(3);
  });

  it('wraps bottom category labels when every category keeps its label', () => {
    const { container } = render(
      <BarChart data={universities} xKey="name" yKey="users" width={900} animation={false} />,
    );
    const labels = tickLabels(container, 'bottom');
    expect(labels).toHaveLength(universities.length);
    // The shortened line stops `minGap` short of the category width.
    expect(labels[0]).toBe('Казахская национальная / академия искусств им…');
    expect(labels[3]).toBe('Satbayev University');
    const spans = axis(container, 'bottom')?.querySelectorAll('text')[0]?.querySelectorAll('tspan');
    expect(Array.from(spans ?? [], (s) => s.getAttribute('dy'))).toEqual(['0em', '1.2em']);
  });
});

describe('colorBy', () => {
  const rows = [
    { day: '2025-01-03', n: 3, accent: true },
    { day: '2025-01-01', n: 1, accent: false },
    { day: '2025-01-02', n: 2, accent: false },
  ];

  it('colours bars from their datum after time sorting, in bars and tooltips', () => {
    const indices: number[] = [];
    const { container, rerender } = render(
      <BarChart
        data={rows}
        xKey="day"
        series={[
          {
            key: 'n',
            color: 'blue',
            colorBy: (d, i) => {
              indices.push(i);
              return d.accent ? 'red' : undefined;
            },
          },
        ]}
        activeIndex={0}
        animation={false}
      />,
    );
    // Sorted positions 0, 1, 2 are data indices 1, 2, 0.
    expect(indices.slice(0, 3)).toEqual([1, 2, 0]);
    const fills = () =>
      Array.from(
        container.querySelectorAll<SVGPathElement>('.jc-series path'),
        (p) => p.style.fill,
      );
    expect(fills()).toEqual(['blue', 'red']);
    // activeIndex 0 is the accented datum: the tooltip key shows its colour.
    const key = container.querySelector<SVGLineElement>('.jc-tooltip .jc-key line');
    expect(key?.style.stroke).toBe('red');

    // A new callback with the same data takes effect.
    rerender(
      <BarChart
        data={rows}
        xKey="day"
        series={[{ key: 'n', color: 'blue', colorBy: (d) => (d.accent ? undefined : 'green') }]}
        animation={false}
      />,
    );
    expect(fills()).toEqual(['green', 'blue']);
  });

  it('is ignored for line series', () => {
    const { container } = render(
      <LineChart
        data={rows}
        xKey="day"
        series={[{ key: 'n', color: 'blue', colorBy: () => 'red' }]}
        animation={false}
      />,
    );
    const line = container.querySelector<SVGPathElement>('.jc-series path');
    expect(line?.style.stroke).toBe('blue');
  });
});

describe('integer value axes', () => {
  const counts = [
    { day: 'Mon', users: 0, complaints: 1 },
    { day: 'Tue', users: 2, complaints: 0 },
    { day: 'Wed', users: 1, complaints: 1 },
  ];

  it('shows whole-number ticks only', () => {
    const { container, rerender } = render(
      <BarChart data={counts} xKey="day" yKey="users" animation={false} />,
    );
    expect(tickLabels(container, 'left')).toContain('0.5');
    rerender(
      <BarChart
        data={counts}
        xKey="day"
        yKey="users"
        yAxis={{ integer: true }}
        animation={false}
      />,
    );
    expect(tickLabels(container, 'left')).toEqual(['0', '1', '2']);
    rerender(
      <HorizontalBarChart
        data={counts}
        xKey="day"
        yKey="users"
        yAxis={{ integer: true }}
        animation={false}
      />,
    );
    expect(tickLabels(container, 'bottom')).toEqual(['0', '1', '2']);
  });

  it('applies to the secondary axis and to scatter axes', () => {
    const combo = render(
      <ComboChart
        data={counts}
        xKey="day"
        series={[
          { key: 'users', type: 'bar' },
          { key: 'complaints', type: 'line', axis: 'right' },
        ]}
        y2Axis={{ integer: true }}
        animation={false}
      />,
    );
    expect(tickLabels(combo.container, 'right')).toEqual(['0', '1']);
    combo.unmount();
    const scatter = render(
      <ScatterChart
        data={counts}
        xKey="complaints"
        yKey="users"
        xAxis={{ integer: true }}
        yAxis={{ integer: true }}
        animation={false}
      />,
    );
    const ticks = [
      ...tickLabels(scatter.container, 'bottom'),
      ...tickLabels(scatter.container, 'left'),
    ];
    expect(ticks.length).toBeGreaterThan(3);
    for (const t of ticks) expect(t).toMatch(/^-?\d+$/);
  });
});
