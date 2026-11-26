import { describe, expect, it } from 'vitest';
import { drawCurve } from '../interpolation/curves';
import { buildPath, PathBuilder, type PathSink } from './path';
import {
  definedRuns,
  drawArc,
  drawArea,
  drawLine,
  drawRoundedRect,
  drawSymbol,
  SYMBOL_SHAPES,
} from './shapes';

/** Records commands and tracks the bounding box of every endpoint/control point. */
class Recorder implements PathSink {
  cmds: string[] = [];
  minX = Infinity;
  maxX = -Infinity;
  minY = Infinity;
  maxY = -Infinity;
  private see(x: number, y: number) {
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
  }
  moveTo(x: number, y: number) {
    this.cmds.push('M');
    this.see(x, y);
  }
  lineTo(x: number, y: number) {
    this.cmds.push('L');
    this.see(x, y);
  }
  bezierCurveTo(a: number, b: number, c: number, d: number, x: number, y: number) {
    this.cmds.push('C');
    this.see(a, b);
    this.see(c, d);
    this.see(x, y);
  }
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw = false) {
    this.cmds.push('A');
    // Sample along the arc so the bounding box covers its extremes.
    let sweep = ccw ? a0 - a1 : a1 - a0;
    if (sweep < 0) sweep += Math.PI * 2;
    for (let i = 0; i <= 32; i++) {
      const a = a0 + ((ccw ? -1 : 1) * (sweep * i)) / 32;
      this.see(x + r * Math.cos(a), y + r * Math.sin(a));
    }
  }
  closePath() {
    this.cmds.push('Z');
  }
}

describe('PathBuilder', () => {
  it('emits compact, rounded commands', () => {
    const p = new PathBuilder(2);
    p.moveTo(0.123456, 1);
    p.lineTo(10, 20.005);
    p.closePath();
    expect(p.toString()).toBe('M0.12,1L10,20.01Z');
  });

  it('draws full circles as two arcs', () => {
    const d = buildPath((s) => {
      s.moveTo(10, 0);
      s.arc(0, 0, 10, 0, Math.PI * 2);
    });
    expect(d).toBe('M10,0A10,10,0,1,1,-10,0A10,10,0,1,1,10,0');
  });

  it('connects arcs to the current point and flags large arcs', () => {
    const d = buildPath((s) => {
      s.moveTo(0, 0);
      s.arc(0, 0, 10, 0, Math.PI * 1.5);
    });
    expect(d.startsWith('M0,0L10,0A10,10,0,1,1')).toBe(true);
  });
});

describe('lines and areas', () => {
  const xs = Float64Array.from([0, 10, 20, 30, 40]);

  it('splits lines at missing values', () => {
    const ys = Float64Array.from([1, 2, Number.NaN, 4, 5]);
    expect(definedRuns(xs, ys)).toEqual([
      [0, 2],
      [3, 5],
    ]);
    const d = buildPath((s) => drawLine(s, xs, ys));
    expect(d).toBe('M0,1L10,2M30,4L40,5');
  });

  it('draws nothing for empty or all-missing input', () => {
    expect(buildPath((s) => drawLine(s, new Float64Array(0), new Float64Array(0)))).toBe('');
    expect(buildPath((s) => drawLine(s, xs, new Float64Array(5).fill(Number.NaN)))).toBe('');
  });

  it('closes areas against a constant baseline', () => {
    const d = buildPath((s) =>
      drawArea(s, Float64Array.from([0, 10]), Float64Array.from([5, 6]), 100),
    );
    expect(d).toBe('M0,5L10,6L10,100L0,100Z');
  });

  it('traces stacked baselines in reverse', () => {
    const d = buildPath((s) =>
      drawArea(s, Float64Array.from([0, 10]), Float64Array.from([1, 2]), Float64Array.from([5, 6])),
    );
    expect(d).toBe('M0,1L10,2L10,6L0,5Z');
  });

  it('draws a single point as a degenerate move', () => {
    expect(buildPath((s) => drawLine(s, [5], [5]))).toBe('M5,5');
  });
});

