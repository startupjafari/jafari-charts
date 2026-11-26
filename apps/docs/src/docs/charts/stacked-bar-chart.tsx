import { StackedBarChart } from '@jafari/charts';
import { registrations } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const stackedBarChart: ChartDoc = {
  slug: 'stacked-bar-chart',
  component: 'StackedBarChart',
  title: 'Stacked bar chart',
  group: 'Core',
  summary: 'Cumulative bars in absolute or percent mode; mixed signs stack both ways.',
  description: (
    <p>
      Segments are separated by a thin surface gap and only the outermost segment gets rounded
      corners. Positive values stack upwards and negative values downwards from zero, so a balance
      of income and expenses reads correctly.
    </p>
  ),
  thumbnail: () => (
    <StackedBarChart
      data={registrations}
      xKey="month"
      series={[{ key: 'students' }, { key: 'teachers' }, { key: 'admins' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      { id: 'stacked-bar-chart/Basic', title: 'Absolute' },
      { id: 'stacked-bar-chart/Percent', title: 'Percent' },
      { id: 'stacked-bar-chart/MixedSign', title: 'Positive and negative parts' },
    ],
    styling: [
      { id: 'stacked-bar-chart/Styling', title: 'Colours, radius and spacing' },
      { id: 'stacked-bar-chart/Horizontal', title: 'Horizontal layout' },
    ],
    interaction: [
      {
        id: 'stacked-bar-chart/CustomTooltip',
        title: 'Custom tooltip with a total',
        description: (
          <p>
            <code>tooltip.render</code> receives the formatted rows and the active item;{' '}
            <code>sort: 'desc'</code> orders rows by value.
          </p>
        ),
      },
    ],
    responsive: [{ id: 'stacked-bar-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'stacked-bar-chart/States', title: 'Empty state' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'StackedBarChart props',
      note: 'All BarChart props except `stacked`.',
      props: [
        {
          name: 'mode',
          type: "'absolute' | 'percent'",
          default: "'absolute'",
          description: '`percent` normalises each category to 100 %.',
        },
        {
          name: 'layout',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: '`horizontal` draws categories on the y axis.',
        },
      ],
    },
    barGroup,
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
