import { buildFunnelModel } from '@jafari/charts-core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FunnelChart } from './FunnelChart';

const steps = [
  { step: 'Visited', users: 12400 },
  { step: 'Signed up', users: 8300 },
  { step: 'Activated', users: 4100 },
  { step: 'Subscribed', users: 1900 },
];
const frame = () => act(() => new Promise((r) => setTimeout(r, 40)));
const surface = (c: HTMLElement) => c.querySelector('svg.jc-surface') as SVGSVGElement;
const labelTexts = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('.jc-label')).map((t) => t.textContent);
const live = (c: HTMLElement) => c.querySelector('[aria-live]')?.textContent;

describe('FunnelChart', () => {
  it('renders one series of bars, values, percentages and drop-offs', () => {
    const { container } = render(
      <FunnelChart data={steps} labelKey="step" valueKey="users" animation={false} />,
    );
    // One series group; bars batch into a single path, connectors are soft polygons.
    expect(container.querySelectorAll('.jc-series')).toHaveLength(1);
    const paths = Array.from(container.querySelectorAll('.jc-series path')) as SVGPathElement[];
    const fills = new Set(paths.map((p) => p.style.fill));
    expect(fills).toEqual(new Set(['var(--jc-series-1)']));
    expect(paths.filter((p) => p.style.fillOpacity === '')).toHaveLength(1);
    expect(paths.filter((p) => p.style.fillOpacity !== '')).toHaveLength(3);
    const labels = labelTexts(container);
    expect(labels).toEqual(
      expect.arrayContaining(['Visited', 'Subscribed', '12,400 · 100%', '8,300 · 67%']),
    );
    expect(labels).toContain('−33% / −4,100');
    // Accessible table with conversion columns; no legend for a single series.
    const table = container.querySelector('table')!;
    expect(table.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(table.querySelector('thead')?.textContent).toBe(
      'StageValueOf first stageOf previous stageDrop-off',
    );
    expect(table.querySelectorAll('tbody tr')[3]?.textContent).toBe(
      'Subscribed1,90015%46%−54% / −2,200',
    );
    expect(container.querySelector('.jc-legend')).toBeNull();
  });

  it('navigates stages with the keyboard and announces conversion', () => {
    const onClick = vi.fn();
    const { container } = render(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        animation={false}
        onClick={onClick}
      />,
    );
    const img = screen.getByRole('img');
    fireEvent.keyDown(img, { key: 'ArrowDown' });
    expect(live(container)).toBe('Visited, Value: 12,400');
    fireEvent.keyDown(img, { key: 'ArrowDown' });
    expect(live(container)).toBe(
      'Signed up, Value: 8,300, Of first stage: 67%, Of previous stage: 67%, Drop-off: −33% / −4,100',
    );
    fireEvent.keyDown(img, { key: 'End' });
    expect(live(container)).toMatch(/^Subscribed, Value: 1,900/);
    fireEvent.keyDown(img, { key: 'ArrowDown' }); // clamps at the last stage
    expect(live(container)).toMatch(/^Subscribed/);
    fireEvent.keyDown(img, { key: 'ArrowUp' });
    fireEvent.keyDown(img, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ index: 2, label: 'Activated', value: 4100, datum: steps[2] }),
    );
    const e = onClick.mock.calls[0]![0] as { ofPrevious: number; dropOff: number };
    expect(e.ofPrevious).toBeCloseTo(4100 / 8300);
    expect(e.dropOff).toBe(4200);
  });

  it('shows a tooltip and an active bar on hover, dimming the rest', async () => {
    const onHover = vi.fn();
    const { container } = render(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        width={600}
        height={300}
        animation={false}
        onHover={onHover}
      />,
    );
    const m = buildFunnelModel({
      width: 600,
      height: 300,
      values: Float64Array.from(steps, (d) => d.users),
      names: steps.map((d) => d.step),
    });
    const s = m.stages[2]!;
    fireEvent.pointerMove(surface(container), {
      clientX: s.x + s.width / 2,
      clientY: s.y + s.height / 2,
      pointerType: 'mouse',
    });
    await frame();
    const tip = container.querySelector('.jc-tooltip') as HTMLElement;
    expect(tip.dataset.visible).toBe('true');
    expect(tip.textContent).toContain('Activated');
    expect(tip.textContent).toContain('4,100');
    expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ index: 2 }));
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(1);
    expect(container.querySelector('.jc-static[data-jc-dim]')).not.toBeNull(); // whole data layer dimmed
    fireEvent.pointerLeave(surface(container), { pointerType: 'mouse' });
    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it('supports percentages of the previous stage, trapezoids and horizontal layout', () => {
    const prev = render(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        percentBase="previous"
        animation={false}
      />,
    );
    expect(labelTexts(prev.container)).toContain('4,100 · 49%');
    prev.unmount();
    const trap = render(
      <FunnelChart data={steps} labelKey="step" valueKey="users" variant="trapezoid" />,
    );
    expect(trap.container.querySelectorAll('.jc-series path')).toHaveLength(4);
    trap.unmount();
    const horizontal = render(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        orientation="horizontal"
        animation={false}
      />,
    );
    expect(labelTexts(horizontal.container)).toContain('Visited');
    expect(horizontal.container.querySelector('.jc-frame')?.getAttribute('style')).toContain(
      'height: 280px',
    );
  });

  it('handles empty, all-zero and growing funnels', () => {
    const empty = render(
      <FunnelChart data={[] as typeof steps} labelKey="step" valueKey="users" />,
    );
    expect(screen.getByRole('status').textContent).toBe('No data');
    empty.unmount();
    const zeros = render(
      <FunnelChart
        data={steps.map((d) => ({ ...d, users: 0 }))}
        labelKey="step"
        valueKey="users"
        animation={false}
      />,
    );
    expect(zeros.container.querySelectorAll('.jc-series path')).toHaveLength(0);
    expect(labelTexts(zeros.container)).toContain('Visited');
    zeros.unmount();
    const grow = render(
      <FunnelChart
        data={[
          { step: 'Trial', users: 100 },
          { step: 'Referred', users: 140 },
        ]}
        labelKey="step"
        valueKey="users"
        animation={false}
      />,
    );
    expect(labelTexts(grow.container)).toContain('+40% / +40');
  });

  it('follows a controlled active index and the locale', () => {
    const { container, rerender } = render(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        activeIndex={1}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(1);
    rerender(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        activeIndex={null}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('.jc-active path')).toHaveLength(0);
    rerender(
      <FunnelChart data={steps} labelKey="step" valueKey="users" locale="ru" animation={false} />,
    );
    const table = container.querySelector('table')!;
    expect(table.querySelector('thead')?.textContent).toContain('От первого этапа');
    expect(table.querySelectorAll('tbody tr')[1]?.textContent).toMatch(/^Signed up8\s300/);
  });
});

