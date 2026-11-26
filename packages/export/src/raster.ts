import { chartToSvg, type SvgExportOptions } from './svg';

export interface RasterExportOptions extends SvgExportOptions {
  /** Pixel density multiplier: 1, 2 or 3 (default 2). */
  scale?: number;
  /** WebP/JPEG quality 0–1. */
  quality?: number;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not rasterise the chart SVG'));
    img.src = url;
  });
}

async function rasterize(
  target: Element,
  type: 'image/png' | 'image/webp',
  options: RasterExportOptions,
): Promise<Blob> {
  const { svg, width, height } = chartToSvg(target, options);
  const scale = Math.max(0.5, Math.min(4, options.scale ?? 2));
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is not available');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error(`${type} encoding failed`))),
        type,
        options.quality,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function toSvgBlob(target: Element, options: SvgExportOptions = {}): Blob {
  return new Blob([chartToSvg(target, options).svg], { type: 'image/svg+xml;charset=utf-8' });
}

export function toPngBlob(target: Element, options: RasterExportOptions = {}): Promise<Blob> {
  return rasterize(target, 'image/png', options);
}

/** True when the browser can encode WebP from a canvas. */
export function isWebpSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  return c.toDataURL('image/webp').startsWith('data:image/webp');
}

export function toWebpBlob(target: Element, options: RasterExportOptions = {}): Promise<Blob> {
  if (!isWebpSupported())
    return Promise.reject(new Error('WebP export is not supported in this browser'));
  return rasterize(target, 'image/webp', options);
}
