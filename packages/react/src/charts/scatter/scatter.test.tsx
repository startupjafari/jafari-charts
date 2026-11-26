import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChartReferenceLine } from '../../components/ChartReference';
import { ScatterChart, SCATTER_CANVAS_THRESHOLD } from './ScatterChart';

const people = [
  { name: 'Ann', level: 'Bachelor', hours: 4, score: 52, credits: 30 },
  { name: 'Ben', level: 'Master', hours: 9, score: 71, credits: 60 },
  { name: 'Cid', level: 'Bachelor', hours: 6, score: 58, credits: 30 },
  { name: 'Dee', level: 'PhD', hours: 14, score: 88, credits: 120 },
  { name: 'Eve', level: 'Master', hours: 11, score: null, credits: 60 },
  { name: 'Fay', level: 'PhD', hours: 16, score: 93, credits: 120 },
];

const frame = () => act(() => new Promise((r) => setTimeout(r, 40)));

function surface(container: HTMLElement) {
  return container.querySelector('svg.jc-surface') as SVGSVGElement;
}

/** Centre of the first point drawn in a series path (circles start at `M x+r y`). */
function firstPoint(container: HTMLElement, series: number, radius = 4) {
  const d =
    container.querySelector(`.jc-series[data-jc-series="${series}"] path`)?.getAttribute('d') ?? '';
  const m = /M\s*([-\d.]+)[ ,]([-\d.]+)/.exec(d);
  return { x: Number(m?.[1]) - radius, y: Number(m?.[2]) };
}