describe('FunnelChart refinements', () => {
  it('keeps the active stage label above the emphasised bar', () => {
    const { container } = render(
      <FunnelChart data={steps} labelKey="step" valueKey="users" animation={false} />,
    );
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowDown' });
    const active = Array.from(container.querySelectorAll('.jc-active .jc-label')).map(
      (t) => t.textContent,
    );
    expect(active).toEqual(['12,400 · 100%']);
  });

  it('type-checks its keys', () => {
    // @ts-expect-error unknown field
    const badLabel = <FunnelChart data={steps} labelKey="name" valueKey="users" />;
    // @ts-expect-error step is not numeric
    const badValue = <FunnelChart data={steps} labelKey="step" valueKey="step" />;
    expect([badLabel, badValue]).toHaveLength(2);
  });
});

describe('FunnelChart strings', () => {
  const head = (c: HTMLElement) => c.querySelector('thead')?.textContent;
  it('come from messages (en/ru/kk), with texts as overrides', () => {
    const { container, rerender } = render(
      <FunnelChart data={steps} labelKey="step" valueKey="users" locale="kk" animation={false} />,
    );
    expect(head(container)).toBe('КезеңМәнБірінші кезеңненАлдыңғы кезеңненШығын');
    rerender(
      <FunnelChart data={steps} labelKey="step" valueKey="users" locale="ru" animation={false} />,
    );
    expect(head(container)).toBe('ЭтапЗначениеОт первого этапаОт предыдущего этапаПотери');
    rerender(
      <FunnelChart
        data={steps}
        labelKey="step"
        valueKey="users"
        animation={false}
        messages={{ dropOff: 'Lost', stage: 'Step' }}
        texts={{ stage: 'Phase' }}
      />,
    );
    expect(head(container)).toBe('PhaseValueOf first stageOf previous stageLost');
  });
});
