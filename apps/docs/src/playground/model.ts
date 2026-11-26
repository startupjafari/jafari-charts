import type { CurveType, Renderer, ThemeMode } from '@jafari/charts';
import type { L, Lang } from '../i18n/lang';

/**
 * Playground configuration, data generation and code generation. The data
 * formula below is the same one printed in the generated code, so the code you
 * copy renders exactly the chart you see.
 */
export type ChartKind =
  | 'line'
  | 'area'
  | 'stacked-area'
  | 'bar'
  | 'grouped-bar'
  | 'stacked-bar'
  | 'horizontal-bar'
  | 'combo'
  | 'sparkline'
  | 'pie'
  | 'donut'
  | 'radial'
  | 'gauge'
  | 'scatter';

export interface KindInfo {
  kind: ChartKind;
  component: string;
  label: string;
  /** Available data sizes. */
  points: readonly number[];
  defaultPoints: number;
  maxSeries: number;
  /** x values: time (`time` field) or categories (`label` field). */
  x: 'time' | 'category' | 'none' | 'number';
  /** Time step between points, ms. */
  step?: number;
  axes: boolean;
  curve: boolean;
  zoom: boolean;
  /** Supports the tooltip/legend options. */
  tooltip: boolean;
  legend: boolean;
  renderer: boolean;
}

const HOUR = 3_600_000;
const DAY = 86_400_000;

export const KINDS: readonly KindInfo[] = [
  {
    kind: 'line',
    component: 'LineChart',
    label: 'Line',
    points: [30, 100, 365, 1000, 10000, 100000],
    defaultPoints: 365,
    maxSeries: 4,
    x: 'time',
    step: HOUR,
    axes: true,
    curve: true,
    zoom: true,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'area',
    component: 'AreaChart',
    label: 'Area',
    points: [30, 100, 365, 1000, 10000, 100000],
    defaultPoints: 365,
    maxSeries: 4,
    x: 'time',
    step: HOUR,
    axes: true,
    curve: true,
    zoom: true,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'stacked-area',
    component: 'StackedAreaChart',
    label: 'Stacked area',
    points: [30, 100, 365, 1000, 10000, 100000],
    defaultPoints: 365,
    maxSeries: 4,
    x: 'time',
    step: HOUR,
    axes: true,
    curve: true,
    zoom: true,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'bar',
    component: 'BarChart',
    label: 'Bar',
    points: [12, 30, 100, 365, 1000, 10000],
    defaultPoints: 30,
    maxSeries: 1,
    x: 'time',
    step: DAY,
    axes: true,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: false,
    renderer: true,
  },
  {
    kind: 'grouped-bar',
    component: 'GroupedBarChart',
    label: 'Grouped bar',
    points: [6, 12, 30, 100],
    defaultPoints: 12,
    maxSeries: 4,
    x: 'time',
    step: DAY,
    axes: true,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'stacked-bar',
    component: 'StackedBarChart',
    label: 'Stacked bar',
    points: [12, 30, 100, 365, 1000],
    defaultPoints: 30,
    maxSeries: 4,
    x: 'time',
    step: DAY,
    axes: true,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'horizontal-bar',
    component: 'HorizontalBarChart',
    label: 'Horizontal bar',
    points: [5, 10, 20, 40],
    defaultPoints: 10,
    maxSeries: 1,
    x: 'category',
    axes: true,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: false,
    renderer: true,
  },
  {
    kind: 'combo',
    component: 'ComboChart',
    label: 'Combo',
    points: [12, 30, 100, 365],
    defaultPoints: 30,
    maxSeries: 4,
    x: 'time',
    step: DAY,
    axes: true,
    curve: true,
    zoom: false,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'sparkline',
    component: 'Sparkline',
    label: 'Sparkline',
    points: [14, 30, 100, 1000],
    defaultPoints: 30,
    maxSeries: 1,
    x: 'time',
    step: DAY,
    axes: false,
    curve: true,
    zoom: false,
    tooltip: true,
    legend: false,
    renderer: true,
  },
  {
    kind: 'pie',
    component: 'PieChart',
    label: 'Pie',
    points: [2, 3, 4, 5, 6, 8],
    defaultPoints: 5,
    maxSeries: 1,
    x: 'category',
    axes: false,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'donut',
    component: 'DonutChart',
    label: 'Donut',
    points: [2, 3, 4, 5, 6, 8],
    defaultPoints: 4,
    maxSeries: 1,
    x: 'category',
    axes: false,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: true,
    renderer: true,
  },
  {
    kind: 'radial',
    component: 'RadialProgressChart',
    label: 'Radial progress',
    points: [1, 2, 3, 4],
    defaultPoints: 3,
    maxSeries: 1,
    x: 'none',
    axes: false,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: false,
    renderer: true,
  },
  {
    kind: 'gauge',
    component: 'GaugeChart',
    label: 'Gauge',
    points: [1],
    defaultPoints: 1,
    maxSeries: 1,
    x: 'none',
    axes: false,
    curve: false,
    zoom: false,
    tooltip: false,
    legend: false,
    renderer: true,
  },
  {
    kind: 'scatter',
    component: 'ScatterChart',
    label: 'Scatter',
    points: [100, 1000, 10000, 50000, 100000],
    defaultPoints: 1000,
    maxSeries: 4,
    x: 'number',
    axes: true,
    curve: false,
    zoom: false,
    tooltip: true,
    legend: true,
    renderer: true,
  },
];

