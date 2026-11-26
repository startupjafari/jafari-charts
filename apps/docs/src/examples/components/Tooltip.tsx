import { LineChart } from '@jafari/charts';
import { dailyUsers } from '../data';

/** A custom tooltip that adds the change against the previous day. */
export default function Tooltip() {
  return (
    <LineChart
      data={dailyUsers}
      xKey="date"
      yKey="users"
      label="Users"
      height={240}
      tooltip={{
        offset: 18,
        render: (data, active) => {
          const today = dailyUsers[active.position];
          const before = dailyUsers[active.position - 1];
          const change = today && before ? today.users - before.users : null;
          return (
            <div>
              <div style={{ opacity: 0.7 }}>{data.title}</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{data.rows[0]?.value}</div>
              {change !== null ? (
                <div style={{ color: change >= 0 ? 'var(--jc-positive)' : 'var(--jc-negative)' }}>
                  {change >= 0 ? '+' : ''}
                  {change} vs previous day
                </div>
              ) : null}
            </div>
          );
        },
      }}
    />
  );
}
