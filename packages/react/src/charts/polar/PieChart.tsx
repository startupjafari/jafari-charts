import {
  buildPieModel,
  formatAuto,
  formatPercent,
  labelColumn,
  numericColumn,
  type KeysMatching,
  type NumericKey,
} from '@startupjafari/charts-core';
import { seriesColor } from '@startupjafari/charts-themes';
import { useCallback, useMemo, type ReactElement, type ReactNode } from 'react';
import type { DataTable } from '../../components/ChartA11y';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView } from '../../components/ChartView';
import { useControllableState } from '../../hooks/useControllableState';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import type { ActiveItem, ChartAdapter, SeriesInfo } from '../../providers/ChartContext';
import { CenterLabel } from './CenterLabel';

export interface SliceEvent<T> {
  datum: T;
  index: number;
  label: string;
  value: number;
  /** Share of the visible total (0–1). */
  share: number;
}

export interface PieChartProps<T extends object> extends BaseChartProps {
  data: readonly T[];
  /** Field naming each slice. */
  labelKey: KeysMatching<T, string | number>;
  /** Field holding each slice's value. */
  valueKey: NumericKey<T>;
  /** Field with a CSS colour per slice. */
  colorKey?: KeysMatching<T, string>;
  /** Colours by slice position (overrides the theme palette). */
  colors?: readonly string[];
  /** Largest slice first. */
  sort?: boolean;
  /** Slice labels: `inside` (percent, when they fit), `outside` (leader lines), `false`. */
  labels?: boolean | 'inside' | 'outside';
  valueFormatter?: (value: number) => string;
  labelFormatter?: (value: number, share: number) => string;
  tooltip?: boolean | TooltipOptions;
  legend?: boolean | LegendOptions;
  /** Gap between slices, px (default 2). */
  gap?: number;
  cornerRadius?: number;
  /** Start and end angles in degrees, clockwise from 12 o'clock. */
  startAngle?: number;
  endAngle?: number;
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onHover?: (event: SliceEvent<T> | null) => void;
  onClick?: (event: SliceEvent<T>) => void;
}

export interface DonutChartProps<T extends object> extends PieChartProps<T> {
  /** Ring thickness as a fraction of the radius (default 0.32). */
  thickness?: number;
  /** Centre content; defaults to the total, or the hovered slice. Pass `null` to hide. */
  centerValue?: ReactNode | ((active: SliceEvent<T> | null) => ReactNode);
  centerLabel?: ReactNode | ((active: SliceEvent<T> | null) => ReactNode);
}

const RAD = Math.PI / 180;

/** Percentages for legends and labels: shares that round to zero read "<1%". */
function sharePercent(share: number, locale: string): string {
  return share > 0 && Math.round(share * 100) === 0
    ? `<${formatPercent(0.01, locale, 0)}`
    : formatPercent(share, locale, 0);
}

