import {
  access,
  buildHeatmapModel,
  detectDimensionType,
  formatAuto,
  formatDate,
  inferDateFormat,
  toLabel,
  toNumber,
  toTime,
  type AxisValue,
  type DimensionKey,
  type DimensionType,
  type NumericKey,
} from '@jafari/charts-core';
import { useMemo, type ReactElement, type ReactNode } from 'react';
import type { DataTable } from '../../components/ChartA11y';
import { ChartAxis } from '../../components/ChartAxis';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView } from '../../components/ChartView';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import type { ActiveItem, ChartAdapter } from '../../providers/ChartContext';
import {
  bucketLabels,
  cellCssColor,
  emptyItem,
  ScaleLegend,
  scaleFormatter,
  scaleSeries,
  useSingleSeriesMessages,
  type ScaleItem,
} from './shared';

export interface HeatmapCellEvent<T> {
  /** First datum of the cell (`null` for an empty cell). */
  datum: T | null;
  /** Index of that datum in `data` (-1 for an empty cell). */
  index: number;
  /** Raw x / y category values. */
  x: AxisValue;
  y: AxisValue;
  /** Category labels as displayed. */
  xLabel: string;
  yLabel: string;
  xIndex: number;
  yIndex: number;
  /** Cell value (duplicates summed); `null` when missing. */
  value: number | null;
}

export interface HeatmapAxisOptions {
  hidden?: boolean;
  /** Longest a tick label may be before it is truncated, px. */
  maxLabelWidth?: number;
  title?: string;
}

export interface HeatmapChartProps<T extends object> extends BaseChartProps {
  data: readonly T[];
  /** Field with the column category (strings, numbers or dates). */
  xKey: DimensionKey<T>;
  /** Field with the row category. */
  yKey: DimensionKey<T>;
  /** Field with the cell value. Several data rows for one cell are summed. */
  valueKey: NumericKey<T>;
  /** Column order (and empty columns). Defaults to first appearance; numbers/dates sort. */
  xCategories?: readonly AxisValue[];
  /** Row order (and empty rows), top → bottom. */
  yCategories?: readonly AxisValue[];
  /** `sequential` (one hue, default) or `diverging` (signed data around `midpoint`). */
  colorScale?: 'sequential' | 'diverging';
  /** Number of colour steps (default 5). */
  buckets?: number;
  /** Explicit ascending step boundaries (n thresholds → n + 1 steps). */
  thresholds?: readonly number[];
  /** Value domain of the colour scale (default: data extent). */
  domain?: readonly [number, number];
  /** Neutral value of the diverging scale (default 0). */
  midpoint?: number;
  /** Sequential hue (default: first series colour). */
  color?: string;
  negativeColor?: string;
  positiveColor?: string;
  /** Concrete colour ramp, low → high (hex/rgb colours are interpolated per step). */
  colors?: readonly string[];
  /** Fill of missing cells (default: the track token). */
  emptyColor?: string;
  /** Value labels inside cells where they fit. */
  labels?: boolean;
  valueFormatter?: (value: number) => string;
  xFormatter?: (value: AxisValue) => string;
  yFormatter?: (value: AxisValue) => string;
  /** Name of the value in tooltips (default "Value"). */
  valueLabel?: string;
  /** Gap between cells, px (default 2). */
  gap?: number;
  cornerRadius?: number;
  xAxis?: boolean | HeatmapAxisOptions;
  yAxis?: boolean | HeatmapAxisOptions;
  tooltip?: boolean | TooltipOptions;
  /** Colour-scale legend. */
  legend?: boolean | Omit<LegendOptions, 'render' | 'interactive'>;
  /** Controlled active datum index. */
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onHover?: (event: HeatmapCellEvent<T> | null) => void;
  onClick?: (event: HeatmapCellEvent<T>) => void;
  children?: ReactNode;
}

interface Categories {
  type: DimensionType;
  labels: string[];
  raw: AxisValue[];
  /** Canonical id → index. */
  index: Map<string, number>;
  id: (value: unknown) => string | null;
}

function canonical(type: DimensionType): (value: unknown) => string | null {
  if (type === 'time')
    return (v) => {
      const t = toTime(v);
      return Number.isFinite(t) ? `t${t}` : null;
    };
  if (type === 'number')
    return (v) => {
      const n = toNumber(v);
      return Number.isFinite(n) ? `n${n}` : null;
    };
  return (v) => (v === null || v === undefined ? null : `s${toLabel(v)}`);
}

