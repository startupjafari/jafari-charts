/**
 * @jafari/charts-react — React components for Jafari Charts.
 */
export { ChartProvider, useChartConfig } from './providers/ChartProvider';
export type {
  ChartConfig,
  ChartProviderProps,
  AnimationOptions,
  Renderer,
} from './providers/ChartProvider';
export { useChart, useOptionalChart } from './providers/ChartContext';
export type {
  ActiveItem,
  ChartAdapter,
  ChartInstance,
  InteractionState,
  SeriesInfo,
  SwatchKind,
  TooltipData,
  TooltipRow,
} from './providers/ChartContext';

export { ChartView } from './components/ChartView';
export type { ChartViewProps, SurfaceHandlers } from './components/ChartView';
export { ChartStyles } from './components/ChartStyles';
export { ChartAxis, XAxis, YAxis } from './components/ChartAxis';
export type { ChartAxisProps, XAxisProps, YAxisProps } from './components/ChartAxis';
export { ChartGrid } from './components/ChartGrid';
export type { ChartGridProps } from './components/ChartGrid';
export { ChartCrosshair, ChartCursor } from './components/ChartCrosshair';
export type { ChartCrosshairProps } from './components/ChartCrosshair';
export { ChartTooltip } from './components/ChartTooltip';
export type { TooltipOptions } from './components/ChartTooltip';
export { ChartLegend } from './components/ChartLegend';
export type { LegendOptions } from './components/ChartLegend';
export { SeriesKey } from './components/SeriesKey';
export {
  ChartReferenceLine,
  ChartReferenceArea,
  ChartReferenceDot,
} from './components/ChartReference';
export type {
  ChartReferenceLineProps,
  ChartReferenceAreaProps,
  ChartReferenceDotProps,
} from './components/ChartReference';
export {
  ChartLabel,
  ChartGradient,
  ChartMarker,
  ChartAnnotation,
} from './components/ChartPrimitives';
export type {
  ChartLabelProps,
  ChartGradientProps,
  ChartMarkerProps,
  ChartAnnotationProps,
} from './components/ChartPrimitives';
export { ChartEmptyState, ChartLoadingState, ChartErrorState } from './components/ChartStates';
export { ChartDataTable } from './components/ChartA11y';
export type { DataTable } from './components/ChartA11y';
export { SeriesLayer, MarkList } from './primitives/SeriesLayer';
export { CanvasMarks } from './primitives/CanvasMarks';
export { TextLabels } from './primitives/TextLabels';

export { useChartRoot } from './internal/useChartRoot';
export type { BaseChartProps, ChartRoot } from './internal/useChartRoot';
export { useReducedMotion } from './hooks/useReducedMotion';
export { useStoreSelector } from './hooks/useStoreSelector';

export {
  LineChart,
  AreaChart,
  StackedAreaChart,
  BarChart,
  HorizontalBarChart,
  GroupedBarChart,
  StackedBarChart,
  ComboChart,
  Sparkline,
  WaterfallChart,
} from './charts/cartesian/charts';
export type {
  AreaChartProps,
  StackedAreaChartProps,
  BarChartProps,
  StackedBarChartProps,
  SparklineProps,
  WaterfallChartProps,
} from './charts/cartesian/charts';
export type {
  CartesianChartProps,
  SeriesConfig,
  XAxisOptions,
  YAxisOptions,
  GridOptions,
  CrosshairOptions,
  ChartItemEvent,
  BarOptions,
  ZoomOptions,
  DownsampleOptions,
} from './charts/cartesian/types';
