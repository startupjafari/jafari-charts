import { AreaChart } from '@jafari/charts';
import { dailyUsers } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const areaChart: ChartDoc = {
  slug: 'area-chart',
  component: 'AreaChart',
  title: 'Area chart',
  group: 'Core',
  summary: 'A line with a soft gradient fill — volume over time, at a glance.',
  description: (
    <p>
      The fill fades towards the baseline so overlapping series stay readable. Areas always grow
      from zero, including below it for negative values. Everything a <code>LineChart</code> accepts
      works here too, plus <code>gradient</code>.
    </p>
  ),
  thumbnail: () => <AreaChart data={dailyUsers} xKey="date" yKey="users" {...THUMB} />,
  sections: {
    usage: [
      { id: 'area-chart/Basic', title: 'Basic' },
      {
        id: 'area-chart/MultiSeries',
        title: 'Overlapping series',
        description: <p>Series are drawn in order; the gradient keeps the back series visible.</p>,
      },
      { id: 'area-chart/Negative', title: 'Negative values and gaps' },
    ],
    styling: [
      {
        id: 'area-chart/Solid',
        title: 'Solid fill, linear curve, markers',
        description: (
          <p>
            <code>gradient={'{false}'}</code> uses a flat translucent fill.
          </p>
        ),
      },
      { id: 'area-chart/Step', title: 'Step curve with a fixed value range' },
    ],
    interaction: [
      {
        id: 'area-chart/Brush',
        title: 'Brush selection',
        description: (
          <p>
            <code>brush</code> lets users drag a range; <code>onBrush</code> receives the range and
            the first/last data index.
          </p>
        ),
      },
    ],
    responsive: [{ id: 'area-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'area-chart/States', title: 'Empty, loading and error' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'AreaChart props',
      props: [
        {
          name: 'gradient',
          type: 'boolean',
          default: 'true',
          description: 'Gradient fill fading towards the baseline; `false` for a flat fill.',
        },
      ],
    },
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
