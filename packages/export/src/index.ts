/**
 * @jafari/charts-export — SVG, PNG, WebP and CSV export.
 * Import it on demand so it never enlarges the main bundle:
 *
 * ```ts
 * const { exportChart } = await import('@jafari/charts/export');
 * await exportChart(chartElement, { format: 'png', scale: 2, filename: 'growth' });
 * ```
 */
import { toCsvBlob, type CsvOptions } from './csv';
import { toPngBlob, toSvgBlob, toWebpBlob, type RasterExportOptions } from './raster';

export { chartToSvg } from './svg';
export type { ExportBackground, SvgExportOptions } from './svg';
export { toSvgBlob, toPngBlob, toWebpBlob, isWebpSupported } from './raster';
export type { RasterExportOptions } from './raster';
export { toCsv, toCsvBlob } from './csv';
export type { CsvColumn, CsvOptions } from './csv';

/** Triggers a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ExportFormat = 'svg' | 'png' | 'webp' | 'csv';

export interface ExportChartOptions<
  T extends object = Record<string, unknown>,
> extends RasterExportOptions {
  format: ExportFormat;
  /** File name without extension (default "chart"). */
  filename?: string;
  /** Source data, required for CSV. */
  data?: readonly T[];
  csv?: CsvOptions<T>;
  /** Return the blob instead of downloading it. */
  download?: boolean;
}

/** Exports a rendered chart (any element inside or containing `.jc-root`). */
export async function exportChart<T extends object>(
  target: Element,
  options: ExportChartOptions<T>,
): Promise<Blob> {
  const { format, filename = 'chart', download = true } = options;
  let blob: Blob;
  switch (format) {
    case 'svg':
      blob = toSvgBlob(target, options);
      break;
    case 'png':
      blob = await toPngBlob(target, options);
      break;
    case 'webp':
      blob = await toWebpBlob(target, options);
      break;
    case 'csv':
      if (!options.data) throw new Error('CSV export needs `data`.');
      blob = toCsvBlob(options.data, options.csv);
      break;
  }
  if (download) downloadBlob(blob, `${filename}.${format}`);
  return blob;
}
