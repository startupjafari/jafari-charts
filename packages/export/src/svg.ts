const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/** Presentation properties copied from computed styles so the file renders without the page CSS. */
const STYLE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'paint-order',
  'font-family',
  'font-size',
  'font-weight',
  'font-variant-numeric',
  'dominant-baseline',
  'text-anchor',
  'visibility',
  'stop-color',
  'stop-opacity',
] as const;

export type ExportBackground = 'transparent' | 'light' | 'dark' | 'auto' | (string & {});

export interface SvgExportOptions {
  /** Background fill. `auto` uses the chart's own `--jc-bg`. Default `auto`. */
  background?: ExportBackground;
  /** Include the legend as a row under the chart (default true). */
  legend?: boolean;
  /** Padding around the chart, px (default 16). */
  padding?: number;
}

function findRoot(target: Element): HTMLElement {
  const root = target.closest('.jc-root') ?? target.querySelector('.jc-root');
  if (!root)
    throw new Error('No Jafari Charts element found (expected an element with class "jc-root").');
  return root as HTMLElement;
}

function inlineStyles(source: Element, clone: Element): void {
  const computed = getComputedStyle(source);
  const style: string[] = [];
  for (const prop of STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value && value !== 'normal' && value !== 'auto') style.push(`${prop}:${value}`);
  }
  clone.setAttribute('style', style.join(';'));
  clone.removeAttribute('class');
  const srcChildren = source.children;
  const cloneChildren = clone.children;
  for (let i = 0; i < srcChildren.length; i++) {
    const s = srcChildren[i];
    const c = cloneChildren[i];
    if (s && c) inlineStyles(s, c);
  }
}

function resolveBackground(root: HTMLElement, background: ExportBackground): string | null {
  if (background === 'transparent') return null;
  if (background === 'light') return '#ffffff';
  if (background === 'dark') return '#0f1115';
  if (background === 'auto') {
    const probe = document.createElement('span');
    probe.style.color = 'var(--jc-bg)';
    root.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c || '#ffffff';
  }
  return background;
}

/**
 * Serialises a rendered chart into a standalone SVG document: styles are
 * inlined, CSS variables resolved, canvas layers embedded as images, and the
 * legend redrawn as SVG.
 */
export function chartToSvg(
  target: Element,
  options: SvgExportOptions = {},
): { svg: string; width: number; height: number } {
  const root = findRoot(target);
  const layers = root.querySelector('.jc-layers') as HTMLElement | null;
  if (!layers) throw new Error('Chart has not rendered yet.');
  const pad = options.padding ?? 16;
  const width = layers.clientWidth;
  const chartHeight = layers.clientHeight;
  const legendItems =
    options.legend === false
      ? []
      : Array.from(root.querySelectorAll<HTMLElement>('.jc-legend-item'));
  const legendHeight = legendItems.length ? 28 : 0;
  const totalW = width + pad * 2;
  const totalH = chartHeight + legendHeight + pad * 2;

  const out = document.createElementNS(SVG_NS, 'svg');
  out.setAttribute('xmlns', SVG_NS);
  out.setAttribute('xmlns:xlink', XLINK_NS);
  out.setAttribute('width', String(totalW));
  out.setAttribute('height', String(totalH));
  out.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);

  const bg = resolveBackground(root, options.background ?? 'auto');
  if (bg) {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', bg);
    out.appendChild(rect);
  }

  const body = document.createElementNS(SVG_NS, 'g');
  body.setAttribute('transform', `translate(${pad},${pad})`);
  out.appendChild(body);

  // Layers in paint order: background svg, canvas, foreground svg (or a single svg).
  for (const child of Array.from(layers.children)) {
    if (child instanceof SVGSVGElement) {
      const clone = child.cloneNode(true) as SVGSVGElement;
      inlineStyles(child, clone);
      const g = document.createElementNS(SVG_NS, 'g');
      for (const n of Array.from(clone.childNodes)) g.appendChild(n);
      body.appendChild(g);
    } else if (child instanceof HTMLCanvasElement) {
      const img = document.createElementNS(SVG_NS, 'image');
      img.setAttribute('width', String(child.clientWidth || width));
      img.setAttribute('height', String(child.clientHeight || chartHeight));
      img.setAttribute('href', child.toDataURL('image/png'));
      body.appendChild(img);
    }
  }

  if (legendItems.length) {
    const legend = document.createElementNS(SVG_NS, 'g');
    legend.setAttribute('transform', `translate(0,${chartHeight + 18})`);
    const text = getComputedStyle(root).color || '#64748b';
    let x = 0;
    for (const item of legendItems) {
      const label = item.querySelector('.jc-legend-text')?.textContent ?? '';
      const swatch = item.querySelector('svg rect, svg line, svg path') as SVGElement | null;
      const sc = swatch ? getComputedStyle(swatch) : null;
      const color = sc ? (swatch?.tagName === 'line' ? sc.stroke : sc.fill) : text;
      const off = item.getAttribute('aria-pressed') === 'false';
      const sw = document.createElementNS(SVG_NS, 'rect');
      sw.setAttribute('x', String(x));
      sw.setAttribute('y', '-5');
      sw.setAttribute('width', '10');
      sw.setAttribute('height', '10');
      sw.setAttribute('rx', '3');
      sw.setAttribute('fill', color);
      if (off) sw.setAttribute('opacity', '0.4');
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', String(x + 16));
      t.setAttribute('y', '4');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-family', getComputedStyle(root).fontFamily);
      t.setAttribute('fill', getComputedStyle(item).color || text);
      t.textContent = label;
      legend.append(sw, t);
      x += 16 + label.length * 7 + 18;
    }
    body.appendChild(legend);
  }

  return { svg: new XMLSerializer().serializeToString(out), width: totalW, height: totalH };
}
