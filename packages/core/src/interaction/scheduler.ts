type FrameRequest = (cb: (time: number) => void) => number;
type FrameCancel = (handle: number) => void;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** `requestAnimationFrame` when available (browsers), a 16 ms timeout otherwise (SSR, workers). */
export const requestFrame: FrameRequest = (cb) =>
  typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame(cb)
    : (setTimeout(() => cb(now()), 16) as unknown as number);

export const cancelFrame: FrameCancel = (handle) => {
  if (typeof globalThis.cancelAnimationFrame === 'function')
    globalThis.cancelAnimationFrame(handle);
  else clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
};

export interface FrameThrottled<A extends unknown[]> {
  (...args: A): void;
  /** Runs a pending call immediately. */
  flush(): void;
  /** Drops a pending call. Always call on teardown. */
  cancel(): void;
}

/**
 * Coalesces calls so `fn` runs at most once per animation frame with the latest
 * arguments. Used for pointer move handling: 1000 Hz mice still cost one
 * computation per frame.
 */
export function frameThrottle<A extends unknown[]>(fn: (...args: A) => void): FrameThrottled<A> {
  let handle: number | null = null;
  let pending: A | null = null;
  const run = () => {
    handle = null;
    if (pending) {
      const args = pending;
      pending = null;
      fn(...args);
    }
  };
  const throttled = ((...args: A) => {
    pending = args;
    if (handle === null) handle = requestFrame(run);
  }) as FrameThrottled<A>;
  throttled.flush = () => {
    if (handle !== null) cancelFrame(handle);
    run();
  };
  throttled.cancel = () => {
    if (handle !== null) cancelFrame(handle);
    handle = null;
    pending = null;
  };
  return throttled;
}
