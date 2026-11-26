import type { Rect } from '../types';

export interface HierarchyInput {
  name: string;
  value?: number;
  children?: readonly HierarchyInput[];
}

export interface TreemapNode<N extends HierarchyInput = HierarchyInput> {
  data: N;
  /** Sum of descendant leaf values (or own value for leaves). */
  value: number;
  depth: number;
  /** Position among siblings in input order. */
  index: number;
  /** Path of names from the root, for stable keys. */
  path: string;
  parent: TreemapNode<N> | null;
  children: TreemapNode<N>[];
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface TreemapOptions {
  /** Gap between sibling tiles, px. */
  paddingInner?: number;
  /** Space reserved at the top of parent tiles (for a header label), px. */
  paddingTop?: number;
  /** Space inside parent tiles on the other sides, px. */
  paddingOuter?: number;
  /** Target aspect ratio for squarification (golden ratio by default). */
  ratio?: number;
}

/** Builds the hierarchy: sums values bottom-up, ignoring negative and invalid values. */
export function hierarchy<N extends HierarchyInput>(root: N): TreemapNode<N> {
  const build = (
    data: N,
    depth: number,
    index: number,
    parent: TreemapNode<N> | null,
  ): TreemapNode<N> => {
    const path = parent ? `${parent.path}/${data.name}` : data.name;
    const node: TreemapNode<N> = {
      data,
      value: 0,
      depth,
      index,
      path,
      parent,
      children: [],
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
    };
    const kids = (data.children ?? []) as readonly N[];
    if (kids.length) {
      node.children = kids.map((c, i) => build(c, depth + 1, i, node));
      node.value = node.children.reduce((s, c) => s + c.value, 0);
    } else {
      const v = data.value ?? 0;
      node.value = Number.isFinite(v) && v > 0 ? v : 0;
    }
    return node;
  };
  return build(root, 0, 0, null);
}

/**
 * Squarified treemap (Bruls, Huizing & van Wijk, 2000). Tile areas are exactly
 * proportional to values; rows are grown while the worst aspect ratio improves.
 */
export function treemap<N extends HierarchyInput>(
  root: TreemapNode<N>,
  bounds: Rect,
  options: TreemapOptions = {},
): TreemapNode<N>[] {
  const {
    paddingInner = 2,
    paddingTop = 0,
    paddingOuter = 0,
    ratio = (1 + Math.sqrt(5)) / 2,
  } = options;
  root.x0 = bounds.x;
  root.y0 = bounds.y;
  root.x1 = bounds.x + bounds.width;
  root.y1 = bounds.y + bounds.height;
  const nodes: TreemapNode<N>[] = [];

  const visit = (node: TreemapNode<N>) => {
    nodes.push(node);
    if (!node.children.length) return;
    const inner = {
      x0: node.x0 + (node.depth > 0 ? paddingOuter : 0),
      y0: node.y0 + (node.depth > 0 ? paddingTop || paddingOuter : 0),
      x1: node.x1 - (node.depth > 0 ? paddingOuter : 0),
      y1: node.y1 - (node.depth > 0 ? paddingOuter : 0),
    };
    if (inner.x1 < inner.x0) inner.x1 = inner.x0;
    if (inner.y1 < inner.y0) inner.y1 = inner.y0;
    const kids = node.children
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value || a.index - b.index);
    for (const c of node.children) if (c.value <= 0) c.x0 = c.x1 = c.y0 = c.y1 = inner.x0;
    squarify(kids, inner, ratio);
    if (paddingInner > 0) {
      const h = paddingInner / 2;
      for (const c of kids) {
        // Inset shared edges only, so outer edges stay flush with the parent.
        if (c.x0 > inner.x0 + 1e-6) c.x0 += h;
        if (c.x1 < inner.x1 - 1e-6) c.x1 -= h;
        if (c.y0 > inner.y0 + 1e-6) c.y0 += h;
        if (c.y1 < inner.y1 - 1e-6) c.y1 -= h;
        if (c.x1 < c.x0) c.x1 = c.x0 = (c.x0 + c.x1) / 2;
        if (c.y1 < c.y0) c.y1 = c.y0 = (c.y0 + c.y1) / 2;
      }
    }
    node.children.forEach(visit);
  };
  visit(root);
  return nodes;
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function squarify<N extends HierarchyInput>(
  nodes: TreemapNode<N>[],
  box: Box,
  ratio: number,
): void {
  let total = 0;
  for (const n of nodes) total += n.value;
  if (total <= 0) return;
  let { x0, y0 } = box;
  const { x1, y1 } = box;
  let remaining = total;
  let i = 0;
  while (i < nodes.length) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const area = dx * dy;
    const k = remaining > 0 ? area / remaining : 0; // px² per value unit
    // Lay the row along the shorter side.
    const side = Math.min(dx, dy);
    let rowValue = 0;
    let minV = Number.POSITIVE_INFINITY;
    let maxV = 0;
    let worst = Number.POSITIVE_INFINITY;
    let j = i;
    for (; j < nodes.length; j++) {
      const v = (nodes[j] as TreemapNode<N>).value;
      const nextSum = rowValue + v;
      const nextMin = Math.min(minV, v);
      const nextMax = Math.max(maxV, v);
      const s2 = (nextSum * k) ** 2;
      const side2 = side * side;
      const w =
        s2 > 0
          ? Math.max((ratio * side2 * nextMax * k) / s2, s2 / (side2 * nextMin * k * ratio))
          : Number.POSITIVE_INFINITY;
      if (j > i && w > worst) break;
      worst = w;
      rowValue = nextSum;
      minV = nextMin;
      maxV = nextMax;
    }
    const row = nodes.slice(i, j);
    const rowArea = rowValue * k;
    if (dx >= dy) {
      // Vertical strip on the left.
      const w = dy > 0 ? rowArea / dy : 0;
      let y = y0;
      row.forEach((n, idx) => {
        const h = rowValue > 0 ? (n.value / rowValue) * dy : 0;
        n.x0 = x0;
        n.x1 = x0 + w;
        n.y0 = y;
        n.y1 = idx === row.length - 1 ? y1 : y + h;
        y += h;
      });
      x0 += w;
    } else {
      const h = dx > 0 ? rowArea / dx : 0;
      let x = x0;
      row.forEach((n, idx) => {
        const w = rowValue > 0 ? (n.value / rowValue) * dx : 0;
        n.y0 = y0;
        n.y1 = y0 + h;
        n.x0 = x;
        n.x1 = idx === row.length - 1 ? x1 : x + w;
        x += w;
      });
      y0 += h;
    }
    remaining -= rowValue;
    i = j;
  }
}
