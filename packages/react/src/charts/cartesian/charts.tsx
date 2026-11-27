import {
  computeWaterfall,
  numericColumn,
  type StackOffset,
  type WaterfallKind,
} from '@startupjafari/charts-core';
import { cssVar } from '@startupjafari/charts-themes';
import { useMemo, type ReactElement } from 'react';
import { CartesianChart, connectorMarks, type CartesianPreset } from './CartesianChart';
import type { BarOptions, CartesianChartProps } from './types';

const LINE: CartesianPreset = { kind: 'Line chart', type: 'line' };

/**
 * Line chart: one or more series over time, numbers or categories. Smooth
 * monotone curves by default (never overshoot the data); gaps for missing values.
 *
 * ```tsx
 * <LineChart data={analytics} xKey="date" series={[{ key: 'students' }, { key: 'teachers' }]} />
 * ```
 */
export function LineChart<T extends object>(props: CartesianChartProps<T>): ReactElement {
  return <CartesianChart {...props} preset={LINE} />;
}

export interface AreaChartProps<T extends object> extends CartesianChartProps<T> {
  /** Gradient fill fading towards the baseline (default true). */
  gradient?: boolean;
}

const AREA: CartesianPreset = { kind: 'Area chart', type: 'area' };
const AREA_SOLID: CartesianPreset = { ...AREA, areaFill: 'solid' };

/** Area chart with a light gradient fill; supports negative values. */
export function AreaChart<T extends object>({
  gradient = true,
  ...props
}: AreaChartProps<T>): ReactElement {
  return <CartesianChart {...props} preset={gradient ? AREA : AREA_SOLID} />;
}

export interface StackedAreaChartProps<T extends object> extends AreaChartProps<T> {
  /** `absolute` stacks values; `percent` normalises each x to 100%. */
  mode?: 'absolute' | 'percent';
}

const STACKED_AREA: CartesianPreset = {
  kind: 'Stacked area chart',
  type: 'area',
  stack: true,
  stackOffset: 'zero',
};
const STACKED_AREA_PCT: CartesianPreset = {
  ...STACKED_AREA,
  kind: 'Percent stacked area chart',
  stackOffset: 'expand',
};

/** Stacked areas in absolute or percent mode. */
export function StackedAreaChart<T extends object>({
  mode = 'absolute',
  gradient = true,
  ...props
}: StackedAreaChartProps<T>): ReactElement {
  const preset = mode === 'percent' ? STACKED_AREA_PCT : STACKED_AREA;
  return (
    <CartesianChart {...props} preset={gradient ? preset : { ...preset, areaFill: 'solid' }} />
  );
}

export interface BarChartProps<T extends object> extends CartesianChartProps<T>, BarOptions {
  /** `horizontal` draws categories on the y axis. */
  layout?: 'vertical' | 'horizontal';
  /** Stack series: `true`/`'absolute'` or `'percent'`. */
  stacked?: boolean | 'absolute' | 'percent';
}

const presets = new Map<string, CartesianPreset>();
function barPreset(
  layout: 'vertical' | 'horizontal',
  stacked: BarChartProps<object>['stacked'],
  kind: string,
): CartesianPreset {
  const key = `${layout}:${String(stacked)}:${kind}`;
  let p = presets.get(key);
  if (!p) {
    const offset: StackOffset = stacked === 'percent' ? 'expand' : 'diverging';
    p = {
      kind,
      type: 'bar',
      orientation: layout,
      ...(stacked ? { stack: true, stackOffset: offset } : {}),
      ...(layout === 'horizontal' ? { labels: true } : {}),
    };
    presets.set(key, p);
  }
  return p;
}

/** Vertical bars with rounded data ends; negative values grow downwards. */
export function BarChart<T extends object>({
  layout = 'vertical',
  stacked = false,
  ...props
}: BarChartProps<T>): ReactElement {
  return (
    <CartesianChart
      {...props}
      preset={barPreset(layout, stacked, stacked ? 'Stacked bar chart' : 'Bar chart')}
    />
  );
}

/** Horizontal bars for rankings and comparisons, with value labels by default. */
export function HorizontalBarChart<T extends object>(
  props: Omit<BarChartProps<T>, 'layout'>,
): ReactElement {
  const { stacked = false, ...rest } = props;
  const height = props.height ?? Math.max(160, Math.min(560, props.data.length * 32 + 40));
  return (
    <CartesianChart
      {...rest}
      height={height}
      preset={barPreset('horizontal', stacked, 'Horizontal bar chart')}
    />
  );
}

/** Several series side by side within each category. */
export function GroupedBarChart<T extends object>(
  props: Omit<BarChartProps<T>, 'stacked'>,
): ReactElement {
  const { layout = 'vertical', ...rest } = props;
  return <CartesianChart {...rest} preset={barPreset(layout, false, 'Grouped bar chart')} />;
}

