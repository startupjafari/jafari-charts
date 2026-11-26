/** Funnel-specific strings (the shared `ChartMessages` has no conversion vocabulary yet). */
export interface FunnelTexts {
  /** Column header for stage names in the data table. */
  stage: string;
  /** Share of the first stage. */
  ofFirst: string;
  /** Share of the previous stage (step conversion). */
  ofPrevious: string;
  /** Loss from the previous stage. */
  dropOff: string;
}

const TEXTS: Record<string, FunnelTexts> = {
  en: {
    stage: 'Stage',
    ofFirst: 'Of first stage',
    ofPrevious: 'Of previous stage',
    dropOff: 'Drop-off',
  },
  ru: {
    stage: 'Этап',
    ofFirst: 'От первого этапа',
    ofPrevious: 'От предыдущего этапа',
    dropOff: 'Потери',
  },
  kk: {
    stage: 'Кезең',
    ofFirst: 'Бірінші кезеңнен',
    ofPrevious: 'Алдыңғы кезеңнен',
    dropOff: 'Шығын',
  },
};

export function funnelTexts(locale: string, overrides?: Partial<FunnelTexts>): FunnelTexts {
  const base = TEXTS[locale.toLowerCase().split(/[-_]/)[0] ?? 'en'] ?? (TEXTS.en as FunnelTexts);
  return overrides ? { ...base, ...overrides } : base;
}
