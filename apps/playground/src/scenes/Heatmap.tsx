import { CalendarHeatmap, HeatmapChart } from '@jafari/charts';
import type { ReactNode } from 'react';
import { rng } from '../data';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Logins by weekday × hour: busy weekday mornings and evenings, quiet nights. */
const logins = (() => {
  const r = rng(11);
  const rows: Array<{ day: string; hour: number; logins: number }> = [];
  weekdays.forEach((day, d) => {
    for (let hour = 0; hour < 24; hour++) {
      const weekend = d >= 5 ? 0.45 : 1;
      const wave = Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2)) + (hour >= 18 ? 0.4 : 0);
      rows.push({ day, hour, logins: Math.round((wave * 120 + r() * 25) * weekend) });
    }
  });
  return rows;
})();

const subjects = ['Math', 'Physics', 'History', 'Biology', 'Literature'];
const groups = ['10A', '10B', '11A', '11B', '11C', '12A'];
const grades = (() => {
  const r = rng(5);
  return subjects.flatMap((subject) =>
    groups.map((group) => ({ subject, group, score: Math.round(55 + r() * 45) })),
  );
})();

/** Year-over-year change per faculty and quarter (signed). */
const faculties = [
  'Engineering',
  'Medicine',
  'Economics and Business Administration',
  'Law',
  'Humanities',
  'Natural Sciences',
];
const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];
const change = (() => {
  const r = rng(23);
  return faculties.flatMap((faculty, i) =>
    quarters.map((quarter, q) => ({
      faculty,
      quarter,
      delta: i === 3 && q === 2 ? null : Math.round((r() - 0.45 - (i === 2 ? 0.3 : 0)) * 40),
    })),
  );
})();

const big = (() => {
  const rows: Array<{ x: string; y: string; v: number }> = [];
  for (let y = 0; y < 50; y++)
    for (let x = 0; x < 50; x++)
      rows.push({
        x: `C${x + 1}`,
        y: `R${y + 1}`,
        v: Math.sin(x / 6) * Math.cos(y / 8) * 50 + (x + y) / 2,
      });
  return rows;
})();

/** Daily activity with weekly rhythm, a summer lull and some missing days. */
function activity(from: Date, days: number, seed = 3) {
  const r = rng(seed);
  const out: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const weekday = d.getDay();
    const summer = d.getMonth() >= 6 && d.getMonth() <= 7 ? 0.25 : 1;
    const base = weekday === 0 || weekday === 6 ? 0.3 : 1;
    const x = r();
    if (x < 0.18) continue; // no row at all
    const count = x < 0.3 ? 0 : Math.round(r() * 12 * base * summer);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ date: iso, count });
  }
  return out;
}

const lastYear = activity(new Date(2025, 10, 27), 365);
const twoYears = activity(new Date(2024, 0, 1), 731, 9);
// Duplicate rows per day are summed.
const commits = [
  ...activity(new Date(2026, 0, 1), 120, 4),
  { date: '2026-01-05', count: 20 },
  { date: '2026-01-05', count: 15 },
];

function Card({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section
      className="card"
      data-testid={title}
      style={wide ? { gridColumn: '1 / -1' } : undefined}
    >
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Heatmap() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  return (
    <div className="grid">
      <Card title="Calendar heatmap (last 12 months)" wide>
        <CalendarHeatmap
          data={lastYear}
          dateKey="date"
          valueKey="count"
          valueLabel="Submissions"
          animation={animation}
        />
      </Card>
      <Card title="Logins by weekday and hour">
        <HeatmapChart
          data={logins}
          xKey="hour"
          yKey="day"
          valueKey="logins"
          valueLabel="Logins"
          height={240}
          xFormatter={(h) => `${String(h).padStart(2, '0')}`}
          animation={animation}
        />
      </Card>
      <Card title="Average score by subject and group (labels)">
        <HeatmapChart
          data={grades}
          xKey="group"
          yKey="subject"
          valueKey="score"
          labels
          buckets={4}
          color="var(--jc-series-3)"
          height={240}
          animation={animation}
        />
      </Card>
      <Card title="Enrolment change, % (diverging, missing cell, long labels)">
        <HeatmapChart
          data={change}
          xKey="quarter"
          yKey="faculty"
          valueKey="delta"
          colorScale="diverging"
          labels
          valueFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
          height={260}
          animation={animation}
        />
      </Card>
      <Card title="50 × 50 grid (custom colour ramp)">
        <HeatmapChart
          data={big}
          xKey="x"
          yKey="y"
          valueKey="v"
          colors={['#fff7ed', '#fb923c', '#7c2d12']}
          buckets={7}
          height={320}
          animation={animation}
        />
      </Card>
      <Card title="Календарь активности (ru, month gaps)" wide>
        <CalendarHeatmap
          data={lastYear}
          dateKey="date"
          valueKey="count"
          locale="ru"
          monthGap
          animation={animation}
        />
      </Card>
      <Card title="Two years, stacked by year" wide>
        <CalendarHeatmap
          data={twoYears}
          dateKey="date"
          valueKey="count"
          thresholds={[1, 4, 8, 12]}
          color="var(--jc-series-2)"
          animation={animation}
        />
      </Card>
      <Card title="Calendar (narrow, explicit range, duplicates summed)">
        <div style={{ maxWidth: 320 }}>
          <CalendarHeatmap
            data={commits}
            dateKey="date"
            valueKey="count"
            from="2026-01-01"
            to="2026-06-30"
            weekStartsOn={1}
            animation={animation}
          />
        </div>
      </Card>
      <Card title="Calendar (kk, Q1, all weekday labels)">
        <CalendarHeatmap
          data={commits}
          dateKey="date"
          valueKey="count"
          from="2026-01-01"
          to="2026-03-31"
          locale="kk"
          weekdayLabels="all"
          animation={animation}
        />
      </Card>
      <Card title="Empty heatmap">
        <HeatmapChart data={[] as typeof grades} xKey="group" yKey="subject" valueKey="score" />
      </Card>
      <Card title="Empty calendar">
        <CalendarHeatmap data={[] as typeof lastYear} dateKey="date" valueKey="count" />
      </Card>
    </div>
  );
}
