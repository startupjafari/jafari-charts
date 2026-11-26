import {
  buildCartesianModel,
  clampDomain,
  detectDimensionType,
  formatAuto,
  formatDate,
  inferDateFormat,
  isFullDomain,
  isSortedAscending,
  labelColumn,
  nearestIndex,
  numericColumn,
  panDomain,
  permute,
  sortIndices,
  SYMBOL_SHAPES,
  timeColumn,
  wheelZoomFactor,
  zoomDomain,
  type AxisValue,
  type CartesianModel,
  type CartesianSeriesSpec,
  type CartesianSpec,
  type DimensionType,
  type LinearScale,
  type Mark,
  type Rect,
  type RuleMark,
  type StackOffset,
  type SymbolShape,
} from '@jafari/charts-core';
import { seriesColor } from '@jafari/charts-themes';
import { useCallback, useMemo, useRef } from 'react';
import type { DataTable } from '../../components/ChartA11y';
import { ChartAxis } from '../../components/ChartAxis';
import { ChartCrosshair, ChartCursor } from '../../components/ChartCrosshair';
import { ChartGrid } from '../../components/ChartGrid';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView, type SurfaceHandlers } from '../../components/ChartView';
import { useControllableState } from '../../hooks/useControllableState';
import { useStoreSelector } from '../../hooks/useStoreSelector';
import { devWarn } from '../../internal/env';
import { useChartRoot, type ChartRoot } from '../../internal/useChartRoot';
import type {
  ActiveItem,
  ChartAdapter,
  InteractionState,
  SeriesInfo,
  TooltipData,
} from '../../providers/ChartContext';
import { useChart } from '../../providers/ChartContext';
import type {
  BarOptions,
  CartesianChartProps,
  ChartItemEvent,
  SeriesConfig,
  XAxisOptions,
  YAxisOptions,
} from './types';
import { resolveOption } from '../../internal/options';

const DASHES = ['', '6 4', '2 3', '8 3 2 3', '1 3', '10 4'];

/** Internal configuration a concrete chart passes to the engine. */
export interface CartesianPreset {
  /** Accessible chart type ("Line chart"). */
  kind: string;
  /** Mark type for series without an explicit `type`. */
  type: 'line' | 'area' | 'bar';
  orientation?: 'vertical' | 'horizontal';
  /** Stack every series (Stacked Bar/Area). */
  stack?: boolean;
  stackOffset?: StackOffset;
  areaFill?: 'gradient' | 'solid';
  defaultHeight?: number;
  /** Sparkline mode: no axes, grid, legend or table. */
  minimal?: boolean;
  /** Extra marks/labels (waterfall connectors). */
  extraMarks?: (model: CartesianModel) => Mark[];
  /** Per-datum bar colours (waterfall). */
  colors?: readonly (string | undefined)[];
  /** Explicit bar bases (waterfall). */
  base?: Float64Array;
  /** Plotted values for the first series, overriding the data column (waterfall tops). */
  values?: Float64Array;
  /** Values shown in labels and tooltips for the first series (waterfall changes). */
  display?: Float64Array;
  /** Default for the `labels` bar option. */
  labels?: boolean;
  /** Default tooltip mode. */
  tooltipMode?: 'shared' | 'item';
  /** Extra tooltip footer, e.g. totals. */
  footer?: (position: number) => string | undefined;
  /** Point count above which `renderer="auto"` picks canvas. */
  canvasThreshold?: number;
}

export type InternalCartesianProps<T extends object> = CartesianChartProps<T> & BarOptions;

interface Prepared {
  type: DimensionType;
  values: Float64Array;
  labels: string[];
  /** Sorted position → index into `data`. */
  order: Uint32Array | null;
  raw: (position: number) => AxisValue | null;
  columns: Float64Array[];
  configs: SeriesConfig<object>[];
}

/** A stable string identity for series configs, so inline arrays don't invalidate memoised layouts. */
function seriesSignature(series: readonly SeriesConfig<object>[]): string {
  return series
    .map((s) =>
      [
        s.key,
        s.label,
        s.color,
        s.type,
        s.curve,
        s.dashed,
        s.axis,
        s.stackId,
        s.dots,
        s.symbol,
      ].join('\u0001'),
    )
    .join('\u0002');
}

function inferYKey<T extends object>(data: readonly T[], xKey: string): string | null {
  const first = data.find((d) => d !== null && d !== undefined);
  if (!first) return null;
  for (const [k, v] of Object.entries(first)) if (k !== xKey && typeof v === 'number') return k;
  return null;
}

