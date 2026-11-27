import {
  BarChart,
  CalendarHeatmap,
  ComboChart,
  ScatterChart,
  StackedBarChart,
  TreemapChart,
  WaterfallChart,
  type TreemapDatum,
} from '@startupjafari/charts';
import { useState, type ReactNode } from 'react';
import { months, rng } from '../data';

/** Deterministic fixtures for zoom / brush / controlled-state demos and e2e tests. */

function normal(r: () => number): number {
  return Math.sqrt(-2 * Math.log(Math.max(1e-12, r()))) * Math.cos(2 * Math.PI * r());
}

const r1 = rng(21);
const students = ['Bachelor', 'Master', 'PhD'].flatMap((level, g) =>
  Array.from({ length: 80 }, (_, i) => {
    const hours = Math.max(0, 5 + g * 4 + normal(r1) * 3);
    return {
      id: `${level}-${i}`,
      level,
      hours: Math.round(hours * 10) / 10,
      score: Math.round(Math.min(100, Math.max(20, 40 + hours * 2.8 + normal(r1) * 8))),
    };
  }),
);

const r2 = rng(8);
const monthly = Array.from({ length: 24 }, (_, i) => ({
  month: `${months[i % 12]} ${i < 12 ? 24 : 25}`,
  online: Math.round(120 + i * 9 + r2() * 60),
  campus: Math.round(200 - i * 3 + r2() * 50),
  rate: Math.round((40 + i * 1.5 + r2() * 8) * 10) / 10,
}));

const budget = [
  { step: 'Start', amount: 1200 },
  ...months.slice(0, 10).map((m, i) => ({ step: m, amount: Math.round((r2() - 0.4) * 400) + i })),
  { step: 'Total', amount: 0 },
];

const days = (() => {
  const r = rng(3);
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(2025, 0, 1 + i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      count: r() < (weekend ? 0.55 : 0.15) ? 0 : Math.round(r() * (weekend ? 4 : 12)),
    };
  });
})();

const faculties: TreemapDatum = {
  name: 'University',
  children: [
    {
      name: 'Academics',
      children: [
        {
          name: 'Engineering',
          children: [
            { name: 'Salaries', value: 4200 },
            { name: 'Labs', value: 1650 },
            { name: 'Equipment', value: 980 },
          ],
        },
        {
          name: 'Sciences',
          children: [
            { name: 'Salaries', value: 3100 },
            { name: 'Grants', value: 1400 },
          ],
        },
      ],
    },
    {
      name: 'Services',
      children: [
        { name: 'Scholarships', value: 2600 },
        { name: 'Dormitories', value: 1850 },
        { name: 'Sports', value: 510 },
      ],
    },
    {
      name: 'Operations',
      children: [
        { name: 'Facilities', value: 2100 },
        { name: 'IT', value: 1300 },
      ],
    },
  ],
};

const fmt = (d: readonly [number, number] | null) =>
  d ? `${d[0].toFixed(1)}–${d[1].toFixed(1)}` : 'full';
const day = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function Card(props: { id: string; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section
      className="card"
      data-testid={props.id}
      style={props.wide ? { gridColumn: '1 / -1' } : undefined}
    >
      <h3>{props.title}</h3>
      {props.children}
    </section>
  );
}

