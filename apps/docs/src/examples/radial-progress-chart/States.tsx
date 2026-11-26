import { RadialProgressChart } from '@jafari/charts';
import { useState } from 'react';

type State = 'loading' | 'error' | 'zero';

/** A progress chart always has a ring; use `loading` and `error` while the value is unknown. */
export default function States() {
  const [state, setState] = useState<State>('loading');
  return (
    <>
      <div className="demo-controls" role="group" aria-label="State">
        {(['loading', 'error', 'zero'] as const).map((s) => (
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
      <RadialProgressChart
        value={0}
        label="Plan completion"
        loading={state === 'loading'}
        error={state === 'error'}
        onRetry={() => setState('zero')}
        height={180}
      />
    </>
  );
}
