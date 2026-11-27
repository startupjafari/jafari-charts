import {
  buildFunnelModel,
  formatAuto,
  funnelPercent,
  labelColumn,
  numericColumn,
  type FunnelModel,
  type FunnelPercentBase,
  type FunnelStage,
  type FunnelVariant,
  type KeysMatching,
  type NumericKey,
} from '@startupjafari/charts-core';
import { seriesColor } from '@startupjafari/charts-themes';
import { useCallback, useMemo, type ReactElement } from 'react';
import { useStoreSelector } from '../../hooks/useStoreSelector';
import { TextLabels } from '../../primitives/TextLabels';
import type { DataTable } from '../../components/ChartA11y';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView } from '../../components/ChartView';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import {
  useChart,
  type ActiveItem,
  type ChartAdapter,
  type InteractionState,
  type SeriesInfo,
  type TooltipRow,
} from '../../providers/ChartContext';
import { funnelTexts, type FunnelTexts } from './texts';

export interface FunnelStageEvent<T> {
  datum: T;
  index: number;
  label: string;
  value: number;
  /** Ratio to the first stage (NaN when undefined). */
  ofFirst: number;
  /** Ratio to the previous stage (NaN for the first stage). */
  ofPrevious: number;
  /** Loss from the previous stage: positive = drop, negative = growth. */
  dropOff: number;
  /** `dropOff` relative to the previous stage. */
  dropOffRate: number;
}

export interface FunnelChartProps<T extends object> extends BaseChartProps {
  /** One row per stage, in funnel order. */
  data: readonly T[];
  /** Field naming each stage. */
  labelKey: KeysMatching<T, string | number>;
  /** Field holding each stage's value (users, sessions, deals…). */
  valueKey: NumericKey<T>;
  /** `bars` (default): centred bars with soft connectors. `trapezoid`: continuous funnel. */
  variant?: FunnelVariant;
  /** `vertical` (default): stages top → bottom. `horizontal`: left → right. */
  orientation?: 'vertical' | 'horizontal';
  /** Stage percentages relative to the first stage (default) or the previous one. */
  percentBase?: FunnelPercentBase;
  /** Colour of every stage (default: the first series colour). */
  color?: string;
  /** Colours by stage position (overrides `color`). */
  colors?: readonly string[];
  /** Stage names and values on the chart (default true). */
  labels?: boolean;
  /** Loss labels between stages when there is room (default true). */
  dropOff?: boolean;
  valueFormatter?: (value: number) => string;
  /** Formats a ratio (0.25 → "25%"). */
  percentFormatter?: (ratio: number) => string;
  tooltip?: boolean | TooltipOptions;
  /** Overrides for funnel-specific strings (tooltip rows, table headers). */
  texts?: Partial<FunnelTexts>;
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onHover?: (event: FunnelStageEvent<T> | null) => void;
  onClick?: (event: FunnelStageEvent<T>) => void;
}

const MINUS = '−';
const noop = () => {};
/** Typical tooltip width plus offset, px. */
const TOOLTIP_ROOM = 280;

const selectPosition = (s: InteractionState) => s.active?.position ?? -1;

/** Redraws the labels inside the active stage above its emphasised mark. */
function ActiveStageLabels({ model }: { model: FunnelModel }) {
  const { store } = useChart();
  const position = useStoreSelector(store, selectPosition);
  const stage = model.stages[position];
  const labels = useMemo(
    () =>
      stage
        ? model.labels.filter(
            (l) => l.fill !== undefined && l.key.startsWith(`value|${stage.key}|`),
          )
        : [],
    [model, stage],
  );
  if (!labels.length) return null;
  return (
    <g className="jc-active" aria-hidden="true">
      <TextLabels labels={labels} />
    </g>
  );
}

/** Default height: about 52px per vertical stage, within sensible bounds. */
function defaultHeight(stages: number, horizontal: boolean): number {
  if (horizontal) return 280;
  return Math.min(440, Math.max(160, 24 + stages * 52));
}

/**
 * Conversion funnel: stages with absolute values and percentages, and the loss
 * between consecutive stages. The stages form one series (one colour).
 */
