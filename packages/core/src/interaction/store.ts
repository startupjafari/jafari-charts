export type Listener = () => void;

/**
 * Tiny observable state container (compatible with React's `useSyncExternalStore`).
 * One store per chart instance holds the fast-changing interaction state, so
 * pointer movement only re-renders the components that subscribe to it.
 */
export interface Store<S> {
  getState(): S;
  setState(patch: Partial<S> | ((state: S) => Partial<S>)): void;
  subscribe(listener: Listener): () => void;
}

export function createStore<S extends object>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      let changed = false;
      for (const key in next) {
        if (!Object.is(next[key], state[key])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
