import { GroupedBarChart } from '@jafari/charts';
import { complaints } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const groupedBarChart: ChartDoc = {
  slug: 'grouped-bar-chart',
  component: 'GroupedBarChart',
  title: 'Grouped bar chart',
  group: 'Core',
  summary: 'Several series side by side within each category.',
  description: (
    <p>
      Bars of one category touch with a small <code>barGap</code>; categories are separated by{' '}
      <code>categoryGap</code>. The legend toggles series and the remaining bars widen to fill the
      group.
    </p>
  ),
  thumbnail: () => (
    <GroupedBarChart
      data={complaints}
      xKey="category"
      series={[{ key: 'open' }, { key: 'resolved' }, { key: 'rejected' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      { id: 'grouped-bar-chart/Basic', title: 'Basic' },
      { id: 'grouped-bar-chart/Horizontal', title: 'Horizontal layout' },
    ],
    styling: [
      { id: 'grouped-bar-chart/Styling', title: 'Gaps, sizes and colours' },
      { id: 'grouped-bar-chart/Labels', title: 'Labels instead of an axis' },
    ],
    interaction: [
      {
        id: 'grouped-bar-chart/Legend',
        title: 'Legend toggling and item tooltips',
        description: (
          <p>
            <code>defaultHiddenSeries</code> starts with a series hidden;{' '}
            <code>tooltip={'{{ mode: "item" }}'}</code> shows only the bar under the pointer.
          </p>
        ),
      },
    ],
    responsive: [{ id: 'grouped-bar-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'grouped-bar-chart/States', title: 'Error with retry' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'GroupedBarChart props',
      note: 'All BarChart props except `stacked`.',
      props: [
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
