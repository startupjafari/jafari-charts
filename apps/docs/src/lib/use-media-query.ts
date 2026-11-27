import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reactive media query, ported from StudentHub (`shared/lib/use-media-query.ts`).
 * Environments without `matchMedia` (jsdom, old web views) report `false`.
 */
const serverSnapshot = (): boolean => false;
const supported = (): boolean => typeof window.matchMedia === 'function';
const noop = (): void => undefined;

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
