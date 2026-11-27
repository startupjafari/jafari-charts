import { GroupedBarChart } from '@startupjafari/charts';
import { complaints } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const groupedBarChart: ChartDoc = {
  slug: 'grouped-bar-chart',
  component: 'GroupedBarChart',
  title: { en: 'Grouped bar chart', ru: 'Сгруппированная столбчатая диаграмма' },
  group: 'Core',
  summary: {
    en: 'Several series side by side within each category.',
    ru: 'Несколько рядов бок о бок внутри каждой категории.',
  },
  description: {
    en: (
      <p>
        Bars of one category touch with a small <code>barGap</code>; categories are separated by{' '}
        <code>categoryGap</code>. The legend toggles series and the remaining bars widen to fill the
        group.
      </p>
    ),
    ru: (
      <p>
        Столбцы одной категории стоят почти вплотную, с небольшим зазором <code>barGap</code>;
        категории разделены промежутком <code>categoryGap</code>. Легенда скрывает и показывает
        ряды, а оставшиеся столбцы расширяются и заполняют группу.
      </p>
    ),
  },
  thumbnail: () => (
    <GroupedBarChart
      data={complaints}
      xKey="category"
      series={[{ key: 'open' }, { key: 'resolved' }, { key: 'rejected' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      { id: 'grouped-bar-chart/Basic', title: { en: 'Basic', ru: 'Базовый пример' } },
      {
        id: 'grouped-bar-chart/Horizontal',
        title: { en: 'Horizontal layout', ru: 'Горизонтальная ориентация' },
      },
    ],
    styling: [
      {
        id: 'grouped-bar-chart/Styling',
        title: { en: 'Gaps, sizes and colours', ru: 'Промежутки, размеры и цвета' },
      },
      {
        id: 'grouped-bar-chart/Labels',
        title: { en: 'Labels instead of an axis', ru: 'Подписи вместо оси' },
      },
    ],
    interaction: [
      {
        id: 'grouped-bar-chart/Legend',
        title: {
          en: 'Legend toggling and item tooltips',
          ru: 'Переключение рядов в легенде и подсказки для отдельных столбцов',
        },
        description: {
          en: (
            <p>
              <code>defaultHiddenSeries</code> starts with a series hidden;{' '}
              <code>tooltip={'{{ mode: "item" }}'}</code> shows only the bar under the pointer.
            </p>
          ),
          ru: (
            <p>
              <code>defaultHiddenSeries</code> изначально скрывает ряд;{' '}
              <code>tooltip={'{{ mode: "item" }}'}</code> показывает только столбец под указателем.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'grouped-bar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'grouped-bar-chart/States',
        title: { en: 'Error with retry', ru: 'Ошибка и повторная попытка' },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'GroupedBarChart props', ru: 'Пропсы GroupedBarChart' },
      note: {
        en: 'All BarChart props except `stacked`.',
        ru: 'Все пропсы BarChart, кроме `stacked`.',
      },
      props: [
        {
          name: 'layout',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: {
            en: '`horizontal` draws categories on the left. `xAxis` still configures the categories and `yAxis` the values, whichever side they are on.',
            ru: '`horizontal` размещает категории слева. Категории по-прежнему настраивает `xAxis`, а значения — `yAxis`, на какой бы стороне они ни были.',
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
