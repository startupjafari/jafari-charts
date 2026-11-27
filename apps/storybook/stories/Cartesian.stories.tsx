import {
  AreaChart,
  BarChart,
  ChartReferenceLine,
  ComboChart,
  HorizontalBarChart,
  LineChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
  WaterfallChart,
} from '@startupjafari/charts';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { days, months, universities } from './data';

const meta: Meta = { title: 'Charts/Cartesian' };
export default meta;
type Story = StoryObj;

const two = [
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
] as const;

export const Line: Story = { render: () => <LineChart data={days} xKey="date" series={two} /> };
export const LineDifferentiated: Story = {
  name: 'Line (shapes + dashes, no colour reliance)',
  render: () => <LineChart data={days} xKey="date" series={two} differentiate dots />,
};
export const LineWithReference: Story = {
  render: () => (
    <LineChart data={days} xKey="date" yKey="students">
      <ChartReferenceLine y={500} label="Target" />
    </LineChart>
  ),
};
export const LineZoomBrush: Story = {
  render: () => <LineChart data={days} xKey="date" series={two} zoom brush />,
};
export const Area: Story = { render: () => <AreaChart data={days} xKey="date" yKey="students" /> };
export const StackedArea: Story = {
  render: () => <StackedAreaChart data={days} xKey="date" series={two} />,
};
export const StackedAreaPercent: Story = {
  render: () => <StackedAreaChart data={days} xKey="date" series={two} mode="percent" />,
};
export const Bar: Story = {
  render: () => <BarChart data={months} xKey="month" yKey="registrations" labels />,
};
export const BarNegative: Story = {
  render: () => <BarChart data={months} xKey="month" yKey="churn" labels />,
};
export const HorizontalBar: Story = {
  render: () => <HorizontalBarChart data={universities} xKey="name" yKey="rating" />,
};
export const StackedBar: Story = {
  render: () => (
    <StackedBarChart
      data={months}
      xKey="month"
      series={[{ key: 'registrations' }, { key: 'churn' }]}
    />
  ),
};
export const Combo: Story = {
  render: () => (
    <ComboChart
      data={months}
      xKey="month"
      series={[
        { key: 'registrations', type: 'bar' },
        { key: 'churn', type: 'line', axis: 'right' },
      ]}
    />
  ),
};
export const Waterfall: Story = {
  render: () => <WaterfallChart data={months} xKey="month" yKey="churn" firstIsStart={false} />,
};
export const SparklineCard: Story = {
  render: () => (
    <div style={{ width: 220, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Active students</div>
      <div style={{ fontSize: 28, fontWeight: 600 }}>18,420</div>
      <Sparkline
        data={days}
        xKey="date"
        yKey="students"
        variant="area"
        title="Active students, last 60 days"
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => <LineChart data={[] as typeof days} xKey="date" yKey="students" />,
};
export const Loading: Story = {
  render: () => <LineChart data={[] as typeof days} xKey="date" yKey="students" loading />,
};
export const LoadingWithData: Story = {
  name: 'Refetch (keeps frame)',
  render: () => <LineChart data={days} xKey="date" yKey="students" loading />,
};
export const ErrorState: Story = {
  render: () => (
    <BarChart data={months} xKey="month" yKey="registrations" error onRetry={() => {}} />
  ),
};
export const ManySeries: Story = {
  render: () => {
    const keys = Array.from({ length: 10 }, (_, i) => `s${i}`);
    const data = days.map((d, i) =>
      Object.fromEntries([
        ['date', d.date],
        ...keys.map((k, j) => [k, 50 + j * 20 + Math.sin(i / (3 + j)) * 15]),
      ]),
    );
    return <LineChart data={data} xKey="date" series={keys.map((key) => ({ key }))} />;
  },
};
export const Narrow: Story = {
  name: 'Mobile width (320px)',
  render: () => (
    <div style={{ width: 320 }}>
      <BarChart data={months} xKey="month" yKey="registrations" />
    </div>
  ),
};
