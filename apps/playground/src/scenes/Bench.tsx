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
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { rng } from '../data';
import { enPlural, formatNum, kkPlural, ruPlural, useLang, useT, useText, type L } from '../i18n';
import { replaceParams } from '../shell/playground';
import { Hint, ScenePage } from '../shell/scene-page';
import { Button } from '../ui/button';
import { Card, ChartCard } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { Field } from '../ui/field';
import { MetricTile } from '../ui/metric-tile';
import { SegmentedTabs } from '../ui/segmented-tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

type ChartType = 'line' | 'area' | 'bar' | 'scatter';
type Metric =
  'mount' | 'update' | 'stream' | 'resize' | 'hoverP50' | 'hoverP95' | 'unmount' | 'domNodes';

interface BenchText {
  chart: string;
  points: string;
  charts: string;
  chartTypes: Record<ChartType, string>;
  auto: string;
  hintTiming: string;
  hintCompare: (command: ReactNode) => ReactNode;
  measure: string;
  runAll: string;
  mount: string;
  update: string;
  stream: string;
  hoverSweep: string;
  resize: string;
  unmount: string;
  reset: string;
  results: string;
  tiles: Record<Metric, { label: string; hint: string }>;
  ms: string;
  nodes: (n: number) => string;
  area: string;
  areaDescription: (c: {
    count: number;
    chart: string;
    points: string;
    pointsCount: number;
    renderer: string;
  }) => string;
  emptyTitle: string;
  emptyDescription: (c: {
    count: number;
    chart: string;
    points: string;
    pointsCount: number;
  }) => string;
}

