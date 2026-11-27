import {
  aggregateCalendarDays,
  buildCalendarModel,
  numericColumn,
  timeColumn,
} from '@startupjafari/charts-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarHeatmap } from './CalendarHeatmap';
import { HeatmapChart } from './HeatmapChart';

const live = (c: HTMLElement) => c.querySelector('[aria-live]')?.textContent ?? '';
const paths = (c: HTMLElement) => c.querySelectorAll('.jc-series path');
const styles = (c: HTMLElement) => Array.from(paths(c)).map((p) => p.getAttribute('style') ?? '');

const scores = [
  { subject: 'Math', group: 'A', score: 10 },
  { subject: 'Math', group: 'B', score: 20 },
  { subject: 'Physics', group: 'A', score: 30 },
  { subject: 'Physics', group: 'B', score: 40 },
];

describe('HeatmapChart', () => {
  it('renders a 50×50 grid with a handful of paths and an accessible description', () => {
    const data = Array.from({ length: 2500 }, (_, i) => ({
      x: `c${i % 50}`,
      y: `r${Math.floor(i / 50)}`,
      v: (i * 37) % 101,
    }));
    const { container } = render(
      <HeatmapChart data={data} xKey="x" yKey="y" valueKey="v" width={600} animation={false} />,
    );
    expect(paths(container).length).toBeGreaterThan(0);
    expect(paths(container).length).toBeLessThanOrEqual(6);
    expect(container.querySelector('p.jc-sr-only')?.textContent).toMatch(
      /Heatmap with 1 series and 2500 data points/,
    );
    // The text equivalent: one row per y category (≤ 60 rows by default).
    expect(container.querySelectorAll('table tbody tr')).toHaveLength(50);
    expect(container.querySelectorAll('table thead th')).toHaveLength(51);
  });

  it('navigates cells with the keyboard and reports clicks', () => {
    const onClick = vi.fn();
    const { container } = render(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        width={400}
        valueLabel="Score"
        onClick={onClick}
        animation={false}
      />,
    );
    const surface = screen.getByRole('img');
    fireEvent.keyDown(surface, { key: 'ArrowRight' });
    expect(live(container)).toBe('Math · A, Score: 10');
    fireEvent.keyDown(surface, { key: 'ArrowRight' });
    expect(live(container)).toBe('Math · B, Score: 20');
    fireEvent.keyDown(surface, { key: 'ArrowRight' }); // clamps at the edge
    expect(live(container)).toBe('Math · B, Score: 20');
    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(live(container)).toBe('Physics · B, Score: 40');
    fireEvent.keyDown(surface, { key: 'ArrowLeft' });
    fireEvent.keyDown(surface, { key: 'ArrowUp' });
    expect(live(container)).toBe('Math · A, Score: 10');
    fireEvent.keyDown(surface, { key: 'End' });
    expect(live(container)).toBe('Physics · B, Score: 40');
    // Active cell: halo, cell and outline; other cells dimmed.
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(3);
    expect(container.querySelector('.jc-static[data-jc-dim]')).not.toBeNull();
    fireEvent.keyDown(surface, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        xLabel: 'B',
        yLabel: 'Physics',
        x: 'B',
        y: 'Physics',
        xIndex: 1,
        yIndex: 1,
        value: 40,
        index: 3,
        datum: scores[3],
      }),
    );
  });

  it('hit tests pointer clicks by band inversion', () => {
    const onClick = vi.fn();
    const { container } = render(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        width={400}
        height={200}
        onClick={onClick}
        animation={false}
      />,
    );
    const svg = container.querySelector('svg.jc-surface') as SVGSVGElement;
    fireEvent.click(svg, { clientX: 380, clientY: 150 });
    expect(onClick).toHaveBeenLastCalledWith(expect.objectContaining({ value: 40 }));
    fireEvent.click(svg, { clientX: 2, clientY: 2 }); // over the axis labels
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sums duplicate cells, shows missing cells and orders numeric categories', () => {
    const data = [
      { hour: 10, day: 'Mon', n: 1 },
      { hour: 9, day: 'Mon', n: 2 },
      { hour: 9, day: 'Mon', n: 3 },
      { hour: 10, day: 'Tue', n: null },
    ];
    const { container } = render(
      <HeatmapChart
        data={data}
        xKey="hour"
        yKey="day"
        valueKey="n"
        width={400}
        animation={false}
      />,
    );
    const surface = screen.getByRole('img');
    fireEvent.keyDown(surface, { key: 'Home' });
    expect(live(container)).toBe('Mon · 9, Value: 5'); // 9 sorts before 10; 2 + 3
    fireEvent.keyDown(surface, { key: 'End' });
    expect(live(container)).toBe('Tue · 10, Value: —');
    const legend = screen.getByRole('group', { name: 'Legend' });
    expect(legend.textContent).toContain('No data');
    // The hidden table lists one row per y category.
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.textContent).toBe('Mon51');
  });

  it('uses explicit category order and keeps empty columns', () => {
    const { container } = render(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        xCategories={['B', 'C', 'A']}
        yCategories={['Physics', 'Math']}
        width={400}
        animation={false}
      />,
    );
    const ticks = Array.from(container.querySelectorAll('.jc-axis[data-position=bottom] text')).map(
      (t) => t.textContent,
    );
    expect(ticks).toEqual(['B', 'C', 'A']);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Home' });
    expect(live(container)).toBe('Physics · B, Value: 40');
  });

  it('formats date categories with the locale', () => {
    const data = [
      { d: '2025-03-02', g: 'x', v: 1 },
      { d: '2025-03-01', g: 'x', v: 2 },
    ];
    const { container } = render(
      <HeatmapChart
        data={data}
        xKey="d"
        yKey="g"
        valueKey="v"
        width={400}
        locale="ru"
        animation={false}
      />,
    );
    const ticks = Array.from(container.querySelectorAll('.jc-axis[data-position=bottom] text')).map(
      (t) => t.textContent,
    );
    expect(ticks[0]).toMatch(/^1 мар/);
    expect(ticks[1]).toMatch(/^2 мар/);
  });

  it('colours signed data with a diverging scale', () => {
    const data = [
      { x: 'a', y: 'r', v: -10 },
      { x: 'b', y: 'r', v: 0 },
      { x: 'c', y: 'r', v: 10 },
      { x: 'd', y: 'r', v: null },
    ];
    const { container } = render(
      <HeatmapChart
        data={data}
        xKey="x"
        yKey="y"
        valueKey="v"
        colorScale="diverging"
        width={400}
        animation={false}
      />,
    );
    const css = styles(container).join(' ');
    expect(css).toContain('var(--jc-negative)');
    expect(css).toContain('var(--jc-positive)');
    expect(css).toContain('var(--jc-track)'); // neutral step
    expect(css).toContain('dasharray'); // missing cell: dashed outline, not the neutral fill
    const legend = screen.getByRole('group', { name: 'Legend' });
    expect(legend.textContent).toMatch(/^−?-?10.*10/);
  });

  it('labels cells that fit, using the value formatter', () => {
    const { container } = render(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        labels
        valueFormatter={(v) => `${v}%`}
        width={400}
        animation={false}
      />,
    );
    const labels = Array.from(container.querySelectorAll('.jc-label')).map((l) => l.textContent);
    expect(labels.sort()).toEqual(['10%', '20%', '30%', '40%']);
  });

  it('follows a controlled active index', () => {
    const { container, rerender } = render(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        width={400}
        activeIndex={2}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(3);
    expect(container.querySelector('.jc-tooltip')?.textContent).toContain('Physics · A');
    rerender(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        width={400}
        activeIndex={null}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(0);
  });

  it('shows the empty state without a legend', () => {
    const { container } = render(
      <HeatmapChart data={[] as typeof scores} xKey="group" yKey="subject" valueKey="score" />,
    );
    expect(screen.getByRole('status').textContent).toBe('No data');
    expect(container.querySelector('.jc-scale-legend')).toBeNull();
    const allMissing = render(
      <HeatmapChart data={[{ a: 'x', b: 'y', v: null }]} xKey="a" yKey="b" valueKey="v" />,
    );
    expect(allMissing.getAllByRole('status')[0]!.textContent).toBe('No data');
  });

  it('renders a colour-scale legend that highlights a step on hover', () => {
    const { container } = render(
      <HeatmapChart
        data={scores}
        xKey="group"
        yKey="subject"
        valueKey="score"
        buckets={3}
        width={400}
        animation={false}
      />,
    );
    const items = container.querySelectorAll('.jc-scale-legend li');
    expect(items).toHaveLength(3);
    expect(items[0]!.getAttribute('title')).toBe('10–20');
    expect(container.querySelector('.jc-scale-legend')?.textContent).toMatch(/^10.*40$/);
    fireEvent.pointerEnter(items[2]!);
    const dimmed = container.querySelectorAll('.jc-series[data-jc-dim]');
    expect(dimmed.length).toBe(container.querySelectorAll('.jc-series').length - 1);
    fireEvent.pointerLeave(items[2]!);
    expect(container.querySelectorAll('.jc-series[data-jc-dim]')).toHaveLength(0);
  });
});

