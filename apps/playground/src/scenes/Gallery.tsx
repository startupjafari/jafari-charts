import {
  AreaChart,
  BarChart,
  ChartReferenceLine,
  ComboChart,
  GroupedBarChart,
  HorizontalBarChart,
  LineChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
  WaterfallChart,
} from '@jafari/charts';
import type { ReactNode } from 'react';
import { cashflow, complaints, profit, registrations, timeSeries, universities } from '../data';

const series90 = timeSeries(90);
const series30 = timeSeries(30, { keys: ['active'] as const });

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card" data-testid={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Gallery() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  return (
    <div className="grid">
      <Card title="Area chart">
        <AreaChart
          data={series90}
          xKey="date"
          yKey="students"
          label="Students"
          height={240}
          animation={animation}
        />
      </Card>
      <Card title="Line chart">
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
      <Card title="Bar chart">
        <BarChart
          data={registrations}
          xKey="month"
          yKey="students"
          label="Registrations"
          height={240}
          animation={animation}
        />
      </Card>
      <Card title="Bar chart (negative)">
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
      <Card title="Horizontal bar chart">
        <HorizontalBarChart
          data={universities}
          xKey="name"
          yKey="score"
          label="Rating"
          animation={animation}
        />
      </Card>
      <Card title="Grouped bar chart">
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
      <Card title="Stacked bar chart">
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
      <Card title="Stacked bar chart (percent)">
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
      <Card title="Stacked area chart">
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
      <Card title="Combo chart">
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
      <Card title="Waterfall chart">
        <WaterfallChart
          data={cashflow}
          xKey="step"
          yKey="value"
          isTotal={(d) => Boolean(d.total)}
          height={260}
          animation={animation}
        />
      </Card>
      <Card title="Sparklines">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
    </div>
  );
}