describe('ScatterChart', () => {
  it('renders one path per group, a legend and accessible text', () => {
    const { container } = render(
      <ScatterChart
        data={people}
        xKey="hours"
        yKey="score"
        groupKey="level"
        labelKey="name"
        animation={false}
        title="Study time"
      />,
    );
    expect(container.querySelectorAll('.jc-series')).toHaveLength(3);
    expect(container.querySelectorAll('.jc-series path')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /^Bachelor/ }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    const img = screen.getByRole('img', { name: /Study time/ });
    const description = document.getElementById(img.getAttribute('aria-describedby') ?? '');
    // The point with a null score is skipped.
    expect(description?.textContent).toMatch(/Scatter chart with 3 series and 5 data points/);
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows).toHaveLength(5);
    expect(rows[0]?.textContent).toBe('Ann452');
    expect(container.querySelector('table thead')?.textContent).toBe('namehoursscore');
  });

  it('shows an item tooltip for the nearest point within the hit radius', async () => {
    const onHover = vi.fn();
    const { container } = render(
      <ScatterChart
        data={people}
        xKey="hours"
        yKey="score"
        groupKey="level"
        xLabel="Hours"
        yLabel="Score"
        width={600}
        height={300}
        animation={false}
        onHover={onHover}
      />,
    );
    const p = firstPoint(container, 2); // PhD: Dee (14, 88)
    // 15px away from the 8px marker still hits it.
    fireEvent.pointerMove(surface(container), {
      clientX: p.x + 12,
      clientY: p.y + 9,
      pointerType: 'mouse',
    });
    await frame();
    const tip = container.querySelector('.jc-tooltip') as HTMLElement;
    expect(tip.dataset.visible).toBe('true');
    expect(tip.textContent).toBe('PhDHours14Score88');
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 3, series: 'PhD', x: 14, y: 88, size: null }),
    );
    expect(container.querySelector('.jc-active path')).toBeTruthy();
    // Far from every point: nothing is active.
    fireEvent.pointerMove(surface(container), { clientX: 5, clientY: 295, pointerType: 'mouse' });
    await frame();
    expect(tip.dataset.visible).toBe('false');
    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it('toggles groups from the legend', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ScatterChart
        data={people}
        xKey="hours"
        yKey="score"
        groupKey="level"
        animation={false}
        onHiddenSeriesChange={onChange}
      />,
    );
    const master = screen.getByRole('button', { name: /^Master/ });
    fireEvent.click(master);
    expect(onChange).toHaveBeenCalledWith(['Master']);
    expect(master.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelectorAll('.jc-series path')).toHaveLength(2);
    expect(container.querySelector('.jc-series[data-jc-series="1"]')).toBeNull();
    fireEvent.click(master);
    expect(container.querySelectorAll('.jc-series path')).toHaveLength(3);
  });

  it('navigates points in x order and groups with the keyboard and announces them', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ScatterChart
        data={people}
        xKey="hours"
        yKey="score"
        groupKey="level"
        labelKey="name"
        animation={false}
        onClick={onClick}
      />,
    );
    const layers = screen.getByRole('img');
    const live = container.querySelector('[aria-live]') as HTMLElement;
    fireEvent.keyDown(layers, { key: 'ArrowRight' });
    expect(live.textContent).toBe('Ann · Bachelor, hours: 4, score: 52');
    fireEvent.keyDown(layers, { key: 'ArrowRight' });
    expect(live.textContent).toBe('Cid · Bachelor, hours: 6, score: 58');
    fireEvent.keyDown(layers, { key: 'ArrowDown' }); // Master group, nearest in x: Ben (9)
    expect(live.textContent).toBe('Ben · Master, hours: 9, score: 71');
    fireEvent.keyDown(layers, { key: 'ArrowDown' }); // PhD
    expect(live.textContent).toMatch(/^Dee · PhD/);
    fireEvent.keyDown(layers, { key: 'End' });
    expect(live.textContent).toMatch(/^Fay · PhD/);
    fireEvent.keyDown(layers, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ index: 5, series: 'PhD', datum: people[5] }),
    );
    fireEvent.keyDown(layers, { key: 'Escape' });
    expect(live.textContent).toBe('');
  });

  it('encodes bubble size by area and shows it in the tooltip', () => {
    const { container } = render(
      <ScatterChart
        data={people}
        xKey="hours"
        yKey="score"
        sizeKey="credits"
        sizeLabel="Credits"
        animation={false}
        activeIndex={3}
      />,
    );
    const img = screen.getByRole('img');
    const description = document.getElementById(img.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toMatch(/^Bubble chart/);
    expect((container.querySelector('.jc-tooltip') as HTMLElement).textContent).toContain(
      'Credits120',
    );
    expect(container.querySelector('table thead')?.textContent).toContain('Credits');
  });

  it('keeps 10 000 points in one path per group; renderer="auto" switches at the measured threshold', () => {
    const big = Array.from({ length: 10_000 }, (_, i) => ({
      g: ['a', 'b'][i % 2] as string,
      x: (i * 7919) % 1000,
      y: (i * 104729) % 977,
    }));
    const svg = render(
      <ScatterChart data={big} xKey="x" yKey="y" groupKey="g" animation={false} />,
    );
    expect(svg.container.querySelectorAll('.jc-series path')).toHaveLength(2);
    expect(svg.container.querySelectorAll('.jc-surface *').length).toBeLessThan(80);
    // Large data never renders a data table by default.
    expect(svg.container.querySelector('table')).toBeNull();
    svg.unmount();
    // `auto` follows the measured crossover: SVG at 10k points, canvas above ~75k.
    const auto = render(
      <ScatterChart data={big} xKey="x" yKey="y" groupKey="g" animation={false} renderer="auto" />,
    );
    expect(auto.container.querySelector('canvas')).toBeNull();
    auto.unmount();
    const huge = Array.from({ length: SCATTER_CANVAS_THRESHOLD + 1 }, (_, i) => ({
      x: i % 1000,
      y: (i * 7) % 977,
    }));
    const canvas = render(
      <ScatterChart data={huge} xKey="x" yKey="y" animation={false} renderer="auto" />,
    );
    expect(canvas.container.querySelector('canvas')).toBeTruthy();
    expect(canvas.container.querySelectorAll('.jc-series')).toHaveLength(0);
  });

  it('supports wide data, differentiate, reference lines and negative values', () => {
    const wide = [
      { t: -2, a: 3, b: -4 },
      { t: 0, a: 5, b: -1 },
      { t: 4, a: -2, b: 6 },
    ];
    const { container } = render(
      <ScatterChart
        data={wide}
        xKey="t"
        series={[
          { key: 'a', label: 'Alpha' },
          { key: 'b', label: 'Beta' },
        ]}
        differentiate
        animation={false}
      >
        <ChartReferenceLine y={1} label="Goal" />
      </ScatterChart>,
    );
    expect(container.querySelectorAll('.jc-series path')).toHaveLength(2);
    expect(container.querySelector('.jc-ref-line')).toBeTruthy();
    // Zero lines on both axes.
    expect(container.querySelectorAll('.jc-axis-line').length).toBe(2);
    // The second group uses a square marker (differentiate).
    const d = container.querySelector('.jc-series[data-jc-series="1"] path')?.getAttribute('d');
    expect(d).not.toMatch(/A/);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    expect(container.querySelector('[aria-live]')?.textContent).toBe('Alpha, t: -2, Alpha: 3');
  });

  it('shows the empty state for empty or all-missing data', () => {
    render(<ScatterChart data={[] as { x: number; y: number }[]} xKey="x" yKey="y" />);
    expect(screen.getByRole('status').textContent).toBe('No data');
    document.body.innerHTML = '';
    render(<ScatterChart data={[{ x: null, y: 2 }]} xKey={'x' as never} yKey="y" />);
    expect(screen.getByRole('status').textContent).toBe('No data');
  });
});