export function kindInfo(kind: ChartKind): KindInfo {
  return KINDS.find((k) => k.kind === kind) ?? (KINDS[0] as KindInfo);
}

export const PALETTES = {
  default: null,
  ocean: ['#0EA5E9', '#14B8A6', '#6366F1', '#22D3EE'],
  sunset: ['#F97316', '#EF4444', '#EC4899', '#F59E0B'],
  forest: ['#16A34A', '#65A30D', '#0D9488', '#CA8A04'],
} as const satisfies Record<string, readonly string[] | null>;

export type PaletteName = keyof typeof PALETTES | 'custom';

/** Colours used as the starting point of the custom palette (the theme's light palette). */
export const BASE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'] as const;

export interface PlaygroundConfig {
  kind: ChartKind;
  points: number;
  series: number;
  palette: PaletteName;
  colors: readonly string[];
  theme: ThemeMode;
  fillWidth: boolean;
  width: number;
  height: number;
  animation: boolean;
  tooltip: boolean;
  tooltipMode: 'shared' | 'item';
  legend: boolean;
  legendPosition: 'top' | 'bottom';
  renderer: Renderer;
  curve: CurveType;
  zoom: boolean;
  gaugeValue: number;
}

export const DEFAULT_CONFIG: PlaygroundConfig = {
  kind: 'line',
  points: 365,
  series: 2,
  palette: 'default',
  colors: BASE_COLORS,
  theme: 'auto',
  fillWidth: true,
  width: 720,
  height: 320,
  animation: true,
  tooltip: true,
  tooltipMode: 'shared',
  legend: true,
  legendPosition: 'bottom',
  renderer: 'svg',
  curve: 'monotone',
  zoom: false,
  gaugeValue: 68,
};

export const SERIES_KEYS = ['a', 'b', 'c', 'd'] as const;

/**
 * Labels in the demo data. They follow the site language, and so does the
 * generated code, which stays an exact copy of the preview.
 */
export interface DemoText {
  series: readonly string[];
  slices: readonly string[];
  ring: (n: number) => string;
  slice: (n: number) => string;
  item: (n: number) => string;
  gauge: string;
}

export const DEMO_TEXT: L<DemoText> = {
  en: {
    series: ['Series A', 'Series B', 'Series C', 'Series D'],
    slices: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'],
    ring: (n) => `Ring ${n}`,
    slice: (n) => `Slice ${n}`,
    item: (n) => `Item ${n}`,
    gauge: 'Score',
  },
  ru: {
    series: ['Ряд A', 'Ряд B', 'Ряд C', 'Ряд D'],
    slices: ['Альфа', 'Бета', 'Гамма', 'Дельта', 'Эпсилон', 'Дзета', 'Эта', 'Тета'],
    ring: (n) => `Кольцо ${n}`,
    slice: (n) => `Сектор ${n}`,
    item: (n) => `Элемент ${n}`,
    gauge: 'Оценка',
  },
};

const START = Date.UTC(2025, 0, 1);

/** The colours a config applies, or null for the theme palette. */
export function activeColors(config: PlaygroundConfig): readonly string[] | null {
  if (config.palette === 'custom') return config.colors;
  return PALETTES[config.palette];
}

export function effectiveSeries(config: PlaygroundConfig): number {
  return Math.max(1, Math.min(config.series, kindInfo(config.kind).maxSeries));
}

// ─── Data ─────────────────────────────────────────────────────────────────

/** Deterministic value for point `i` of series `k` (also printed in the generated code). */
export function valueAt(i: number, k: number): number {
  return Math.round(
    400 +
      150 * k +
      120 * Math.sin(i / 40 + k) +
      40 * Math.sin(i / 7 + 2 * k) +
      ((i * 7919 + k * 104729) % 61) -
      30,
  );
}

