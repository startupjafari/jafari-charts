import {
  frameThrottle,
  markComplexity,
  type CartesianFrame,
  type Mark,
  type Rect,
  type TextMark,
} from '@jafari/charts-core';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useEvent } from '../hooks/useControllableState';
import { useMarkTransition } from '../hooks/useMarkTransition';
import { useStoreSelector } from '../hooks/useStoreSelector';
import type { BaseChartProps, ChartRoot } from '../internal/useChartRoot';
import { CanvasMarks } from '../primitives/CanvasMarks';
import { MarkList, SeriesLayer } from '../primitives/SeriesLayer';
import { TextLabels } from '../primitives/TextLabels';
import {
  ChartInstanceProvider,
  useChart,
  type ActiveItem,
  type ChartAdapter,
  type ChartInstance,
  type InteractionState,
  type SeriesInfo,
} from '../providers/ChartContext';
import { ChartDataTable, ChartLiveRegion, type DataTable } from './ChartA11y';
import { ChartLegend, type LegendOptions } from './ChartLegend';
import { ChartEmptyState, ChartErrorState, ChartLoadingState } from './ChartStates';
import { ChartStyles } from './ChartStyles';
import { ChartTooltip, type TooltipOptions } from './ChartTooltip';

export interface ChartViewProps {
  root: ChartRoot;
  base: BaseChartProps;
  /** Human-readable chart type for the accessible description ("Line chart"). */
  kind: string;
  adapter: ChartAdapter;
  frame: CartesianFrame | null;
  plot: Rect;
  series: SeriesInfo[];
  toggleSeries: (id: string) => void;
  labels?: readonly TextMark[];
  empty: boolean;
  /** SVG drawn below the data marks (grid, cursor). */
  background?: ReactNode;
  /** SVG drawn above the data marks (axes, reference lines). */
  foreground?: ReactNode;
  /** SVG drawn on top of everything (crosshair). */
  overlay?: ReactNode;
  /** HTML over the surface (centre labels). */
  html?: ReactNode;
  /** User primitives (`<ChartReferenceLine>` …), drawn above the data. */
  children?: ReactNode;
  tooltip: false | TooltipOptions;
  legend: false | LegendOptions;
  table?: DataTable;
  /** Dim static marks while an item is active (bars, slices). */
  dimOnActive?: boolean;
  /** Clip data marks to the plot rectangle (cartesian charts). */
  clip?: boolean;
  /** Point count above which `renderer="auto"` switches to canvas (from benchmarks). */
  canvasThreshold?: number;
  /** Controlled active position (`null` = none). */
  activePosition?: number | null;
  onActiveChange?: (item: ActiveItem | null) => void;
  onItemClick?: (item: ActiveItem) => void;
  /** Extra surface handlers (zoom / brush) — called before hover handling. */
  surfaceHandlers?: SurfaceHandlers;
  /** HTML controls over the chart (e.g. reset zoom). */
  controls?: ReactNode;
}

export interface SurfaceHandlers {
  onPointerDown?: (e: PointerEvent<SVGSVGElement>, x: number, y: number) => boolean | void;
  onPointerMove?: (e: PointerEvent<SVGSVGElement>, x: number, y: number) => boolean | void;
  onPointerUp?: (e: PointerEvent<SVGSVGElement>, x: number, y: number) => void;
  onWheel?: (e: WheelEvent, x: number, y: number) => void;
  onDoubleClick?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => boolean | void;
  zoomable?: boolean;
}

const KEYS: Record<string, 'next' | 'prev' | 'first' | 'last' | 'up' | 'down'> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  ArrowDown: 'down',
  ArrowUp: 'up',
  Home: 'first',
  End: 'last',
};

function ConnectedSeries(props: {
  marks: Mark[];
  chartId: string;
  clipPath?: string;
  dimOnActive: boolean;
}) {
  const { store } = useChart();
  const { dimOnActive } = props;
  const select = useCallback(
    (s: InteractionState) =>
      s.highlight !== null ? s.highlight : dimOnActive && s.active ? -2 : null,
    [dimOnActive],
  );
  const dim = useStoreSelector(store, select);
  return (
    <SeriesLayer
      marks={props.marks}
      chartId={props.chartId}
      dim={dim}
      {...(props.clipPath ? { clipPath: props.clipPath } : {})}
    />
  );
}

const selectActiveKey = (s: InteractionState) =>
  s.active ? `${s.active.position}:${s.active.series}` : '';

function ActiveLayer({ chartId }: { chartId: string }) {
  const { store, adapter } = useChart();
  const key = useStoreSelector(store, selectActiveKey);
  const active = key ? store.getState().active : null;
  if (!active) return null;
  return (
    <g className="jc-active" aria-hidden="true">
      <MarkList marks={adapter.activeMarks(active)} chartId={chartId} />
    </g>
  );
}

/**
 * Shared shell of every chart: container, layers (SVG or Canvas), interaction,
 * tooltip, legend, states and accessibility.
 */
