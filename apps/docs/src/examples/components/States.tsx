import { AreaChart } from '@jafari/charts';
import { useState } from 'react';
import { dailyUsers } from '../data';

type State = 'data' | 'refreshing' | 'loading' | 'empty' | 'error';

/** One prop per state; `messages` localises the built-in texts. */
export default function States() {
  const [state, setState] = useState<State>('refreshing');
  return (
    <>
      <div className="demo-controls" role="group" aria-label="State">
        {(['data', 'refreshing', 'loading', 'empty', 'error'] as const).map((s) => (
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
        data={state === 'data' || state === 'refreshing' ? dailyUsers : []}
        xKey="date"
        yKey="users"
        loading={state === 'refreshing' || state === 'loading'}
        error={state === 'error'}
        onRetry={() => setState('data')}
        messages={{
          noData: 'Nothing here yet',
          error: 'The analytics API is unavailable',
          retry: 'Try again',
        }}
        height={220}
      />
    </>
  );
}
