import * as Library from '@jafari/charts';
import { CHARTS } from '../docs/charts';
import { BASE_PROPS } from '../docs/props';
import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { Code, CodeBlock } from '../ui/CodeBlock';
import { inlineCode, PropsTable } from '../ui/PropsTable';

interface ApiEntry {
  name: string;
  signature: string;
  description: string;
  /** Internal docs page. */
  to?: string;
  section?: string;
}

interface ApiGroup {
  id: string;
  title: string;
  lead?: string;
  entries: ApiEntry[];
}

const PRIMITIVES: ApiEntry[] = [
  {
    name: 'ChartReferenceLine',
    signature: '(props: ChartReferenceLineProps) => ReactNode',
    description: 'Target lines, thresholds, averages (data values).',
    to: '/components',
    section: 'reference',
  },
  {
    name: 'ChartReferenceArea',
    signature: '(props: ChartReferenceAreaProps) => ReactNode',
    description: 'Highlighted region on either axis.',
    to: '/components',
    section: 'reference',
  },
  {
    name: 'ChartReferenceDot',
    signature: '(props: ChartReferenceDotProps) => ReactNode',
    description: 'A highlighted point with an optional label.',
    to: '/components',
    section: 'reference',
  },
  {
    name: 'ChartAnnotation',
    signature: '(props: ChartAnnotationProps) => ReactNode',
    description: 'A note attached to a pixel position, with a leader line.',
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'ChartLabel',
    signature: '(props: ChartLabelProps) => ReactNode',
    description: 'Text in chart pixels using text tokens.',
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'ChartMarker',
    signature: '(props: ChartMarkerProps) => ReactNode',
    description: 'A single symbol (circle, square, diamond, triangle, cross, star…).',
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'ChartGradient',
    signature: '(props: ChartGradientProps) => ReactNode',
    description: 'Linear gradient definition for custom marks.',
    to: '/components',
    section: 'gradient',
  },
  {
    name: 'ChartAxis / XAxis / YAxis',
    signature: '(props: ChartAxisProps | XAxisProps | YAxisProps) => ReactNode',
    description: 'Tick labels along one edge of the plot.',
    to: '/components',
    section: 'axes',
  },
  {
    name: 'ChartGrid',
    signature: '(props: ChartGridProps) => ReactNode',
    description: 'Hairline gridlines.',
    to: '/components',
    section: 'axes',
  },
  {
    name: 'ChartTooltip',
    signature: '(props: TooltipOptions) => ReactNode',
    description: 'HTML tooltip (rendered by charts; configure with the `tooltip` prop).',
    to: '/components',
    section: 'tooltip',
  },
  {
    name: 'ChartLegend',
    signature: '(props: LegendOptions) => ReactNode',
    description: 'Legend with toggle buttons (configure with the `legend` prop).',
    to: '/components',
    section: 'legend',
  },
  {
    name: 'ChartCrosshair / ChartCursor',
    signature: '(props: ChartCrosshairProps) => ReactNode',
    description: 'Active-x hairline and the bar cursor band.',
    to: '/components',
    section: 'crosshair',
  },
  {
    name: 'ChartEmptyState / ChartLoadingState / ChartErrorState',
    signature: '(props) => ReactNode',
    description: 'State overlays used by every chart.',
    to: '/components',
    section: 'states',
  },
  {
    name: 'SeriesKey',
    signature: '(props: SeriesKeyProps) => ReactNode',
    description: 'Swatch identifying a series (line, square or symbol).',
  },
];

const PROVIDERS: ApiEntry[] = [
  {
    name: 'ChartProvider',
    signature: '(props: ChartProviderProps) => ReactNode',
    description:
      'Defaults (locale, theme, animation, renderer, messages, injectStyles) for every chart below.',
    to: '/components',
    section: 'chart-provider',
  },
  {
    name: 'useChartConfig',
    signature: '() => ChartConfig',
    description: 'The merged provider configuration.',
  },
  {
    name: 'useChart',
    signature: '() => ChartInstance',
    description:
      'Inside a chart: scales (`frame`), `plot`, `width`, `height`, the interaction `store`, `series`, `locale`, `messages`. Throws outside a chart.',
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'useOptionalChart',
    signature: '() => ChartInstance | null',
    description: 'Like `useChart`, but returns null outside a chart.',
  },
  {
    name: 'useStoreSelector',
    signature: '<S, R>(store: Store<S>, selector: (state: S) => R) => R',
    description: 'Subscribe to a slice of the interaction store (re-renders only when it changes).',
  },
  {
    name: 'useReducedMotion',
    signature: '() => boolean',
    description: 'True when the user prefers reduced motion.',
  },
];

