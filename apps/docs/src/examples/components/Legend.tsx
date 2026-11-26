import { GroupedBarChart } from '@jafari/charts';
import { complaints } from '../data';

/** `legend.render` receives the series (with colour and visibility) and the toggle function. */
export default function Legend() {
  return (
    <GroupedBarChart
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'rejected', label: 'Rejected' },
      ]}
      height={240}
      legend={{
        render: (items, toggle) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>
            {items.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.visible}
                onClick={() => toggle(s.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 999,
                  border: `1px solid ${s.color}`,
                  background: s.visible ? s.color : 'transparent',
                  color: s.visible ? '#fff' : 'inherit',
                  font: 'inherit',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        ),
      }}
    />
  );
}
