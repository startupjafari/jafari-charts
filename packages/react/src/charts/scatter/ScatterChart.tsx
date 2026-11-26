import {
  buildScatterModel,
  formatAuto,
  labelColumn,
  numericColumn,
  SYMBOL_SHAPES,
  toLabel,
  type Extent,
  type KeysMatching,
  type LinearScale,
  type LogScale,
  type Mark,
  type NumericKey,
  type ScatterGroupSpec,
  type ScatterModel,
  type SymbolShape,
} from '@jafari/charts-core';
import { seriesColor } from '@jafari/charts-themes';
import { useCallback, useMemo, type ReactElement, type ReactNode } from 'react';
import type { DataTable } from '../../components/ChartA11y';
import { ChartAxis } from '../../components/ChartAxis';
import { ChartGrid } from '../../components/ChartGrid';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView } from '../../components/ChartView';
import { useControllableState } from '../../hooks/useControllableState';
import { devWarn } from '../../internal/env';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
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
  TooltipRow,
} from '../../providers/ChartContext';
import type { GridOptions, YAxisOptions, ZoomOptions } from '../cartesian/types';
import { resolveOption, valueAxisSpec } from '../../internal/options';

/** Axis options of a scatter chart (both axes are continuous). */
export interface ScatterChartAxisOptions extends YAxisOptions {
  /** Draw the axis baseline. */
  line?: boolean;
}

/** A y field drawn as its own group of points (wide data: one row, several measures). */
export interface ScatterSeriesConfig<T> {
  /** Field holding this group's y values. */
  key: NumericKey<T>;
  label?: string;
  /** Any CSS colour. Defaults to the theme's series colour for this slot. */
  color?: string;
  symbol?: SymbolShape;
}

/** Payload of hover and click callbacks. */
export interface ScatterPointEvent<T> {
  datum: T;
  /** Index into `data`. */
  index: number;
  /** Group id: the `groupKey` value, the series key, or the y key. */
  series: string;
  x: number;
  y: number;
  /** Size value (bubble charts), null without `sizeKey` or when missing. */
  size: number | null;
}

/** Payload of `onBrush`: the selected rectangle in data values and the points inside it. */
export interface ScatterBrushEvent {
  x: [number, number];
  y: [number, number];
  /** Indices into `data` of the visible points inside the rectangle, ascending. */
  indices: number[];
}

export interface ScatterChartProps<T extends object> extends BaseChartProps {
  data: readonly T[];
  /** Numeric field for the horizontal axis. */
  xKey: NumericKey<T>;
  /** Numeric field for the vertical axis (single group, or split by `groupKey`). */
  yKey?: NumericKey<T>;
  /** Field whose distinct values split the points into groups (long data). */
  groupKey?: KeysMatching<T, string | number | boolean>;
  /** Several y fields, each drawn as a group (wide data). Overrides `yKey`/`groupKey`. */
  series?: readonly ScatterSeriesConfig<T>[];
  /** Numeric field encoded as bubble size; bubble *area* is proportional to the value. */
  sizeKey?: NumericKey<T>;
  /** Field with a CSS colour per point (overrides the group colour). */
  colorKey?: KeysMatching<T, string>;
  /** Field naming each point (tooltip title and data table). */
  labelKey?: KeysMatching<T, string | number>;
  /** Colour of the single group. */
  color?: string;
  /** Colours by group order (overrides the theme palette). */
  colors?: readonly string[];
  /** Name of the single group. */
  label?: string;
  /** Names of the x, y and size fields in tooltips and the data table. */
  xLabel?: string;
  yLabel?: string;
  sizeLabel?: string;
  /** Marker diameter, px (default 8; smaller for thousands of points). */
  pointSize?: number;
  /** Bubble radius range, px. */
  minRadius?: number;
  maxRadius?: number;
  /** Marker fill opacity (default 1, bubbles 0.78). */
  opacity?: number;
  /** Hover target radius around each point's centre, px (default 24; bubbles: their whole area). */
  hitRadius?: number;
  xAxis?: boolean | ScatterChartAxisOptions;
  yAxis?: boolean | ScatterChartAxisOptions;
  grid?: boolean | GridOptions;
  tooltip?: boolean | TooltipOptions;
  legend?: boolean | LegendOptions;
  /** Distinct marker shapes per group (identity without colour). */
  differentiate?: boolean;
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  sizeFormatter?: (value: number) => string;
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  /** Controlled active data index (`null` = none). */
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onHover?: (event: ScatterPointEvent<T> | null) => void;
  onClick?: (event: ScatterPointEvent<T>) => void;
  /**
   * Zoom & pan both axes: Ctrl/⌘ + wheel or pinch around the pointer, drag to pan,
   * `+` / `-` / `0` and Shift + arrows on the focused chart. Points outside are not drawn.
   */
  zoom?: boolean | ZoomOptions;
  /** Controlled visible x domain (`null` = the full range). */
  xDomain?: readonly [number, number] | null;
  onXDomainChange?: (domain: readonly [number, number] | null) => void;
  /** Controlled visible y domain (`null` = the full range). */
  yDomain?: readonly [number, number] | null;
  onYDomainChange?: (domain: readonly [number, number] | null) => void;
  /** Drag a rectangle to select points. With `zoom`, the selection zooms in. */
  brush?: boolean;
  onBrush?: (selection: ScatterBrushEvent) => void;
  /** Reference lines and other primitives (`<ChartReferenceLine x={…} />`). */
  children?: ReactNode;
}

