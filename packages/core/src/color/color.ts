export interface RGBA {
  /** 0–255 */
  r: number;
  g: number;
  b: number;
  /** 0–1 */
  a: number;
}

const NAMED: Record<string, RGBA> = {
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
};

/** Parses hex (#rgb, #rgba, #rrggbb, #rrggbbaa) and rgb()/rgba() colours. */
export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  if (NAMED[s]) return { ...(NAMED[s] as RGBA) };
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (!/^[0-9a-f]+$/.test(hex)) return null;
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b, a] = [...hex].map((c) => parseInt(c + c, 16));
      return { r: r as number, g: g as number, b: b as number, a: a === undefined ? 1 : a / 255 };
    }
    if (hex.length === 6 || hex.length === 8) {
      const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
      return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 };
    }
    return null;
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const parts = (m[1] as string).split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (p: string) => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p));
    const alpha =
      parts[3] === undefined
        ? 1
        : parts[3].endsWith('%')
          ? parseFloat(parts[3]) / 100
          : parseFloat(parts[3]);
    const c = {
      r: channel(parts[0] as string),
      g: channel(parts[1] as string),
      b: channel(parts[2] as string),
      a: alpha,
    };
    return [c.r, c.g, c.b, c.a].every(Number.isFinite) ? c : null;
  }
  return null;
}

const hex2 = (v: number) =>
  Math.round(Math.min(255, Math.max(0, v)))
    .toString(16)
    .padStart(2, '0');

export function formatColor(c: RGBA): string {
  const base = `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
  return c.a >= 1 ? base : `${base}${hex2(c.a * 255)}`;
}

const toLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number) => {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return c * 255;
};

function toOklab(c: RGBA): [number, number, number] {
  const r = toLinear(c.r);
  const g = toLinear(c.g);
  const b = toLinear(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, A, B]: [number, number, number], a: number): RGBA {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a,
  };
}

/** Perceptual mix in OKLab: `t = 0` → `a`, `t = 1` → `b`. Unparseable input returns `b`. */
export function mixColors(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return t < 0.5 ? a : b;
  const la = toOklab(ca);
  const lb = toOklab(cb);
  const mix = la.map((v, i) => v + ((lb[i] as number) - v) * t) as [number, number, number];
  return formatColor(fromOklab(mix, ca.a + (cb.a - ca.a) * t));
}

/** Samples a multi-stop colour ramp at `t` (0–1). */
export function sampleRamp(stops: readonly string[], t: number): string {
  if (stops.length === 0) return 'transparent';
  if (stops.length === 1) return stops[0] as string;
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mixColors(stops[i] as string, stops[i + 1] as string, x - i);
}

export function relativeLuminance(c: RGBA): number {
  return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);
}

/** WCAG contrast ratio between two opaque colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return 1;
  const la = relativeLuminance(ca);
  const lb = relativeLuminance(cb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Picks whichever text colour has more contrast on `background`. */
export function readableTextColor(background: string, light = '#ffffff', dark = '#0b0d12'): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

export function withAlpha(color: string, alpha: number): string {
  const c = parseColor(color);
  if (!c) return color;
  return formatColor({ ...c, a: Math.min(1, Math.max(0, alpha)) });
}

/**
 * Text colour for a label drawn inside a filled mark: the higher-contrast ink for
 * concrete colours, or the `--jc-on-fill` token for theme variables.
 */
export function onFillColor(fill: string): string {
  return parseColor(fill) ? readableTextColor(fill) : 'var(--jc-on-fill)';
}
