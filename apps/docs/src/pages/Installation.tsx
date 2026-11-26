import { Link } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';

export function Installation() {
  return (
    <article>
      <PageHeader
        eyebrow="Getting started"
        title="Installation"
        lead="One package, two peer dependencies, no CSS import required."
      />
      <Callout tone="warning" title="Not on npm yet">
        Jafari Charts 0.1.0 has not been published. The commands below are what installation will
        look like once it is; until then the packages are consumed from the monorepo workspace.
      </Callout>

      <Section id="install" title="Install">
        <CodeBlock
          files={[
            { name: 'pnpm', code: 'pnpm add @jafari/charts', language: 'bash' },
            { name: 'npm', code: 'npm install @jafari/charts', language: 'bash' },
            { name: 'yarn', code: 'yarn add @jafari/charts', language: 'bash' },
          ]}
        />
        <p>
          <code>react</code> and <code>react-dom</code> 18.2 or newer are peer dependencies. There
          are no other runtime dependencies.
        </p>
      </Section>

      <Section id="entry-points" title="Entry points">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Import</th>
                <th scope="col">Contents</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <code>@jafari/charts</code>
                </th>
                <td>
                  Chart components, primitives, <code>ChartProvider</code>, hooks,{' '}
                  <code>createTheme</code> and the formatting helpers.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>@jafari/charts/core</code>
                </th>
                <td>The framework-independent math core (scales, ticks, curves, models…).</td>
              </tr>
              <tr>
                <th scope="row">
                  <code>@jafari/charts/themes</code>
                </th>
                <td>Tokens, themes and the stylesheet generator.</td>
              </tr>
              <tr>
                <th scope="row">
                  <code>@jafari/charts/export</code>
                </th>
                <td>SVG/PNG/WebP/CSV export — never in your main bundle unless imported.</td>
              </tr>
              <tr>
                <th scope="row">
                  <code>@jafari/charts/styles.css</code>
                </th>
                <td>The stylesheet, for strict Content Security Policies.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="styles" title="Styles">
        <p>
          Styles are injected automatically (React 19 <code>&lt;style precedence&gt;</code>,
          deduplicated and SSR-safe). With a strict CSP that forbids inline styles, import the
          stylesheet and turn injection off:
        </p>
        <CodeBlock
          title="main.tsx"
          code={`import '@jafari/charts/styles.css';
import { ChartProvider } from '@jafari/charts';

root.render(
  <ChartProvider injectStyles={false}>
    <App />
  </ChartProvider>,
);`}
        />
      </Section>

      <Section id="ssr" title="Server rendering and Next.js">
        <p>
          Charts render on the server at <code>initialWidth</code> (640 px by default) so the HTML
          is meaningful, hydrate without mismatches and then adapt to the measured width. Layout
          never reads the DOM, so server and client compute identical markup.
        </p>
        <p>
          The React components ship with the <code>"use client"</code> directive, so they can be
          imported from Next.js App Router server components.
        </p>
        <CodeBlock
          title="app/page.tsx"
          code={`import { LineChart } from '@jafari/charts';

export default async function Page() {
  const data = await getAnalytics();
  return <LineChart data={data} xKey="date" yKey="users" initialWidth={720} />;
}`}
        />
      </Section>

      <Section id="typescript" title="TypeScript">
        <p>
          Types ship with the package. Keys are checked against your data: <code>xKey</code> must be
          a date, number or string field, and series keys must be numeric fields.
        </p>
        <CodeBlock
          code={`type Row = { date: string; users: number; plan: string };

<LineChart<Row> data={rows} xKey="date" yKey="users" />; // ✓
<LineChart<Row> data={rows} xKey="date" yKey="plan" />;  // ✗ 'plan' is not numeric`}
        />
      </Section>

      <Section id="export" title="Export (optional)">
        <p>Load the export module only when the user asks for a download:</p>
        <CodeBlock
          code={`const { exportChart } = await import('@jafari/charts/export');
await exportChart(element, { format: 'png', scale: 2, background: 'light', filename: 'growth' });`}
        />
        <p>
          Next: <Link to="/quick-start">Quick start</Link>.
        </p>
      </Section>
    </article>
  );
}
