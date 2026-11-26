import { HorizontalBarChart } from '@jafari/charts';
import { universities } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const horizontalBarChart: ChartDoc = {
  slug: 'horizontal-bar-chart',
  component: 'HorizontalBarChart',
  title: { en: 'Horizontal bar chart', ru: 'Горизонтальная столбчатая диаграмма' },
  group: 'Core',
  summary: {
    en: 'Rankings and comparisons with long category names, value labels included.',
    ru: 'Рейтинги и сравнения с длинными названиями категорий — сразу с подписями значений.',
  },
  description: {
    en: (
      <p>
        Categories run down the y axis, so long names stay readable (and are truncated with the full
        name in the tooltip). Value labels are on by default. The height grows with the number of
        rows — 32 px per row, between 160 and 560 px — unless you pass <code>height</code>.
      </p>
    ),
    ru: (
      <p>
        Категории идут сверху вниз по оси Y, поэтому длинные названия остаются читаемыми (слишком
        длинные обрезаются, а полное название видно в подсказке). Подписи значений включены по
        умолчанию. Высота растёт с числом строк — 32 px на строку, от 160 до 560 px, — если вы не
        передали <code>height</code>.
      </p>
    ),
  },
  thumbnail: () => (
    <HorizontalBarChart data={universities} xKey="name" yKey="score" {...THUMB} labels={false} />
  ),
  sections: {
    usage: [{ id: 'horizontal-bar-chart/Basic', title: { en: 'Basic', ru: 'Базовый пример' } }],
    styling: [
      {
        id: 'horizontal-bar-chart/Styling',
        title: {
          en: 'Compact bars with formatted labels',
          ru: 'Компактные столбцы с форматированными подписями',
        },
      },
      {
        id: 'horizontal-bar-chart/NoLabels',
        title: { en: 'Without labels, vertical grid', ru: 'Без подписей, с вертикальной сеткой' },
      },
    ],
    interaction: [
      {
        id: 'horizontal-bar-chart/Interaction',
        title: { en: 'Hover events', ru: 'События наведения' },
      },
    ],
    responsive: [
      {
        id: 'horizontal-bar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'horizontal-bar-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'HorizontalBarChart props', ru: 'Пропсы HorizontalBarChart' },
      note: {
        en: 'All BarChart props except `layout`.',
        ru: 'Все пропсы BarChart, кроме `layout`.',
      },
      props: [
        {
          name: 'height',
          type: 'number',
          default: { en: 'rows × 32 + 40 (160–560)', ru: 'число строк × 32 + 40 (160–560)' },
          description: {
            en: 'Grows with the number of rows unless set.',
            ru: 'Если не задана, растёт с числом строк.',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Value labels at bar ends.',
            ru: 'Подписи значений на концах столбцов.',
          },
        },
        {
          name: 'stacked',
          type: "boolean | 'absolute' | 'percent'",
          default: 'false',
          description: {
            en: 'Stack series horizontally.',
            ru: 'Складывает ряды в стек по горизонтали.',
          },
        },
      ],
    },
    barGroup,
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
