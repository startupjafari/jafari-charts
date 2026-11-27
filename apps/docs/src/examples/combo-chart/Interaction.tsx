import { ComboChart } from '@startupjafari/charts';
import { useState } from 'react';
import { revenue } from '../data';

/** `tooltip.mode="item"` shows only the series under the pointer. */
export default function Interaction() {
  const [last, setLast] = useState('—');
  return (
    <>
      <ComboChart
        data={revenue}
        xKey="month"
        series={[
          { key: 'revenue', label: 'Revenue', type: 'bar' },
          { key: 'costs', label: 'Costs', type: 'line' },
        ]}
        tooltip={{ mode: 'item' }}
        onClick={(e) => setLast(`${e.datum.month} · ${e.series ?? 'all'} = ${e.value ?? '—'}`)}
        height={240}
      />
      <output className="demo-output">clicked: {last}</output>
    </>
  );
}
