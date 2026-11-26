import { RadarChart } from '@jafari/charts';
import { useState } from 'react';
import { profiles } from '../data';

export default function States() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <div className="demo-controls">
        <button type="button" className="btn btn-sm" onClick={() => setLoading((l) => !l)}>
          {loading ? 'Finish loading' : 'Reload'}
        </button>
      </div>
      <RadarChart
        data={loading ? [] : profiles}
        labelKey="metric"
        series={[{ key: 'north', label: 'North' }]}
        loading={loading}
        height={260}
      />
    </>
  );
}
