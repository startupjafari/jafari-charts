import { HeatmapChart } from '@jafari/charts';
import { sessionsByHour } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const heatmapChart: ChartDoc = {
  slug: 'heatmap-chart',
  component: 'HeatmapChart',
  title: 'Heatmap',
  group: 'Advanced',
  summary: 'A value for every pair of two categories, as a grid of coloured cells.',
  description: (
    <p>
      Columns come from <code>xKey</code>, rows from <code>yKey</code>; several rows for the same
      cell are summed and missing cells use the track colour. Values are quantised into colour steps
      (5 by default) on a sequential scale, or a diverging scale for signed data. All cells of a
      colour step are drawn as one path, so a large grid stays a handful of DOM nodes.
    </p>
  ),
  thumbnail: () => (
    <HeatmapChart
      data={sessionsByHour}
      xKey="hour"
      yKey="day"
      valueKey="sessions"
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      { id: 'heatmap-chart/Basic', title: 'Sequential scale' },
      { id: 'heatmap-chart/Diverging', title: 'Diverging scale with labels' },
    ],
    styling: [{ id: 'heatmap-chart/Styling', title: 'Colour ramp, thresholds, gaps and radius' }],
    interaction: [{ id: 'heatmap-chart/Interaction', title: 'Click a cell' }],
    responsive: [{ id: 'heatmap-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'heatmap-chart/States', title: 'Empty state' }],
  },
  keyboard: [
    ['← →', 'Previous / next column'],
    ['↑ ↓', 'Previous / next row'],
    ['Home End', 'First / last cell'],
    ['Enter', 'Click the active cell (onClick)'],
    ['Esc', 'Clear the active cell'],
  ],
  props: [
    {
      title: 'HeatmapChart props',
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: 'One row per cell (duplicates are summed).',
        },
        {
          name: 'xKey',
          type: 'DimensionKey<T>',
          required: true,
          description: 'Column category (strings, numbers or dates).',
        },
        { name: 'yKey', type: 'DimensionKey<T>', required: true, description: 'Row category.' },
        { name: 'valueKey', type: 'NumericKey<T>', required: true, description: 'Cell value.' },
        {
          name: 'xCategories / yCategories',
          type: 'readonly AxisValue[]',
          description:
            'Column/row order and empty columns/rows (default: first appearance; numbers and dates sort).',
        },
        {
          name: 'colorScale',
          type: "'sequential' | 'diverging'",
          default: "'sequential'",
          description: 'One hue, or two hues around `midpoint`.',
        },
        { name: 'buckets', type: 'number', default: '5', description: 'Number of colour steps.' },
        {
          name: 'thresholds',
          type: 'readonly number[]',
          description: 'Explicit ascending step boundaries (n thresholds → n + 1 steps).',
        },
        {
          name: 'domain',
          type: 'readonly [number, number]',
          default: 'data extent',
          description: 'Value domain of the colour scale.',
        },
        {
          name: 'midpoint',
          type: 'number',
          default: '0',
          description: 'Neutral value of the diverging scale.',
        },
        { name: 'color', type: 'string', default: 'series 1', description: 'Sequential hue.' },
        { name: 'negativeColor / positiveColor', type: 'string', description: 'Diverging hues.' },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: 'Concrete colour ramp, low → high.',
        },
        {
          name: 'emptyColor',
          type: 'string',
          default: 'track token',
          description: 'Fill of missing cells.',
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'false',
          description: 'Value labels inside cells where they fit.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats values.',
        },
        {
          name: 'xFormatter / yFormatter',
          type: '(value: AxisValue) => string',
          description: 'Formats category labels.',
        },
        {
          name: 'valueLabel',
          type: 'string',
          default: "'Value'",
          description: 'Name of the value in tooltips.',
        },
        { name: 'gap', type: 'number', default: '2', description: 'Gap between cells, px.' },
        { name: 'cornerRadius', type: 'number', description: 'Cell corner radius, px.' },
        {
          name: 'xAxis / yAxis',
          type: 'boolean | { hidden?; maxLabelWidth?; title? }',
          default: 'true',
          description: 'Category axes; long labels are truncated.',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: 'Cell tooltip.',
        },
        {
          name: 'legend',
          type: "boolean | Omit<LegendOptions, 'render' | 'interactive'>",
          default: 'true',
          description: 'Colour-scale legend.',
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: 'Controlled active datum index.',
        },
        {
          name: 'onHover / onClick',
          type: '(event: HeatmapCellEvent<T>) => void',
          description: 'Event with `datum`, `x`, `y`, labels, indices and `value`.',
        },
      ],
    },
    baseGroup,
  ],
};
