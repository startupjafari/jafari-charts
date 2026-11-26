import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';
import { PropsTable, type PropDef } from '../ui/PropsTable';

const VALUE = 'number | string | Date';

const REFERENCE_LINE: PropDef[] = [
  {
    name: 'y',
    type: 'number',
    description: 'Value on the value axis (a horizontal line in vertical charts).',
  },
  { name: 'x', type: VALUE, description: 'Value on the x/category axis (a vertical line).' },
  { name: 'label', type: 'ReactNode', description: 'Text next to the line.' },
  {
    name: 'labelPosition',
    type: "'start' | 'end'",
    default: "'end'",
    description: 'Label placement along a horizontal line.',
  },
  { name: 'color', type: 'string', default: 'var(--jc-text-muted)', description: 'Line colour.' },
  { name: 'dashed', type: 'boolean', default: 'true', description: 'Dashed (default) or solid.' },
];

const REFERENCE_AREA: PropDef[] = [
  { name: 'x1', type: VALUE, description: 'Start on the x/category axis (default: plot edge).' },
  { name: 'x2', type: VALUE, description: 'End on the x/category axis.' },
  { name: 'y1', type: 'number', description: 'Start on the value axis.' },
  { name: 'y2', type: 'number', description: 'End on the value axis.' },
  { name: 'label', type: 'ReactNode', description: 'Text in the top-left corner.' },
  { name: 'color', type: 'string', default: 'var(--jc-text)', description: 'Fill colour.' },
  { name: 'opacity', type: 'number', default: '0.05', description: 'Fill opacity.' },
];

const REFERENCE_DOT: PropDef[] = [
  { name: 'x', type: VALUE, required: true, description: 'Position on the x/category axis.' },
  { name: 'y', type: 'number', required: true, description: 'Position on the value axis.' },
  { name: 'r', type: 'number', default: '5', description: 'Radius, px.' },
  { name: 'color', type: 'string', default: 'var(--jc-text)', description: 'Fill colour.' },
  { name: 'label', type: 'ReactNode', description: 'Text above-right of the dot.' },
];

const ANNOTATION: PropDef[] = [
  { name: 'x', type: 'number', required: true, description: 'Anchor x in chart pixels.' },
  { name: 'y', type: 'number', required: true, description: 'Anchor y in chart pixels.' },
  { name: 'dx', type: 'number', default: '12', description: 'Horizontal offset of the note.' },
  { name: 'dy', type: 'number', default: '-18', description: 'Vertical offset of the note.' },
  {
    name: 'connector',
    type: 'boolean',
    default: 'true',
    description: 'Leader line from the point to the note.',
  },
  { name: 'children', type: 'ReactNode', required: true, description: 'Note text.' },
];

const LABEL: PropDef[] = [
  { name: 'x', type: 'number', required: true, description: 'x in chart pixels.' },
  { name: 'y', type: 'number', required: true, description: 'y in chart pixels.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Text.' },
  {
    name: 'anchor',
    type: "'start' | 'middle' | 'end'",
    default: "'middle'",
    description: 'Text anchor.',
  },
  {
    name: 'tone',
    type: "'primary' | 'secondary' | 'muted' | 'inverse'",
    default: "'secondary'",
    description: 'Text colour token — never the series colour, for contrast.',
  },
  { name: 'fontSize', type: 'number', description: 'Font size, px (default: --jc-font-size).' },
  { name: 'className', type: 'string', description: 'Extra class.' },
];

const MARKER: PropDef[] = [
  { name: 'x', type: 'number', default: '0', description: 'x in chart pixels.' },
  { name: 'y', type: 'number', default: '0', description: 'y in chart pixels.' },
  {
    name: 'shape',
    type: "'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star'",
    default: "'circle'",
    description: 'Symbol shape.',
  },
  { name: 'size', type: 'number', default: '8', description: 'Symbol size, px.' },
  { name: 'color', type: 'string', required: true, description: 'Fill colour.' },
  {
    name: 'ring',
    type: 'boolean',
    default: 'true',
    description: 'Surface-coloured ring so the marker stays legible over lines.',
  },
  { name: 'className', type: 'string', description: 'Extra class.' },
];

