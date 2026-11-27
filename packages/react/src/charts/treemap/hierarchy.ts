import { access, toLabel, toNumber, type HierarchyInput } from '@startupjafari/charts-core';

/** A node of hierarchical treemap data. */
export interface TreemapDatum {
  name: string;
  /** Leaf value; parents sum their children. Zero, negative and missing values are ignored. */
  value?: number | null;
  children?: readonly TreemapDatum[];
  /** Colour of a top-level category (overrides the palette). */
  color?: string;
}

/** Normalised hierarchy node carrying the source it came from. */
export interface TreemapItem<D> extends HierarchyInput {
  name: string;
  value?: number;
  children?: TreemapItem<D>[];
  /** The source row (flat data) or node (hierarchical data); null for synthesised groups. */
  source: D | null;
  color?: string;
}

const isList = (d: TreemapDatum | readonly TreemapDatum[]): d is readonly TreemapDatum[] =>
  Array.isArray(d);

/** Hierarchical input → items. A list or a single leaf is wrapped in a synthetic root. */
export function fromNodes(data: TreemapDatum | readonly TreemapDatum[]): TreemapItem<TreemapDatum> {
  const convert = (d: TreemapDatum): TreemapItem<TreemapDatum> => {
    const item: TreemapItem<TreemapDatum> = { name: toLabel(d.name), source: d };
    if (d.children?.length) item.children = d.children.map(convert);
    else item.value = toNumber(d.value);
    if (typeof d.color === 'string') item.color = d.color;
    return item;
  };
  if (isList(data)) return { name: '', source: null, children: data.map(convert) };
  const root = convert(data);
  return root.children ? root : { name: '', source: null, children: [root] };
}

/**
 * Flat rows → items: rows are grouped by `groupKey` (and `subgroupKey`). With a
 * `labelKey` every row is a leaf; without one the rows of each group are summed.
 */
export function fromRows<T>(
  rows: readonly T[],
  keys: {
    groupKey: keyof T & string;
    subgroupKey?: (keyof T & string) | undefined;
    labelKey?: (keyof T & string) | undefined;
    valueKey: keyof T & string;
  },
): TreemapItem<T> {
  const root: TreemapItem<T> = { name: '', source: null, children: [] };
  const groups = new Map<
    string,
    { item: TreemapItem<T>; subgroups: Map<string, TreemapItem<T>> }
  >();
  rows.forEach((row, i) => {
    const value = toNumber(access(row, keys.valueKey, i));
    const groupName = toLabel(access(row, keys.groupKey, i));
    let group = groups.get(groupName);
    if (!group) {
      group = { item: { name: groupName, source: null }, subgroups: new Map() };
      groups.set(groupName, group);
      root.children?.push(group.item);
    }
    let parent = group.item;
    if (keys.subgroupKey) {
      const subName = toLabel(access(row, keys.subgroupKey, i));
      let sub = group.subgroups.get(subName);
      if (!sub) {
        sub = { name: subName, source: null };
        group.subgroups.set(subName, sub);
        (group.item.children ??= []).push(sub);
      }
      parent = sub;
    }
    if (keys.labelKey) {
      (parent.children ??= []).push({
        name: toLabel(access(row, keys.labelKey, i)),
        value,
        source: row,
      });
    } else if (Number.isFinite(value) && value > 0) {
      parent.value = (parent.value ?? 0) + value;
    }
  });
  return root;
}
