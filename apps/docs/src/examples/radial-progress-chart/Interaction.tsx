import { RadialProgressChart } from '@jafari/charts';
import { useState } from 'react';

/** Changing the value animates the ring (unless reduced motion is on). */
export default function Interaction() {
  const [value, setValue] = useState(45);
  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <RadialProgressChart value={value} label="Enrollment" height={200} />
      <label style={{ display: 'grid', gap: 4, marginTop: 12, fontSize: 14 }}>
        Enrollment: {value}%
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