const TEXT: L<BenchText> = {
  en: {
    chart: 'Chart',
    points: 'Points per chart',
    charts: 'Charts',
    chartTypes: { line: 'Line', area: 'Area', bar: 'Bar', scatter: 'Scatter' },
    auto: 'Auto',
    hintTiming: 'Times include layout and paint of the next frame',
    hintCompare: (command) => (
      <>Compare runs on the same machine; the dev server is slower than {command}</>
    ),
    measure: 'Measure',
    runAll: 'Run all',
    mount: 'Mount',
    update: 'Update',
    stream: 'Stream',
    hoverSweep: 'Hover sweep',
    resize: 'Resize to 600 px',
    unmount: 'Unmount',
    reset: 'Reset',
    results: 'Results',
    tiles: {
      mount: { label: 'Mount', hint: 'first render to painted frame' },
      update: { label: 'Update', hint: 'replace the whole dataset' },
      stream: { label: 'Stream', hint: 'append one point, drop the oldest' },
      resize: { label: 'Resize', hint: 'container to 600 px' },
      hoverP50: { label: 'Hover, median', hint: 'pointer move to next frame' },
      hoverP95: { label: 'Hover, 95th percentile', hint: 'over 60 pointer moves' },
      unmount: { label: 'Unmount', hint: 'remove every chart' },
      domNodes: { label: 'DOM nodes', hint: 'elements inside the bench area' },
    },
    ms: 'ms',
    nodes: (n) => enPlural(n, ['node', 'nodes']),
    area: 'Bench area',
    areaDescription: ({ count, chart, points, pointsCount, renderer }) =>
      `${count} × ${chart} · ${points} ${enPlural(pointsCount, ['point', 'points'])} · ${renderer} renderer, animations off.`,
    emptyTitle: 'Nothing mounted yet',
    emptyDescription: ({ count, chart, points, pointsCount }) =>
      `Press Mount to render ${count} ${chart} ${enPlural(count, ['chart', 'charts'])} of ${points} ${enPlural(pointsCount, ['point', 'points'])}, or Run all for the full sequence.`,
  },
  ru: {
    chart: 'Диаграмма',
    points: 'Точек на диаграмму',
    charts: 'Диаграммы',
    chartTypes: { line: 'Линия', area: 'Область', bar: 'Столбцы', scatter: 'Точки' },
    auto: 'Авто',
    hintTiming: 'Время включает раскладку и отрисовку следующего кадра',
    hintCompare: (command) => (
      <>Сравнивайте запуски на одной машине; dev-сервер медленнее, чем {command}</>
    ),
    measure: 'Замер',
    runAll: 'Запустить всё',
    mount: 'Смонтировать',
    update: 'Обновить',
    stream: 'Поток',
    hoverSweep: 'Проход указателем',
    resize: 'Ширина 600 px',
    unmount: 'Размонтировать',
    reset: 'Сбросить',
    results: 'Результаты',
    tiles: {
      mount: { label: 'Монтирование', hint: 'от рендера до кадра' },
      update: { label: 'Обновление', hint: 'замена всего набора данных' },
      stream: { label: 'Поток', hint: 'новая точка вместо старой' },
      resize: { label: 'Изменение размера', hint: 'контейнер до 600 px' },
      hoverP50: { label: 'Наведение, медиана', hint: 'от движения до кадра' },
      hoverP95: { label: 'Наведение, p95', hint: '95-й процентиль из 60 движений' },
      unmount: { label: 'Размонтирование', hint: 'удаление всех диаграмм' },
      domNodes: { label: 'DOM-узлы', hint: 'в области замера' },
    },
    ms: 'мс',
    nodes: (n) => ruPlural(n, ['узел', 'узла', 'узлов']),
    area: 'Область замера',
    areaDescription: ({ count, chart, points, pointsCount, renderer }) =>
      `${count} × «${chart}» · ${points} ${ruPlural(pointsCount, ['точка', 'точки', 'точек'])} · рендерер ${renderer}, анимация выключена.`,
    emptyTitle: 'Пока ничего не смонтировано',
    emptyDescription: ({ count, chart, points, pointsCount }) =>
      `Нажмите «Смонтировать», чтобы отрисовать ${count === 1 ? 'диаграмму' : 'диаграммы'} типа «${chart}»: ${count} × ${points} ${ruPlural(pointsCount, ['точка', 'точки', 'точек'])}. «Запустить всё» выполнит полную последовательность.`,
  },
  kk: {
    chart: 'Диаграмма',
    points: 'Диаграммадағы нүктелер',
    charts: 'Диаграммалар',
    chartTypes: { line: 'Сызық', area: 'Аймақ', bar: 'Бағана', scatter: 'Нүкте' },
    auto: 'Авто',
    hintTiming: 'Уақытқа келесі кадрдың орналасуы мен сызылуы кіреді',
    hintCompare: (command) => (
      <>
        Іске қосуларды бір құрылғыда салыстырыңыз; dev-сервер {command} командасына қарағанда баяу
      </>
    ),
    measure: 'Өлшеу',
    runAll: 'Барлығын іске қосу',
    mount: 'Монтаждау',
    update: 'Жаңарту',
    stream: 'Ағын',
    hoverSweep: 'Меңзермен өту',
    resize: 'Енін 600 px ету',
    unmount: 'Демонтаждау',
    reset: 'Қалпына келтіру',
    results: 'Нәтижелер',
    tiles: {
      mount: { label: 'Монтаждау', hint: 'рендерден кадрға дейін' },
      update: { label: 'Жаңарту', hint: 'бүкіл жиынды ауыстыру' },
      stream: { label: 'Ағын', hint: 'ескі нүктенің орнына жаңасы' },
      resize: { label: 'Өлшемін өзгерту', hint: 'контейнер 600 px-ке дейін' },
      hoverP50: { label: 'Меңзер, медиана', hint: 'қозғалыстан кадрға дейін' },
      hoverP95: { label: 'Меңзер, p95', hint: '60 қозғалыстың 95-процентилі' },
      unmount: { label: 'Демонтаждау', hint: 'барлық диаграмманы алу' },
      domNodes: { label: 'DOM түйіндері', hint: 'өлшеу аймағында' },
    },
    ms: 'мс',
    nodes: (n) => kkPlural(n, ['түйін', 'түйін']),
    area: 'Өлшеу аймағы',
    areaDescription: ({ count, chart, points, pointsCount, renderer }) =>
      `${count} × «${chart}» · ${points} ${kkPlural(pointsCount, ['нүкте', 'нүкте'])} · ${renderer} рендерері, анимация өшірулі.`,
    emptyTitle: 'Әзірге ештеңе монтаждалмаған',
    emptyDescription: ({ count, chart, points }) =>
      `${count} × ${points} нүктелі «${chart}» диаграммасын салу үшін «Монтаждау» түймесін, толық тізбек үшін «Барлығын іске қосу» түймесін басыңыз.`,
  },
};

const isChartType = (v: string): v is ChartType =>
  v === 'line' || v === 'area' || v === 'bar' || v === 'scatter';