export type TimeRow = { time: Date; a: number; b: number; c: number; d: number };
export type CategoryRow = { label: string; value: number };
export type RingRow = { label: string; value: number; color?: string };
export type PointRow = { x: number; a: number; b: number; c: number; d: number };

export type PlaygroundData =
  | { type: 'time'; rows: TimeRow[] }
  | { type: 'category'; rows: CategoryRow[] }
  | { type: 'rings'; rows: RingRow[] }
  | { type: 'gauge'; value: number }
  | { type: 'points'; rows: PointRow[] };

export function makeData(config: PlaygroundConfig, lang: Lang): PlaygroundData {
  const text = DEMO_TEXT[lang];
  const info = kindInfo(config.kind);
  const n = config.points;
  if (info.kind === 'gauge') return { type: 'gauge', value: config.gaugeValue };
  if (info.x === 'number') {
    const rows: PointRow[] = new Array<PointRow>(n);
    for (let i = 0; i < n; i++) {
      rows[i] = {
        x: ((i * 7919) % 1000) / 10,
        a: valueAt(i, 0),
        b: valueAt(i, 1),
        c: valueAt(i, 2),
        d: valueAt(i, 3),
      };
    }
    return { type: 'points', rows };
  }
  if (info.kind === 'radial') {
    const colors = activeColors(config);
    return {
      type: 'rings',
      rows: Array.from({ length: n }, (_, i) => ({
        label: text.slices[i] ?? text.ring(i + 1),
        value: 30 + ((i * 37 + 52) % 65),
        ...(colors?.[i] ? { color: colors[i] } : {}),
      })),
    };
  }
  if (info.x === 'category') {
    return {
      type: 'category',
      rows: Array.from({ length: n }, (_, i) => ({
        label:
          info.kind === 'horizontal-bar' ? text.item(i + 1) : (text.slices[i] ?? text.slice(i + 1)),
        value: valueAt(i * 13, 0),
      })),
    };
  }
  const step = info.step ?? DAY;
  const rows: TimeRow[] = new Array<TimeRow>(n);
  for (let i = 0; i < n; i++) {
    rows[i] = {
      time: new Date(START + i * step),
      a: valueAt(i, 0),
      b: valueAt(i, 1),
      c: valueAt(i, 2),
      d: valueAt(i, 3),
    };
  }
  return { type: 'time', rows };
}

// ─── Shared prop resolution (used by the preview and the code generator) ──

export type SeriesSpec =
  | { mode: 'single'; color?: string }
  | {
      mode: 'multi';
      series: {
        key: (typeof SERIES_KEYS)[number];
        label: string;
        type?: 'bar' | 'line';
        color?: string;
      }[];
    };

/** Single-series shortcut (`yKey`) or a `series` list for time-based charts. */
export function seriesSpec(config: PlaygroundConfig, lang: Lang): SeriesSpec {
  const labels = DEMO_TEXT[lang].series;
  const info = kindInfo(config.kind);
  const colors = activeColors(config);
  const count = effectiveSeries(config);
  if (info.kind === 'sparkline' || (count === 1 && !colors && info.kind !== 'combo')) {
    return colors?.[0] ? { mode: 'single', color: colors[0] } : { mode: 'single' };
  }
  return {
    mode: 'multi',
    series: SERIES_KEYS.slice(0, count).map((key, j) => ({
      key,
      label: labels[j] ?? key,
      ...(info.kind === 'combo' ? { type: j === 0 ? ('bar' as const) : ('line' as const) } : {}),
      ...(colors?.[j] ? { color: colors[j] } : {}),
    })),
  };
}

/** Tooltip value: `false`, `true` or item mode. */
export function tooltipValue(config: PlaygroundConfig): boolean | 'item' {
  const info = kindInfo(config.kind);
  if (!config.tooltip) return false;
  return info.axes && info.x === 'time' && config.tooltipMode === 'item' ? 'item' : true;
}

export function tooltipDefault(config: PlaygroundConfig): boolean {
  if (config.kind === 'sparkline' || config.kind === 'donut') return false;
  if (config.kind === 'radial') return config.points > 1;
  return true;
}

export function legendValue(config: PlaygroundConfig): boolean | 'top' {
  if (!config.legend) return false;
  return config.legendPosition === 'top' ? 'top' : true;
}

// ─── Code generation ──────────────────────────────────────────────────────

