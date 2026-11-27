import { AreaChart } from '@startupjafari/charts';
import { useState } from 'react';
import { dailyUsers } from '../data';

/** Drag across the chart to select a range. */
export default function Brush() {
  const [range, setRange] = useState<string>('Drag across the chart to select days');
  return (
    <>
      <AreaChart
        data={dailyUsers}
        xKey="date"
        yKey="users"
        label="Users"
        brush
        onBrush={(r) => {
          const days = dailyUsers.slice(r.startIndex, r.endIndex + 1);
          const avg = days.reduce((s, d) => s + d.users, 0) / Math.max(1, days.length);
          setRange(`${days.length} days selected · average ${Math.round(avg)} users`);
        }}
        height={240}
      />
      <output className="demo-output">{range}</output>
    </>
  );
}