/**
 * Above this many points `renderer="auto"` draws on a canvas. Measured with
 * benchmarks (Chromium, software raster): SVG updates faster up to 50k points
 * (203 vs 242 ms), canvas wins from 100k (482 vs 601 ms) — crossover ≈ 75k.
 */
export const SCATTER_CANVAS_THRESHOLD = 75_000;

interface PreparedGroup {
  id: string;
  label: string;
  color?: string;
  symbol?: SymbolShape;
  indices: Uint32Array;
  xs: Float64Array;
  ys: Float64Array;
  sizes?: Float64Array;
  colors?: (string | undefined)[];
}

function gather(values: Float64Array, idx: Uint32Array): Float64Array {
  const out = new Float64Array(idx.length);
  for (let k = 0; k < idx.length; k++) out[k] = values[idx[k] as number] as number;
  return out;
}

function seriesSignature<T>(series: readonly ScatterSeriesConfig<T>[] | undefined): string {
  return (series ?? [])
    .map((s) => [s.key, s.label, s.color, s.symbol].join('\u0001'))
    .join('\u0002');
}

function usePreparedGroups<T extends object>(props: ScatterChartProps<T>): PreparedGroup[] {
  const { data, xKey, yKey, groupKey, sizeKey, colorKey } = props;
  const signature = seriesSignature(props.series);
  return useMemo(() => {
    const n = data.length;
    const xs = numericColumn(data, xKey);
    const sizes = sizeKey ? numericColumn(data, sizeKey) : undefined;
    const colors = colorKey
      ? data.map((d) => {
          const c = (d as Record<string, unknown>)[colorKey];
          return typeof c === 'string' && c ? c : undefined;
        })
      : undefined;
    const all = Uint32Array.from({ length: n }, (_, i) => i);
    const extras = (idx: Uint32Array | null) => ({
      ...(sizes ? { sizes: idx ? gather(sizes, idx) : sizes } : {}),
      ...(colors ? { colors: idx ? Array.from(idx, (i) => colors[i]) : colors } : {}),
    });
    const configs = props.series;
    if (configs?.length) {
      if (groupKey) devWarn('"groupKey" is ignored when "series" is given.');
      return configs.map((c) => ({
        id: String(c.key),
        label: c.label ?? String(c.key),
        ...(c.color ? { color: c.color } : {}),
        ...(c.symbol ? { symbol: c.symbol } : {}),
        indices: all,
        xs,
        ys: numericColumn(data, c.key),
        ...extras(null),
      }));
    }
    const key = yKey;
    if (!key) {
      devWarn('ScatterChart needs "yKey" or "series".');
      return [];
    }
    const ys = numericColumn(data, key);
    if (!groupKey) {
      return [
        {
          id: String(key),
          label: props.label ?? props.yLabel ?? String(key),
          ...(props.color ? { color: props.color } : {}),
          indices: all,
          xs,
          ys,
          ...extras(null),
        },
      ];
    }
    // Long data: groups in order of first appearance.
    const names = labelColumn(data, groupKey);
    const members = new Map<string, number[]>();
    names.forEach((name, i) => {
      const list = members.get(name);
      if (list) list.push(i);
      else members.set(name, [i]);
    });
    return [...members].map(([name, list]) => {
      const idx = Uint32Array.from(list);
      return {
        id: name,
        label: name === '' ? '—' : name,
        indices: idx,
        xs: gather(xs, idx),
        ys: gather(ys, idx),
        ...extras(idx),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    xKey,
    yKey,
    groupKey,
    sizeKey,
    colorKey,
    signature,
    props.label,
    props.yLabel,
    props.color,
  ]);
}

/**
 * Scatter / bubble chart: numeric x and y, optional groups (legend), bubble size
 * (area ∝ value) and per-point colours. Hover finds the nearest point with a k-d
 * tree; very large data switches to canvas with `renderer="auto"`.
 */
export function ScatterChart<T extends object>(props: ScatterChartProps<T>): ReactElement {
  const root = useChartRoot(props, { height: 300 });
  const xOpts = resolveOption<ScatterChartAxisOptions>(props.xAxis, true);
  const yOpts = resolveOption<ScatterChartAxisOptions>(props.yAxis, true);
  const gridOpts = resolveOption<GridOptions>(props.grid, true);
  const tooltipOpts = resolveOption<TooltipOptions>(props.tooltip, true);
  const legendOpts = resolveOption<LegendOptions>(props.legend, true);
  const zoomOpts = resolveOption<ZoomOptions>(props.zoom, false);
  const prepared = usePreparedGroups(props);
  const [xDomain, setXDomain] = useControllableState<readonly [number, number] | null>(
    props.xDomain,
    null,
    props.onXDomainChange,
  );
  const [yDomain, setYDomain] = useControllableState<readonly [number, number] | null>(
    props.yDomain,
    null,
    props.onYDomainChange,
  );

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

  const colorsSignature = (props.colors ?? []).join('|');
  const groups = useMemo<ScatterGroupSpec[]>(
    () =>
      prepared.map((g, i) => ({
        id: g.id,
        label: g.label,
        color: g.color ?? props.colors?.[i] ?? seriesColor(i),
        shape:
          g.symbol ??
          (props.differentiate
            ? (SYMBOL_SHAPES[i % SYMBOL_SHAPES.length] as SymbolShape)
            : 'circle'),
        xs: g.xs,
        ys: g.ys,
        indices: g.indices,
        visible: !hidden.has(g.id),
        ...(g.sizes ? { sizes: g.sizes } : {}),
        ...(g.colors ? { colors: g.colors } : {}),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prepared, hidden, props.differentiate, colorsSignature],
  );

  const xName = xOpts?.title ?? props.xLabel ?? String(props.xKey);
  const yName =
    yOpts?.title ?? props.yLabel ?? (props.yKey ? String(props.yKey) : root.messages.value);
  const sizeName = props.sizeLabel ?? (props.sizeKey ? String(props.sizeKey) : '');
  const xTitle = xOpts?.title ?? props.xLabel;
  const yTitle = yOpts?.title ?? props.yLabel;

  const xDeps = JSON.stringify(xOpts);
  const yDeps = JSON.stringify(yOpts);
  const [xLo, xHi] = xDomain ?? [];
  const [yLo, yHi] = yDomain ?? [];
  const model = useMemo<ScatterModel>(
    () =>
      buildScatterModel({
        width: root.width,
        height: root.height,
        groups,
        x: { ...valueAxisSpec(xOpts), ...(xDomain ? { domain: xDomain } : {}) },
        y: { ...valueAxisSpec(yOpts), ...(yDomain ? { domain: yDomain } : {}) },
        ...(props.pointSize !== undefined ? { pointSize: props.pointSize } : {}),
        ...(props.minRadius !== undefined ? { minRadius: props.minRadius } : {}),
        ...(props.maxRadius !== undefined ? { maxRadius: props.maxRadius } : {}),
        ...(props.opacity !== undefined ? { opacity: props.opacity } : {}),
        ...(props.hitRadius !== undefined ? { hitRadius: props.hitRadius } : {}),
        // Room above the plot for the y axis title.
        ...(yTitle && yOpts && !yOpts.hidden ? { padding: { top: 22 } } : {}),
        locale: root.locale,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      root.width,
      root.height,
      root.locale,
      groups,
      xDeps,
      yDeps,
      xLo,
      xHi,
      yLo,
      yHi,
      yTitle,
      props.pointSize,
      props.minRadius,
      props.maxRadius,
      props.opacity,
      props.hitRadius,
    ],
  );

  const { data, xFormatter, yFormatter, sizeFormatter, labelKey } = props;
  const fmtX = useCallback(
    (v: number) => (xFormatter ?? xOpts?.format ?? ((n: number) => formatAuto(n, root.locale)))(v),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xFormatter, root.locale, xDeps],
  );
  const fmtY = useCallback(
    (v: number) => (yFormatter ?? yOpts?.format ?? ((n: number) => formatAuto(n, root.locale)))(v),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [yFormatter, root.locale, yDeps],
  );
  const fmtSize = useCallback(
    (v: number) => (sizeFormatter ? sizeFormatter(v) : formatAuto(v, root.locale)),
    [sizeFormatter, root.locale],
  );
  const named = Boolean(props.series?.length || props.groupKey);
  const nameOf = useCallback(
    (index: number): string | null => {
      if (!labelKey) return null;
      const v = (data[index] as Record<string, unknown> | undefined)?.[labelKey];
      return v === undefined || v === null ? null : toLabel(v);
    },
    [data, labelKey],
  );

  const adapter = useMemo<ChartAdapter>(() => {
    const item = (flat: number): ActiveItem | null => {
      const p = model.point(flat);
      return p ? { position: p.index, series: p.group, x: p.x, y: p.y } : null;
    };
    const flatOf = (a: ActiveItem | null): number => {
      if (!a) return -1;
      if (a.series >= 0) return model.find(a.series, a.position);
      for (let g = 0; g < groups.length; g++) {
        const f = model.find(g, a.position);
        if (f >= 0) return f;
      }
      return -1;
    };
    const tooltip = (a: ActiveItem): TooltipData | null => {
      const p = model.point(flatOf(a));
      if (!p) return null;
      const g = groups[p.group] as ScatterGroupSpec;
      const name = nameOf(p.index);
      const title = name
        ? named
          ? `${name} · ${g.label}`
          : name
        : named || groups.length > 1
          ? g.label
          : '';
      const swatch = { kind: 'point' as const, symbol: g.shape ?? 'circle' };
      const rows: TooltipRow[] = [
        { key: 'x', label: xName, value: fmtX(p.xValue), color: p.color, ...swatch },
        {
          key: 'y',
          label: props.series?.length ? g.label : yName,
          value: fmtY(p.yValue),
          color: 'transparent',
          kind: 'point',
        },
      ];
      if (model.bubble)
        rows.push({
          key: 'size',
          label: sizeName,
          value: Number.isFinite(p.size) ? fmtSize(p.size) : '—',
          color: 'transparent',
          kind: 'point',
        });
      return { title, rows };
    };
    const activeMarks = (a: ActiveItem): Mark[] => {
      const p = model.point(flatOf(a));
      if (!p) return [];
      const g = groups[p.group] as ScatterGroupSpec;
      return [
        {
          type: 'symbol',
          key: `active|${g.id}|${p.index}`,
          xs: Float64Array.of(p.x),
          ys: Float64Array.of(p.y),
          size: model.bubble ? p.radius * 2 + 2 : Math.max(12, p.radius * 2 + 4),
          shape: g.shape ?? 'circle',
          fill: p.color,
          stroke: 'var(--jc-bg)',
          strokeWidth: 4,
        },
      ];
    };
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip,
      activeMarks,
      move: (a, key) => item(model.step(flatOf(a), key)),
      itemAt: (position, series = -1) => item(flatOf({ position, series, x: 0, y: 0 })),
      pointCount: model.count,
    };
  }, [model, groups, nameOf, named, xName, yName, sizeName, fmtX, fmtY, fmtSize, props.series]);

  const info = useMemo<SeriesInfo[]>(
    () =>
      groups.map((g) => ({
        id: g.id,
        label: g.label,
        color: g.color,
        kind: 'point',
        symbol: g.shape ?? 'circle',
        visible: g.visible !== false,
      })),
    [groups],
  );

  const tableLimit = typeof props.accessibilityTable === 'number' ? props.accessibilityTable : 60;
  const table = useMemo<DataTable | undefined>(() => {
    if (
      props.accessibilityTable === false ||
      (model.count > tableLimit && props.accessibilityTable !== true)
    )
      return undefined;
    const first = labelKey ? String(labelKey) : named ? root.messages.series : '#';
    const columns = [first, xName, yName, ...(model.bubble ? [sizeName] : [])];
    const rows: string[][] = [];
    for (let f = 0; f < model.count; f++) {
      const p = model.point(f);
      if (!p) continue;
      const g = groups[p.group] as ScatterGroupSpec;
      const name = nameOf(p.index);
      rows.push([
        name ?? (named ? g.label : String(p.index + 1)),
        fmtX(p.xValue),
        fmtY(p.yValue),
        ...(model.bubble ? [Number.isFinite(p.size) ? fmtSize(p.size) : '—'] : []),
      ]);
    }
    return { columns, rows };
  }, [
    model,
    groups,
    labelKey,
    named,
    nameOf,
    xName,
    yName,
    sizeName,
    fmtX,
    fmtY,
    fmtSize,
    tableLimit,
    props.accessibilityTable,
    root.messages.series,
  ]);

  const event = (a: ActiveItem | null): ScatterPointEvent<T> | null => {
    if (!a) return null;
    const flat = a.series >= 0 ? model.find(a.series, a.position) : -1;
    const p = model.point(flat);
    if (!p) return null;
    return {
      datum: data[p.index] as T,
      index: p.index,
      series: (groups[p.group] as ScatterGroupSpec).id,
      x: p.xValue,
      y: p.yValue,
      size: Number.isFinite(p.size) ? p.size : null,
    };
  };

  // Empty: no drawable point in any group (hidden groups still count as data).
  const empty = useMemo(
    () =>
      !prepared.some((g) => {
        for (let i = 0; i < g.xs.length; i++)
          if (Number.isFinite(g.xs[i] as number) && Number.isFinite(g.ys[i] as number)) return true;
        return false;
      }),
    [prepared],
  );
  const frame = model.frame;
  const plot = frame.plot;

  // Zoom & brush on both axes (log axes zoom in decades).
  const xLog = xOpts?.scale === 'log';
  const yLog = yOpts?.scale === 'log';
  const xScale = frame.x as LinearScale | LogScale;
  const yScale = frame.y as LinearScale | LogScale;
  const minFraction = zoomOpts?.minSpan ?? 0.01;
  const spanOf = (d: Extent, log: boolean) =>
    log ? Math.log10(d[1]) - Math.log10(d[0]) : d[1] - d[0];
  const axes: ZoomAxis[] = empty
    ? []
    : [
        {
          dim: 'x',
          bounds: model.bounds.x,
          minSpan: spanOf(model.bounds.x, xLog) * minFraction,
          domain: xDomain ? xScale.domain : null,
          pixels: [plot.x, plot.x + plot.width],
          log: xLog,
          set: setXDomain,
        },
        {
          dim: 'y',
          bounds: model.bounds.y,
          minSpan: spanOf(model.bounds.y, yLog) * minFraction,
          domain: yDomain ? yScale.domain : null,
          pixels: [plot.y + plot.height, plot.y],
          log: yLog,
          set: setYDomain,
        },
      ];
  /** "x 1 – 2; y 3 – 4" through a range message (visible / selected). */
  const ranges = (message: (from: string, to: string) => string, x: Extent, y: Extent) =>
    message(`${xName} ${fmtX(x[0])}`, `${fmtX(x[1])}; ${yName} ${fmtY(y[0])} – ${fmtY(y[1])}`);
  const onBrushRect = (rect: BrushRect) => {
    const x: [number, number] = [xScale.invert(rect.x0), xScale.invert(rect.x1)];
    const y: [number, number] = [yScale.invert(rect.y1), yScale.invert(rect.y0)];
    const indices = [
      ...new Set(
        model.inRect(rect.x0, rect.y0, rect.x1, rect.y1).map((f) => model.point(f)?.index ?? -1),
      ),
    ]
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    props.onBrush?.({ x, y, indices });
    root.store.setState({ announcement: ranges(root.messages.selectedRange, x, y) });
  };
  const gestures = useZoomGestures({
    root,
    plot,
    axes,
    zoom: zoomOpts,
    brush: props.brush && axes.length ? 'xy' : null,
    onBrush: onBrushRect,
    describe: ([x, y]) =>
      x && y ? ranges(root.messages.visibleRange, [x[0], x[1]], [y[0], y[1]]) : '',
  });

  return (
    <ChartView
      root={root}
      base={props}
      kind={props.sizeKey ? 'Bubble chart' : 'Scatter chart'}
      adapter={adapter}
      frame={frame}
      plot={plot}
      series={info}
      toggleSeries={toggleSeries}
      labels={model.labels}
      empty={empty}
      tooltip={tooltipOpts ?? false}
      legend={legendOpts && (groups.length > 1 || props.legend) ? legendOpts : false}
      {...(table ? { table } : {})}
      canvasThreshold={SCATTER_CANVAS_THRESHOLD}
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
      {...(gestures.handlers ? { surfaceHandlers: gestures.handlers } : {})}
      controls={gestures.controls}
      overlay={<BrushOverlay plot={plot} />}
      background={
        <>
          {gridOpts ? (
            <ChartGrid
              horizontal={gridOpts.horizontal ?? true}
              vertical={gridOpts.vertical ?? true}
              zeroLine={model.zero.y}
            />
          ) : model.zero.y !== null ? (
            <ChartGrid horizontal={false} vertical={false} zeroLine={model.zero.y} />
          ) : null}
          {model.zero.x !== null ? (
            <line
              className="jc-axis-line"
              aria-hidden="true"
              x1={Math.round(model.zero.x) + 0.5}
              x2={Math.round(model.zero.x) + 0.5}
              y1={plot.y}
              y2={plot.y + plot.height}
            />
          ) : null}
        </>
      }
      foreground={
        <>
          {xOpts && !xOpts.hidden ? (
            <ChartAxis
              position="bottom"
              line={xOpts.line ?? false}
              {...(xTitle ? { title: xTitle } : {})}
            />
          ) : null}
          {yOpts && !yOpts.hidden ? (
            <ChartAxis
              position="left"
              line={yOpts.line ?? false}
              {...(yTitle ? { title: yTitle } : {})}
            />
          ) : null}
        </>
      }
    >
      {props.children}
    </ChartView>
  );
}