/** Local ISO date of `start + i` days. */
function iso(start: Date, i: number): string {
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const year = Array.from({ length: 365 }, (_, i) => ({
  date: iso(new Date(2025, 0, 1), i),
  count: i % 7,
}));

describe('CalendarHeatmap', () => {
  it('renders days in a few batched paths with a Less/More legend and its own height', () => {
    const { container } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
      />,
    );
    expect(paths(container).length).toBeLessThanOrEqual(5);
    const legend = container.querySelector('.jc-scale-legend') as HTMLElement;
    expect(legend.textContent).toMatch(/^Less.*More$/);
    expect(legend.querySelectorAll('li')).toHaveLength(5); // empty + 4 steps
    const layers = container.querySelector('.jc-frame') as HTMLElement;
    const height = parseFloat(layers.style.height);
    expect(height).toBeGreaterThan(100);
    expect(height).toBeLessThan(160);
    expect(container.querySelector('p.jc-sr-only')?.textContent).toMatch(
      /Calendar heatmap with 1 series and 365 data points/,
    );
    const months = Array.from(container.querySelectorAll('.jc-label'))
      .map((l) => l.textContent)
      .filter((t) => t === 'Jan' || t === 'Dec');
    expect(months).toEqual(['Jan', 'Dec']);
  });

  it('moves by week horizontally and by day vertically', () => {
    const { container } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
      />,
    );
    const surface = screen.getByRole('img');
    fireEvent.keyDown(surface, { key: 'Home' });
    expect(live(container)).toBe('Wed, Jan 1, 2025, Value: 0');
    fireEvent.keyDown(surface, { key: 'ArrowRight' });
    expect(live(container)).toBe('Wed, Jan 8, 2025, Value: 0');
    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(live(container)).toBe('Thu, Jan 9, 2025, Value: 1');
    fireEvent.keyDown(surface, { key: 'ArrowLeft' });
    fireEvent.keyDown(surface, { key: 'ArrowLeft' }); // stays inside the range
    expect(live(container)).toBe('Thu, Jan 2, 2025, Value: 1');
    fireEvent.keyDown(surface, { key: 'End' });
    expect(live(container)).toBe('Wed, Dec 31, 2025, Value: 0');
  });

  it('sums duplicate dates and reports the day on click', () => {
    const onClick = vi.fn();
    const data = [
      { when: new Date(2025, 2, 1, 9), n: 2 },
      { when: '2025-03-01', n: 3 },
      { when: new Date(2025, 2, 3).getTime(), n: 1 },
    ];
    const { container } = render(
      <CalendarHeatmap
        data={data}
        dateKey="when"
        valueKey="n"
        width={600}
        valueLabel="Commits"
        onClick={onClick}
        animation={false}
      />,
    );
    const surface = screen.getByRole('img');
    fireEvent.keyDown(surface, { key: 'Home' });
    expect(live(container)).toBe('Sat, Mar 1, 2025, Commits: 5');
    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(live(container)).toBe('Sun, Mar 2, 2025, Commits: —');
    fireEvent.keyDown(surface, { key: 'ArrowUp' });
    fireEvent.keyDown(surface, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith({
      date: new Date(2025, 2, 1),
      value: 5,
      datum: data[0],
      index: 0,
    });
  });

  it('localizes week start, weekday and month names and legend text', () => {
    const { container } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        locale="ru"
        animation={false}
      />,
    );
    const labels = Array.from(container.querySelectorAll('.jc-label')).map((l) => l.textContent);
    expect(labels).toContain('пн');
    expect(labels.some((l) => l?.startsWith('янв'))).toBe(true);
    expect(container.querySelector('.jc-scale-legend')?.textContent).toMatch(/^Меньше.*Больше$/);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Home' });
    expect(live(container)).toMatch(/^ср, 1 янв\. 2025/);
    // Month summary table.
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows).toHaveLength(12);
    expect(container.querySelector('table thead')?.textContent).toContain('Месяц');
  });

  it('honours an explicit range and shows the most recent weeks when narrow', () => {
    const { container } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        from="2025-06-01"
        to="2025-06-30"
        width={600}
        animation={false}
      />,
    );
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Home' });
    expect(live(container)).toMatch(/Jun 1, 2025/);
    const narrow = render(
      <CalendarHeatmap data={year} dateKey="date" valueKey="count" width={200} animation={false} />,
    );
    const surface = narrow.getAllByRole('img')[1] as HTMLElement;
    fireEvent.keyDown(surface, { key: 'End' });
    expect(live(narrow.container)).toMatch(/Dec 31, 2025/);
    fireEvent.keyDown(surface, { key: 'Home' });
    expect(live(narrow.container)).not.toMatch(/Jan 1, 2025/);
  });

  it('shows the empty state', () => {
    const { container } = render(
      <CalendarHeatmap data={[] as typeof year} dateKey="date" valueKey="count" />,
    );
    expect(screen.getByRole('status').textContent).toBe('No data');
    expect(container.querySelector('.jc-scale-legend')).toBeNull();
  });
});

