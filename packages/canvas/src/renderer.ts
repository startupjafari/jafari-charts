import {
  drawMark,
  drawSymbol,
  isStrokeMark,
  parseColor,
  styleKey,
  type LinearGradientPaint,
  type Mark,
  type MarkStyle,
  type Paint,
  type Rect,
} from '@jafari/charts-core';

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Canvas = HTMLCanvasElement | OffscreenCanvas;

export type ColorResolver = (color: string) => string;

/** Maximum closed subpaths per fill() call. */
const MAX_BATCH = 64;

export interface CanvasRendererOptions {
  /** Upper bound for the device pixel ratio (default 2: sharper than 2× is invisible, 4× the memory). */
  maxPixelRatio?: number;
  /** Upper bound on backing-store pixels (default 16.7M ≈ 4096²). */
  maxPixels?: number;
}

export interface RenderOptions {
  /** Clip drawing to this rectangle (CSS pixels). */
  clip?: Rect;
  /** Converts colours that canvas cannot parse (e.g. `var(--token)`). */
  resolveColor?: ColorResolver;
}

/**
 * Canvas 2D renderer for scene marks. Shares all geometry with the SVG renderer
 * (marks are drawn through the same PathSink code). Same-style marks are merged
 * into one path, so 100 000 points cost one `fill()` call.
 */
export class CanvasRenderer {
  readonly canvas: Canvas;
  readonly ctx: Context2D;
  private width = 0;
  private height = 0;
  private ratio = 1;
  private readonly maxPixelRatio: number;
  private readonly maxPixels: number;

  constructor(canvas: Canvas, options: CanvasRendererOptions = {}) {
    const ctx = canvas.getContext('2d') as Context2D | null;
    if (!ctx) throw new Error('Canvas 2D context is not available');
    this.canvas = canvas;
    this.ctx = ctx;
    this.maxPixelRatio = options.maxPixelRatio ?? 2;
    this.maxPixels = options.maxPixels ?? 4096 * 4096;
  }

  /** Effective pixel ratio after caps. */
  get pixelRatio(): number {
    return this.ratio;
  }

  /** Sizes the backing store for HiDPI screens, capped by `maxPixelRatio` and `maxPixels`. */
  resize(width: number, height: number, devicePixelRatio = 1): void {
    let ratio = Math.max(1, Math.min(this.maxPixelRatio, devicePixelRatio || 1));
    const area = width * height * ratio * ratio;
    if (area > this.maxPixels)
      ratio = Math.max(0.5, Math.sqrt(this.maxPixels / Math.max(1, width * height)));
    const w = Math.max(1, Math.round(width * ratio));
    const h = Math.max(1, Math.round(height * ratio));
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    if ('style' in this.canvas) {
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    }
    this.width = width;
    this.height = height;
    this.ratio = ratio;
  }