function q(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function formatInt(n: number): string {
  return n >= 10000 ? n.toLocaleString('en').replace(/,/g, '_') : String(n);
}

/**
 * React code for the current configuration (only non-default props are listed).
 * On the Russian site the preview inherits `locale="ru"` from the site's
 * ChartProvider, so the code states it explicitly.
 */
export function generateCode(config: PlaygroundConfig, lang: Lang): string {
  const info = kindInfo(config.kind);
  const colors = activeColors(config);
  const count = effectiveSeries(config);
  const props: string[] = [];
  const lines: string[] = [];
  const header: string[] = [`import { ${info.component} } from '@jafari/charts';`, ''];

  if (info.kind === 'gauge') {
    props.push(`value={${config.gaugeValue}}`, `label="${DEMO_TEXT[lang].gauge}"`);
    if (colors?.[0]) props.push(`color="${colors[0]}"`);
  } else if (info.kind === 'radial') {
    const d = makeData(config, lang);
    if (d.type === 'rings') {
      lines.push('const data = [');
      for (const r of d.rows)
        lines.push(
          `  { label: ${q(r.label)}, value: ${r.value}${r.color ? `, color: '${r.color}'` : ''} },`,
        );
      lines.push('];', '');
    }
    props.push('data={data}');
  } else if (info.x === 'category') {
    const d = makeData(config, lang);
    if (d.type === 'category') {
      lines.push('const data = [');
      for (const r of d.rows) lines.push(`  { label: ${q(r.label)}, value: ${r.value} },`);
      lines.push('];', '');
    }
    if (info.kind === 'pie' || info.kind === 'donut') {
      props.push('data={data}', 'labelKey="label"', 'valueKey="value"');
      if (colors) props.push(`colors={[${colors.map((c) => `'${c}'`).join(', ')}]}`);
    } else {
      props.push('data={data}', 'xKey="label"', 'yKey="value"');
      if (colors?.[0]) props.push(`color="${colors[0]}"`);
    }
  } else {
    const keys = SERIES_KEYS.slice(0, count);
    lines.push(
      '/** Deterministic demo values; replace with your data. */',
      'const valueAt = (i: number, k: number) =>',
      '  Math.round(',
      '    400 + 150 * k + 120 * Math.sin(i / 40 + k) + 40 * Math.sin(i / 7 + 2 * k) +',
      '      ((i * 7919 + k * 104729) % 61) - 30,',
      '  );',
      '',
      `const data = Array.from({ length: ${formatInt(config.points)} }, (_, i) => ({`,
      info.x === 'number'
        ? '  x: ((i * 7919) % 1000) / 10,'
        : `  time: new Date(Date.UTC(2025, 0, 1) + i * ${formatInt(info.step ?? DAY)}),`,
      ...keys.map((k, j) => `  ${k}: valueAt(i, ${j}),`),
      '}));',
      '',
    );
    props.push('data={data}', info.x === 'number' ? 'xKey="x"' : 'xKey="time"');
    const spec = seriesSpec(config, lang);
    if (spec.mode === 'single') {
      props.push(`yKey="a"`);
      if (spec.color) props.push(`color="${spec.color}"`);
    } else {
      const entries = spec.series.map((s) => {
        const parts = [`key: '${s.key}'`, `label: ${q(s.label)}`];
        if (s.type) parts.push(`type: '${s.type}'`);
        if (s.color) parts.push(`color: '${s.color}'`);
        return `    { ${parts.join(', ')} },`;
      });
      props.push(['series={[', ...entries, '  ]}'].join('\n'));
    }
    if (info.curve && config.curve !== 'monotone') props.push(`curve="${config.curve}"`);
    if (info.zoom && config.zoom) props.push('zoom');
  }

  if (info.tooltip) {
    const t = tooltipValue(config);
    if (t === 'item') props.push(`tooltip={{ mode: 'item' }}`);
    else if (t !== tooltipDefault(config)) props.push(t ? 'tooltip' : 'tooltip={false}');
  }
  if (info.legend) {
    const l = legendValue(config);
    if (l === false) props.push('legend={false}');
    else if (l === 'top') props.push(`legend={{ position: 'top' }}`);
  }
  if (!config.fillWidth) props.push(`width={${config.width}}`);
  props.push(`height={${config.height}}`);
  if (config.theme !== 'auto') props.push(`theme="${config.theme}"`);
  if (info.kind === 'sparkline') {
    if (config.animation) props.push('animation');
  } else if (!config.animation) props.push('animation={false}');
  if (config.renderer !== 'svg') props.push(`renderer="${config.renderer}"`);
  if (lang !== 'en') props.push(`locale="${lang}"`);

  const body = props.map((p) => `      ${p.replace(/\n/g, '\n    ')}`).join('\n');
  return [
    ...header,
    ...lines,
    'export function Chart() {',
    `  return (`,
    `    <${info.component}`,
    body,
    '    />',
    '  );',
    '}',
    '',
  ].join('\n');
}
