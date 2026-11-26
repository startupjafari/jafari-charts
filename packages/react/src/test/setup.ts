// jsdom lacks layout APIs used by charts; provide minimal, controllable stand-ins.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

type ROCallback = (
  entries: Array<{
    target: Element;
    contentRect: { width: number };
    contentBoxSize?: Array<{ inlineSize: number }>;
  }>,
) => void;

export const resizeObservers = new Set<{ cb: ROCallback; targets: Set<Element> }>();

class TestResizeObserver {
  private readonly entry: { cb: ROCallback; targets: Set<Element> };
  constructor(cb: ROCallback) {
    this.entry = { cb, targets: new Set() };
    resizeObservers.add(this.entry);
  }
  observe(target: Element) {
    this.entry.targets.add(target);
  }
  unobserve(target: Element) {
    this.entry.targets.delete(target);
  }
  disconnect() {
    this.entry.targets.clear();
    resizeObservers.delete(this.entry);
  }
}

/** Simulates the browser resizing `target` to `width`. */
export function resize(target: Element, width: number) {
  for (const o of resizeObservers) {
    if (o.targets.has(target))
      o.cb([{ target, contentRect: { width }, contentBoxSize: [{ inlineSize: width }] }]);
  }
}

globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// Elements report a 600px wide layout box (jsdom has no layout engine).
const rect = {
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  right: 600,
  bottom: 300,
  width: 600,
  height: 300,
  toJSON: () => ({}),
};
Element.prototype.getBoundingClientRect = function () {
  return rect as DOMRect;
};