  clear(): void {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(marks: readonly Mark[], options: RenderOptions = {}): void {
    const { ctx } = this;
    const resolve = options.resolveColor ?? ((c: string) => c);
    this.clear();
    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.save();
    if (options.clip) {
      ctx.beginPath();
      ctx.rect(options.clip.x, options.clip.y, options.clip.width, options.clip.height);
      ctx.clip();
    }
    let i = 0;
    while (i < marks.length) {
      const first = marks[i] as Mark;
      const stroked = isStrokeMark(first);
      if (first.type === 'symbol') {
        this.drawSymbols(first, resolve);
        i++;
        continue;
      }
      const mergeable = first.type === 'rect' || first.type === 'arc' || first.type === 'rule';
      const key = styleKey(first);
      ctx.beginPath();
      drawMark(ctx, first);
      let j = i + 1;
      // Chromium's closePath() slows down as one path accumulates closed subpaths
      // (measured ~1 s for 10 000 bars), so batches are flushed every MAX_BATCH marks.
      while (mergeable && j < marks.length && j - i < MAX_BATCH) {
        const m = marks[j] as Mark;
        if (m.type !== first.type || isStrokeMark(m) !== stroked || styleKey(m) !== key) break;
        drawMark(ctx, m);
        j++;
      }
      this.paint(first, stroked, resolve);
      i = j;
    }
    ctx.restore();
  }

  /** Point batches are drawn in chunks for the same closePath() reason. */
  private drawSymbols(mark: Extract<Mark, { type: 'symbol' }>, resolve: ColorResolver): void {
    const { ctx } = this;
    const { xs, ys, size, shape } = mark;
    const n = Math.min(xs.length, ys.length);
    for (let start = 0; start < n; start += MAX_BATCH) {
      ctx.beginPath();
      const end = Math.min(n, start + MAX_BATCH);
      for (let k = start; k < end; k++) {
        const x = xs[k] as number;
        const y = ys[k] as number;
        const s = typeof size === 'number' ? size : (size[k] as number);
        if (Number.isFinite(x) && Number.isFinite(y) && s > 0) drawSymbol(ctx, shape, x, y, s);
      }
      this.paint(mark, false, resolve);
    }
  }

  private paint(style: MarkStyle, stroked: boolean, resolve: ColorResolver): void {
    const { ctx } = this;
    ctx.globalAlpha = style.opacity ?? 1;
    ctx.setLineDash(
      style.dash
        ? style.dash
            .split(/[\s,]+/)
            .map(Number)
            .filter(Number.isFinite)
        : [],
    );
    if (stroked) {
      ctx.strokeStyle = resolve(
        style.stroke ?? (typeof style.fill === 'string' ? style.fill : '#000'),
      );
      ctx.lineWidth = style.strokeWidth ?? 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (style.strokeOpacity !== undefined) ctx.globalAlpha *= style.strokeOpacity;
      ctx.stroke();
      return;
    }
    if (style.stroke) {
      // Rings (paint-order: stroke) are drawn before the fill.
      ctx.save();
      ctx.strokeStyle = resolve(style.stroke);
      ctx.lineWidth = style.strokeWidth ?? 1;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = this.fillStyle(style.fill, resolve);
    if (style.fillOpacity !== undefined) ctx.globalAlpha *= style.fillOpacity;
    ctx.fill();
  }

  private fillStyle(paint: Paint | undefined, resolve: ColorResolver): string | CanvasGradient {
    if (paint === undefined) return '#000';
    if (typeof paint === 'string') return resolve(paint);
    return this.gradient(paint, resolve);
  }

  private gradient(paint: LinearGradientPaint, resolve: ColorResolver): CanvasGradient {
    const g = this.ctx.createLinearGradient(paint.x1, paint.y1, paint.x2, paint.y2);
    for (const stop of paint.stops) {
      g.addColorStop(
        Math.min(1, Math.max(0, stop.offset)),
        withOpacity(resolve(stop.color), stop.opacity),
      );
    }
    return g;
  }

  /** Current CSS size. */
  get size(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}

function withOpacity(color: string, opacity: number): string {
  const c = parseColor(color);
  if (!c) return color;
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${c.a * opacity})`;
}

/**
 * Resolves CSS colour expressions canvas cannot parse (`var(--token)`,
 * `light-dark()`, `color-mix()`) by letting the browser compute them on a hidden
 * probe inside `element`, so the canvas uses exactly the colours the SVG would.
 * Cached per expression until `invalidate()` (call it when the theme changes).
 */
export function createColorResolver(
  element: Element,
): ColorResolver & { invalidate(): void; dispose(): void } {
  const cache = new Map<string, string>();
  let probe: HTMLElement | null = null;
  const resolve = ((color: string) => {
    if (!/var\(|light-dark\(|color-mix\(/.test(color)) return color;
    const cached = cache.get(color);
    if (cached !== undefined) return cached;
    if (!probe && typeof document !== 'undefined') {
      probe = document.createElement('span');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText =
        'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
      element.appendChild(probe);
    }
    let value = '#000';
    if (probe) {
      probe.style.color = '';
      probe.style.color = color;
      value = getComputedStyle(probe).color || '#000';
    }
    cache.set(color, value);
    return value;
  }) as ColorResolver & { invalidate(): void; dispose(): void };
  resolve.invalidate = () => cache.clear();
  resolve.dispose = () => {
    probe?.remove();
    probe = null;
    cache.clear();
  };
  return resolve;
}

/** True when a 2D canvas context can be created (false in SSR and some test environments). */
export function isCanvasSupported(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return !!document.createElement('canvas').getContext('2d');
  } catch {
    return false;
  }
}