const GRADIENT: PropDef[] = [
  {
    name: 'id',
    type: 'string',
    required: true,
    description: 'Gradient id; reference it as `fill="url(#id)"`. Must be unique in the document.',
  },
  {
    name: 'color',
    type: 'string',
    required: true,
    description: 'Gradient colour (CSS variables work).',
  },
  {
    name: 'from',
    type: 'number',
    default: '0.24',
    description: 'Opacity at the start (top/left).',
  },
  { name: 'to', type: 'number', default: '0', description: 'Opacity at the end (bottom/right).' },
  {
    name: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Gradient direction.',
  },
];

const AXIS: PropDef[] = [
  {
    name: 'position',
    type: "'bottom' | 'top' | 'left' | 'right'",
    required: true,
    description: 'Edge of the plot (ChartAxis only; XAxis defaults to bottom, YAxis to left).',
  },
  {
    name: 'ticks',
    type: 'readonly AxisTick[]',
    default: "the chart's ticks",
    description: '`{ value, position, label, anchor }` — required outside a chart.',
  },
  {
    name: 'plot',
    type: 'Rect',
    default: "the chart's plot",
    description: '`{ x, y, width, height }` — required outside a chart.',
  },
  { name: 'line', type: 'boolean', default: 'false', description: 'Draw the axis baseline.' },
  {
    name: 'tickPadding',
    type: 'number',
    default: '8',
    description: 'Distance between labels and the plot, px.',
  },
  { name: 'title', type: 'string', description: 'Axis title.' },
  { name: 'className', type: 'string', description: 'Extra class.' },
];

const GRID: PropDef[] = [
  { name: 'horizontal', type: 'boolean', default: 'true', description: 'Lines at y ticks.' },
  { name: 'vertical', type: 'boolean', default: 'false', description: 'Lines at x ticks.' },
  {
    name: 'xTicks',
    type: 'readonly AxisTick[]',
    default: "the chart's ticks",
    description: 'Ticks for vertical lines.',
  },
  {
    name: 'yTicks',
    type: 'readonly AxisTick[]',
    default: "the chart's ticks",
    description: 'Ticks for horizontal lines.',
  },
  { name: 'plot', type: 'Rect', default: "the chart's plot", description: 'Plot rectangle.' },
  { name: 'zeroLine', type: 'number | null', description: 'Pixel y of an emphasised zero line.' },
];

const TOOLTIP: PropDef[] = [
  {
    name: 'mode',
    type: "'shared' | 'item'",
    default: "'shared'",
    description:
      '`shared`: every series at the active x; `item`: only the series under the pointer.',
  },
  {
    name: 'render',
    type: '(data: TooltipData, active: ActiveItem) => ReactNode',
    description: 'Custom content. `data` has `title`, formatted `rows` and an optional `footer`.',
  },
  { name: 'sort', type: "'none' | 'asc' | 'desc'", default: "'none'", description: 'Row order.' },
  {
    name: 'hideEmpty',
    type: 'boolean',
    default: 'false',
    description: 'Hide rows without a value.',
  },
  { name: 'offset', type: 'number', default: '14', description: 'Distance from the anchor, px.' },
];

const LEGEND: PropDef[] = [
  {
    name: 'position',
    type: "'top' | 'bottom'",
    default: "'bottom'",
    description: 'Above or below the plot.',
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end'",
    default: "'start'",
    description: 'Horizontal alignment.',
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'true',
    description: 'Clicking an item toggles the series (the last visible one stays on).',
  },
  {
    name: 'render',
    type: '(items: SeriesInfo[], toggle: (id: string) => void) => ReactNode',
    description:
      'Custom legend. Items carry `id`, `label`, `color`, `kind`, `symbol`, `visible`, `value`.',
  },
];

const CROSSHAIR: PropDef[] = [
  {
    name: 'horizontal',
    type: 'boolean',
    default: 'false',
    description: 'Also draw a horizontal line at the pointer.',
  },
  {
    name: 'vertical',
    type: 'boolean',
    default: 'true',
    description: 'Draw the vertical line (ChartCrosshair primitive only).',
  },
];

