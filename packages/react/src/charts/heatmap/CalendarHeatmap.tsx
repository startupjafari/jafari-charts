import {
  aggregateCalendarDays,
  buildCalendarModel,
  calendarDate,
  createStore,
  formatAuto,
  formatDate,
  fromCalendarDay,
  timeColumn,
  numericColumn,
  toTime,
  type CalendarModel,
  type DimensionKey,
  type Mark,
  type NumericKey,
  type Store,
} from '@jafari/charts-core';
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { DataTable } from '../../components/ChartA11y';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView, type SurfaceHandlers } from '../../components/ChartView';
import { useStoreSelector } from '../../hooks/useStoreSelector';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import { SeriesLayer } from '../../primitives/SeriesLayer';
import type { ActiveItem, ChartAdapter } from '../../providers/ChartContext';
import {
  bucketLabels,
  cellCssColor,
  emptyItem,
  ScaleLegend,
  scaleSeries,
  useSingleSeriesMessages,
  type ScaleItem,
} from './shared';

export type DateInput = Date | string | number;

export interface CalendarDayEvent<T> {
  /** Local midnight of the day. */
  date: Date;
  /** Sum of the day's values; `null` without data. */
  value: number | null;
  /** First datum on that day (`null` without data). */
  datum: T | null;
  /** Index of that datum in `data` (-1 without data). */
  index: number;
}

/** Payload of `onBrush`: the selected days (local midnight), `from` ≤ `to`. */
export interface CalendarBrushEvent {
  from: Date;
  to: Date;
}

export interface CalendarLegendOptions extends Omit<LegendOptions, 'render' | 'interactive'> {
  /** Text before the scale (default "Less"). */
  lessLabel?: string;
  /** Text after the scale (default "More"). */
  moreLabel?: string;
}

export interface CalendarHeatmapProps<T extends object> extends BaseChartProps {
  data: readonly T[];
  /** Field with the day: Date, timestamp or ISO string ("2025-03-01" is local midnight). */
  dateKey: DimensionKey<T>;
  /** Field with the value; several rows on one day are summed. */
  valueKey: NumericKey<T>;
  /** First day shown (default: earliest date in the data). */
  from?: DateInput;
  /** Last day shown (default: latest date in the data). */
  to?: DateInput;
  /** First weekday row: 0 = Sunday, 1 = Monday… (default from the locale: en → 0, ru/kk → 1). */
  weekStartsOn?: number;
  /** Colour steps above the empty level (default 4). */
  buckets?: number;
  /** Explicit ascending step boundaries, e.g. `[1, 5, 10]`. */
  thresholds?: readonly number[];
  /** Hue of the steps (default: first series colour). */
  color?: string;
  /** Concrete colour ramp, low → high. */
  colors?: readonly string[];
  /** Fill of days without activity (default: the track token). */
  emptyColor?: string;
  /** `continuous` weeks or one row block per `years`; `auto` stacks years for ranges over a year. */
  layout?: 'auto' | 'continuous' | 'years';
  /** Visual gap between months (`true` or px). */
  monthGap?: boolean | number;
  /** Largest cell size, px (default 14). Cells shrink to fit, then the oldest weeks are cut. */
  cellSize?: number;
  /** Weekday labels: Mon/Wed/Fri (default), `all`, or `false`. */
  weekdayLabels?: boolean | 'all';
  monthLabels?: boolean;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
  /** Name of the value in tooltips (default "Value"). */
  valueLabel?: string;
  tooltip?: boolean | TooltipOptions;
  legend?: boolean | CalendarLegendOptions;
  onHover?: (event: CalendarDayEvent<T> | null) => void;
  onClick?: (event: CalendarDayEvent<T>) => void;
  /** Controlled active (highlighted) day: Date, timestamp or ISO string; `null` = none. */
  activeDate?: DateInput | null;
  onActiveDateChange?: (date: Date | null) => void;
  /**
   * Range selection: drag across days, or Shift + arrows from the focused day. The selected
   * days stay highlighted until Escape, a click or a new selection.
   */
  brush?: boolean;
  onBrush?: (range: CalendarBrushEvent) => void;
  children?: ReactNode;
}

/** Selected days as calendar day numbers `[anchor, focus]` (either order). */
type Selection = { range: readonly [number, number] | null };

const SHIFT_KEYS: Record<string, 'next' | 'prev' | 'up' | 'down'> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

const selectRange = (s: Selection) => s.range;