export interface StackedBarChartProps<T extends object> extends Omit<BarChartProps<T>, 'stacked'> {
  /** `absolute` stacks values (negatives below zero); `percent` normalises each category to 100%. */
  mode?: 'absolute' | 'percent';
}

/** Cumulative bars; mixed-sign values stack away from zero in both directions. */
export function StackedBarChart<T extends object>({
  mode = 'absolute',
  layout = 'vertical',
  ...props
}: StackedBarChartProps<T>): ReactElement {
  return (
    <CartesianChart
      {...props}
      preset={barPreset(
        layout,
        mode === 'percent' ? 'percent' : true,
        mode === 'percent' ? 'Percent stacked bar chart' : 'Stacked bar chart',
      )}
    />
  );
}

/** Lines, areas and bars on one plot; series with `axis: 'right'` use a secondary axis. */
export function ComboChart<T extends object>(
  props: CartesianChartProps<T> & BarOptions,
): ReactElement {
  return <CartesianChart {...props} preset={COMBO} />;
}
const COMBO: CartesianPreset = { kind: 'Combo chart', type: 'bar' };

export interface SparklineProps<T extends object> extends Omit<
  CartesianChartProps<T>,
  'xAxis' | 'yAxis' | 'grid' | 'legend'
> {
  variant?: 'line' | 'area' | 'bar';
}

const SPARK: Record<'line' | 'area' | 'bar', CartesianPreset> = {
  line: { kind: 'Sparkline', type: 'line', minimal: true, defaultHeight: 40 },
  area: { kind: 'Sparkline', type: 'area', minimal: true, defaultHeight: 40 },
  bar: { kind: 'Sparkline', type: 'bar', minimal: true, defaultHeight: 40 },
};

/**
 * Minimal trend line for KPI cards: no axes, grid or legend, no data table
 * (pass `title` for an accessible name). Tooltip and animation are off by default.
 */
export function Sparkline<T extends object>({
  variant = 'line',
  ...props
}: SparklineProps<T>): ReactElement {
  return (
    <CartesianChart
      tooltip={false}
      crosshair={false}
      animation={false}
      accessibilityTable={false}
      {...props}
      xAxis={false}
      yAxis={{ hidden: true, includeZero: variant === 'line' ? 'auto' : true }}
      grid={false}
      legend={false}
      preset={SPARK[variant]}
    />
  );
}

export interface WaterfallChartProps<T extends object>
  extends Omit<CartesianChartProps<T>, 'series'>, BarOptions {
  /** Marks a datum as an intermediate or final total (its value is ignored). */
  isTotal?: (datum: T, index: number) => boolean;
  /** Treat the first datum as the starting value (default true). */
  firstIsStart?: boolean;
  /** Dotted connectors between consecutive bars (default true). */
  connectors?: boolean;
  /** Colours for increases, decreases and totals. */
  colors?: { increase?: string; decrease?: string; total?: string };
}

/** Starting value, positive/negative changes and (sub)totals as floating bars. */
export function WaterfallChart<T extends object>(props: WaterfallChartProps<T>): ReactElement {
  const { isTotal, firstIsStart = true, connectors = true, colors, data, yKey, ...rest } = props;
  const key = (yKey ??
    (Object.keys(data[0] ?? {}).find(
      (k) => k !== props.xKey && typeof (data[0] as Record<string, unknown>)[k] === 'number',
    ) as never)) as never;
  const increase = colors?.increase ?? cssVar('positive');
  const decrease = colors?.decrease ?? cssVar('negative');
  const total = colors?.total ?? 'var(--jc-series-1)';
  const preset = useMemo<CartesianPreset>(() => {
    const values = numericColumn(data, key);
    const kinds: WaterfallKind[] = data.map((d, i) =>
      isTotal?.(d, i) ? 'total' : i === 0 && firstIsStart ? 'start' : 'delta',
    );
    const w = computeWaterfall(values, kinds);
    return {
      kind: 'Waterfall chart',
      type: 'bar',
      base: w.base,
      values: w.top,
      display: w.display,
      colors: Array.from(w.direction, (d, i) =>
        kinds[i] === 'delta' ? (d < 0 ? decrease : increase) : total,
      ),
      labels: true,
      ...(connectors ? { extraMarks: (model) => connectorMarks(model) } : {}),
    };
  }, [data, key, isTotal, firstIsStart, connectors, increase, decrease, total]);
  return (
    <CartesianChart
      {...rest}
      data={data}
      yKey={key}
      legend={props.legend ?? false}
      preset={preset}
    />
  );
}
