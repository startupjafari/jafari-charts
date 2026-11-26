import { useState, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '../internal/env';

type Callback = (width: number) => void;

// One ResizeObserver for every chart on the page: 50 charts cost one observer.
let observer: ResizeObserver | null = null;
const callbacks = new Map<Element, Callback>();

function getObserver(): ResizeObserver | null {
  if (observer || typeof ResizeObserver === 'undefined') return observer;
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cb = callbacks.get(entry.target);
      if (!cb) continue;
      const box = entry.contentBoxSize?.[0];
      cb(box ? box.inlineSize : entry.contentRect.width);
    }
  });
  return observer;
}

function observe(el: Element, cb: Callback): () => void {
  const ro = getObserver();
  if (!ro) return () => {};
  callbacks.set(el, cb);
  ro.observe(el);
  return () => {
    callbacks.delete(el);
    ro.unobserve(el);
  };
}

/** Number of elements currently observed (exposed for leak tests). */
export function observedElementCount(): number {
  return callbacks.size;
}

/**
 * Tracks an element's content width. Measures synchronously before the first
 * paint, then follows resizes. Widths are floored to whole pixels so sub-pixel
 * jitter never triggers a re-layout. Returns null until measured.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>, enabled = true): number | null {
  const [width, setWidth] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const update = (w: number) => {
      const next = Math.max(0, Math.floor(w));
      setWidth((prev) => (prev === next ? prev : next));
    };
    update(el.getBoundingClientRect().width);
    return observe(el, update);
  }, [enabled]);
  return width;
}
