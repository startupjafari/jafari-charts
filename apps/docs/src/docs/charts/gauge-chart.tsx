import { GaugeChart } from '@jafari/charts';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const gaugeChart: ChartDoc = {
  slug: 'gauge-chart',
  component: 'GaugeChart',
  title: 'Gauge chart',
  group: 'Advanced',
  summary: 'A single value against a range, with optional threshold bands and a needle.',
  description: (
    <p>
      The value arc takes the colour of the band it falls into (or <code>color</code>). With{' '}
      <code>needle</code>, the bands become the scale and a needle points at the value. Variants:
      semicircle, 270° arc and full ring.
    </p>
  ),
  thumbnail: () => (
    <GaugeChart
      value={68}
      height={120}
      animation={false}
      accessibilityTable={false}
      scaleLabels={false}
      bands={[
        { to: 40, color: 'var(--jc-negative)' },
        { to: 75, color: 'var(--jc-warning)' },
        { to: 100, color: 'var(--jc-positive)' },
      ]}
    />
  ),
  sections: {
    usage: [
      { id: 'gauge-chart/Basic', title: 'Threshold bands' },
      { id: 'gauge-chart/Needle', title: 'Needle on an arc' },
    ],
    styling: [{ id: 'gauge-chart/Styling', title: 'Custom range, colour, full ring' }],
    interaction: [{ id: 'gauge-chart/Interaction', title: 'Animated value' }],
    responsive: [{ id: 'gauge-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'gauge-chart/States', title: 'No value' }],
  },
  sectionNotes: {
    interaction: (
      <p>
        The gauge shows one value, so it has no tooltip; the value is announced to screen readers
        and listed in the hidden data table with the range.
      </p>
    ),
  },
  keyboard: [['Tab', 'Focus the gauge; its value, minimum and maximum are announced']],
  props: [
    {
      title: 'GaugeChart props',
      props: [
        {
          name: 'value',
          type: 'number',
          required: true,
          description: 'Current value. `NaN` shows the empty state.',
        },
        { name: 'min', type: 'number', default: '0', description: 'Start of the scale.' },
        { name: 'max', type: 'number', default: '100', description: 'End of the scale.' },
        {
          name: 'bands',
          type: 'readonly { to: number; color: string; label?: string }[]',
          description: 'Coloured ranges, ascending by `to`. The active band’s label is shown.',
        },
        {
          name: 'variant',
          type: "'semi' | 'arc' | 'full'",
          default: "'semi'",
          description: 'Semicircle, 270° arc or full ring.',
        },
        {
          name: 'needle',
          type: 'boolean',
          default: 'false',
          description: 'Needle over the band scale.',
        },
        {
          name: 'color',
          type: 'string',
          description: 'Value arc colour (default: band colour or series 1).',
        },
        {
          name: 'thickness',
          type: 'number',
          default: '16 % of radius',
          description: 'Arc thickness, px.',
        },
        { name: 'label', type: 'ReactNode', description: 'Caption under the value.' },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats value and scale labels.',
        },
        {
          name: 'scaleLabels',
          type: 'boolean',
          default: 'true (semi, arc)',
          description: 'Min/max labels at the arc ends.',
        },
      ],
    },
    baseGroup,
  ],
};
