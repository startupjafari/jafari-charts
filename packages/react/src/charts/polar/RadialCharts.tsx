import {
  buildGaugeModel,
  buildRadialProgressModel,
  formatAuto,
  formatPercent,
  type GaugeBand,
} from '@startupjafari/charts-core';
import { seriesColor } from '@startupjafari/charts-themes';
import { useMemo, type ReactElement, type ReactNode } from 'react';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView } from '../../components/ChartView';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import type { ActiveItem, ChartAdapter, SeriesInfo } from '../../providers/ChartContext';
import { CenterLabel } from './CenterLabel';

export interface ProgressItem {
  label: string;
  value: number;
  /** Target for this ring (default 100). */
  max?: number;
  color?: string;
}

export interface RadialProgressChartProps extends BaseChartProps {
  /** Single ring shortcut. */
  value?: number;
  max?: number;
  label?: string;
  color?: string;
  /** Several concentric rings, outermost first. */
  data?: readonly ProgressItem[];
  /** Ring thickness, px. */
  thickness?: number;
  /** Gap between rings, px. */
  gap?: number;
  /** Full circle or a 270° arc. */
  variant?: 'full' | 'arc';
  /** Centre text: defaults to the first ring's percentage. Pass `null` to hide. */
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
  valueFormatter?: (value: number, max: number) => string;
  tooltip?: boolean | TooltipOptions;
  legend?: boolean;
}

const noop = () => {};

/** Progress towards one or more targets as concentric rings. */
export function RadialProgressChart(props: RadialProgressChartProps): ReactElement {
  const root = useChartRoot(props, { height: 200 });
  const items = useMemo<ProgressItem[]>(
    () =>
      props.data?.length
        ? [...props.data]
        : [
            {
              label: props.label ?? root.messages.value,
              value: props.value ?? 0,
              ...(props.max !== undefined ? { max: props.max } : {}),
              ...(props.color ? { color: props.color } : {}),
            },
          ],
    [props.data, props.value, props.max, props.label, props.color, root.messages.value],
  );
  const colorSignature = items.map((d, i) => d.color ?? seriesColor(i)).join('|');
  const colors = useMemo(() => colorSignature.split('|'), [colorSignature]);
  const fmt = (v: number, max: number) =>
    props.valueFormatter
      ? props.valueFormatter(v, max)
      : formatPercent(max > 0 ? v / max : 0, root.locale, 0);
  const arc = props.variant === 'arc';
  const model = useMemo(
    () =>
      buildRadialProgressModel({
        width: root.width,
        height: root.height,
        values: Float64Array.from(items, (d) => d.value),
        max: Float64Array.from(items, (d) => d.max ?? 100),
        keys: items.map((d, i) => `${d.label}#${i}`),
        colors,
        ...(props.thickness !== undefined ? { thickness: props.thickness } : {}),
        ...(props.gap !== undefined ? { gap: props.gap } : {}),
        ...(arc ? { startAngle: -Math.PI * 0.75, endAngle: Math.PI * 0.75 } : {}),
      }),
    [root.width, root.height, items, colors, props.thickness, props.gap, arc],
  );
  const adapter = useMemo<ChartAdapter>(() => {
    const item = (p: number): ActiveItem | null => {
      if (p < 0 || p >= model.rings.length) return null;
      const a = model.anchor(p);
      return { position: p, series: p, x: a.x, y: a.y };
    };
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip: (a) => {
        const r = model.rings[a.position];
        const d = items[a.position];
        if (!r || !d) return null;
        return {
          title: '',
          rows: [
            {
              key: r.key,
              label: d.label,
              value: `${formatAuto(r.value, root.locale)} / ${formatAuto(r.max, root.locale)} · ${fmt(r.value, r.max)}`,
              color: colors[a.position] as string,
              kind: 'slice',
            },
          ],
        };
      },
      activeMarks: () => [],
      move: (a, key) => {
        const n = model.rings.length;
        const cur = a?.position ?? -1;
        if (key === 'first') return item(0);
        if (key === 'last') return item(n - 1);
        if (key === 'next' || key === 'down') return item(Math.min(n - 1, cur + 1));
        return item(Math.max(0, cur - 1));
      },
      itemAt: item,
      pointCount: model.rings.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, items, root.locale, props.valueFormatter]);
  const series: SeriesInfo[] = items.map((d, i) => ({
    id: `${d.label}#${i}`,
    label: d.label,
    color: colors[i] as string,
    kind: 'slice',
    symbol: 'circle',
    visible: true,
    value: fmt(d.value, d.max ?? 100),
  }));
  const first = items[0];
  const tooltip =
    props.tooltip === undefined
      ? items.length > 1 && {}
      : props.tooltip === true
        ? {}
        : props.tooltip;
  return (
    <ChartView
      root={root}
      base={props}
      kind="Radial progress chart"
      adapter={adapter}
      frame={null}
      plot={{ x: 0, y: 0, width: root.width, height: root.height }}
      series={series}
      toggleSeries={noop}
      empty={props.data ? props.data.length === 0 : props.value === undefined}
      tooltip={tooltip === false ? false : tooltip}
      legend={
        props.legend === true || (props.legend === undefined && items.length > 1)
          ? { interactive: false }
          : false
      }
      table={{
        columns: [root.messages.category, root.messages.value, '%'],
        rows: items.map((d) => [
          d.label,
          formatAuto(d.value, root.locale),
          fmt(d.value, d.max ?? 100),
        ]),
      }}
      clip={false}
      html={
        props.centerValue === null || !first ? null : (
          <CenterLabel
            x={model.cx}
            y={model.cy}
            size={model.innerRadius * 2}
            render={() => ({
              value: props.centerValue ?? fmt(first.value, first.max ?? 100),
              label: props.centerLabel ?? (items.length === 1 ? first.label : undefined),
            })}
          />
        )
      }
    />
  );
}

