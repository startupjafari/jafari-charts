import { darkTheme, lightTheme, tokensToVars, type ThemeTokens } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'auto';

/** A custom theme: a base mode plus token overrides (optionally per mode). */
export interface Theme {
  mode: ThemeMode;
  /** Overrides applied in every mode. */
  tokens?: Partial<ThemeTokens>;
  /** Overrides applied only in light mode (with `mode: 'auto'`). */
  light?: Partial<ThemeTokens>;
  /** Overrides applied only in dark mode (with `mode: 'auto'` or `'dark'`). */
  dark?: Partial<ThemeTokens>;
}

export type ThemeInput = ThemeMode | Theme;

export interface CreateThemeOptions extends Partial<ThemeTokens> {
  mode?: ThemeMode;
  light?: Partial<ThemeTokens>;
  dark?: Partial<ThemeTokens>;
}

/**
 * Creates a custom theme.
 *
 * ```ts
 * const brand = createTheme({ mode: 'auto', series: ['#0EA5E9', '#22C55E'], radius: '6px' });
 * <LineChart theme={brand} … />
 * ```
 */
export function createTheme(options: CreateThemeOptions = {}): Theme {
  const { mode = 'auto', light, dark, ...tokens } = options;
  const theme: Theme = { mode };
  if (Object.keys(tokens).length) theme.tokens = tokens;
  if (light) theme.light = light;
  if (dark) theme.dark = dark;
  return theme;
}

export function normalizeTheme(input: ThemeInput | undefined): Theme {
  if (!input) return { mode: 'auto' };
  return typeof input === 'string' ? { mode: input } : input;
}

/**
 * Resolves the full token set for a concrete mode (used by renderers that cannot
 * read CSS variables directly, e.g. exports and server-side image generation).
 */
export function resolveTokens(theme: ThemeInput | undefined, mode: 'light' | 'dark'): ThemeTokens {
  const t = normalizeTheme(theme);
  const base = mode === 'dark' ? darkTheme : lightTheme;
  return { ...base, ...t.tokens, ...(mode === 'dark' ? t.dark : t.light) };
}

/** Inline CSS variables for the parts of a theme that apply in every mode. */
export function themeInlineVars(theme: ThemeInput | undefined): Record<string, string> | undefined {
  const t = normalizeTheme(theme);
  const vars = {
    ...(t.tokens ? tokensToVars(t.tokens) : {}),
    ...(t.mode === 'dark' && t.dark ? tokensToVars(t.dark) : {}),
    ...(t.mode === 'light' && t.light ? tokensToVars(t.light) : {}),
  };
  return Object.keys(vars).length ? vars : undefined;
}

/**
 * Scoped CSS for per-mode overrides of an `auto` theme, keyed by a unique
 * attribute value. Returns an empty string when not needed.
 */
export function themeScopedCss(theme: ThemeInput | undefined, scope: string): string {
  const t = normalizeTheme(theme);
  if (t.mode !== 'auto' || (!t.light && !t.dark)) return '';
  const sel = `.jc-root[data-jc-scope="${scope.replace(/["\\]/g, '')}"]`;
  const decl = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  const parts: string[] = [];
  if (t.light) parts.push(`${sel}{${decl(tokensToVars(t.light))}}`);
  if (t.dark) {
    const d = decl(tokensToVars(t.dark));
    if (t.light) {
      const l = tokensToVars(t.light);
      const both = Object.entries(tokensToVars(t.dark))
        .filter(([k]) => l[k] !== undefined)
        .map(([k, v]) => `${k}:light-dark(${l[k]},${v})`)
        .join(';');
      if (both) parts.push(`@supports (color:light-dark(#000,#fff)){${sel}{${both}}}`);
    }
    parts.push(
      `:where(.dark,[data-theme=dark],[data-mode=dark],[data-color-scheme=dark]) ${sel}{${d}}`,
    );
  }
  return parts.join('\n');
}
