import { BarChart } from '@jafari/charts';
import { registrations } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const barChart: ChartDoc = {
  slug: 'bar-chart',
  component: 'BarChart',
  title: 'Bar chart',
  group: 'Core',
  summary: 'Compare values across categories or periods with rounded, crisp bars.',
  description: (
    <>
      <p>
        Only the data end of a bar is rounded, so the baseline stays flat. Negative values grow
        downwards from an emphasised zero line. Dates on the x axis become categories (bars need
        bands) with an inferred, thinned label format.
      </p>
      <p>
        All bars of a series are drawn as one batched <code>&lt;path&gt;</code>; hovering uses band
        inversion instead of per-bar DOM listeners, so 365 bars cost the same DOM as 12.
      </p>
    </>
  ),
  thumbnail: () => <BarChart data={registrations} xKey="month" yKey="students" {...THUMB} />,
  sections: {
    usage: [
      { id: 'bar-chart/Basic', title: 'Basic' },
      { id: 'bar-chart/Negative', title: 'Negative values with labels' },
      { id: 'bar-chart/ManyBars', title: 'Many bars over dates' },
    ],
    styling: [
      {
        id: 'bar-chart/Styling',
        title: 'Radius, thickness, gaps and labels',
        description: (
          <p>
            <code>barRadius</code>, <code>maxBarSize</code> and <code>categoryGap</code> shape the
            bars; hiding the y axis and grid in favour of labels makes a clean card chart.
          </p>
        ),
      },
      {
        id: 'bar-chart/Theme',
        title: 'Custom theme',
        description: (
          <p>
            <code>createTheme</code> overrides tokens for one chart, per mode if needed. Here with{' '}
            <code>stacked</code> bars.
          </p>
        ),
      },
    ],
    interaction: [
      {
        id: 'bar-chart/Selection',
        title: 'Click to select',
        description: (
          <p>
            <code>onClick</code> receives the datum; a <code>ChartReferenceLine</code> marks the
            selection.
          </p>
        ),
      },
    ],
    responsive: [{ id: 'bar-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'bar-chart/States', title: 'Empty, loading and error' }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: 'BarChart props',
      props: [
        {
          name: 'layout',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: '`horizontal` draws categories on the y axis.',
        },
        {
          name: 'stacked',
          type: "boolean | 'absolute' | 'percent'",
          default: 'false',
          description: 'Stack series (see also StackedBarChart).',
        },
      ],
    },
    barGroup,
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
