import { AreaChart, BarChart, LineChart, ScatterChart, type Renderer } from '@startupjafari/charts';
import {
  Activity,
  Boxes,
  Info,
  MousePointer2,
  Move,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Timer,
  Trash2,
  Waves,
} from '../ui/icons';
import { useEffect, useState, type ComponentType } from 'react';
import { flushSync } from 'react-dom';
import { rng } from '../data';
import { replaceParams } from '../shell/playground';
import { Hint, ScenePage } from '../shell/scene-page';
import { Button } from '../ui/button';
import { Card, ChartCard } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { Field } from '../ui/field';
import { MetricTile } from '../ui/metric-tile';
import { Segmented } from '../ui/segmented';
import { Select } from '../ui/select';

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

interface BenchConfig {
  chart: string;
  points: number;
  count: number;
  renderer: Renderer;
}

function readConfig(): BenchConfig {
  const params = new URLSearchParams(location.search);
  return {
    chart: params.get('chart') ?? 'line',
    points: Number(params.get('points') ?? 365),
    count: Number(params.get('charts') ?? 1),
    renderer: (params.get('renderer') ?? 'svg') as Renderer,
  };
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

type BenchApi = Record<string, (...args: number[]) => Promise<unknown>>;

declare global {
  interface Window {
    __bench?: BenchApi;
  }
}

/** The measured area. Everything inside `#bench` counts towards `domNodes`. */
function BenchRunner({ chart, points, count, renderer }: BenchConfig) {
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
    const api: BenchApi = {
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
    window.__bench = api;
    return () => {
      if (window.__bench === api) delete window.__bench;
    };
  }, [points]);

  return (
    <>
      <div id="bench" style={{ width: width ?? '100%', maxWidth: '100%' }}>
        {mounted
          ? Array.from({ length: count }, (_, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <Chart data={data} renderer={renderer} animation={false} />
              </div>
            ))
          : null}
      </div>
      {!mounted && (
        <EmptyState
          icon={<Play className="size-5" aria-hidden />}
          title="Nothing mounted yet"
          description={`Press Mount to render ${count} ${chart} chart${count === 1 ? '' : 's'} of ${points.toLocaleString('en')} points, or Run all for the full sequence.`}
        />
      )}
    </>
  );
}

interface Results {
  mount?: number;
  update?: number;
  stream?: number;
  resize?: number;
  unmount?: number;
  hoverP50?: number;
  hoverP95?: number;
  domNodes?: number;
}

const pct = (values: number[], p: number) => {
  const s = [...values].sort((a, b) => a - b);
  return s.length ? (s[Math.min(s.length - 1, Math.floor(s.length * p))] as number) : NaN;
};
const ms = (v: number | undefined) => (v === undefined ? null : v.toFixed(1));

const CHART_TYPES = [
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
  { value: 'scatter', label: 'Scatter' },
] as const;
const POINTS = ['365', '1000', '10000', '100000', '1000000'].map((v) => ({
  value: v,
  label: Number(v).toLocaleString('en'),
}));
const COUNTS = ['1', '4', '10', '20'].map((v) => ({
  value: v,
  label: `${v} chart${v === '1' ? '' : 's'}`,
}));
const RENDERERS = [
  { value: 'svg', label: 'SVG' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'auto', label: 'Auto' },
] as const;

