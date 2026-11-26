import type {
  CartesianFrame,
  ChartMessages,
  Mark,
  Rect,
  Store,
  SymbolShape,
} from '@jafari/charts-core';
import { createContext, useContext, type ReactNode } from 'react';

/** The item under the pointer or keyboard focus. */
export interface ActiveItem {
  /** Position along the primary dimension (sorted x, slice index, cell index…). */
  position: number;
  /** Series index, or -1 when the whole position is active (shared tooltips). */
  series: number;
  /** Pixel anchor for tooltips. */
  x: number;
  y: number;
}

export interface InteractionState {
  active: ActiveItem | null;
  /** How `active` was set: keyboard focus announces values to screen readers. */
  source: 'pointer' | 'keyboard' | 'touch' | 'controlled' | 'sync' | null;
  /** Pointer position in chart pixels (for crosshair labels). */
  pointer: { x: number; y: number } | null;
  /** Series emphasised from the legend. */
  highlight: number | null;
  /** In-progress brush selection in pixels along x. */
  brush: { from: number; to: number } | null;
}

export type SwatchKind = 'line' | 'area' | 'bar' | 'point' | 'slice';

export interface SeriesInfo {
  id: string;
  label: string;
  color: string;
  kind: SwatchKind;
  symbol: SymbolShape;
  dash?: string;
  visible: boolean;
  /** Optional value shown next to the legend label (pie/donut). */
  value?: string;
}

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
  kind: SwatchKind;
  symbol?: SymbolShape;
  dash?: string;
  active?: boolean;
}

export interface TooltipData {
  title: string;
  rows: TooltipRow[];
  footer?: string;
}

/** Everything a chart type contributes to the shared interaction layer. */
export interface ChartAdapter {
  /** Static data marks. */
  marks: Mark[];
  hitTest(x: number, y: number): ActiveItem | null;
  tooltip(active: ActiveItem): TooltipData | null;
  /** Marks redrawn on top to emphasise the active item (dims the rest when non-empty). */
  activeMarks(active: ActiveItem): Mark[];
  /** Keyboard navigation. */
  move(
    active: ActiveItem | null,
    key: 'next' | 'prev' | 'first' | 'last' | 'up' | 'down',
  ): ActiveItem | null;
  /** Item for a controlled position (`activeIndex` prop). */
  itemAt(position: number, series?: number): ActiveItem | null;
  /** Total number of data points (for the accessible description). */
  pointCount: number;
  /** Value shared with synchronised charts (`syncId`), e.g. the x value. */
  syncKey?(active: ActiveItem): string | number | null;
  /** Item matching a value published by a synchronised chart. */
  fromSyncKey?(key: string | number): ActiveItem | null;
}

export interface ChartInstance {
  id: string;
  width: number;
  height: number;
  plot: Rect;
  /** Present for cartesian charts. */
  frame: CartesianFrame | null;
  store: Store<InteractionState>;
  locale: string;
  messages: ChartMessages;
  series: SeriesInfo[];
  toggleSeries(id: string): void;
  adapter: ChartAdapter;
  renderer: 'svg' | 'canvas';
  /** True when the user prefers reduced motion or animation is disabled. */
  reducedMotion: boolean;
}

const ChartInstanceContext = createContext<ChartInstance | null>(null);

export function ChartInstanceProvider({
  value,
  children,
}: {
  value: ChartInstance;
  children?: ReactNode;
}) {
  return <ChartInstanceContext.Provider value={value}>{children}</ChartInstanceContext.Provider>;
}

/** Access the surrounding chart (scales, plot area, interaction store, series). */
export function useChart(): ChartInstance {
  const ctx = useContext(ChartInstanceContext);
  if (!ctx) throw new Error('Jafari Charts primitives must be rendered inside a chart component.');
  return ctx;
}

/** Like `useChart` but returns null outside a chart (for primitives with explicit props). */
export function useOptionalChart(): ChartInstance | null {
  return useContext(ChartInstanceContext);
}
