import { DonutChart } from '@jafari/charts';
import { useState } from 'react';
import { roles } from '../data';

export default function States() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <div className="demo-controls">
        <button type="button" className="btn btn-sm" onClick={() => setLoading((l) => !l)}>
          {loading ? 'Finish loading' : 'Reload'}
        </button>
      </div>
      <DonutChart
        data={loading ? [] : roles}
        labelKey="role"
        valueKey="count"
        loading={loading}
        height={220}
      />
    </>
  );
}
