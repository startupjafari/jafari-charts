import type { ChartMessages, EasingFunction, EasingName } from '@jafari/charts-core';
import type { ThemeInput } from '@jafari/charts-themes';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Renderer = 'svg' | 'canvas' | 'auto';

export interface AnimationOptions {
  /** Animate marks in on first render (client-side mounts only). Default true. */
  initial?: boolean;
  /** Duration of data transitions, ms. Default 200. */
  duration?: number;
  easing?: EasingName | EasingFunction;
  /** Skip transitions for scenes with more points than this. Default 4000. */
  maxComplexity?: number;
}

/** App-wide defaults; every chart prop overrides the matching provider value. */
export interface ChartConfig {
  locale?: string;
  theme?: ThemeInput;
  animation?: boolean | AnimationOptions;
  renderer?: Renderer;
  messages?: Partial<ChartMessages>;
  /** Inject the stylesheet automatically (default true). Disable when importing `styles.css`. */
  injectStyles?: boolean;
}

const ChartConfigContext = createContext<ChartConfig>({});

export interface ChartProviderProps extends ChartConfig {
  children?: ReactNode;
}

/**
 * Sets defaults for all charts below it.
 *
 * ```tsx
 * <ChartProvider locale="ru" theme="auto" animation={{ duration: 160 }}>
 *   <App />
 * </ChartProvider>
 * ```
 */
export function ChartProvider({
  children,
  locale,
  theme,
  animation,
  renderer,
  messages,
  injectStyles,
}: ChartProviderProps) {
  const parent = useContext(ChartConfigContext);
  const value = useMemo<ChartConfig>(
    () => ({
      ...parent,
      ...(locale !== undefined ? { locale } : {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(animation !== undefined ? { animation } : {}),
      ...(renderer !== undefined ? { renderer } : {}),
      ...(messages !== undefined ? { messages: { ...parent.messages, ...messages } } : {}),
      ...(injectStyles !== undefined ? { injectStyles } : {}),
    }),
    [parent, locale, theme, animation, renderer, messages, injectStyles],
  );
  return <ChartConfigContext.Provider value={value}>{children}</ChartConfigContext.Provider>;
}

export function useChartConfig(): ChartConfig {
  return useContext(ChartConfigContext);
}