export function FunnelChart<T extends object>(props: FunnelChartProps<T>): ReactElement {
  const { data, labelKey, valueKey, valueFormatter, percentFormatter } = props;
  const horizontal = props.orientation === 'horizontal';
  const root = useChartRoot(props, { height: defaultHeight(data.length, horizontal) });
  const texts = useMemo(
    () => funnelTexts(root.messages, props.texts),
    [root.messages, props.texts],
  );
  const names = useMemo(() => labelColumn(data, labelKey), [data, labelKey]);
  const values = useMemo(() => numericColumn(data, valueKey), [data, valueKey]);
  // Duplicate stage names still need distinct keys.
  const keys = useMemo(() => {
    const seen = new Map<string, number>();
    return names.map((l) => {
      const n = seen.get(l) ?? 0;
      seen.set(l, n + 1);
      return n ? `${l}#${n}` : l;
    });
  }, [names]);
  const baseColor = props.color ?? seriesColor(0);
  const colors = useMemo<string | readonly string[]>(
    () => (props.colors?.length ? props.colors : baseColor),
    [props.colors, baseColor],
  );
  const colorOf = useCallback(
    (i: number) => (typeof colors === 'string' ? colors : (colors[i] ?? baseColor)),
    [colors, baseColor],
  );
  const fmtValue = useCallback(
    (v: number) => (valueFormatter ? valueFormatter(v) : formatAuto(v, root.locale)),
    [valueFormatter, root.locale],
  );
  const fmtPercent = useCallback(
    (r: number) =>
      Number.isFinite(r)
        ? percentFormatter
          ? percentFormatter(r)
          : funnelPercent(r, root.locale)
        : '',
    [percentFormatter, root.locale],
  );

  const model = useMemo(
    () =>
      buildFunnelModel({
        width: root.width,
        height: root.height,
        values,
        names,
        keys,
        colors,
        variant: props.variant ?? 'bars',
        orientation: horizontal ? 'horizontal' : 'vertical',
        percentBase: props.percentBase ?? 'first',
        labels: props.labels !== false,
        dropOff: props.dropOff !== false,
        locale: root.locale,
        formatValue: fmtValue,
        formatPercent: fmtPercent,
      }),
    [
      root.width,
      root.height,
      root.locale,
      values,
      names,
      keys,
      colors,
      props.variant,
      horizontal,
      props.percentBase,
      props.labels,
      props.dropOff,
      fmtValue,
      fmtPercent,
    ],
  );

  const dropText = useCallback(
    (s: FunnelStage) => {
      if (!Number.isFinite(s.dropOff)) return '';
      const sign = s.dropOff > 0 ? MINUS : s.dropOff < 0 ? '+' : '';
      const count = `${sign}${fmtValue(Math.abs(s.dropOff))}`;
      return Number.isFinite(s.dropOffRate)
        ? `${sign}${fmtPercent(Math.abs(s.dropOffRate))} / ${count}`
        : count;
    },
    [fmtValue, fmtPercent],
  );

  const event = (a: ActiveItem | null): FunnelStageEvent<T> | null => {
    const s = a ? model.stages[a.position] : undefined;
    if (!s) return null;
    return {
      datum: data[s.index] as T,
      index: s.index,
      label: s.name,
      value: s.value,
      ofFirst: s.ofFirst,
      ofPrevious: s.ofPrevious,
      dropOff: s.dropOff,
      dropOffRate: s.dropOffRate,
    };
  };

  const adapter = useMemo<ChartAdapter>(() => {
    const n = model.stages.length;
    const item = (p: number): ActiveItem | null => {
      const s = model.stages[p];
      if (!s) return null;
      const a = model.anchor(p);
      // Vertical: keep the tooltip beside the bar — anchor at whichever edge has room.
      const x =
        !horizontal && root.width - (s.x + s.width) < TOOLTIP_ROOM && s.x >= TOOLTIP_ROOM
          ? s.x
          : a.x;
      return { position: p, series: 0, x, y: a.y };
    };
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip: (a) => {
        const s = model.stages[a.position];
        if (!s) return null;
        const color = colorOf(s.index);
        const row = (key: string, label: string, value: string): TooltipRow => ({
          key,
          label,
          value,
          color: key === 'value' ? color : 'transparent',
          kind: 'bar',
        });
        const rows: TooltipRow[] = [
          row('value', root.messages.value, Number.isFinite(s.value) ? fmtValue(s.value) : '—'),
        ];
        if (Number.isFinite(s.ofFirst) && s.index > 0)
          rows.push(row('first', texts.ofFirst, fmtPercent(s.ofFirst)));
        if (Number.isFinite(s.ofPrevious))
          rows.push(row('previous', texts.ofPrevious, fmtPercent(s.ofPrevious)));
        const drop = dropText(s);
        if (drop) rows.push(row('drop', texts.dropOff, drop));
        return { title: s.name, rows };
      },
      activeMarks: (a) => {
        const m = model.activeMark(a.position);
        return m ? [m] : [];
      },
      move: (a, key) => {
        if (!n) return null;
        const cur = a?.position ?? -1;
        if (key === 'first') return item(0);
        if (key === 'last') return item(n - 1);
        if (key === 'next' || key === 'down') return item(cur < 0 ? 0 : Math.min(n - 1, cur + 1));
        return item(cur < 0 ? n - 1 : Math.max(0, cur - 1));
      },
      itemAt: (p) => item(p),
      pointCount: n,
    };
  }, [
    model,
    horizontal,
    root.width,
    colorOf,
    fmtValue,
    fmtPercent,
    dropText,
    texts,
    root.messages,
  ]);

  const series = useMemo<SeriesInfo[]>(
    () => [
      {
        id: 'funnel',
        label: props.title ?? root.messages.value,
        color: colorOf(0),
        kind: 'bar',
        symbol: 'square',
        visible: true,
      },
    ],
    [props.title, root.messages.value, colorOf],
  );

  const table = useMemo<DataTable>(
    () => ({
      columns: [texts.stage, root.messages.value, texts.ofFirst, texts.ofPrevious, texts.dropOff],
      rows: model.stages.map((s) => [
        s.name,
        Number.isFinite(s.value) ? fmtValue(s.value) : '—',
        fmtPercent(s.ofFirst) || '—',
        fmtPercent(s.ofPrevious) || '—',
        dropText(s) || '—',
      ]),
    }),
    [model, texts, root.messages.value, fmtValue, fmtPercent, dropText],
  );

  const tooltipOpts =
    props.tooltip === false
      ? false
      : props.tooltip === true || props.tooltip === undefined
        ? {}
        : props.tooltip;

  return (
    <ChartView
      root={root}
      base={props}
      kind="Funnel chart"
      adapter={adapter}
      frame={null}
      plot={{ x: 0, y: 0, width: root.width, height: root.height }}
      series={series}
      toggleSeries={noop}
      labels={model.labels}
      empty={model.stages.length === 0}
      tooltip={tooltipOpts}
      legend={false}
      table={table}
      dimOnActive
      clip={false}
      overlay={<ActiveStageLabels model={model} />}
      {...(props.activeIndex !== undefined
        ? {
            activePosition:
              props.activeIndex === null || props.activeIndex >= model.stages.length
                ? null
                : props.activeIndex,
          }
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
