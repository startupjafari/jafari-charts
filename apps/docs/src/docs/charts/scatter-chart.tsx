import { ScatterChart } from '@jafari/charts';
import { cohort } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const scatterChart: ChartDoc = {
  slug: 'scatter-chart',
  component: 'ScatterChart',
  title: 'Scatter chart',
  group: 'Advanced',
  summary: 'Relationships between two numeric measures, with groups and bubble sizes.',
  description: (
    <>
      <p>
        Both axes are continuous. Points can be split into groups by a field (<code>groupKey</code>,
        long data) or by several y fields (<code>series</code>, wide data); <code>sizeKey</code>{' '}
        turns the chart into a bubble chart whose bubble <em>area</em> is proportional to the value.
      </p>
      <p>
        Hit testing uses a k-d tree, so hovering stays fast with 100 000 points. With{' '}
        <code>renderer="auto"</code> the chart draws on a canvas above 75 000 points — the crossover
        measured for scatter plots.
      </p>
    </>
  ),
  thumbnail: () => (
    <ScatterChart
      data={cohort}
      xKey="hours"
      yKey="grade"
      groupKey="faculty"
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
      pointSize={5}
    />
  ),
  sections: {
    usage: [
      { id: 'scatter-chart/Basic', title: 'Basic' },
      { id: 'scatter-chart/Groups', title: 'Groups from a field' },
      { id: 'scatter-chart/Bubbles', title: 'Bubbles' },
      { id: 'scatter-chart/ManyPoints', title: '100 000 points' },
    ],
    styling: [
      { id: 'scatter-chart/Styling', title: 'Shapes, colours, opacity, axes and a reference line' },
    ],
    interaction: [{ id: 'scatter-chart/Interaction', title: 'Clicks and legend toggling' }],
    responsive: [{ id: 'scatter-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'scatter-chart/States', title: 'Empty state' }],
  },
  keyboard: [
    ['← →', 'Previous / next point (in x order) within the group'],
    ['↑ ↓', 'Previous / next group'],
    ['Home End', 'First / last point of the group'],
    ['Enter', 'Click the active point (onClick)'],
    ['Esc', 'Clear the active point'],
  ],
  props: [
    {
      title: 'ScatterChart props',
      props: [
        { name: 'data', type: 'readonly T[]', required: true, description: 'One row per point.' },
        {
          name: 'xKey',
          type: 'NumericKey<T>',
          required: true,
          description: 'Numeric field for the horizontal axis.',
        },
        {
          name: 'yKey',
          type: 'NumericKey<T>',
          description:
            'Numeric field for the vertical axis (single group, or split by `groupKey`).',
        },
        {
          name: 'groupKey',
          type: 'KeysMatching<T, string | number | boolean>',
          description: 'Field whose distinct values split the points into groups (long data).',
        },
        {
          name: 'series',
          type: 'readonly { key; label?; color?; symbol? }[]',
          description:
            'Several y fields, each drawn as a group (wide data). Overrides `yKey`/`groupKey`.',
        },
        {
          name: 'sizeKey',
          type: 'NumericKey<T>',
          description: 'Bubble size; bubble area is proportional to the value.',
        },
        {
          name: 'colorKey',
          type: 'KeysMatching<T, string>',
          description: 'CSS colour per point (overrides the group colour).',
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          description: 'Names each point (tooltip title, data table).',
        },
        { name: 'color', type: 'string', description: 'Colour of the single group.' },
        { name: 'colors', type: 'readonly string[]', description: 'Colours by group order.' },
        { name: 'label', type: 'string', description: 'Name of the single group.' },
        {
          name: 'xLabel / yLabel / sizeLabel',
          type: 'string',
          description: 'Names of the fields in tooltips and the data table.',
        },
        {
          name: 'pointSize',
          type: 'number',
          default: '8 (smaller for thousands)',
          description: 'Marker diameter, px.',
        },
        {
          name: 'minRadius / maxRadius',
          type: 'number',
          default: '3 / auto (10–26)',
          description: 'Bubble radius range, px.',
        },
        {
          name: 'opacity',
          type: 'number',
          default: '1 (bubbles 0.78)',
          description: 'Marker fill opacity.',
        },
        {
          name: 'hitRadius',
          type: 'number',
          default: '24',
          description: 'Hover target radius around a point, px (bubbles: their area).',
        },
        {
          name: 'xAxis / yAxis',
          type: 'boolean | ScatterChartAxisOptions',
          default: 'true',
          description: 'YAxisOptions (`min`, `max`, `scale`, `format`, `title`…) plus `line`.',
        },
        {
          name: 'grid',
          type: 'boolean | { horizontal?; vertical? }',
          default: 'true',
          description: 'Gridlines.',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: 'Item tooltip with x, y (and size).',
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: '2+ groups',
          description: 'Legend; items toggle groups.',
        },
        {
          name: 'differentiate',
          type: 'boolean',
          default: 'false',
          description: 'Distinct marker shapes per group.',
        },
        {
          name: 'xFormatter / yFormatter / sizeFormatter',
          type: '(value: number) => string',
          description: 'Value formatting.',
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: 'Controlled or initial hidden groups.',
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: 'Controlled active data index.',
        },
        {
          name: 'onHover / onClick',
          type: '(event: ScatterPointEvent<T>) => void',
          description: 'Event with `datum`, `index`, `series`, `x`, `y`, `size`.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Primitives such as `ChartReferenceLine`.',
        },
      ],
    },
    baseGroup,
  ],
};
