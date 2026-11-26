import { LineChart } from '@jafari/charts';
import { useState } from 'react';
import { registrations } from '../data';

export default function Controlled() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [clicked, setClicked] = useState<string>('—');
  const step = (d: number) =>
    setActive((i) => Math.min(registrations.length - 1, Math.max(0, (i ?? -1) + d)));
  return (
    <>
      <div className="demo-controls">
        <button type="button" className="btn btn-sm" onClick={() => step(-1)}>
          ← Previous
        </button>
        <button type="button" className="btn btn-sm" onClick={() => step(1)}>
          Next →
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setActive(null)}>
          Clear
        </button>
      </div>
      <LineChart
        data={registrations}
        xKey="month"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
          { key: 'admins', label: 'Admins' },
        ]}
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        activeIndex={active}
        onActiveIndexChange={setActive}
        onClick={(e) => setClicked(`${e.datum.month}: ${e.value ?? '—'} (${e.series ?? 'all'})`)}
        height={240}
      />
      <output className="demo-output">
        hidden=[{hidden.join(', ')}] · activeIndex={String(active)} · clicked={clicked}
      </output>
    </>
  );
}
