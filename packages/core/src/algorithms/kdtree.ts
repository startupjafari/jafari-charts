/**
 * Static 2-d tree for nearest-neighbour queries over pixel coordinates.
 * Built once per data/size change in O(n log n); each query is O(log n) on
 * average, so hover on a 100k-point scatter costs microseconds.
 * Points with non-finite coordinates are skipped.
 */
export class KDTree {
  /** Original point indices, reordered into tree order. */
  readonly ids: Uint32Array;
  /** Interleaved x,y coordinates in tree order. */
  private readonly coords: Float64Array;
  private readonly nodeSize: number;

  constructor(xs: ArrayLike<number>, ys: ArrayLike<number>, nodeSize = 16) {
    const valid: number[] = [];
    const n = Math.min(xs.length, ys.length);
    for (let i = 0; i < n; i++) {
      if (Number.isFinite(xs[i] as number) && Number.isFinite(ys[i] as number)) valid.push(i);
    }
    this.ids = Uint32Array.from(valid);
    this.coords = new Float64Array(valid.length * 2);
    valid.forEach((id, k) => {
      this.coords[2 * k] = xs[id] as number;
      this.coords[2 * k + 1] = ys[id] as number;
    });
    this.nodeSize = Math.max(2, nodeSize);
    this.sort(0, this.ids.length - 1, 0);
  }

  get size(): number {
    return this.ids.length;
  }

  /** Index (into the original arrays) of the closest point within `maxDistance`, or -1. */
  nearest(x: number, y: number, maxDistance = Number.POSITIVE_INFINITY): number {
    let best = -1;
    let bestD2 =
      maxDistance === Number.POSITIVE_INFINITY
        ? Number.POSITIVE_INFINITY
        : maxDistance * maxDistance;
    const { coords, ids, nodeSize } = this;
    const stack: number[] = [0, ids.length - 1, 0];
    while (stack.length) {
      const axis = stack.pop() as number;
      const right = stack.pop() as number;
      const left = stack.pop() as number;
      if (right < left) continue;
      if (right - left <= nodeSize) {
        for (let i = left; i <= right; i++) {
          const d2 = sq((coords[2 * i] as number) - x) + sq((coords[2 * i + 1] as number) - y);
          if (d2 < bestD2) {
            bestD2 = d2;
            best = i;
          }
        }
        continue;
      }
      const m = (left + right) >> 1;
      const mx = coords[2 * m] as number;
      const my = coords[2 * m + 1] as number;
      const d2 = sq(mx - x) + sq(my - y);
      if (d2 < bestD2) {
        bestD2 = d2;
        best = m;
      }
      const delta = axis === 0 ? x - mx : y - my;
      const near = delta <= 0 ? [left, m - 1] : [m + 1, right];
      const far = delta <= 0 ? [m + 1, right] : [left, m - 1];
      // Push far side first so the near side is explored first; prune the far side
      // when the splitting plane is further than the best match.
      if (delta * delta < bestD2) stack.push(far[0] as number, far[1] as number, 1 - axis);
      stack.push(near[0] as number, near[1] as number, 1 - axis);
    }
    return best < 0 ? -1 : (ids[best] as number);
  }

  /** Original indices of all points within `radius` of (x, y). */
  within(x: number, y: number, radius: number): number[] {
    const result: number[] = [];
    const r2 = radius * radius;
    const { coords, ids, nodeSize } = this;
    const stack: number[] = [0, ids.length - 1, 0];
    while (stack.length) {
      const axis = stack.pop() as number;
      const right = stack.pop() as number;
      const left = stack.pop() as number;
      if (right < left) continue;
      if (right - left <= nodeSize) {
        for (let i = left; i <= right; i++) {
          if (sq((coords[2 * i] as number) - x) + sq((coords[2 * i + 1] as number) - y) <= r2) {
            result.push(ids[i] as number);
          }
        }
        continue;
      }
      const m = (left + right) >> 1;
      const mx = coords[2 * m] as number;
      const my = coords[2 * m + 1] as number;
      if (sq(mx - x) + sq(my - y) <= r2) result.push(ids[m] as number);
      const v = axis === 0 ? x : y;
      const mv = axis === 0 ? mx : my;
      if (v - radius <= mv) stack.push(left, m - 1, 1 - axis);
      if (v + radius >= mv) stack.push(m + 1, right, 1 - axis);
    }
    return result;
  }

  private sort(left: number, right: number, axis: number): void {
    if (right - left <= this.nodeSize) return;
    const m = (left + right) >> 1;
    this.select(m, left, right, axis);
    this.sort(left, m - 1, 1 - axis);
    this.sort(m + 1, right, 1 - axis);
  }

  /** Floyd–Rivest-style quickselect: puts the k-th smallest (on `axis`) at index k. */
  private select(k: number, left: number, right: number, axis: number): void {
    const c = this.coords;
    while (right > left) {
      const pivot = c[2 * k + axis] as number;
      let i = left;
      let j = right;
      this.swap(left, k);
      if ((c[2 * right + axis] as number) > pivot) this.swap(left, right);
      while (i < j) {
        this.swap(i, j);
        i++;
        j--;
        while ((c[2 * i + axis] as number) < pivot) i++;
        while ((c[2 * j + axis] as number) > pivot) j--;
      }
      if ((c[2 * left + axis] as number) === pivot) this.swap(left, j);
      else {
        j++;
        this.swap(j, right);
      }
      if (j <= k) left = j + 1;
      if (k <= j) right = j - 1;
    }
  }

  private swap(i: number, j: number): void {
    const ids = this.ids;
    const c = this.coords;
    const t = ids[i] as number;
    ids[i] = ids[j] as number;
    ids[j] = t;
    const x = c[2 * i] as number;
    const y = c[2 * i + 1] as number;
    c[2 * i] = c[2 * j] as number;
    c[2 * i + 1] = c[2 * j + 1] as number;
    c[2 * j] = x;
    c[2 * j + 1] = y;
  }
}

function sq(v: number): number {
  return v * v;
}