/** The measured area. Everything inside `#bench` counts towards `domNodes`. */
function BenchRunner({ chart, points, count, renderer }: BenchConfig) {
  const { lang } = useLang();
  const text = useText(TEXT);
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
          title={text.emptyTitle}
          description={text.emptyDescription({
            count,
            // English keeps the scenario id ("line"); other languages name the chart type.
            chart: lang === 'en' || !isChartType(chart) ? chart : text.chartTypes[chart],
            points: formatNum(lang, points),
            pointsCount: points,
          })}
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
const CHART_TYPES: readonly ChartType[] = ['line', 'area', 'bar', 'scatter'];
const POINTS = ['365', '1000', '10000', '100000', '1000000'];
const COUNTS = ['1', '4', '10', '20'];

const TILES: ReadonlyArray<{ metric: Metric; icon: typeof Play; tone?: string }> = [
  { metric: 'mount', icon: Play },
  { metric: 'update', icon: RefreshCw },
  { metric: 'stream', icon: Waves },
  { metric: 'resize', icon: Move },
  { metric: 'hoverP50', icon: MousePointer2, tone: 'text-success' },
  { metric: 'hoverP95', icon: Activity, tone: 'text-success' },
  { metric: 'unmount', icon: Square, tone: 'text-warning' },
  { metric: 'domNodes', icon: Boxes, tone: 'text-warning' },
];

export function Bench() {
  const [config, setConfig] = useState(readConfig);
  const [run, setRun] = useState(0);
  const [results, setResults] = useState<Results>({});
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useT();
  const { lang } = useLang();
  const text = useText(TEXT);
  const ms = (v: number | undefined) =>
    v === undefined
      ? null
      : formatNum(lang, v, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const chartTypes = CHART_TYPES.map((value) => ({ value, label: text.chartTypes[value] }));
  const renderers = [
    { value: 'svg', label: 'SVG' },
    { value: 'canvas', label: 'Canvas' },
    { value: 'auto', label: text.auto },
  ] as const;
  const pointOptions = (
    POINTS.includes(String(config.points)) ? POINTS : [String(config.points), ...POINTS]
  ).map((value) => ({ value, label: formatNum(lang, Number(value)) }));
  const countOptions = (
    COUNTS.includes(String(config.count)) ? COUNTS : [String(config.count), ...COUNTS]
  ).map((value) => ({ value, label: t.sections.chartCount(Number(value)) }));

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
      <Field label={text.chart} group inline>
        {() => (
          <SegmentedTabs
            items={chartTypes}
            value={config.chart as ChartType}
            onChange={(chart) => configure({ chart })}
            aria-label={text.chart}
          />
        )}
      </Field>
      <Field label={text.points} inline>
        {(id) => (
          <Select
            value={String(config.points)}
            onValueChange={(v) => configure({ points: Number(v) })}
          >
            <SelectTrigger id={id} className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pointOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field label={text.charts} inline>
        {(id) => (
          <Select
            value={String(config.count)}
            onValueChange={(v) => configure({ count: Number(v) })}
          >
            <SelectTrigger id={id} className="w-32 min-w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field label={t.controls.renderer} group inline>
        {() => (
          <SegmentedTabs
            items={renderers}
            value={config.renderer as (typeof renderers)[number]['value']}
            onChange={(renderer) => configure({ renderer })}
            aria-label={t.controls.renderer}
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
          <Hint icon={Timer}>{text.hintTiming}</Hint>
          <Hint icon={Info}>{text.hintCompare(<code className="font-mono">pnpm bench</code>)}</Hint>
        </>
      }
    >
      <Card className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="mr-1 text-xs font-medium text-muted-foreground">{text.measure}</span>
        <Button size="md" disabled={busy} onClick={() => void step(runAll)}>
          <Play aria-hidden />
          {text.runAll}
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={busy || mounted}
          onClick={() => void step(mount)}
        >
          {text.mount}
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={busy || !mounted}
          onClick={() => void step(update)}
        >
          {text.update}
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={busy || !mounted}
          onClick={() => void step(stream)}
        >
          {text.stream}
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={busy || !mounted}
          onClick={() => void step(hover)}
        >
          {text.hoverSweep}
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={busy || !mounted}
          onClick={() => void step(resize)}
        >
          {text.resize}
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={busy || !mounted}
          onClick={() => void step(unmount)}
        >
          <Trash2 aria-hidden />
          {text.unmount}
        </Button>
        <Button variant="ghost" size="md" disabled={busy} onClick={reset} className="ml-auto">
          <RotateCcw aria-hidden />
          {text.reset}
        </Button>
      </Card>

      <section aria-label={text.results} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TILES.map(({ metric, icon, tone }) => {
          const value = results[metric];
          return (
            <MetricTile
              key={metric}
              icon={icon}
              label={text.tiles[metric].label}
              hint={text.tiles[metric].hint}
              value={
                metric === 'domNodes'
                  ? value === undefined
                    ? undefined
                    : formatNum(lang, value)
                  : ms(value)
              }
              unit={metric === 'domNodes' ? text.nodes(value ?? 0) : text.ms}
              tone={tone}
            />
          );
        })}
      </section>

      <ChartCard
        id={TEXT.en.area}
        title={text.area}
        description={text.areaDescription({
          count: config.count,
          chart:
            lang === 'en' || !isChartType(config.chart)
              ? config.chart
              : text.chartTypes[config.chart],
          points: formatNum(lang, config.points),
          pointsCount: config.points,
          renderer: config.renderer,
        })}
      >
        <BenchRunner
          key={`${config.chart}:${config.points}:${config.count}:${config.renderer}:${run}`}
          {...config}
        />
      </ChartCard>
    </ScenePage>
  );
}