const BUILDING_BLOCKS: ApiEntry[] = [
  {
    name: 'ChartView',
    signature: '(props: ChartViewProps) => ReactNode',
    description:
      'The shell every chart uses: layers, interaction, tooltip, legend, states and accessibility. For building new chart types.',
  },
  {
    name: 'useChartRoot',
    signature: '(props: BaseChartProps, defaults: { height: number }) => ChartRoot',
    description:
      'Resolves size, locale, messages, animation, theme and the store for a new chart type.',
  },
  {
    name: 'SeriesLayer / MarkList',
    signature: '(props) => ReactNode',
    description: 'SVG renderer for scene marks (batched paths).',
  },
  {
    name: 'CanvasMarks',
    signature: '(props) => ReactNode',
    description: 'Canvas renderer for scene marks (loads the canvas module lazily).',
  },
  {
    name: 'TextLabels',
    signature: '({ labels }: { labels: readonly TextMark[] }) => ReactNode',
    description: 'Text marks (value labels).',
  },
  {
    name: 'ChartDataTable',
    signature: '(props: { table: DataTable; caption: string; limit: number }) => ReactNode',
    description: 'Visually hidden data table.',
  },
  {
    name: 'ChartStyles',
    signature: '() => ReactNode',
    description: 'Injects the stylesheet once per document (respects `injectStyles`).',
  },
];

const THEMING: ApiEntry[] = [
  {
    name: 'createTheme',
    signature: '(options?: CreateThemeOptions) => Theme',
    description: 'A theme from token overrides, optionally per mode (`light`, `dark`).',
    to: '/themes',
    section: 'create-theme',
  },
  {
    name: 'lightTheme / darkTheme',
    signature: 'ThemeTokens',
    description: 'Default token values.',
    to: '/themes',
    section: 'tokens',
  },
  {
    name: 'palette',
    signature: '{ primary, blue, success, warning, error, purple, cyan, pink }',
    description: 'Brand colours.',
    to: '/themes',
    section: 'palette',
  },
  {
    name: 'seriesColor',
    signature: '(index: number) => string',
    description: '`var(--jc-series-N)` for a 0-based series slot.',
  },
  {
    name: 'cssVar',
    signature: '(token: keyof ThemeTokens) => string',
    description: "CSS variable reference, e.g. `cssVar('grid')` → `var(--jc-grid)`.",
  },
];

const FORMATTING: ApiEntry[] = [
  {
    name: 'formatNumber',
    signature:
      '(value: number | null | undefined, options?: Intl.NumberFormatOptions & { locale?: string }) => string',
    description: 'Cached Intl number formatting; missing values print "—".',
  },
  {
    name: 'formatCompact',
    signature: '(value, locale = "en", maximumFractionDigits = 1) => string',
    description: '1 234 567 → "1.2M" (en), "1,2 млн" (ru, kk).',
  },
  {
    name: 'formatPercent',
    signature: '(value, locale = "en", maximumFractionDigits = 1) => string',
    description: 'Ratio to percent: 0.25 → "25%".',
  },
  {
    name: 'formatCurrency',
    signature: '(value, currency: string, locale = "en", options?) => string',
    description: 'Currency with narrow symbols (₸, $, €).',
  },
  {
    name: 'formatDate',
    signature:
      '(value: number | Date | null | undefined, options?: Intl.DateTimeFormatOptions & { locale?: string }) => string',
    description: 'Cached Intl date formatting.',
  },
  {
    name: 'getMessages',
    signature: '(locale = "en", overrides?: Partial<ChartMessages>) => ChartMessages',
    description: 'Built-in texts for a BCP 47 locale ("ru-RU" → ru), English fallback.',
  },
  {
    name: 'MESSAGES',
    signature: "Readonly<Record<'en' | 'ru' | 'kk', ChartMessages>>",
    description: 'Built-in texts for English, Russian and Kazakh.',
  },
];

const EXPORT: ApiEntry[] = [
  {
    name: 'exportChart',
    signature: '(target: Element, options: ExportChartOptions) => Promise<Blob>',
    description:
      "Exports a rendered chart: `format` 'svg' | 'png' | 'webp' | 'csv', `scale`, `background`, `legend`, `padding`, `filename`, `download`.",
  },
  {
    name: 'chartToSvg',
    signature: '(target: Element, options?: SvgExportOptions) => …',
    description: 'Standalone SVG with inlined styles.',
  },
  {
    name: 'toSvgBlob / toPngBlob / toWebpBlob',
    signature: '(target: Element, options?) => Blob | Promise<Blob>',
    description: 'Blobs without triggering a download.',
  },
  {
    name: 'isWebpSupported',
    signature: '() => boolean',
    description: 'Whether the browser can encode WebP.',
  },
  {
    name: 'toCsv / toCsvBlob',
    signature: '(data: readonly T[], options?: CsvOptions<T>) => string | Blob',
    description: 'RFC 4180 CSV with formula-injection protection and an optional BOM.',
  },
  {
    name: 'downloadBlob',
    signature: '(blob: Blob, filename: string) => void',
    description: 'Triggers a browser download.',
  },
];

