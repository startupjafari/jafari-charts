import { StackedAreaChart } from '@jafari/charts';
import { useState } from 'react';
import { activity } from '../data';

const SERIES = [
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'staff', label: 'Staff' },
] as const;

/** Emphasise a series from outside the chart; the legend still toggles series. */
export default function Highlight() {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <>
      <div className="demo-controls" role="group" aria-label="Highlight series">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            className="btn btn-sm"
            aria-pressed={highlighted === s.key}
            onMouseEnter={() => setHighlighted(s.key)}
            onMouseLeave={() => setHighlighted(null)}
            onFocus={() => setHighlighted(s.key)}
            onBlur={() => setHighlighted(null)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <StackedAreaChart
        data={activity}
        xKey="date"
        series={SERIES}
        highlightedSeries={highlighted}
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        height={240}
      />
      <output className="demo-output">hidden=[{hidden.join(', ')}]</output>
    </>
  );
}
