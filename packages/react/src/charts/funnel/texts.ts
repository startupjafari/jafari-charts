import type { ChartMessages } from '@jafari/charts-core';

/** Funnel-specific strings; defaults come from the chart's `ChartMessages` (en/ru/kk). */
export type FunnelTexts = Pick<ChartMessages, 'stage' | 'ofFirst' | 'ofPrevious' | 'dropOff'>;

/** Resolves the funnel strings: chart messages, then the `texts` prop overrides. */
export function funnelTexts(
  messages: ChartMessages,
  overrides?: Partial<FunnelTexts>,
): FunnelTexts {
  const base: FunnelTexts = {
    stage: messages.stage,
    ofFirst: messages.ofFirst,
    ofPrevious: messages.ofPrevious,
    dropOff: messages.dropOff,
  };
  return overrides ? { ...base, ...overrides } : base;
}
