/** User-facing strings rendered by charts. Override any of them per chart or provider. */
export interface ChartMessages {
  noData: string;
  loading: string;
  error: string;
  retry: string;
  resetZoom: string;
  total: string;
  other: string;
  chart: string;
  dataTable: string;
  legend: string;
  value: string;
  category: string;
  series: string;
  minimum: string;
  maximum: string;
  average: string;
  change: string;
  start: string;
  end: string;
  /** Legend button label for toggling a series. */
  toggleSeries: (name: string, visible: boolean) => string;
  /** Short description of a chart for assistive technology. */
  describe: (info: { type: string; series: number; points: number }) => string;
  /** Hint announced when the chart receives keyboard focus. */
  keyboardHint: string;
  /** Announced after zooming or panning: the visible range. */
  visibleRange: (from: string, to: string) => string;
  /** Announced after a range selection (brush). */
  selectedRange: (from: string, to: string) => string;
  /** Funnel: column header for stage names in the data table. */
  stage: string;
  /** Funnel: share of the first stage. */
  ofFirst: string;
  /** Funnel: share of the previous stage (step conversion). */
  ofPrevious: string;
  /** Funnel: loss from the previous stage. */
  dropOff: string;
  /** Treemap: breadcrumb label of the whole tree. */
  all: string;
  /** Treemap: zoom-out button. */
  back: string;
  /** Treemap: accessible name of the breadcrumb navigation. */
  breadcrumb: string;
  /** Treemap: data table header for the share of the total. */
  share: string;
  /** Treemap: tooltip footer, share of the parent category. */
  ofParent: (share: string, parent: string) => string;
  /** Heatmaps: text before the colour scale. */
  less: string;
  /** Heatmaps: text after the colour scale. */
  more: string;
  /** Calendar heatmap: data table header for months. */
  month: string;
  /** Localised chart type names for accessible descriptions, keyed by the English name. */
  chartNames: Readonly<Record<string, string>>;
}

const en: ChartMessages = {
  noData: 'No data',
  loading: 'Loading…',
  error: 'Could not load chart',
  retry: 'Retry',
  resetZoom: 'Reset zoom',
  total: 'Total',
  other: 'Other',
  chart: 'Chart',
  dataTable: 'Data table',
  legend: 'Legend',
  value: 'Value',
  category: 'Category',
  series: 'Series',
  minimum: 'Minimum',
  maximum: 'Maximum',
  average: 'Average',
  change: 'Change',
  start: 'Start',
  end: 'End',
  toggleSeries: (name, visible) => `${visible ? 'Hide' : 'Show'} ${name}`,
  describe: ({ type, series, points }) =>
    `${type} with ${series} series and ${points} ${points === 1 ? 'data point' : 'data points'}.`,
  keyboardHint: 'Use arrow keys to explore data points.',
  visibleRange: (from, to) => `Showing ${from} – ${to}`,
  selectedRange: (from, to) => `Selected ${from} – ${to}`,
  stage: 'Stage',
  ofFirst: 'Of first stage',
  ofPrevious: 'Of previous stage',
  dropOff: 'Drop-off',
  all: 'All',
  back: 'Back',
  breadcrumb: 'Treemap level',
  share: 'Share',
  ofParent: (share, parent) => `${share} of ${parent}`,
  less: 'Less',
  more: 'More',
  month: 'Month',
  chartNames: {},
};

function ruPlural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const ru: ChartMessages = {
  noData: 'Нет данных',
  loading: 'Загрузка…',
  error: 'Не удалось загрузить диаграмму',
  retry: 'Повторить',
  resetZoom: 'Сбросить масштаб',
  total: 'Итого',
  other: 'Другое',
  chart: 'Диаграмма',
  dataTable: 'Таблица данных',
  legend: 'Легенда',
  value: 'Значение',
  category: 'Категория',
  series: 'Ряд',
  minimum: 'Минимум',
  maximum: 'Максимум',
  average: 'Среднее',
  change: 'Изменение',
  start: 'Начало',
  end: 'Конец',
  toggleSeries: (name, visible) => `${visible ? 'Скрыть' : 'Показать'} ${name}`,
  describe: ({ type, series, points }) =>
    `${type}: ${series} ${ruPlural(series, 'ряд', 'ряда', 'рядов')}, ${points} ${ruPlural(points, 'точка', 'точки', 'точек')} данных.`,
  keyboardHint: 'Используйте клавиши со стрелками для просмотра значений.',
  visibleRange: (from, to) => `Показано: ${from} – ${to}`,
  selectedRange: (from, to) => `Выбрано: ${from} – ${to}`,
  stage: 'Этап',
  ofFirst: 'От первого этапа',
  ofPrevious: 'От предыдущего этапа',
  dropOff: 'Потери',
  all: 'Все',
  back: 'Назад',
  breadcrumb: 'Уровень диаграммы',
  share: 'Доля',
  ofParent: (share, parent) => `${share} от «${parent}»`,
  less: 'Меньше',
  more: 'Больше',
  month: 'Месяц',
  chartNames: {
    'Line chart': 'Линейный график',
    'Area chart': 'Диаграмма с областями',
    'Stacked area chart': 'Диаграмма с накоплением областей',
    'Percent stacked area chart': 'Нормированная диаграмма с областями',
    'Bar chart': 'Столбчатая диаграмма',
    'Horizontal bar chart': 'Линейчатая диаграмма',
    'Grouped bar chart': 'Сгруппированная столбчатая диаграмма',
    'Stacked bar chart': 'Столбчатая диаграмма с накоплением',
    'Percent stacked bar chart': 'Нормированная столбчатая диаграмма',
    'Combo chart': 'Комбинированная диаграмма',
    'Waterfall chart': 'Каскадная диаграмма',
    Sparkline: 'Мини-график',
    'Pie chart': 'Круговая диаграмма',
    'Donut chart': 'Кольцевая диаграмма',
    'Radial progress chart': 'Кольцевой индикатор прогресса',
    'Gauge chart': 'Шкала-индикатор',
    'Scatter chart': 'Точечная диаграмма',
    'Radar chart': 'Лепестковая диаграмма',
    Heatmap: 'Тепловая карта',
    'Calendar heatmap': 'Календарь активности',
    'Funnel chart': 'Воронка',
    Treemap: 'Древовидная карта',
  },
};

