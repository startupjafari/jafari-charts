import { BarChart, LineChart } from '@jafari/charts';
import * as exporter from '@jafari/charts/export';
import { registrations, timeSeries } from '../data';

const series = timeSeries(30);

declare global {
  interface Window {
    __export?: typeof exporter;
  }
}
// Exposed for tests/e2e/export.spec.ts (exercises the real browser APIs).
window.__export = exporter;

/** Fixture for export tests: one SVG chart and one canvas chart. */
export function Export() {
  return (
    <div className="grid">
      <section className="card" data-testid="svg-chart">
        <h3>SVG chart</h3>
        <LineChart
          data={series}
          xKey="date"
          series={[
            { key: 'students', label: 'Students' },
            { key: 'teachers', label: 'Teachers' },
          ]}
          animation={false}
          height={240}
        />
      </section>
      <section className="card" data-testid="canvas-chart">
        <h3>Canvas chart</h3>
        <BarChart
          data={registrations}
          xKey="month"
          yKey="students"
          renderer="canvas"
          animation={false}
          height={240}
        />
      </section>
    </div>
  );
}
