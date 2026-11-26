import {
  createTickFormat,
  type ChartMessages,
  type HeatmapBucket,
  type HeatmapColorScale,
} from '@jafari/charts-core';
import { useMemo, type CSSProperties, type ReactNode } from 'react';
import type { LegendOptions } from '../../components/ChartLegend';
import { useChart, type SeriesInfo } from '../../providers/ChartContext';

/** Strings the heatmaps need beyond the shared `ChartMessages`. */
interface HeatmapStrings {
  less: string;
  more: string;
  month: string;
}

const STRINGS: Record<'en' | 'ru' | 'kk', HeatmapStrings> = {
  en: { less: 'Less', more: 'More', month: 'Month' },
  ru: { less: 'Меньше', more: 'Больше', month: 'Месяц' },
  kk: { less: 'Аз', more: 'Көп', month: 'Ай' },
};

export function heatmapStrings(locale: string): HeatmapStrings {
  const lang = locale.toLowerCase().split(/[-_]/)[0] as keyof typeof STRINGS;
  return STRINGS[lang] ?? STRINGS.en;
}

/** A colour step as a single CSS colour (tooltip keys), translucency included. */
export function bucketCssColor(fill: string, fillOpacity?: number): string {
  if (fillOpacity === undefined || fillOpacity >= 1) return fill;
  return `color-mix(in srgb, ${fill} ${Math.round(fillOpacity * 100)}%, transparent)`;
}

export interface ScaleItem {
  /** Legend slot = `series` of the cells drawn with this colour. */
  slot: number;
  label: string;
  fill: string;
  fillOpacity?: number;
  /** Outlined swatch (empty cells of diverging scales). */
  stroke?: string;
}

/** CSS colour standing for a cell style in tooltips (outlined cells use the outline). */
export function cellCssColor(style: {
  fill: string;
  fillOpacity?: number;
  stroke?: string;
}): string {
  if (style.stroke && style.fill === 'transparent') return style.stroke;
  return bucketCssColor(style.fill, style.fillOpacity);
}

/** Legend entry for empty cells. */
export function emptyItem(scale: HeatmapColorScale, slot: number, label: string): ScaleItem {
  const e = scale.empty;
  return {
    slot,
    label,
    fill: e.fill,
    ...(e.fillOpacity !== undefined ? { fillOpacity: e.fillOpacity } : {}),
    ...(e.stroke ? { stroke: e.stroke } : {}),
  };
}

/** Number format with just enough decimals to tell the bucket boundaries apart. */
export function scaleFormatter(
  scale: HeatmapColorScale,
  format: ((value: number) => string) | undefined,
  locale: string,
): (value: number) => string {
  if (format) return format;
  const bounds: number[] = [];
  for (const b of scale.buckets) bounds.push(b.from, b.to);
  return createTickFormat(bounds, locale);
}

/** Range text of every bucket ("10–20", "< 5", "≥ 40"). */
export function bucketLabels(
  scale: HeatmapColorScale,
  format: ((value: number) => string) | undefined,
  locale: string,
  thresholds: boolean,
): string[] {
  const fmt = scaleFormatter(scale, format, locale);
  const n = scale.buckets.length;
  return scale.buckets.map((b: HeatmapBucket, i) => {
    if (thresholds && n > 1) {
      if (i === 0) return `< ${fmt(b.to)}`;
      if (i === n - 1) return `≥ ${fmt(b.from)}`;
    }
    return `${fmt(b.from)}–${fmt(b.to)}`;
  });
}

/** Legend entries as `SeriesInfo` (the shell shows a legend for two or more entries). */
export function scaleSeries(items: readonly ScaleItem[]): SeriesInfo[] {
  return items.map((it) => ({
    id: `slot-${it.slot}`,
    label: it.label,
    color: cellCssColor(it),
    kind: 'bar',
    symbol: 'square',
    visible: true,
  }));
}

/**
 * The accessible description counts one series: colour steps are legend entries,
 * not data series.
 */
export function useSingleSeriesMessages(messages: ChartMessages): ChartMessages {
  return useMemo(
    () => ({ ...messages, describe: (info) => messages.describe({ ...info, series: 1 }) }),
    [messages],
  );
}

export interface ScaleLegendProps {
  items: readonly ScaleItem[];
  /** Text before the swatches ("Less", minimum). */
  start?: ReactNode;
  /** Text after the swatches ("More", maximum). */
  end?: ReactNode;
  /** Entries shown apart after the scale ("No data"). */
  extra?: readonly ScaleItem[];
  position?: LegendOptions['position'];
  align?: LegendOptions['align'];
}

function swatchStyle(item: ScaleItem): CSSProperties {
  return {
    display: 'block',
    width: 11,
    height: 11,
    borderRadius: 2.5,
    background: item.fill,
    ...(item.fillOpacity !== undefined ? { opacity: item.fillOpacity } : {}),
    ...(item.stroke ? { border: `1px dashed ${item.stroke}` } : {}),
  };
}

function Swatch({
  item,
  onEnter,
  onLeave,
}: {
  item: ScaleItem;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <li
      title={item.label}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      <span aria-hidden="true" style={swatchStyle(item)} />
      <span className="jc-sr-only">{item.label}</span>
    </li>
  );
}

const listStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

/**
 * Colour-scale legend: "Less ▢▢▢▢▢ More". Hovering a step highlights its cells
 * (dimming the other steps); every step carries its value range for screen readers.
 */
export function ScaleLegend({
  items,
  start,
  end,
  extra,
  position = 'bottom',
  align = 'start',
}: ScaleLegendProps) {
  const { store, messages } = useChart();
  const highlight = (slot: number | null) => store.setState({ highlight: slot });
  return (
    <div
      className="jc-legend jc-scale-legend"
      data-position={position}
      data-align={align}
      role="group"
      aria-label={messages.legend}
      style={{ gap: '4px 8px' }}
    >
      {start !== undefined ? <span className="jc-legend-text">{start}</span> : null}
      <ul style={listStyle}>
        {items.map((it) => (
          <Swatch
            key={it.slot}
            item={it}
            onEnter={() => highlight(it.slot)}
            onLeave={() => highlight(null)}
          />
        ))}
      </ul>
      {end !== undefined ? <span className="jc-legend-text">{end}</span> : null}
      {extra?.length ? (
        <ul style={{ ...listStyle, gap: 12, marginLeft: 8 }}>
          {extra.map((it) => (
            <li
              key={it.slot}
              onPointerEnter={() => highlight(it.slot)}
              onPointerLeave={() => highlight(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span aria-hidden="true" style={swatchStyle(it)} />
              <span className="jc-legend-text">{it.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
