import {
  buildTreemapModel,
  formatAuto,
  formatPercent,
  type KeysMatching,
  type NumericKey,
  type TreemapModel,
} from '@jafari/charts-core';
import { seriesColor } from '@jafari/charts-themes';
import { useCallback, useMemo, type KeyboardEvent, type ReactElement } from 'react';
import type { DataTable } from '../../components/ChartA11y';
import type { LegendOptions } from '../../components/ChartLegend';
import type { TooltipOptions } from '../../components/ChartTooltip';
import { ChartView, type SurfaceHandlers } from '../../components/ChartView';
import { useControllableState } from '../../hooks/useControllableState';
import { useStoreSelector } from '../../hooks/useStoreSelector';
import { useChartRoot, type BaseChartProps } from '../../internal/useChartRoot';
import { SeriesLayer } from '../../primitives/SeriesLayer';
import { TextLabels } from '../../primitives/TextLabels';
import {
  useChart,
  type ActiveItem,
  type ChartAdapter,
  type InteractionState,
  type SeriesInfo,
} from '../../providers/ChartContext';
import { fromNodes, fromRows, type TreemapDatum, type TreemapItem } from './hierarchy';
import { treemapTexts, type TreemapTexts } from './texts';

export type { TreemapDatum } from './hierarchy';

export interface TreemapItemEvent<D> {
  /** The source row (flat data with `labelKey`) or hierarchy node; null for derived groups. */
  datum: D | null;
  /** Stable key of the tile (names joined by `/`). */
  key: string;
  name: string;
  /** Names from the top-level category down to this tile. */
  path: string[];
  value: number;
  /** Share of the visible total (0–1). */
  share: number;
  /** 1 = top-level category. */
  depth: number;
  leaf: boolean;
}

interface TreemapCommonProps<D> extends BaseChartProps {
  /** Colours of the top-level categories, by position (default: the theme palette). */
  colors?: readonly string[];
  valueFormatter?: (value: number) => string;
  tooltip?: boolean | TooltipOptions;
  /** Top-level categories; clicking one hides its branch. Default: shown for 2–12 categories. */
  legend?: boolean | LegendOptions;
  /** Name and value on tiles that fit (default true). */
  labels?: boolean;
  /** Header strips with the name on parent tiles that have room (default true). */
  headers?: boolean;
  /** Gap between tiles, px (default 2). */
  gap?: number;
  cornerRadius?: number;
  /** Slightly lighter tiles at deeper levels. */
  depthShading?: boolean;
  /**
   * Click (or Enter on) a category to zoom into it; Backspace or the breadcrumb zooms out.
   * Default: on when `drilldownPath` is given.
   */
  drilldown?: boolean;
  /**
   * Controlled drill-down: names from the top-level category down to the zoomed tile
   * (`[]` = the whole tree). Siblings with equal names are addressed as `name#1`, `name#2`…
   */
  drilldownPath?: readonly string[];
  onDrilldownPathChange?: (path: string[]) => void;
  /** Overrides for treemap-specific strings. */
  texts?: Partial<TreemapTexts>;
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  onHover?: (event: TreemapItemEvent<D> | null) => void;
  onClick?: (event: TreemapItemEvent<D>) => void;
  /** Called with the zoomed path (names) after a drill-down navigation. */
  onDrilldown?: (path: string[]) => void;
}

/** Hierarchical data: a root node, or a list of top-level nodes. */
export interface TreemapHierarchyProps extends TreemapCommonProps<TreemapDatum> {
  data: TreemapDatum | readonly TreemapDatum[];
  groupKey?: undefined;
  subgroupKey?: undefined;
  labelKey?: undefined;
  valueKey?: undefined;
}

/** Flat rows grouped into categories (and optional subcategories). */
export interface TreemapRowsProps<T extends object> extends TreemapCommonProps<T> {
  data: readonly T[];
  /** Top-level category of each row. */
  groupKey: KeysMatching<T, string | number>;
  /** Optional second level. */
  subgroupKey?: KeysMatching<T, string | number>;
  /** Name of each row's tile; without it rows of a (sub)group are summed into one tile. */
  labelKey?: KeysMatching<T, string | number>;
  valueKey: NumericKey<T>;
}