describe('CalendarHeatmap: active date and range selection', () => {
  // Same layout as the component at width 1000 (cell centres for pointer tests).
  const model = buildCalendarModel({
    width: 1000,
    days: aggregateCalendarDays(timeColumn(year, 'date'), numericColumn(year, 'count'))!,
    locale: 'en',
    colors: {},
    layout: 'auto',
  });
  const centre = (i: number) => {
    const r = model.cellRect(i)!;
    return { clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
  };
  const surfaceOf = (c: HTMLElement) => c.querySelector('svg.jc-surface') as SVGSVGElement;
  const mouse = { pointerId: 1, pointerType: 'mouse', button: 0 };
  const day = (d: Date | null) =>
    d ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : null;

  it('follows a controlled active date (Date or ISO string) and reports changes', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        activeDate="2025-01-08"
        onActiveDateChange={onChange}
      />,
    );
    expect(container.querySelector('.jc-active')).toBeTruthy();
    expect(container.querySelector('.jc-tooltip')?.textContent).toMatch(/Jan 8, 2025/);
    // Keyboard navigation asks the owner to move; the controlled day stays until it does.
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    expect(day(onChange.mock.lastCall![0])).toBe('2025-1-15');
    expect(container.querySelector('.jc-tooltip')?.textContent).toMatch(/Jan 8, 2025/);
    rerender(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        activeDate={new Date(2025, 2, 3)}
        onActiveDateChange={onChange}
      />,
    );
    expect(container.querySelector('.jc-tooltip')?.textContent).toMatch(/Mar 3, 2025/);
    rerender(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        activeDate={null}
      />,
    );
    expect(container.querySelector('.jc-active')).toBeNull();
  });

  it('reports the active day when uncontrolled', () => {
    const onChange = vi.fn();
    render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        onActiveDateChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Home' });
    expect(day(onChange.mock.lastCall![0])).toBe('2025-1-1');
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Escape' });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('selects a range by dragging and highlights it; a click clears it', () => {
    const onBrush = vi.fn();
    const { container } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        brush
        onBrush={onBrush}
      />,
    );
    const el = surfaceOf(container);
    fireEvent.pointerDown(el, { ...mouse, ...centre(10) });
    fireEvent.pointerMove(el, { ...mouse, ...centre(5) });
    expect(container.querySelector('.jc-selection path')).toBeTruthy();
    fireEvent.pointerMove(el, { ...mouse, ...centre(2) });
    fireEvent.pointerUp(el, { ...mouse, ...centre(2) });
    expect(onBrush).toHaveBeenCalledTimes(1);
    const { from, to } = onBrush.mock.lastCall![0] as { from: Date; to: Date };
    expect(day(from)).toBe('2025-1-3');
    expect(day(to)).toBe('2025-1-11');
    expect(container.querySelector('.jc-selection path')).toBeTruthy();
    expect(container.querySelector('[aria-live]')?.textContent).toBe(
      'Selected Fri, Jan 3, 2025 – Sat, Jan 11, 2025',
    );
    // A click without dragging clears the selection and reports nothing.
    fireEvent.pointerDown(el, { ...mouse, ...centre(40) });
    fireEvent.pointerUp(el, { ...mouse, ...centre(40) });
    expect(container.querySelector('.jc-selection')).toBeNull();
    expect(onBrush).toHaveBeenCalledTimes(1);
  });

  it('extends a selection with Shift + arrows and clears it with Escape', () => {
    const onBrush = vi.fn();
    const { container } = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        brush
        onBrush={onBrush}
      />,
    );
    const img = screen.getByRole('img');
    fireEvent.keyDown(img, { key: 'Home' });
    fireEvent.keyDown(img, { key: 'ArrowRight', shiftKey: true });
    let range = onBrush.mock.lastCall![0] as { from: Date; to: Date };
    expect([day(range.from), day(range.to)]).toEqual(['2025-1-1', '2025-1-8']);
    fireEvent.keyDown(img, { key: 'ArrowDown', shiftKey: true });
    range = onBrush.mock.lastCall![0] as { from: Date; to: Date };
    expect([day(range.from), day(range.to)]).toEqual(['2025-1-1', '2025-1-9']);
    expect(container.querySelector('[aria-live]')?.textContent).toBe(
      'Selected Wed, Jan 1, 2025 – Thu, Jan 9, 2025',
    );
    // The active day moved with the selection.
    expect(container.querySelector('.jc-tooltip')?.textContent).toMatch(/Jan 9, 2025/);
    expect(container.querySelector('.jc-selection path')).toBeTruthy();
    fireEvent.keyDown(img, { key: 'Escape' });
    expect(container.querySelector('.jc-selection')).toBeNull();
    // Without `brush`, Shift + arrows only navigate.
    const plain = vi.fn();
    const other = render(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        animation={false}
        onBrush={plain}
      />,
    );
    const otherImg = other.getAllByRole('img')[1] as HTMLElement;
    fireEvent.keyDown(otherImg, { key: 'Home' });
    fireEvent.keyDown(otherImg, { key: 'ArrowRight', shiftKey: true });
    expect(plain).not.toHaveBeenCalled();
  });

  it('round-trips a controlled active date through state', () => {
    function Controlled() {
      const [date, setDate] = useState<Date | string | null>('2025-02-10');
      return (
        <>
          <CalendarHeatmap
            data={year}
            dateKey="date"
            valueKey="count"
            width={1000}
            animation={false}
            activeDate={date}
            onActiveDateChange={setDate}
          />
          <output data-testid="date">{date ? day(new Date(date)) : 'none'}</output>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowDown' });
    expect(screen.getByTestId('date').textContent).toBe('2025-2-11');
  });

  it('localises the legend through messages (and overrides)', () => {
    const { container, rerender } = render(
      <CalendarHeatmap data={year} dateKey="date" valueKey="count" width={1000} locale="ru" />,
    );
    expect(container.querySelector('.jc-scale-legend')?.textContent).toMatch(/^Меньше.*Больше$/);
    rerender(
      <CalendarHeatmap
        data={year}
        dateKey="date"
        valueKey="count"
        width={1000}
        locale="kk"
        messages={{ less: 'Сирек' }}
      />,
    );
    expect(container.querySelector('.jc-scale-legend')?.textContent).toMatch(/^Сирек.*Көп$/);
  });
});
