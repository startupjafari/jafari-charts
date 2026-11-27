// Spring animation and gesture physics, ported from StudentHub `shared/lib/spring.ts`
// (only what `useScrollRow` needs).
//
// Why not a CSS transition: a transition fixes its duration and curve up front, so it can
// neither start from where the element is on screen right now nor carry on with the speed
// the pointer let go at. A spring has no duration, only state (position + velocity), and a
// new target mid-flight causes no jump.

/** Cap on simulated time per frame: after a background tab dt can be whole seconds. */
const MAX_FRAME_MS = 64;
/** Fixed integration step, finer than a frame, so the explicit scheme stays stable. */
const STEP_MS = 1000 / 120;

/** Rest thresholds: closer than this to the target and slower than this, the spring has settled. */
const REST_DISTANCE = 0.1;
const REST_VELOCITY = 0.1;

export interface SpringOptions {
  /** Starting value. */
  from: number;
  /** Damping ratio: `1` is critical (no overshoot), `<1` overshoots. */
  damping?: number;
  /** Responsiveness in seconds: how quickly the value reaches the target (not a duration). */
  response?: number;
  onChange: (value: number) => void;
  onRest?: () => void;
}

export interface SpringHandle {
  /** The current value (the on-screen position right now). */
  readonly value: number;
  /** The current velocity, px/s. */
  readonly velocity: number;
  readonly animating: boolean;
  /** Jump to a value and stop the motion (the pointer grabbed it). */
  set(value: number): void;
  /** Retune the spring mid-flight without touching its value or velocity. */
  configure(tuning: { damping?: number; response?: number }): void;
  /** Retarget the spring; pass `velocity` to take over the speed of a release. */
  to(target: number, velocity?: number): void;
  stop(): void;
}

/** A one-axis spring. */
export function createSpring(options: SpringOptions): SpringHandle {
  let stiffness = 0;
  let friction = 0;
  // Damping + response to equation coefficients (unit mass): ω = 2π / T, k = ω², c = 2ζω.
  const tune = (damping: number, response: number): void => {
    const omega = (2 * Math.PI) / response;
    stiffness = omega * omega;
    friction = 2 * damping * omega;
  };
  let damping = options.damping ?? 1;
  let response = options.response ?? 0.4;
  tune(damping, response);

  let value = options.from;
  let velocity = 0;
  let target = options.from;
  let frame: number | null = null;
  let lastTime = 0;

  const finish = (): void => {
    frame = null;
    value = target;
    velocity = 0;
    options.onChange(value);
    options.onRest?.();
  };

  const step = (now: number): void => {
    // Fixed sub-steps rather than one large step: a single big explicit step after a frame
    // drop makes the spring blow up instead of settling, and sub-steps make the motion the
    // same at 60 and 120 Hz.
    let remaining = Math.min(now - lastTime, MAX_FRAME_MS);
    lastTime = now;
    while (remaining > 0) {
      const dt = Math.min(remaining, STEP_MS) / 1000;
      remaining -= STEP_MS;
      const acceleration = -stiffness * (value - target) - friction * velocity;
      velocity += acceleration * dt;
      value += velocity * dt;
    }

    if (Math.abs(value - target) < REST_DISTANCE && Math.abs(velocity) < REST_VELOCITY) {
      finish();
      return;
    }
    options.onChange(value);
    frame = requestAnimationFrame(step);
  };

  const start = (): void => {
    if (frame !== null) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(step);
  };

  return {
    get value() {
      return value;
    },
    get velocity() {
      return velocity;
    },
    get animating() {
      return frame !== null;
    },
    configure(tuning: { damping?: number; response?: number }) {
      damping = tuning.damping ?? damping;
      response = tuning.response ?? response;
      tune(damping, response);
    },
    set(next: number) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      value = next;
      target = next;
      velocity = 0;
    },
    to(next: number, nextVelocity?: number) {
      target = next;
      if (nextVelocity !== undefined) velocity = nextVelocity;
      // Already there and not moving: nothing to animate.
      if (Math.abs(value - target) < REST_DISTANCE && Math.abs(velocity) < REST_VELOCITY) {
        finish();
        return;
      }
      start();
    },
    stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      velocity = 0;
    },
  };
}

/**
 * Where a thrown object comes to rest: exponential decay, the same native scrolling uses.
 *
 * @param velocity speed at release, px/s
 * @param deceleration 0.998 is regular scroll momentum, 0.99 is sharper
 */
export function projectMomentum(velocity: number, deceleration = 0.998): number {
  return ((velocity / 1000) * deceleration) / (1 - deceleration);
}

/** Velocity from recent pointer samples, px/s (a window, not just the last two points). */
export function velocityFrom(history: { position: number; time: number }[]): number {
  if (history.length < 2) return 0;
  const last = history[history.length - 1]!;
  // Only samples from the last 100 ms: a longer window smears a flick at the very end.
  const first = history.find((p) => last.time - p.time <= 100) ?? history[0]!;
  const dt = last.time - first.time;
  if (dt <= 0) return 0;
  return ((last.position - first.position) / dt) * 1000;
}

/** The visitor asked for less motion: springs become instant. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