function resolveCategories<T>(
  data: readonly T[],
  key: string,
  explicit: readonly AxisValue[] | undefined,
  format: ((value: AxisValue) => string) | undefined,
  locale: string,
): Categories {
  const sample = explicit?.length ? explicit : data;
  const type = detectDimensionType(
    sample as readonly unknown[],
    explicit?.length ? (v: unknown) => v : (d: unknown) => (d as Record<string, unknown>)[key],
  );
  const id = canonical(type);
  const index = new Map<string, number>();
  const raw: AxisValue[] = [];
  const add = (v: unknown) => {
    const k = id(v);
    if (k === null || index.has(k)) return;
    index.set(k, raw.length);
    raw.push(type === 'time' ? new Date(toTime(v)) : (v as AxisValue));
  };
  if (explicit?.length) for (const v of explicit) add(v);
  else {
    data.forEach((d, i) => add(access(d, key as keyof T & string, i)));
    if (type !== 'category') {
      const num = (v: AxisValue) => (type === 'time' ? toTime(v) : toNumber(v));
      raw.sort((a, b) => num(a) - num(b));
      index.clear();
      raw.forEach((v, i) => index.set(id(v) as string, i));
    }
  }
  let labels: string[];
  if (format) labels = raw.map((v) => format(v));
  else if (type === 'time') {
    const times = Float64Array.from(raw, (v) => toTime(v));
    const opts: Intl.DateTimeFormatOptions = { ...inferDateFormat(times) };
    const years = new Set(Array.from(times, (t) => new Date(t).getFullYear()));
    if (years.size <= 1) delete opts.year;
    labels = Array.from(times, (t) => formatDate(t, { locale, ...opts }));
  } else labels = raw.map((v) => toLabel(v));
  return { type, labels, raw, index, id };
}

function axisOpts(v: boolean | HeatmapAxisOptions | undefined): HeatmapAxisOptions | null {
  if (v === false) return null;
  return v === true || v === undefined ? {} : v;
}

/**
 * Heatmap: values over two categorical dimensions, encoded as quantized colour
 * intensity. Every colour step renders as one SVG path, so a 50 × 50 grid costs a
 * handful of DOM elements; hit testing is a band inversion.
 */
