import type { LinearGradientPaint, MarkStyle, Paint } from '@startupjafari/charts-core';
import type { CSSProperties } from 'react';

/** Inline style for a mark. Colours go through `style` so `var(--token)` always works. */
export function markStyle(style: MarkStyle, stroked: boolean, fillRef?: string): CSSProperties {
  const s: CSSProperties = {};
  if (stroked) {
    s.fill = 'none';
    s.stroke = style.stroke ?? (typeof style.fill === 'string' ? style.fill : 'currentColor');
    s.strokeWidth = style.strokeWidth ?? 2;
    s.strokeLinejoin = 'round';
    s.strokeLinecap = 'round';
  } else {
    s.fill = fillRef ?? (typeof style.fill === 'string' ? style.fill : 'currentColor');
    if (style.stroke) {
      s.stroke = style.stroke;
      s.strokeWidth = style.strokeWidth ?? 1;
      // Rings sit behind the fill so they read as a gap, not an outline.
      s.paintOrder = 'stroke';
    }
  }
  if (style.fillOpacity !== undefined) s.fillOpacity = style.fillOpacity;
  if (style.strokeOpacity !== undefined) s.strokeOpacity = style.strokeOpacity;
  if (style.dash) s.strokeDasharray = style.dash;
  if (style.opacity !== undefined) s.opacity = style.opacity;
  return s;
}

export function isGradient(paint: Paint | undefined): paint is LinearGradientPaint {
  return typeof paint === 'object' && paint !== null && paint.type === 'linear-gradient';
}

/** Makes a string safe for use inside an SVG id / url(#…) reference. */
export function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}
