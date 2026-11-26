import { darkTheme, lightTheme, tokensToVars, type ThemeTokens } from './tokens';

function block(selector: string, vars: Record<string, string>, extra = ''): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `${selector}{${body}${extra ? `;${extra}` : ''}}`;
}

/**
 * Theme switching. `auto` follows the *host app*, not the OS: charts on a page
 * that only supports light mode stay light even when the OS is dark.
 * - The app's `color-scheme` (e.g. `:root{color-scheme:light dark}`, set by
 *   next-themes) drives `light-dark()` where supported.
 * - A `.dark` / `[data-theme=dark]` ancestor (Tailwind, next-themes, custom) wins.
 * - `data-jc-theme=light|dark` forces a mode.
 */
function themeRules(light: ThemeTokens, dark: ThemeTokens): string {
  const lightVars = tokensToVars(light);
  const darkVars = tokensToVars(dark);
  // Dark overrides only need the tokens that differ.
  const darkDiff = Object.fromEntries(
    Object.entries(darkVars).filter(([k, v]) => lightVars[k] !== v),
  );
  const adaptive = Object.fromEntries(
    Object.entries(darkDiff).map(([k, v]) => [k, `light-dark(${lightVars[k]},${v})`]),
  );
  return [
    block('.jc-root', lightVars),
    block('.jc-root[data-jc-theme=light]', {}, 'color-scheme:light'),
    block('.jc-root[data-jc-theme=dark]', darkDiff, 'color-scheme:dark'),
    `@supports (color:light-dark(#000,#fff)){${block('.jc-root[data-jc-theme=auto]', adaptive)}}`,
    block(
      ':where(.dark,[data-theme=dark],[data-mode=dark],[data-color-scheme=dark]) .jc-root[data-jc-theme=auto]',
      darkDiff,
      'color-scheme:dark',
    ),
    block(
      ':where(.light,[data-theme=light],[data-mode=light],[data-color-scheme=light]) .jc-root[data-jc-theme=auto]',
      Object.fromEntries(Object.keys(darkDiff).map((k) => [k, lightVars[k] as string])),
      'color-scheme:light',
    ),
  ].join('\n');
}

