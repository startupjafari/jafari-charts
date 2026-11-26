import { hierarchy, treemap, type HierarchyInput, type TreemapNode } from '../algorithms/treemap';
import { onFillColor } from '../color/color';
import { formatAuto } from '../formatting/number';
import { estimateTextWidth, truncateText } from '../formatting/text';
import type { Mark, RectMark, TextMark } from '../scene/marks';
import type { Rect } from '../types';

// ---------------------------------------------------------------------------------------------
// Treemap chart model (layout via the squarified algorithm in ../algorithms/treemap)
// ---------------------------------------------------------------------------------------------

export interface TreemapModelSpec<N extends HierarchyInput = HierarchyInput> {
  width: number;
  height: number;
  /** Root of the hierarchy; its children are the top-level categories (legend, colours). */
  data: N;
  /** Colour per top-level category, by position in `data.children`. */
  colors: readonly string[];
  /** Keys of hidden top-level categories (see `TreemapBranch.key`). */
  hidden?: ReadonlySet<string>;
  /** Key of the tile to zoom into (drill-down). Unknown keys fall back to the root. */
  focus?: string | null;
  /** Surface gap between sibling tiles, px (default 2). */
  gap?: number;
  cornerRadius?: number;
  /** Reserve a header strip with the name on parent tiles that have room (default true). */
  headers?: boolean;
  /** Header strip height including the gap below it, px (default font size + 9). */
  headerHeight?: number;
  /** Name and value labels on leaves that fit (default true). */
  labels?: boolean;
  /**
   * Grow parents by the area of their header strips so that leaf areas stay exactly
   * proportional to values across the whole chart (default true).
   */
  proportional?: boolean;
  /** Slightly lighter leaves at deeper levels (default false). */
  depthShading?: boolean;
  /** Space reserved above the tiles (e.g. a breadcrumb), px. */
  top?: number;
  fontSize?: number;
  locale?: string;
  formatValue?: (value: number) => string;
}

export interface TreemapBranch {
  /** Stable identity (name, de-duplicated with `#n`). */
  key: string;
  name: string;
  /** Position in `data.children`. */
  index: number;
  /** Sum of the category's valid values (also when hidden). */
  value: number;
  color: string;
  hidden: boolean;
}