function usePrepared<T extends object>(
  props: InternalCartesianProps<T>,
  xOpts: XAxisOptions | null,
): Prepared {
  const { data, xKey, yKey } = props;
  const configSignature = props.series
    ? seriesSignature(props.series as unknown as SeriesConfig<object>[])
    : '';
  const configs = useMemo<SeriesConfig<object>[]>(() => {
    if (props.series?.length) return props.series as unknown as SeriesConfig<object>[];
    const key = yKey ?? (inferYKey(data, xKey) as never);
    if (!yKey) devWarn(`No "yKey" or "series" given; using "${String(key)}".`);
    if (!key) return [];
    return [
      {
        key,
        ...(props.label ? { label: props.label } : {}),
        ...(props.color ? { color: props.color } : {}),
      },
    ] as SeriesConfig<object>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configSignature, yKey, props.label, props.color, xKey, data]);

  const forcedType = xOpts?.type;
  const utc = xOpts?.utc ?? false;
  const signature = seriesSignature(configs);
  return useMemo(() => {
    if (
      data.length &&
      typeof data[0] === 'object' &&
      data[0] !== null &&
      !(xKey in (data[0] as object))
    ) {
      devWarn(`xKey "${xKey}" does not exist on the first datum.`);
    }
    const type = forcedType ?? detectDimensionType(data, xKey);
    let values =
      type === 'time'
        ? timeColumn(data, xKey)
        : type === 'number'
          ? numericColumn(data, xKey)
          : new Float64Array(0);
    let labels = type === 'category' ? labelColumn(data, xKey) : [];
    let columns = configs.map((c) => numericColumn(data, c.key as never));
    let order: Uint32Array | null = null;
    if (type !== 'category' && !isSortedAscending(values)) {
      order = sortIndices(values);
      values = permute(values, order);
      columns = columns.map((c) => permute(c, order as Uint32Array));
    }
    // Rows with an invalid x cannot be placed; they sort to the end and are dropped.
    if (type !== 'category') {
      let n = values.length;
      while (n > 0 && !Number.isFinite(values[n - 1] as number)) n--;
      if (n < values.length) {
        values = values.subarray(0, n);
        columns = columns.map((c) => c.subarray(0, n));
        order = (order ?? Uint32Array.from({ length: data.length }, (_, i) => i)).subarray(0, n);
      }
    }
    if (type === 'category' && xOpts?.format) labels = labels.map((l) => xOpts.format?.(l) ?? l);
    const raw = (p: number): AxisValue | null => {
      const d = data[order ? (order[p] as number) : p] as Record<string, unknown> | undefined;
      const v = d?.[xKey];
      return v === undefined || v === null ? null : (v as AxisValue);
    };
    return { type, values, labels, order, raw, columns, configs };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, xKey, signature, forcedType, utc]);
}

function useResolvedSeries(
  prepared: Prepared,
  preset: CartesianPreset,
  props: InternalCartesianProps<object>,
  hidden: ReadonlySet<string>,
) {
  const { configs, columns } = prepared;
  return useMemo(() => {
    const specs: CartesianSeriesSpec[] = configs.map((c, i) => {
      const type = c.type ?? preset.type;
      const color = c.color ?? seriesColor(i);
      const symbol: SymbolShape =
        c.symbol ??
        (props.differentiate ? (SYMBOL_SHAPES[i % SYMBOL_SHAPES.length] as SymbolShape) : 'circle');
      const dash = c.dashed
        ? '6 4'
        : props.differentiate && type === 'line'
          ? DASHES[i % DASHES.length]
          : '';
      const spec: CartesianSeriesSpec = {
        id: String(c.key),
        label: c.label ?? String(c.key),
        color,
        type,
        values: (i === 0 && preset.values ? preset.values : columns[i]) as Float64Array,
        visible: !hidden.has(String(c.key)),
        symbol,
        curve: c.curve ?? props.curve ?? 'monotone',
        dots: c.dots ?? props.dots ?? false,
        fill: preset.areaFill ?? 'gradient',
      };
      if (dash) spec.dash = dash;
      if (c.axis === 'right') spec.axis = 'y2';
      if (c.stackId) spec.stack = c.stackId;
      else if (preset.stack) spec.stack = 'stack';
      if (preset.colors && i === 0) spec.colors = preset.colors;
      if (preset.base && i === 0) spec.base = preset.base;
      if (preset.display && i === 0) spec.display = preset.display;
      return spec;
    });
    const info: SeriesInfo[] = specs.map((s) => ({
      id: s.id,
      label: s.label,
      color: s.color,
      kind: s.type,
      symbol: s.symbol ?? 'circle',
      ...(s.dash ? { dash: s.dash } : {}),
      visible: s.visible !== false,
    }));
    return { specs, info };
  }, [configs, columns, hidden, preset, props.curve, props.dots, props.differentiate]);
}