export function Bench() {
  const [config, setConfig] = useState(readConfig);
  const [run, setRun] = useState(0);
  const [results, setResults] = useState<Results>({});
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  const configure = (patch: Partial<BenchConfig>) => {
    const next = { ...config, ...patch };
    replaceParams({
      chart: next.chart,
      points: String(next.points),
      charts: String(next.count),
      renderer: next.renderer,
    });
    setConfig(next);
    setResults({});
    setMounted(false);
  };

  const reset = () => {
    setRun((r) => r + 1);
    setResults({});
    setMounted(false);
  };

  const call = (name: string, ...args: number[]) => {
    const api = window.__bench;
    if (!api?.[name]) throw new Error('Benchmark harness not ready');
    return api[name](...args);
  };
  const domNodes = async () => (await call('domNodes')) as number;

  const step = async (fn: () => Promise<Partial<Results>>) => {
    setBusy(true);
    try {
      const patch = await fn();
      const nodes = await domNodes();
      setResults((r) => ({ ...r, ...patch, domNodes: nodes }));
    } finally {
      setBusy(false);
    }
  };

  const mount = async () => {
    const t = (await call('mount')) as number;
    setMounted(true);
    return { mount: t };
  };
  const unmount = async () => {
    const t = (await call('unmount')) as number;
    setMounted(false);
    return { unmount: t };
  };
  const update = async () => ({ update: (await call('update', 2 + Math.random())) as number });
  const stream = async () => ({ stream: (await call('stream')) as number });
  const resize = async () => ({ resize: (await call('resize', 600)) as number });
  const hover = async () => {
    const lat = (await call('hover', 60)) as number[];
    return { hoverP50: pct(lat, 0.5), hoverP95: pct(lat, 0.95) };
  };
  const runAll = async () => {
    const all: Partial<Results> = {};
    if (!mounted) Object.assign(all, await mount());
    Object.assign(all, await update(), await stream(), await hover());
    return all;
  };

  const settings = (
    <>
      <Field label="Chart" inline>
        {(id) => (
          <Segmented
            items={CHART_TYPES}
            value={config.chart as (typeof CHART_TYPES)[number]['value']}
            onChange={(chart) => configure({ chart })}
            labelledBy={id}
          />
        )}
      </Field>
      <Field label="Points per chart" inline>
        {(id) => (
          <Select
            value={String(config.points)}
            onChange={(v) => configure({ points: Number(v) })}
            options={
              POINTS.some((p) => p.value === String(config.points))
                ? POINTS
                : [
                    { value: String(config.points), label: config.points.toLocaleString('en') },
                    ...POINTS,
                  ]
            }
            labelledBy={id}
            className="w-32"
          />
        )}
      </Field>
      <Field label="Charts" inline>
        {(id) => (
          <Select
            value={String(config.count)}
            onChange={(v) => configure({ count: Number(v) })}
            options={
              COUNTS.some((c) => c.value === String(config.count))
                ? COUNTS
                : [{ value: String(config.count), label: `${config.count} charts` }, ...COUNTS]
            }
            labelledBy={id}
            className="w-28"
          />
        )}
      </Field>
      <Field label="Renderer" inline>
        {(id) => (
          <Segmented
            items={RENDERERS}
            value={config.renderer as (typeof RENDERERS)[number]['value']}
            onChange={(renderer) => configure({ renderer })}
            labelledBy={id}
          />
        )}
      </Field>
    </>
  );

  return (
    <ScenePage
      scene="bench"
      actions={settings}
      hints={
        <>
          <Hint icon={Timer}>Times include layout and paint of the next frame</Hint>
          <Hint icon={Info}>
            Compare runs on the same machine; the dev server is slower than{' '}
            <code className="font-mono">pnpm bench</code>
          </Hint>
        </>
      }
    >
      <Card className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Measure</span>
        <Button size="sm" disabled={busy} onClick={() => void step(runAll)}>
          <Play aria-hidden />
          Run all
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || mounted}
          onClick={() => void step(mount)}
        >
          Mount
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !mounted}
          onClick={() => void step(update)}
        >
          Update
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !mounted}
          onClick={() => void step(stream)}
        >
          Stream
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !mounted}
          onClick={() => void step(hover)}
        >
          Hover sweep
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !mounted}
          onClick={() => void step(resize)}
        >
          Resize to 600 px
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !mounted}
          onClick={() => void step(unmount)}
        >
          <Trash2 aria-hidden />
          Unmount
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={reset} className="ml-auto">
          <RotateCcw aria-hidden />
          Reset
        </Button>
      </Card>

      <section aria-label="Results" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          icon={Play}
          label="Mount"
          hint="first render to painted frame"
          value={ms(results.mount)}
          unit="ms"
        />
        <MetricTile
          icon={RefreshCw}
          label="Update"
          hint="replace the whole dataset"
          value={ms(results.update)}
          unit="ms"
        />
        <MetricTile
          icon={Waves}
          label="Stream"
          hint="append one point, drop the oldest"
          value={ms(results.stream)}
          unit="ms"
        />
        <MetricTile
          icon={Move}
          label="Resize"
          hint="container to 600 px"
          value={ms(results.resize)}
          unit="ms"
        />
        <MetricTile
          icon={MousePointer2}
          label="Hover, median"
          hint="pointer move to next frame"
          value={ms(results.hoverP50)}
          unit="ms"
          tone="text-success"
        />
        <MetricTile
          icon={Activity}
          label="Hover, 95th percentile"
          hint="over 60 pointer moves"
          value={ms(results.hoverP95)}
          unit="ms"
          tone="text-success"
        />
        <MetricTile
          icon={Square}
          label="Unmount"
          hint="remove every chart"
          value={ms(results.unmount)}
          unit="ms"
          tone="text-warning"
        />
        <MetricTile
          icon={Boxes}
          label="DOM nodes"
          hint="elements inside the bench area"
          value={results.domNodes?.toLocaleString('en')}
          unit="nodes"
          tone="text-warning"
        />
      </section>

      <ChartCard
        title="Bench area"
        description={`${config.count} × ${config.chart} · ${config.points.toLocaleString('en')} points · ${config.renderer} renderer, animations off.`}
      >
        <BenchRunner
          key={`${config.chart}:${config.points}:${config.count}:${config.renderer}:${run}`}
          {...config}
        />
      </ChartCard>
    </ScenePage>
  );
}
