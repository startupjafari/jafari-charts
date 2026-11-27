import { LineChart, type CurveType } from '@startupjafari/charts';
import { useState } from 'react';
import { registrations } from '../data';

const CURVES: CurveType[] = ['monotone', 'linear', 'step', 'stepBefore', 'stepAfter'];

export default function Curves() {
  const [curve, setCurve] = useState<CurveType>('monotone');
  return (
    <>
      <div className="demo-controls" role="group" aria-label="Curve">
        {CURVES.map((c) => (
          <button
            key={c}
            type="button"
            className="btn btn-sm"
            aria-pressed={curve === c}
            onClick={() => setCurve(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <LineChart
        data={registrations}
        xKey="month"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
        ]}
        curve={curve}
        dots
        height={240}
      />
    </>
  );
}
