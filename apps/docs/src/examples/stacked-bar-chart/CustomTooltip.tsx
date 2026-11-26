import { StackedBarChart } from '@jafari/charts';
import { registrations } from '../data';

/** `tooltip.render` replaces the content; rows arrive formatted, the datum gives raw numbers. */
export default function CustomTooltip() {
  return (
    <StackedBarChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'admins', label: 'Admins' },
      ]}
      tooltip={{
        sort: 'desc',
        render: (data, active) => {
          const d = registrations[active.position];
          const total = d ? d.students + d.teachers + d.admins : 0;
          return (
            <div style={{ display: 'grid', gap: 2 }}>
              <strong>{data.title}</strong>
              {data.rows.map((r) => (
                <span
                  key={r.key}
                  style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}
                >
                  <span style={{ color: r.color }}>● {r.label}</span>
                  <span>{r.value}</span>
                </span>
              ))}
              <span
                style={{ borderTop: '1px solid var(--jc-border)', paddingTop: 4, marginTop: 2 }}
              >
                Total: <strong>{total}</strong>
              </span>
            </div>
          );
        },
      }}
      height={260}
    />
  );
}
