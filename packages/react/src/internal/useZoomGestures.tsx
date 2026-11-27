import {
  clampDomain,
  isFullDomain,
  panDomain,
  wheelZoomFactor,
  zoomDomain,
  type Rect,
  type ZoomLimits,
} from '@startupjafari/charts-core';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { SurfaceHandlers } from '../components/ChartView';
import { useStoreSelector } from '../hooks/useStoreSelector';
import { useChart, type InteractionState } from '../providers/ChartContext';
import type { ChartRoot } from './useChartRoot';

export type Domain = readonly [number, number];
type Point = { x: number; y: number };
type BrushState = NonNullable<InteractionState['brush']>;

/** One zoomable axis, in domain units (data values, or category positions). */
export interface ZoomAxis {
  /** Pointer coordinate the axis follows. */
  dim: 'x' | 'y';
  /** Full extent: zoomed domains never leave it. */
  bounds: Domain;
  /** Smallest visible span, in domain units (decades on log axes). */
  minSpan: number;
  /** Visible domain, `null` when not zoomed. */
  domain: Domain | null;
  /** Pixels where the visible domain starts and ends (`[bottom, top]` on a value y axis). */
  pixels: Domain;
  /** Zoom and pan in log10 space (log scales). */
  log?: boolean;
  /** Keyboard pan step (Shift + arrow), domain units. Default: 10% of the visible span. */
  step?: number;
  /** Whether the view is narrowed (default: `domain` differs from `bounds`). */
  zoomed?: boolean;
  /** Receives the next domain; `null` = the full extent. */
  set(domain: [number, number] | null): void;
}

/** A finished brush selection, px (clamped to the plot). */
export interface BrushRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface ZoomGestureOptions {
  root: ChartRoot;
  plot: Rect;
  /** Zoomable axes (empty when the chart cannot zoom, e.g. too few points). */
  axes: readonly ZoomAxis[];
  /** Zoom options, or null when zoom is off. */
  zoom: { wheel?: boolean | 'ctrl' } | null;
  /** Brush direction, or null when brushing is off. */
  brush: 'x' | 'y' | 'xy' | null;
  /** A brush selection finished (at least 4px along each brushed direction). */
  onBrush?: (rect: BrushRect) => void;
  /** Zoom into a finished brush selection when zoom is on (default true). */
  brushZooms?: boolean;
  /** Live-region text for the visible domains after a keyboard zoom, pan or reset. */
  describe?: (domains: readonly Domain[]) => string;
}

export interface ZoomGestures {
  handlers: SurfaceHandlers | undefined;
  /** Reset button (a real `<button>`, rendered by ChartView outside the chart image). */
  controls: ReactNode;
  zoomed: boolean;
}

const ARROWS: Record<string, ['x' | 'y', number]> = {
  ArrowLeft: ['x', -1],
  ArrowRight: ['x', 1],
  ArrowUp: ['y', -1],
  ArrowDown: ['y', 1],
};

interface AxisState {
  axis: ZoomAxis;
  /** Bounds and domains below are linear (log10 on log axes). */
  limits: ZoomLimits & { bounds: Domain };
  current: [number, number];
  zoomed: boolean;
}

const toLin = (a: ZoomAxis, d: Domain): [number, number] =>
  a.log ? [Math.log10(d[0]), Math.log10(d[1])] : [d[0], d[1]];
const fromLin = (a: ZoomAxis, d: Domain): [number, number] =>
  a.log ? [10 ** d[0], 10 ** d[1]] : [d[0], d[1]];

/** Signed pixel length of an axis (never below 1px). */
function pixelLength(a: ZoomAxis): number {
  const len = a.pixels[1] - a.pixels[0];
  return (len < 0 ? -1 : 1) * Math.max(1, Math.abs(len));
}

/** Domain value under a pixel (linear between the pixels of the visible domain). */
function valueAt(s: AxisState, px: number): number {
  const [p0, p1] = s.axis.pixels;
  const [d0, d1] = s.current;
  return p1 === p0 ? d0 : d0 + ((px - p0) / (p1 - p0)) * (d1 - d0);
}

/**
 * Zoom, pan and brush gestures shared by zoomable charts (cartesian x, category windows,
 * scatter x/y): Ctrl/⌘ + wheel or pinch zooms around the pointer (a plain wheel never
 * takes over page scrolling), drag pans a zoomed view (Shift + drag when brushing),
 * drag brushes, double-click / the reset button / `0` resets, `+` / `-` zoom around the
 * centre and Shift + arrows pan.
 */