/** Rings around the selected days (one batched path). */
function SelectionOverlay({
  selection,
  model,
  chartId,
}: {
  selection: Store<Selection>;
  model: CalendarModel;
  chartId: string;
}) {
  const range = useStoreSelector(selection, selectRange);
  const marks = useMemo(() => {
    if (!range) return [];
    const a = Math.max(model.visible[0], Math.min(range[0], range[1]) - model.first);
    const b = Math.min(model.visible[1], Math.max(range[0], range[1]) - model.first);
    const out: Mark[] = [];
    for (let i = a; i <= b; i++) {
      const r = model.cellRect(i);
      if (!r) continue;
      out.push({
        type: 'rect',
        key: `sel|${i}`,
        x: r.x - 1,
        y: r.y - 1,
        width: r.width + 2,
        height: r.height + 2,
        radius: Math.min(3, r.width / 4 + 1),
        fill: 'transparent',
        stroke: 'var(--jc-focus)',
        strokeWidth: 1.5,
        series: -1,
      });
    }
    return out;
  }, [range, model]);
  if (!marks.length) return null;
  return (
    <g className="jc-selection" aria-hidden="true">
      <SeriesLayer marks={marks} chartId={`${chartId}-sel`} />
    </g>
  );
}

const EMPTY_HEIGHT = 140;

function toMs(v: DateInput | undefined): number | undefined {
  if (v === undefined) return undefined;
  const t = toTime(v);
  return Number.isFinite(t) ? t : undefined;
}

/**
 * Activity calendar: one cell per day, weeks as columns and weekdays as rows, with
 * month labels and quantized colour steps. Cells size themselves to the width
 * (up to 14 px); narrow containers show the most recent weeks.
 */
