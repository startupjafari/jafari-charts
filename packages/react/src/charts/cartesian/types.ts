import type {
  AxisValue,
  CurveType,
  DimensionKey,
  DownsampleMethod,
  NumericKey,
  SymbolShape,
} from '@jafari/charts-core';
import type { ReactNode } from 'react';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import type { BaseChartProps } from '../../internal/useChartRoot';

export interface SeriesConfig<T> {
  /** Field holding this series' values. Type-checked against the datum type. */
  key: NumericKey<T>;
  label?: string;
  /** Any CSS colour. Defaults to the theme's series colour for this slot. */
  color?: string;
  /** Mark type (Combo Chart). */
  type?: 'line' | 'area' | 'bar';
  curve?: CurveType;
  dashed?: boolean;
  /** Value axis (Combo Chart): `right` adds a secondary axis. */
  axis?: 'left' | 'right';
  /** Series with the same id are stacked. */
  stackId?: string;
  dots?: boolean;
  symbol?: SymbolShape;
  /** Formats this series' values in tooltips and labels. */
  format?: (value: number) => string;
  /**
   * Bar series: colour of each bar from its datum (`index` = index in `data`); return
   * `undefined` to keep the series colour. Tooltips show the bar's colour. Ignored for
   * lines and areas and by the Waterfall Chart, which colours its own bars.
   */
  colorBy?: (datum: T, index: number) => string | undefined;
}

/**
 * Options of the category/x dimension. In horizontal bar charts this axis is drawn on the
 * left: `xAxis` always configures the categories and `yAxis` the values, whichever side
 * they are drawn on.
 */
export interface XAxisOptions {
  hidden?: boolean;
  tickCount?: number;
  /** Formats tick labels (numbers, timestamps or category labels). */
  format?: (value: number | string) => string;
  /** Override the detected dimension type. */
  type?: 'number' | 'time' | 'category';
  /** Interpret and label times in UTC. */
  utc?: boolean;
  /** Draw the axis baseline. */
  line?: boolean;
  title?: string;
  /** Category axes: longest a label line may be before it wraps or is truncated, px. */
  maxLabelWidth?: number;
  /**
   * Category axes: long labels wrap at word boundaries onto up to this many lines (default
   * 2 for text categories, 1 for dates and numbers); the last line ends with an ellipsis if
   * the label still does not fit. Left (horizontal) axes wrap when a category is tall
   * enough for the lines; bottom axes wrap instead of skipping labels when the first word of
   * every label fits its category (otherwise labels are thinned). `1` truncates.
   */
  maxLines?: number;
}

/**
 * Options of the value dimension (bottom axis in horizontal bar charts, see `XAxisOptions`).
 */
export interface YAxisOptions {
  hidden?: boolean;
  tickCount?: number;
  format?: (value: number) => string;
  min?: number;
  max?: number;
  /** `true`, `false` or `'auto'` (zero included when close to the data). */
  includeZero?: boolean | 'auto';
  scale?: 'linear' | 'log';
  nice?: boolean;
  title?: string;
  /** Draw the axis baseline. */
  line?: boolean;
  /**
   * Whole-number ticks only, for counts (users, complaints): a tiny domain such as 0–2
   * gets 0, 1, 2 instead of 0, 0.5, 1 …; the domain is rounded out to whole numbers.
   */
  integer?: boolean;
}

