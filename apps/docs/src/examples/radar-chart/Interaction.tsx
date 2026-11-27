import { RadarChart } from '@startupjafari/charts';
import { useState } from 'react';
import { profiles } from '../data';

/** Pick a metric from outside the chart; hovering the chart updates the selection too. */
export default function Interaction() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <>
      <div className="demo-controls" role="group" aria-label="Metric">
        {profiles.map((p, i) => (
          <button
            key={p.metric}
            type="button"
            className="btn btn-sm"
            aria-pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
          >
            {p.metric}
          </button>
        ))}
      </div>
      <RadarChart
        data={profiles}
        labelKey="metric"
        series={[
          { key: 'north', label: 'North' },
          { key: 'south', label: 'South' },
        ]}
        activeIndex={active}
        onActiveIndexChange={setActive}
        height={300}
      />
    </>
  );
}