export function CalendarHeatmap<T extends object>(props: CalendarHeatmapProps<T>): ReactElement {
  const root = useChartRoot(props, { height: EMPTY_HEIGHT });
  const { data, dateKey, valueKey, valueFormatter } = props;
  const locale = root.locale;
  const from = toMs(props.from);
  const to = toMs(props.to);
  const days = useMemo(
    () =>
      aggregateCalendarDays(timeColumn(data, dateKey), numericColumn(data, valueKey), {
        ...(from !== undefined ? { from } : {}),
        ...(to !== undefined ? { to } : {}),
      }),
    [data, dateKey, valueKey, from, to],
  );

  const thresholdKey = props.thresholds?.join(',') ?? '';
  const rampKey = props.colors?.join(',') ?? '';
  const model = useMemo<CalendarModel | null>(
    () =>
      days
        ? buildCalendarModel({
            width: root.width,
            ...(props.height !== undefined ? { height: props.height } : {}),
            days,
            locale,
            ...(props.weekStartsOn !== undefined ? { weekStartsOn: props.weekStartsOn } : {}),
            colors: {
              ...(props.buckets !== undefined ? { buckets: props.buckets } : {}),
              ...(thresholdKey && props.thresholds ? { thresholds: props.thresholds } : {}),
              ...(props.color ? { color: props.color } : {}),
              ...(rampKey && props.colors ? { colors: props.colors } : {}),
              ...(props.emptyColor ? { emptyColor: props.emptyColor } : {}),
            },
            layout: props.layout ?? 'auto',
            ...(props.monthGap !== undefined ? { monthGap: props.monthGap } : {}),
            ...(props.cellSize !== undefined ? { maxCellSize: props.cellSize } : {}),
            ...(props.weekdayLabels !== undefined ? { weekdayLabels: props.weekdayLabels } : {}),
            ...(props.monthLabels !== undefined ? { monthLabels: props.monthLabels } : {}),
          })
        : null,
    // Arrays are compared by content so inline props do not re-layout every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      days,
      root.width,
      props.height,
      locale,
      props.weekStartsOn,
      props.buckets,
      thresholdKey,
      props.color,
      rampKey,
      props.emptyColor,
      props.layout,
      props.monthGap,
      props.cellSize,
      props.weekdayLabels,
      props.monthLabels,
    ],
  );

  const messages = useSingleSeriesMessages(root.messages);
  const valueLabel = props.valueLabel ?? messages.value;
  const fmtValue = useMemo(
    () => (v: number) =>
      !Number.isFinite(v) ? '—' : valueFormatter ? valueFormatter(v) : formatAuto(v, locale),
    [valueFormatter, locale],
  );
  const dateFormatter = props.dateFormatter;
  const fmtDate = useMemo(
    () => (t: number) =>
      dateFormatter
        ? dateFormatter(new Date(t))
        : formatDate(t, {
            locale,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
    [dateFormatter, locale],
  );

  const adapter = useMemo<ChartAdapter>(() => {
    if (!model || !days)
      return {
        marks: [],
        hitTest: () => null,
        tooltip: () => null,
        activeMarks: () => [],
        move: () => null,
        itemAt: () => null,
        pointCount: 0,
      };
    const item = (index: number): ActiveItem | null => {
      const r = model.cellRect(index);
      if (!r) return null;
      return { position: index, series: 0, x: r.x + r.width / 2, y: r.y + r.height / 2 };
    };
    /** Nearest drawn day from `start` in direction `dir` (narrow layouts hide some days). */
    const seek = (start: number, dir: 1 | -1, stride = 1): ActiveItem | null => {
      for (let i = start, guard = 0; i >= 0 && i < model.count && guard < 400; i += dir * stride) {
        const it = item(i);
        if (it) return it;
        guard++;
      }
      return null;
    };
    const [v0, v1] = model.visible;
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip: (a) => {
        if (a.position < 0 || a.position >= model.count) return null;
        const b = model.dayBuckets[a.position] as number;
        const step = b >= 0 ? model.scale.buckets[b] : undefined;
        const v = days.values[a.position] as number;
        return {
          title: fmtDate(model.timeOf(a.position)),
          rows: [
            {
              key: 'value',
              label: valueLabel,
              value: fmtValue(v),
              color: cellCssColor(step ?? model.scale.empty),
              kind: 'bar',
            },
          ],
        };
      },
      activeMarks: (a) => model.activeMarks(a.position),
      move: (a, key) => {
        if (!a)
          return key === 'prev' || key === 'up' || key === 'last' ? seek(v1, -1) : seek(v0, 1);
        const p = a.position;
        switch (key) {
          case 'first':
            return seek(v0, 1);
          case 'last':
            return seek(v1, -1);
          // Columns are weeks: left/right move by a week, up/down by a day.
          case 'next':
            return seek(p + 7, 1, 7) ?? a;
          case 'prev':
            return seek(p - 7, -1, 7) ?? a;
          case 'down':
            return seek(p + 1, 1) ?? a;
          case 'up':
            return seek(p - 1, -1) ?? a;
        }
      },
      itemAt: (p) => item(p),
      pointCount: model.defined,
    };
  }, [model, days, fmtDate, fmtValue, valueLabel]);

  const legendItems = useMemo<ScaleItem[]>(() => {
    if (!model) return [];
    const ranges = bucketLabels(model.scale, valueFormatter, locale, Boolean(thresholdKey));
    return [
      emptyItem(model.scale, 0, messages.noData),
      ...model.scale.buckets.map((b, i) => ({
        slot: i + 1,
        label: ranges[i] ?? '',
        fill: b.fill,
        ...(b.fillOpacity !== undefined ? { fillOpacity: b.fillOpacity } : {}),
      })),
    ];
  }, [model, valueFormatter, locale, thresholdKey, messages.noData]);
  const series = useMemo(() => scaleSeries(legendItems), [legendItems]);

  // Month summaries: a compact text equivalent (one row per month).
  const table = useMemo<DataTable | undefined>(() => {
    if (!model || !days) return undefined;
    const rows: string[][] = [];
    let cur = -1;
    let total = 0;
    let max = Number.NEGATIVE_INFINITY;
    let label = '';
    const flush = () => {
      if (cur >= 0) rows.push([label, fmtValue(total), Number.isFinite(max) ? fmtValue(max) : '—']);
    };
    for (let i = model.visible[0]; i <= model.visible[1]; i++) {
      const { year, month } = calendarDate(model.first + i);
      const key = year * 12 + month;
      if (key !== cur) {
        flush();
        cur = key;
        total = 0;
        max = Number.NEGATIVE_INFINITY;
        label = formatDate(model.timeOf(i), { locale, month: 'long', year: 'numeric' });
      }
      const v = days.values[i] as number;
      if (Number.isFinite(v)) {
        total += v;
        if (v > max) max = v;
      }
    }
    flush();
    return { columns: [messages.month, messages.total, messages.maximum], rows };
  }, [model, days, fmtValue, locale, messages.month, messages.total, messages.maximum]);

  // ---- Range selection (brush) ---------------------------------------------------------------
  const [selection] = useState(() => createStore<Selection>({ range: null }));
  const dragAnchor = useRef<number | null>(null);
  const selectDays = (range: readonly [number, number]) => {
    selection.setState({ range });
    const from = Math.min(range[0], range[1]);
    const to = Math.max(range[0], range[1]);
    props.onBrush?.({ from: new Date(fromCalendarDay(from)), to: new Date(fromCalendarDay(to)) });
    root.store.setState({
      announcement: messages.selectedRange(
        fmtDate(fromCalendarDay(from)),
        fmtDate(fromCalendarDay(to)),
      ),
    });
  };
  const surfaceHandlers: SurfaceHandlers | undefined =
    props.brush && model
      ? {
          onPointerDown: (e, x, y) => {
            if (e.pointerType === 'touch' || (e.pointerType === 'mouse' && e.button !== 0))
              return false;
            const i = model.hitTest(x, y);
            if (i < 0) return false;
            dragAnchor.current = model.first + i;
            selection.setState({ range: [model.first + i, model.first + i] });
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            return true;
          },
          // The tooltip keeps following the pointer while the selection grows.
          onPointerMove: (_e, x, y) => {
            const anchor = dragAnchor.current;
            if (anchor === null) return false;
            const i = model.hitTest(x, y);
            if (i >= 0 && selection.getState().range?.[1] !== model.first + i)
              selection.setState({ range: [anchor, model.first + i] });
            return false;
          },
          onPointerUp: () => {
            if (dragAnchor.current === null) return;
            dragAnchor.current = null;
            const range = selection.getState().range;
            // A click without dragging clears the selection.
            if (!range || range[0] === range[1]) selection.setState({ range: null });
            else selectDays(range);
          },
          onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            const dir = SHIFT_KEYS[e.key];
            if (e.key === 'Escape' || (dir && !e.shiftKey)) {
              selection.setState({ range: null });
              return false;
            }
            if (!dir) return false;
            const a = root.store.getState().active;
            const next = adapter.move(a, dir);
            if (!next) return false;
            const current = selection.getState().range;
            const anchor = current ? current[0] : model.first + (a ?? next).position;
            selectDays([anchor, model.first + next.position]);
            return false; // the shell moves the active day
          },
        }
      : undefined;

  const event = (a: ActiveItem | null): CalendarDayEvent<T> | null => {
    if (!a || !model || !days || a.position < 0 || a.position >= model.count) return null;
    const index = days.source[a.position] as number;
    const v = days.values[a.position] as number;
    return {
      date: new Date(model.timeOf(a.position)),
      value: Number.isFinite(v) ? v : null,
      datum: index >= 0 ? (data[index] as T) : null,
      index,
    };
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
  const empty = !model || model.defined === 0;
  const legendOpts: false | LegendOptions =
    legendBase && model && !empty
      ? {
          ...legendBase,
          render: () => (
            <ScaleLegend
              items={legendItems}
              start={legendBase.lessLabel ?? messages.less}
              end={legendBase.moreLabel ?? messages.more}
              align={legendBase.align ?? 'end'}
              {...(legendBase.position ? { position: legendBase.position } : {})}
            />
          ),
        }
      : false;

  const height = props.height ?? model?.height ?? EMPTY_HEIGHT;
  const plot = model?.plot ?? { x: 0, y: 0, width: root.width, height };
  const activeTime =
    props.activeDate === undefined ? undefined : toMs(props.activeDate ?? undefined);
  const activePosition =
    props.activeDate === undefined
      ? undefined
      : model && activeTime !== undefined && model.indexOf(activeTime) >= 0
        ? model.indexOf(activeTime)
        : null;

  return (
    <ChartView
      root={{ ...root, height, messages }}
      base={props}
      kind="Calendar heatmap"
      adapter={adapter}
      frame={null}
      plot={plot}
      series={series}
      toggleSeries={noop}
      labels={model?.labels ?? []}
      empty={empty}
      tooltip={tooltipOpts}
      legend={legendOpts}
      {...(table ? { table } : {})}
      dimOnActive
      clip={false}
      {...(activePosition !== undefined ? { activePosition } : {})}
      {...(surfaceHandlers ? { surfaceHandlers } : {})}
      {...(props.brush && model
        ? { overlay: <SelectionOverlay selection={selection} model={model} chartId={root.id} /> }
        : {})}
      onActiveChange={(a) => {
        props.onHover?.(event(a));
        props.onActiveDateChange?.(a && model ? new Date(model.timeOf(a.position)) : null);
      }}
      onItemClick={(a) => {
        const e = event(a);
        if (e) props.onClick?.(e);
      }}
    >
      {props.children}
    </ChartView>
  );
}

function noop() {}
