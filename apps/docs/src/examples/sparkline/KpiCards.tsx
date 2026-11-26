import { formatCompact, Sparkline } from '@jafari/charts';
import { dailyUsers } from '../data';

const last = dailyUsers.slice(-30);
const first = last[0]?.users ?? 0;
const current = last[last.length - 1]?.users ?? 0;
const change = first ? (current - first) / first : 0;

export default function KpiCards() {
  return (
    <div
      style={{
        maxWidth: 280,
        padding: 16,
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.75 }}>Active users</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <strong style={{ fontSize: 28 }}>{formatCompact(current)}</strong>
        <span style={{ color: change >= 0 ? 'var(--jc-positive)' : 'var(--jc-negative)' }}>
          {change >= 0 ? '▲' : '▼'} {(Math.abs(change) * 100).toFixed(1)}%
        </span>
      </div>
      <Sparkline
        data={last}
        xKey="date"
        yKey="users"
        variant="area"
        height={48}
        title="Active users, 30 days"
      />
    </div>
  );
}
