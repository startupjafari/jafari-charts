import {
  enterState,
  markComplexity,
  transitionMarks,
  tween,
  type EasingFunction,
  type Mark,
} from '@jafari/charts-core';
import { useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../internal/env';

export interface TransitionOptions {
  enabled: boolean;
  /** Animate from enter states on the first measured render (client mounts only). */
  initial: boolean;
  duration: number;
  easing: EasingFunction;
  /** False until the container has been measured. */
  ready: boolean;
  /** Changes whenever the chart size changes; size changes never animate. */
  sizeKey: string;
  /** Skip transitions above this many points (heavy animations are off by default). */
  maxComplexity: number;
}

/**
 * Animates between successive mark lists. Each data change plans one tween
 * (≈200 ms) and then stops — no work is scheduled while the chart is idle.
 * Pending frames are cancelled on unmount and when a new update arrives.
 */
export function useMarkTransition(marks: Mark[], options: TransitionOptions): Mark[] {
  const [display, setDisplay] = useState<Mark[]>(marks);
  const shown = useRef<Mark[]>(marks);
  const wasReady = useRef(false);
  const lastSize = useRef(options.sizeKey);
  const { enabled, initial, duration, easing, ready, sizeKey, maxComplexity } = options;

  useIsomorphicLayoutEffect(() => {
    const snap = () => {
      shown.current = marks;
      setDisplay(marks);
    };
    const firstReady = ready && !wasReady.current;
    wasReady.current = ready;
    const resized = lastSize.current !== sizeKey;
    lastSize.current = sizeKey;

    if (!ready || !enabled || duration <= 0 || markComplexity(marks) > maxComplexity) return snap();
    let from: Mark[];
    if (firstReady) {
      if (!initial) return snap();
      from = marks.map(enterState);
    } else if (resized) {
      return snap();
    } else {
      from = shown.current;
    }
    const plan = transitionMarks(from, marks);
    if (plan.static) return snap();
    const start = plan.at(0);
    shown.current = start;
    setDisplay(start);
    return tween({
      duration,
      easing,
      onUpdate: (t) => {
        const next = plan.at(t);
        shown.current = next;
        setDisplay(next);
      },
    });
  }, [marks, ready, enabled, sizeKey]);

  return display;
}