export interface GridOptions {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface CrosshairOptions {
  horizontal?: boolean;
}

export interface DownsampleOptions {
  method?: DownsampleMethod;
  /** Target number of points (default: 2 × plot width). */
  threshold?: number;
}

/** Payload of hover and click callbacks. */
export interface ChartItemEvent<T> {
  datum: T;
  /** Index into `data`. */
  index: number;
  /** Series key, or null when the whole category is active (shared tooltip). */
  series: string | null;
  /** Value of `series` (null for shared items or missing values). */
  value: number | null;
  /** Raw x value of the datum. */
  x: AxisValue | null;
}

export interface ZoomOptions {
  /** Wheel zoom: `'ctrl'` requires Ctrl/⌘ (or a trackpad pinch); `true` zooms on any wheel. */
  wheel?: boolean | 'ctrl';
  /**
   * Smallest visible span as a fraction of the full range (default 0.01). Category
   * axes always keep at least one whole category.
   */
  minSpan?: number;
}

export interface CartesianChartProps<T extends object> extends BaseChartProps {
  data: readonly T[];
  /** Field for the x axis (dates, numbers or categories). */
  xKey: DimensionKey<T>;
  /** Single-series shortcut for `series={[{ key: yKey }]}`. */
  yKey?: NumericKey<T>;
  series?: readonly SeriesConfig<T>[];
  /** Colour for the single-series shortcut. */
  color?: string;
  /** Label for the single-series shortcut. */
  label?: string;
  curve?: CurveType;
  /** Category/x dimension, whichever side it is drawn on (left in horizontal bar charts). */
  xAxis?: boolean | XAxisOptions;
  /** Value dimension, whichever side it is drawn on (bottom in horizontal bar charts). */
  yAxis?: boolean | YAxisOptions;
  /** Secondary value axis for series with `axis: 'right'`. */
  y2Axis?: boolean | YAxisOptions;
  grid?: boolean | GridOptions;
  tooltip?: boolean | TooltipOptions;
  legend?: boolean | LegendOptions;
  crosshair?: boolean | CrosshairOptions;
  /** Markers on every point. */
  dots?: boolean;
  /** Distinct marker shapes and dash patterns per series (identity without colour). */
  differentiate?: boolean;
  valueFormatter?: (value: number, series: string) => string;
  /** Formats x values in tooltips and the data table. */
  xFormatter?: (value: AxisValue) => string;
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  /** Controlled active data index (`null` = none). */
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onHover?: (event: ChartItemEvent<T> | null) => void;
  onClick?: (event: ChartItemEvent<T>) => void;
  downsample?: false | DownsampleOptions;
  /**
   * Zoom & pan: Ctrl/⌘ + wheel or pinch, drag to pan, `+` / `-` / `0` and Shift + arrows
   * on the focused chart. Continuous x axes zoom their domain (`xDomain`); category axes
   * (bars, category x) show a window of whole categories (`categoryRange`).
   */
  zoom?: boolean | ZoomOptions;
  /** Controlled visible x domain (timestamps or numbers) of a continuous x axis. */
  xDomain?: readonly [number, number] | null;
  onXDomainChange?: (domain: readonly [number, number] | null) => void;
  /**
   * Controlled category window of a band axis as inclusive positions `[start, end]`
   * (data order; time data in time order); `null` shows every category.
   */
  categoryRange?: readonly [number, number] | null;
  onCategoryRangeChange?: (range: readonly [number, number] | null) => void;
  /**
   * Drag to select an x range or a range of categories. With `zoom`, the selection zooms in
   * (Shift + drag pans a zoomed view).
   */
  brush?: boolean;
  onBrush?: (range: {
    from: AxisValue;
    to: AxisValue;
    startIndex: number;
    endIndex: number;
  }) => void;
  /** Charts with the same `syncId` show the crosshair and tooltip together. */
  syncId?: string;
  /** Controlled emphasis of one series (others fade); `null` clears it. */
  highlightedSeries?: string | null;
  children?: ReactNode;
}

/** Options that only bar-based charts expose. */
export interface BarOptions {
  /** Corner radius of the bar's data end, px. */
  barRadius?: number;
  /** Maximum bar thickness, px. */
  maxBarSize?: number;
  /** Gap between touching bars, px. */
  barGap?: number;
  /** Space between categories as a fraction of the category width (0–1). */
  categoryGap?: number;
  /** Value labels at bar ends. */
  labels?: boolean;
}
