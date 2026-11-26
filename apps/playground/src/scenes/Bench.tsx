import { AreaChart, BarChart, LineChart, ScatterChart, type Renderer } from '@jafari/charts';
import { useEffect, useState, type ComponentType } from 'react';
import { flushSync } from 'react-dom';
import { rng } from '../data';

/**
 * Benchmark fixture. Query params: chart, points, charts, renderer.
 * Exposes `window.__bench` for benchmarks/run.mjs (production build only).
 */
type Row = { t: number; a: number; b: number };

function makeData(n: number, seed = 1, start = Date.UTC(2020, 0, 1)): Row[] {
  const r = rng(seed);
  let a = 500;
  let b = 300;
  const out: Row[] = new Array(n);
  for (let i = 0; i < n; i++) {
    a += (r() - 0.5) * 20;
    b += (r() - 0.5) * 14;
    out[i] = { t: start + i * 60_000, a, b };
  }
  return out;
}

type ChartProps = { data: Row[]; renderer: Renderer; animation: false };
const CHARTS: Record<string, ComponentType<ChartProps>> = {
  line: (p) => <LineChart {...p} xKey="t" series={[{ key: 'a' }, { key: 'b' }]} height={260} />,
  area: (p) => <AreaChart {...p} xKey="t" yKey="a" height={260} />,
  bar: (p) => <BarChart {...p} xKey="t" yKey="a" height={260} />,
  scatter: (p) => <ScatterChart {...p} xKey="a" yKey="b" height={260} />,
};

const params = new URLSearchParams(location.search);
const chart = params.get('chart') ?? 'line';
const points = Number(params.get('points') ?? 365);
const count = Number(params.get('charts') ?? 1);
const renderer = (params.get('renderer') ?? 'svg') as Renderer;

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

declare global {
  interface Window {
    __bench?: Record<string, (...args: number[]) => Promise<unknown>>;
  }
}

export function Bench() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => makeData(points));
  const [width, setWidth] = useState<number | null>(null);
  const Chart = CHARTS[chart] ?? (CHARTS.line as ComponentType<ChartProps>);

  useEffect(() => {
    const time = async (fn: () => void) => {
      const t0 = performance.now();
      flushSync(fn);
      await frame();
      return performance.now() - t0;
    };
    window.__bench = {
      mount: () => time(() => setMounted(true)),
      unmount: () => time(() => setMounted(false)),
      /** Replaces the dataset (filter switching). */
      update: (s = 2) => time(() => setData(makeData(points, s))),
      /** Appends one point and drops the oldest (streaming). */
      stream: () =>
        time(() =>
          setData((d) => {
            const last = d[d.length - 1] as Row;
            return [
              ...d.slice(1),
              { t: last.t + 60_000, a: last.a + Math.sin(d.length) * 5, b: last.b },
            ];
          }),
        ),
      resize: (w = 600) => time(() => setWidth(w)),
      domNodes: async () => document.querySelectorAll('#bench *').length,
      /** Moves the pointer across the first chart; returns per-move latency until the next frame. */
      hover: async (steps = 60) => {
        const el = document.querySelector(
          '#bench svg.jc-surface:last-of-type',
        ) as SVGSVGElement | null;
        if (!el) return [];
        const r = el.getBoundingClientRect();
        const lat: number[] = [];
        for (let i = 0; i < steps; i++) {
          const x = r.left + 50 + ((r.width - 60) * i) / steps;
          const t0 = performance.now();
          el.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: x,
              clientY: r.top + r.height / 2,
              bubbles: true,
              pointerType: 'mouse',
            }),
          );
          await frame();
          lat.push(performance.now() - t0);
        }
        return lat;
      },
    };
  }, []);

  return (
    <div id="bench" style={{ width: width ?? '100%', padding: 8, boxSizing: 'border-box' }}>
      {mounted
        ? Array.from({ length: count }, (_, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Chart data={data} renderer={renderer} animation={false} />
            </div>
          ))
        : null}
    </div>
  );
}
