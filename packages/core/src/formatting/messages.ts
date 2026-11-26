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
};

export const MESSAGES: Readonly<Record<'en' | 'ru' | 'kk', ChartMessages>> = { en, ru, kk };

/** Resolves messages for a BCP 47 locale ("ru-RU" → ru), falling back to English. */
export function getMessages(locale = 'en', overrides?: Partial<ChartMessages>): ChartMessages {
  const lang = locale.toLowerCase().split(/[-_]/)[0] as keyof typeof MESSAGES;
  const base = MESSAGES[lang] ?? en;
  return overrides ? { ...base, ...overrides } : base;
}
