import { Link } from '../lib/router';
import type { PropDef } from '../ui/PropsTable';
import type { PropGroup } from './types';

/**
 * Hand-written prop tables shared by several chart pages. Kept in sync with
 * `packages/react/src/internal/useChartRoot.ts` (BaseChartProps),
 * `packages/react/src/charts/cartesian/types.ts` and the chart components.
 */

export const BASE_PROPS: readonly PropDef[] = [
  {
    name: 'height',
    type: 'number',
    default: 'per chart',
    description:
      'Height of the chart surface including axes, px. The legend is added below. Defaults: 280 (cartesian), 260 (pie/donut), 200 (radial progress, gauge), 40 (sparkline).',
  },
  {
    name: 'width',
    type: 'number',
    description: 'Fixed width, px. Omit to fill the container and follow its resizes.',
  },
  {
    name: 'initialWidth',
    type: 'number',
    default: '640',
    description: 'Width assumed for server rendering before the container is measured.',
  },
  {
    name: 'theme',
    type: "'auto' | 'light' | 'dark' | Theme",
    default: "'auto'",
    description: (
      <>
        <code>auto</code> follows the host app (a <code>.dark</code> ancestor or its{' '}
        <code>color-scheme</code>). Pass a <code>createTheme()</code> result for custom tokens. See{' '}
        <Link to="/themes">Themes</Link>.
      </>
    ),
  },
  {
    name: 'locale',
    type: 'string',
    default: "'en'",
    description:
      'BCP 47 locale for numbers, dates and built-in texts ("en", "ru", "kk"…). Inherits from ChartProvider.',
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: 'Overrides for built-in texts (no data, loading, reset zoom…).',
  },
  {
    name: 'animation',
    type: 'boolean | AnimationOptions',
    default: 'true',
    description:
      '`false` disables all animation; `{ duration, easing, initial, maxComplexity }` tunes it. Reduced-motion preferences are always respected.',
  },
  {
    name: 'renderer',
    type: "'svg' | 'canvas' | 'auto'",
    default: "'svg'",
    description:
      'Rendering backend for data marks. Canvas is loaded lazily. `auto` switches to canvas only above a per-chart threshold measured in benchmarks.',
  },
  { name: 'className', type: 'string', description: 'Class added to the chart root (`.jc-root`).' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles for the chart root.' },
  { name: 'id', type: 'string', description: 'DOM id of the chart root.' },
  {
    name: 'title',
    type: 'string',
    default: "'Chart'",
    description: 'Accessible name of the chart (announced by screen readers).',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Extra accessible description appended to the automatic summary.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'With data: keeps the previous render dimmed. Without data: a static placeholder (no infinite animation).',
  },
  {
    name: 'error',
    type: 'boolean | ReactNode',
    description: 'Error state: `true` shows the default message, a node replaces it.',
  },
  {
    name: 'onRetry',
    type: '() => void',
    description: 'Adds a Retry button to the error state.',
  },
  {
    name: 'emptyMessage',
    type: 'ReactNode',
    default: "'No data'",
    description: 'Shown when there is nothing to plot. The chart keeps its height.',
  },
  {
    name: 'accessibilityTable',
    type: 'boolean | number',
    default: '≤ 60 rows',
    description:
      'Visually hidden data table for screen readers. `true` always, `false` never, a number sets the row limit.',
  },
];

export const CARTESIAN_PROPS: readonly PropDef[] = [
  { name: 'data', type: 'readonly T[]', required: true, description: 'Rows to plot.' },
  {
    name: 'xKey',
    type: 'DimensionKey<T>',
    required: true,
    description:
      "Field for the x axis: dates (`Date` or ISO string), numbers or categories. Numeric timestamps need `xAxis={{ type: 'time' }}`. Type-checked against `T`.",
  },
  {
    name: 'yKey',
    type: 'NumericKey<T>',
    description:
      'Single-series shortcut for `series={[{ key: yKey }]}`. If neither `yKey` nor `series` is given, the first numeric field is used (with a dev warning).',
  },
  {
    name: 'series',
    type: 'readonly SeriesConfig<T>[]',
    description: 'One entry per series; see the SeriesConfig table below.',
  },
  { name: 'color', type: 'string', description: 'Colour of the single-series shortcut.' },
  { name: 'label', type: 'string', description: 'Label of the single-series shortcut.' },
  {
    name: 'curve',
    type: "'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter'",
    default: "'monotone'",
    description: 'Line interpolation. Monotone never overshoots the data.',
  },
  {
    name: 'xAxis',
    type: 'boolean | XAxisOptions',
    default: 'true',
    description:
      '`false` hides the axis; options: `tickCount`, `format`, `type`, `utc`, `line`, `title`.',
  },
  {
    name: 'yAxis',
    type: 'boolean | YAxisOptions',
    default: 'true',
    description:
      '`false` hides the axis; options: `tickCount`, `format`, `min`, `max`, `includeZero`, `scale` (linear/log), `nice`, `title`.',
  },
  {
    name: 'y2Axis',
    type: 'boolean | YAxisOptions',
    description: "Secondary value axis used by series with `axis: 'right'`.",
  },
  {
    name: 'grid',
    type: 'boolean | { horizontal?: boolean; vertical?: boolean }',
    default: 'true',
    description: 'Hairline gridlines; horizontal by default.',
  },
  {
    name: 'tooltip',
    type: 'boolean | TooltipOptions',
    default: 'true',
    description:
      "Shared tooltip by default. Options: `mode` ('shared' | 'item'), `render`, `sort`, `hideEmpty`, `offset`.",
  },
  {
    name: 'legend',
    type: 'boolean | LegendOptions',
    default: '2+ series',
    description:
      "Shown automatically for two or more series. Options: `position` ('top' | 'bottom'), `align`, `interactive`, `render`.",
  },
  {
    name: 'crosshair',
    type: 'boolean | { horizontal?: boolean }',
    default: 'true (lines/areas)',
    description: 'Vertical hairline at the active x. Bar charts use a soft band (cursor) instead.',
  },
  { name: 'dots', type: 'boolean', default: 'false', description: 'Markers on every point.' },
  {
    name: 'differentiate',
    type: 'boolean',
    default: 'false',
    description:
      'Distinct marker shapes and dash patterns per series, so identity never relies on colour alone.',
  },
  {
    name: 'valueFormatter',
    type: '(value: number, series: string) => string',
    description: 'Formats values in tooltips, labels and the data table.',
  },
  {
    name: 'xFormatter',
    type: '(value: AxisValue) => string',
    description: 'Formats x values in tooltips and the data table.',
  },
  {
    name: 'hiddenSeries',
    type: 'readonly string[]',
    description: 'Controlled list of hidden series keys (legend toggling).',
  },
  {
    name: 'defaultHiddenSeries',
    type: 'readonly string[]',
    default: '[]',
    description: 'Initially hidden series (uncontrolled).',
  },
  {
    name: 'onHiddenSeriesChange',
    type: '(hidden: string[]) => void',
    description: 'Called when the legend toggles a series.',
  },
  {
    name: 'activeIndex',
    type: 'number | null',
    description: 'Controlled active data index (`null` = none).',
  },
  {
    name: 'onActiveIndexChange',
    type: '(index: number | null) => void',
    description: 'Called when the active index changes (pointer, touch or keyboard).',
  },
  {
    name: 'onHover',
    type: '(event: ChartItemEvent<T> | null) => void',
    description: 'Hover callback with the datum, index, series, value and x.',
  },
  {
    name: 'onClick',
    type: '(event: ChartItemEvent<T>) => void',
    description: 'Click (or Enter/Space on the focused item).',
  },
  {
    name: 'downsample',
    type: "false | { method?: 'lttb' | 'minmax'; threshold?: number }",
    default: 'LTTB, 2 × plot width',
    description: 'Line/area downsampling for large inputs. `false` draws every point.',
  },
  {
    name: 'zoom',
    type: "boolean | { wheel?: boolean | 'ctrl'; minSpan?: number }",
    default: 'false',
    description:
      'Zoom & pan along continuous x axes: Ctrl/⌘ + wheel or pinch, drag to pan, double-click or 0 to reset, +/− on the keyboard.',
  },
  {
    name: 'xDomain',
    type: 'readonly [number, number] | null',
    description: 'Controlled visible x range (timestamps or numbers).',
  },
  {
    name: 'onXDomainChange',
    type: '(domain: readonly [number, number] | null) => void',
    description: 'Called when zooming or panning changes the visible range.',
  },
  {
    name: 'brush',
    type: 'boolean',
    default: 'false',
    description: 'Drag to select an x range. Combined with `zoom`, the selection zooms in.',
  },
  {
    name: 'onBrush',
    type: '(range: { from: AxisValue; to: AxisValue; startIndex: number; endIndex: number }) => void',
    description: 'Called with the selected range when a brush gesture ends.',
  },
  {
    name: 'syncId',
    type: 'string',
    description: 'Charts with the same id share the crosshair and tooltip.',
  },
  {
    name: 'highlightedSeries',
    type: 'string | null',
    description: 'Controlled emphasis of one series; the others fade. `null` clears it.',
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: 'Primitives drawn above the data (reference lines, areas, annotations…).',
  },
];

export const SERIES_CONFIG_PROPS: readonly PropDef[] = [
  {
    name: 'key',
    type: 'NumericKey<T>',
    required: true,
    description: 'Field holding the series values; must be numeric in `T`.',
  },
  { name: 'label', type: 'string', default: 'key', description: 'Name in legend and tooltip.' },
  {
    name: 'color',
    type: 'string',
    default: 'theme slot',
    description: 'Any CSS colour, including `var(--jc-series-3)`.',
  },
  {
    name: 'type',
    type: "'line' | 'area' | 'bar'",
    description: 'Mark type for this series (ComboChart).',
  },
  { name: 'curve', type: 'CurveType', description: 'Per-series interpolation.' },
  { name: 'dashed', type: 'boolean', description: 'Dashed line.' },
  {
    name: 'axis',
    type: "'left' | 'right'",
    default: "'left'",
    description: '`right` plots the series on a secondary axis (`y2Axis`).',
  },
  { name: 'stackId', type: 'string', description: 'Series with the same id are stacked.' },
  { name: 'dots', type: 'boolean', description: 'Markers on this series.' },
  {
    name: 'symbol',
    type: "'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star'",
    description: 'Marker shape.',
  },
  {
    name: 'format',
    type: '(value: number) => string',
    description: "Formats this series' values in tooltips and labels.",
  },
];

export const BAR_OPTION_PROPS: readonly PropDef[] = [
  {
    name: 'barRadius',
    type: 'number',
    default: '4',
    description: "Corner radius of the bar's data end, px.",
  },
  { name: 'maxBarSize', type: 'number', default: '24', description: 'Maximum bar thickness, px.' },
  { name: 'barGap', type: 'number', default: '2', description: 'Gap between touching bars, px.' },
  {
    name: 'categoryGap',
    type: 'number',
    default: '0.3',
    description: 'Space between categories as a fraction of the category width (0–1).',
  },
  {
    name: 'labels',
    type: 'boolean',
    default: 'false',
    description: 'Value labels at bar ends (on by default for horizontal bars and waterfalls).',
  },
];

export const PIE_PROPS: readonly PropDef[] = [
  { name: 'data', type: 'readonly T[]', required: true, description: 'One row per slice.' },
  {
    name: 'labelKey',
    type: 'KeysMatching<T, string | number>',
    required: true,
    description: 'Field naming each slice.',
  },
  {
    name: 'valueKey',
    type: 'NumericKey<T>',
    required: true,
    description: "Field holding each slice's value.",
  },
  {
    name: 'colorKey',
    type: 'KeysMatching<T, string>',
    description: 'Field with a CSS colour per slice.',
  },
  {
    name: 'colors',
    type: 'readonly string[]',
    description: 'Colours by slice position (overrides the theme palette).',
  },
  { name: 'sort', type: 'boolean', default: 'false', description: 'Largest slice first.' },
  {
    name: 'labels',
    type: "boolean | 'inside' | 'outside'",
    default: "'inside' (pie), off (donut)",
    description: 'Percent labels inside slices (when they fit) or outside with leader lines.',
  },
  {
    name: 'valueFormatter',
    type: '(value: number) => string',
    description: 'Formats values in tooltips, the centre and the data table.',
  },
  {
    name: 'labelFormatter',
    type: '(value: number, share: number) => string',
    description: 'Formats slice labels.',
  },
  {
    name: 'tooltip',
    type: 'boolean | TooltipOptions',
    default: 'true (pie), false (donut)',
    description: 'The donut shows the hovered slice in its centre instead.',
  },
  {
    name: 'legend',
    type: 'boolean | LegendOptions',
    default: 'true',
    description: 'Legend with percentages; items toggle slices.',
  },
  { name: 'gap', type: 'number', default: '2', description: 'Gap between slices, px.' },
  { name: 'cornerRadius', type: 'number', description: 'Rounded slice corners, px.' },
  {
    name: 'startAngle',
    type: 'number',
    default: '0',
    description: "Start angle in degrees, clockwise from 12 o'clock.",
  },
  { name: 'endAngle', type: 'number', default: '360', description: 'End angle in degrees.' },
  {
    name: 'hiddenSeries',
    type: 'readonly string[]',
    description: 'Controlled hidden slices (by label).',
  },
  {
    name: 'defaultHiddenSeries',
    type: 'readonly string[]',
    description: 'Initially hidden slices.',
  },
  {
    name: 'onHiddenSeriesChange',
    type: '(hidden: string[]) => void',
    description: 'Called when the legend toggles a slice.',
  },
  {
    name: 'activeIndex',
    type: 'number | null',
    description: 'Controlled active slice (index into `data`).',
  },
  {
    name: 'onActiveIndexChange',
    type: '(index: number | null) => void',
    description: 'Called when the active slice changes.',
  },
  {
    name: 'onHover',
    type: '(event: SliceEvent<T> | null) => void',
    description: 'Hover callback with datum, index, label, value and share (0–1).',
  },
  {
    name: 'onClick',
    type: '(event: SliceEvent<T>) => void',
    description: 'Click (or Enter on the focused slice).',
  },
];

export const baseGroup: PropGroup = {
  title: 'Common props (BaseChartProps)',
  note: (
    <>
      Shared by every chart. Defaults for <code>theme</code>, <code>locale</code>,{' '}
      <code>animation</code> and <code>renderer</code> can be set once with{' '}
      <Link to="/components" section="chart-provider">
        ChartProvider
      </Link>
      .
    </>
  ),
  props: BASE_PROPS,
  collapsed: true,
};

export const cartesianGroup: PropGroup = {
  title: 'Cartesian props',
  note: 'Shared by Line, Area, Stacked Area, Bar, Horizontal Bar, Grouped Bar, Stacked Bar, Combo, Waterfall and Sparkline.',
  props: CARTESIAN_PROPS,
  collapsed: true,
};

export const seriesGroup: PropGroup = {
  title: 'SeriesConfig',
  note: 'Entries of the `series` prop.',
  props: SERIES_CONFIG_PROPS,
  collapsed: true,
};

export const barGroup: PropGroup = {
  title: 'Bar options',
  props: BAR_OPTION_PROPS,
};
