import { ChartReferenceLine, ScatterChart } from '@startupjafari/charts';
import { useMemo, useState, type ReactNode } from 'react';
import { rng } from '../data';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card" data-testid={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

/** Box–Muller normal sample from a uniform generator. */
function normal(r: () => number): number {
  return Math.sqrt(-2 * Math.log(Math.max(1e-12, r()))) * Math.cos(2 * Math.PI * r());
}

const r1 = rng(5);
const students = ['Bachelor', 'Master', 'PhD'].flatMap((level, g) =>
  Array.from({ length: 40 }, (_, i) => {
    const hours = Math.max(0, 6 + g * 4 + normal(r1) * 3.2);
    return {
      id: `${level}-${i}`,
      level,
      hours: Math.round(hours * 10) / 10,
      score: Math.round(Math.min(100, Math.max(20, 42 + hours * 2.6 + normal(r1) * 9))),
    };
  }),
);

const countries = [
  { name: 'Kazakhstan', region: 'Asia', gdp: 12_300, life: 74.4, pop: 19.6 },
  { name: 'Uzbekistan', region: 'Asia', gdp: 2_500, life: 71.7, pop: 35.6 },
  { name: 'Japan', region: 'Asia', gdp: 33_800, life: 84.5, pop: 124.5 },
  { name: 'India', region: 'Asia', gdp: 2_500, life: 70.8, pop: 1_428 },
  { name: 'China', region: 'Asia', gdp: 12_600, life: 78.6, pop: 1_410 },
  { name: 'Germany', region: 'Europe', gdp: 52_700, life: 81.0, pop: 84.5 },
  { name: 'Poland', region: 'Europe', gdp: 22_100, life: 78.6, pop: 36.7 },
  { name: 'Spain', region: 'Europe', gdp: 33_500, life: 83.9, pop: 48.4 },
  { name: 'Turkey', region: 'Europe', gdp: 13_100, life: 78.5, pop: 85.3 },
  { name: 'Nigeria', region: 'Africa', gdp: 1_600, life: 54.5, pop: 223.8 },
  { name: 'Egypt', region: 'Africa', gdp: 3_500, life: 70.2, pop: 112.7 },
  { name: 'Kenya', region: 'Africa', gdp: 2_000, life: 62.7, pop: 55.1 },
  { name: 'South Africa', region: 'Africa', gdp: 6_200, life: 62.3, pop: 60.4 },
];

const r2 = rng(17);
const changes = Array.from({ length: 60 }, (_, i) => ({
  school: `School ${i + 1}`,
  enrolment: Math.round(normal(r2) * 12 * 10) / 10,
  results: Math.round((normal(r2) * 6 + 1.5) * 10) / 10,
}));

const r3 = rng(23);
const centres = [
  [30, 40],
  [65, 70],
  [70, 25],
] as const;
const big = Array.from({ length: 10_000 }, (_, i) => {
  const g = i % 3;
  const [cx, cy] = centres[g] as readonly [number, number];
  return {
    cluster: ['North', 'East', 'South'][g] as string,
    x: cx + normal(r3) * 9,
    y: cy + normal(r3) * 8,
  };
});

const wide = Array.from({ length: 24 }, (_, i) => ({
  month: i + 1,
  enrolled: 400 + i * 18 + Math.round(Math.sin(i / 2) * 30),
  graduated: 120 + i * 11 + Math.round(Math.cos(i / 3) * 25),
}));

const messy = [
  { x: 1, y: 3 },
  { x: Number.NaN, y: 4 },
  { x: 2, y: null },
  { x: 3, y: 5 },
  { x: 3, y: 5 },
  { x: 3, y: 5 },
  { x: -2, y: -1 },
];

export function Scatter() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  const [hovered, setHovered] = useState('—');
  const bigData = useMemo(() => big, []);
  return (
    <div className="grid">
      <Card title="Scatter chart (groups)">
        <ScatterChart
          data={students}
          xKey="hours"
          yKey="score"
          groupKey="level"
          labelKey="id"
          xLabel="Study hours / week"
          yLabel="Exam score"
          animation={animation}
        />
      </Card>
      <Card title="Bubble chart (log x, size = population)">
        <ScatterChart
          data={countries}
          xKey="gdp"
          yKey="life"
          sizeKey="pop"
          groupKey="region"
          labelKey="name"
          xAxis={{ scale: 'log', title: 'GDP per capita, $' }}
          yAxis={{ title: 'Life expectancy' }}
          sizeLabel="Population, M"
          xFormatter={(v) => `$${Math.round(v).toLocaleString('en')}`}
          animation={animation}
        />
      </Card>
      <Card title="Negative values + reference lines">
        <ScatterChart
          data={changes}
          xKey="enrolment"
          yKey="results"
          labelKey="school"
          xLabel="Enrolment change, %"
          yLabel="Results change, pts"
          animation={animation}
        >
          <ChartReferenceLine y={5} label="Target" />
          <ChartReferenceLine x={10} />
        </ScatterChart>
      </Card>
      <Card title={`10 000 points (renderer auto → canvas) · hover: ${hovered}`}>
        <ScatterChart
          data={bigData}
          xKey="x"
          yKey="y"
          groupKey="cluster"
          renderer="auto"
          animation={animation}
          onHover={(e) => setHovered(e ? `${e.series} #${e.index}` : '—')}
        />
      </Card>
      <Card title="Wide data (series) + differentiate">
        <ScatterChart
          data={wide}
          xKey="month"
          series={[
            { key: 'enrolled', label: 'Enrolled' },
            { key: 'graduated', label: 'Graduated' },
          ]}
          differentiate
          xLabel="Month"
          animation={animation}
        />
      </Card>
      <Card title="Edge cases: NaN/null, duplicates, single point, empty">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <ScatterChart data={messy} xKey="x" yKey="y" height={180} animation={animation} />
          <ScatterChart
            data={[{ x: 5, y: 42 }]}
            xKey="x"
            yKey="y"
            height={180}
            animation={animation}
          />
          <ScatterChart
            data={[] as { x: number; y: number }[]}
            xKey="x"
            yKey="y"
            height={120}
            animation={animation}
          />
        </div>
      </Card>
    </div>
  );
}
