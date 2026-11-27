import {
  AreaChart,
  BarChart,
  ChartProvider,
  ChartReferenceLine,
  ComboChart,
  GroupedBarChart,
  HorizontalBarChart,
  LineChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
  WaterfallChart,
  type Renderer,
} from '@startupjafari/charts';
import { Keyboard, MousePointer2, MousePointerClick } from 'lucide-react';
import { useState } from 'react';
import { cashflow, complaints, profit, registrations, timeSeries, universities } from '../data';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage } from '../shell/scene-page';
import { ChartCard as Card, CardGrid } from '../ui/card';
import { Field } from '../ui/field';
import { Kbd } from '../ui/kbd';
import { Segmented } from '../ui/segmented';

const series90 = timeSeries(90);
const series30 = timeSeries(30, { keys: ['active'] as const });

const RENDERERS = [
  { value: 'svg', label: 'SVG' },
  { value: 'canvas', label: 'Canvas' },
] as const;

export function Gallery() {
  const animation = useAnimation();
  const [renderer, setRenderer] = useState<Extract<Renderer, 'svg' | 'canvas'>>('svg');
  return (
    <ScenePage
      scene="gallery"
      actions={
        <Field label="Renderer" inline>
          {(id) => (
            <Segmented items={RENDERERS} value={renderer} onChange={setRenderer} labelledBy={id} />
          )}
        </Field>
      }
      hints={
        <>
          <Hint icon={MousePointer2}>Hover for a tooltip and crosshair</Hint>
          <Hint icon={MousePointerClick}>Click legend items to hide series</Hint>
          <Hint icon={Keyboard}>
            Focus a chart, then <Kbd>←</Kbd>
            <Kbd>→</Kbd> <Kbd>Home</Kbd> <Kbd>End</Kbd> <Kbd>Esc</Kbd>
          </Hint>
        </>
      }
    >
      <ChartProvider renderer={renderer}>
        <CardGrid>
          <Card
            title="Area chart"
            description="90 days of daily student activity with a soft fill."
          >
            <AreaChart
              data={series90}
              xKey="date"
              yKey="students"
              label="Students"
              height={240}
              animation={animation}
            />
          </Card>
          <Card title="Line chart" description="Two series against a dashed target reference line.">
            <LineChart
              data={series90}
              xKey="date"
              series={[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
              ]}
              height={240}
              animation={animation}
            >
              <ChartReferenceLine y={300} label="Target" />
            </LineChart>
          </Card>
          <Card
            title="Bar chart"
            description="Monthly registrations. Focus it and use the arrow keys."
          >
            <BarChart
              data={registrations}
              xKey="month"
              yKey="students"
              label="Registrations"
              height={240}
              animation={animation}
            />
          </Card>
          <Card
            title="Bar chart (negative)"
            description="Quarterly profit around zero, with value labels."
          >
            <BarChart
              data={profit}
              xKey="label"
              yKey="delta"
              label="Profit"
              height={240}
              labels
              animation={animation}
            />
          </Card>
          <Card
            title="Horizontal bar chart"
            description="Long university names on the category axis."
          >
            <HorizontalBarChart
              data={universities}
              xKey="name"
              yKey="score"
              label="Rating"
              animation={animation}
            />
          </Card>
          <Card
            title="Grouped bar chart"
            description="Complaints by category, three series side by side."
          >
            <GroupedBarChart
              data={complaints}
              xKey="category"
              series={[
                { key: 'open', label: 'Open' },
                { key: 'resolved', label: 'Resolved' },
                { key: 'rejected', label: 'Rejected' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card
            title="Stacked bar chart"
            description="Students, teachers and admins stacked per month."
          >
            <StackedBarChart
              data={registrations}
              xKey="month"
              series={[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
                { key: 'admins', label: 'Admins' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card title="Stacked bar chart (percent)" description="Each category normalised to 100%.">
            <StackedBarChart
              mode="percent"
              data={complaints}
              xKey="category"
              series={[
                { key: 'open', label: 'Open' },
                { key: 'resolved', label: 'Resolved' },
                { key: 'rejected', label: 'Rejected' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card
            title="Stacked area chart"
            description="Composition over 90 days, one layer per series."
          >
            <StackedAreaChart
              data={series90}
              xKey="date"
              series={[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card title="Combo chart" description="Bars and a line sharing one category axis.">
            <ComboChart
              data={registrations}
              xKey="month"
              series={[
                { key: 'students', label: 'Students', type: 'bar' },
                { key: 'teachers', label: 'Teachers', type: 'line' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card
            title="Waterfall chart"
            description="Running budget with an intermediate and a closing total."
          >
            <WaterfallChart
              data={cashflow}
              xKey="step"
              yKey="value"
              isTotal={(d) => Boolean(d.total)}
              height={260}
              animation={animation}
            />
          </Card>
          <Card
            title="Sparklines"
            description="Compact line, area and bar trends for tables and tiles."
          >
            <div className="grid grid-cols-3 gap-4">
              <Sparkline data={series30} xKey="date" yKey="active" title="Active users" />
              <Sparkline
                data={series30}
                xKey="date"
                yKey="active"
                variant="area"
                color="var(--jc-series-2)"
                title="Sessions"
              />
              <Sparkline
                data={series30.slice(0, 14)}
                xKey="date"
                yKey="active"
                variant="bar"
                color="var(--jc-series-3)"
                title="Signups"
              />
            </div>
          </Card>
        </CardGrid>
      </ChartProvider>
    </ScenePage>
  );
}
