import { FunnelChart } from '@jafari/charts';
import { admissions } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const funnelChart: ChartDoc = {
  slug: 'funnel-chart',
  component: 'FunnelChart',
  title: 'Funnel chart',
  group: 'Advanced',
  summary: 'Conversion through ordered stages, with percentages and drop-off.',
  description: (
    <p>
      One row per stage, in funnel order. Each stage shows its value and its share of the first
      stage (or of the previous one with <code>percentBase="previous"</code>); the loss between
      stages is labelled where there is room. The default <code>bars</code> variant keeps values
      readable; <code>trapezoid</code> draws a continuous funnel. Default height grows with the
      number of stages (52 px each, 160–440 px).
    </p>
  ),
  thumbnail: () => (
    <FunnelChart
      data={admissions}
      labelKey="stage"
      valueKey="count"
      height={120}
      labels={false}
      dropOff={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      { id: 'funnel-chart/Basic', title: 'Bars (default)' },
      { id: 'funnel-chart/Trapezoid', title: 'Trapezoid' },
      { id: 'funnel-chart/Horizontal', title: 'Horizontal, step conversion' },
    ],
    styling: [{ id: 'funnel-chart/Styling', title: 'Colours by stage and formatting' }],
    interaction: [{ id: 'funnel-chart/Interaction', title: 'Click a stage' }],
    responsive: [{ id: 'funnel-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'funnel-chart/States', title: 'Empty state' }],
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: 'FunnelChart props',
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: 'One row per stage, in funnel order.',
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          required: true,
          description: 'Field naming each stage.',
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: "Each stage's value.",
        },
        {
          name: 'variant',
          type: "'bars' | 'trapezoid'",
          default: "'bars'",
          description: 'Centred bars with soft connectors, or a continuous funnel.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: 'Stages top → bottom or left → right.',
        },
        {
          name: 'percentBase',
          type: "'first' | 'previous'",
          default: "'first'",
          description: 'Percentages relative to the first or the previous stage.',
        },
        {
          name: 'color',
          type: 'string',
          default: 'series 1',
          description: 'Colour of every stage.',
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: 'Colours by stage position (overrides `color`).',
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: 'Stage names and values on the chart.',
        },
        {
          name: 'dropOff',
          type: 'boolean',
          default: 'true',
          description: 'Loss labels between stages when there is room.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats values.',
        },
        {
          name: 'percentFormatter',
          type: '(ratio: number) => string',
          description: 'Formats ratios (0.25 → "25%").',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: 'Stage tooltip with conversion and drop-off.',
        },
        {
          name: 'texts',
          type: 'Partial<FunnelTexts>',
          description:
            'Overrides for `stage`, `ofFirst`, `ofPrevious`, `dropOff` (built in for en, ru, kk).',
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: 'Controlled active stage.',
        },
        {
          name: 'onHover / onClick',
          type: '(event: FunnelStageEvent<T>) => void',
          description: 'Event with `value`, `ofFirst`, `ofPrevious`, `dropOff`, `dropOffRate`.',
        },
      ],
    },
    baseGroup,
  ],
};
