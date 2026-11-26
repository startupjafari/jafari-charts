import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  BarChart,
  ComboChart,
  GroupedBarChart,
  HorizontalBarChart,
  LineChart,
  StackedBarChart,
  WaterfallChart,
} from './cartesian/charts';
import { ScatterChart } from './scatter/ScatterChart';

// jsdom: every element reports a 600 × 300 box at (0, 0), so client = chart pixels.
const surface = (c: HTMLElement) => c.querySelector('svg.jc-surface') as SVGSVGElement;
const img = () => screen.getByRole('img');
const live = (c: HTMLElement) => c.querySelector('[aria-live]')?.textContent ?? '';
const description = (c: HTMLElement) => c.querySelector('p.jc-sr-only')?.textContent ?? '';
const ticks = (c: HTMLElement, position: 'bottom' | 'left') =>
  Array.from(c.querySelectorAll(`.jc-axis[data-position="${position}"] text`)).map(
    (t) => t.textContent,
  );

function wheel(el: Element, init: WheelEventInit) {
  const e = new WheelEvent('wheel', {
    clientX: 300,
    clientY: 150,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    el.dispatchEvent(e);
  });
  return e;
}

function drag(el: Element, from: [number, number], to: [number, number], init = {}) {
  const base = { pointerId: 1, pointerType: 'mouse', button: 0, ...init };
  fireEvent.pointerDown(el, { ...base, clientX: from[0], clientY: from[1] });
  fireEvent.pointerMove(el, { ...base, clientX: (from[0] + to[0]) / 2, clientY: to[1] });
  fireEvent.pointerMove(el, { ...base, clientX: to[0], clientY: to[1] });
  fireEvent.pointerUp(el, { ...base, clientX: to[0], clientY: to[1] });
}

// ---- Scatter ---------------------------------------------------------------------------------

const points = Array.from({ length: 21 }, (_, i) => ({ x: i * 5, y: (i * 37) % 100, id: i }));

