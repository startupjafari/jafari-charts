import {
  AreaChart,
  BarChart,
  CalendarHeatmap,
  DonutChart,
  formatCompact,
  formatPercent,
  GroupedBarChart,
  HorizontalBarChart,
  LineChart,
  RadialProgressChart,
  Sparkline,
} from '@startupjafari/charts';
import type { ReactNode } from 'react';
import {
  activity,
  complaints,
  dailyLogins,
  dailyUsers,
  registrations,
  roles,
  universities,
  userGrowth,
} from '../data';

function Card({
  title,
  span = 1,
  children,
}: {
  title: string;
  /** Columns to span: 1, 2 or the full row. */
  span?: 1 | 2 | 'full';
  children: ReactNode;
}) {
  const cls = span === 'full' ? ' dash-full' : span === 2 ? ' dash-wide' : '';
  return (
    <section className={`dash-card${cls}`} aria-label={title}>
      <h3 className="dash-title">{title}</h3>
      {children}
    </section>
  );
}

/** A KPI card: latest value, change over the period and a sparkline of the values. */
function Kpi({ label, values, color }: { label: string; values: number[]; color: string }) {
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const change = first ? (last - first) / first : 0;
  return (
    <section className="dash-card dash-kpi" aria-label={label}>
      <span className="dash-kpi-label">{label}</span>
      <span className="dash-kpi-value">{formatCompact(last)}</span>
      <span className="dash-kpi-change" data-trend={change >= 0 ? 'up' : 'down'}>
        {change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(change))} in 30 days
      </span>
      <Sparkline
        data={values.map((value, day) => ({ day, value }))}
        xKey="day"
        yKey="value"
        variant="area"
        color={color}
        height={44}
        title={`${label}, last 30 days`}
      />
    </section>
  );
}

const last30 = dailyUsers.slice(-30);
const lastActivity = activity.slice(-30);
const total = roles.reduce((s, r) => s + r.count, 0);

export default function Dashboard() {
  return (
    <div className="dash">
      <div className="dash-kpis">
        <Kpi label="Active users" values={last30.map((d) => d.users)} color="var(--jc-series-1)" />
        <Kpi label="Sessions" values={last30.map((d) => d.sessions)} color="var(--jc-series-2)" />
        <Kpi
          label="Active students"
          values={lastActivity.map((d) => d.students)}
          color="var(--jc-series-3)"
        />
        <Kpi
          label="Active teachers"
          values={lastActivity.map((d) => d.teachers)}
          color="var(--jc-series-4)"
        />
      </div>

      <div className="dash-grid">
        <Card title="User growth" span={2}>
          <AreaChart
            data={userGrowth}
            xKey="month"
            yKey="users"
            label="Registered users"
            valueFormatter={(v) => formatCompact(v)}
            height={240}
          />
        </Card>
        <Card title="Plan completion">
          <RadialProgressChart
            data={[
              { label: 'Enrollment', value: 86 },
              { label: 'Course setup', value: 64 },
              { label: 'Assessments', value: 41 },
            ]}
            height={240}
          />
        </Card>

        <Card title="Activity by role" span={2}>
          <LineChart
            data={activity}
            xKey="date"
            series={[
              { key: 'students', label: 'Students' },
              { key: 'teachers', label: 'Teachers' },
              { key: 'staff', label: 'Staff' },
            ]}
            height={240}
          />
        </Card>
        <Card title="Users by role">
          <DonutChart
            data={roles}
            labelKey="role"
            valueKey="count"
            centerValue={formatCompact(total)}
            centerLabel="users"
            height={200}
          />
        </Card>

        <Card title="Registrations per month">
          <BarChart
            data={registrations}
            xKey="month"
            yKey="students"
            label="Students"
            height={220}
          />
        </Card>
        <Card title="Complaints by category">
          <GroupedBarChart
            data={complaints}
            xKey="category"
            series={[
              { key: 'open', label: 'Open' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'rejected', label: 'Rejected' },
            ]}
            height={220}
          />
        </Card>
        <Card title="University ratings">
          <HorizontalBarChart data={universities} xKey="name" yKey="score" label="Rating" />
        </Card>

        <Card title="Daily logins, 2025" span="full">
          <CalendarHeatmap
            data={dailyLogins}
            dateKey="date"
            valueKey="logins"
            valueLabel="Logins"
            title="Daily logins in 2025"
          />
        </Card>
      </div>
    </div>
  );
}