const kk: ChartMessages = {
  noData: 'Деректер жоқ',
  loading: 'Жүктелуде…',
  error: 'Диаграмманы жүктеу мүмкін болмады',
  retry: 'Қайталау',
  resetZoom: 'Масштабты қалпына келтіру',
  total: 'Барлығы',
  other: 'Басқа',
  chart: 'Диаграмма',
  dataTable: 'Деректер кестесі',
  legend: 'Шартты белгілер',
  value: 'Мән',
  category: 'Санат',
  series: 'Қатар',
  minimum: 'Ең аз',
  maximum: 'Ең көп',
  average: 'Орташа',
  change: 'Өзгеріс',
  start: 'Басы',
  end: 'Соңы',
  toggleSeries: (name, visible) => `${name}: ${visible ? 'жасыру' : 'көрсету'}`,
  describe: ({ type, series, points }) => `${type}: ${series} қатар, ${points} деректер нүктесі.`,
  keyboardHint: 'Мәндерді қарау үшін көрсеткі пернелерін пайдаланыңыз.',
  visibleRange: (from, to) => `Көрсетілген аралық: ${from} – ${to}`,
  selectedRange: (from, to) => `Таңдалған аралық: ${from} – ${to}`,
  stage: 'Кезең',
  ofFirst: 'Бірінші кезеңнен',
  ofPrevious: 'Алдыңғы кезеңнен',
  dropOff: 'Шығын',
  all: 'Барлығы',
  back: 'Артқа',
  breadcrumb: 'Диаграмма деңгейі',
  share: 'Үлесі',
  ofParent: (share, parent) => `«${parent}» ішінен ${share}`,
  less: 'Аз',
  more: 'Көп',
  month: 'Ай',
  chartNames: {
    'Line chart': 'Сызықтық график',
    'Area chart': 'Аймақтық диаграмма',
    'Stacked area chart': 'Жинақталған аймақтық диаграмма',
    'Percent stacked area chart': 'Пайыздық аймақтық диаграмма',
    'Bar chart': 'Бағаналы диаграмма',
    'Horizontal bar chart': 'Көлденең бағаналы диаграмма',
    'Grouped bar chart': 'Топтастырылған бағаналы диаграмма',
    'Stacked bar chart': 'Жинақталған бағаналы диаграмма',
    'Percent stacked bar chart': 'Пайыздық бағаналы диаграмма',
    'Combo chart': 'Аралас диаграмма',
    'Waterfall chart': 'Сарқырама диаграммасы',
    Sparkline: 'Шағын график',
    'Pie chart': 'Дөңгелек диаграмма',
    'Donut chart': 'Сақиналы диаграмма',
    'Radial progress chart': 'Сақиналы прогресс көрсеткіші',
    'Gauge chart': 'Шкала көрсеткіші',
    'Scatter chart': 'Нүктелік диаграмма',
    'Radar chart': 'Радар диаграммасы',
    Heatmap: 'Жылу картасы',
    'Calendar heatmap': 'Белсенділік күнтізбесі',
    'Funnel chart': 'Воронка',
    Treemap: 'Ағаштық карта',
  },
};

export const MESSAGES: Readonly<Record<'en' | 'ru' | 'kk', ChartMessages>> = { en, ru, kk };

/** Resolves messages for a BCP 47 locale ("ru-RU" → ru), falling back to English. */
export function getMessages(locale = 'en', overrides?: Partial<ChartMessages>): ChartMessages {
  const lang = locale.toLowerCase().split(/[-_]/)[0] as keyof typeof MESSAGES;
  const base = MESSAGES[lang] ?? en;
  return overrides ? { ...base, ...overrides } : base;
}
