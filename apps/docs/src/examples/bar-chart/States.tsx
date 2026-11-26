import { BarChart } from '@jafari/charts';
import { useState } from 'react';
import { registrations } from '../data';

type State = 'empty' | 'loading' | 'error' | 'data';

export default function States() {
  const [state, setState] = useState<State>('loading');
  return (
    <>
      <div className="demo-controls" role="group" aria-label="State">
        {(['empty', 'loading', 'error', 'data'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className="btn btn-sm"
            aria-pressed={state === s}
            onClick={() => setState(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <BarChart
        data={state === 'data' ? registrations : []}
        xKey="month"
        yKey="students"
        loading={state === 'loading'}
        error={state === 'error'}
        onRetry={() => setState('data')}
        height={220}
      />
    </>
  );
}
