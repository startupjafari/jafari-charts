import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DonutChart, PieChart } from './PieChart';
import { GaugeChart, RadialProgressChart } from './RadialCharts';

const roles = [
  { role: 'Students', count: 900 },
  { role: 'Teachers', count: 96 },
  { role: 'Admins', count: 4 },
  { role: 'Ghosts', count: 0 },
];

describe('DonutChart', () => {
  it('renders one arc per positive slice and a total in the centre', () => {
    const { container } = render(
      <DonutChart data={roles} labelKey="role" valueKey="count" animation={false} />,
    );
    expect(container.querySelectorAll('.jc-series')).toHaveLength(3);
    expect(container.querySelector('.jc-center-value')?.textContent).toBe('1,000');
    expect(container.querySelector('.jc-center-label')?.textContent).toBe('Total');
    expect(screen.getByRole('button', { name: /Admins/ }).textContent).toContain('<1%');
  });

  it('shows the focused slice in the centre and calls onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <DonutChart
        data={roles}
        labelKey="role"
        valueKey="count"
        animation={false}
        onClick={onClick}
      />,
    );
    const surface = screen.getByRole('img');
    fireEvent.keyDown(surface, { key: 'ArrowRight' });
    expect(container.querySelector('.jc-center-label')?.textContent).toBe('Students');
    expect(container.querySelector('[aria-live]')?.textContent).toMatch(/Students: 900 · 90%/);
    fireEvent.keyDown(surface, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Students', value: 900, share: 0.9 }),
    );
  });

  it('recomputes shares when a slice is hidden from the legend', () => {
    const { container } = render(
      <DonutChart data={roles} labelKey="role" valueKey="count" animation={false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Hide Students/ }));
    expect(container.querySelector('.jc-center-value')?.textContent).toBe('100');
    expect(screen.getByRole('button', { name: /Teachers/ }).textContent).toContain('96%');
  });

  it('shows the empty state when nothing is positive', () => {
    render(<DonutChart data={[{ role: 'a', count: 0 }]} labelKey="role" valueKey="count" />);
    expect(screen.getByRole('status').textContent).toBe('No data');
  });
});

describe('PieChart', () => {
  it('labels slices inside when they fit and outside with names on request', () => {
    const inside = render(
      <PieChart data={roles} labelKey="role" valueKey="count" animation={false} />,
    );
    const insideLabels = Array.from(inside.container.querySelectorAll('.jc-label')).map(
      (t) => t.textContent,
    );
    expect(insideLabels).toContain('90%');
    expect(insideLabels).not.toContain('<1%'); // too small to fit
    inside.unmount();
    const outside = render(
      <PieChart data={roles} labelKey="role" valueKey="count" labels="outside" animation={false} />,
    );
    const outsideLabels = Array.from(outside.container.querySelectorAll('.jc-label')).map(
      (t) => t.textContent,
    );
    expect(outsideLabels).toContain('Students · 90%');
    expect(outsideLabels).toContain('Admins · <1%');
  });

  it('keeps duplicate labels apart', () => {
    const { container } = render(
      <PieChart
        data={[
          { n: 'x', v: 1 },
          { n: 'x', v: 2 },
        ]}
        labelKey="n"
        valueKey="v"
        animation={false}
      />,
    );
    expect(container.querySelectorAll('.jc-legend-item')).toHaveLength(2);
  });
});

describe('RadialProgressChart and GaugeChart', () => {
  it('shows the percentage of a single ring', () => {
    const { container } = render(<RadialProgressChart value={72} label="Plan" animation={false} />);
    expect(container.querySelector('.jc-center-value')?.textContent).toBe('72%');
    expect(container.querySelector('.jc-center-label')?.textContent).toBe('Plan');
  });

  it('clamps progress and lists rings in a read-only legend', () => {
    const { container } = render(
      <RadialProgressChart
        data={[
          { label: 'A', value: 150 },
          { label: 'B', value: -5 },
        ]}
        animation={false}
      />,
    );
    expect(container.querySelector('.jc-center-value')?.textContent).toBe('150%');
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    expect(buttons.every((b) => b.disabled)).toBe(true);
    // Track + value for A (clamped to a full ring), track only for B.
    expect(container.querySelectorAll('.jc-series path').length).toBeGreaterThanOrEqual(2);
  });

  it('colours the gauge by the band containing the value and draws a needle', () => {
    const bands = [
      { to: 40, color: 'red', label: 'Low' },
      { to: 75, color: 'orange', label: 'Medium' },
      { to: 100, color: 'green', label: 'High' },
    ];
    const { container, rerender } = render(
      <GaugeChart value={68} bands={bands} animation={false} />,
    );
    const fills = Array.from(container.querySelectorAll('.jc-series path')).map(
      (p) => (p as SVGPathElement).style.fill,
    );
    expect(fills).toContain('orange');
    expect(container.querySelector('.jc-center-label')?.textContent).toBe('Medium');
    rerender(<GaugeChart value={90} bands={bands} needle variant="arc" animation={false} />);
    expect(container.querySelectorAll('.jc-series path').length).toBeGreaterThanOrEqual(4);
  });
});