describe('monotone interpolation never overshoots', () => {
  function bezierAt(p0: number, p1: number, p2: number, p3: number, t: number) {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }

  it('stays within each segment’s endpoint range on random data', () => {
    let seed = 42;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let trial = 0; trial < 50; trial++) {
      const n = 3 + Math.floor(rnd() * 20);
      const xs: number[] = [];
      const ys: number[] = [];
      let x = 0;
      for (let i = 0; i < n; i++) {
        x += 1 + rnd() * 10;
        xs.push(x);
        ys.push(rnd() < 0.2 ? (ys[i - 1] ?? 0) : rnd() * 100 - 50);
      }
      const segments: number[][] = [];
      let last: [number, number] = [xs[0] as number, ys[0] as number];
      drawCurve(
        {
          moveTo: (px, py) => (last = [px, py]),
          lineTo: (px, py) => (last = [px, py]),
          bezierCurveTo: (_a, b, _c, d, ex, ey) => {
            segments.push([last[1], b, d, ey]);
            last = [ex, ey];
          },
          arc: () => {},
          closePath: () => {},
        },
        xs,
        ys,
        'monotone',
      );
      expect(segments).toHaveLength(n - 1);
      segments.forEach(([y0, c1, c2, y1], i) => {
        expect(y0).toBeCloseTo(ys[i] as number);
        expect(y1).toBeCloseTo(ys[i + 1] as number);
        const lo = Math.min(y0 as number, y1 as number) - 1e-9;
        const hi = Math.max(y0 as number, y1 as number) + 1e-9;
        for (let t = 0; t <= 1; t += 0.05) {
          const v = bezierAt(y0 as number, c1 as number, c2 as number, y1 as number, t);
          expect(v).toBeGreaterThanOrEqual(lo);
          expect(v).toBeLessThanOrEqual(hi);
        }
      });
    }
  });

  it('keeps flat runs flat', () => {
    const d = buildPath((s) => drawCurve(s, [0, 1, 2, 3], [5, 5, 5, 5], 'monotone'));
    expect(d).toBe('M0,5C0.33,5,0.67,5,1,5C1.33,5,1.67,5,2,5C2.33,5,2.67,5,3,5');
  });
});

describe('step curves', () => {
  const xs = [0, 10];
  const ys = [0, 5];
  it('places the riser according to the variant', () => {
    expect(buildPath((s) => drawCurve(s, xs, ys, 'step'))).toBe('M0,0L5,0L5,5L10,5');
    expect(buildPath((s) => drawCurve(s, xs, ys, 'stepAfter'))).toBe('M0,0L10,0L10,5');
    expect(buildPath((s) => drawCurve(s, xs, ys, 'stepBefore'))).toBe('M0,0L0,5L10,5');
  });
});

describe('rounded rectangles', () => {
  it('clamps radii to half the shortest side', () => {
    const r = new Recorder();
    drawRoundedRect(r, 0, 0, 10, 4, 100);
    expect(r.minX).toBeGreaterThanOrEqual(0);
    expect(r.maxX).toBeLessThanOrEqual(10);
    expect(r.maxY).toBeLessThanOrEqual(4);
  });

  it('normalises negative sizes (bars below zero)', () => {
    const r = new Recorder();
    drawRoundedRect(r, 10, 50, 20, -30, [0, 0, 4, 4]);
    expect([r.minX, r.maxX, r.minY, r.maxY]).toEqual([10, 30, 20, 50]);
  });

  it('draws plain rectangles without arcs', () => {
    expect(buildPath((s) => drawRoundedRect(s, 1, 2, 3, 4))).toBe('M1,2L4,2L4,6L1,6Z');
  });
});

describe('arcs', () => {
  const base = { cx: 100, cy: 100, innerRadius: 50, outerRadius: 80 };

  it('keeps every point inside the outer radius', () => {
    for (const cornerRadius of [0, 4, 30]) {
      for (const [a0, a1] of [
        [0, Math.PI / 2],
        [0, Math.PI * 1.5],
        [1, 1.05],
      ] as const) {
        const r = new Recorder();
        drawArc(r, { ...base, startAngle: a0, endAngle: a1, cornerRadius, padding: 2 });
        expect(r.cmds[0]).toBe('M');
        expect(r.cmds.at(-1)).toBe('Z');
        expect(r.minX).toBeGreaterThanOrEqual(100 - 80 - 1e-6);
        expect(r.maxX).toBeLessThanOrEqual(100 + 80 + 1e-6);
        expect(r.maxY).toBeLessThanOrEqual(100 + 80 + 1e-6);
      }
    }
  });

  it('starts at 12 o’clock and runs clockwise', () => {
    const r = new Recorder();
    drawArc(r, {
      cx: 0,
      cy: 0,
      innerRadius: 0,
      outerRadius: 10,
      startAngle: 0,
      endAngle: Math.PI / 2,
    });
    // Quarter from 12 to 3 o'clock lies in the top-right quadrant (y up is negative).
    expect(r.minX).toBeGreaterThanOrEqual(-1e-9);
    expect(r.maxY).toBeLessThanOrEqual(1e-9);
  });

  it('draws full rings as two subpaths and skips empty sectors', () => {
    const ring = buildPath((s) => drawArc(s, { ...base, startAngle: 0, endAngle: Math.PI * 2 }));
    expect(ring.match(/M/g)).toHaveLength(2);
    expect(buildPath((s) => drawArc(s, { ...base, startAngle: 1, endAngle: 1 }))).toBe('');
    // A sector narrower than its gap disappears instead of inverting.
    expect(
      buildPath((s) => drawArc(s, { ...base, startAngle: 0, endAngle: 0.01, padding: 4 })),
    ).toBe('');
  });
});

describe('symbols', () => {
  it('draws every shape centred on the point', () => {
    for (const shape of SYMBOL_SHAPES) {
      const r = new Recorder();
      drawSymbol(r, shape, 50, 50, 10);
      expect((r.minX + r.maxX) / 2).toBeCloseTo(50, 0);
      expect(r.maxX - r.minX).toBeGreaterThan(5);
      expect(r.maxX - r.minX).toBeLessThan(20);
    }
  });
});
