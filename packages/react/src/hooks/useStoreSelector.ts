import type { Store } from '@jafari/charts-core';
import { useCallback, useSyncExternalStore } from 'react';

/** Subscribes to a slice of a store; re-renders only when the selected value changes. */
export function useStoreSelector<S extends object, R>(
  store: Store<S>,
  selector: (state: S) => R,
): R {
  const get = useCallback(() => selector(store.getState()), [store, selector]);
  return useSyncExternalStore(store.subscribe, get, get);
}
