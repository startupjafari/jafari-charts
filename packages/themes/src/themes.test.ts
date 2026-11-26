import { describe, expect, it } from 'vitest';
import { createStylesheet, stylesheet } from './css';
import { createTheme, resolveTokens, themeInlineVars, themeScopedCss } from './theme';
import { cssVar, darkTheme, lightTheme, seriesColor, tokensToVars } from './tokens';

describe('tokens', () => {
  it('maps tokens to CSS custom properties', () => {
    const vars = tokensToVars({ grid: '#eee', series: ['#111', '#222'] });
    expect(vars).toEqual({ '--jc-grid': '#eee', '--jc-series-1': '#111', '--jc-series-2': '#222' });
    expect(seriesColor(0)).toBe('var(--jc-series-1)');
    expect(seriesColor(9)).toBe('var(--jc-series-2)');
    expect(cssVar('grid')).toBe('var(--jc-grid)');
  });

  it('ships eight series colours in both modes, starting with the brand primary', () => {
    expect(lightTheme.series).toHaveLength(8);
    expect(darkTheme.series).toHaveLength(8);
    expect(lightTheme.series[0]).toBe('#3B82F6');
  });
});

describe('stylesheet', () => {
  it('declares light defaults and every dark switch', () => {
    expect(/^\.jc-root\{[^}]*--jc-bg:#ffffff/.test(stylesheet)).toBe(true);
    expect(stylesheet).toContain('.jc-root[data-jc-theme=dark]{');
    expect(stylesheet).toContain(
      '@supports (color:light-dark(#000,#fff)){.jc-root[data-jc-theme=auto]{',
    );
    expect(stylesheet).toContain('--jc-bg:light-dark(#ffffff,#0f1115)');
    // The OS preference alone must not switch an auto chart to dark.
    expect(stylesheet).not.toContain('prefers-color-scheme');
    expect(stylesheet).toContain(':where(.dark,');
    expect(stylesheet).toContain('prefers-reduced-motion');
  });

  it('only repeats tokens that differ in dark mode', () => {
    const darkBlock = /\.jc-root\[data-jc-theme=dark\]\{([^}]*)\}/.exec(stylesheet)?.[1] ?? '';
    expect(darkBlock).not.toContain('--jc-radius');
    expect(darkBlock).toContain('--jc-bg:#0f1115');
  });

  it('can be generated from custom tokens', () => {
    expect(createStylesheet({ ...lightTheme, grid: '#123456' })).toContain('--jc-grid:#123456');
  });
});

describe('themes', () => {
  it('creates themes and resolves tokens per mode', () => {
    const t = createTheme({ series: ['#000000'], dark: { grid: '#222222' } });
    expect(t.mode).toBe('auto');
    expect(resolveTokens(t, 'dark').grid).toBe('#222222');
    expect(resolveTokens(t, 'light').grid).toBe(lightTheme.grid);
    expect(resolveTokens('dark', 'dark').background).toBe(darkTheme.background);
  });

  it('produces inline vars and scoped CSS only when needed', () => {
    expect(themeInlineVars('auto')).toBeUndefined();
    expect(themeInlineVars(createTheme({ radius: '8px' }))).toEqual({ '--jc-radius': '8px' });
    expect(themeScopedCss('auto', 'x')).toBe('');
    const css = themeScopedCss(createTheme({ dark: { grid: '#222' } }), 'r1');
    expect(css).toContain('.jc-root[data-jc-scope="r1"]{--jc-grid:#222}');
  });
});
