import {
  buildRadarModel,
  formatAuto,
  labelColumn,
  numericColumn,
  SYMBOL_SHAPES,
  type KeysMatching,
  type LineMark,
  type Mark,
  type NumericKey,
  type RadarModel,
  type RadarSeriesSpec,
  type SymbolShape,
  type TextMark,
} from '@startupjafari/charts-core';
import { seriesColor } from '@startupjafari/charts-themes';
import { memo, useCallback, useMemo, type ReactElement, type ReactNode } from 'react';
import type { DataTable } from '../../components/ChartA11y';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView } from '../../components/ChartView';
import { useControllableState } from '../../hooks/useControllableState';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import { SeriesLayer } from '../../primitives/SeriesLayer';
import type {
  ActiveItem,
  ChartAdapter,
  SeriesInfo,
  TooltipData,
} from '../../providers/ChartContext';
import { resolveOption } from '../../internal/options';

/** A dataset: one numeric field drawn as a polygon across all metrics. */
export interface RadarSeriesConfig<T> {
  /** Field holding this dataset's value for every metric row. */
  key: NumericKey<T>;
  label?: string;
  /** Any CSS colour. Defaults to the theme's series colour for this slot. */
  color?: string;
  symbol?: SymbolShape;
  /** Formats this dataset's values in tooltips and the data table. */
  format?: (value: number) => string;
}

/** Payload of hover and click callbacks. */
export interface RadarEvent<T> {
  /** The metric row. */
  datum: T;
  /** Metric index (into `data`). */
  index: number;
  /** Metric label. */
  label: string;
  /** Dataset key when one dataset is focused (keyboard up/down), otherwise null. */
  series: string | null;
  /** Value of `series` (null for the whole metric or a missing value). */
  value: number | null;
}

/**
 * Radar chart props. **Orientation:** every data row is one *metric* (a spoke, named by
 * `labelKey`); every entry of `series` is one *dataset* (a polygon, read from a numeric
 * field) — the same shape as a bar chart's `xKey` + `series`.
 */
export interface RadarChartProps<T extends object> extends BaseChartProps {
  data: readonly T[];
  /** Field naming each metric (spoke). */
  labelKey: KeysMatching<T, string | number>;
  /** Datasets drawn as polygons. */
  series: readonly RadarSeriesConfig<T>[];
  /** Value at the centre. Default 0, or a nice minimum when values are negative. */
  min?: number;
  /** Value at the outer ring. Default: a nice maximum of the visible data. */
  max?: number;
  /** Number of grid rings (default: 4–5 rings at nice values). */
  levels?: number;
  /** Grid ring shape (default `polygon`). */
  shape?: 'polygon' | 'circle';
  /** Markers on every vertex (default true). */
  dots?: boolean;
  /** Polygon fill opacity (default 0.14). */
  fillOpacity?: number;
  /** Angle of the first spoke in degrees, clockwise from 12 o'clock. */
  startAngle?: number;
  /** Value labels along the first spoke (default true). */
  ticks?: boolean;
  tickFormatter?: (value: number) => string;
  valueFormatter?: (value: number, series: string) => string;
  tooltip?: boolean | TooltipOptions;
  legend?: boolean | LegendOptions;
  /** Distinct marker shapes and dash patterns per dataset (identity without colour). */
  differentiate?: boolean;
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  /** Controlled active metric index (`null` = none). */
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onHover?: (event: RadarEvent<T> | null) => void;
  onClick?: (event: RadarEvent<T>) => void;
  children?: ReactNode;
}

const DASHES = ['', '6 4', '2 3', '8 3 2 3', '1 3', '10 4'];
const RAD = Math.PI / 180;

/** Tick labels along the first spoke, with a surface-coloured halo so they read over data. */
const RadarTicks = memo(function RadarTicks({ ticks }: { ticks: readonly TextMark[] }) {
  if (!ticks.length) return null;
  return (
    <g className="jc-labels" aria-hidden="true">
      {ticks.map((t) => (
        <text
          key={t.key}
          className="jc-label"
          x={t.x}
          y={t.y}
          textAnchor={t.anchor ?? 'start'}
          dominantBaseline="central"
          style={{
            paintOrder: 'stroke',
            stroke: 'var(--jc-bg)',
            strokeWidth: 3,
            strokeLinejoin: 'round',
          }}
        >
          {t.text}
        </text>
      ))}
    </g>
  );
});

/**
 * Radar (spider) chart: several metrics on spokes, several datasets as polygons.
 * Hovering a sector shows every dataset's value for that metric; arrow keys move
 * between spokes (left/right) and datasets (up/down).
 */
