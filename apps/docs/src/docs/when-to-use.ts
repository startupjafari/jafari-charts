import type { L } from '../i18n/lang';

/** Guidance shown at the top of a chart page: what the chart is good at, and what to pick instead. */
export interface UseGuide {
  /** Situations the chart answers well. */
  good: readonly string[];
  /** When another chart is the better choice (backticks become inline code). */
  instead: string;
}

/** “When to use it” per chart slug, in every site language. */
export const WHEN_TO_USE: Record<string, L<UseGuide>> = {
  'line-chart': {
    en: {
      good: [
        'Trends over time or another continuous axis',
        'Comparing a few series on one scale',
        'Long or dense series (downsampled automatically)',
      ],
      instead: 'For volume or totals use `AreaChart`; for a handful of categories use `BarChart`.',
    },
    ru: {
      good: [
        'Тренды во времени или по другой непрерывной оси',
        'Сравнение нескольких рядов на одной шкале',
        'Длинные и плотные ряды (прореживаются автоматически)',
      ],
      instead: 'Для объёмов и сумм подойдёт `AreaChart`, для нескольких категорий — `BarChart`.',
    },
  },
  'area-chart': {
    en: {
      good: [
        'Volume over time: traffic, sales, usage',
        'One or two series where the filled area reads as “amount”',
      ],
      instead:
        'For many overlapping series use `LineChart`; for parts of a total use `StackedAreaChart`.',
    },
    ru: {
      good: [
        'Объём во времени: трафик, продажи, нагрузка',
        'Один-два ряда, где заливка читается как «количество»',
      ],
      instead:
        'Для многих пересекающихся рядов лучше `LineChart`, для частей целого — `StackedAreaChart`.',
    },
  },
  'bar-chart': {
    en: {
      good: [
        'Comparing values across categories or periods',
        'Values with negatives (bars grow both ways)',
        'Up to a few dozen bars',
      ],
      instead:
        'Long category names read better in `HorizontalBarChart`; several series per category need `GroupedBarChart`.',
    },
    ru: {
      good: [
        'Сравнение значений по категориям или периодам',
        'Значения с отрицательными числами (столбцы растут в обе стороны)',
        'До нескольких десятков столбцов',
      ],
      instead:
        'Длинные названия категорий лучше читаются в `HorizontalBarChart`, несколько рядов на категорию — в `GroupedBarChart`.',
    },
  },
  'horizontal-bar-chart': {
    en: {
      good: [
        'Rankings and top-N lists',
        'Long category names that would not fit under a vertical bar',
      ],
      instead: 'For change over time use `BarChart` or `LineChart`.',
    },
    ru: {
      good: [
        'Рейтинги и списки «топ-N»',
        'Длинные названия категорий, которые не уместились бы под вертикальным столбцом',
      ],
      instead: 'Для изменений во времени выбирайте `BarChart` или `LineChart`.',
    },
  },
  'grouped-bar-chart': {
    en: {
      good: [
        'Comparing two to four series inside each category',
        'Before/after or plan/actual side by side',
      ],
      instead: 'When the total matters more than each part use `StackedBarChart`.',
    },
    ru: {
      good: [
        'Сравнение двух–четырёх рядов внутри каждой категории',
        '«До и после» или «план и факт» рядом',
      ],
      instead: 'Если важнее сумма, а не части, используйте `StackedBarChart`.',
    },
  },
  'stacked-bar-chart': {
    en: {
      good: [
        'Totals and their composition per category',
        'Shares in percent mode (each bar is 100 %)',
        'Budgets with income and expenses (mixed signs)',
      ],
      instead: 'To compare the individual parts precisely use `GroupedBarChart`.',
    },
    ru: {
      good: [
        'Суммы и их состав по категориям',
        'Доли в процентном режиме (каждый столбец — 100 %)',
        'Бюджеты с доходами и расходами (разные знаки)',
      ],
      instead: 'Чтобы точно сравнивать отдельные части, используйте `GroupedBarChart`.',
    },
  },
  'donut-chart': {
    en: {
      good: [
        'Part-to-whole with two to six slices',
        'Dashboards that need the total in the middle',
      ],
      instead: 'Many or similar-sized slices compare better as `HorizontalBarChart`.',
    },
    ru: {
      good: ['Части целого: от двух до шести секторов', 'Дашборды, где нужна сумма в центре'],
      instead:
        'Много секторов или близкие по размеру значения лучше сравнивать в `HorizontalBarChart`.',
    },
  },
  'pie-chart': {
    en: {
      good: [
        'A handful of shares that add up to 100 %',
        'Reports where percentage labels on the slices are enough',
      ],
      instead: 'For a central total use `DonutChart`; for exact comparison use `BarChart`.',
    },
    ru: {
      good: [
        'Несколько долей, которые в сумме дают 100 %',
        'Отчёты, где достаточно подписей процентов на секторах',
      ],
      instead: 'Для суммы в центре выбирайте `DonutChart`, для точного сравнения — `BarChart`.',
    },
  },
  sparkline: {
    en: {
      good: ['A trend next to a number in KPI cards', 'Rows of a table, one tiny chart per row'],
      instead: 'When readers need axes, values or a legend use `LineChart` or `AreaChart`.',
    },
    ru: {
      good: [
        'Тренд рядом с числом в карточке показателя',
        'Строки таблицы — по маленькой диаграмме в каждой',
      ],
      instead: 'Если нужны оси, значения или легенда, используйте `LineChart` или `AreaChart`.',
    },
  },
  'radial-progress-chart': {
    en: {
      good: [
        'Progress towards a target (0–100 %)',
        'Two or three related goals as concentric rings',
      ],
      instead: 'A value inside ranges such as “low / medium / high” reads better on `GaugeChart`.',
    },
    ru: {
      good: ['Прогресс к цели (0–100 %)', 'Две-три связанные цели в виде концентрических колец'],
      instead:
        'Значение внутри диапазонов вроде «низкий / средний / высокий» нагляднее на `GaugeChart`.',
    },
  },
  'heatmap-chart': {
    en: {
      good: [
        'A value for every pair of two categories',
        'Patterns such as activity by weekday and hour',
      ],
      instead: 'For one cell per calendar day use `CalendarHeatmap`.',
    },
    ru: {
      good: [
        'Значение для каждой пары двух категорий',
        'Закономерности вроде активности по дням недели и часам',
      ],
      instead: 'Для одной клетки на календарный день используйте `CalendarHeatmap`.',
    },
  },
  'radar-chart': {
    en: {
      good: [
        'Comparing two or three profiles across five to eight metrics',
        'Skill or quality profiles where the overall shape matters',
      ],
      instead: 'For precise values across many items use `GroupedBarChart`.',
    },
    ru: {
      good: [
        'Сравнение двух-трёх профилей по пяти–восьми показателям',
        'Профили навыков или качества, где важна общая форма',
      ],
      instead: 'Для точных значений по многим объектам лучше `GroupedBarChart`.',
    },
  },
  'scatter-chart': {
    en: {
      good: [
        'The relationship between two numeric measures',
        'Spotting clusters and outliers',
        'A third measure as bubble size',
      ],
      instead: 'When one axis is time use `LineChart`.',
    },
    ru: {
      good: [
        'Связь между двумя числовыми показателями',
        'Поиск кластеров и выбросов',
        'Третий показатель как размер пузырька',
      ],
      instead: 'Если одна из осей — время, используйте `LineChart`.',
    },
  },
  'funnel-chart': {
    en: {
      good: ['Conversion through ordered stages', 'Showing where people drop off'],
      instead: 'Stages without a fixed order compare better as `HorizontalBarChart`.',
    },
    ru: {
      good: ['Конверсия по упорядоченным этапам', 'Показать, где люди отсеиваются'],
      instead: 'Этапы без фиксированного порядка лучше сравнивать в `HorizontalBarChart`.',
    },
  },
  'treemap-chart': {
    en: {
      good: [
        'Part-to-whole for nested categories',
        'Budgets or storage where the biggest items should stand out',
      ],
      instead: 'A flat list of a few parts reads better as `DonutChart` or `BarChart`.',
    },
    ru: {
      good: [
        'Части целого для вложенных категорий',
        'Бюджеты или хранилище, где должны выделяться самые крупные статьи',
      ],
      instead: 'Плоский список из нескольких частей нагляднее в `DonutChart` или `BarChart`.',
    },
  },
  'gauge-chart': {
    en: {
      good: [
        'One value against a known range',
        'Status with threshold bands (low / medium / high)',
      ],
      instead:
        'For progress towards a target use `RadialProgressChart`; for trends use `Sparkline`.',
    },
    ru: {
      good: [
        'Одно значение на известном диапазоне',
        'Статус с пороговыми зонами (низкий / средний / высокий)',
      ],
      instead: 'Для прогресса к цели — `RadialProgressChart`, для тренда — `Sparkline`.',
    },
  },
  'waterfall-chart': {
    en: {
      good: [
        'How a start value becomes an end value',
        'Cash flow, budget variance and profit bridges',
      ],
      instead: 'For independent values per period use `BarChart`.',
    },
    ru: {
      good: [
        'Как начальное значение превращается в итоговое',
        'Денежный поток, отклонения бюджета и «мост» прибыли',
      ],
      instead: 'Для независимых значений по периодам используйте `BarChart`.',
    },
  },
  'combo-chart': {
    en: {
      good: [
        'Two related measures with different units (revenue and margin)',
        'Actuals as bars with a target or average as a line',
      ],
      instead: 'When the series share one unit, a single `LineChart` or `BarChart` is simpler.',
    },
    ru: {
      good: [
        'Два связанных показателя в разных единицах (выручка и маржа)',
        'Факт столбцами, а цель или среднее — линией',
      ],
      instead: 'Если у рядов одна единица измерения, проще обойтись `LineChart` или `BarChart`.',
    },
  },
  'calendar-heatmap': {
    en: {
      good: [
        'Daily activity over months or a year',
        'Seeing streaks, weekly rhythm and quiet periods',
      ],
      instead: 'For exact daily values over a short period use `BarChart` or `LineChart`.',
    },
    ru: {
      good: ['Ежедневная активность за месяцы или год', 'Серии, недельный ритм и периоды затишья'],
      instead:
        'Для точных значений по дням за короткий период используйте `BarChart` или `LineChart`.',
    },
  },
  'stacked-area-chart': {
    en: {
      good: ['How the parts of a total change over time', 'Composition as shares in 100 % mode'],
      instead: 'To compare each series’ own trend use `LineChart`.',
    },
    ru: {
      good: ['Как меняются части целого во времени', 'Состав в долях в режиме 100 %'],
      instead: 'Чтобы сравнивать собственные тренды рядов, используйте `LineChart`.',
    },
  },
};
