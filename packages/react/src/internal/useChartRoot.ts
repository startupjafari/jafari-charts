import {
  createStore,
  getMessages,
  resolveEasing,
  type ChartMessages,
  type EasingFunction,
  type Store,
} from '@jafari/charts-core';
import {
  normalizeTheme,
  themeInlineVars,
  themeScopedCss,
  type ThemeInput,
} from '@jafari/charts-themes';
import {
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { useElementWidth } from '../hooks/useElementWidth';
import { useIsClientMount, useReducedMotion } from '../hooks/useReducedMotion';
import type { InteractionState } from '../providers/ChartContext';
import { useChartConfig, type AnimationOptions, type Renderer } from '../providers/ChartProvider';

/** Props shared by every chart. All are optional. */
export interface BaseChartProps {
  /** Height of the chart surface including axes, px (the legend is added below). */
  height?: number;
  /** Fixed width, px. Omit to fill the container and follow resizes. */
  width?: number;
  /** Width assumed for server rendering before the container is measured. */
  initialWidth?: number;
  theme?: ThemeInput;
  /** BCP 47 locale for numbers, dates and built-in texts ("en", "ru", "kk"…). */
  locale?: string;
  messages?: Partial<ChartMessages>;
  /** `false` disables all animation; an object tunes it. */
  animation?: boolean | AnimationOptions;
  renderer?: Renderer;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** Accessible name of the chart. */
  title?: string;
  /** Extra accessible description. */
  description?: string;
  /** Keeps the previous render dimmed while new data loads (or shows a placeholder without data). */
  loading?: boolean;
  /** Error state: `true` for the default message or a custom node. */
  error?: boolean | ReactNode;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
  /** Render a visually hidden data table (default: when ≤ 60 rows). Number = row limit. */
  accessibilityTable?: boolean | number;
}

export interface ResolvedAnimation {
  enabled: boolean;
  initial: boolean;
  duration: number;
  easing: EasingFunction;
  maxComplexity: number;
}

export interface ChartRoot {
  ref: RefObject<HTMLDivElement | null>;
  id: string;
  width: number;
  height: number;
  /** True once the real width is known (or fixed). */
  ready: boolean;
  locale: string;
  messages: ChartMessages;
  animation: ResolvedAnimation;
  store: Store<InteractionState>;
  themeMode: 'light' | 'dark' | 'auto';
  themeStyle: Record<string, string> | undefined;
  themeCss: string;
  renderer: Renderer;
  reducedMotion: boolean;
}

export function createInteractionStore(): Store<InteractionState> {
  return createStore<InteractionState>({
    active: null,
    source: null,
    pointer: null,
    highlight: null,
    brush: null,
    announcement: null,
  });
}

export function useChartRoot(props: BaseChartProps, defaults: { height: number }): ChartRoot {
  const config = useChartConfig();
  const ref = useRef<HTMLDivElement | null>(null);
  const measured = useElementWidth(ref, props.width === undefined);
  const width = props.width ?? measured ?? props.initialWidth ?? 640;
  const ready = props.width !== undefined || measured !== null;
  const height = props.height ?? defaults.height;
  const locale = props.locale ?? config.locale ?? 'en';
  const messages = useMemo(
    () =>
      getMessages(
        locale,
        config.messages || props.messages ? { ...config.messages, ...props.messages } : undefined,
      ),
    [locale, config.messages, props.messages],
  );
  const reducedMotion = useReducedMotion();
  const clientMount = useIsClientMount();
  const anim = props.animation ?? config.animation ?? true;
  const animOpts: AnimationOptions = typeof anim === 'object' ? anim : {};
  const animation: ResolvedAnimation = {
    enabled: anim !== false && !reducedMotion,
    initial: (animOpts.initial ?? true) && clientMount,
    duration: animOpts.duration ?? 200,
    easing: resolveEasing(animOpts.easing),
    maxComplexity: animOpts.maxComplexity ?? 4000,
  };
  const reactId = useId();
  const id = props.id ?? `jc${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [store] = useState(createInteractionStore);
  const themeInput = props.theme ?? config.theme ?? 'auto';
  const theme = normalizeTheme(themeInput);
  return {
    ref,
    id,
    width,
    height,
    ready,
    locale,
    messages,
    animation,
    store,
    themeMode: theme.mode,
    themeStyle: themeInlineVars(themeInput),
    themeCss: themeScopedCss(themeInput, id),
    renderer: props.renderer ?? config.renderer ?? 'svg',
    reducedMotion,
  };
}
