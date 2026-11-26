import { LineChart, BarChart, AreaChart } from '@jafari/charts';
import { useState } from 'react';
import { timeSeries, registrations } from '../data';

const big = timeSeries(2000, { keys: ['value'] as const, step: 36e5 });
const series = timeSeries(60);

/** Deterministic fixture for e2e interaction tests (zoom, brush, controlled state, touch). */
export function Interactions() {
  const [brush, setBrush] = useState('');
  const [clicked, setClicked] = useState('');
  const [hidden, setHidden] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="grid">
      <section className="card" data-testid="zoom">
        <h3>Zoom & pan (Ctrl/⌘ + wheel, drag, double-click resets)</h3>
        <LineChart data={big} xKey="date" yKey="value" zoom animation={false} height={240} />
      </section>
      <section className="card" data-testid="brush">
        <h3>Brush</h3>
        <AreaChart
          data={series}
          xKey="date"
          yKey="students"
          brush
          animation={false}
          height={220}
          onBrush={(r) => setBrush(`${r.startIndex}-${r.endIndex}`)}
        />
        <output data-testid="brush-result">{brush}</output>
      </section>
      <section className="card" data-testid="controlled">
        <h3>Controlled legend + active index</h3>
        <BarChart
          data={registrations}
          xKey="month"
          series={[
            { key: 'students', label: 'Students' },
            { key: 'teachers', label: 'Teachers' },
          ]}
          hiddenSeries={hidden}
          onHiddenSeriesChange={setHidden}
          activeIndex={active}
          onActiveIndexChange={setActive}
          onClick={(e) => setClicked(`${e.index}:${String(e.datum.month)}`)}
          animation={false}
          height={220}
        />
        <output data-testid="state">{`hidden=${hidden.join(',')};active=${active ?? ''};clicked=${clicked}`}</output>
      </section>
    </div>
  );
}
