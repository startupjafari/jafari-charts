import { GaugeChart } from '@startupjafari/charts';
import { useState } from 'react';

export default function Interaction() {
  const [value, setValue] = useState(55);
  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <GaugeChart
        value={value}
        needle
        bands={[
          { to: 50, color: 'var(--jc-negative)', label: 'Below target' },
          { to: 80, color: 'var(--jc-warning)', label: 'On track' },
          { to: 100, color: 'var(--jc-positive)', label: 'Ahead' },
        ]}
        height={200}
      />
      <label style={{ display: 'grid', gap: 4, marginTop: 12, fontSize: 14 }}>
        Score: {value}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
