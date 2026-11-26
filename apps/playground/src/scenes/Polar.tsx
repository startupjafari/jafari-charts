import { DonutChart, GaugeChart, PieChart, RadialProgressChart } from '@jafari/charts';
import type { ReactNode } from 'react';

const roles = [
  { role: 'Students', count: 18420 },
  { role: 'Teachers', count: 1260 },
  { role: 'Curators', count: 340 },
  { role: 'Admins', count: 58 },
];
const browsers = [
  { name: 'Chrome', share: 61 },
  { name: 'Safari', share: 19 },
  { name: 'Edge', share: 9 },
  { name: 'Firefox', share: 6 },
  { name: 'Other', share: 5 },
];

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card" data-testid={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Polar() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  return (
    <div className="grid">
      <Card title="Donut chart">
        <DonutChart data={roles} labelKey="role" valueKey="count" animation={animation} />
      </Card>
      <Card title="Pie chart">
        <PieChart data={browsers} labelKey="name" valueKey="share" animation={animation} />
      </Card>
      <Card title="Pie chart (outside labels)">
        <PieChart
          data={browsers}
          labelKey="name"
          valueKey="share"
          labels="outside"
          legend={false}
          animation={animation}
        />
      </Card>
      <Card title="Radial progress">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <RadialProgressChart value={72} label="Plan completion" animation={animation} />
          <RadialProgressChart
            data={[
              { label: 'Attendance', value: 86 },
              { label: 'Assignments', value: 64 },
              { label: 'Exams', value: 41 },
            ]}
            animation={animation}
          />
        </div>
      </Card>
      <Card title="Gauge chart">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <GaugeChart
            value={68}
            label="Satisfaction"
            bands={[
              { to: 40, color: 'var(--jc-negative)', label: 'Low' },
              { to: 75, color: 'var(--jc-warning)', label: 'Medium' },
              { to: 100, color: 'var(--jc-positive)', label: 'High' },
            ]}
            animation={animation}
          />
          <GaugeChart
            value={82}
            needle
            variant="arc"
            label="Server load"
            valueFormatter={(v) => `${v}%`}
            bands={[
              { to: 60, color: 'var(--jc-positive)' },
              { to: 85, color: 'var(--jc-warning)' },
              { to: 100, color: 'var(--jc-negative)' },
            ]}
            animation={animation}
          />
        </div>
      </Card>
      <Card title="Donut (empty)">
        <DonutChart data={[] as typeof roles} labelKey="role" valueKey="count" />
      </Card>
    </div>
  );
}
