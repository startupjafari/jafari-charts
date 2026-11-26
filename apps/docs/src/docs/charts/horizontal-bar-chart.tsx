import { HorizontalBarChart } from '@jafari/charts';
import { universities } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const horizontalBarChart: ChartDoc = {
  slug: 'horizontal-bar-chart',
  component: 'HorizontalBarChart',
  title: 'Horizontal bar chart',
  group: 'Core',
  summary: 'Rankings and comparisons with long category names, value labels included.',
  description: (
    <p>
      Categories run down the y axis, so long names stay readable (and are truncated with the full
      name in the tooltip). Value labels are on by default. The height grows with the number of rows
      — 32 px per row, between 160 and 560 px — unless you pass <code>height</code>.
    </p>
  ),
  thumbnail: () => (
    <HorizontalBarChart data={universities} xKey="name" yKey="score" {...THUMB} labels={false} />
  ),
  sections: {
    usage: [{ id: 'horizontal-bar-chart/Basic', title: 'Basic' }],
    styling: [
      { id: 'horizontal-bar-chart/Styling', title: 'Compact bars with formatted labels' },
      { id: 'horizontal-bar-chart/NoLabels', title: 'Without labels, vertical grid' },
    ],
    interaction: [{ id: 'horizontal-bar-chart/Interaction', title: 'Hover events' }],
    responsive: [{ id: 'horizontal-bar-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'horizontal-bar-chart/States', title: 'Empty state' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'HorizontalBarChart props',
      note: 'All BarChart props except `layout`.',
      props: [
        {
          name: 'height',
          type: 'number',
          default: 'rows × 32 + 40 (160–560)',
          description: 'Grows with the number of rows unless set.',
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: 'Value labels at bar ends.',
        },
        {
          name: 'stacked',
          type: "boolean | 'absolute' | 'percent'",
          default: 'false',
          description: 'Stack series horizontally.',
        },
      ],
    },
    barGroup,
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
