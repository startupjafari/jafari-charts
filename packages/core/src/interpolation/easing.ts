export type EasingFunction = (t: number) => number;

export const linear: EasingFunction = (t) => t;
export const quadOut: EasingFunction = (t) => t * (2 - t);
export const cubicOut: EasingFunction = (t) => 1 - (1 - t) ** 3;
export const cubicInOut: EasingFunction = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export const expoOut: EasingFunction = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
/** Gentle overshoot, used sparingly (e.g. radial progress). */
export const backOut: EasingFunction = (t) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

export const EASINGS = { linear, quadOut, cubicOut, cubicInOut, expoOut, backOut } as const;
export type EasingName = keyof typeof EASINGS;

export function resolveEasing(easing: EasingName | EasingFunction | undefined): EasingFunction {
  if (typeof easing === 'function') return easing;
  return EASINGS[easing ?? 'cubicOut'] ?? cubicOut;
}