function axisSpec(o: YAxisOptions | null) {
  return {
    ...(o?.hidden || !o ? { hidden: true } : {}),
    ...(o?.tickCount !== undefined ? { tickCount: o.tickCount } : {}),
    ...(o?.format ? { format: o.format } : {}),
    ...(o?.min !== undefined ? { min: o.min } : {}),
    ...(o?.max !== undefined ? { max: o.max } : {}),
    ...(o?.includeZero !== undefined ? { includeZero: o.includeZero } : {}),
    ...(o?.scale ? { scale: o.scale } : {}),
    ...(o?.nice !== undefined ? { nice: o.nice } : {}),
  };
}

function BrushOverlay({ plot }: { plot: Rect }) {
  const { store } = useChart();
  const brush = useStoreSelector(store, selectBrush);
  if (!brush) return null;
  const [a, b] = brush.split(':').map(Number) as [number, number];
  return (
    <rect
      className="jc-brush"
      x={Math.min(a, b)}
      y={plot.y}
      width={Math.abs(b - a)}
      height={plot.height}
    />
  );
}
const selectBrush = (s: InteractionState) => (s.brush ? `${s.brush.from}:${s.brush.to}` : '');

/**
 * The shared engine behind Line, Area, Bar (all variants), Combo, Stacked Area,
 * Waterfall and Sparkline charts.
 */