export interface TreemapTile<N extends HierarchyInput = HierarchyInput> {
  /** Stable identity: names from the root joined by `/` (siblings de-duplicated). */
  key: string;
  name: string;
  /** Names from the top-level category down to this tile. */
  path: string[];
  node: TreemapNode<N>;
  value: number;
  /** Depth in the full hierarchy (1 = top-level category). */
  depth: number;
  /** Top-level category index (the series). */
  branch: number;
  /** True when drawn as a leaf (no visible children). */
  leaf: boolean;
  /** True when a header strip is reserved at the top. */
  header: boolean;
  /** Tile index of the parent, or -1 below the layout root. */
  parent: number;
  children: number[];
  color: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface TreemapModel<N extends HierarchyInput = HierarchyInput> {
  /** Laid-out tiles below the layout root, depth-first (largest first among siblings). */
  tiles: TreemapTile<N>[];
  /** Leaf tile indices in navigation order (depth-first, largest first). */
  leaves: number[];
  branches: TreemapBranch[];
  /** Layout root: the focused tile's key and names (empty path = whole tree). */
  focus: { key: string | null; path: string[]; name: string; value: number };
  /** Visible total of the whole tree; shares are relative to it. */
  total: number;
  /** Tile area, px. */
  plot: Rect;
  headerHeight: number;
  marks: Mark[];
  labels: TextMark[];
  /** Deepest tile under the point (a leaf, or a parent on its header), or -1. */
  hitTest(x: number, y: number): number;
  /** Marks emphasising a tile: the leaf itself, or a parent's header and outline. */
  activeMarks(index: number): Mark[];
  /** Leaf marks inside a parent tile (for highlighting a whole group). */
  leafMarks(index: number): Mark[];
  /** Labels of a tile and its descendants (to redraw above emphasised marks). */
  labelsOf(index: number): TextMark[];
  anchor(index: number): { x: number; y: number };
  /** Nearest leaf in a direction (spatial keyboard navigation), or -1. */
  neighbor(index: number, direction: 'up' | 'down' | 'left' | 'right'): number;
}

interface LayoutNode<N extends HierarchyInput> {
  node: TreemapNode<N>;
  key: string;
  branch: number;
  kids: LayoutNode<N>[];
  header: boolean;
  /** Layout weight: value plus the header area of the subtree in value units. */
  weight: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const SEP = '/';
/** Width factor of semibold label text relative to the regular-weight estimate. */
const BOLD = 1.1;

/** De-duplicated child keys (`name`, `name#1`, …) so siblings with equal names stay distinct. */
function childKeys(parentKey: string, kids: readonly { data: HierarchyInput }[]): string[] {
  const seen = new Map<string, number>();
  return kids.map((k) => {
    const name = k.data.name;
    const n = seen.get(name) ?? 0;
    seen.set(name, n + 1);
    const own = n ? `${name}#${n}` : name;
    return parentKey ? `${parentKey}${SEP}${own}` : own;
  });
}

export function buildTreemapModel<N extends HierarchyInput>(
  spec: TreemapModelSpec<N>,
): TreemapModel<N> {
  const fs = spec.fontSize ?? 11;
  const gap = Math.max(0, spec.gap ?? 2);
  const radius = spec.cornerRadius ?? 3;
  const headersOn = spec.headers !== false;
  const headerH = spec.headerHeight ?? fs + 9;
  const showLabels = spec.labels !== false;
  const locale = spec.locale ?? 'en';
  const fv = spec.formatValue ?? ((v: number) => formatAuto(v, locale));
  const hidden = spec.hidden ?? new Set<string>();
  const top = Math.max(0, spec.top ?? 0);
  const plot: Rect = {
    x: 0,
    y: top,
    width: Math.max(0, spec.width),
    height: Math.max(0, spec.height - top),
  };

  // ---- 1. Hierarchy, branches and visibility ---------------------------------------------------
  const root = hierarchy(spec.data);
  const branchKeys = childKeys('', root.children);
  const branches: TreemapBranch[] = root.children.map((c, i) => ({
    key: branchKeys[i] as string,
    name: c.data.name,
    index: i,
    value: c.value,
    color: spec.colors[i] ?? spec.colors[i % Math.max(1, spec.colors.length)] ?? 'currentColor',
    hidden: hidden.has(branchKeys[i] as string),
  }));
  let total = 0;
  for (const b of branches) if (!b.hidden) total += b.value;

  // Visible layout tree (value > 0, hidden categories removed), largest first among siblings.
  const build = (node: TreemapNode<N>, key: string, branch: number): LayoutNode<N> | null => {
    if (!(node.value > 0)) return null;
    const keys = node.depth === 0 ? branchKeys : childKeys(key, node.children);
    const kids: LayoutNode<N>[] = [];
    node.children.forEach((c, i) => {
      const b = node.depth === 0 ? i : branch;
      if (node.depth === 0 && branches[i]?.hidden) return;
      const k = build(c, keys[i] as string, b);
      if (k) kids.push(k);
    });
    kids.sort((a, b) => b.node.value - a.node.value || a.node.index - b.node.index);
    const value = node.depth === 0 ? kids.reduce((s, k) => s + k.node.value, 0) : node.value;
    return { node, key, branch, kids, header: false, weight: value, x0: 0, y0: 0, x1: 0, y1: 0 };
  };
  const full = build(root, '', -1);

  // Focus: walk down by key; unknown or hidden keys fall back to the whole tree.
  let layoutRoot = full;
  if (full && spec.focus) {
    const find = (l: LayoutNode<N>): LayoutNode<N> | null => {
      if (l.key === spec.focus) return l;
      for (const k of l.kids)
        if (spec.focus === k.key || spec.focus?.startsWith(k.key + SEP)) return find(k);
      return null;
    };
    const f = find(full);
    if (f && f.kids.length) layoutRoot = f;
  }

  // ---- 2. Layout -------------------------------------------------------------------------------
  const contentBox = (l: LayoutNode<N>, isRoot: boolean) => ({
    x0: l.x0,
    y0: Math.min(l.y1, l.y0 + (!isRoot && l.header ? headerH : 0)),
    x1: l.x1,
    y1: l.y1,
  });
  /**
   * Header strips on groups with room. Below the top level, headers appear only when most
   * sibling groups are roomy, so dense levels do not get a patchy mix of headers.
   */
  const decideHeaders = (kids: readonly LayoutNode<N>[], relativeDepth: number) => {
    const groups = kids.filter((k) => k.kids.length > 0);
    const size = (k: LayoutNode<N>, w: number, h: number) =>
      k.x1 - k.x0 >= w && k.y1 - k.y0 >= headerH * h + 8;
    const roomy = groups.filter((k) => size(k, 60, 3)).length;
    const consistent = relativeDepth <= 1 || roomy * 2 >= groups.length;
    for (const k of kids) k.header = headersOn && consistent && k.kids.length > 0 && size(k, 40, 2);
  };

  /** One squarified level per parent via the shared algorithm, then recurse. */
  const pass = (decide: boolean) => {
    if (!layoutRoot) return;
    layoutRoot.x0 = plot.x;
    layoutRoot.y0 = plot.y;
    layoutRoot.x1 = plot.x + plot.width;
    layoutRoot.y1 = plot.y + plot.height;
    const visit = (l: LayoutNode<N>, isRoot: boolean, relativeDepth: number) => {
      if (!l.kids.length) return;
      const box = contentBox(l, isRoot);
      const temp: TreemapNode<HierarchyInput>[] = l.kids.map((k, i) => ({
        data: k.node.data,
        value: k.weight,
        depth: 1,
        index: i,
        path: '',
        parent: null,
        children: [],
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
      }));
      const tempRoot: TreemapNode<HierarchyInput> = {
        data: l.node.data,
        value: l.kids.reduce((s, k) => s + k.weight, 0),
        depth: 0,
        index: 0,
        path: '',
        parent: null,
        children: temp,
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
      };
      treemap(
        tempRoot,
        { x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 },
        { paddingInner: gap, paddingTop: 0, paddingOuter: 0 },
      );
      l.kids.forEach((k, i) => {
        const t = temp[i] as TreemapNode<HierarchyInput>;
        // Sub-gap tiles collapse to a midpoint; keep them inside the parent anyway.
        k.x0 = Math.min(box.x1, Math.max(box.x0, t.x0));
        k.y0 = Math.min(box.y1, Math.max(box.y0, t.y0));
        k.x1 = Math.min(box.x1, Math.max(k.x0, t.x1));
        k.y1 = Math.min(box.y1, Math.max(k.y0, t.y1));
      });
      if (decide) decideHeaders(l.kids, relativeDepth + 1);
      for (const k of l.kids) visit(k, false, relativeDepth + 1);
    };
    visit(layoutRoot, true, 0);
  };

  pass(true);
  if (layoutRoot && headersOn && spec.proportional !== false) {
    // Header strips take area away from their children. Give every parent extra weight for
    // the strips in its subtree so that px² per value unit is the same everywhere.
    const plotArea = plot.width * plot.height;
    for (let iteration = 0; iteration < 2; iteration++) {
      const strips = (l: LayoutNode<N>, isRoot: boolean): number => {
        let sum = !isRoot && l.header ? (l.x1 - l.x0) * headerH : 0;
        for (const k of l.kids) sum += strips(k, false);
        return sum;
      };
      const all = strips(layoutRoot, true);
      if (all <= 0) break;
      const value = layoutRoot.kids.reduce((s, k) => s + k.node.value, 0);
      const k = (plotArea - all) / value;
      if (!(k > 0) || !Number.isFinite(k)) break;
      const weigh = (l: LayoutNode<N>, isRoot: boolean): number => {
        let extra = !isRoot && l.header ? (l.x1 - l.x0) * headerH : 0;
        for (const c of l.kids) extra += weigh(c, false);
        l.weight = l.node.value + extra / k;
        return extra;
      };
      weigh(layoutRoot, true);
      pass(false);
    }
  }

  // ---- 3. Tiles --------------------------------------------------------------------------------
  const tiles: TreemapTile<N>[] = [];
  const leaves: number[] = [];
  const layoutOf: LayoutNode<N>[] = [];
  const names = (node: TreemapNode<N>): string[] => {
    const out: string[] = [];
    for (let n: TreemapNode<N> | null = node; n && n.depth > 0; n = n.parent) out.push(n.data.name);
    return out.reverse();
  };
  const addTiles = (l: LayoutNode<N>, parent: number) => {
    const index = tiles.length;
    const color = branches[l.branch]?.color ?? 'currentColor';
    tiles.push({
      key: l.key,
      name: l.node.data.name,
      path: names(l.node),
      node: l.node,
      value: l.node.value,
      depth: l.node.depth,
      branch: l.branch,
      leaf: l.kids.length === 0,
      header: l.header,
      parent,
      children: [],
      color,
      x0: l.x0,
      y0: l.y0,
      x1: l.x1,
      y1: l.y1,
    });
    layoutOf.push(l);
    if (parent >= 0) tiles[parent]?.children.push(index);
    if (!l.kids.length) leaves.push(index);
    for (const k of l.kids) addTiles(k, index);
  };
  if (layoutRoot) for (const k of layoutRoot.kids) addTiles(k, -1);
  const baseDepth = layoutRoot ? layoutRoot.node.depth : 0;

  // ---- 4. Marks (grouped per category and style so they batch into few paths) -----------------
  const leafOpacity = (t: TreemapTile<N>) =>
    spec.depthShading ? Math.max(0.72, 1 - 0.09 * (t.depth - baseDepth - 1)) : undefined;
  const headerOpacity = (t: TreemapTile<N>) => (t.depth - baseDepth <= 1 ? 0.3 : 0.2);
  const stripHeight = Math.max(0, headerH - gap);
  const leafMark = (t: TreemapTile<N>, index: number, key = t.key): RectMark => {
    const cx = (t.x0 + t.x1) / 2;
    const cy = (t.y0 + t.y1) / 2;
    const opacity = leafOpacity(t);
    return {
      type: 'rect',
      key,
      x: t.x0,
      y: t.y0,
      width: t.x1 - t.x0,
      height: t.y1 - t.y0,
      // Tiny tiles keep square-ish corners instead of turning into pills.
      radius: Math.min(radius, Math.min(t.x1 - t.x0, t.y1 - t.y0) / 4),
      fill: t.color,
      ...(opacity !== undefined && opacity < 1 ? { fillOpacity: opacity } : {}),
      series: t.branch,
      index,
      enter: { x: cx, y: cy, width: 0, height: 0 },
    };
  };
  const headerMark = (t: TreemapTile<N>, key: string, opacity: number): RectMark => ({
    type: 'rect',
    key,
    x: t.x0,
    y: t.y0,
    width: t.x1 - t.x0,
    height: Math.min(stripHeight, t.y1 - t.y0),
    radius,
    fill: t.color,
    fillOpacity: opacity,
    series: t.branch,
    enter: { opacity: 0 },
  });

  const groups = new Map<number, { headers: RectMark[]; leaves: RectMark[] }>();
  tiles.forEach((t, i) => {
    let g = groups.get(t.branch);
    if (!g) groups.set(t.branch, (g = { headers: [], leaves: [] }));
    if (t.header) g.headers.push(headerMark(t, `head|${t.key}`, headerOpacity(t)));
    if (t.leaf && t.x1 > t.x0 && t.y1 > t.y0) g.leaves.push(leafMark(t, i));
  });
  const byStyle = (a: RectMark, b: RectMark) => (a.fillOpacity ?? 1) - (b.fillOpacity ?? 1);
  const marks: Mark[] = [];
  for (const branch of [...groups.keys()].sort((a, b) => a - b)) {
    const g = groups.get(branch);
    if (!g) continue;
    marks.push(...g.headers.sort(byStyle), ...g.leaves.sort(byStyle));
  }

  // ---- 5. Labels ---------------------------------------------------------------------------------
  const labels: TextMark[] = [];
  const pad = 6;
  // Labels are semibold; the width table is for regular weight.
  const boldWidth = (text: string) => estimateTextWidth(text, fs) * BOLD;
  const fitBold = (text: string, room: number) => truncateText(text, room / BOLD, fs);
  const minText = (text: string) => boldWidth(text.slice(0, 2) + '…');
  if (showLabels) {
    for (const t of tiles) {
      const w = t.x1 - t.x0;
      const h = t.y1 - t.y0;
      const room = w - pad * 2;
      if (t.header) {
        const value = fv(t.value);
        const full = `${t.name} · ${value}`;
        const text =
          boldWidth(full) <= room ? full : room >= minText(t.name) ? fitBold(t.name, room) : '';
        if (text && stripHeight >= fs + 2)
          labels.push({
            key: `head|${t.key}`,
            x: t.x0 + pad,
            y: t.y0 + stripHeight / 2 + 0.5,
            text,
            anchor: 'start',
            baseline: 'middle',
            tone: 'primary',
            fontWeight: 600,
          });
        continue;
      }
      if (!t.leaf || room < minText(t.name) || h < fs + 8) continue;
      const ink = onFillColor(t.color);
      const name = fitBold(t.name, room);
      if (!name) continue;
      const y = t.y0 + pad + fs / 2;
      labels.push({
        key: `leaf|${t.key}`,
        x: t.x0 + pad,
        y,
        text: name,
        anchor: 'start',
        baseline: 'middle',
        fill: ink,
        fontWeight: 600,
      });
      const value = fv(t.value);
      if (h >= fs * 2 + 3 + pad * 2 - 2 && estimateTextWidth(value, fs) <= room)
        labels.push({
          key: `leafv|${t.key}`,
          x: t.x0 + pad,
          y: y + fs + 3,
          text: value,
          anchor: 'start',
          baseline: 'middle',
          fill: ink,
          fontWeight: 400,
        });
    }
  }

  // ---- 6. Queries ------------------------------------------------------------------------------
  const tol = gap / 2 + 0.5;
  const inside = (l: LayoutNode<N>, x: number, y: number, t: number) =>
    x >= l.x0 - t && x <= l.x1 + t && y >= l.y0 - t && y <= l.y1 + t;
  const indexOfLayout = new Map<LayoutNode<N>, number>();
  layoutOf.forEach((l, i) => indexOfLayout.set(l, i));

  const hitTest = (x: number, y: number): number => {
    if (!layoutRoot || !layoutRoot.kids.length) return -1;
    if (x < plot.x || x > plot.x + plot.width || y < plot.y || y > plot.y + plot.height) return -1;
    let cur: LayoutNode<N> = layoutRoot;
    for (;;) {
      if (cur !== layoutRoot && cur.header && y < cur.y0 + stripHeight)
        return indexOfLayout.get(cur) ?? -1;
      let next: LayoutNode<N> | null = null;
      for (const k of cur.kids)
        if (inside(k, x, y, tol)) {
          next = k;
          break;
        }
      if (!next) return cur === layoutRoot ? -1 : (indexOfLayout.get(cur) ?? -1);
      if (!next.kids.length) return indexOfLayout.get(next) ?? -1;
      cur = next;
    }
  };

  const labelsByTile = new Map<string, TextMark[]>();
  for (const l of labels) {
    const key = l.key.slice(l.key.indexOf('|') + 1);
    const list = labelsByTile.get(key);
    if (list) list.push(l);
    else labelsByTile.set(key, [l]);
  }
  const labelsOf = (i: number): TextMark[] => {
    const out: TextMark[] = [];
    const walk = (j: number) => {
      const t = tiles[j];
      if (!t) return;
      out.push(...(labelsByTile.get(t.key) ?? []));
      for (const k of t.children) walk(k);
    };
    walk(i);
    return out;
  };

  const leafMarks = (i: number): Mark[] => {
    const t = tiles[i];
    if (!t) return [];
    const out: Mark[] = [];
    const walk = (j: number) => {
      const c = tiles[j];
      if (!c) return;
      if (c.header && j !== i) out.push(headerMark(c, `group-head|${c.key}`, headerOpacity(c)));
      if (c.leaf) out.push({ ...leafMark(c, j, `group|${c.key}`), enter: undefined } as RectMark);
      for (const k of c.children) walk(k);
    };
    walk(i);
    return out;
  };

  return {
    tiles,
    leaves,
    branches,
    focus: {
      key: layoutRoot && layoutRoot !== full ? layoutRoot.key : null,
      path: layoutRoot ? names(layoutRoot.node) : [],
      name: layoutRoot ? layoutRoot.node.data.name : '',
      value: layoutRoot ? layoutRoot.kids.reduce((s, k) => s + k.node.value, 0) : 0,
    },
    total,
    plot,
    headerHeight: headerH,
    marks,
    labels,
    hitTest,
    activeMarks(i) {
      const t = tiles[i];
      if (!t) return [];
      // Outline drawn just inside the tile so it never covers a neighbour.
      const inset = 0.75;
      const outline: RectMark = {
        type: 'rect',
        key: `outline|${t.key}`,
        x: t.x0 + inset,
        y: t.y0 + inset,
        width: Math.max(0, t.x1 - t.x0 - inset * 2),
        height: Math.max(0, t.y1 - t.y0 - inset * 2),
        radius: Math.max(0, radius - inset),
        fill: 'none',
        stroke: t.leaf ? 'var(--jc-text)' : t.color,
        strokeWidth: 1.5,
        series: t.branch,
      };
      if (t.leaf)
        return [{ ...leafMark(t, i, `active|${t.key}`), enter: undefined } as RectMark, outline];
      return [headerMark(t, `active-head|${t.key}`, 0.6), outline];
    },
    leafMarks,
    labelsOf,
    anchor(i) {
      const t = tiles[i];
      if (!t) return { x: plot.x + plot.width / 2, y: plot.y + plot.height / 2 };
      return { x: t.x1, y: t.header ? t.y0 + stripHeight / 2 : (t.y0 + t.y1) / 2 };
    },
    neighbor(i, direction) {
      const t = tiles[i];
      if (!t) return leaves[0] ?? -1;
      const cx = (t.x0 + t.x1) / 2;
      const cy = (t.y0 + t.y1) / 2;
      let best = -1;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const j of leaves) {
        if (j === i) continue;
        const c = tiles[j] as TreemapTile<N>;
        let along: number;
        let across: number;
        if (direction === 'down' || direction === 'up') {
          along = direction === 'down' ? c.y0 - t.y1 : t.y0 - c.y1;
          across = Math.max(0, c.x0 - cx, cx - c.x1);
        } else {
          along = direction === 'right' ? c.x0 - t.x1 : t.x0 - c.x1;
          across = Math.max(0, c.y0 - cy, cy - c.y1);
        }
        if (along < -tol) continue;
        const score = Math.max(0, along) + across * 2;
        if (score < bestScore) {
          bestScore = score;
          best = j;
        }
      }
      return best;
    },
  };
}
