import { LineChart } from '@startupjafari/charts';
import { useState } from 'react';
import { activity } from '../data';

type State = 'empty' | 'loading' | 'error' | 'data';

export default function States() {
  const [state, setState] = useState<State>('empty');
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
      <LineChart
        data={state === 'data' ? activity : []}
        xKey="date"
        yKey="students"
        loading={state === 'loading'}
        error={state === 'error'}
        onRetry={() => setState('data')}
        emptyMessage="No activity in this period"
        height={220}
      />
    </>
  );
}
