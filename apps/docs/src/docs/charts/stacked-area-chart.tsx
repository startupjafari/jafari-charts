import { StackedAreaChart } from '@jafari/charts';
import { activity } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const stackedAreaChart: ChartDoc = {
  slug: 'stacked-area-chart',
  component: 'StackedAreaChart',
  title: 'Stacked area chart',
  group: 'Professional',
  summary: 'Parts of a total over time, in absolute values or as a 100 % composition.',
  description: (
    <p>
      Series stack in order. When the input is large, all layers are downsampled with the same
      indices so their boundaries stay aligned. The tooltip lists every layer at the active date.
    </p>
  ),
  thumbnail: () => (
    <StackedAreaChart
      data={activity}
      xKey="date"
      series={[{ key: 'students' }, { key: 'teachers' }, { key: 'staff' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      { id: 'stacked-area-chart/Basic', title: 'Absolute' },
      {
        id: 'stacked-area-chart/Percent',
        title: 'Percent',
        description: (
          <p>
            <code>mode="percent"</code> normalises every x position to 100 %.
          </p>
        ),
      },
    ],
    styling: [
      {
        id: 'stacked-area-chart/Styling',
        title: 'Solid layers, colours, legend on top, sorted tooltip',
      },
      { id: 'stacked-area-chart/Stepped', title: 'Step curve without axes' },
    ],
    interaction: [
      {
        id: 'stacked-area-chart/Highlight',
        title: 'Highlight and toggle series',
        description: (
          <p>
            <code>highlightedSeries</code> fades the other layers; legend clicks update{' '}
            <code>hiddenSeries</code>.
          </p>
        ),
      },
    ],
    responsive: [{ id: 'stacked-area-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'stacked-area-chart/States', title: 'Empty state' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'StackedAreaChart props',
      props: [
        {
          name: 'mode',
          type: "'absolute' | 'percent'",
          default: "'absolute'",
          description: '`percent` normalises each x position to 100 %.',
        },
        {
          name: 'gradient',
          type: 'boolean',
          default: 'true',
          description: 'Gradient fill; `false` for flat layers.',
        },
      ],
    },
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