function PolarPie<T extends object>(
  props: DonutChartProps<T> & { kind: string; inner: number; donut: boolean },
) {
  const root = useChartRoot(props, { height: 260 });
  const { data, labelKey, valueKey, colorKey, valueFormatter, labelFormatter } = props;
  const labels = useMemo(() => labelColumn(data, labelKey), [data, labelKey]);
  const values = useMemo(() => numericColumn(data, valueKey), [data, valueKey]);
  // Duplicate labels still need distinct keys.
  const keys = useMemo(() => {
    const seen = new Map<string, number>();
    return labels.map((l) => {
      const n = seen.get(l) ?? 0;
      seen.set(l, n + 1);
      return n ? `${l}#${n}` : l;
    });
  }, [labels]);
  const colors = useMemo(
    () =>
      data.map((d, i) => {
        const own = colorKey ? (d as Record<string, unknown>)[colorKey] : undefined;
        return typeof own === 'string' ? own : (props.colors?.[i] ?? seriesColor(i));
      }),
    [data, colorKey, props.colors],
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

  const labelMode =
    props.labels === true
      ? 'inside'
      : props.labels === false || props.labels === undefined
        ? props.donut
          ? 'none'
          : 'inside'
        : props.labels;
  const fmtValue = useCallback(
    (v: number) => (valueFormatter ? valueFormatter(v) : formatAuto(v, root.locale)),
    [valueFormatter, root.locale],
  );
  const model = useMemo(
    () =>
      buildPieModel({
        width: root.width,
        height: root.height,
        values,
        keys,
        colors,
        hidden,
        innerRadius: props.inner,
        ...(props.gap !== undefined ? { gap: props.gap } : {}),
        ...(props.cornerRadius !== undefined ? { cornerRadius: props.cornerRadius } : {}),
        ...(props.startAngle !== undefined ? { startAngle: props.startAngle * RAD } : {}),
        ...(props.endAngle !== undefined ? { endAngle: props.endAngle * RAD } : {}),
        sort: props.sort ?? false,
        labels: labelMode,
        labelFormat: (v, share, i) =>
          labelFormatter
            ? labelFormatter(v, share)
            : labelMode === 'outside'
              ? `${labels[i] ?? ''} · ${sharePercent(share, root.locale)}`
              : sharePercent(share, root.locale),
      }),
    [
      root.width,
      root.height,
      root.locale,
      values,
      keys,
      colors,
      hidden,
      props.inner,
      props.gap,
      props.cornerRadius,
      props.startAngle,
      props.endAngle,
      props.sort,
      labelMode,
      labelFormatter,
      labels,
    ],
  );

  const sliceOf = (index: number) => model.slices.findIndex((s) => s.index === index);
  const event = (a: ActiveItem | null): SliceEvent<T> | null => {
    if (!a) return null;
    const s = model.slices[a.position];
    if (!s) return null;
    return {
      datum: data[s.index] as T,
      index: s.index,
      label: labels[s.index] ?? '',
      value: s.value,
      share: s.share,
    };
  };

  const adapter = useMemo<ChartAdapter>(() => {
    const item = (p: number): ActiveItem | null => {
      if (p < 0 || p >= model.slices.length) return null;
      const a = model.anchor(p);
      return { position: p, series: model.slices[p]?.index ?? -1, x: a.x, y: a.y };
    };
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip: (a) => {
        const s = model.slices[a.position];
        if (!s) return null;
        return {
          title: '',
          rows: [
            {
              key: keys[s.index] as string,
              label: labels[s.index] ?? '',
              value: `${fmtValue(s.value)} · ${formatPercent(s.share, root.locale)}`,
              color: colors[s.index] as string,
              kind: 'slice',
            },
          ],
        };
      },
      activeMarks: (a) => {
        const m = model.activeMark(a.position, props.donut ? 3 : 6);
        return m ? [m] : [];
      },
      move: (a, key) => {
        const n = model.slices.length;
        if (!n) return null;
        const cur = a?.position ?? -1;
        if (key === 'first') return item(0);
        if (key === 'last') return item(n - 1);
        if (key === 'next' || key === 'down') return item(cur < 0 ? 0 : (cur + 1) % n);
        return item(cur < 0 ? n - 1 : (cur - 1 + n) % n);
      },
      itemAt: (p) => item(p),
      pointCount: model.slices.length,
    };
  }, [model, keys, labels, colors, fmtValue, root.locale, props.donut]);

  const series = useMemo<SeriesInfo[]>(
    () =>
      keys.map((k, i) => {
        const s = model.slices.find((x) => x.index === i);
        return {
          id: k,
          label: labels[i] ?? '',
          color: colors[i] as string,
          kind: 'slice',
          symbol: 'circle',
          visible: !hidden.has(k),
          ...(s ? { value: sharePercent(s.share, root.locale) } : {}),
        };
      }),
    [keys, labels, colors, hidden, model, root.locale],
  );

  const table = useMemo<DataTable>(
    () => ({
      columns: [root.messages.category, root.messages.value, '%'],
      rows: model.slices.map((s) => [
        labels[s.index] ?? '',
        fmtValue(s.value),
        formatPercent(s.share, root.locale),
      ]),
    }),
    [model, labels, fmtValue, root.messages, root.locale],
  );

  const tooltipOpts =
    props.tooltip === false
      ? false
      : props.tooltip === true || props.tooltip === undefined
        ? props.donut && props.tooltip === undefined
          ? false
          : {}
        : props.tooltip;
  const legendOpts =
    props.legend === false
      ? false
      : props.legend === true || props.legend === undefined
        ? {}
        : props.legend;
  const toPosition = (index: number | null | undefined) =>
    index === null || index === undefined ? null : sliceOf(index);

  const center =
    props.donut && props.centerValue !== null && model.innerRadius > 0 ? (
      <CenterLabel
        x={model.cx}
        y={model.cy}
        size={model.innerRadius * 2}
        render={(a) => {
          const e = event(a);
          const v =
            typeof props.centerValue === 'function' ? props.centerValue(e) : props.centerValue;
          const l =
            typeof props.centerLabel === 'function' ? props.centerLabel(e) : props.centerLabel;
          return {
            value: v ?? (e ? fmtValue(e.value) : fmtValue(model.total)),
            label: l ?? (e ? e.label : root.messages.total),
          };
        }}
      />
    ) : null;

  return (
    <ChartView
      root={root}
      base={props}
      kind={props.kind}
      adapter={adapter}
      frame={null}
      plot={{ x: 0, y: 0, width: root.width, height: root.height }}
      series={series}
      toggleSeries={toggleSeries}
      labels={model.labels}
      empty={model.slices.length === 0 && hidden.size === 0}
      tooltip={tooltipOpts}
      legend={legendOpts}
      table={table}
      dimOnActive
      clip={false}
      html={center}
      {...(props.activeIndex !== undefined
        ? { activePosition: toPosition(props.activeIndex) }
        : {})}
      onActiveChange={(a) => {
        const e = event(a);
        props.onHover?.(e);
        props.onActiveIndexChange?.(e ? e.index : null);
      }}
      onItemClick={(a) => {
        const e = event(a);
        if (e) props.onClick?.(e);
      }}
    />
  );
}

/** Pie chart: part-to-whole for a handful of categories, with percentage labels. */
export function PieChart<T extends object>(props: PieChartProps<T>): ReactElement {
  return <PolarPie {...props} kind="Pie chart" inner={0} donut={false} />;
}

/** Donut chart with a centre readout (total, or the hovered slice). */
export function DonutChart<T extends object>({
  thickness = 0.32,
  ...props
}: DonutChartProps<T>): ReactElement {
  return (
    <PolarPie
      {...props}
      kind="Donut chart"
      inner={1 - Math.min(0.9, Math.max(0.05, thickness))}
      donut
    />
  );
}