describe('ScatterChart zoom', () => {
  it('zooms both axes with Ctrl + wheel only, and resets with the button', () => {
    const onX = vi.fn();
    const onY = vi.fn();
    const { container } = render(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        zoom
        width={600}
        animation={false}
        onXDomainChange={onX}
        onYDomainChange={onY}
      />,
    );
    const before = ticks(container, 'bottom');
    const plain = wheel(surface(container), { deltaY: -300 });
    expect(plain.defaultPrevented).toBe(false);
    expect(onX).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();

    const zoomIn = wheel(surface(container), { deltaY: -300, ctrlKey: true });
    expect(zoomIn.defaultPrevented).toBe(true);
    const [x0, x1] = onX.mock.lastCall![0] as [number, number];
    const [y0, y1] = onY.mock.lastCall![0] as [number, number];
    expect(x1 - x0).toBeLessThan(100);
    expect(y1 - y0).toBeLessThan(100);
    expect(ticks(container, 'bottom')).not.toEqual(before);
    // Fewer points are drawn (and described).
    expect(description(container)).not.toMatch(/21 data points/);

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(onX).toHaveBeenLastCalledWith(null);
    expect(onY).toHaveBeenLastCalledWith(null);
    expect(ticks(container, 'bottom')).toEqual(before);
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
  });

  it('follows controlled domains: only visible points are drawn and reachable', () => {
    const onHover = vi.fn();
    const { container, rerender } = render(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        zoom
        xDomain={[20, 40]}
        yDomain={null}
        width={600}
        animation={false}
        onHover={onHover}
      />,
    );
    // x = 20…40 → five points.
    expect(description(container)).toMatch(/5 data points/);
    fireEvent.keyDown(img(), { key: 'Home' });
    expect(live(container)).toMatch(/x: 20/);
    fireEvent.keyDown(img(), { key: 'End' });
    expect(live(container)).toMatch(/x: 40/);
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeTruthy();
    rerender(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        zoom
        xDomain={null}
        yDomain={null}
        width={600}
        animation={false}
      />,
    );
    expect(description(container)).toMatch(/21 data points/);
  });

  it('zooms, pans and resets from the keyboard with announcements', () => {
    const onX = vi.fn();
    const { container, rerender } = render(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        zoom
        width={600}
        animation={false}
        onXDomainChange={onX}
      />,
    );
    fireEvent.keyDown(img(), { key: '+' });
    const [a, b] = onX.mock.lastCall![0] as [number, number];
    expect(b - a).toBeGreaterThan(0);
    expect(live(container)).toMatch(/^Showing x .* – .*; y .* – .*$/);
    fireEvent.keyDown(img(), { key: '0' });
    expect(onX).toHaveBeenLastCalledWith(null);

    // Shift + arrows pan a zoomed axis by 10% of its span.
    rerender(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        zoom
        xDomain={[20, 40]}
        width={600}
        animation={false}
        onXDomainChange={onX}
      />,
    );
    fireEvent.keyDown(img(), { key: 'ArrowRight', shiftKey: true });
    const [c, d] = onX.mock.lastCall![0] as [number, number];
    expect(c).toBeCloseTo(22);
    expect(d).toBeCloseTo(42);
  });

  it('brushes a rectangle, reports values and points, and zooms into it', () => {
    const onBrush = vi.fn();
    const onX = vi.fn();
    const onY = vi.fn();
    const { container } = render(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        brush
        zoom
        width={600}
        animation={false}
        onBrush={onBrush}
        onXDomainChange={onX}
        onYDomainChange={onY}
      />,
    );
    drag(surface(container), [150, 60], [450, 230]);
    expect(container.querySelector('.jc-brush')).toBeNull(); // removed on release
    expect(onBrush).toHaveBeenCalledTimes(1);
    const { x, y, indices } = onBrush.mock.lastCall![0] as {
      x: [number, number];
      y: [number, number];
      indices: number[];
    };
    expect(x[0]).toBeLessThan(x[1]);
    expect(y[0]).toBeLessThan(y[1]);
    const inside = points
      .filter((p) => p.x >= x[0] && p.x <= x[1] && p.y >= y[0] && p.y <= y[1])
      .map((p) => p.id);
    expect(indices).toEqual(inside);
    expect(indices.length).toBeGreaterThan(0);
    expect(onX.mock.lastCall![0][0]).toBeCloseTo(x[0]);
    expect(onY.mock.lastCall![0][1]).toBeCloseTo(y[1]);
    expect(live(container)).toMatch(/^Selected x/);
  });

  it('shows the brush while dragging and ignores tiny drags and touch', () => {
    const onBrush = vi.fn();
    const { container } = render(
      <ScatterChart
        data={points}
        xKey="x"
        yKey="y"
        brush
        width={600}
        animation={false}
        onBrush={onBrush}
      />,
    );
    const el = surface(container);
    const base = { pointerId: 1, pointerType: 'mouse', button: 0 };
    fireEvent.pointerDown(el, { ...base, clientX: 200, clientY: 80 });
    fireEvent.pointerMove(el, { ...base, clientX: 300, clientY: 160 });
    const rect = container.querySelector('.jc-brush')!;
    expect(Number(rect.getAttribute('width'))).toBe(100);
    expect(Number(rect.getAttribute('height'))).toBe(80);
    fireEvent.pointerUp(el, { ...base, clientX: 300, clientY: 160 });
    drag(el, [200, 80], [202, 160]);
    expect(onBrush).toHaveBeenCalledTimes(1);
    drag(el, [200, 80], [400, 200], { pointerType: 'touch' });
    expect(onBrush).toHaveBeenCalledTimes(1);
    // Without zoom there is no reset control.
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
  });
});

// ---- Categorical zoom --------------------------------------------------------------------------

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const sales = months.map((month, i) => ({ month, a: 10 + i, b: 20 - i }));

function ControlledBars(props: { initial: readonly [number, number] | null; brush?: boolean }) {
  const [range, setRange] = useState<readonly [number, number] | null>(props.initial);
  return (
    <>
      <BarChart
        data={sales}
        xKey="month"
        yKey="a"
        zoom
        brush={props.brush ?? false}
        categoryRange={range}
        onCategoryRangeChange={setRange}
        width={600}
        animation={false}
      />
      <output data-testid="range">{range ? range.join('-') : 'all'}</output>
    </>
  );
}

