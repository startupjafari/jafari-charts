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
import { Hand, Keyboard, MousePointerClick, SquareDashedMousePointer, ZoomIn } from '../ui/icons';
import { useState, type ReactNode } from 'react';
import { months, rng } from '../data';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage } from '../shell/scene-page';
import { Button } from '../ui/button';
import { ChartCard, CardGrid, Readout } from '../ui/card';
import { Kbd } from '../ui/kbd';

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

function Card(props: {
  id: string;
  title: string;
  description: ReactNode;
  wide?: boolean;
  presets?: ReactNode;
  readouts: ReactNode;
  children: ReactNode;
}) {
  return (
    <ChartCard
      id={props.id}
      title={props.title}
      description={props.description}
      wide={props.wide}
      footer={
        <>
          {props.presets && (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Presets</span>
              {props.presets}
            </span>
          )}
          <span className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
            {props.readouts}
          </span>
        </>
      }
    >
      {props.children}
    </ChartCard>
  );
}

function Preset({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}

const placeholder = "empty:before:text-muted-foreground empty:before:content-['—']";

export function Zoom() {
  const animation = useAnimation();
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
    <ScenePage
      scene="zoom"
      hints={
        <>
          <Hint icon={ZoomIn}>
            <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + wheel zooms
          </Hint>
          <Hint icon={Hand}>Drag pans when zoomed</Hint>
          <Hint icon={SquareDashedMousePointer}>Drag selects on brush charts</Hint>
          <Hint icon={MousePointerClick}>Double-click resets</Hint>
          <Hint icon={Keyboard}>
            Focused: <Kbd>+</Kbd>
            <Kbd>−</Kbd>
            <Kbd>0</Kbd> zoom, <Kbd>⇧</Kbd>+<Kbd>←</Kbd>
            <Kbd>→</Kbd> pan
          </Hint>
        </>
      }
    >
      <CardGrid>
        <Card
          id="scatter"
          title="Scatter: zoom both axes, brush points"
          description="Ctrl/⌘ + wheel zooms x and y together; dragging a rectangle selects points and zooms into them."
          presets={
            <Preset
              onClick={() => {
                setXDomain([10, 20]);
                setYDomain([60, 100]);
              }}
            >
              Zoom to top performers
            </Preset>
          }
          readouts={
            <>
              <Readout label="Domain">
                <output data-testid="scatter-domain">{`x ${fmt(xDomain)}; y ${fmt(yDomain)}`}</output>
              </Readout>
              <Readout label="Brushed points">
                <output data-testid="scatter-brush" className={placeholder}>
                  {picked}
                </output>
              </Readout>
            </>
          }
        >
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
        </Card>

        <Card
          id="bars"
          title="Bar chart: category window"
          description="Zoom into whole months: Ctrl/⌘ + wheel, drag to pan, + − 0 and ⇧ + arrows when focused."
          presets={<Preset onClick={() => setRange([18, 23])}>Last 6 months</Preset>}
          readouts={
            <Readout label="Window">
              <output data-testid="bars-range">{range ? range.join('-') : 'all'}</output>
            </Readout>
          }
        >
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
        </Card>

        <Card
          id="bar-brush"
          title="Stacked bars: select a range"
          description="Drag across the bars to select a run of months."
          readouts={
            <Readout label="Selection">
              <output data-testid="bar-brush-result" className={placeholder}>
                {brushed}
              </output>
            </Readout>
          }
        >
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
        </Card>

        <Card
          id="combo"
          title="Combo chart: brush to zoom"
          description="Bars and a pass-rate line on a second axis; brushing zooms into the months."
          readouts={
            <Readout label="Window">
              <output data-testid="combo-range">{comboRange ? comboRange.join('-') : 'all'}</output>
            </Readout>
          }
        >
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
        </Card>

        <Card
          id="waterfall"
          title="Waterfall: zoom into steps"
          description="Running totals stay correct inside a zoomed window."
          readouts={
            <span className="text-muted-foreground">
              Uncontrolled: the chart keeps its own window
            </span>
          }
        >
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

        <Card
          id="treemap"
          title="Treemap: controlled drill-down"
          description="The drill-down path is React state; clicks report back, buttons set it."
          presets={
            <>
              <Preset onClick={() => setPath(['Academics', 'Engineering'])}>
                Show Engineering
              </Preset>
              <Preset onClick={() => setPath([])}>Whole university</Preset>
            </>
          }
          readouts={
            <Readout label="Path">
              <output data-testid="treemap-path">{path.length ? path.join(' / ') : 'root'}</output>
            </Readout>
          }
        >
          <TreemapChart
            data={faculties}
            drilldownPath={path}
            onDrilldownPathChange={setPath}
            animation={animation}
            height={260}
          />
        </Card>

        <Card
          id="calendar"
          title="Calendar: select days"
          description="Drag, or ⇧ + arrows when focused, to select a range of days; the active day is controlled."
          wide
          presets={<Preset onClick={() => setActiveDate('2025-06-01')}>Highlight Jun 1</Preset>}
          readouts={
            <>
              <Readout label="Selection">
                <output data-testid="calendar-range" className={placeholder}>
                  {selection}
                </output>
              </Readout>
              <Readout label="Active day">
                <output data-testid="calendar-active">
                  {activeDate === null
                    ? 'none'
                    : typeof activeDate === 'string'
                      ? activeDate
                      : day(activeDate)}
                </output>
              </Readout>
            </>
          }
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
        </Card>
      </CardGrid>
    </ScenePage>
  );
}
