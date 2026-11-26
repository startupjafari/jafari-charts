/**
 * Design tokens. Every visual parameter of Jafari Charts is a token exposed as a
 * CSS custom property (`--jc-*`), so themes can be changed with plain CSS.
 */
export interface ThemeTokens {
  /** Surface behind the chart; also used for the 2px rings around markers. */
  background: string;
  /** Tooltip and popover surface. */
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  grid: string;
  axis: string;
  crosshair: string;
  /** Unfilled tracks (radial progress, gauge) and empty heatmap cells. */
  track: string;
  focus: string;
  /** Categorical series colours, assigned in order. */
  series: readonly string[];
  positive: string;
  negative: string;
  warning: string;
  neutral: string;
  fontFamily: string;
  fontSize: string;
  fontSizeSmall: string;
  fontSizeLarge: string;
  radius: string;
  tooltipRadius: string;
  tooltipShadow: string;
  duration: string;
  easing: string;
}

/** Brand palette. */
export const palette = {
  primary: '#3B82F6',
  blue: '#60A5FA',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  pink: '#EC4899',
} as const;

/**
 * Categorical order for light surfaces. Validated for colour-vision deficiency:
 * every adjacent pair stays distinguishable (OKLab ΔE ≥ 8 under protan/deutan
 * simulation), so stacks, legends and neighbouring bars stay readable.
 */
export const lightSeries = [
  palette.primary,
  palette.success,
  palette.purple,
  palette.warning,
  palette.pink,
  palette.cyan,
  palette.error,
  palette.blue,
] as const;

/** Same hues stepped for dark surfaces (lightness band 0.48–0.67, ≥ 3:1 contrast). */
export const darkSeries = [
  '#3B82F6',
  '#059669',
  '#8B5CF6',
  '#D97706',
  '#EC4899',
  '#0891B2',
  '#EF4444',
  '#5B8DEF',
] as const;

const shared = {
  fontFamily: 'inherit',
  fontSize: '11px',
  fontSizeSmall: '11px',
  fontSizeLarge: '13px',
  radius: '4px',
  tooltipRadius: '10px',
  duration: '200ms',
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

export const lightTheme: ThemeTokens = {
  ...shared,
  background: '#ffffff',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e5e7eb',
  grid: '#eef1f5',
  axis: '#e2e8f0',
  crosshair: '#94a3b8',
  track: '#eef2f7',
  focus: palette.primary,
  series: lightSeries,
  positive: '#059669',
  negative: '#DC2626',
  warning: '#D97706',
  neutral: '#94a3b8',
  tooltipShadow: '0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px rgba(15, 23, 42, 0.08)',
};

export const darkTheme: ThemeTokens = {
  ...shared,
  background: '#0f1115',
  surface: '#171a21',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#262b36',
  grid: '#1c212b',
  axis: '#2a303c',
  crosshair: '#64748b',
  track: '#1d222c',
  focus: palette.blue,
  series: darkSeries,
  positive: '#10B981',
  negative: '#EF4444',
  warning: '#F59E0B',
  neutral: '#64748b',
  tooltipShadow: '0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.35)',
};

/** Maximum number of distinct categorical colours. Beyond this, colours repeat. */
export const SERIES_COUNT = 8;

const VAR_NAMES: Record<Exclude<keyof ThemeTokens, 'series'>, string> = {
  background: '--jc-bg',
  surface: '--jc-surface',
  textPrimary: '--jc-text',
  textSecondary: '--jc-text-secondary',
  textMuted: '--jc-text-muted',
  border: '--jc-border',
  grid: '--jc-grid',
  axis: '--jc-axis',
  crosshair: '--jc-crosshair',
  track: '--jc-track',
  focus: '--jc-focus',
  positive: '--jc-positive',
  negative: '--jc-negative',
  warning: '--jc-warning',
  neutral: '--jc-neutral',
  fontFamily: '--jc-font-family',
  fontSize: '--jc-font-size',
  fontSizeSmall: '--jc-font-size-sm',
  fontSizeLarge: '--jc-font-size-lg',
  radius: '--jc-radius',
  tooltipRadius: '--jc-tooltip-radius',
  tooltipShadow: '--jc-tooltip-shadow',
  duration: '--jc-duration',
  easing: '--jc-easing',
};

/** CSS custom property for series slot `index` (0-based). */
export function seriesVar(index: number): string {
  return `--jc-series-${(index % SERIES_COUNT) + 1}`;
}

/** `var(--jc-series-N)` reference for series slot `index`. */
export function seriesColor(index: number): string {
  return `var(${seriesVar(index)})`;
}

/** CSS variable reference for a token, e.g. `cssVar('grid')` → `var(--jc-grid)`. */
export function cssVar(token: Exclude<keyof ThemeTokens, 'series'>): string {
  return `var(${VAR_NAMES[token]})`;
}

/** Converts (partial) tokens to a map of CSS custom properties. */
export function tokensToVars(tokens: Partial<ThemeTokens>): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (value === undefined) continue;
    if (key === 'series') {
      (value as readonly string[]).slice(0, SERIES_COUNT).forEach((c, i) => {
        vars[seriesVar(i)] = c;
      });
    } else {
      const name = VAR_NAMES[key as Exclude<keyof ThemeTokens, 'series'>];
      if (name) vars[name] = value as string;
    }
  }
  return vars;
}
