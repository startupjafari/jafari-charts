import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CalendarHeatmap } from './CalendarHeatmap';
import { HeatmapChart } from './HeatmapChart';

const cells = [
  { x: 'a', y: 'r1', v: 1 },
  { x: 'b', y: 'r1', v: 2 },
  { x: 'a', y: 'r2', v: 3 },
];
const days = [
  { date: '2025-03-01', n: 2 },
  { date: '2025-03-14', n: 5 },
];

describe('heatmaps on the server (no DOM)', () => {
  it('render deterministic HTML at the initial width', () => {
    expect(typeof window).toBe('undefined');
    for (const chart of [
      <HeatmapChart key="h" data={cells} xKey="x" yKey="y" valueKey="v" />,
      <CalendarHeatmap key="c" data={days} dateKey="date" valueKey="n" />,
    ]) {
      const html = renderToString(chart);
      expect(html).toContain('<svg');
      expect(html).toContain('width="640"');
      expect(renderToString(chart)).toBe(html);
    }
  });
});
