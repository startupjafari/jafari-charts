import bench from '../../../../benchmarks/results/latest.json';
import sizes from '../../../../benchmarks/size.json';
import { CHARTS } from '../docs/charts';
import { loadExample } from '../examples';
import { Link } from '../lib/router';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Example } from '../ui/Example';
import { ChartCard } from './ChartsIndex';

const FEATURES = [
  {
    title: 'Performance first',
    text: 'Memoised layouts, one frame-throttled pointer handler per chart, batched SVG paths, LTTB downsampling and k-d tree hit testing. Hover re-renders only the tooltip.',
  },
  {
    title: 'Beautiful by default',
    text: 'A validated palette, 2 px lines, rounded data ends, hairline grids and value-first tooltips — with no configuration.',
  },
  {
    title: 'Lightweight',
    text: 'Zero runtime dependencies in the core, one module per source file and lazy Canvas and export chunks. Budgets are checked in CI.',
  },
  {
    title: 'Zero chart dependencies',
    text: 'Every scale, tick algorithm, curve, layout and interaction is implemented in the project — nothing is wrapped.',
  },
  {
    title: 'Accessible',
    text: 'Keyboard navigation, live announcements, hidden data tables, legend buttons with aria-pressed and identity that never relies on colour alone.',
  },
  {
    title: 'SSR and theming built in',
    text: 'Deterministic layout without DOM reads, hydration without mismatches, light/dark/auto themes and CSS variables for every token.',
  },
];

function sizeOf(prefix: string): string | null {
  const row = sizes.find((r) => r.scenario.startsWith(prefix));
  return row ? row['gzip KB'] : null;
}

export function Home() {
  const lineKb = sizeOf('app: LineChart');
  const allKb = sizeOf('app: everything');
  const big = bench.scaling.find(
    (r) => r.chart === 'line' && r.renderer === 'svg' && r.points === 100000,
  );
  const Hero = loadExample('home/Hero').Component;
  const featured = [
    'line-chart',
    'bar-chart',
    'donut-chart',
    'stacked-area-chart',
    'gauge-chart',
    'waterfall-chart',
  ]
    .map((slug) => CHARTS.find((c) => c.slug === slug))
    .filter((c) => c !== undefined);
  return (
    <article className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">React charting library · v0.1.0</p>
          <h1 id="hero-title">Jafari Charts</h1>
          <p className="hero-tagline">
            Engineered for performance. Beautiful charts. Zero compromise.
          </p>
          <p className="lead">
            A self-contained data visualisation library for React with its own math core, SVG and
            Canvas renderers and one consistent visual language.
          </p>
          <div className="hero-actions">
            <Link to="/getting-started" className="btn btn-primary">
              Get started
            </Link>
            <Link to="/playground" className="btn">
              Open the playground
            </Link>
            <Link to="/charts" className="btn btn-ghost">
              Browse {CHARTS.length} charts →
            </Link>
          </div>
        </div>
        <div className="hero-chart card">
          <ErrorBoundary label="Hero chart">
            <Hero />
          </ErrorBoundary>
        </div>
      </section>

      <section className="stats" aria-label="Key numbers">
        {lineKb ? (
          <div className="stat">
            <span className="stat-value">{lineKb} KB</span>
            <span className="stat-label">
              gzip for a LineChart, including the math and CSS it uses
            </span>
          </div>
        ) : null}
        {allKb ? (
          <div className="stat">
            <span className="stat-value">{allKb} KB</span>
            <span className="stat-label">gzip for everything in @jafari/charts</span>
          </div>
        ) : null}
        {big ? (
          <div className="stat">
            <span className="stat-value">{big.domNodes}</span>
            <span className="stat-label">DOM nodes for a 100 000-point line chart (SVG)</span>
          </div>
        ) : null}
        <div className="stat">
          <span className="stat-value">0</span>
          <span className="stat-label">third-party chart or math dependencies</span>
        </div>
      </section>
      <p className="muted stats-note">
        Sizes from <code>pnpm size</code>; DOM count from the committed benchmark run (
        <Link to="/performance">methodology</Link>).
      </p>

      <section className="doc-section" aria-labelledby="features">
        <h2 id="features">Why Jafari Charts</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section" aria-labelledby="one-line">
        <h2 id="one-line">A chart in one line</h2>
        <p className="section-lead">
          Charts fill their container, pick tick values that never overlap, show a tooltip and a
          hidden data table for screen readers — without configuration. Keys are type-checked
          against your data.
        </p>
        <Example id="home/OneLine" title="Your first chart" codeOpen />
      </section>

      <section className="doc-section" aria-labelledby="gallery">
        <h2 id="gallery">Gallery</h2>
        <div className="card-grid">
          {featured.map((d) => (
            <ChartCard key={d.slug} doc={d} />
          ))}
        </div>
        <p>
          <Link to="/charts">See all charts →</Link> ·{' '}
          <Link to="/examples">Dashboard example →</Link>
        </p>
      </section>
    </article>
  );
}
