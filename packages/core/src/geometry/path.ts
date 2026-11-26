/**
 * Minimal drawing interface shared by the SVG path-string builder and the native
 * CanvasRenderingContext2D. Every geometry generator in the core writes to a
 * `PathSink`, so the same code produces SVG `d` attributes and Canvas paths.
 */
export interface PathSink {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
  ): void;
  closePath(): void;
}

const TAU = Math.PI * 2;
const EPSILON = 1e-6;

/**
 * Builds a compact SVG path string. Numbers are rounded to `precision` decimals,
 * which keeps markup small (sub-pixel precision beyond 2 decimals is invisible).
 */
export class PathBuilder implements PathSink {
  private parts: string[] = [];
  private x0: number | null = null;
  private y0: number | null = null;
  private x1: number | null = null;
  private y1: number | null = null;
  private readonly scale: number;

  constructor(precision = 2) {
    this.scale = 10 ** precision;
  }

  private r(n: number): number {
    return Math.round(n * this.scale) / this.scale;
  }

  moveTo(x: number, y: number): void {
    this.x0 = this.x1 = x;
    this.y0 = this.y1 = y;
    this.parts.push(`M${this.r(x)},${this.r(y)}`);
  }

  lineTo(x: number, y: number): void {
    this.x1 = x;
    this.y1 = y;
    this.parts.push(`L${this.r(x)},${this.r(y)}`);
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void {
    this.x1 = x;
    this.y1 = y;
    this.parts.push(
      `C${this.r(cp1x)},${this.r(cp1y)},${this.r(cp2x)},${this.r(cp2y)},${this.r(x)},${this.r(y)}`,
    );
  }

  /** Same semantics as `CanvasRenderingContext2D.arc`, emitted as SVG arc commands. */
  arc(x: number, y: number, radius: number, a0: number, a1: number, ccw = false): void {
    const r = Math.abs(radius);
    const dx = r * Math.cos(a0);
    const dy = r * Math.sin(a0);
    const sx = x + dx;
    const sy = y + dy;
    const cw = ccw ? 0 : 1;
    let da = ccw ? a0 - a1 : a1 - a0;

    if (this.x1 === null || this.y1 === null) {
      this.parts.push(`M${this.r(sx)},${this.r(sy)}`);
    } else if (Math.abs(this.x1 - sx) > EPSILON || Math.abs(this.y1 - sy) > EPSILON) {
      this.parts.push(`L${this.r(sx)},${this.r(sy)}`);
    }
    if (this.x0 === null) {
      this.x0 = sx;
      this.y0 = sy;
    }
    if (r < EPSILON) return;
    if (da < 0) da = (da % TAU) + TAU;

    if (da > TAU - EPSILON) {
      // Full circle: two half arcs (a single SVG arc cannot draw 360°).
      const mx = x - dx;
      const my = y - dy;
      this.parts.push(
        `A${this.r(r)},${this.r(r)},0,1,${cw},${this.r(mx)},${this.r(my)}`,
        `A${this.r(r)},${this.r(r)},0,1,${cw},${this.r(sx)},${this.r(sy)}`,
      );
      this.x1 = sx;
      this.y1 = sy;
    } else if (da > EPSILON) {
      const ex = x + r * Math.cos(a1);
      const ey = y + r * Math.sin(a1);
      const large = da >= Math.PI ? 1 : 0;
      this.parts.push(`A${this.r(r)},${this.r(r)},0,${large},${cw},${this.r(ex)},${this.r(ey)}`);
      this.x1 = ex;
      this.y1 = ey;
    }
  }

  closePath(): void {
    if (this.x1 !== null) {
      this.x1 = this.x0;
      this.y1 = this.y0;
      this.parts.push('Z');
    }
  }

  isEmpty(): boolean {
    return this.parts.length === 0;
  }

  toString(): string {
    return this.parts.join('');
  }
}

/** Runs `draw` against a fresh builder and returns the resulting path string. */
export function buildPath(draw: (sink: PathSink) => void, precision = 2): string {
  const builder = new PathBuilder(precision);
  draw(builder);
  return builder.toString();
}
