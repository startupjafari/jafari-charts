import { DonutChart } from '@jafari/charts';
import { roles } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup, PIE_PROPS } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const donutChart: ChartDoc = {
  slug: 'donut-chart',
  component: 'DonutChart',
  title: 'Donut chart',
  group: 'Core',
  summary: 'A ring with a centre readout: the total, or the hovered slice.',
  description: (
    <p>
      The donut replaces the tooltip with its centre: it shows the total at rest and the hovered or
      focused slice otherwise. All PieChart props apply; slice labels are off by default.
    </p>
  ),
  thumbnail: () => (
    <DonutChart data={roles} labelKey="role" valueKey="count" {...THUMB_POLAR} centerValue={null} />
  ),
  sections: {
    usage: [
      { id: 'donut-chart/Basic', title: 'Basic' },
      {
        id: 'donut-chart/Center',
        title: 'Custom centre content',
        description: (
          <p>
            <code>centerValue</code> and <code>centerLabel</code> accept nodes or functions of the
            active slice.
          </p>
        ),
      },
    ],
    styling: [
      { id: 'donut-chart/Styling', title: 'Thin ring, colours from data' },
      { id: 'donut-chart/HalfDonut', title: 'Half donut' },
    ],
    interaction: [{ id: 'donut-chart/Interaction', title: 'Controlled active slice' }],
    responsive: [{ id: 'donut-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'donut-chart/States', title: 'Loading placeholder' }],
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: 'DonutChart props',
      note: 'Everything from PieChart (below), plus:',
      props: [
        {
          name: 'thickness',
          type: 'number',
          default: '0.32',
          description: 'Ring thickness as a fraction of the radius (0.05–0.9).',
        },
        {
          name: 'centerValue',
          type: 'ReactNode | ((active: SliceEvent<T> | null) => ReactNode)',
          default: 'total / hovered value',
          description: 'Centre content. `null` hides the centre.',
        },
        {
          name: 'centerLabel',
          type: 'ReactNode | ((active: SliceEvent<T> | null) => ReactNode)',
          default: "'Total' / slice label",
          description: 'Caption under the centre value.',
        },
      ],
    },
    { title: 'PieChart props', props: PIE_PROPS, collapsed: true },
    baseGroup,
  ],
};
