import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { TreemapDatum } from './hierarchy';
import { TreemapChart } from './TreemapChart';

const shop: TreemapDatum = {
  name: 'Shop',
  children: [
    {
      name: 'Electronics',
      children: [
        {
          name: 'Phones',
          children: [
            { name: 'Smart', value: 480 },
            { name: 'Basic', value: 120 },
          ],
        },
        { name: 'Laptops', value: 300 },
        { name: 'Audio', value: 100 },
      ],
    },
    {
      name: 'Grocery',
      children: [
        { name: 'Fruit', value: 200 },
        { name: 'Bakery', value: 150 },
        { name: 'Dairy', value: 50 },
      ],
    },
    { name: 'Books', value: 100 },
    { name: 'Garden', value: 0 },
    { name: 'Broken', value: -3 },
    { name: 'Missing', value: null },
  ],
};
const sales = [
  { region: 'North', city: 'Astana', product: 'Tea', amount: 40 },
  { region: 'North', city: 'Astana', product: 'Coffee', amount: 60 },
  { region: 'North', city: 'Kokshetau', product: 'Tea', amount: 25 },
  { region: 'South', city: 'Almaty', product: 'Tea', amount: 90 },
  { region: 'South', city: 'Shymkent', product: 'Coffee', amount: 35 },
  { region: 'South', city: 'Shymkent', product: 'Juice', amount: -10 },
];

const frame = () => act(() => new Promise((r) => setTimeout(r, 40)));
const surface = (c: HTMLElement) => c.querySelector('svg.jc-surface') as SVGSVGElement;
const live = (c: HTMLElement) => c.querySelector('[aria-live]')?.textContent;
const label = (c: HTMLElement, text: string) =>
  Array.from(c.querySelectorAll('.jc-label')).find((t) => t.textContent === text) as
    SVGTextElement | undefined;
/** A point inside the tile whose label reads `text` (labels sit at the top-left). */
const pointIn = (c: HTMLElement, text: string) => {
  const l = label(c, text);
  if (!l) throw new Error(`no label ${text}`);
  return { clientX: Number(l.getAttribute('x')) + 4, clientY: Number(l.getAttribute('y')) };
};