export function RadarChart<T extends object>(props: RadarChartProps<T>): ReactElement {
  const root = useChartRoot(props, { height: 320 });
  const { data, labelKey, valueFormatter } = props;
  const tooltipOpts = resolveOption<TooltipOptions>(props.tooltip, true);
  const legendOpts = resolveOption<LegendOptions>(props.legend, true);

  const metrics = useMemo(() => labelColumn(data, labelKey), [data, labelKey]);
  const signature = props.series
    .map((s) => [s.key, s.label, s.color, s.symbol].join('\u0001'))
    .join('\u0002');
  const configs = useMemo(
    () => props.series,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature],
  );
  const columns = useMemo(() => configs.map((c) => numericColumn(data, c.key)), [configs, data]);

  const [hiddenList, setHidden] = useControllableState<readonly string[]>(
    props.hiddenSeries,
    props.defaultHiddenSeries ?? [],
    props.onHiddenSeriesChange as ((h: readonly string[]) => void) | undefined,
  );
  const hidden = useMemo(() => new Set(hiddenList), [hiddenList]);
  const toggleSeries = useCallback(
    (id: string) =>
      setHidden(hidden.has(id) ? hiddenList.filter((h) => h !== id) : [...hiddenList, id]),
    [hidden, hiddenList, setHidden],
  );

  const specs = useMemo<RadarSeriesSpec[]>(
    () =>
      configs.map((c, i) => {
        const dash = props.differentiate ? DASHES[i % DASHES.length] : '';
        return {
          id: String(c.key),
          label: c.label ?? String(c.key),
          color: c.color ?? seriesColor(i),
          values: columns[i] as Float64Array,
          visible: !hidden.has(String(c.key)),
          symbol:
            c.symbol ??
            (props.differentiate
              ? (SYMBOL_SHAPES[i % SYMBOL_SHAPES.length] as SymbolShape)
              : 'circle'),
          ...(dash ? { dash } : {}),
        };
      }),
    [configs, columns, hidden, props.differentiate],
  );

  const model = useMemo<RadarModel>(
    () =>
      buildRadarModel({
        width: root.width,
        height: root.height,
        metrics,
        series: specs,
        ...(props.min !== undefined ? { min: props.min } : {}),
        ...(props.max !== undefined ? { max: props.max } : {}),
        ...(props.levels !== undefined ? { levels: props.levels } : {}),
        ...(props.shape ? { shape: props.shape } : {}),
        ...(props.dots !== undefined ? { dots: props.dots } : {}),
        ...(props.fillOpacity !== undefined ? { fillOpacity: props.fillOpacity } : {}),
        ...(props.startAngle !== undefined ? { startAngle: props.startAngle * RAD } : {}),
        ...(props.ticks !== undefined ? { ticks: props.ticks } : {}),
        ...(props.tickFormatter ? { format: props.tickFormatter } : {}),
        locale: root.locale,
      }),
    [
      root.width,
      root.height,
      root.locale,
      metrics,
      specs,
      props.min,
      props.max,
      props.levels,
      props.shape,
      props.dots,
      props.fillOpacity,
      props.startAngle,
      props.ticks,
      props.tickFormatter,
    ],
  );

  const fmtValue = useCallback(
    (v: number, si: number) => {
      if (!Number.isFinite(v)) return '—';
      const c = configs[si];
      if (c?.format) return c.format(v);
      if (valueFormatter) return valueFormatter(v, String(c?.key));
      return formatAuto(v, root.locale);
    },
    [configs, valueFormatter, root.locale],
  );

  const adapter = useMemo<ChartAdapter>(() => {
    const n = metrics.length;
    const visible = specs.map((s, i) => (s.visible !== false ? i : -1)).filter((i) => i >= 0);
    const anchor = (metric: number, si: number): ActiveItem | null => {
      if (metric < 0 || metric >= n) return null;
      // Tooltip next to the focused dataset's vertex, or the outermost vertex on the spoke.
      let best = model.spokeEnd(metric);
      let bestR = -1;
      for (const i of si >= 0 ? [si] : visible) {
        const p = model.point(i, metric);
        if (!p) continue;
        const r = Math.hypot(p.x - model.cx, p.y - model.cy);
        if (r > bestR) {
          bestR = r;
          best = p;
        }
      }
      return { position: metric, series: si, x: best.x, y: best.y };
    };
    const tooltip = (a: ActiveItem): TooltipData | null => {
      const m = a.position;
      if (m < 0 || m >= n) return null;
      return {
        title: metrics[m] ?? '',
        rows: visible.map((i) => {
          const s = specs[i] as RadarSeriesSpec;
          return {
            key: s.id,
            label: s.label,
            value: fmtValue(s.values[m] as number, i),
            color: s.color,
            kind: 'point' as const,
            ...(s.symbol && s.symbol !== 'circle' ? { symbol: s.symbol } : {}),
            active: i === a.series,
          };
        }),
      };
    };
    const activeMarks = (a: ActiveItem): Mark[] => {
      const m = a.position;
      if (m < 0 || m >= n) return [];
      const end = model.spokeEnd(m);
      const out: Mark[] = [
        {
          type: 'rule',
          key: 'active|spoke',
          x1: model.cx,
          y1: model.cy,
          x2: end.x,
          y2: end.y,
          stroke: 'var(--jc-crosshair)',
          strokeWidth: 1,
        },
      ];
      // A focused dataset is redrawn on top so it reads through the others.
      if (a.series >= 0) {
        const outline = model.marks.find(
          (x): x is LineMark => x.type === 'line' && x.series === a.series,
        );
        if (outline)
          out.push({ ...outline, key: 'active|outline', strokeWidth: 2.5, enter: undefined });
      }
      for (const i of visible) {
        const p = model.point(i, m);
        if (!p) continue;
        const s = specs[i] as RadarSeriesSpec;
        out.push({
          type: 'symbol',
          key: `active|${s.id}`,
          xs: Float64Array.of(p.x),
          ys: Float64Array.of(p.y),
          size: a.series === i ? 12 : 10,
          shape: s.symbol ?? 'circle',
          fill: s.color,
          stroke: 'var(--jc-bg)',
          strokeWidth: 4,
        });
      }
      return out;
    };
    const move: ChartAdapter['move'] = (a, key) => {
      if (n === 0) return null;
      const cur = a?.position ?? -1;
      const si = a?.series ?? -1;
      switch (key) {
        case 'first':
          return anchor(0, si);
        case 'last':
          return anchor(n - 1, si);
        case 'next':
          return anchor(cur < 0 ? 0 : (cur + 1) % n, si);
        case 'prev':
          return anchor(cur < 0 ? n - 1 : (cur - 1 + n) % n, si);
        case 'up':
        case 'down': {
          if (!visible.length) return a;
          const k = visible.indexOf(si);
          const next =
            k < 0
              ? key === 'down'
                ? 0
                : visible.length - 1
              : key === 'down'
                ? (k + 1) % visible.length
                : (k - 1 + visible.length) % visible.length;
          return anchor(cur < 0 ? 0 : cur, visible[next] as number);
        }
      }
    };
    return {
      marks: model.marks,
      hitTest: (x, y) => anchor(model.hitTest(x, y), -1),
      tooltip,
      activeMarks,
      move,
      itemAt: (p, si = -1) => anchor(p, si),
      pointCount: n * visible.length,
    };
  }, [model, metrics, specs, fmtValue]);

  const info = useMemo<SeriesInfo[]>(
    () =>
      specs.map((s) => ({
        id: s.id,
        label: s.label,
        color: s.color,
        // Differentiated datasets show their marker shape in the legend.
        kind: props.differentiate ? 'line' : 'area',
        symbol: s.symbol ?? 'circle',
        ...(s.dash ? { dash: s.dash } : {}),
        visible: s.visible !== false,
      })),
    [specs, props.differentiate],
  );

  const table = useMemo<DataTable>(
    () => ({
      columns: [root.messages.category, ...specs.map((s) => s.label)],
      rows: metrics.map((m, k) => [m, ...specs.map((s, i) => fmtValue(s.values[k] as number, i))]),
    }),
    [metrics, specs, fmtValue, root.messages.category],
  );

  const event = (a: ActiveItem | null): RadarEvent<T> | null => {
    if (!a || a.position < 0 || a.position >= metrics.length) return null;
    const s = a.series >= 0 ? specs[a.series] : undefined;
    const v = s ? (s.values[a.position] as number) : Number.NaN;
    return {
      datum: data[a.position] as T,
      index: a.position,
      label: metrics[a.position] ?? '',
      series: s ? s.id : null,
      value: Number.isFinite(v) ? v : null,
    };
  };

  const empty =
    metrics.length === 0 ||
    specs.length === 0 ||
    columns.every((c) => c.every((v) => !Number.isFinite(v)));

  return (
    <ChartView
      root={root}
      base={props}
      kind="Radar chart"
      adapter={adapter}
      frame={null}
      plot={{ x: 0, y: 0, width: root.width, height: root.height }}
      series={info}
      toggleSeries={toggleSeries}
      labels={model.labels}
      empty={empty}
      tooltip={tooltipOpts ?? false}
      legend={legendOpts && (specs.length > 1 || props.legend) ? legendOpts : false}
      table={table}
      clip={false}
      {...(props.activeIndex !== undefined ? { activePosition: props.activeIndex } : {})}
      onActiveChange={(a) => {
        const e = event(a);
        props.onHover?.(e);
        props.onActiveIndexChange?.(e ? e.index : null);
      }}
      onItemClick={(a) => {
        const e = event(a);
        if (e) props.onClick?.(e);
      }}
      background={
        <SeriesLayer marks={model.grid} chartId={`${root.id}-grid`} className="jc-radar-grid" />
      }
      foreground={<RadarTicks ticks={model.tickLabels} />}
    >
      {props.children}
    </ChartView>
  );
}
