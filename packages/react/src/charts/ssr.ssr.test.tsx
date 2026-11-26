import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  AreaChart,
  BarChart,
  HorizontalBarChart,
  LineChart,
  Sparkline,
  StackedAreaChart,
  WaterfallChart,
} from './cartesian/charts';

const data = [
  { day: '2025-01-01', a: 1, b: 2 },
  { day: '2025-01-02', a: 3, b: 1 },
];

describe('server rendering (no DOM)', () => {
  it('renders every chart to HTML with deterministic ids and no browser globals', () => {
    expect(typeof window).toBe('undefined');
    const charts = [
      <LineChart key="l" data={data} xKey="day" series={[{ key: 'a' }, { key: 'b' }]} />,
      <AreaChart key="a" data={data} xKey="day" yKey="a" />,
      <StackedAreaChart key="s" data={data} xKey="day" series={[{ key: 'a' }, { key: 'b' }]} />,
      <BarChart key="b" data={data} xKey="day" yKey="a" />,
      <HorizontalBarChart key="h" data={data} xKey="day" yKey="a" />,
      <WaterfallChart key="w" data={data} xKey="day" yKey="a" />,
      <Sparkline key="sp" data={data} xKey="day" yKey="a" />,
    ];
    for (const chart of charts) {
      const html = renderToString(chart);
      expect(html).toContain('<svg');
      expect(html).toContain('class="jc-root"');
      // Server layout uses the initial width so content is visible before hydration.
      expect(html).toContain('width="640"');
      expect(renderToString(chart)).toBe(html);
    }
  });

  it('emits the stylesheet for hoisting on React 19 (React 18 injects it on the client)', () => {
    const html = renderToString(<LineChart data={data} xKey="day" yKey="a" />);
    const react19 = typeof (React as { use?: unknown }).use === 'function';
    if (react19) expect(html).toMatch(/jc-root\{/);
    else expect(html).not.toMatch(/jc-root\{/); // documented: import styles.css for SSR on React 18
  });
});
