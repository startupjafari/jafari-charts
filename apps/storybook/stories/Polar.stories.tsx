import { DonutChart, GaugeChart, PieChart, RadialProgressChart } from '@startupjafari/charts';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { roles } from './data';

const meta: Meta = { title: 'Charts/Polar' };
export default meta;
type Story = StoryObj;

export const Donut: Story = {
  render: () => <DonutChart data={roles} labelKey="role" valueKey="count" />,
};
export const DonutCustomCentre: Story = {
  render: () => (
    <DonutChart data={roles} labelKey="role" valueKey="count" centerLabel="users" tooltip />
  ),
};
export const Pie: Story = {
  render: () => <PieChart data={roles} labelKey="role" valueKey="count" />,
};
export const PieOutsideLabels: Story = {
  render: () => (
    <PieChart data={roles} labelKey="role" valueKey="count" labels="outside" legend={false} />
  ),
};
export const RadialProgress: Story = {
  render: () => <RadialProgressChart value={72} label="Plan completion" />,
};
export const RadialProgressRings: Story = {
  render: () => (
    <RadialProgressChart
      data={[
        { label: 'Attendance', value: 86 },
        { label: 'Assignments', value: 64 },
        { label: 'Exams', value: 41 },
      ]}
    />
  ),
};
export const Gauge: Story = {
  render: () => (
    <GaugeChart
      value={68}
      label="Satisfaction"
      bands={[
        { to: 40, color: 'var(--jc-negative)', label: 'Low' },
        { to: 75, color: 'var(--jc-warning)', label: 'Medium' },
        { to: 100, color: 'var(--jc-positive)', label: 'High' },
      ]}
    />
  ),
};
export const GaugeNeedle: Story = {
  render: () => <GaugeChart value={82} needle variant="arc" valueFormatter={(v) => `${v}%`} />,
};
export const EmptyDonut: Story = {
  render: () => <DonutChart data={[] as typeof roles} labelKey="role" valueKey="count" />,
};