const PROVIDER: PropDef[] = [
  { name: 'locale', type: 'string', description: 'Default locale for all charts below.' },
  { name: 'theme', type: "'auto' | 'light' | 'dark' | Theme", description: 'Default theme.' },
  {
    name: 'animation',
    type: 'boolean | AnimationOptions',
    description:
      '`{ duration, easing, initial, maxComplexity }`; easing names: linear, quadOut, cubicOut, cubicInOut, expoOut, backOut.',
  },
  { name: 'renderer', type: "'svg' | 'canvas' | 'auto'", description: 'Default renderer.' },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: 'Text overrides, merged with parent providers.',
  },
  {
    name: 'injectStyles',
    type: 'boolean',
    default: 'true',
    description:
      'Inject the stylesheet automatically. Disable when importing `@jafari/charts/styles.css`.',
  },
  { name: 'children', type: 'ReactNode', description: 'Your app.' },
];

const STATES: PropDef[] = [
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'With data: dims the previous render. Without data: a static placeholder.',
  },
  {
    name: 'error',
    type: 'boolean | ReactNode',
    description: '`true` for the default message, or your own node.',
  },
  { name: 'onRetry', type: '() => void', description: 'Adds a retry button to the error state.' },
  {
    name: 'emptyMessage',
    type: 'ReactNode',
    default: "'No data'",
    description: 'Text of the empty state.',
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: 'noData, loading, error, retry, resetZoom and more.',
  },
];

const TOC = [
  ['reference', 'Reference lines, areas, dots'],
  ['annotations', 'Annotations, labels, markers'],
  ['gradient', 'Gradients'],
  ['axes', 'Axes and grid'],
  ['tooltip', 'Tooltip'],
  ['legend', 'Legend'],
  ['crosshair', 'Crosshair and cursor'],
  ['states', 'States'],
  ['chart-provider', 'ChartProvider'],
] as const;

