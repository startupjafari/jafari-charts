import { useCallback, useSyncExternalStore } from 'react';

// Ported from StudentHub `shared/lib/use-media-query.ts`. `matchMedia` is missing in jsdom
// and some old webviews: there the query simply does not match.

const serverSnapshot = (): boolean => false;
const supported = (): boolean => typeof window.matchMedia === 'function';
const noop = (): void => undefined;

/** A reactive media query. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!supported()) return noop;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => supported() && window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}
