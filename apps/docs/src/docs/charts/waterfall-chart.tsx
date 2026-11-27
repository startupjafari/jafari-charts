import { WaterfallChart } from '@startupjafari/charts';
import { cashflow } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const waterfallChart: ChartDoc = {
  slug: 'waterfall-chart',
  component: 'WaterfallChart',
  title: { en: 'Waterfall chart', ru: 'Каскадная диаграмма' },
  group: 'Professional',
  summary: {
    en: 'How a starting value becomes a final value through increases and decreases.',
    ru: 'Как начальное значение становится итоговым через приросты и снижения.',
  },
  description: {
    en: (
      <p>
        Each row is a change; the first row is the starting value (unless{' '}
        <code>firstIsStart={'{false}'}</code>) and rows marked by <code>isTotal</code> show the
        running total. Increases, decreases and totals use the theme’s positive, negative and first
        series colours, and dotted connectors link the bars. Labels show the change, not the level.
      </p>
    ),
    ru: (
      <p>
        Каждая строка — это изменение; первая строка задаёт начальное значение (если не указано{' '}
        <code>firstIsStart={'{false}'}</code>), а строки, отмеченные через <code>isTotal</code>,
        показывают накопленный итог. Приросты, снижения и итоги окрашиваются в цвета темы для
        положительных и отрицательных значений и в цвет первого ряда, а столбцы связаны пунктирными
        соединителями. Подписи показывают изменение, а не уровень.
      </p>
    ),
  },
  thumbnail: () => (
    <WaterfallChart
      data={cashflow}
      xKey="step"
      yKey="value"
      isTotal={(d) => Boolean(d.total)}
      {...THUMB}
      labels={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'waterfall-chart/Basic',
        title: { en: 'Start, changes and totals', ru: 'Начало, изменения и итоги' },
      },
      { id: 'waterfall-chart/Deltas', title: { en: 'Changes only', ru: 'Только изменения' } },
    ],
    styling: [
      {
        id: 'waterfall-chart/Colors',
        title: { en: 'Custom colours, no connectors', ru: 'Свои цвета, без соединителей' },
      },
      {
        id: 'waterfall-chart/Compact',
        title: { en: 'Compact, labels only', ru: 'Компактный вид, только подписи' },
      },
    ],
    interaction: [
      { id: 'waterfall-chart/Interaction', title: { en: 'Click a step', ru: 'Нажатие на шаг' } },
    ],
    responsive: [
      {
        id: 'waterfall-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'waterfall-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'WaterfallChart props', ru: 'Пропсы WaterfallChart' },
      note: {
        en: 'All cartesian props except `series` (one value field via `yKey`), plus bar options.',
        ru: 'Все пропсы декартовых диаграмм, кроме `series` (одно поле значений через `yKey`), а также параметры столбцов.',
      },
      props: [
        {
          name: 'isTotal',
          type: '(datum: T, index: number) => boolean',
          description: {
            en: 'Marks a row as an intermediate or final total; its value is ignored.',
            ru: 'Помечает строку как промежуточный или окончательный итог; её значение игнорируется.',
          },
        },
        {
          name: 'firstIsStart',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Treat the first row as the starting value.',
            ru: 'Считать первую строку начальным значением.',
          },
        },
        {
          name: 'connectors',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Dotted connectors between consecutive bars.',
            ru: 'Пунктирные соединители между соседними столбцами.',
          },
        },
        {
          name: 'colors',
          type: '{ increase?: string; decrease?: string; total?: string }',
          default: {
            en: 'positive / negative / series 1',
            ru: 'positive / negative / цвет ряда 1',
          },
          description: {
            en: 'Colours for increases, decreases and totals.',
            ru: 'Цвета приростов, снижений и итогов.',
          },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: 'false',
          description: {
            en: 'Off by default (one series).',
            ru: 'По умолчанию выключена (ряд всего один).',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Change labels at the bar ends.',
            ru: 'Подписи изменений на концах столбцов.',
          },
        },
      ],
    },
    barGroup,
    cartesianGroup,
    baseGroup,
  ],
};
