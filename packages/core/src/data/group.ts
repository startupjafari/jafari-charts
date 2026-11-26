import { access, type Accessor } from './columns';
import { toLabel } from './values';

/** Groups items by key, preserving first-seen key order and item order. */
export function groupBy<T>(data: readonly T[], key: Accessor<T>): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  data.forEach((d, i) => {
    const k = toLabel(access(d, key, i));
    const g = groups.get(k);
    if (g) g.push(d);
    else groups.set(k, [d]);
  });
  return groups;
}

/** True when values are non-decreasing (NaN entries are ignored). */
export function isSortedAscending(values: ArrayLike<number>): boolean {
  let prev = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    if (Number.isNaN(v)) continue;
    if (v < prev) return false;
    prev = v;
  }
  return true;
}

/** Indices that sort `values` ascending (stable; NaN last). */
export function sortIndices(values: ArrayLike<number>): Uint32Array {
  const idx = Uint32Array.from({ length: values.length }, (_, i) => i);
  idx.sort((a, b) => {
    const va = values[a] as number;
    const vb = values[b] as number;
    if (Number.isNaN(va)) return Number.isNaN(vb) ? a - b : 1;
    if (Number.isNaN(vb)) return -1;
    return va - vb || a - b;
  });
  return idx;
}

/** Reorders a typed column by an index permutation. */
export function permute(values: ArrayLike<number>, order: ArrayLike<number>): Float64Array {
  const out = new Float64Array(order.length);
  for (let i = 0; i < order.length; i++) out[i] = values[order[i] as number] as number;
  return out;
}