describe('TreemapChart', () => {
  it('renders hierarchical data with labels, a category legend and a data table', () => {
    const { container } = render(<TreemapChart data={shop} animation={false} />);
    // One group per visible top-level category.
    expect(container.querySelectorAll('.jc-series')).toHaveLength(3);
    expect(label(container, 'Smart')).toBeTruthy();
    expect(label(container, '480')).toBeTruthy();
    expect(label(container, 'Electronics · 1,000')).toBeTruthy();
    // Legend: top-level categories that have data, with their shares.
    const items = Array.from(container.querySelectorAll('.jc-legend-item'));
    expect(items.map((b) => b.textContent)).toEqual(['Electronics67%', 'Grocery27%', 'Books6.7%']);
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows).toHaveLength(8);
    expect(rows[0]?.textContent).toBe('Electronics › Phones › Smart48032%');
  });

  it('builds the hierarchy from flat rows', () => {
    const { container, unmount } = render(
      <TreemapChart
        data={sales}
        groupKey="region"
        subgroupKey="city"
        labelKey="product"
        valueKey="amount"
        animation={false}
      />,
    );
    const rows = Array.from(container.querySelectorAll('table tbody tr')).map((r) => r.textContent);
    expect(rows).toContain('South › Almaty › Tea9036%');
    expect(rows).toHaveLength(5); // the negative row is ignored
    expect(screen.getByRole('button', { name: /^North/ })).toBeTruthy();
    unmount();
    // Without a label key the rows of each group are summed into one tile.
    const summed = render(
      <TreemapChart data={sales} groupKey="region" valueKey="amount" animation={false} />,
    );
    const sums = Array.from(summed.container.querySelectorAll('table tbody tr')).map(
      (r) => r.textContent,
    );
    expect(sums).toEqual(['North12550%', 'South12550%']); // ties keep input order
  });

  it('hides a branch from the legend and re-lays out the rest', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TreemapChart data={shop} animation={false} onHiddenSeriesChange={onChange} />,
    );
    const electronics = screen.getByRole('button', { name: /^Electronics/ });
    fireEvent.click(electronics);
    expect(onChange).toHaveBeenCalledWith(['Electronics']);
    expect(electronics.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelectorAll('.jc-series')).toHaveLength(2);
    expect(label(container, 'Smart')).toBeUndefined();
    expect(container.querySelectorAll('table tbody tr')).toHaveLength(4);
    // Shares are recomputed against the visible total.
    expect(screen.getByRole('button', { name: /^Grocery/ }).textContent).toBe('Grocery80%');
  });

  it('announces tiles during keyboard navigation in reading order', () => {
    const onClick = vi.fn();
    const { container } = render(<TreemapChart data={shop} animation={false} onClick={onClick} />);
    const img = screen.getByRole('img');
    fireEvent.keyDown(img, { key: 'ArrowRight' });
    expect(live(container)).toBe('Electronics › Phones, Smart: 480 · 32%');
    fireEvent.keyDown(img, { key: 'ArrowRight' });
    expect(live(container)).toBe('Electronics › Phones, Basic: 120 · 8%');
    fireEvent.keyDown(img, { key: 'End' });
    expect(live(container)).toBe('Books: 100 · 6.7%');
    fireEvent.keyDown(img, { key: 'ArrowDown' });
    expect(live(container)).toMatch(/: \d+ · /);
    fireEvent.keyDown(img, { key: 'Home' });
    fireEvent.keyDown(img, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Smart',
        path: ['Electronics', 'Phones', 'Smart'],
        value: 480,
        share: 0.32,
        leaf: true,
        depth: 3,
        datum: { name: 'Smart', value: 480 },
      }),
    );
  });

  it('hit tests the deepest tile on hover and highlights a hovered group', async () => {
    const onHover = vi.fn();
    const { container } = render(
      <TreemapChart data={shop} width={600} height={360} animation={false} onHover={onHover} />,
    );
    fireEvent.pointerMove(surface(container), {
      ...pointIn(container, 'Laptops'),
      pointerType: 'mouse',
    });
    await frame();
    const tip = container.querySelector('.jc-tooltip') as HTMLElement;
    expect(tip.dataset.visible).toBe('true');
    expect(tip.textContent).toContain('Electronics');
    expect(tip.textContent).toContain('Laptops300 · 20%');
    expect(tip.textContent).toContain('30% of Electronics');
    expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Laptops' }));
    expect(container.querySelectorAll('.jc-active > g > path')).toHaveLength(2); // tile + outline
    // On a parent header: the parent is active and its leaves are redrawn above the dim layer.
    fireEvent.pointerMove(surface(container), {
      ...pointIn(container, 'Electronics · 1,000'),
      pointerType: 'mouse',
    });
    await frame();
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Electronics', leaf: false }),
    );
    expect(container.querySelector('g.jc-active .jc-series')).toBeTruthy();
  });

  it('drills down into a category and back out', async () => {
    const onDrilldown = vi.fn();
    const { container } = render(
      <TreemapChart
        data={shop}
        width={600}
        height={360}
        drilldown
        animation={false}
        onDrilldown={onDrilldown}
      />,
    );
    expect(container.querySelector('nav')).toBeNull();
    fireEvent.click(surface(container), pointIn(container, 'Smart'));
    expect(onDrilldown).toHaveBeenLastCalledWith(['Electronics']);
    const nav = container.querySelector('nav')!;
    expect(nav.textContent).toContain('Shop›Electronics');
    expect(label(container, 'Grocery · 400')).toBeUndefined();
    expect(container.querySelectorAll('.jc-series')).toHaveLength(1);
    // Second level, then back up with the keyboard and the breadcrumb.
    fireEvent.click(surface(container), pointIn(container, 'Smart'));
    expect(onDrilldown).toHaveBeenLastCalledWith(['Electronics', 'Phones']);
    expect(container.querySelector('nav')?.textContent).toContain('Electronics›Phones');
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Backspace' });
    expect(onDrilldown).toHaveBeenLastCalledWith(['Electronics']);
    fireEvent.click(screen.getByRole('button', { name: 'Shop' }));
    expect(onDrilldown).toHaveBeenLastCalledWith([]);
    expect(container.querySelector('nav')).toBeNull();
    // Leaves at the top level do not zoom.
    fireEvent.click(surface(container), pointIn(container, 'Books'));
    expect(container.querySelector('nav')).toBeNull();
  });

  it('keeps the SVG small for 2,000 leaves', () => {
    const data: TreemapDatum[] = Array.from({ length: 8 }, (_, g) => ({
      name: `Group ${g}`,
      children: Array.from({ length: 250 }, (_, l) => ({
        name: `Leaf ${g}.${l}`,
        value: 1 + ((g * 31 + l * 13) % 97),
      })),
    }));
    const { container } = render(<TreemapChart data={data} height={480} animation={false} />);
    const paths = container.querySelectorAll('.jc-series path');
    expect(paths.length).toBeLessThanOrEqual(16);
    expect(container.querySelectorAll('svg *').length).toBeLessThan(400);
    // The data table stays out of the DOM above its row limit; the description counts leaves.
    expect(container.querySelector('table')).toBeNull();
    expect(container.textContent).toContain('2000 data points');
  });

  it('handles empty, invalid-only and single-node data', () => {
    const empty = render(<TreemapChart data={[]} />);
    expect(screen.getByRole('status').textContent).toBe('No data');
    empty.unmount();
    const invalid = render(
      <TreemapChart
        data={[
          { name: 'a', value: 0 },
          { name: 'b', value: -1 },
        ]}
      />,
    );
    expect(screen.getByRole('status').textContent).toBe('No data');
    invalid.unmount();
    const single = render(<TreemapChart data={{ name: 'Only', value: 7 }} animation={false} />);
    expect(single.container.querySelectorAll('.jc-series path')).toHaveLength(1);
    expect(label(single.container, 'Only')).toBeTruthy();
    expect(single.container.querySelector('.jc-legend')).toBeNull();
  });
});

