import { buildRadarModel } from '@startupjafari/charts-core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RadarChart } from './RadarChart';

const skills = [
  { skill: 'Mathematics', alice: 92, bob: 64 },
  { skill: 'Physics', alice: 78, bob: 70 },
  { skill: 'Literature', alice: 55, bob: null },
  { skill: 'History', alice: 61, bob: 82 },
  { skill: 'Languages', alice: 70, bob: 91 },
];
const series = [
  { key: 'alice', label: 'Alice' },
  { key: 'bob', label: 'Bob' },
] as const;

const frame = () => act(() => new Promise((r) => setTimeout(r, 40)));
const dataSeries = (container: HTMLElement) =>
  container.querySelectorAll('.jc-series:not([data-jc-series="-1"])');

describe('RadarChart', () => {
  it('renders a polygon per dataset, a polygon grid, labels and accessible text', () => {
    const { container } = render(
      <RadarChart
        data={skills}
        labelKey="skill"
        series={series}
        animation={false}
        title="Skills"
      />,
    );
    expect(dataSeries(container)).toHaveLength(2);
    const grid = container.querySelector('.jc-radar-grid');
    // Rings (one path each) plus one batched path for the five spokes.
    expect(grid?.querySelectorAll('path').length).toBe(6);
    const labels = Array.from(container.querySelectorAll('.jc-label')).map((t) => t.textContent);
    expect(labels).toEqual(expect.arrayContaining(['Mathematics', 'Languages', '20', '100']));
    // Meaningful text never uses the muted tone.
    expect(container.querySelector('.jc-label[data-tone="muted"]')).toBeNull();
    const img = screen.getByRole('img', { name: /Skills/ });
    const description = document.getElementById(img.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toMatch(/Radar chart with 2 series and 10 data points/);
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows).toHaveLength(5);
    expect(rows[2]?.textContent).toBe('Literature55—');
  });

  it('shows a shared tooltip for the sector under the pointer', async () => {
    const onHover = vi.fn();
    const { container } = render(
      <RadarChart
        data={skills}
        labelKey="skill"
        series={series}
        width={600}
        height={400}
        animation={false}
        onHover={onHover}
      />,
    );
    const m = buildRadarModel({
      width: 600,
      height: 400,
      metrics: skills.map((s) => s.skill),
      series: series.map((s) => ({
        id: s.key,
        label: s.label,
        color: 'red',
        values: Float64Array.from(skills, (d) => d[s.key] ?? Number.NaN),
      })),
    });
    const svg = container.querySelector('svg.jc-surface') as SVGSVGElement;
    // Slightly clockwise of the second spoke (Physics, at 72°).
    const a = (72 + 10) * (Math.PI / 180);
    fireEvent.pointerMove(svg, {
      clientX: m.cx + Math.sin(a) * m.radius * 0.5,
      clientY: m.cy - Math.cos(a) * m.radius * 0.5,
      pointerType: 'mouse',
    });
    await frame();
    const tip = container.querySelector('.jc-tooltip') as HTMLElement;
    expect(tip.dataset.visible).toBe('true');
    expect(tip.textContent).toBe('PhysicsAlice78Bob70');
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 1, label: 'Physics', series: null, value: null }),
    );
    // Active spoke plus a marker per dataset.
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(3);
    fireEvent.pointerMove(svg, { clientX: 2, clientY: 2, pointerType: 'mouse' });
    await frame();
    expect(tip.dataset.visible).toBe('false');
  });

  it('toggles datasets from the legend', () => {
    const onChange = vi.fn();
    const { container } = render(
      <RadarChart
        data={skills}
        labelKey="skill"
        series={series}
        animation={false}
        activeIndex={0}
        onHiddenSeriesChange={onChange}
      />,
    );
    const bob = screen.getByRole('button', { name: /^Bob/ });
    fireEvent.click(bob);
    expect(onChange).toHaveBeenCalledWith(['bob']);
    expect(bob.getAttribute('aria-pressed')).toBe('false');
    expect(dataSeries(container)).toHaveLength(1);
    expect((container.querySelector('.jc-tooltip') as HTMLElement).textContent).toBe(
      'MathematicsAlice92',
    );
    // The last visible dataset cannot be hidden.
    expect((screen.getByRole('button', { name: /^Alice/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('moves between spokes (left/right) and datasets (up/down) with the keyboard', () => {
    const onClick = vi.fn();
    const { container } = render(
      <RadarChart
        data={skills}
        labelKey="skill"
        series={series}
        animation={false}
        onClick={onClick}
      />,
    );
    const layers = screen.getByRole('img');
    const live = container.querySelector('[aria-live]') as HTMLElement;
    fireEvent.keyDown(layers, { key: 'ArrowRight' });
    expect(live.textContent).toBe('Mathematics, Alice: 92, Bob: 64');
    fireEvent.keyDown(layers, { key: 'ArrowLeft' }); // wraps around
    expect(live.textContent).toBe('Languages, Alice: 70, Bob: 91');
    fireEvent.keyDown(layers, { key: 'Home' });
    fireEvent.keyDown(layers, { key: 'ArrowRight' });
    fireEvent.keyDown(layers, { key: 'ArrowRight' });
    expect(live.textContent).toBe('Literature, Alice: 55, Bob: —');
    fireEvent.keyDown(layers, { key: 'ArrowDown' }); // focus Alice
    fireEvent.keyDown(layers, { key: 'ArrowDown' }); // focus Bob
    expect(container.querySelector('.jc-tooltip-row[data-active="true"]')?.textContent).toBe(
      'Bob—',
    );
    fireEvent.keyDown(layers, { key: 'ArrowLeft' });
    fireEvent.keyDown(layers, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith({
      datum: skills[1],
      index: 1,
      label: 'Physics',
      series: 'bob',
      value: 70,
    });
  });

  it('handles negative values, few metrics and empty data', () => {
    const negative = render(
      <RadarChart
        data={[
          { k: 'A', v: -20 },
          { k: 'B', v: 40 },
          { k: 'C', v: 10 },
        ]}
        labelKey="k"
        series={[{ key: 'v' }]}
        animation={false}
      />,
    );
    const ticks = Array.from(negative.container.querySelectorAll('.jc-label')).map(
      (t) => t.textContent,
    );
    expect(ticks).toEqual(expect.arrayContaining(['-20', '0', '40']));
    // A single dataset needs no legend.
    expect(negative.container.querySelector('.jc-legend')).toBeNull();
    negative.unmount();

    const two = render(
      <RadarChart
        data={[
          { k: 'A', v: 2 },
          { k: 'B', v: 4 },
        ]}
        labelKey="k"
        series={[{ key: 'v' }]}
        animation={false}
      />,
    );
    expect(dataSeries(two.container)).toHaveLength(1);
    two.unmount();

    render(
      <RadarChart data={[] as { k: string; v: number }[]} labelKey="k" series={[{ key: 'v' }]} />,
    );
    expect(screen.getByRole('status').textContent).toBe('No data');
  });
});
