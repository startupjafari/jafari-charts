import { CHARTS } from '../docs/charts';
import { Link } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';

const PACKAGES = [
  [
    '@jafari/charts',
    'Main package: React components and selected utilities. Most apps need only this.',
  ],
  [
    '@jafari/charts-core',
    'Framework-independent math core (scales, ticks, curves, layouts, formatting). Zero dependencies, no React or DOM imports.',
  ],
  ['@jafari/charts-react', 'React adapter: the ChartView shell, primitives and chart components.'],
  [
    '@jafari/charts-canvas',
    'Canvas 2D renderer, loaded lazily when a chart uses renderer="canvas".',
  ],
  [
    '@jafari/charts-themes',
    'Design tokens, light/dark themes, the CSS-variables stylesheet and createTheme.',
  ],
  ['@jafari/charts-export', 'SVG, PNG, WebP and CSV export (entry @jafari/charts/export).'],
] as const;

export function GettingStarted() {
  return (
    <article>
      <PageHeader
        eyebrow="Getting started"
        title="Introduction"
        lead="Jafari Charts is a data visualisation library for React, built from scratch: its own scales, tick algorithms, curves, layouts, interactions, SVG and Canvas renderers."
      />
      <Callout tone="warning" title="Status: 0.1.0 (development)">
        The library is not published to npm yet and the API may still change before 1.0. This site
        documents the current source in the repository.
      </Callout>

      <Section id="principles" title="Principles">
        <ul>
          <li>
            <strong>Performance first.</strong> Layouts are pure and memoised; each chart has one
            pointer handler throttled to the frame rate; hover state lives in an external store so
            only the tooltip and crosshair re-render; marks are batched into a few SVG paths; large
            inputs are downsampled.
          </li>
          <li>
            <strong>Beautiful by default.</strong> The defaults are the design: a palette validated
            for colour-vision deficiency, 2 px lines, rounded data ends, recessive hairline grids
            and value-first tooltips.
          </li>
          <li>
            <strong>Lightweight.</strong> ESM with one module per source file and{' '}
            <code>sideEffects: false</code>, so you ship only what you import. Canvas and export
            code are separate, lazily loaded chunks.
          </li>
          <li>
            <strong>Accessible.</strong> Every chart has a role, name and description, a keyboard
            model, a live region and a hidden data table.
          </li>
          <li>
            <strong>Zero chart dependencies.</strong> Nothing is wrapped — not d3, not another chart
            library.
          </li>
        </ul>
      </Section>

      <Section id="what-you-get" title="What every chart does without configuration">
        <ul>
          <li>Fills the container width and follows resizes (one shared ResizeObserver).</li>
          <li>Picks tick values that never overlap, and formats numbers and dates with Intl.</li>
          <li>Shows a crosshair and a shared tooltip; a legend for two or more series.</li>
          <li>Supports touch (the tooltip stays after lifting the finger) and keyboard.</li>
          <li>Renders on the server at a fixed width and hydrates without mismatches.</li>
          <li>Follows your app’s light/dark mode.</li>
          <li>Respects reduced motion and forced-colours modes.</li>
        </ul>
      </Section>

      <Section id="packages" title="Packages">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Package</th>
                <th scope="col">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGES.map(([name, text]) => (
                <tr key={name}>
                  <th scope="row">
                    <code>{name}</code>
                  </th>
                  <td>{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="next" title="Next steps">
        <div className="card-grid">
          <div className="card">
            <h3>
              <Link to="/installation" className="card-link">
                Installation
              </Link>
            </h3>
            <p>Peer dependencies, entry points, CSP and server rendering.</p>
          </div>
          <div className="card">
            <h3>
              <Link to="/quick-start" className="card-link">
                Quick start
              </Link>
            </h3>
            <p>Your first chart, several series, locale, theme and interactions.</p>
          </div>
          <div className="card">
            <h3>
              <Link to="/charts" className="card-link">
                Charts
              </Link>
            </h3>
            <p>{CHARTS.length} chart types with live examples and props tables.</p>
          </div>
          <div className="card">
            <h3>
              <Link to="/playground" className="card-link">
                Playground
              </Link>
            </h3>
            <p>Configure a chart, see the code, and measure it in your browser.</p>
          </div>
        </div>
      </Section>
    </article>
  );
}
