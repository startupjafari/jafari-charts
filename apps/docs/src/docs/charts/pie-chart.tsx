import { PieChart } from '@jafari/charts';
import { devices } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup, PIE_PROPS } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const pieChart: ChartDoc = {
  slug: 'pie-chart',
  component: 'PieChart',
  title: 'Pie chart',
  group: 'Core',
  summary: 'Part-to-whole for a handful of categories, with percentage labels.',
  description: (
    <p>
      Slices keep a small gap and rounded corners; percentage labels appear inside slices large
      enough to hold them, or outside with leader lines. Tiny shares read “&lt;1%” instead of “0%”.
      The legend shows each slice’s share and toggles slices. For more than five or six categories a
      bar chart is usually easier to read.
    </p>
  ),
  thumbnail: () => (
    <PieChart data={devices} labelKey="device" valueKey="share" {...THUMB_POLAR} labels={false} />
  ),
  sections: {
    usage: [
      { id: 'pie-chart/Basic', title: 'Basic' },
      { id: 'pie-chart/Outside', title: 'Outside labels' },
    ],
    styling: [
      { id: 'pie-chart/Styling', title: 'Half pie, custom colours, sorted' },
      { id: 'pie-chart/Classic', title: 'Classic pie without gaps' },
    ],
    interaction: [{ id: 'pie-chart/Interaction', title: 'Controlled legend and clicks' }],
    responsive: [{ id: 'pie-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'pie-chart/States', title: 'Empty state' }],
  },
  keyboard: ITEM_KEYS,
  props: [{ title: 'PieChart props', props: PIE_PROPS }, baseGroup],
};
