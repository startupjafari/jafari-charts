import { Link } from '../lib/router';
import { PageHeader, Section } from '../ui/Callout';
import { Example } from '../ui/Example';

export function QuickStart() {
  return (
    <article>
      <PageHeader
        eyebrow="Getting started"
        title="Quick start"
        lead="From one line of JSX to a localised, themed, interactive chart in five steps."
      />
      <Section id="first-chart" title="1. Your first chart">
        <p>
          Pass an array of objects, the field for the x axis and the field for the values.{' '}
          <code>Date</code> objects and ISO date strings are detected as time; numeric timestamps
          are plain numbers unless you set{' '}
          <code>
            xAxis={'{{'} type: 'time' {'}}'}
          </code>
          .
        </p>
        <Example id="quick-start/FirstChart" title="AreaChart" codeOpen />
      </Section>
      <Section id="series" title="2. Several series and a locale">
        <p>
          Use <code>series</code> for more than one value field. With two or more series a legend
          appears; its items toggle series. <code>locale</code> switches number and date formatting
          (here Russian).
        </p>
        <Example id="quick-start/Series" title="LineChart in Russian" codeOpen />
      </Section>
      <Section id="formatting" title="3. Format values">
        <p>
          <code>valueFormatter</code> formats tooltips, labels and the data table;{' '}
          <code>yAxis.format</code> formats tick labels. The formatting helpers (
          <code>formatNumber</code>, <code>formatCompact</code>, <code>formatPercent</code>,{' '}
          <code>formatCurrency</code>, <code>formatDate</code>) use cached Intl formatters.
        </p>
        <Example id="quick-start/Formatting" title="Currency in the tooltip" />
      </Section>
      <Section id="composition" title="4. Add reference lines and areas">
        <p>
          Primitives go inside the chart as children and use the chart’s scales — pass data values,
          not pixels.
        </p>
        <Example id="quick-start/Composition" title="Goal line and an exam period" />
      </Section>
      <Section id="provider" title="5. Set defaults once">
        <p>
          <code>ChartProvider</code> sets locale, theme, animation and renderer for every chart
          below it. This example uses Kazakh, which has built-in CLDR data for browsers whose Intl
          lacks it.
        </p>
        <Example id="quick-start/Provider" title="ChartProvider with locale kk" />
        <p>
          Next: explore the <Link to="/charts">charts</Link>, the{' '}
          <Link to="/components">components</Link> you can compose, or the{' '}
          <Link to="/themes">theming</Link> options.
        </p>
      </Section>
    </article>
  );
}
