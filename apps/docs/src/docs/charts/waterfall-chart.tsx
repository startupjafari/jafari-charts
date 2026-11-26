import { WaterfallChart } from '@jafari/charts';
import { cashflow } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const waterfallChart: ChartDoc = {
  slug: 'waterfall-chart',
  component: 'WaterfallChart',
  title: 'Waterfall chart',
  group: 'Professional',
  summary: 'How a starting value becomes a final value through increases and decreases.',
  description: (
    <p>
      Each row is a change; the first row is the starting value (unless{' '}
      <code>firstIsStart={'{false}'}</code>) and rows marked by <code>isTotal</code> show the
      running total. Increases, decreases and totals use the theme’s positive, negative and first
      series colours, and dotted connectors link the bars. Labels show the change, not the level.
    </p>
  ),
  thumbnail: () => (
    <WaterfallChart
      data={cashflow}
      xKey="step"
      yKey="value"
      isTotal={(d) => Boolean(d.total)}
      {...THUMB}
      labels={false}
    />
  ),
  sections: {
    usage: [
      { id: 'waterfall-chart/Basic', title: 'Start, changes and totals' },
      { id: 'waterfall-chart/Deltas', title: 'Changes only' },
    ],
    styling: [
      { id: 'waterfall-chart/Colors', title: 'Custom colours, no connectors' },
      { id: 'waterfall-chart/Compact', title: 'Compact, labels only' },
    ],
    interaction: [{ id: 'waterfall-chart/Interaction', title: 'Click a step' }],
    responsive: [{ id: 'waterfall-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'waterfall-chart/States', title: 'Empty state' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'WaterfallChart props',
      note: 'All cartesian props except `series` (one value field via `yKey`), plus bar options.',
      props: [
        {
          name: 'isTotal',
          type: '(datum: T, index: number) => boolean',
          description: 'Marks a row as an intermediate or final total; its value is ignored.',
        },
        {
          name: 'firstIsStart',
          type: 'boolean',
          default: 'true',
          description: 'Treat the first row as the starting value.',
        },
        {
          name: 'connectors',
          type: 'boolean',
          default: 'true',
          description: 'Dotted connectors between consecutive bars.',
        },
        {
          name: 'colors',
          type: '{ increase?: string; decrease?: string; total?: string }',
          default: 'positive / negative / series 1',
          description: 'Colours for increases, decreases and totals.',
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: 'false',
          description: 'Off by default (one series).',
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: 'Change labels at the bar ends.',
        },
      ],
    },
    barGroup,
    cartesianGroup,
    baseGroup,
  ],
};
