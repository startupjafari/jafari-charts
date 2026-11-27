import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSpring,
  prefersReducedMotion,
  projectMomentum,
  velocityFrom,
  type SpringHandle,
} from './spring';

// A horizontal row that may not fit: tabs, chips, toolbars. Ported from StudentHub
// (`shared/lib/use-scroll-row.ts`). The hook:
//  1. drags the row with the mouse (desktop rows have no scrollbar), with spring inertia;
//  2. scrolls it with a vertical mouse wheel while the pointer is over it (not at the edges,
//     so the page never gets stuck; Shift and Ctrl wheels are left to the browser);
//  3. knows whether it overflows and at which edge it sits — that builds the fade mask;
//  4. brings an item into view (`reveal`) and pages the row (`scrollPage`).
// Touch is never intercepted: native momentum scrolling is strictly better there.

/** Below this offset the gesture is a click, not a drag. */
const DRAG_SLOP = 4;
/** Edge fade width, px. */
const FADE = 24;
/** Margin kept when revealing an item, so it does not stick to the edge. */
const REVEAL_PAD = 16;
/** Points kept for the release velocity. */
const HISTORY = 10;
/** One page — a share of the visible width, so the edge items stay in view. */
const PAGE = 0.8;

export interface ScrollRowController<T extends HTMLElement> {
  /** Ref of the row itself (a callback: the row may mount after its parent). */
  ref: (node: T | null) => void;
  /** The content is wider than the row. */
  overflowing: boolean;
  atStart: boolean;
  atEnd: boolean;
  /** The mouse is dragging the row right now. */
  dragging: boolean;
  /** Bring a child of the row into view. */
  reveal: (child: HTMLElement | null) => void;
  /** Page the row left (-1) or right (1). */
  scrollPage: (dir: -1 | 1) => void;
  /** Edge fade for `mask-image`; `undefined` when the row fits. */
  fadeMask: string | undefined;
}

export function useScrollRow<T extends HTMLElement = HTMLDivElement>(): ScrollRowController<T> {
  const [node, setNode] = useState<T | null>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);
  const springRef = useRef<SpringHandle | null>(null);
  // The row was just dragged: swallow the click the release produces.
  const draggedRef = useRef(false);

  const ref = useCallback((next: T | null): void => {
    setNode(next);
  }, []);

  const measure = useCallback((): void => {
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setOverflowing(max > 1);
    setAtStart(node.scrollLeft <= 1);
    setAtEnd(node.scrollLeft >= max - 1);
  }, [node]);

  // After every render: the content can change without the row resizing. Reading the DOM
  // after render and storing the result is the point of this effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();
  });

  useEffect(() => {
    if (!node) return;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);
    node.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer?.disconnect();
      node.removeEventListener('scroll', measure);
    };
  }, [node, measure]);

  /** Spring-driven `scrollLeft`. `velocity` is the scroll velocity, px/s. */
  const glide = useCallback((el: T, target: number, velocity?: number): void => {
    springRef.current?.stop();
    if (Math.abs(target - el.scrollLeft) < 1 && !velocity) return;
    if (prefersReducedMotion()) {
      el.scrollLeft = target;
      return;
    }
    const spring = createSpring({
      from: el.scrollLeft,
      // No overshoot: a row bouncing back from its edge reads as a glitch.
      damping: 1,
      response: 0.4,
      onChange: (value) => {
        el.scrollLeft = value;
      },
    });
    springRef.current = spring;
    spring.to(target, velocity);
  }, []);

  useEffect(() => {
    if (!node) return;

    let startX = 0;
    let base = 0;
    let active = false;
    let moved = false;
    let history: { position: number; time: number }[] = [];

    const maxScroll = (): number => node.scrollWidth - node.clientWidth;

    const onPointerDown = (e: PointerEvent): void => {
      // Mouse and left button only: touch, pen and the right button keep system gestures.
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (maxScroll() < 1) return;
      springRef.current?.stop();
      draggedRef.current = false;
      active = true;
      moved = false;
      startX = e.clientX;
      base = node.scrollLeft;
      history = [{ position: e.clientX, time: performance.now() }];
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < DRAG_SLOP) return;
        moved = true;
        draggedRef.current = true;
        setDragging(true);
      }
      node.scrollLeft = base - dx;
      history.push({ position: e.clientX, time: performance.now() });
      if (history.length > HISTORY) history.shift();
      // Dragging the row is not selecting the labels' text.
      e.preventDefault();
    };

    const onPointerUp = (): void => {
      if (!active) return;
      active = false;
      if (!moved) return;
      setDragging(false);
      // Mouse velocity is opposite to the scroll: moving right lowers scrollLeft.
      const scrollVelocity = -velocityFrom(history);
      const target = Math.max(
        0,
        Math.min(node.scrollLeft + projectMomentum(scrollVelocity), maxScroll()),
      );
      glide(node, target, scrollVelocity);
    };

    const onClick = (e: MouseEvent): void => {
      if (!draggedRef.current) return;
      draggedRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    };

    // A vertical wheel over the row scrolls the row; a horizontal trackpad gesture is the
    // browser's already.
    const onWheel = (e: WheelEvent): void => {
      if (e.ctrlKey || e.shiftKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = maxScroll();
      if (max < 1 || e.deltaY === 0) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? node.clientWidth : 1;
      const delta = e.deltaY * unit;
      const at = node.scrollLeft;
      if ((delta < 0 && at <= 0) || (delta > 0 && at >= max - 1)) return;
      e.preventDefault();
      springRef.current?.stop();
      node.scrollLeft = Math.max(0, Math.min(at + delta, max));
    };

    node.addEventListener('pointerdown', onPointerDown);
    // passive: false, or preventDefault is ignored and the page scrolls with the row.
    node.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    // Capture: swallow the click before it reaches a button inside the row.
    node.addEventListener('click', onClick, true);
    return () => {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      node.removeEventListener('click', onClick, true);
      springRef.current?.stop();
    };
  }, [node, glide]);

  const reveal = useCallback(
    (child: HTMLElement | null): void => {
      if (!node || !child) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max < 1) return;
      const row = node.getBoundingClientRect();
      const box = child.getBoundingClientRect();
      const overLeft = box.left - row.left - REVEAL_PAD;
      const overRight = box.right - row.right + REVEAL_PAD;
      let target = node.scrollLeft;
      if (overLeft < 0) target = node.scrollLeft + overLeft;
      else if (overRight > 0) target = node.scrollLeft + overRight;
      glide(node, Math.max(0, Math.min(target, max)));
    },
    [node, glide],
  );

  const scrollPage = useCallback(
    (dir: -1 | 1): void => {
      if (!node) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max < 1) return;
      glide(node, Math.max(0, Math.min(node.scrollLeft + dir * node.clientWidth * PAGE, max)));
    },
    [node, glide],
  );

  const fadeMask = overflowing
    ? `linear-gradient(to right, transparent 0, black ${atStart ? 0 : FADE}px, black calc(100% - ${
        atEnd ? 0 : FADE
      }px), transparent 100%)`
    : undefined;

  return { ref, overflowing, atStart, atEnd, dragging, reveal, scrollPage, fadeMask };
}
