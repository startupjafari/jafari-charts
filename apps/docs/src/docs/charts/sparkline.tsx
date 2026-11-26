import { Sparkline } from '@jafari/charts';
import { dailyUsers } from '../../examples/data';
import { baseGroup, cartesianGroup } from '../props';
import type { ChartDoc } from '../types';

export const sparkline: ChartDoc = {
  slug: 'sparkline',
  component: 'Sparkline',
  title: 'Sparkline',
  group: 'Core',
  summary: 'A word-sized trend for KPI cards and tables: no axes, grid or legend.',
  description: (
    <p>
      Sparklines are minimal by design: tooltip, crosshair, animation and the hidden data table are
      off by default (pass <code>title</code> for an accessible name). The default height is 40 px.
      Line sparklines zoom to the data range; area and bar sparklines include zero.
    </p>
  ),
  thumbnail: () => (
    <div style={{ display: 'grid', gap: 10, padding: '18px 0' }}>
      <Sparkline data={dailyUsers.slice(-40)} xKey="date" yKey="users" height={36} />
      <Sparkline
        data={dailyUsers.slice(-24)}
        xKey="date"
        yKey="sessions"
        variant="bar"
        color="var(--jc-series-3)"
        height={36}
      />
    </div>
  ),
  sections: {
    usage: [
      { id: 'sparkline/Variants', title: 'Line, area and bar' },
      { id: 'sparkline/KpiCards', title: 'In a KPI card' },
    ],
    styling: [{ id: 'sparkline/Styling', title: 'Colours, curves and markers' }],
    interaction: [{ id: 'sparkline/Tooltip', title: 'Tooltip and crosshair on demand' }],
    responsive: [{ id: 'sparkline/Responsive', title: 'In a narrow table', width: 320 }],
    empty: [{ id: 'sparkline/States', title: 'Empty state' }],
  },
  keyboard: [
    ['← →', 'Previous / next point (when the tooltip is enabled)'],
    ['Home End', 'First / last point'],
    ['Esc', 'Clear the active point'],
  ],
  props: [
    {
      title: 'Sparkline props',
      note: 'All cartesian props except `xAxis`, `yAxis`, `grid` and `legend`, with different defaults.',
      props: [
        {
          name: 'variant',
          type: "'line' | 'area' | 'bar'",
          default: "'line'",
          description: 'Mark type.',
        },
        { name: 'height', type: 'number', default: '40', description: 'Surface height, px.' },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'false',
          description: 'Off by default.',
        },
        { name: 'crosshair', type: 'boolean', default: 'false', description: 'Off by default.' },
        {
          name: 'animation',
          type: 'boolean | AnimationOptions',
          default: 'false',
          description: 'Off by default.',
        },
        {
          name: 'accessibilityTable',
          type: 'boolean | number',
          default: 'false',
          description: 'No hidden table by default; give the sparkline a `title`.',
        },
      ],
    },
    cartesianGroup,
    baseGroup,
  ],
};
