import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BarChart, LineChart } from './cartesian/charts';

const data = [
  { day: '2025-01-01', a: 1, b: 2 },
  { day: '2025-01-02', a: 3, b: 1 },
  { day: '2025-01-03', a: 2, b: 4 },
];

describe('hydration', () => {
  it('hydrates server HTML without mismatches, then adapts to the real width', async () => {
    const app = (
      <div>
        <LineChart data={data} xKey="day" series={[{ key: 'a' }, { key: 'b' }]} />
        <BarChart data={data} xKey="day" yKey="a" />
      </div>
    );
    const html = renderToString(app);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, app, { onRecoverableError: (e) => recoverable.push(e) });
    });
    expect(recoverable).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    // After hydration the chart re-lays out at the measured width (600 in tests).
    expect(container.querySelector('svg.jc-surface')?.getAttribute('width')).toBe('600');
  });
});
