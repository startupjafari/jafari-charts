import { ComboChart } from '@jafari/charts';
import { revenue } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const comboChart: ChartDoc = {
  slug: 'combo-chart',
  component: 'ComboChart',
  title: 'Combo chart',
  group: 'Professional',
  summary: 'Bars, lines and areas on one plot, with an optional secondary axis.',
  description: (
    <p>
      Each series picks its mark with <code>type</code> (series without a type are bars). A series
      with <code>axis: 'right'</code> gets a secondary value axis; there is no dual axis unless a
      series opts in, because two scales on one plot are easy to misread.
    </p>
  ),
  thumbnail: () => (
    <ComboChart
      data={revenue}
      xKey="month"
      series={[
        { key: 'revenue', type: 'bar' },
        { key: 'margin', type: 'line', axis: 'right' },
      ]}
      {...THUMB}
      y2Axis={false}
    />
  ),
  sections: {
    usage: [
      { id: 'combo-chart/Basic', title: 'Bars with a line on a secondary axis' },
      { id: 'combo-chart/Mixed', title: 'Area, bar and line together' },
    ],
    styling: [
      { id: 'combo-chart/Styling', title: 'Colours, bar shape and a reference line' },
      { id: 'combo-chart/Stacked', title: 'Stacked bars with a line' },
    ],
    interaction: [{ id: 'combo-chart/Interaction', title: 'Item tooltip and clicks' }],
    responsive: [{ id: 'combo-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [
      {
        id: 'combo-chart/States',
        title: 'Loading with data',
        description: (
          <p>
            With data present, <code>loading</code> dims the previous render instead of flashing a
            skeleton.
          </p>
        ),
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'ComboChart props',
      note: 'ComboChart takes the cartesian props plus bar options. Series-level `type` and `axis` do the work.',
      props: [
        {
          name: 'series[].type',
          type: "'line' | 'area' | 'bar'",
          default: "'bar'",
          description: 'Mark type of each series.',
        },
        {
          name: 'series[].axis',
          type: "'left' | 'right'",
          default: "'left'",
          description: '`right` plots the series on the secondary axis.',
        },
        {
          name: 'y2Axis',
          type: 'boolean | YAxisOptions',
          description: 'Options of the secondary axis (format, min, max, title…).',
        },
      ],
    },
    barGroup,
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