describe('categorical zoom (band axes)', () => {
  it('zooms a category window with Ctrl + wheel, never with a plain wheel', () => {
    const onRange = vi.fn();
    const { container } = render(
      <BarChart
        data={sales}
        xKey="month"
        yKey="a"
        zoom
        width={600}
        animation={false}
        onCategoryRangeChange={onRange}
      />,
    );
    expect(ticks(container, 'bottom')).toHaveLength(12);
    expect(wheel(surface(container), { deltaY: -400 }).defaultPrevented).toBe(false);
    expect(onRange).not.toHaveBeenCalled();
    wheel(surface(container), { deltaY: -400, ctrlKey: true });
    const [s, e] = onRange.mock.lastCall![0] as [number, number];
    expect(e - s + 1).toBeLessThan(12);
    expect(ticks(container, 'bottom')).toEqual(months.slice(s, e + 1));
    // Zooming out again returns every category.
    for (let i = 0; i < 4; i++) wheel(surface(container), { deltaY: 400, ctrlKey: true });
    expect(onRange).toHaveBeenLastCalledWith(null);
    expect(ticks(container, 'bottom')).toHaveLength(12);
  });

  it('accumulates small wheel steps into whole categories', () => {
    const onRange = vi.fn();
    const { container } = render(
      <BarChart
        data={sales}
        xKey="month"
        yKey="a"
        zoom
        width={600}
        animation={false}
        onCategoryRangeChange={onRange}
      />,
    );
    // A trackpad pinch sends many tiny deltas; each alone is less than one category.
    for (let i = 0; i < 20; i++) wheel(surface(container), { deltaY: -10, ctrlKey: true });
    expect(onRange).toHaveBeenCalled();
    const [s, e] = onRange.mock.lastCall![0] as [number, number];
    expect(e - s + 1).toBeLessThan(12);
  });

  it('renders a controlled window, navigates inside it and pans with Shift + arrows', () => {
    const { container } = render(<ControlledBars initial={[2, 5]} />);
    expect(ticks(container, 'bottom')).toEqual(['Mar', 'Apr', 'May', 'Jun']);
    fireEvent.keyDown(img(), { key: 'Home' });
    expect(live(container)).toMatch(/^Mar/);
    fireEvent.keyDown(img(), { key: 'End' });
    expect(live(container)).toMatch(/^Jun/);
    fireEvent.keyDown(img(), { key: 'ArrowRight', shiftKey: true });
    expect(screen.getByTestId('range').textContent).toBe('3-6');
    expect(live(container)).toBe('Showing Apr – Jul');
    expect(ticks(container, 'bottom')).toEqual(['Apr', 'May', 'Jun', 'Jul']);
    fireEvent.keyDown(img(), { key: 'ArrowLeft', shiftKey: true });
    fireEvent.keyDown(img(), { key: 'ArrowLeft', shiftKey: true });
    expect(screen.getByTestId('range').textContent).toBe('1-4');
    // A plain arrow navigates again (and replaces the announcement).
    fireEvent.keyDown(img(), { key: 'ArrowRight' });
    expect(live(container)).not.toMatch(/^Showing/);
  });

  it('zooms with + / - and resets with 0, the button or a double click', () => {
    const { container } = render(<ControlledBars initial={null} />);
    const range = () => screen.getByTestId('range').textContent;
    fireEvent.keyDown(img(), { key: '+' });
    expect(range()).not.toBe('all');
    expect(live(container)).toMatch(/^Showing \w+ – \w+$/);
    fireEvent.keyDown(img(), { key: '0' });
    expect(range()).toBe('all');
    fireEvent.keyDown(img(), { key: '+' });
    fireEvent.keyDown(img(), { key: '+' });
    fireEvent.keyDown(img(), { key: '-' });
    expect(range()).not.toBe('all');
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(range()).toBe('all');
    fireEvent.keyDown(img(), { key: '+' });
    fireEvent.doubleClick(surface(container));
    expect(range()).toBe('all');
  });

  it('pans a zoomed window by dragging', () => {
    const { container } = render(<ControlledBars initial={[0, 3]} />);
    drag(surface(container), [500, 150], [100, 150]);
    const [s, e] = screen.getByTestId('range').textContent!.split('-').map(Number);
    expect(s).toBeGreaterThan(0);
    expect(e! - s!).toBe(3);
  });

  it('brushes a category range with raw x values, and zooms into it with zoom', () => {
    const onBrush = vi.fn();
    const { container, unmount } = render(
      <StackedBarChart
        data={sales}
        xKey="month"
        series={[{ key: 'a' }, { key: 'b' }]}
        brush
        width={600}
        animation={false}
        onBrush={onBrush}
      />,
    );
    drag(surface(container), [150, 150], [400, 150]);
    const e = onBrush.mock.lastCall![0] as {
      from: string;
      to: string;
      startIndex: number;
      endIndex: number;
    };
    expect(e.from).toBe(months[e.startIndex]);
    expect(e.to).toBe(months[e.endIndex]);
    expect(e.endIndex).toBeGreaterThan(e.startIndex);
    expect(live(container)).toBe(`Selected ${e.from} – ${e.to}`);
    unmount();

    const zoomed = render(<ControlledBars initial={null} brush />);
    drag(surface(zoomed.container), [150, 150], [400, 150]);
    const [s, end] = screen.getByTestId('range').textContent!.split('-').map(Number);
    expect(ticks(zoomed.container, 'bottom')).toEqual(months.slice(s, end! + 1));
    // Shift + drag pans instead of brushing when zoomed.
    drag(surface(zoomed.container), [400, 150], [100, 150], { shiftKey: true });
    expect(screen.getByTestId('range').textContent).not.toBe(`${s}-${end}`);
  });

  it('windows horizontal bars along y', () => {
    const onRange = vi.fn();
    const { container } = render(
      <HorizontalBarChart
        data={sales}
        xKey="month"
        yKey="a"
        zoom
        categoryRange={[0, 2]}
        onCategoryRangeChange={onRange}
        width={600}
        animation={false}
      />,
    );
    expect(ticks(container, 'left')).toEqual(['Jan', 'Feb', 'Mar']);
    fireEvent.keyDown(img(), { key: 'ArrowDown', shiftKey: true });
    expect(onRange).toHaveBeenLastCalledWith([1, 3]);
  });

  it('works for grouped, combo, waterfall and category line charts', () => {
    const range = [3, 6] as const;
    const expected = months.slice(3, 7);
    const charts = [
      <GroupedBarChart
        key="g"
        data={sales}
        xKey="month"
        series={[{ key: 'a' }, { key: 'b' }]}
        categoryRange={range}
        width={600}
        animation={false}
      />,
      <ComboChart
        key="c"
        data={sales}
        xKey="month"
        series={[{ key: 'a' }, { key: 'b', type: 'line' }]}
        categoryRange={range}
        width={600}
        animation={false}
      />,
      <WaterfallChart
        key="w"
        data={sales}
        xKey="month"
        yKey="a"
        categoryRange={range}
        width={600}
        animation={false}
      />,
      <LineChart
        key="l"
        data={sales}
        xKey="month"
        yKey="a"
        categoryRange={range}
        width={600}
        animation={false}
      />,
    ];
    for (const chart of charts) {
      const { container, unmount } = render(chart);
      expect(ticks(container, 'bottom')).toEqual(expected);
      unmount();
    }
  });

  it('keeps continuous zoom on the x domain', () => {
    const series = Array.from({ length: 50 }, (_, i) => ({ t: i, v: Math.sin(i / 5) }));
    const onX = vi.fn();
    const onRange = vi.fn();
    const onBrush = vi.fn();
    const { container } = render(
      <LineChart
        data={series}
        xKey="t"
        yKey="v"
        zoom
        brush
        width={600}
        animation={false}
        onXDomainChange={onX}
        onCategoryRangeChange={onRange}
        onBrush={onBrush}
      />,
    );
    expect(wheel(surface(container), { deltaY: -300 }).defaultPrevented).toBe(false);
    expect(onX).not.toHaveBeenCalled();
    wheel(surface(container), { deltaY: -300, ctrlKey: true });
    expect(onX).toHaveBeenCalledTimes(1);
    drag(surface(container), [150, 150], [400, 150]);
    expect(onBrush.mock.lastCall![0].endIndex).toBeGreaterThan(
      onBrush.mock.lastCall![0].startIndex,
    );
    expect(onX).toHaveBeenCalledTimes(2); // the brush zoomed in
    expect(onRange).not.toHaveBeenCalled();
  });
});
