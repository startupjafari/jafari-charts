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
import { publishSync, readSync, subscribeSync } from '../internal/sync';
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
  /** Static SVG drawn below the data marks (grid). */
  background?: ReactNode;
  /** Interactive SVG drawn below the data marks (band cursor); kept off the static layer. */
  underlay?: ReactNode;
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
  /** Charts with the same id share the active x value (crosshair + tooltip). */
  syncId?: string;
  /** Show the legend even for a single series (explicit `legend` prop). */
  legendForSingle?: boolean;
  /** Controlled emphasis: the series with this id stays, others fade (`null` = none). */
  highlightedSeries?: string | null;
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

/**
 * Static data layer in its own <svg>. Hover never touches it: "dim everything"
 * (active bar/slice) is an opacity on the whole layer, so with a promoted
 * compositor layer it costs no repaint; legend highlights dim per series.
 */
function StaticLayer(props: {
  marks: Mark[];
  chartId: string;
  width: number;
  height: number;
  clip: Rect | null;
  dimOnActive: boolean;
  promote: boolean;
  background?: ReactNode;
}) {
  const { store } = useChart();
  const { dimOnActive, chartId } = props;
  const select = useCallback(
    (s: InteractionState) =>
      s.highlight !== null ? s.highlight : dimOnActive && s.active ? -2 : null,
    [dimOnActive],
  );
  const dim = useStoreSelector(store, select);
  const clipId = `${chartId}-clip`;
  return (
    <svg
      className="jc-static"
      width={props.width}
      height={props.height}
      viewBox={`0 0 ${props.width} ${props.height}`}
      aria-hidden="true"
      focusable="false"
      data-jc-dim={dim === -2 ? '' : undefined}
      style={props.promote ? { willChange: 'opacity' } : undefined}
    >
      {props.clip ? (
        <defs>
          <clipPath id={clipId}>
            <rect {...props.clip} />
          </clipPath>
        </defs>
      ) : null}
      {props.background}
      <SeriesLayer
        marks={props.marks}
        chartId={chartId}
        dim={dim === -2 ? null : dim}
        {...(props.clip ? { clipPath: `url(#${clipId})` } : {})}
      />
    </svg>
  );
}

/** Mark count above which layers are promoted (measured: hover cost grows with scene size). */
const HEAVY_SCENE = 1000;

const selectTouchOpen = (s: InteractionState) => s.source === 'touch' && s.active !== null;

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

  // Large scenes get their static and interactive layers promoted to compositor
  // layers, so hover repaints never re-rasterise thousands of data marks.
  const heavy = markComplexity(adapter.marks) > HEAVY_SCENE;
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
      const sync = props.syncId;
      if (sync && source !== 'sync' && source !== 'controlled') {
        const a = adapterRef.current;
        publishSync(sync, id, next && a.syncKey ? a.syncKey(next) : null);
      }
    },
    [store, controlled, onActiveChange, props.syncId, id],
  );

  // Controlled series emphasis.
  const highlighted = props.highlightedSeries;
  useEffect(() => {
    if (highlighted === undefined) return;
    const index = highlighted === null ? -1 : series.findIndex((x) => x.id === highlighted);
    store.setState({ highlight: index >= 0 ? index : null });
  }, [highlighted, series, store]);

  // Follow the active value of synchronised charts.
  const syncId = props.syncId;
  useEffect(() => {
    if (!syncId) return;
    const apply = () => {
      const { source, key } = readSync(syncId);
      if (source === id) return;
      const a = adapterRef.current;
      const item = key === null || !a.fromSyncKey ? null : a.fromSyncKey(key);
      const prev = store.getState();
      // A local pointer interaction wins over the remote one.
      if (prev.source === 'pointer' || prev.source === 'keyboard' || prev.source === 'touch')
        return;
      store.setState({ active: item, source: item ? 'sync' : null, pointer: null });
    };
    return subscribeSync(syncId, apply);
  }, [syncId, id, store]);

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
  // The document listener exists only while a touch tooltip is open.
  const touchOpen = useStoreSelector(store, selectTouchOpen);
  useEffect(() => {
    if (!touchOpen) return;
    const dismiss = (e: Event) => {
      if (root.ref.current && e.target instanceof Node && root.ref.current.contains(e.target))
        return;
      setActive(null, null, null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [touchOpen, setActive, root.ref]);

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
        {legendOpts &&
        legendOpts.position === 'top' &&
        (series.length > 1 || props.legendForSingle) ? (
          <ChartLegend {...legendOpts} />
        ) : null}
        {/* The frame holds the focusable chart image plus siblings that must stay
            exposed to assistive technology (controls, states): children of
            role="img" are presentational. */}
        <div className="jc-frame" style={{ position: 'relative', height }}>
          <div
            className="jc-layers"
            style={{ position: 'absolute', inset: 0 }}
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
                    {props.underlay}
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
                    <ActiveLayer chartId={id} />
                    <TextLabels labels={props.labels ?? []} />
                    {props.foreground}
                    {props.children}
                    {props.overlay}
                  </svg>
                </>
              ) : (
                <>
                  {props.underlay ? (
                    <svg className="jc-static" width={width} height={height} aria-hidden="true">
                      {props.underlay}
                    </svg>
                  ) : null}
                  <StaticLayer
                    marks={marks}
                    chartId={id}
                    width={width}
                    height={height}
                    clip={props.clip === false ? null : inflate(plot, pad)}
                    dimOnActive={props.dimOnActive ?? false}
                    promote={heavy}
                    background={props.background}
                  />
                  <svg
                    {...svgProps}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      ...(heavy ? { willChange: 'transform' } : {}),
                    }}
                  >
                    {/* Highlighted marks sit under the labels so values stay readable. */}
                    <ActiveLayer chartId={id} />
                    <TextLabels labels={props.labels ?? []} />
                    {props.foreground}
                    {props.children}
                    {props.overlay}
                  </svg>
                </>
              )
            ) : null}
            {showContent ? props.html : null}
            {showContent && tooltip ? <ChartTooltip {...tooltip} /> : null}
          </div>
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
        {legendOpts &&
        legendOpts.position !== 'top' &&
        (series.length > 1 || props.legendForSingle) ? (
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