export function HeatmapChart<T extends object>(props: HeatmapChartProps<T>): ReactElement {
  const root = useChartRoot(props, { height: 300 });
  const { data, xKey, yKey, valueKey, valueFormatter } = props;
  const locale = root.locale;
  const xCats = useMemo(
    () => resolveCategories(data, xKey, props.xCategories, props.xFormatter, locale),
    [data, xKey, props.xCategories, props.xFormatter, locale],
  );
  const yCats = useMemo(
    () => resolveCategories(data, yKey, props.yCategories, props.yFormatter, locale),
    [data, yKey, props.yCategories, props.yFormatter, locale],
  );
  const nx = xCats.labels.length;
  const ny = yCats.labels.length;

  // Row-major grid; duplicate cells are summed, the first datum is kept for events.
  const grid = useMemo(() => {
    const values = new Float64Array(nx * ny).fill(Number.NaN);
    const source = new Int32Array(nx * ny).fill(-1);
    const cellOf = new Int32Array(data.length).fill(-1);
    data.forEach((d, i) => {
      const xk = xCats.id(access(d, xKey, i));
      const yk = yCats.id(access(d, yKey, i));
      const xi = xk === null ? undefined : xCats.index.get(xk);
      const yi = yk === null ? undefined : yCats.index.get(yk);
      if (xi === undefined || yi === undefined) return;
      const cell = yi * nx + xi;
      cellOf[i] = cell;
      if (source[cell] === -1) source[cell] = i;
      const v = toNumber(access(d, valueKey, i));
      if (!Number.isFinite(v)) return;
      const prev = values[cell] as number;
      values[cell] = Number.isFinite(prev) ? prev + v : v;
    });
    return { values, source, cellOf };
  }, [data, xKey, yKey, valueKey, xCats, yCats, nx, ny]);

  const fmtValue = useMemo(
    () => (v: number) =>
      !Number.isFinite(v) ? '—' : valueFormatter ? valueFormatter(v) : formatAuto(v, locale),
    [valueFormatter, locale],
  );
  const xOpts = axisOpts(props.xAxis);
  const yOpts = axisOpts(props.yAxis);
  const domain = props.domain;
  const domainLo = domain?.[0];
  const domainHi = domain?.[1];
  const thresholdKey = props.thresholds?.join(',') ?? '';
  const rampKey = props.colors?.join(',') ?? '';
  const model = useMemo(
    () =>
      buildHeatmapModel({
        width: root.width,
        height: root.height,
        xLabels: xCats.labels,
        yLabels: yCats.labels,
        values: grid.values,
        colors: {
          scale: props.colorScale ?? 'sequential',
          ...(props.buckets !== undefined ? { buckets: props.buckets } : {}),
          ...(thresholdKey && props.thresholds ? { thresholds: props.thresholds } : {}),
          ...(domain ? { domain } : {}),
          ...(props.midpoint !== undefined ? { midpoint: props.midpoint } : {}),
          ...(props.color ? { color: props.color } : {}),
          ...(props.negativeColor ? { negativeColor: props.negativeColor } : {}),
          ...(props.positiveColor ? { positiveColor: props.positiveColor } : {}),
          ...(rampKey && props.colors ? { colors: props.colors } : {}),
          ...(props.emptyColor ? { emptyColor: props.emptyColor } : {}),
        },
        ...(props.gap !== undefined ? { gap: props.gap } : {}),
        ...(props.cornerRadius !== undefined ? { cornerRadius: props.cornerRadius } : {}),
        labels: props.labels ?? false,
        labelFormat: (v) => fmtValue(v),
        locale,
        padding: { bottom: 0 },
        xAxis: {
          hidden: !xOpts || xOpts.hidden === true,
          ...(xOpts?.maxLabelWidth !== undefined ? { maxLabelWidth: xOpts.maxLabelWidth } : {}),
        },
        yAxis: {
          hidden: !yOpts || yOpts.hidden === true,
          ...(yOpts?.maxLabelWidth !== undefined ? { maxLabelWidth: yOpts.maxLabelWidth } : {}),
        },
      }),
    // Arrays are compared by content so inline props do not re-layout every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      root.width,
      root.height,
      locale,
      xCats,
      yCats,
      grid,
      props.colorScale,
      props.buckets,
      thresholdKey,
      domainLo,
      domainHi,
      props.midpoint,
      props.color,
      props.negativeColor,
      props.positiveColor,
      rampKey,
      props.emptyColor,
      props.gap,
      props.cornerRadius,
      props.labels,
      fmtValue,
      xOpts?.hidden,
      xOpts?.maxLabelWidth,
      yOpts?.hidden,
      yOpts?.maxLabelWidth,
    ],
  );

  const messages = useSingleSeriesMessages(root.messages);
  const valueLabel = props.valueLabel ?? messages.value;
  const cells = nx * ny;

  const adapter = useMemo<ChartAdapter>(() => {
    const item = (cell: number): ActiveItem | null => {
      const r = model.cellRect(cell);
      if (!r) return null;
      return { position: cell, series: 0, x: r.x + r.width / 2, y: r.y + r.height / 2 };
    };
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip: (a) => {
        const cell = a.position;
        if (cell < 0 || cell >= cells) return null;
        const xi = cell % nx;
        const yi = Math.floor(cell / nx);
        const b = model.cellBuckets[cell] as number;
        const step = b >= 0 ? model.scale.buckets[b] : undefined;
        return {
          title: `${yCats.labels[yi] ?? ''} · ${xCats.labels[xi] ?? ''}`,
          rows: [
            {
              key: 'value',
              label: valueLabel,
              value: fmtValue(grid.values[cell] as number),
              color: cellCssColor(step ?? model.scale.empty),
              kind: 'bar',
            },
          ],
        };
      },
      activeMarks: (a) => model.activeMarks(a.position),
      move: (a, key) => {
        if (!cells) return null;
        if (!a) return item(key === 'prev' || key === 'up' || key === 'last' ? cells - 1 : 0);
        const xi = a.position % nx;
        const yi = Math.floor(a.position / nx);
        switch (key) {
          case 'next':
            return item(yi * nx + Math.min(nx - 1, xi + 1));
          case 'prev':
            return item(yi * nx + Math.max(0, xi - 1));
          case 'down':
            return item(Math.min(ny - 1, yi + 1) * nx + xi);
          case 'up':
            return item(Math.max(0, yi - 1) * nx + xi);
          case 'first':
            return item(0);
          case 'last':
            return item(cells - 1);
        }
      },
      itemAt: (p) => item(p),
      pointCount: model.defined,
    };
  }, [model, cells, nx, ny, xCats, yCats, grid, fmtValue, valueLabel]);

  const thresholds = Boolean(thresholdKey);
  const legendItems = useMemo(() => {
    const ranges = bucketLabels(model.scale, valueFormatter, locale, thresholds);
    const items: ScaleItem[] = model.scale.buckets.map((b, i) => ({
      slot: i,
      label: ranges[i] ?? '',
      fill: b.fill,
      ...(b.fillOpacity !== undefined ? { fillOpacity: b.fillOpacity } : {}),
    }));
    const extra: ScaleItem[] =
      model.defined < cells
        ? [emptyItem(model.scale, model.scale.buckets.length, messages.noData)]
        : [];
    return { items, extra };
  }, [model, valueFormatter, locale, thresholds, cells, messages.noData]);
  const series = useMemo(
    () => scaleSeries([...legendItems.items, ...legendItems.extra]),
    [legendItems],
  );

  const table = useMemo<DataTable>(
    () => ({
      columns: [messages.category, ...xCats.labels],
      rows: yCats.labels.map((y, yi) => [
        y,
        ...xCats.labels.map((_, xi) => fmtValue(grid.values[yi * nx + xi] as number)),
      ]),
    }),
    [messages.category, xCats, yCats, grid, nx, fmtValue],
  );

  const event = (a: ActiveItem | null): HeatmapCellEvent<T> | null => {
    if (!a || a.position < 0 || a.position >= cells) return null;
    const cell = a.position;
    const xi = cell % nx;
    const yi = Math.floor(cell / nx);
    const index = grid.source[cell] as number;
    const v = grid.values[cell] as number;
    return {
      datum: index >= 0 ? (data[index] as T) : null,
      index,
      x: xCats.raw[xi] as AxisValue,
      y: yCats.raw[yi] as AxisValue,
      xLabel: xCats.labels[xi] ?? '',
      yLabel: yCats.labels[yi] ?? '',
      xIndex: xi,
      yIndex: yi,
      value: Number.isFinite(v) ? v : null,
    };
  };
  const toPosition = (index: number | null | undefined): number | null => {
    if (index === null || index === undefined) return null;
    const cell = grid.cellOf[index];
    return cell === undefined || cell < 0 ? null : cell;
  };

  const tooltipOpts =
    props.tooltip === false
      ? false
      : props.tooltip === true || props.tooltip === undefined
        ? {}
        : props.tooltip;
  const legendBase =
    props.legend === false
      ? null
      : props.legend === true || props.legend === undefined
        ? {}
        : props.legend;
  const [d0, d1] = model.scale.domain;
  const legendFmt = scaleFormatter(model.scale, valueFormatter, locale);
  const empty = cells === 0 || model.defined === 0;
  const legendOpts: false | LegendOptions =
    legendBase && !empty
      ? {
          ...legendBase,
          render: () => (
            <ScaleLegend
              items={legendItems.items}
              extra={legendItems.extra}
              start={legendFmt(d0)}
              end={legendFmt(d1)}
              {...(legendBase.position ? { position: legendBase.position } : {})}
              {...(legendBase.align ? { align: legendBase.align } : {})}
            />
          ),
        }
      : false;

  const frame = model.frame;

  return (
    <ChartView
      root={{ ...root, messages }}
      base={props}
      kind="Heatmap"
      adapter={adapter}
      frame={frame}
      plot={frame.plot}
      series={series}
      toggleSeries={noop}
      labels={model.labels}
      empty={empty}
      tooltip={tooltipOpts}
      legend={series.length > 1 ? legendOpts : false}
      table={table}
      dimOnActive
      clip={false}
      {...(props.activeIndex !== undefined
        ? { activePosition: toPosition(props.activeIndex) }
        : {})}
      onActiveChange={(a) => {
        const e = event(a);
        props.onHover?.(e);
        props.onActiveIndexChange?.(e && e.index >= 0 ? e.index : null);
      }}
      onItemClick={(a) => {
        const e = event(a);
        if (e) props.onClick?.(e);
      }}
      foreground={
        <>
          {xOpts && !xOpts.hidden ? (
            <ChartAxis position="bottom" {...(xOpts.title ? { title: xOpts.title } : {})} />
          ) : null}
          {yOpts && !yOpts.hidden ? (
            <ChartAxis position="left" {...(yOpts.title ? { title: yOpts.title } : {})} />
          ) : null}
        </>
      }
    >
      {props.children}
    </ChartView>
  );
}

function noop() {}