const COMPONENT_CSS = `
.jc-root{position:relative;width:100%;max-width:100%;min-width:0;box-sizing:border-box;font-family:var(--jc-font-family);color:var(--jc-text);-webkit-tap-highlight-color:transparent;line-height:1.4}
.jc-root *,.jc-root *::before,.jc-root *::after{box-sizing:border-box}
.jc-root:focus{outline:none}
.jc-root:focus-visible{outline:2px solid var(--jc-focus);outline-offset:4px;border-radius:8px}
.jc-surface{display:block;overflow:visible;user-select:none;-webkit-user-select:none;touch-action:pan-y}
.jc-surface[data-jc-zoomable]{touch-action:none}
.jc-canvas{position:absolute;left:0;top:0;pointer-events:none}
.jc-axis text,.jc-tick{fill:var(--jc-text-secondary);font-size:var(--jc-font-size);font-variant-numeric:tabular-nums}
.jc-axis-line{stroke:var(--jc-axis);shape-rendering:crispEdges}
.jc-grid line{stroke:var(--jc-grid);shape-rendering:crispEdges}
.jc-label{fill:var(--jc-text-secondary);font-size:var(--jc-font-size);font-variant-numeric:tabular-nums}
.jc-label[data-tone=primary]{fill:var(--jc-text);font-weight:500}
.jc-label[data-tone=muted]{fill:var(--jc-text-muted)}
.jc-label[data-tone=inverse]{fill:var(--jc-bg)}
.jc-series{transition:opacity var(--jc-duration) var(--jc-easing)}
.jc-series[data-jc-dim]{opacity:.32}
.jc-crosshair{stroke:var(--jc-crosshair);stroke-width:1;shape-rendering:crispEdges;pointer-events:none}
.jc-cursor{fill:var(--jc-text);opacity:.045;pointer-events:none}
.jc-active{pointer-events:none}
.jc-ring{stroke:var(--jc-bg);stroke-width:2;paint-order:stroke}
.jc-ref-line{stroke:var(--jc-text-muted);stroke-width:1;stroke-dasharray:4 4}
.jc-ref-area{fill:var(--jc-text);opacity:.05}
.jc-ref-label{fill:var(--jc-text-secondary);font-size:var(--jc-font-size);font-weight:500}
.jc-annotation{fill:var(--jc-text);font-size:var(--jc-font-size);font-weight:500}
.jc-brush{fill:var(--jc-focus);fill-opacity:.1;stroke:var(--jc-focus);stroke-opacity:.6;stroke-width:1;shape-rendering:crispEdges}
.jc-tooltip{position:absolute;left:0;top:0;z-index:20;pointer-events:none;min-width:128px;max-width:min(300px,90vw);padding:8px 10px;border-radius:var(--jc-tooltip-radius);background:var(--jc-surface);border:1px solid var(--jc-border);box-shadow:var(--jc-tooltip-shadow);color:var(--jc-text);font-size:12px;line-height:18px;opacity:0;visibility:hidden;transition:opacity 120ms var(--jc-easing),visibility 0s linear 120ms;will-change:transform}
.jc-tooltip[data-visible=true]{opacity:1;visibility:visible;transition:opacity 120ms var(--jc-easing)}
.jc-tooltip-title{color:var(--jc-text-secondary);font-weight:500;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jc-tooltip-rows{display:grid;grid-template-columns:auto minmax(0,1fr) auto;column-gap:8px;align-items:center}
.jc-tooltip-key{display:inline-flex;align-items:center;justify-content:center;width:12px}
.jc-tooltip-label{color:var(--jc-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jc-tooltip-value{font-weight:600;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.jc-tooltip-row[data-active=true] .jc-tooltip-label{color:var(--jc-text)}
.jc-tooltip-footer{margin-top:6px;padding-top:6px;border-top:1px solid var(--jc-border);color:var(--jc-text-secondary)}
.jc-legend{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:0;padding:10px 0 0;list-style:none;font-size:12px;color:var(--jc-text-secondary)}
.jc-legend[data-position=top]{padding:0 0 10px}
.jc-legend[data-align=center]{justify-content:center}
.jc-legend[data-align=end]{justify-content:flex-end}
.jc-legend[data-orientation=vertical]{flex-direction:column;align-items:flex-start;padding:0 0 0 12px}
.jc-legend-item{display:inline-flex;align-items:center;gap:6px;max-width:100%;margin:-2px -4px;padding:2px 4px;border:0;border-radius:6px;background:none;color:inherit;font:inherit;cursor:pointer;transition:opacity var(--jc-duration) var(--jc-easing)}
.jc-legend-item:disabled{cursor:default}
.jc-legend-item:hover:not(:disabled){color:var(--jc-text)}
.jc-legend-item:focus-visible{outline:2px solid var(--jc-focus);outline-offset:1px}
.jc-legend-item[aria-pressed=false]{opacity:.45}
.jc-legend-item[aria-pressed=false] .jc-legend-text{text-decoration:line-through}
.jc-legend-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jc-legend-value{color:var(--jc-text);font-weight:600;font-variant-numeric:tabular-nums}
.jc-key{display:block;flex:none}
.jc-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;text-align:center;color:var(--jc-text-secondary);font-size:13px;pointer-events:none}
.jc-state button{pointer-events:auto}
.jc-state-error{color:var(--jc-text-secondary)}
.jc-placeholder{fill:var(--jc-track)}
.jc-root[data-jc-loading] .jc-surface{opacity:.5;transition:opacity var(--jc-duration) var(--jc-easing)}
.jc-button{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--jc-border);background:var(--jc-surface);color:var(--jc-text);font:inherit;font-size:12px;cursor:pointer}
.jc-button:hover{background:var(--jc-track)}
.jc-button:focus-visible{outline:2px solid var(--jc-focus);outline-offset:2px}
.jc-reset-zoom{position:absolute;top:4px;right:4px;z-index:5}
.jc-center{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;transform:translate(-50%,-50%)}
.jc-center-value{color:var(--jc-text);font-weight:600;line-height:1.1}
.jc-center-label{color:var(--jc-text-secondary);font-size:12px;margin-top:2px}
.jc-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.jc-animate-in{animation:jc-fade-in var(--jc-duration) var(--jc-easing) both}
@keyframes jc-fade-in{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.jc-root,.jc-root *{transition-duration:0s!important;animation:none!important}}
@media (forced-colors:active){.jc-legend-item[aria-pressed=false]{opacity:1}.jc-tooltip{border-color:CanvasText}.jc-crosshair,.jc-axis-line{stroke:CanvasText}}
`;

/**
 * The complete stylesheet: CSS variables for light/dark themes plus component
 * styles. Shipped as `@jafari/charts/styles.css` and injected automatically by
 * the React components (once per document).
 */
export function createStylesheet(
  light: ThemeTokens = lightTheme,
  dark: ThemeTokens = darkTheme,
): string {
  return `${themeRules(light, dark)}\n${COMPONENT_CSS.trim()}`;
}

export const stylesheet = createStylesheet();
