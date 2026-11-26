import { RadialProgressChart } from '@jafari/charts';
import { completion } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const radialProgressChart: ChartDoc = {
  slug: 'radial-progress-chart',
  component: 'RadialProgressChart',
  title: 'Radial progress chart',
  group: 'Core',
  summary: 'Progress towards one or more targets as concentric rings.',
  description: (
    <p>
      Use <code>value</code>/<code>max</code>/<code>label</code> for a single ring or{' '}
      <code>data</code> for several (outermost first). The centre shows the first ring’s percentage.
      Several rings get a legend and a tooltip automatically.
    </p>
  ),
  thumbnail: () => <RadialProgressChart data={completion} {...THUMB_POLAR} centerValue={null} />,
  sections: {
    usage: [
      { id: 'radial-progress-chart/Basic', title: 'Single ring' },
      { id: 'radial-progress-chart/Rings', title: 'Several rings' },
    ],
    styling: [
      { id: 'radial-progress-chart/Styling', title: 'Arc variant, thickness, colours, centre' },
    ],
    interaction: [{ id: 'radial-progress-chart/Interaction', title: 'Animated updates' }],
    responsive: [{ id: 'radial-progress-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'radial-progress-chart/States', title: 'Loading and error' }],
  },
  sectionNotes: {
    empty: (
      <p>
        A radial progress chart always draws at least one ring (an empty <code>data</code> array
        falls back to the single-ring props), so there is no “no data” state — show{' '}
        <code>loading</code> while the value is unknown.
      </p>
    ),
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: 'RadialProgressChart props',
      props: [
        {
          name: 'value',
          type: 'number',
          default: '0',
          description: 'Single ring shortcut: current value.',
        },
        { name: 'max', type: 'number', default: '100', description: 'Target of the single ring.' },
        {
          name: 'label',
          type: 'string',
          default: "'Value'",
          description: 'Label of the single ring.',
        },
        {
          name: 'color',
          type: 'string',
          default: 'series 1',
          description: 'Colour of the single ring.',
        },
        {
          name: 'data',
          type: 'readonly ProgressItem[]',
          description: 'Several rings, outermost first: `{ label, value, max?, color? }`.',
        },
        { name: 'thickness', type: 'number', default: 'auto', description: 'Ring thickness, px.' },
        {
          name: 'gap',
          type: 'number',
          default: '4 (several rings)',
          description: 'Gap between rings, px.',
        },
        {
          name: 'variant',
          type: "'full' | 'arc'",
          default: "'full'",
          description: 'Full circle or a 270° arc.',
        },
        {
          name: 'centerValue',
          type: 'ReactNode',
          default: "first ring's %",
          description: 'Centre text. `null` hides it.',
        },
        { name: 'centerLabel', type: 'ReactNode', description: 'Caption under the centre value.' },
        {
          name: 'valueFormatter',
          type: '(value: number, max: number) => string',
          default: 'percent',
          description: 'Formats the centre, legend and table values.',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: '2+ rings',
          description: 'Tooltip per ring.',
        },
        {
          name: 'legend',
          type: 'boolean',
          default: '2+ rings',
          description: 'Non-interactive legend with values.',
        },
      ],
    },
    baseGroup,
  ],
};