export function ChartView(props: ChartViewProps) {
  const { root, base, adapter, frame, plot, series, empty, tooltip, legend } = props;
  const { store, width, height, id } = root;
  const surfaceRef = useRef<SVGSVGElement>(null);
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;
  const controlled = props.activePosition !== undefined;
  const onActiveChange = useEvent(props.onActiveChange);
  const onItemClick = useEvent(props.onItemClick);
  const handlers = props.surfaceHandlers;

  const rendererChoice =
    root.renderer === 'auto'
      ? markComplexity(adapter.marks) > (props.canvasThreshold ?? Number.POSITIVE_INFINITY)
        ? 'canvas'
        : 'svg'
      : root.renderer;

  const instance = useMemo<ChartInstance>(
    () => ({
      id,
      width,
      height,
      plot,
      frame,
      store,
      locale: root.locale,
      messages: root.messages,
      series,
      toggleSeries: props.toggleSeries,
      adapter,
      renderer: rendererChoice,
      reducedMotion: !root.animation.enabled,
    }),
    [
      id,
      width,
      height,
      plot,
      frame,
      store,
      root.locale,
      root.messages,
      series,
      props.toggleSeries,
      adapter,
      rendererChoice,
      root.animation.enabled,
    ],
  );

  const marks = useMarkTransition(adapter.marks, {
    enabled: root.animation.enabled,
    initial: root.animation.initial,
    duration: root.animation.duration,
    easing: root.animation.easing,
    maxComplexity: root.animation.maxComplexity,
    ready: root.ready,
    sizeKey: `${width}x${height}`,
  });

  const setActive = useCallback(
    (
      next: ActiveItem | null,
      source: InteractionState['source'],
      pointer: InteractionState['pointer'],
    ) => {
      const prev = store.getState().active;
      const same = prev?.position === next?.position && prev?.series === next?.series;
      if (controlled) store.setState({ pointer });
      else store.setState({ active: next, source: next ? source : null, pointer });
      if (!same) onActiveChange(next);
    },
    [store, controlled, onActiveChange],
  );

  // Controlled active item.
  useEffect(() => {
    if (!controlled) return;
    const p = props.activePosition;
    store.setState({
      active: p === null || p === undefined ? null : adapter.itemAt(p),
      source: 'controlled',
    });
  }, [controlled, props.activePosition, adapter, store]);

  // Data changed: re-resolve the active item against the new layout.
  useEffect(() => {
    const a = store.getState().active;
    if (a && !controlled) store.setState({ active: adapter.itemAt(a.position, a.series) });
  }, [adapter, store, controlled]);

  const locate = (clientX: number, clientY: number) => {
    const el = surfaceRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  // One frame-throttled handler per chart: hit testing runs at most once per frame.
  const hover = useMemo(
    () =>
      frameThrottle((clientX: number, clientY: number, touch: boolean) => {
        const p = locate(clientX, clientY);
        if (!p) return;
        setActive(adapterRef.current.hitTest(p.x, p.y), touch ? 'touch' : 'pointer', p);
      }),
    [setActive],
  );
  useEffect(() => () => hover.cancel(), [hover]);

  // Touch: keep the tooltip after lifting the finger; a tap outside dismisses it.
  useEffect(() => {
    const dismiss = (e: Event) => {
      if (store.getState().source !== 'touch') return;
      if (root.ref.current && e.target instanceof Node && root.ref.current.contains(e.target))
        return;
      setActive(null, null, null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [store, setActive, root.ref]);

  // Wheel needs a non-passive native listener to prevent page zoom on pinch.
  const onWheel = handlers?.onWheel;
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el || !onWheel) return;
    const listener = (e: WheelEvent) => {
      const p = locate(e.clientX, e.clientY);
      if (p) onWheel(e, p.x, p.y);
    };
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, [onWheel, rendererChoice]);

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (handlers?.onPointerMove) {
      const p = locate(e.clientX, e.clientY);
      if (p && handlers.onPointerMove(e, p.x, p.y)) return;
    }
    hover(e.clientX, e.clientY, e.pointerType === 'touch');
  };
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (handlers?.onPointerDown) {
      const p = locate(e.clientX, e.clientY);
      if (p && handlers.onPointerDown(e, p.x, p.y)) return;
    }
    if (e.pointerType === 'touch') {
      hover(e.clientX, e.clientY, true);
      hover.flush();
    }
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    const p = locate(e.clientX, e.clientY);
    if (p) handlers?.onPointerUp?.(e, p.x, p.y);
  };
  const onPointerLeave = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') return;
    hover.cancel();
    setActive(null, null, null);
  };
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = locate(e.clientX, e.clientY);
    if (!p) return;
    const hit = adapterRef.current.hitTest(p.x, p.y);
    if (hit) onItemClick(hit);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (handlers?.onKeyDown?.(e)) return;
    const dir = KEYS[e.key];
    if (dir) {
      e.preventDefault();
      setActive(adapter.move(store.getState().active, dir), 'keyboard', null);
    } else if (e.key === 'Escape') {
      setActive(null, null, null);
    } else if (e.key === 'Enter' || e.key === ' ') {
      const a = store.getState().active;
      if (a) {
        e.preventDefault();
        onItemClick(a);
      }
    }
  };
  const onBlur = () => {
    if (store.getState().source === 'keyboard') setActive(null, null, null);
  };

  const legendOpts = legend === false ? null : legend;
  const descId = `${id}-desc`;
  const tableLimit = typeof base.accessibilityTable === 'number' ? base.accessibilityTable : 60;
  const showTable =
    base.accessibilityTable !== false &&
    props.table &&
    (base.accessibilityTable === true ||
      typeof base.accessibilityTable === 'number' ||
      props.table.rows.length <= tableLimit);
  const visibleSeries = series.filter((s) => s.visible).length;
  const summary = [
    root.messages.describe({ type: props.kind, series: visibleSeries, points: adapter.pointCount }),
    base.description,
  ]
    .filter(Boolean)
    .join(' ');
  const clipId = `${id}-clip`;
  const showContent = !empty && !base.error;
  const pad = 8; // markers on the plot edge must not be clipped

  const svgProps = {
    ref: surfaceRef,
    className: 'jc-surface',
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    'aria-hidden': true as const,
    focusable: 'false' as const,
    'data-jc-zoomable': handlers?.zoomable ? '' : undefined,
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel: onPointerLeave,
    onClick,
    onDoubleClick: handlers?.onDoubleClick,
  };

  return (
    <div
      ref={root.ref}
      id={base.id}
      className={`jc-root${base.className ? ` ${base.className}` : ''}`}
      data-jc-theme={root.themeMode}
      data-jc-scope={id}
      data-jc-loading={base.loading && !empty ? '' : undefined}
      style={{ ...root.themeStyle, ...base.style }}
      role="figure"
      aria-label={base.title ?? root.messages.chart}
    >
      <ChartStyles />
      {root.themeCss ? <style>{root.themeCss}</style> : null}
      <ChartInstanceProvider value={instance}>
        {legendOpts && legendOpts.position === 'top' && series.length > 1 ? (
          <ChartLegend {...legendOpts} />
        ) : null}
        <div
          className="jc-layers"
          style={{ position: 'relative', height }}
          tabIndex={showContent ? 0 : -1}
          role="img"
          aria-label={`${base.title ?? root.messages.chart}. ${root.messages.keyboardHint}`}
          aria-describedby={descId}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        >
          {showContent ? (
            rendererChoice === 'canvas' ? (
              <>
                <svg
                  className="jc-surface"
                  width={width}
                  height={height}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: 0, top: 0 }}
                >
                  {props.background}
                </svg>
                <CanvasMarks
                  marks={marks}
                  width={width}
                  height={height}
                  clip={props.clip === false ? undefined : inflate(plot, pad)}
                  themeKey={root.themeMode}
                />
                <svg {...svgProps} style={{ position: 'absolute', left: 0, top: 0 }}>
                  <TextLabels labels={props.labels ?? []} />
                  {props.foreground}
                  {props.children}
                  <ActiveLayer chartId={id} />
                  {props.overlay}
                </svg>
              </>
            ) : (
              <svg {...svgProps}>
                {props.clip === false ? null : (
                  <defs>
                    <clipPath id={clipId}>
                      <rect {...inflate(plot, pad)} />
                    </clipPath>
                  </defs>
                )}
                {props.background}
                <ConnectedSeries
                  marks={marks}
                  chartId={id}
                  dimOnActive={props.dimOnActive ?? false}
                  {...(props.clip === false ? {} : { clipPath: `url(#${clipId})` })}
                />
                <TextLabels labels={props.labels ?? []} />
                {props.foreground}
                {props.children}
                <ActiveLayer chartId={id} />
                {props.overlay}
              </svg>
            )
          ) : null}
          {showContent ? props.html : null}
          {showContent && tooltip ? <ChartTooltip {...tooltip} /> : null}
          {showContent ? props.controls : null}
          {base.error ? (
            <ChartErrorState
              {...(base.onRetry ? { onRetry: base.onRetry } : {})}
              retryLabel={root.messages.retry}
            >
              {base.error === true ? root.messages.error : base.error}
            </ChartErrorState>
          ) : empty ? (
            base.loading ? (
              <ChartLoadingState width={width} height={height}>
                {root.messages.loading}
              </ChartLoadingState>
            ) : (
              <ChartEmptyState>{base.emptyMessage ?? root.messages.noData}</ChartEmptyState>
            )
          ) : null}
        </div>
        {legendOpts && legendOpts.position !== 'top' && series.length > 1 ? (
          <ChartLegend {...legendOpts} />
        ) : null}
        <ChartLiveRegion />
        <p id={descId} className="jc-sr-only">
          {summary}
        </p>
        {showTable && props.table ? (
          <ChartDataTable
            table={props.table}
            caption={`${root.messages.dataTable}: ${base.title ?? props.kind}`}
            limit={tableLimit}
          />
        ) : null}
      </ChartInstanceProvider>
    </div>
  );
}

function inflate(r: Rect, by: number): Rect {
  return { x: r.x - by, y: r.y - by, width: r.width + by * 2, height: r.height + by * 2 };
}