const TYPES = [
  'BaseChartProps',
  'CartesianChartProps',
  'SeriesConfig',
  'XAxisOptions',
  'YAxisOptions',
  'GridOptions',
  'CrosshairOptions',
  'ZoomOptions',
  'DownsampleOptions',
  'BarOptions',
  'ChartItemEvent',
  'TooltipOptions',
  'LegendOptions',
  'AnimationOptions',
  'Renderer',
  'ChartConfig',
  'ChartProviderProps',
  'ChartInstance',
  'ChartAdapter',
  'InteractionState',
  'ActiveItem',
  'SeriesInfo',
  'SwatchKind',
  'TooltipData',
  'TooltipRow',
  'Theme',
  'ThemeInput',
  'ThemeMode',
  'ThemeTokens',
  'ChartMessages',
  'CurveType',
  'SymbolShape',
  'AxisValue',
];

function chartEntries(): ApiEntry[] {
  return CHARTS.map((c) => ({
    name: c.component,
    signature: `(props: ${c.component}Props) => ReactElement`,
    description: c.summary,
    to: `/charts/${c.slug}`,
  }));
}

function entryNames(e: ApiEntry): string[] {
  return e.name.split(' / ');
}

function ApiTable({ entries }: { entries: ApiEntry[] }) {
  return (
    <div className="table-wrap api-table">
      <table>
        <thead>
          <tr>
            <th scope="col">Export</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.name}>
              <th scope="row">
                {e.to ? (
                  <Link to={e.to} {...(e.section ? { section: e.section } : {})}>
                    <code>{e.name}</code>
                  </Link>
                ) : (
                  <code>{e.name}</code>
                )}
              </th>
              <td>
                <p className="api-desc">{inlineCode(e.description)}</p>
                <span className="api-sig">
                  <Code code={e.signature} language="ts" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApiReference() {
  const { path } = useLocation();
  const groups: ApiGroup[] = [
    {
      id: 'charts',
      title: 'Charts',
      lead: 'Every chart accepts BaseChartProps (below) plus its own props.',
      entries: chartEntries(),
    },
    { id: 'primitives', title: 'Primitives', entries: PRIMITIVES },
    { id: 'providers', title: 'Provider and hooks', entries: PROVIDERS },
    {
      id: 'building-blocks',
      title: 'Building blocks for new chart types',
      entries: BUILDING_BLOCKS,
    },
    { id: 'theming', title: 'Theming', entries: THEMING },
    { id: 'formatting', title: 'Formatting and localisation', entries: FORMATTING },
  ];
  const documented = new Set(
    [...groups.flatMap((g) => g.entries), ...EXPORT]
      .flatMap(entryNames)
      .flatMap((n) => n.split(' / ')),
  );
  const undocumented = Object.keys(Library)
    .filter((k) => !documented.has(k))
    .sort();
  return (
    <article>
      <PageHeader
        eyebrow="Reference"
        title="API reference"
        lead="Everything exported from @jafari/charts, grouped by purpose. Chart props are documented on each chart page."
      >
        <nav aria-label="On this page">
          <ul className="page-toc">
            {[
              ...groups,
              { id: 'base-props', title: 'BaseChartProps' },
              { id: 'export', title: 'Export' },
              { id: 'types', title: 'Types' },
            ].map((g) => (
              <li key={g.id}>
                <Link to={path} section={g.id}>
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <CodeBlock
        code={`import { LineChart, ChartProvider, createTheme, formatNumber } from '@jafari/charts';
import { createLinearScale } from '@jafari/charts/core';      // framework-independent math
const { exportChart } = await import('@jafari/charts/export'); // lazy`}
      />
      {groups.map((g) => (
        <Section key={g.id} id={g.id} title={g.title} lead={g.lead}>
          <ApiTable entries={g.entries} />
        </Section>
      ))}
      <Section id="base-props" title="BaseChartProps" lead="Shared by every chart.">
        <PropsTable props={BASE_PROPS} />
      </Section>
      <Section
        id="export"
        title="Export (@jafari/charts/export)"
        lead="A separate entry point: never in your main bundle unless imported."
      >
        <ApiTable entries={EXPORT} />
      </Section>
      <Section id="types" title="Types">
        <p>All TypeScript types are exported from the main entry:</p>
        <ul className="type-list">
          {TYPES.map((t) => (
            <li key={t}>
              <code>{t}</code>
            </li>
          ))}
        </ul>
        <p>
          Prop types follow the <code>&lt;Component&gt;Props</code> pattern (<code>LineChart</code>{' '}
          uses <code>CartesianChartProps</code>, <code>AreaChartProps</code>,{' '}
          <code>BarChartProps</code>, <code>PieChartProps</code>…).
        </p>
        {undocumented.length ? (
          <Callout title="Also exported (runtime values not described above)">
            <p>
              {undocumented.map((n, i) => (
                <span key={n}>
                  {i ? ', ' : ''}
                  <code>{n}</code>
                </span>
              ))}
            </p>
          </Callout>
        ) : null}
      </Section>
    </article>
  );
}