describe('TreemapChart refinements', () => {
  it('keeps the active tile labels above the emphasised marks', () => {
    const { container } = render(<TreemapChart data={shop} animation={false} />);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    const active = Array.from(container.querySelectorAll('.jc-active .jc-label')).map(
      (t) => t.textContent,
    );
    expect(active).toEqual(['Smart', '480']);
  });

  it('renders a breadcrumb that resists host page styles', () => {
    const { container } = render(
      <TreemapChart data={shop} width={600} height={360} drilldown animation={false} />,
    );
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Enter' });
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Treemap level');
    expect(nav.style.padding).toBe('0px');
    expect(nav.style.flexWrap).toBe('nowrap');
    expect(nav.querySelector('[aria-current]')?.textContent).toBe('Electronics');
  });

  it('type-checks flat-row keys', () => {
    const ok = <TreemapChart data={sales} groupKey="region" labelKey="product" valueKey="amount" />;
    // @ts-expect-error unknown field
    const badGroup = <TreemapChart data={sales} groupKey="country" valueKey="amount" />;
    // @ts-expect-error city is not numeric
    const badValue = <TreemapChart data={sales} groupKey="region" valueKey="city" />;
    expect([ok, badGroup, badValue]).toHaveLength(3);
  });
});

describe('TreemapChart controlled drill-down', () => {
  const nav = (c: HTMLElement) => c.querySelector('nav')?.textContent ?? null;

  it('follows drilldownPath and reports navigation without changing it', () => {
    const onPath = vi.fn();
    const onDrilldown = vi.fn();
    const { container, rerender } = render(
      <TreemapChart
        data={shop}
        width={600}
        height={360}
        animation={false}
        drilldownPath={['Electronics']}
        onDrilldownPathChange={onPath}
        onDrilldown={onDrilldown}
      />,
    );
    expect(nav(container)).toContain('Shop›Electronics');
    // Drilling deeper asks the owner; the view stays until the prop changes.
    fireEvent.click(surface(container), pointIn(container, 'Smart'));
    expect(onPath).toHaveBeenLastCalledWith(['Electronics', 'Phones']);
    expect(onDrilldown).toHaveBeenLastCalledWith(['Electronics', 'Phones']);
    expect(nav(container)).not.toContain('Phones');
    rerender(
      <TreemapChart
        data={shop}
        width={600}
        height={360}
        animation={false}
        drilldownPath={['Electronics', 'Phones']}
        onDrilldownPathChange={onPath}
      />,
    );
    expect(nav(container)).toContain('Electronics›Phones');
    fireEvent.click(screen.getByRole('button', { name: /Back/ }));
    expect(onPath).toHaveBeenLastCalledWith(['Electronics']);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'Backspace' });
    expect(onPath).toHaveBeenLastCalledWith(['Electronics']);
    rerender(
      <TreemapChart
        data={shop}
        width={600}
        height={360}
        animation={false}
        drilldownPath={[]}
        onDrilldownPathChange={onPath}
      />,
    );
    expect(nav(container)).toBeNull();
  });

  it('falls back to the whole tree for an unknown path', () => {
    const { container } = render(
      <TreemapChart data={shop} animation={false} drilldownPath={['Nowhere', 'Else']} />,
    );
    expect(nav(container)).toBeNull();
    expect(label(container, 'Books')).toBeTruthy();
  });

  it('round-trips through state, and drilldown={false} turns it off', () => {
    function Controlled() {
      const [path, setPath] = useState<string[]>([]);
      return (
        <>
          <TreemapChart
            data={shop}
            width={600}
            height={360}
            animation={false}
            drilldownPath={path}
            onDrilldownPathChange={setPath}
          />
          <output data-testid="path">{path.join('/')}</output>
        </>
      );
    }
    const { container, unmount } = render(<Controlled />);
    fireEvent.click(surface(container), pointIn(container, 'Smart'));
    expect(screen.getByTestId('path').textContent).toBe('Electronics');
    expect(nav(container)).toContain('Shop›Electronics');
    fireEvent.click(screen.getByRole('button', { name: 'Shop' }));
    expect(screen.getByTestId('path').textContent).toBe('');
    unmount();
    const off = render(
      <TreemapChart data={shop} animation={false} drilldown={false} drilldownPath={['Grocery']} />,
    );
    expect(nav(off.container)).toBeNull();
  });

  it('takes strings from messages, with texts as overrides', () => {
    const { container, rerender } = render(
      <TreemapChart data={shop} animation={false} locale="ru" />,
    );
    expect(container.querySelector('thead')?.textContent).toBe('КатегорияЗначениеДоля');
    rerender(<TreemapChart data={shop} animation={false} messages={{ share: 'Portion' }} />);
    expect(container.querySelector('thead')?.textContent).toBe('CategoryValuePortion');
    rerender(
      <TreemapChart
        data={shop}
        animation={false}
        messages={{ share: 'Portion' }}
        texts={{ share: 'Slice' }}
      />,
    );
    expect(container.querySelector('thead')?.textContent).toBe('CategoryValueSlice');
  });
});