export function CartesianChart<T extends object>({
  preset,
  ...props
}: InternalCartesianProps<T> & { preset: CartesianPreset }) {
  const root = useChartRoot(props, { height: preset.defaultHeight ?? 280 });
  const minimal = preset.minimal ?? false;
  const xOpts = resolveOption<XAxisOptions>(props.xAxis, !minimal);
  const yOpts = resolveOption<YAxisOptions>(props.yAxis, !minimal);
  const y2Opts = resolveOption<YAxisOptions>(props.y2Axis, !minimal);
  const gridOpts = resolveOption<{ horizontal?: boolean; vertical?: boolean }>(
    props.grid,
    !minimal,
  );
  const tooltipOpts = resolveOption<TooltipOptions>(props.tooltip, !minimal);
  const legendOpts = resolveOption<LegendOptions>(props.legend, !minimal);
  const crosshairOpts = resolveOption<{ horizontal?: boolean }>(
    props.crosshair,
    !minimal && preset.type !== 'bar',
  );
  const zoomOpts = resolveOption<{ wheel?: boolean | 'ctrl'; minSpan?: number }>(props.zoom, false);

  const prepared = usePrepared(props, xOpts);
  const [hiddenList, setHidden] = useControllableState<readonly string[]>(
    props.hiddenSeries,
    props.defaultHiddenSeries ?? [],
    props.onHiddenSeriesChange as ((h: readonly string[]) => void) | undefined,
  );
  const hidden = useMemo(() => new Set(hiddenList), [hiddenList]);
  const { specs, info } = useResolvedSeries(
    prepared,
    preset,
    props as unknown as InternalCartesianProps<object>,
    hidden,
  );
  const toggleSeries = useCallback(
    (id: string) =>
      setHidden(hidden.has(id) ? hiddenList.filter((h) => h !== id) : [...hiddenList, id]),
    [hidden, hiddenList, setHidden],
  );

  // Zoom state (continuous x only).
  const continuous =
    prepared.type !== 'category' && preset.type !== 'bar' && !specs.some((s) => s.type === 'bar');
  const n = prepared.values.length;
  const bounds = useMemo<[number, number] | null>(() => {
    if (!continuous || n < 2) return null;
    return [prepared.values[0] as number, prepared.values[n - 1] as number];
  }, [continuous, n, prepared.values]);
  const [xDomain, setXDomain] = useControllableState<readonly [number, number] | null>(
    props.xDomain,
    null,
    props.onXDomainChange,
  );
  const limits = useMemo(
    () =>
      bounds ? { bounds, minSpan: (bounds[1] - bounds[0]) * (zoomOpts?.minSpan ?? 0.01) } : null,
    [bounds, zoomOpts?.minSpan],
  );
  const domain = xDomain && limits ? clampDomain(xDomain, limits) : null;

  const yKeyDeps = JSON.stringify(yOpts);
  const y2KeyDeps = JSON.stringify(y2Opts);
  const domainLo = domain?.[0];
  const domainHi = domain?.[1];
  const model = useMemo(() => {
    const spec: CartesianSpec = {
      width: root.width,
      height: root.height,
      orientation: preset.orientation ?? 'vertical',
      x: {
        type: prepared.type,
        values: prepared.values,
        labels: prepared.labels,
        utc: xOpts?.utc ?? false,
        ...(xOpts?.format && prepared.type !== 'category'
          ? { format: xOpts.format as (v: number) => string }
          : {}),
        ...(xOpts?.hidden || !xOpts ? { hidden: true } : {}),
        ...(xOpts?.tickCount !== undefined ? { tickCount: xOpts.tickCount } : {}),
        ...(domain ? { domain } : {}),
      },
      y: axisSpec(yOpts),
      y2: axisSpec(y2Opts),
      series: specs,
      ...(preset.stackOffset ? { stackOffset: preset.stackOffset } : {}),
      bar: {
        ...(props.barRadius !== undefined ? { radius: props.barRadius } : {}),
        ...(props.maxBarSize !== undefined ? { maxSize: props.maxBarSize } : {}),
        ...(props.barGap !== undefined ? { gap: props.barGap } : {}),
        ...(props.categoryGap !== undefined ? { categoryGap: props.categoryGap } : {}),
      },
      locale: root.locale,
      barLabels: props.labels ?? preset.labels ?? false,
      labelFormat: (v, si) => {
        const s = prepared.configs[si];
        return s?.format
          ? s.format(v)
          : props.valueFormatter
            ? props.valueFormatter(v, String(s?.key))
            : formatAuto(v, root.locale);
      },
      ...(props.downsample !== undefined ? { downsample: props.downsample } : {}),
      ...(minimal ? { padding: { top: 4, right: 4, bottom: 4, left: 4 } } : {}),
    };
    if (preset.type === 'bar' && prepared.type === 'time') spec.x.band = true;
    return buildCartesianModel(spec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    root.width,
    root.height,
    root.locale,
    prepared,
    specs,
    domainLo,
    domainHi,
    preset,
    minimal,
    props.barRadius,
    props.maxBarSize,
    props.barGap,
    props.categoryGap,
    props.labels,
    props.downsample,
    yKeyDeps,
    y2KeyDeps,
    xOpts?.hidden,
    xOpts?.tickCount,
    xOpts?.utc,
  ]);

  const adapter = useCartesianAdapter(
    model,
    prepared,
    specs,
    root,
    props as unknown as InternalCartesianProps<object>,
    preset,
    tooltipOpts?.mode ?? preset.tooltipMode ?? 'shared',
  );
  const frame = model.frame;
  const horizontal = model.orientation === 'horizontal';
  const valueScale = (horizontal ? frame.x : frame.y) as LinearScale;
  const showZero =
    valueScale.kind === 'linear' && valueScale.domain[0] < 0 && valueScale.domain[1] > 0;
  const zero = showZero ? valueScale.map(0) : null;

  const table = useMemo<DataTable | undefined>(() => {
    const limit = typeof props.accessibilityTable === 'number' ? props.accessibilityTable : 60;
    if (
      minimal ||
      props.accessibilityTable === false ||
      (model.length > limit && props.accessibilityTable !== true)
    )
      return undefined;
    const rows: string[][] = [];
    for (let p = 0; p < Math.min(model.length, limit); p++) {
      const title = adapter.tooltip({ position: p, series: -1, x: 0, y: 0 });
      if (title)
        rows.push([
          title.title,
          ...specs.map((s) => title.rows.find((r) => r.key === s.id)?.value ?? '—'),
        ]);
    }
    return { columns: [root.messages.category, ...specs.map((s) => s.label)], rows };
  }, [adapter, model.length, minimal, props.accessibilityTable, specs, root.messages.category]);

  const handlers = useZoomBrush(
    model,
    prepared,
    props,
    root,
    limits,
    domain,
    setXDomain,
    zoomOpts,
    continuous,
  );

  const onEvent = (item: ActiveItem | null): ChartItemEvent<T> | null => {
    if (!item) return null;
    const index = prepared.order ? (prepared.order[item.position] as number) : item.position;
    const s = item.series >= 0 ? specs[item.series] : undefined;
    const v = s ? (s.values[item.position] as number) : Number.NaN;
    return {
      datum: props.data[index] as T,
      index,
      series: s ? s.id : null,
      value: Number.isFinite(v) ? v : null,
      x: prepared.raw(item.position),
    };
  };
  const toPosition = (index: number | null | undefined) => {
    if (index === null || index === undefined || !prepared.order) return index;
    const p = prepared.order.indexOf(index);
    return p < 0 ? null : p;
  };

  const empty =
    n === 0 && prepared.labels.length === 0
      ? true
      : specs.every((s) => s.values.every((v) => !Number.isFinite(v)));
  const isBar = preset.type === 'bar';
  const plot = frame.plot;

  return (
    <ChartView
      root={root}
      base={props}
      kind={preset.kind}
      adapter={adapter}
      frame={frame}
      plot={plot}
      series={info}
      toggleSeries={toggleSeries}
      labels={model.labels}
      empty={empty}
      tooltip={tooltipOpts ? { ...tooltipOpts } : false}
      legend={legendOpts && (specs.length > 1 || props.legend) ? legendOpts : false}
      {...(table ? { table } : {})}
      dimOnActive={isBar}
      {...(preset.canvasThreshold !== undefined ? { canvasThreshold: preset.canvasThreshold } : {})}
      {...(props.activeIndex !== undefined
        ? { activePosition: toPosition(props.activeIndex) ?? null }
        : {})}
      onActiveChange={(item) => {
        props.onHover?.(onEvent(item));
        props.onActiveIndexChange?.(item ? (onEvent(item)?.index ?? null) : null);
      }}
      onItemClick={(item) => {
        const e = onEvent(item);
        if (e) props.onClick?.(e);
      }}
      surfaceHandlers={handlers.handlers}
      legendForSingle={Boolean(props.legend)}
      {...(props.syncId ? { syncId: props.syncId } : {})}
      {...(props.highlightedSeries !== undefined
        ? { highlightedSeries: props.highlightedSeries }
        : {})}
      controls={handlers.controls}
      background={
        <>
          {gridOpts ? (
            <ChartGrid
              horizontal={gridOpts.horizontal ?? !horizontal}
              vertical={gridOpts.vertical ?? horizontal}
              zeroLine={zero}
            />
          ) : zero !== null ? (
            <ChartGrid horizontal={false} vertical={false} zeroLine={zero} />
          ) : null}
        </>
      }
      underlay={
        isBar &&
        tooltipOpts &&
        (tooltipOpts.mode ?? preset.tooltipMode ?? 'shared') === 'shared' ? (
          <ChartCursor bandRect={model.bandRect} />
        ) : undefined
      }
      foreground={
        minimal ? null : (
          <>
            {xOpts && !xOpts.hidden ? (
              <ChartAxis
                position="bottom"
                line={xOpts.line ?? (isBar && !horizontal)}
                {...(xOpts.title ? { title: xOpts.title } : {})}
              />
            ) : null}
            {yOpts && !yOpts.hidden ? (
              <ChartAxis
                position="left"
                line={horizontal && (yOpts as { line?: boolean }).line !== false}
                {...(yOpts.title ? { title: yOpts.title } : {})}
              />
            ) : null}
            {frame.y2Ticks.length ? <ChartAxis position="right" /> : null}
          </>
        )
      }
      overlay={
        <>
          {crosshairOpts && !model.band ? (
            <ChartCrosshair horizontal={crosshairOpts.horizontal ?? false} />
          ) : null}
          {crosshairOpts && model.band && !isBar ? (
            <ChartCrosshair horizontal={crosshairOpts.horizontal ?? false} />
          ) : null}
          <BrushOverlay plot={plot} />
        </>
      }
    >
      {props.children}
    </ChartView>
  );
}

function useCartesianAdapter(
  model: CartesianModel,
  prepared: Prepared,
  specs: CartesianSeriesSpec[],
  root: ChartRoot,
  props: InternalCartesianProps<object>,
  preset: CartesianPreset,
  mode: 'shared' | 'item',
): ChartAdapter {
  const { valueFormatter, xFormatter } = props;
  return useMemo<ChartAdapter>(() => {
    const visible = specs.map((s, i) => (s.visible !== false ? i : -1)).filter((i) => i >= 0);
    const dateFmt =
      prepared.type === 'time'
        ? inferDateFormat(
            prepared.values,
            props.xAxis && typeof props.xAxis === 'object' ? props.xAxis.utc : false,
          )
        : null;
    const fmtValue = (v: number, si: number) => {
      if (!Number.isFinite(v)) return '—';
      const s = prepared.configs[si];
      if (s?.format) return s.format(v);
      if (valueFormatter) return valueFormatter(v, String(s?.key));
      return formatAuto(v, root.locale);
    };
    const title = (p: number) => {
      const raw = prepared.raw(p);
      if (xFormatter && raw !== null) return xFormatter(raw);
      if (prepared.type === 'time')
        return formatDate(prepared.values[p] as number, { locale: root.locale, ...dateFmt });
      if (prepared.type === 'number') return formatAuto(prepared.values[p] as number, root.locale);
      return prepared.labels[p] ?? '';
    };
    const anchor = (p: number, si: number): ActiveItem => {
      const along = model.position(p);
      let y = model.frame.plot.y + model.frame.plot.height / 2;
      let x = along;
      const pts = (si >= 0 ? [si] : visible)
        .map((i) => model.point(i, p))
        .filter((q): q is { x: number; y: number } => q !== null);
      if (pts.length) {
        if (model.orientation === 'horizontal') {
          x = Math.max(...pts.map((q) => q.x));
          y = along;
        } else y = Math.min(...pts.map((q) => q.y));
      } else if (model.orientation === 'horizontal') {
        x = model.frame.plot.x + model.frame.plot.width / 2;
        y = along;
      }
      return { position: p, series: si, x, y };
    };
    const expand = preset.stackOffset === 'expand';
    const tooltip = (a: ActiveItem): TooltipData | null => {
      const p = a.position;
      if (p < 0 || p >= model.length) return null;
      const rows = visible
        .filter((i) => a.series < 0 || mode === 'shared' || i === a.series)
        .map((i) => {
          const s = specs[i] as CartesianSeriesSpec;
          const v = (s.display ?? s.values)[p] as number;
          let value = fmtValue(v, i);
          if (expand && Number.isFinite(v)) {
            let total = 0;
            for (const j of visible) {
              const w = specs[j]?.values[p] as number;
              if (Number.isFinite(w)) total += Math.abs(w);
            }
            if (total > 0) value += ` · ${Math.round((Math.abs(v) / total) * 100)}%`;
          }
          return {
            key: s.id,
            label: s.label,
            value,
            color: s.colors?.[p] ?? s.color,
            kind: s.type,
            ...(s.symbol && s.symbol !== 'circle' ? { symbol: s.symbol } : {}),
            ...(s.dash ? { dash: s.dash } : {}),
            active: i === a.series,
          };
        });
      const footer =
        preset.footer?.(p) ?? (preset.stack && visible.length > 1 ? totalFooter(p) : undefined);
      return { title: title(p), rows, ...(footer ? { footer } : {}) };
    };
    const totalFooter = (p: number) => {
      let total = 0;
      let any = false;
      for (const i of visible) {
        const v = specs[i]?.values[p] as number;
        if (Number.isFinite(v)) {
          total += v;
          any = true;
        }
      }
      return any ? `${root.messages.total}: ${fmtValue(total, visible[0] ?? 0)}` : undefined;
    };
    const activeMarks = (a: ActiveItem): Mark[] => {
      const out: Mark[] = [];
      const p = a.position;
      for (const i of visible) {
        if (mode === 'item' && a.series >= 0 && i !== a.series) continue;
        const s = specs[i] as CartesianSeriesSpec;
        if (s.type === 'bar') {
          const r = model.barRect(i, p);
          if (r) out.push({ ...r, key: `active|${r.key}`, enter: undefined } as Mark);
          continue;
        }
        const pt = model.point(i, p);
        if (!pt) continue;
        out.push({
          type: 'symbol',
          key: `active|${s.id}`,
          xs: Float64Array.of(pt.x),
          ys: Float64Array.of(pt.y),
          size: a.series === i ? 12 : 10,
          shape: s.symbol ?? 'circle',
          fill: s.color,
          stroke: 'var(--jc-bg)',
          strokeWidth: 4,
        });
      }
      return out;
    };
    const [v0, v1] = model.visible;
    const move: ChartAdapter['move'] = (a, key) => {
      if (model.length === 0) return null;
      const cur = a?.position ?? -1;
      const curSeries = a?.series ?? -1;
      switch (key) {
        case 'first':
          return anchor(v0, curSeries);
        case 'last':
          return anchor(v1, curSeries);
        case 'next':
          return anchor(cur < 0 ? v0 : Math.min(v1, cur + 1), curSeries);
        case 'prev':
          return anchor(cur < 0 ? v1 : Math.max(v0, cur - 1), curSeries);
        case 'up':
        case 'down': {
          if (!visible.length) return a;
          const k = visible.indexOf(curSeries);
          const next =
            key === 'down' ? (k + 1) % visible.length : (k - 1 + visible.length) % visible.length;
          return anchor(cur < 0 ? v0 : cur, visible[k < 0 ? 0 : next] as number);
        }
      }
    };
    return {
      marks: preset.extraMarks ? [...preset.extraMarks(model), ...model.marks] : model.marks,
      hitTest: (x, y) => {
        const h = model.hitTest(x, y, mode);
        return h ? anchor(h.position, h.series) : null;
      },
      tooltip,
      activeMarks,
      move,
      itemAt: (p, si = -1) => (p >= 0 && p < model.length ? anchor(p, si) : null),
      pointCount: model.length * Math.max(1, visible.length),
      syncKey: (a) =>
        prepared.type === 'category'
          ? (prepared.labels[a.position] ?? null)
          : (prepared.values[a.position] ?? null),
      fromSyncKey: (key) => {
        let p = -1;
        if (prepared.type === 'category') p = prepared.labels.indexOf(String(key));
        else if (typeof key === 'number') {
          const n = prepared.values.length;
          const lo = prepared.values[0] as number;
          const hi = prepared.values[n - 1] as number;
          // Only match values inside this chart's own x range.
          if (n && key >= lo && key <= hi) p = nearestIndex(prepared.values, key);
        }
        return p >= model.visible[0] && p <= model.visible[1] ? anchor(p, -1) : null;
      },
    };
  }, [
    model,
    prepared,
    specs,
    root.locale,
    root.messages,
    valueFormatter,
    xFormatter,
    preset,
    mode,
    props.xAxis,
  ]);
}

function useZoomBrush<T extends object>(
  model: CartesianModel,
  prepared: Prepared,
  props: InternalCartesianProps<T>,
  root: ChartRoot,
  limits: { bounds: [number, number]; minSpan: number } | null,
  domain: [number, number] | null,
  setDomain: (d: readonly [number, number] | null) => void,
  zoomOpts: { wheel?: boolean | 'ctrl' } | null,
  continuous: boolean,
): { handlers: SurfaceHandlers | undefined; controls: React.ReactNode } {
  const drag = useRef<{ mode: 'pan' | 'brush'; startX: number; domain: [number, number] } | null>(
    null,
  );
  const pointers = useRef(new Map<number, number>());
  const pinch = useRef<{ distance: number; domain: [number, number] } | null>(null);
  const zoomEnabled = Boolean(zoomOpts) && continuous && limits !== null;
  const brushEnabled = Boolean(props.brush) && continuous && limits !== null;
  if (!zoomEnabled && !brushEnabled) return { handlers: undefined, controls: null };

  const plot = model.frame.plot;
  const xScale = model.frame.x as LinearScale;
  const current = domain ?? limits!.bounds;
  const zoomed = domain !== null && !isFullDomain(domain, limits!.bounds);
  const clampX = (x: number) => Math.min(plot.x + plot.width, Math.max(plot.x, x));
  const setOrReset = (d: [number, number]) =>
    setDomain(isFullDomain(d, limits!.bounds, 1e-6) ? null : d);

  const finishBrush = (a: number, b: number) => {
    root.store.setState({ brush: null });
    if (Math.abs(b - a) < 4) return;
    const from = xScale.invert(Math.min(a, b));
    const to = xScale.invert(Math.max(a, b));
    const startIndex = nearestIndex(prepared.values, from);
    const endIndex = nearestIndex(prepared.values, to);
    const index = (p: number) => (prepared.order ? (prepared.order[p] as number) : p);
    props.onBrush?.({
      from: prepared.raw(startIndex) ?? from,
      to: prepared.raw(endIndex) ?? to,
      startIndex: index(startIndex),
      endIndex: index(endIndex),
    });
    if (zoomEnabled) setOrReset(clampDomain([from, to], limits!));
  };

  const handlers: SurfaceHandlers = {
    zoomable: zoomEnabled,
    onPointerDown: (e, x) => {
      pointers.current.set(e.pointerId, e.clientX);
      if (pointers.current.size === 2 && zoomEnabled) {
        const [a, b] = [...pointers.current.values()] as [number, number];
        pinch.current = { distance: Math.abs(a - b) || 1, domain: current };
        drag.current = null;
        root.store.setState({ brush: null });
        return true;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return false;
      if (x < plot.x || x > plot.x + plot.width) return false;
      const mode =
        brushEnabled && !(zoomEnabled && e.shiftKey)
          ? 'brush'
          : zoomEnabled && zoomed
            ? 'pan'
            : null;
      if (!mode || (mode === 'brush' && e.pointerType === 'touch')) return false;
      drag.current = { mode, startX: x, domain: current };
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      if (mode === 'brush')
        root.store.setState({ brush: { from: clampX(x), to: clampX(x) }, active: null });
      return true;
    },
    onPointerMove: (e, x) => {
      if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, e.clientX);
      if (pinch.current && pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()] as [number, number];
        const factor = pinch.current.distance / (Math.abs(a - b) || 1);
        const r = (e.currentTarget as Element).getBoundingClientRect();
        const anchor = xScale.invert((a + b) / 2 - r.left);
        setOrReset(zoomDomain(pinch.current.domain, anchor, factor, limits!));
        return true;
      }
      const d = drag.current;
      if (!d) return false;
      if (d.mode === 'brush') {
        root.store.setState({ brush: { from: clampX(d.startX), to: clampX(x) } });
      } else {
        const span = d.domain[1] - d.domain[0];
        const delta = -((x - d.startX) / Math.max(1, plot.width)) * span;
        setOrReset(panDomain(d.domain, delta, limits!));
      }
      return true;
    },
    onPointerUp: (e, x) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      const d = drag.current;
      drag.current = null;
      if (d?.mode === 'brush') finishBrush(clampX(d.startX), clampX(x));
    },
    ...(zoomEnabled
      ? {
          onWheel: (e: WheelEvent, x: number) => {
            const wheel = zoomOpts?.wheel ?? 'ctrl';
            const pinchGesture = e.ctrlKey || e.metaKey;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && zoomed) {
              e.preventDefault();
              const span = current[1] - current[0];
              setOrReset(panDomain(current, (e.deltaX / Math.max(1, plot.width)) * span, limits!));
              return;
            }
            if (wheel === false || (wheel === 'ctrl' && !pinchGesture)) return;
            e.preventDefault();
            setOrReset(
              zoomDomain(
                current,
                xScale.invert(clampX(x)),
                wheelZoomFactor(e.deltaY, e.deltaMode),
                limits!,
              ),
            );
          },
          onDoubleClick: () => setDomain(null),
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
            const centre = (current[0] + current[1]) / 2;
            if (e.key === '+' || e.key === '=')
              setOrReset(zoomDomain(current, centre, 0.8, limits!));
            else if (e.key === '-' || e.key === '_')
              setOrReset(zoomDomain(current, centre, 1.25, limits!));
            else if (e.key === '0') setDomain(null);
            else return false;
            e.preventDefault();
            return true;
          },
        }
      : {}),
  };

  const controls =
    zoomEnabled && zoomed ? (
      <button type="button" className="jc-button jc-reset-zoom" onClick={() => setDomain(null)}>
        {root.messages.resetZoom}
      </button>
    ) : null;
  return { handlers, controls };
}

/** Builds rule marks connecting consecutive bars (waterfall). */
export function connectorMarks(model: CartesianModel, series = 0): RuleMark[] {
  const out: RuleMark[] = [];
  for (let p = 0; p < model.length - 1; p++) {
    const a = model.barRect(series, p);
    const b = model.barRect(series, p + 1);
    if (!a || !b) continue;
    const level = model.hi[series]?.[p] as number;
    const y = (model.frame.y as LinearScale).map(level);
    if (!Number.isFinite(y)) continue;
    out.push({
      type: 'rule',
      key: `conn|${p}`,
      x1: a.x + a.width,
      y1: Math.round(y) + 0.5,
      x2: b.x,
      y2: Math.round(y) + 0.5,
      stroke: 'var(--jc-text-muted)',
      strokeWidth: 1,
      dash: '3 3',
      series: -1,
    });
  }
  return out;
}
