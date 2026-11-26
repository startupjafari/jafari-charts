import { AreaChart } from '@jafari/charts';
import { useState } from 'react';
import { dailyUsers } from '../data';

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
      <AreaChart
        data={state === 'data' ? dailyUsers : []}
        xKey="date"
        yKey="users"
        loading={state === 'loading'}
        error={state === 'error' ? 'Could not load users' : false}
        onRetry={() => setState('data')}
        emptyMessage="No users yet"
        height={220}
      />
    </>
  );
}