export type TreemapChartProps<T extends object = TreemapDatum> =
  TreemapHierarchyProps | TreemapRowsProps<T>;

type Source = object;
type Model = TreemapModel<TreemapItem<Source>>;

const BREADCRUMB = 34;

/** Percentages for legends and tooltips: shares that round to zero read "<1%". */
function sharePercent(share: number, locale: string): string {
  return share > 0 && share < 0.001
    ? `<${formatPercent(0.001, locale, 1)}`
    : formatPercent(share, locale, share < 0.1 ? 1 : 0);
}

/**
 * Emphasis above the shared active layer: a hovered group's leaves (batched into a few
 * paths) and the labels of the active tile, which the active marks would otherwise cover.
 */
function ActiveOverlay({ model }: { model: Model }) {
  const { store, id } = useChart();
  const select = useCallback((s: InteractionState) => s.active?.position ?? -1, []);
  const position = useStoreSelector(store, select);
  const tile = model.tiles[position];
  const marks = useMemo(
    () => (tile && !tile.leaf ? model.leafMarks(position) : []),
    [model, tile, position],
  );
  const labels = useMemo(() => (tile ? model.labelsOf(position) : []), [model, tile, position]);
  if (!tile) return null;
  return (
    <g className="jc-active" aria-hidden="true">
      {marks.length ? <SeriesLayer marks={marks} chartId={`${id}-hl`} /> : null}
      <TextLabels labels={labels} />
    </g>
  );
}

/**
 * Treemap: hierarchical part-to-whole with tile areas proportional to values.
 * Accepts a hierarchy (`{ name, value, children }`) or flat rows with `groupKey`.
 */