export function useZoomGestures(options: ZoomGestureOptions): ZoomGestures {
  const drag = useRef<{
    mode: 'pan' | 'brush';
    x: number;
    y: number;
    domains: [number, number][];
  } | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ distance: number; domains: [number, number][] } | null>(null);

  const { root, plot, axes, zoom, brush } = options;
  const zoomEnabled = zoom !== null && axes.length > 0;
  if (!zoomEnabled && !brush) return { handlers: undefined, controls: null, zoomed: false };

  const store = root.store;
  // Read at event time: an axis may expose its domain through a getter (category zoom keeps
  // a fractional domain between whole categories without re-rendering).
  const read = (): AxisState[] =>
    axes.map((axis) => {
      const limits = { bounds: toLin(axis, axis.bounds), minSpan: axis.minSpan };
      const domain = axis.domain ? clampDomain(toLin(axis, axis.domain), limits) : null;
      return {
        axis,
        limits,
        current: domain ?? [limits.bounds[0], limits.bounds[1]],
        zoomed: axis.zoomed ?? (domain !== null && !isFullDomain(domain, limits.bounds)),
      };
    });
  const states = read();
  const zoomed = zoomEnabled && states.some((s) => s.zoomed);
  const dims = new Set<'x' | 'y'>(axes.map((a) => a.dim));
  if (brush === 'xy') dims.add('x').add('y');
  else if (brush) dims.add(brush);

  const clampX = (x: number) => Math.min(plot.x + plot.width, Math.max(plot.x, x));
  const clampY = (y: number) => Math.min(plot.y + plot.height, Math.max(plot.y, y));
  const at = (s: AxisState, x: number, y: number) => (s.axis.dim === 'x' ? x : y);
  /** Applies a (linear) domain; the full extent becomes `null`. Unchanged domains are skipped. */
  const apply = (s: AxisState, d: [number, number]) => {
    if (d[0] === s.current[0] && d[1] === s.current[1]) return;
    s.axis.set(isFullDomain(d, s.limits.bounds, 1e-6) ? null : fromLin(s.axis, d));
  };
  const announce = (domains: readonly Domain[]) => {
    if (options.describe) store.setState({ announcement: options.describe(domains) });
  };
  const reset = (all: boolean) => {
    for (const s of read()) if (all || s.axis.domain !== null) s.axis.set(null);
  };
  /** Pointer spread along the zoomed directions (pinch). */
  const spread = () => {
    const [a, b] = [...pointers.current.values()] as [Point, Point];
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dims.has('x') && dims.has('y') ? Math.hypot(dx, dy) : dims.has('y') ? dy : dx;
  };
  const brushAt = (sx: number, sy: number, x: number, y: number): BrushState =>
    brush === 'y'
      ? { from: plot.x, to: plot.x + plot.width, y0: clampY(sy), y1: clampY(y) }
      : brush === 'xy'
        ? { from: clampX(sx), to: clampX(x), y0: clampY(sy), y1: clampY(y) }
        : { from: clampX(sx), to: clampX(x) };

  const finishBrush = (sx: number, sy: number, x: number, y: number) => {
    store.setState({ brush: null });
    const b = brushAt(sx, sy, x, y);
    const [t, u] =
      b.y0 !== undefined && b.y1 !== undefined ? [b.y0, b.y1] : [plot.y, plot.y + plot.height];
    const rect: BrushRect = {
      x0: Math.min(b.from, b.to),
      x1: Math.max(b.from, b.to),
      y0: Math.min(t, u),
      y1: Math.max(t, u),
    };
    if ((brush !== 'y' && rect.x1 - rect.x0 < 4) || (brush !== 'x' && rect.y1 - rect.y0 < 4))
      return;
    options.onBrush?.(rect);
    if (!zoomEnabled || options.brushZooms === false) return;
    for (const s of read()) {
      if (brush !== 'xy' && brush !== s.axis.dim) continue;
      const a = valueAt(s, s.axis.dim === 'x' ? rect.x0 : rect.y0);
      const c = valueAt(s, s.axis.dim === 'x' ? rect.x1 : rect.y1);
      apply(s, clampDomain([a, c], s.limits));
    }
  };

  const handlers: SurfaceHandlers = {
    zoomable: zoomEnabled,
    onPointerDown: (e, x, y) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const st = read();
      if (pointers.current.size === 2 && zoomEnabled) {
        pinch.current = { distance: spread() || 1, domains: st.map((s) => s.current) };
        drag.current = null;
        store.setState({ brush: null });
        return true;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return false;
      if (dims.has('x') && (x < plot.x || x > plot.x + plot.width)) return false;
      if (dims.has('y') && (y < plot.y || y > plot.y + plot.height)) return false;
      const mode = brush && !(zoomEnabled && e.shiftKey) ? 'brush' : zoomed ? 'pan' : null;
      if (!mode || (mode === 'brush' && e.pointerType === 'touch')) return false;
      drag.current = { mode, x, y, domains: st.map((s) => s.current) };
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      if (mode === 'brush') store.setState({ brush: brushAt(x, y, x, y), active: null });
      return true;
    },
    onPointerMove: (e, x, y) => {
      if (pointers.current.has(e.pointerId))
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const p = pinch.current;
      if (p && pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()] as [Point, Point];
        const factor = p.distance / (spread() || 1);
        const r = (e.currentTarget as Element).getBoundingClientRect();
        const mx = (a.x + b.x) / 2 - r.left;
        const my = (a.y + b.y) / 2 - r.top;
        read().forEach((s, i) =>
          apply(s, zoomDomain(p.domains[i] as Domain, valueAt(s, at(s, mx, my)), factor, s.limits)),
        );
        return true;
      }
      const d = drag.current;
      if (!d) return false;
      if (d.mode === 'brush') {
        store.setState({ brush: brushAt(d.x, d.y, x, y) });
        return true;
      }
      read().forEach((s, i) => {
        const start = d.domains[i] as [number, number];
        const moved = at(s, x - d.x, y - d.y);
        apply(
          s,
          panDomain(start, -(moved / pixelLength(s.axis)) * (start[1] - start[0]), s.limits),
        );
      });
      return true;
    },
    onPointerUp: (e, x, y) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      const d = drag.current;
      drag.current = null;
      if (d?.mode === 'brush') finishBrush(d.x, d.y, x, y);
    },
    ...(zoomEnabled
      ? {
          onWheel: (e: WheelEvent, x: number, y: number) => {
            const wheel = zoom?.wheel ?? 'ctrl';
            const pinchGesture = e.ctrlKey || e.metaKey;
            const st = read();
            const panned = st.filter((s) => s.axis.dim === 'x' && s.zoomed);
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && panned.length) {
              e.preventDefault();
              for (const s of panned) {
                const span = s.current[1] - s.current[0];
                apply(s, panDomain(s.current, (e.deltaX / pixelLength(s.axis)) * span, s.limits));
              }
              return;
            }
            if (wheel === false || (wheel === 'ctrl' && !pinchGesture)) return;
            e.preventDefault();
            const factor = wheelZoomFactor(e.deltaY, e.deltaMode);
            for (const s of st)
              apply(
                s,
                zoomDomain(s.current, valueAt(s, at(s, clampX(x), clampY(y))), factor, s.limits),
              );
          },
          onDoubleClick: () => reset(false),
          onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            let next: [number, number][];
            const st = read();
            const arrow = e.shiftKey ? ARROWS[e.key] : undefined;
            if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
              const factor = e.key === '+' || e.key === '=' ? 0.8 : 1.25;
              next = st.map((s) =>
                zoomDomain(s.current, (s.current[0] + s.current[1]) / 2, factor, s.limits),
              );
            } else if (e.key === '0') {
              next = st.map((s) => [s.limits.bounds[0], s.limits.bounds[1]]);
            } else if (arrow && st.some((s) => s.axis.dim === arrow[0] && s.zoomed)) {
              next = st.map((s) => {
                if (s.axis.dim !== arrow[0] || !s.zoomed) return s.current;
                const step = s.axis.step ?? (s.current[1] - s.current[0]) * 0.1;
                const sign = pixelLength(s.axis) < 0 ? -1 : 1;
                return panDomain(s.current, arrow[1] * sign * step, s.limits);
              });
            } else return false;
            e.preventDefault();
            if (e.key === '0') reset(true);
            else st.forEach((s, i) => apply(s, next[i] as [number, number]));
            announce(next.map((d, i) => fromLin((st[i] as AxisState).axis, d)));
            return true;
          },
        }
      : {}),
  };

  const controls = zoomed ? (
    <button
      type="button"
      className="jc-button jc-reset-zoom"
      onClick={() => {
        reset(true);
        announce(states.map((s) => fromLin(s.axis, s.limits.bounds)));
      }}
    >
      {root.messages.resetZoom}
    </button>
  ) : null;
  return { handlers, controls, zoomed };
}

const selectBrush = (s: InteractionState) =>
  s.brush ? `${s.brush.from}:${s.brush.to}:${s.brush.y0 ?? ''}:${s.brush.y1 ?? ''}` : '';

/** The in-progress brush selection: a band across the plot, or a rectangle. */
export function BrushOverlay({ plot }: { plot: Rect }) {
  const { store } = useChart();
  const key = useStoreSelector(store, selectBrush);
  const b = key ? store.getState().brush : null;
  if (!b) return null;
  const [t, u] =
    b.y0 !== undefined && b.y1 !== undefined ? [b.y0, b.y1] : [plot.y, plot.y + plot.height];
  return (
    <rect
      className="jc-brush"
      x={Math.min(b.from, b.to)}
      y={Math.min(t, u)}
      width={Math.abs(b.to - b.from)}
      height={Math.abs(u - t)}
    />
  );
}