const out = { fontSize: 12, color: '#64748b', display: 'block', marginTop: 6 } as const;
const row = { display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' } as const;

export function Zoom() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  const [xDomain, setXDomain] = useState<readonly [number, number] | null>(null);
  const [yDomain, setYDomain] = useState<readonly [number, number] | null>(null);
  const [picked, setPicked] = useState('');
  const [range, setRange] = useState<readonly [number, number] | null>(null);
  const [brushed, setBrushed] = useState('');
  const [comboRange, setComboRange] = useState<readonly [number, number] | null>(null);
  const [selection, setSelection] = useState('');
  const [activeDate, setActiveDate] = useState<Date | string | null>(null);
  const [path, setPath] = useState<string[]>([]);

  return (
    <div className="grid">
      <Card id="scatter" title="Scatter: Ctrl/⌘ + wheel zooms both axes, drag selects points">
        <ScatterChart
          data={students}
          xKey="hours"
          yKey="score"
          groupKey="level"
          labelKey="id"
          xLabel="Study hours"
          yLabel="Score"
          zoom
          brush
          xDomain={xDomain}
          yDomain={yDomain}
          onXDomainChange={setXDomain}
          onYDomainChange={setYDomain}
          onBrush={(s) => setPicked(`${s.indices.length}`)}
          animation={animation}
          height={300}
        />
        <div style={row}>
          <button
            type="button"
            onClick={() => {
              setXDomain([10, 20]);
              setYDomain([60, 100]);
            }}
          >
            Zoom to top performers
          </button>
        </div>
        <output style={out} data-testid="scatter-domain">
          {`x ${fmt(xDomain)}; y ${fmt(yDomain)}`}
        </output>
        <output style={out} data-testid="scatter-brush">
          {picked}
        </output>
      </Card>

      <Card id="bars" title="Bar chart: category window (Ctrl/⌘ + wheel, drag, + − 0, ⇧ + arrows)">
        <BarChart
          data={monthly}
          xKey="month"
          series={[
            { key: 'online', label: 'Online' },
            { key: 'campus', label: 'Campus' },
          ]}
          zoom
          categoryRange={range}
          onCategoryRangeChange={setRange}
          animation={animation}
          height={300}
        />
        <div style={row}>
          <button type="button" onClick={() => setRange([18, 23])}>
            Last 6 months
          </button>
        </div>
        <output style={out} data-testid="bars-range">
          {range ? range.join('-') : 'all'}
        </output>
      </Card>

      <Card id="bar-brush" title="Stacked bars: drag to select a category range">
        <StackedBarChart
          data={monthly}
          xKey="month"
          series={[
            { key: 'online', label: 'Online' },
            { key: 'campus', label: 'Campus' },
          ]}
          brush
          onBrush={(r) => setBrushed(`${r.from}–${r.to} (${r.startIndex}-${r.endIndex})`)}
          animation={animation}
          height={260}
        />
        <output style={out} data-testid="bar-brush-result">
          {brushed}
        </output>
      </Card>

      <Card id="combo" title="Combo chart: brush zooms into the selected months">
        <ComboChart
          data={monthly}
          xKey="month"
          series={[
            { key: 'online', label: 'Online' },
            { key: 'rate', label: 'Pass rate', type: 'line', axis: 'right' },
          ]}
          zoom
          brush
          categoryRange={comboRange}
          onCategoryRangeChange={setComboRange}
          animation={animation}
          height={260}
        />
        <output style={out} data-testid="combo-range">
          {comboRange ? comboRange.join('-') : 'all'}
        </output>
      </Card>

      <Card id="waterfall" title="Waterfall: zoom into a window of steps">
        <WaterfallChart
          data={budget}
          xKey="step"
          yKey="amount"
          isTotal={(d) => d.step === 'Total'}
          zoom
          animation={animation}
          height={260}
        />
      </Card>

      <Card id="treemap" title="Treemap: controlled drill-down path">
        <TreemapChart
          data={faculties}
          drilldownPath={path}
          onDrilldownPathChange={setPath}
          animation={animation}
          height={260}
        />
        <div style={row}>
          <button type="button" onClick={() => setPath(['Academics', 'Engineering'])}>
            Show Engineering
          </button>
          <button type="button" onClick={() => setPath([])}>
            Whole university
          </button>
        </div>
        <output style={out} data-testid="treemap-path">
          {path.length ? path.join(' / ') : 'root'}
        </output>
      </Card>

      <Card
        id="calendar"
        title="Calendar: drag (or ⇧ + arrows) selects days; controlled active day"
        wide
      >
        <CalendarHeatmap
          data={days}
          dateKey="date"
          valueKey="count"
          valueLabel="Submissions"
          brush
          onBrush={(r) => setSelection(`${day(r.from)}..${day(r.to)}`)}
          activeDate={activeDate}
          onActiveDateChange={setActiveDate}
          animation={animation}
        />
        <div style={row}>
          <button type="button" onClick={() => setActiveDate('2025-06-01')}>
            Highlight Jun 1
          </button>
        </div>
        <output style={out} data-testid="calendar-range">
          {selection}
        </output>
        <output style={out} data-testid="calendar-active">
          {activeDate === null
            ? 'none'
            : typeof activeDate === 'string'
              ? activeDate
              : day(activeDate)}
        </output>
      </Card>
    </div>
  );
}
