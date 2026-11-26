import { useEffect, useLayoutEffect } from 'react';

declare const process: { env: Record<string, string | undefined> } | undefined;

/** True outside production builds (bundlers replace `process.env.NODE_ENV`). */
export const DEV: boolean = (() => {
  try {
    return typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** `useLayoutEffect` in the browser, `useEffect` on the server (no SSR warning). */
export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

const warned = new Set<string>();

/** Logs a development-only warning once per message. */
export function devWarn(message: string): void {
  if (!DEV || warned.has(message)) return;
  warned.add(message);
  console.warn(`[jafari-charts] ${message}`);
}
