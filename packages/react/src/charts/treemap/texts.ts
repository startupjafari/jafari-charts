import type { ChartMessages } from '@jafari/charts-core';

/** Treemap-specific strings; defaults come from the chart's `ChartMessages` (en/ru/kk). */
export type TreemapTexts = Pick<
  ChartMessages,
  'all' | 'back' | 'breadcrumb' | 'share' | 'ofParent'
>;

/** Resolves the treemap strings: chart messages, then the `texts` prop overrides. */
export function treemapTexts(
  messages: ChartMessages,
  overrides?: Partial<TreemapTexts>,
): TreemapTexts {
  const base: TreemapTexts = {
    all: messages.all,
    back: messages.back,
    breadcrumb: messages.breadcrumb,
    share: messages.share,
    ofParent: messages.ofParent,
  };
  return overrides ? { ...base, ...overrides } : base;
}