export interface GaugeChartProps extends BaseChartProps {
  value: number;
  min?: number;
  max?: number;
  /** Coloured ranges, e.g. `[{ to: 50, color: 'var(--jc-negative)' }, { to: 80, color: 'var(--jc-warning)' }, { to: 100, color: 'var(--jc-positive)' }]`. */
  bands?: readonly GaugeBand[];
  variant?: 'semi' | 'arc' | 'full';
  /** Show a needle over the band scale instead of a value arc. */
  needle?: boolean;
  color?: string;
  thickness?: number;
  label?: ReactNode;
  valueFormatter?: (value: number) => string;
  /** Show min/max labels at the arc ends (default true for semi/arc). */
  scaleLabels?: boolean;
}

/** Gauge with threshold bands: semicircle, 270° arc or full ring. */
export function GaugeChart(props: GaugeChartProps): ReactElement {
  const root = useChartRoot(props, { height: 200 });
  const { value, min = 0, max = 100, variant = 'semi', needle = false } = props;
  const fmt = (v: number) =>
    props.valueFormatter ? props.valueFormatter(v) : formatAuto(v, root.locale);
  const model = useMemo(
    () =>
      buildGaugeModel({
        width: root.width,
        height: root.height,
        value,
        min,
        max,
        variant,
        needle,
        ...(props.bands ? { bands: props.bands } : {}),
        ...(props.color ? { color: props.color } : {}),
        ...(props.thickness !== undefined ? { thickness: props.thickness } : {}),
      }),
    [
      root.width,
      root.height,
      value,
      min,
      max,
      variant,
      needle,
      props.bands,
      props.color,
      props.thickness,
    ],
  );
  const showScale = props.scaleLabels ?? variant !== 'full';
  const labels = showScale
    ? (() => {
        const r = (model.radius + model.innerRadius) / 2;
        const at = (a: number) => ({
          x: model.cx + r * Math.sin(a),
          y: model.cy - r * Math.cos(a),
        });
        const s = at(model.startAngle);
        const e = at(model.endAngle);
        return [
          {
            key: 'min',
            x: s.x,
            y: s.y + 16,
            text: fmt(min),
            anchor: 'middle' as const,
            baseline: 'hanging' as const,
            tone: 'secondary' as const,
          },
          {
            key: 'max',
            x: e.x,
            y: e.y + 16,
            text: fmt(max),
            anchor: 'middle' as const,
            baseline: 'hanging' as const,
            tone: 'secondary' as const,
          },
        ];
      })()
    : [];
  const adapter = useMemo<ChartAdapter>(
    () => ({
      marks: model.marks,
      hitTest: (x, y) =>
        model.hitTest(x, y)
          ? { position: 0, series: 0, x: model.cx, y: model.cy - model.radius }
          : null,
      tooltip: () => ({
        title: '',
        rows: [
          {
            key: 'value',
            label:
              model.band?.label ??
              (typeof props.label === 'string' ? props.label : root.messages.value),
            value: fmt(value),
            color: model.color,
            kind: 'slice',
          },
        ],
      }),
      activeMarks: () => [],
      move: () => ({ position: 0, series: 0, x: model.cx, y: model.cy - model.radius }),
      itemAt: () => ({ position: 0, series: 0, x: model.cx, y: model.cy - model.radius }),
      pointCount: 1,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, value, props.label, root.messages, root.locale],
  );
  const semi = variant === 'semi';
  // Keep the value clear of the needle: in the arc's opening (270°) or under the hub (semi).
  const centerY = needle
    ? variant === 'arc'
      ? model.cy + model.innerRadius * 0.62
      : model.cy + (variant === 'semi' ? 26 : model.innerRadius * 0.5)
    : semi
      ? model.cy - model.innerRadius * 0.32
      : model.cy;
  return (
    <ChartView
      root={root}
      base={props}
      kind="Gauge chart"
      adapter={adapter}
      frame={null}
      plot={{ x: 0, y: 0, width: root.width, height: root.height }}
      series={[
        {
          id: 'value',
          label: root.messages.value,
          color: model.color,
          kind: 'slice',
          symbol: 'circle',
          visible: true,
        },
      ]}
      toggleSeries={noop}
      labels={labels}
      empty={!Number.isFinite(value)}
      tooltip={false}
      legend={false}
      table={{
        columns: [root.messages.value, root.messages.minimum, root.messages.maximum],
        rows: [[fmt(value), fmt(min), fmt(max)]],
      }}
      clip={false}
      html={
        <CenterLabel
          x={model.cx}
          y={centerY}
          size={Math.max(model.innerRadius * 2, 80)}
          render={() => ({ value: fmt(value), label: props.label ?? model.band?.label })}
        />
      }
    />
  );
}
