import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export interface RenderMetrics {
  /** ms from the configuration change to the next painted frame. */
  renderMs: number | null;
  /** Elements inside the chart preview. */
  domNodes: number | null;
  /** Renderer actually used (detected from the DOM). */
  renderer: 'svg' | 'canvas' | null;
}

/**
 * Times a configuration change: `start()` is called in the event handler, the
 * effect waits for React's commit and then for the next frame
 * (requestAnimationFrame + setTimeout, the same method the benchmark suite uses).
 */
export function useRenderMetrics(
  container: RefObject<HTMLElement | null>,
  commitKey: unknown,
): { metrics: RenderMetrics; start: () => void } {
  // Set by `start()` in event handlers; null until the first change.
  const startedAt = useRef<number | null>(null);
  const [metrics, setMetrics] = useState<RenderMetrics>({
    renderMs: null,
    domNodes: null,
    renderer: null,
  });

  const start = useCallback(() => {
    startedAt.current = performance.now();
  }, []);

  useEffect(() => {
    const t0 = startedAt.current;
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        const el = container.current;
        setMetrics((m) => ({
          renderMs: t0 === null ? m.renderMs : performance.now() - t0,
          domNodes: el ? el.querySelectorAll('*').length : null,
          renderer: el ? (el.querySelector('canvas') ? 'canvas' : 'svg') : null,
        }));
        startedAt.current = null;
      }, 0);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [commitKey, container]);

  // The canvas module is a lazy chunk; refresh DOM-derived numbers once it has loaded.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const el = container.current;
      if (!el) return;
      setMetrics((m) => ({
        ...m,
        domNodes: el.querySelectorAll('*').length,
        renderer: el.querySelector('canvas') ? 'canvas' : 'svg',
      }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [commitKey, container]);

  return { metrics, start };
}

export interface FpsState {
  fps: number | null;
  /** Longest frame during the last sample window, ms. */
  worstFrameMs: number | null;
  active: boolean;
}

/** Frames per second while the pointer is over the chart (requestAnimationFrame counter). */
export function useHoverFps(): {
  fps: FpsState;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
} {
  const [fps, setFps] = useState<FpsState>({ fps: null, worstFrameMs: null, active: false });
  const raf = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    setFps((f) => ({ ...f, active: false }));
  }, []);

  const begin = useCallback(() => {
    if (raf.current) return;
    let windowStart = performance.now();
    let last = windowStart;
    let frames = 0;
    let worst = 0;
    setFps((f) => ({ ...f, active: true }));
    const tick = (now: number) => {
      frames += 1;
      worst = Math.max(worst, now - last);
      last = now;
      if (now - windowStart >= 500) {
        const value = (frames * 1000) / (now - windowStart);
        setFps({ fps: value, worstFrameMs: worst, active: true });
        windowStart = now;
        frames = 0;
        worst = 0;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { fps, onPointerEnter: begin, onPointerLeave: stop };
}
