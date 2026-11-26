/** Treemap-specific strings (drill-down navigation and shares). */
export interface TreemapTexts {
  /** Breadcrumb label of the whole tree. */
  all: string;
  /** Zoom-out button. */
  back: string;
  /** Accessible name of the breadcrumb navigation. */
  breadcrumb: string;
  /** Data table header for the share of the total. */
  share: string;
  /** Tooltip footer: share of the parent category. */
  ofParent: (share: string, parent: string) => string;
}

const TEXTS: Record<string, TreemapTexts> = {
  en: {
    all: 'All',
    back: 'Back',
    breadcrumb: 'Treemap level',
    share: 'Share',
    ofParent: (share, parent) => `${share} of ${parent}`,
  },
  ru: {
    all: 'Все',
    back: 'Назад',
    breadcrumb: 'Уровень диаграммы',
    share: 'Доля',
    ofParent: (share, parent) => `${share} от «${parent}»`,
  },
  kk: {
    all: 'Барлығы',
    back: 'Артқа',
    breadcrumb: 'Диаграмма деңгейі',
    share: 'Үлесі',
    ofParent: (share, parent) => `«${parent}» ішінен ${share}`,
  },
};

export function treemapTexts(locale: string, overrides?: Partial<TreemapTexts>): TreemapTexts {
  const base = TEXTS[locale.toLowerCase().split(/[-_]/)[0] ?? 'en'] ?? (TEXTS.en as TreemapTexts);
  return overrides ? { ...base, ...overrides } : base;
}
