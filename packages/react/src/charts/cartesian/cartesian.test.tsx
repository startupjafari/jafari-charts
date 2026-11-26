import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { observedElementCount } from '../../hooks/useElementWidth';
import { resize } from '../../test/setup';
import { useChartCoordinates } from '../../components/ChartReference';
import { BarChart, LineChart, StackedBarChart, WaterfallChart } from './charts';

const data = [
  { day: '2025-01-01', students: 10, teachers: 3 },
  { day: '2025-01-02', students: 14, teachers: 5 },
  { day: '2025-01-03', students: 12, teachers: null },
  { day: '2025-01-04', students: 18, teachers: 6 },
];
const series = [
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
] as const;

const frame = () => act(() => new Promise((r) => setTimeout(r, 40)));

function surface(container: HTMLElement) {
  return container.querySelector('svg.jc-surface') as SVGSVGElement;
}

describe('LineChart', () => {
  it('renders lines, axes, legend and accessible text', () => {
    const { container } = render(
      <LineChart data={data} xKey="day" series={series} animation={false} title="Activity" />,
    );
    expect(container.querySelectorAll('.jc-series')).toHaveLength(2);
    expect(container.querySelectorAll('.jc-axis text').length).toBeGreaterThan(3);
    expect(screen.getByRole('button', { name: 'Students' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    const img = screen.getByRole('img', { name: /Activity/ });
    const description = document.getElementById(img.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toMatch(/Line chart with 2 series and 8 data points/);
    const table = container.querySelector('table');
    expect(table?.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(table?.textContent).toContain('—'); // missing value
  });

  it('measures its container and follows resizes', async () => {
    const { container } = render(
      <LineChart data={data} xKey="day" yKey="students" animation={false} />,
    );
    expect(surface(container).getAttribute('width')).toBe('600');
    const root = container.querySelector('.jc-root') as HTMLElement;
    act(() => resize(root, 320.7));
    expect(surface(container).getAttribute('width')).toBe('320');
  });

  it('toggles series from the legend (uncontrolled and controlled)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <LineChart
        data={data}
        xKey="day"
        series={series}
        animation={false}
        onHiddenSeriesChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Teachers' }));
    expect(onChange).toHaveBeenCalledWith(['teachers']);
    expect(container.querySelectorAll('.jc-series')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Teachers' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
    // The last visible series cannot be hidden.
    expect((screen.getByRole('button', { name: 'Students' }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    const controlled = render(
      <LineChart
        data={data}
        xKey="day"
        series={series}
        animation={false}
        hiddenSeries={['students']}
      />,
    );
    expect(controlled.container.querySelectorAll('.jc-series')).toHaveLength(1);
  });

  it('shows a tooltip on hover with values for every series', async () => {
    const onHover = vi.fn();
    const { container } = render(
      <LineChart
        data={data}
        xKey="day"
        series={series}
        width={600}
        height={300}
        animation={false}
        onHover={onHover}
      />,
    );
    fireEvent.pointerMove(surface(container), { clientX: 590, clientY: 100, pointerType: 'mouse' });
    await frame();
    const tip = container.querySelector('.jc-tooltip') as HTMLElement;
    expect(tip.dataset.visible).toBe('true');
    expect(tip.textContent).toContain('Students18');
    expect(tip.textContent).toContain('Teachers6');
    expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ index: 3, datum: data[3] }));
    expect(container.querySelector('.jc-crosshair')).toBeTruthy();
    fireEvent.pointerLeave(surface(container), { pointerType: 'mouse' });
    expect(tip.dataset.visible).toBe('false');
    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it('navigates with the keyboard and announces values', () => {
    const onClick = vi.fn();
    const { container } = render(
      <LineChart data={data} xKey="day" series={series} animation={false} onClick={onClick} />,
    );
    const layers = screen.getByRole('img');
    fireEvent.keyDown(layers, { key: 'ArrowRight' });
    const live = container.querySelector('[aria-live]') as HTMLElement;
    expect(live.textContent).toMatch(/Students: 10, Teachers: 3/);
    fireEvent.keyDown(layers, { key: 'End' });
    expect(live.textContent).toMatch(/Students: 18/);
    fireEvent.keyDown(layers, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ index: 3 }));
    fireEvent.keyDown(layers, { key: 'Escape' });
    expect(live.textContent).toBe('');
  });

  it('supports a controlled active index', () => {
    const { container, rerender } = render(
      <LineChart data={data} xKey="day" series={series} animation={false} activeIndex={1} />,
    );
    expect((container.querySelector('.jc-tooltip') as HTMLElement).textContent).toContain(
      'Students14',
    );
    rerender(
      <LineChart data={data} xKey="day" series={series} animation={false} activeIndex={null} />,
    );
    expect((container.querySelector('.jc-tooltip') as HTMLElement).dataset.visible).toBe('false');
  });

  it('sorts unsorted time data and reports original indices', () => {
    const shuffled = [data[2]!, data[0]!, data[3]!, data[1]!];
    const onClick = vi.fn();
    render(
      <LineChart data={shuffled} xKey="day" yKey="students" animation={false} onClick={onClick} />,
    );
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Home' });
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ index: 1, datum: data[0] }));
  });
});

describe('states', () => {
  it('renders empty, loading and error states without changing the height', () => {
    const empty = render(<LineChart data={[]} xKey={'day' as never} height={200} />);
    expect(screen.getByRole('status').textContent).toBe('No data');
    expect((empty.container.querySelector('.jc-frame') as HTMLElement).style.height).toBe('200px');
    empty.unmount();

    render(<LineChart data={[]} xKey={'day' as never} loading />);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
    cleanupAll();

    const retry = vi.fn();
    render(<LineChart data={data} xKey="day" yKey="students" error onRetry={retry} locale="ru" />);
    expect(screen.getByRole('alert').textContent).toContain('Не удалось загрузить диаграмму');
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('treats all-missing values as empty and keeps data while loading', () => {
    render(<LineChart data={[{ d: 'a', v: null }]} xKey="d" yKey={'v' as never} />);
    expect(screen.getByRole('status').textContent).toBe('No data');
    cleanupAll();
    const { container } = render(
      <LineChart data={data} xKey="day" yKey="students" loading animation={false} />,
    );
    expect(container.querySelector('.jc-root')?.hasAttribute('data-jc-loading')).toBe(true);
    expect(container.querySelectorAll('.jc-series').length).toBe(1);
  });
});

function cleanupAll() {
  document.body.innerHTML = '';
}

describe('bars', () => {
  const months = [
    { m: 'Jan', a: 4, b: -2 },
    { m: 'Feb', a: 6, b: 3 },
    { m: 'Jan', a: 2, b: 1 }, // duplicate category
  ];

  it('batches bars into one path per series and keeps duplicate categories', () => {
    const { container } = render(<BarChart data={months} xKey="m" yKey="a" animation={false} />);
    const paths = container.querySelectorAll('.jc-series path');
    expect(paths).toHaveLength(1);
    expect((paths[0]?.getAttribute('d')?.match(/M/g) ?? []).length).toBe(3);
    expect(
      Array.from(container.querySelectorAll('.jc-axis text')).filter(
        (t) => t.textContent === 'Jan',
      ),
    ).toHaveLength(2);
  });

  it('stacks mixed signs and shows totals in the tooltip', () => {
    const { container } = render(
      <StackedBarChart
        data={months}
        xKey="m"
        series={[{ key: 'a' }, { key: 'b' }]}
        animation={false}
        activeIndex={0}
      />,
    );
    expect(container.querySelector('.jc-tooltip')?.textContent).toContain('Total: 2');
    expect(container.querySelectorAll('.jc-series')).toHaveLength(2);
  });

  it('renders waterfall steps with change labels', () => {
    const steps = [
      { s: 'Start', v: 10 },
      { s: 'Up', v: 5 },
      { s: 'Down', v: -3 },
      { s: 'End', v: 0, total: true },
    ];
    const { container } = render(
      <WaterfallChart
        data={steps}
        xKey="s"
        yKey="v"
        isTotal={(d) => Boolean(d.total)}
        animation={false}
      />,
    );
    const labels = Array.from(container.querySelectorAll('.jc-label')).map((t) => t.textContent);
    expect(labels).toEqual(['10', '5', '-3', '12']);
  });
});

describe('lifecycle', () => {
  it('cleans up observers, frames and listeners on unmount', async () => {
    const before = observedElementCount();
    const raf = vi.spyOn(window, 'cancelAnimationFrame');
    const { container, unmount } = render(<LineChart data={data} xKey="day" series={series} />);
    expect(observedElementCount()).toBe(before + 1);
    fireEvent.pointerMove(surface(container), { clientX: 100, clientY: 100 });
    unmount();
    expect(observedElementCount()).toBe(before);
    expect(raf).toHaveBeenCalled();
    raf.mockRestore();
  });

  it('works in StrictMode with animation enabled', async () => {
    const { container } = render(
      <StrictMode>
        <LineChart data={data} xKey="day" series={series} />
      </StrictMode>,
    );
    await act(() => new Promise((r) => setTimeout(r, 300)));
    const d = container.querySelector('.jc-series path')?.getAttribute('d') ?? '';
    expect(d.length).toBeGreaterThan(10);
  });

  it('handles many series and very long labels', () => {
    const keys = Array.from({ length: 12 }, (_, i) => `s${i}`);
    const rows = Array.from({ length: 5 }, (_, i) =>
      Object.fromEntries([
        ['x', `A very long category label number ${i} that never fits`],
        ...keys.map((k, j) => [k, i * j]),
      ]),
    );
    const { container } = render(
      <BarChart
        data={rows}
        xKey="x"
        series={keys.map((k) => ({ key: k }))}
        animation={false}
        width={360}
      />,
    );
    expect(container.querySelectorAll('.jc-legend-item')).toHaveLength(12);
    for (const t of container.querySelectorAll('.jc-axis text'))
      expect((t.textContent ?? '').length).toBeLessThan(40);
  });
});

describe('syncId', () => {
  it('mirrors the active x value across charts in the same group', () => {
    const other = data.map((d) => ({ ...d, students: d.students * 2 }));
    const { container } = render(
      <>
        <LineChart data={data} xKey="day" yKey="students" syncId="g" animation={false} title="A" />
        <BarChart data={other} xKey="day" yKey="students" syncId="g" animation={false} title="B" />
        <LineChart
          data={data.slice(0, 2)}
          xKey="day"
          yKey="students"
          syncId="g"
          animation={false}
          title="C"
        />
        <LineChart data={data} xKey="day" yKey="students" animation={false} title="Unsynced" />
      </>,
    );
    const [a] = screen.getAllByRole('img');
    fireEvent.keyDown(a!, { key: 'End' });
    const tips = Array.from(container.querySelectorAll('.jc-tooltip')) as HTMLElement[];
    expect(tips.map((t) => t.dataset.visible)).toEqual(['true', 'true', 'false', 'false']);
    expect(tips[1]!.textContent).toContain('36'); // same date in the bar chart (2 × 18)
    fireEvent.keyDown(a!, { key: 'Escape' });
    expect(tips.map((t) => t.dataset.visible)).toEqual(['false', 'false', 'false', 'false']);
  });
});

describe('highlightedSeries', () => {
  it('fades every series except the highlighted one', () => {
    const { container, rerender } = render(
      <LineChart
        data={data}
        xKey="day"
        series={series}
        animation={false}
        highlightedSeries="teachers"
      />,
    );
    const dimmed = () =>
      Array.from(container.querySelectorAll('.jc-series')).map((g) =>
        g.hasAttribute('data-jc-dim'),
      );
    expect(dimmed()).toEqual([true, false]);
    rerender(
      <LineChart
        data={data}
        xKey="day"
        series={series}
        animation={false}
        highlightedSeries={null}
      />,
    );
    expect(dimmed()).toEqual([false, false]);
  });
});

describe('global listeners', () => {
  it('adds a document listener only while a touch tooltip is open', async () => {
    const add = vi.spyOn(document, 'addEventListener');
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <LineChart key={i} data={data} xKey="day" yKey="students" animation={false} />
        ))}
      </>,
    );
    expect(add.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(0);
    fireEvent.pointerDown(surface(container), { clientX: 300, clientY: 100, pointerType: 'touch' });
    await frame();
    expect(add.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(1);
    add.mockRestore();
  });
});

describe('docs-reported fixes', () => {
  it('reads integer epoch-ms x values as time', () => {
    const rows = [0, 1, 2].map((i) => ({ t: Date.UTC(2025, 0, 1 + i), v: i + 1 }));
    const { container } = render(<LineChart data={rows} xKey="t" yKey="v" animation={false} />);
    const labels = Array.from(
      container.querySelectorAll('.jc-axis[data-position="bottom"] text'),
    ).map((t) => t.textContent);
    expect(labels.join(' ')).toMatch(/Jan|2025/);
    expect(labels.join(' ')).not.toMatch(/T$/);
  });

  it('shows an explicitly requested legend for a single series', () => {
    const { container } = render(
      <LineChart data={data} xKey="day" yKey="students" legend animation={false} />,
    );
    expect(container.querySelectorAll('.jc-legend-item')).toHaveLength(1);
  });

  it('positions pixel primitives from data values with useChartCoordinates', () => {
    function Dot() {
      const { x, y } = useChartCoordinates();
      return <circle data-testid="dot" cx={x('2025-01-04')} cy={y(18)} r={3} />;
    }
    const { container } = render(
      <LineChart data={data} xKey="day" yKey="students" animation={false}>
        <Dot />
      </LineChart>,
    );
    const dot = container.querySelector('[data-testid="dot"]') as SVGCircleElement;
    const active = Number(dot.getAttribute('cx'));
    expect(active).toBeGreaterThan(500); // last date sits at the right edge
    expect(Number(dot.getAttribute('cy'))).toBeLessThan(60); // max value near the top
  });
});

describe('localised accessible description', () => {
  it('names the chart type in the chart locale', () => {
    render(
      <LineChart
        data={data}
        xKey="day"
        series={series}
        locale="ru"
        animation={false}
        title="Активность"
      />,
    );
    const img = screen.getByRole('img', { name: /Активность/ });
    const description = document.getElementById(img.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toMatch(/^Линейный график: 2 ряда, 8 точек данных\./);
  });
});