export function Components() {
  const { path } = useLocation();
  return (
    <article>
      <PageHeader
        eyebrow="Guides"
        title="Components"
        lead="Charts are composed of primitives. Most are rendered for you; the ones below can also be placed inside any cartesian chart, configured through chart props, or used on their own."
      >
        <nav aria-label="On this page">
          <ul className="page-toc">
            {TOC.map(([id, title]) => (
              <li key={id}>
                <Link to={path} section={id}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section id="reference" title="Reference lines, areas and dots">
        <p>
          <code>ChartReferenceLine</code>, <code>ChartReferenceArea</code> and{' '}
          <code>ChartReferenceDot</code> take <em>data values</em> and use the chart’s scales, in
          either orientation (<code>y</code> always means the value axis). Place them as children of
          a cartesian chart.
        </p>
        <Example id="components/ReferenceLine" title="ChartReferenceLine" codeOpen />
        <PropsTable props={REFERENCE_LINE} caption="ChartReferenceLine" />
        <Example id="components/ReferenceArea" title="ChartReferenceArea" />
        <PropsTable props={REFERENCE_AREA} caption="ChartReferenceArea" />
        <Example id="components/ReferenceDot" title="ChartReferenceDot" />
        <PropsTable props={REFERENCE_DOT} caption="ChartReferenceDot" />
      </Section>

      <Section id="annotations" title="Annotations, labels and markers">
        <p>
          <code>ChartAnnotation</code>, <code>ChartLabel</code> and <code>ChartMarker</code> work in
          chart <em>pixels</em>. Inside a chart, <code>useChart()</code> returns the scales (
          <code>frame.x</code>, <code>frame.y</code>), the plot rectangle, the interaction store and
          the series, so a small component can translate data into pixels — that is how you build
          your own primitives.
        </p>
        <Example id="components/Annotations" title="A custom primitive with useChart()" codeOpen />
        <PropsTable props={ANNOTATION} caption="ChartAnnotation" />
        <PropsTable props={LABEL} caption="ChartLabel" />
        <PropsTable props={MARKER} caption="ChartMarker" />
      </Section>

      <Section id="gradient" title="Gradients">
        <p>
          <code>ChartGradient</code> renders a <code>&lt;linearGradient&gt;</code> definition for
          custom marks. Generate the id with <code>useId</code> so two charts never share one.
        </p>
        <Example id="components/Gradient" title="ChartGradient" />
        <PropsTable props={GRADIENT} caption="ChartGradient" />
      </Section>

      <Section id="axes" title="Axes and grid">
        <p>
          Charts draw their own axes and grid — configure them with the <code>xAxis</code>,{' '}
          <code>yAxis</code>, <code>y2Axis</code> and <code>grid</code> props (see any{' '}
          <Link to="/charts/line-chart" section="props">
            cartesian chart
          </Link>
          ). <code>XAxis</code>, <code>YAxis</code>, <code>ChartAxis</code> and{' '}
          <code>ChartGrid</code> are the primitives behind them; outside a chart they need explicit{' '}
          <code>ticks</code> and <code>plot</code>.
        </p>
        <Example id="components/Axes" title="Primitives outside a chart" />
        <PropsTable props={AXIS} caption="ChartAxis / XAxis / YAxis" />
        <PropsTable props={GRID} caption="ChartGrid" />
      </Section>

      <Section id="tooltip" title="Tooltip">
        <p>
          The HTML tooltip re-renders only when the active item changes; its position follows the
          pointer through a direct style update, so moving the mouse never re-renders React. It is
          configured with the <code>tooltip</code> prop (<code>false</code> hides it). Tooltips
          enhance but never gate: every value is also in the data table and keyboard announcements.
        </p>
        <Example id="components/Tooltip" title="Custom tooltip content" />
        <PropsTable props={TOOLTIP} caption="tooltip (TooltipOptions)" />
      </Section>

      <Section id="legend" title="Legend">
        <p>
          The legend appears for two or more series and wraps on narrow screens. Items are buttons
          with <code>aria-pressed</code>; hovering or focusing one highlights its series.
        </p>
        <Example id="components/Legend" title="Custom legend" />
        <PropsTable props={LEGEND} caption="legend (LegendOptions)" />
      </Section>

      <Section id="crosshair" title="Crosshair and cursor">
        <p>
          <code>ChartCrosshair</code> is a hairline that snaps to the active x;{' '}
          <code>ChartCursor</code> is the soft band behind the active category in bar charts. Both
          are drawn automatically and controlled with the <code>crosshair</code> prop.
        </p>
        <Example id="components/Crosshair" title="Crosshair and cursor" />
        <PropsTable props={CROSSHAIR} caption="crosshair (CrosshairOptions)" />
      </Section>

      <Section id="states" title="States">
        <p>
          Empty, loading and error states keep the chart’s footprint. While loading with data, the
          previous render stays visible at reduced opacity — no skeleton flash. The state components
          (<code>ChartEmptyState</code>, <code>ChartLoadingState</code>,{' '}
          <code>ChartErrorState</code>) are exported for custom charts.
        </p>
        <Example id="components/States" title="All states" />
        <PropsTable props={STATES} caption="State props (every chart)" />
      </Section>

      <Section id="chart-provider" title="ChartProvider">
        <p>
          Sets defaults for every chart below it. Providers nest: an inner provider overrides the
          outer one, and <code>messages</code> are merged.
        </p>
        <Example id="components/Provider" title="Brand theme, locale and animation" />
        <PropsTable props={PROVIDER} caption="ChartProvider" />
        <Callout title="Reading the configuration">
          <code>useChartConfig()</code> returns the merged provider configuration — useful when a
          custom component should follow the same locale.
        </Callout>
        <CodeBlock
          code={`import { formatNumber, useChartConfig } from '@jafari/charts';

function Total({ value }: { value: number }) {
  const { locale = 'en' } = useChartConfig();
  return <strong>{formatNumber(value, { locale })}</strong>;
}`}
        />
      </Section>
    </article>
  );
}
