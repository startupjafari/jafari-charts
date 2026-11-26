import {
  buildCartesianModel,
  clampDomain,
  detectDimensionType,
  formatAuto,
  formatDate,
  inferDateFormat,
  isSortedAscending,
  labelColumn,
  nearestIndex,
  numericColumn,
  permute,
  sortIndices,
  SYMBOL_SHAPES,
  timeColumn,
  type AxisValue,
  type CartesianModel,
  type CartesianSeriesSpec,
  type CartesianSpec,
  type DimensionType,
  type LinearScale,
  type Mark,
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
import { ChartView } from '../../components/ChartView';
import { useControllableState } from '../../hooks/useControllableState';
import { devWarn } from '../../internal/env';
import { useChartRoot, type ChartRoot } from '../../internal/useChartRoot';
import {
  BrushOverlay,
  useZoomGestures,
  type BrushRect,
  type ZoomAxis,
} from '../../internal/useZoomGestures';
import type {
  ActiveItem,
  ChartAdapter,
  SeriesInfo,
  TooltipData,
} from '../../providers/ChartContext';
import type {
  BarOptions,
  CartesianChartProps,
  ChartItemEvent,
  SeriesConfig,
  XAxisOptions,
  YAxisOptions,
  ZoomOptions,
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
  const zoomOpts = resolveOption<ZoomOptions>(props.zoom, false);

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

  // Categorical zoom: a window of whole categories on band axes (bars, category x).
  const banded =
    prepared.type === 'category' ||
    specs.some((s) => s.type === 'bar') ||
    (preset.type === 'bar' && prepared.type === 'time');
  const count = Math.max(n, prepared.labels.length);
  const minCount = Math.max(1, Math.round((zoomOpts?.minSpan ?? 0.01) * count));
  const [rangeProp, setRange] = useControllableState<readonly [number, number] | null>(
    props.categoryRange,
    null,
    props.onCategoryRangeChange,
  );
  const range =
    banded && count > 1 && rangeProp
      ? categoryWindow([rangeProp[0], rangeProp[1] + 1], count, minCount)
      : null;
  const rangeLo = range?.[0];
  const rangeHi = range?.[1];

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
        ...(range ? { range } : {}),
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
    rangeLo,
    rangeHi,
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

  // Zoom & brush: a continuous x domain, or a window of categories (in category units:
  // band i spans [i, i + 1]; fractional zoom steps accumulate between whole categories).
  const fraction = useRef<{
    window: readonly [number, number] | null;
    domain: [number, number];
  } | null>(null);
  const title = (p: number) =>
    adapter.tooltip({ position: p, series: -1, x: 0, y: 0 })?.title ?? '';
  const brushAxis = continuous || banded ? (horizontal ? 'y' : 'x') : null;
  let axes: ZoomAxis[] = [];
  if (continuous && limits) {
    const plotX = frame.plot;
    axes = [
      {
        dim: 'x',
        bounds: limits.bounds,
        minSpan: limits.minSpan,
        domain,
        pixels: [plotX.x, plotX.x + plotX.width],
        set: setXDomain,
      },
    ];
  } else if (banded && count > 1) {
    const [v0, v1] = model.visible;
    const a = model.bandRect(v0);
    const b = model.bandRect(v1);
    axes = [
      {
        dim: horizontal ? 'y' : 'x',
        bounds: [0, count],
        minSpan: minCount,
        // The fractional domain while it still rounds to the shown window.
        get domain(): readonly [number, number] | null {
          const f = fraction.current;
          if (f && f.window?.[0] === range?.[0] && f.window?.[1] === range?.[1]) return f.domain;
          return range ? [range[0], range[1] + 1] : null;
        },
        zoomed: range !== null,
        pixels:
          a && b
            ? horizontal
              ? [a.y, b.y + b.height]
              : [a.x, b.x + b.width]
            : horizontal
              ? [frame.plot.y, frame.plot.y + frame.plot.height]
              : [frame.plot.x, frame.plot.x + frame.plot.width],
        step: 1,
        set: (d) => {
          const w = d ? categoryWindow(d, count, minCount) : null;
          fraction.current = d ? { window: w, domain: d } : null;
          if (w?.[0] !== range?.[0] || w?.[1] !== range?.[1]) setRange(w);
        },
      },
    ];
  }
  const toIndex = (p: number) => (prepared.order ? (prepared.order[p] as number) : p);
  const onBrushRect = (rect: BrushRect) => {
    let start: number;
    let end: number;
    let from: AxisValue;
    let to: AxisValue;
    if (continuous) {
      const xScale = frame.x as LinearScale;
      const lo = xScale.invert(rect.x0);
      const hi = xScale.invert(rect.x1);
      start = nearestIndex(prepared.values, lo);
      end = nearestIndex(prepared.values, hi);
      from = prepared.raw(start) ?? lo;
      to = prepared.raw(end) ?? hi;
    } else {
      start = model.indexAt(horizontal ? rect.y0 : rect.x0);
      end = model.indexAt(horizontal ? rect.y1 : rect.x1);
      from = prepared.raw(start) ?? prepared.labels[start] ?? start;
      to = prepared.raw(end) ?? prepared.labels[end] ?? end;
    }
    props.onBrush?.({ from, to, startIndex: toIndex(start), endIndex: toIndex(end) });
    root.store.setState({ announcement: root.messages.selectedRange(title(start), title(end)) });
    if (zoomOpts && !continuous) {
      fraction.current = null;
      setRange(categoryWindow([start, end + 1], count, minCount));
    }
  };
  const gestures = useZoomGestures({
    root,
    plot: frame.plot,
    axes,
    zoom: zoomOpts,
    brush: props.brush && axes.length ? brushAxis : null,
    onBrush: onBrushRect,
    brushZooms: continuous,
    describe: ([d]) => {
      if (!d) return '';
      if (continuous)
        return root.messages.visibleRange(
          title(nearestIndex(prepared.values, d[0])),
          title(nearestIndex(prepared.values, d[1])),
        );
      const w = categoryWindow(d, count, minCount) ?? [0, count - 1];
      return root.messages.visibleRange(title(w[0]), title(w[1]));
    },
  });

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
      {...(gestures.handlers ? { surfaceHandlers: gestures.handlers } : {})}
      legendForSingle={Boolean(props.legend)}
      {...(props.syncId ? { syncId: props.syncId } : {})}
      {...(props.highlightedSeries !== undefined
        ? { highlightedSeries: props.highlightedSeries }
        : {})}
      controls={gestures.controls}
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

/**
 * Whole-category window `[start, end]` (inclusive positions) for a domain in category units
 * (band i spans [i, i + 1]), clamped and at least `minCount` wide; `null` = every category.
 */
export function categoryWindow(
  domain: readonly [number, number],
  count: number,
  minCount: number,
): [number, number] | null {
  const [a, b] = clampDomain(domain, { bounds: [0, count], minSpan: minCount });
  let start = Math.min(count - 1, Math.max(0, Math.round(a)));
  let end = Math.min(count - 1, Math.max(start, Math.round(b) - 1));
  while (end - start + 1 < minCount && (start > 0 || end < count - 1)) {
    if (end < count - 1) end++;
    else start--;
  }
  return start <= 0 && end >= count - 1 ? null : [start, end];
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
