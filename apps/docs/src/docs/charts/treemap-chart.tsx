import { TreemapChart } from '@jafari/charts';
import { budgetTree } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const treemapChart: ChartDoc = {
  slug: 'treemap-chart',
  component: 'TreemapChart',
  title: 'Treemap',
  group: 'Advanced',
  summary: 'Part-to-whole for hierarchies, as nested rectangles sized by value.',
  description: (
    <>
      <p>
        Pass a hierarchy (<code>{'{ name, value }'}</code> leaves,{' '}
        <code>{'{ name, children }'}</code> parents), or flat rows grouped with{' '}
        <code>groupKey</code>, an optional <code>subgroupKey</code> and <code>labelKey</code>. Tiles
        use the squarified layout, so they stay close to square and easy to compare.
      </p>
      <p>
        Top-level categories get the palette colours and a legend (for 2–12 categories) whose items
        hide branches. With <code>drilldown</code>, clicking a category zooms into it and a
        breadcrumb leads back.
      </p>
    </>
  ),
  thumbnail: () => (
    <TreemapChart
      data={budgetTree}
      height={120}
      labels={false}
      headers={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      { id: 'treemap-chart/Basic', title: 'Hierarchical data' },
      { id: 'treemap-chart/Rows', title: 'Flat rows' },
    ],
    styling: [{ id: 'treemap-chart/Styling', title: 'Colours, depth shading, gaps and radius' }],
    interaction: [{ id: 'treemap-chart/Drilldown', title: 'Drill-down' }],
    responsive: [{ id: 'treemap-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'treemap-chart/States', title: 'Empty state' }],
  },
  keyboard: [
    ['← →', 'Previous / next tile (largest first, depth first)'],
    ['↑ ↓', 'Tile above / below'],
    ['Home End', 'First / last tile'],
    ['Enter', 'Click; with drilldown, zoom into the category'],
    ['Backspace', 'Zoom out one level (drilldown)'],
    ['Esc', 'Clear the active tile'],
  ],
  props: [
    {
      title: 'TreemapChart props',
      note: 'Either hierarchical `data` or flat rows with `groupKey` and `valueKey`.',
      props: [
        {
          name: 'data',
          type: 'TreemapDatum | readonly TreemapDatum[] | readonly T[]',
          required: true,
          description: 'A root node, a list of top-level nodes, or flat rows.',
        },
        {
          name: 'groupKey',
          type: 'KeysMatching<T, string | number>',
          description: 'Flat rows: top-level category.',
        },
        {
          name: 'subgroupKey',
          type: 'KeysMatching<T, string | number>',
          description: 'Flat rows: optional second level.',
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          description: "Flat rows: tile name (without it a group's rows are summed into one tile).",
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          description: 'Flat rows: value (required with `groupKey`).',
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          default: 'theme palette',
          description: 'Colours of top-level categories by position.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats values.',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: 'Tile tooltip with share of the parent.',
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: '2–12 categories',
          description: 'Top-level categories; clicking one hides its branch.',
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: 'Name and value on tiles that fit.',
        },
        {
          name: 'headers',
          type: 'boolean',
          default: 'true',
          description: 'Header strips with the name on parent tiles.',
        },
        { name: 'gap', type: 'number', default: '2', description: 'Gap between tiles, px.' },
        { name: 'cornerRadius', type: 'number', description: 'Tile corner radius, px.' },
        {
          name: 'depthShading',
          type: 'boolean',
          default: 'false',
          description: 'Slightly lighter tiles at deeper levels.',
        },
        {
          name: 'drilldown',
          type: 'boolean',
          default: 'false',
          description: 'Click a category to zoom in; Backspace or the breadcrumb zooms out.',
        },
        {
          name: 'texts',
          type: 'Partial<TreemapTexts>',
          description:
            'Overrides for `all`, `back`, `breadcrumb`, `share`, `ofParent` (built in for en, ru, kk).',
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: 'Hidden top-level categories.',
        },
        {
          name: 'onHover / onClick',
          type: '(event: TreemapItemEvent) => void',
          description:
            'Event with `datum`, `key`, `name`, `path`, `value`, `share`, `depth`, `leaf`.',
        },
        {
          name: 'onDrilldown',
          type: '(path: string[]) => void',
          description: 'Called with the zoomed path after drill-down navigation.',
        },
      ],
    },
    baseGroup,
  ],
};
