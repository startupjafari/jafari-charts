import { DonutChart } from '@startupjafari/charts';
import { useState } from 'react';
import { roles } from '../data';

/** Drive the active slice from your own UI (and back). */
export default function Interaction() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <DonutChart
        data={roles}
        labelKey="role"
        valueKey="count"
        legend={false}
        activeIndex={active}
        onActiveIndexChange={setActive}
      />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
        {roles.map((r, i) => (
          <li key={r.role}>
            <button
              type="button"
              className="btn btn-sm"
              aria-pressed={active === i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {r.role}: {r.count.toLocaleString('en')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