export function TreemapChart<T extends object>(props: TreemapChartProps<T>): ReactElement {
  const root = useChartRoot(props, { height: 360 });
  const texts = useMemo(
    () => treemapTexts(root.messages, props.texts),
    [root.messages, props.texts],
  );
  const { valueFormatter } = props;

  const data = props.data;
  const groupKey = props.groupKey;
  const subgroupKey = props.subgroupKey;
  const labelKey = props.labelKey;
  const valueKey = props.valueKey;
  const tree = useMemo<TreemapItem<Source>>(
    () =>
      groupKey !== undefined && valueKey !== undefined
        ? fromRows(data as readonly T[], { groupKey, subgroupKey, labelKey, valueKey })
        : fromNodes(data as TreemapDatum | readonly TreemapDatum[]),
    [data, groupKey, subgroupKey, labelKey, valueKey],
  );
  const colors = useMemo(
    () => (tree.children ?? []).map((c, i) => c.color ?? props.colors?.[i] ?? seriesColor(i)),
    [tree, props.colors],
  );

  const [hiddenList, setHidden] = useControllableState<readonly string[]>(
    props.hiddenSeries,
    props.defaultHiddenSeries ?? [],
    props.onHiddenSeriesChange as ((h: readonly string[]) => void) | undefined,
  );
  const hidden = useMemo(() => new Set(hiddenList), [hiddenList]);
  const toggleSeries = useCallback(
    (key: string) =>
      setHidden(hidden.has(key) ? hiddenList.filter((h) => h !== key) : [...hiddenList, key]),
    [hidden, hiddenList, setHidden],
  );

  // Drill-down path: name segments from the top-level category down to the zoomed tile;
  // the trail holds the tile key of every level (segments joined by "/").
  const drillable = props.drilldown ?? props.drilldownPath !== undefined;
  const [path, setPath] = useControllableState<readonly string[]>(
    props.drilldownPath,
    [],
    props.onDrilldownPathChange as ((path: readonly string[]) => void) | undefined,
  );
  const trail = useMemo(() => path.map((_, i) => path.slice(0, i + 1).join('/')), [path]);
  const focusKey = drillable ? (trail.at(-1) ?? null) : null;

  const fmtValue = useCallback(
    (v: number) => (valueFormatter ? valueFormatter(v) : formatAuto(v, root.locale)),
    [valueFormatter, root.locale],
  );

  const model: Model = useMemo(() => {
    const build = (focus: string | null) =>
      buildTreemapModel<TreemapItem<Source>>({
        width: root.width,
        height: root.height,
        data: tree,
        colors,
        hidden,
        focus,
        top: focus ? BREADCRUMB : 0,
        ...(props.gap !== undefined ? { gap: props.gap } : {}),
        ...(props.cornerRadius !== undefined ? { cornerRadius: props.cornerRadius } : {}),
        headers: props.headers !== false,
        labels: props.labels !== false,
        depthShading: props.depthShading === true,
        locale: root.locale,
        formatValue: fmtValue,
      });
    const m = build(focusKey);
    // A stale focus (data changed, branch hidden) falls back to the whole tree without a gap.
    return focusKey && m.focus.key === null ? build(null) : m;
  }, [
    root.width,
    root.height,
    root.locale,
    tree,
    colors,
    hidden,
    focusKey,
    props.gap,
    props.cornerRadius,
    props.headers,
    props.labels,
    props.depthShading,
    fmtValue,
  ]);

  const share = useCallback((v: number) => (model.total > 0 ? v / model.total : 0), [model.total]);
  const event = (a: ActiveItem | null): TreemapItemEvent<Source> | null => {
    const t = a ? model.tiles[a.position] : undefined;
    if (!t) return null;
    return {
      datum: t.node.data.source,
      key: t.key,
      name: t.name,
      path: t.path,
      value: t.value,
      share: share(t.value),
      depth: t.depth,
      leaf: t.leaf,
    };
  };

  const adapter = useMemo<ChartAdapter>(() => {
    const { tiles, leaves } = model;
    const item = (p: number): ActiveItem | null => {
      const t = tiles[p];
      if (!t) return null;
      const a = model.anchor(p);
      return { position: p, series: t.branch, x: a.x, y: a.y };
    };
    const order = new Map<number, number>();
    leaves.forEach((p, k) => order.set(p, k));
    return {
      marks: model.marks,
      hitTest: (x, y) => item(model.hitTest(x, y)),
      tooltip: (a) => {
        const t = tiles[a.position];
        if (!t) return null;
        const parent = tiles[t.parent];
        return {
          title: t.path.slice(0, -1).join(' › '),
          rows: [
            {
              key: t.key,
              label: t.name,
              value: `${fmtValue(t.value)} · ${sharePercent(share(t.value), root.locale)}`,
              color: t.color,
              kind: 'bar',
            },
          ],
          ...(parent && parent.value > 0
            ? {
                footer: texts.ofParent(
                  sharePercent(t.value / parent.value, root.locale),
                  parent.name,
                ),
              }
            : {}),
        };
      },
      activeMarks: (a) => model.activeMarks(a.position),
      move: (a, key) => {
        if (!leaves.length) return null;
        const cur = a?.position ?? -1;
        if (key === 'first' || (cur < 0 && key !== 'prev' && key !== 'up'))
          return item(leaves[0] as number);
        if (key === 'last' || cur < 0) return item(leaves.at(-1) as number);
        if (key === 'up' || key === 'down') {
          const n = model.neighbor(cur, key);
          return n >= 0 ? item(n) : a;
        }
        // Reading order: depth-first, largest first (also from a hovered parent header).
        const k = order.get(cur);
        if (k !== undefined)
          return item(
            leaves[
              key === 'next' ? Math.min(leaves.length - 1, k + 1) : Math.max(0, k - 1)
            ] as number,
          );
        const after = leaves.findIndex((p) => p > cur);
        const idx =
          key === 'next'
            ? after < 0
              ? leaves.length - 1
              : after
            : Math.max(0, (after < 0 ? leaves.length : after) - 1);
        return item(leaves[idx] as number);
      },
      itemAt: (p) => item(p),
      pointCount: leaves.length,
    };
  }, [model, fmtValue, share, texts, root.locale]);

  const visibleBranches = model.branches.filter((b) => b.value > 0);
  const series = useMemo<SeriesInfo[]>(
    () =>
      model.branches
        .filter((b) => b.value > 0)
        .map((b) => ({
          id: b.key,
          label: b.name,
          color: b.color,
          kind: 'bar',
          symbol: 'square',
          visible: !b.hidden,
          ...(!b.hidden && model.total > 0
            ? { value: sharePercent(b.value / model.total, root.locale) }
            : {}),
        })),
    [model, root.locale],
  );

  const table = useMemo<DataTable>(
    () => ({
      columns: [root.messages.category, root.messages.value, texts.share],
      rows: model.leaves.map((p) => {
        const t = model.tiles[p];
        return t
          ? [t.path.join(' › '), fmtValue(t.value), sharePercent(share(t.value), root.locale)]
          : [];
      }),
    }),
    [model, fmtValue, share, texts.share, root.messages, root.locale],
  );

  // ---- Drill-down ----------------------------------------------------------------------------
  const drillTo = (next: readonly string[]) => {
    setPath(next.map((key, i) => (i ? key.slice((next[i - 1] as string).length + 1) : key)));
    root.store.setState({ active: null, source: null });
    const names: string[] = [];
    if (next.length) {
      const target = next.at(-1);
      const t = model.tiles.find((x) => x.key === target);
      if (t) names.push(...t.path);
      else names.push(...model.focus.path.slice(0, next.length));
    }
    props.onDrilldown?.(names);
  };
  const current = model.focus.key ? trail : [];
  const zoomOut = () => drillTo(current.slice(0, -1));
  const onItemClick = (a: ActiveItem) => {
    const e = event(a);
    if (e) (props.onClick as ((e: TreemapItemEvent<Source>) => void) | undefined)?.(e);
    if (!drillable) return;
    // Zoom one level: into the ancestor of the clicked tile right below the current root.
    let t = model.tiles[a.position];
    while (t && t.parent >= 0) t = model.tiles[t.parent];
    if (t && !t.leaf) drillTo([...current, t.key]);
  };
  const surfaceHandlers: SurfaceHandlers | undefined = drillable
    ? {
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key !== 'Backspace' || !current.length) return false;
          e.preventDefault();
          zoomOut();
          return true;
        },
      }
    : undefined;

  const controls =
    drillable && model.focus.key ? (
      <nav
        aria-label={texts.breadcrumb}
        style={{
          // Explicit resets: host pages often style <nav>, <ol> and <button> globally.
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: BREADCRUMB - 6,
          margin: 0,
          padding: 0,
          border: 0,
          background: 'none',
          boxSizing: 'border-box',
          flexWrap: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: 'var(--jc-text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <button type="button" className="jc-button" onClick={zoomOut}>
          <span aria-hidden="true">←</span> {texts.back}
        </button>
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minWidth: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            overflow: 'hidden',
          }}
        >
          {[tree.name || texts.all, ...model.focus.path].map((name, i, all) => {
            const last = i === all.length - 1;
            return (
              <li
                key={`${i}:${name}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}
              >
                {i > 0 ? <span aria-hidden="true">›</span> : null}
                {last ? (
                  <span
                    aria-current="location"
                    style={{
                      color: 'var(--jc-text)',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {name}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="jc-legend-item"
                    style={{ margin: 0 }}
                    onClick={() => drillTo(current.slice(0, i))}
                  >
                    {name}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    ) : null;

  const tooltipOpts =
    props.tooltip === false
      ? false
      : props.tooltip === true || props.tooltip === undefined
        ? {}
        : props.tooltip;
  const legendOpts =
    props.legend === false
      ? false
      : props.legend === true
        ? {}
        : props.legend === undefined
          ? visibleBranches.length >= 2 && visibleBranches.length <= 12
            ? {}
            : false
          : props.legend;

  return (
    <ChartView
      root={root}
      base={props}
      kind="Treemap"
      adapter={adapter}
      frame={null}
      plot={model.plot}
      series={series}
      toggleSeries={toggleSeries}
      labels={model.labels}
      empty={model.tiles.length === 0 && hidden.size === 0}
      tooltip={tooltipOpts}
      legend={legendOpts}
      table={table}
      dimOnActive
      clip={false}
      overlay={<ActiveOverlay model={model} />}
      controls={controls}
      {...(surfaceHandlers ? { surfaceHandlers } : {})}
      onActiveChange={(a) =>
        (props.onHover as ((e: TreemapItemEvent<Source> | null) => void) | undefined)?.(event(a))
      }
      onItemClick={onItemClick}
    />
  );
}
