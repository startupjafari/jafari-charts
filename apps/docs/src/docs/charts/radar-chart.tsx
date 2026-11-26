import { RadarChart } from '@jafari/charts';
import { profiles } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const radarChart: ChartDoc = {
  slug: 'radar-chart',
  component: 'RadarChart',
  title: 'Radar chart',
  group: 'Advanced',
  summary: 'Compare a few profiles across several metrics on radial spokes.',
  description: (
    <p>
      Each data row is a metric (a spoke); each entry of <code>series</code> is a dataset drawn as a
      polygon. Rings sit at nice values; the scale starts at zero unless values are negative.
      Hovering a spoke shows every dataset’s value for that metric.
    </p>
  ),
  thumbnail: () => (
    <RadarChart
      data={profiles}
      labelKey="metric"
      series={[{ key: 'north' }, { key: 'south' }]}
      height={120}
      ticks={false}
      dots={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      { id: 'radar-chart/Basic', title: 'One dataset' },
      { id: 'radar-chart/Compare', title: 'Comparing datasets' },
    ],
    styling: [{ id: 'radar-chart/Styling', title: 'Circular grid, fills, shapes and start angle' }],
    interaction: [{ id: 'radar-chart/Interaction', title: 'Controlled active metric' }],
    responsive: [{ id: 'radar-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'radar-chart/States', title: 'Loading' }],
  },
  keyboard: [
    ['← →', 'Previous / next metric (spoke)'],
    ['↑ ↓', 'Focus one dataset at the metric'],
    ['Home End', 'First / last metric'],
    ['Enter', 'Click (onClick)'],
    ['Esc', 'Clear'],
  ],
  props: [
    {
      title: 'RadarChart props',
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: 'One row per metric (spoke).',
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          required: true,
          description: 'Field naming each metric.',
        },
        {
          name: 'series',
          type: 'readonly { key; label?; color?; symbol?; format? }[]',
          required: true,
          description: 'Datasets drawn as polygons.',
        },
        {
          name: 'min',
          type: 'number',
          default: '0',
          description: 'Value at the centre (a nice minimum for negative data).',
        },
        {
          name: 'max',
          type: 'number',
          default: 'nice maximum',
          description: 'Value at the outer ring.',
        },
        {
          name: 'levels',
          type: 'number',
          default: '4–5 nice rings',
          description: 'Number of grid rings.',
        },
        {
          name: 'shape',
          type: "'polygon' | 'circle'",
          default: "'polygon'",
          description: 'Grid ring shape.',
        },
        { name: 'dots', type: 'boolean', default: 'true', description: 'Markers on every vertex.' },
        {
          name: 'fillOpacity',
          type: 'number',
          default: '0.14',
          description: 'Polygon fill opacity.',
        },
        {
          name: 'startAngle',
          type: 'number',
          default: '0',
          description: "Angle of the first spoke, degrees clockwise from 12 o'clock.",
        },
        {
          name: 'ticks',
          type: 'boolean',
          default: 'true',
          description: 'Value labels along the first spoke.',
        },
        {
          name: 'tickFormatter',
          type: '(value: number) => string',
          description: 'Formats ring labels.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number, series: string) => string',
          description: 'Formats values in tooltips and the table.',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: 'Tooltip per metric.',
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: '2+ datasets',
          description: 'Legend; items toggle datasets.',
        },
        {
          name: 'differentiate',
          type: 'boolean',
          default: 'false',
          description: 'Marker shapes and dash patterns per dataset.',
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: 'Controlled or initial hidden datasets.',
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: 'Controlled active metric index.',
        },
        {
          name: 'onHover / onClick',
          type: '(event: RadarEvent<T>) => void',
          description: 'Event with `datum`, `index`, `label`, `series`, `value`.',
        },
      ],
    },
    baseGroup,
  ],
};
