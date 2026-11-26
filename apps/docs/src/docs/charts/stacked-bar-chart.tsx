import { StackedBarChart } from '@jafari/charts';
import { registrations } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const stackedBarChart: ChartDoc = {
  slug: 'stacked-bar-chart',
  component: 'StackedBarChart',
  title: { en: 'Stacked bar chart', ru: 'Столбчатая диаграмма с накоплением' },
  group: 'Core',
  summary: {
    en: 'Cumulative bars in absolute or percent mode; mixed signs stack both ways.',
    ru: 'Столбцы с накоплением в абсолютных значениях или процентах; значения разных знаков складываются в обе стороны.',
  },
  description: {
    en: (
      <p>
        Segments are separated by a thin surface gap and only the outermost segment gets rounded
        corners. Positive values stack upwards and negative values downwards from zero, so a balance
        of income and expenses reads correctly.
      </p>
    ),
    ru: (
      <p>
        Сегменты разделены тонким зазором цвета фона, а скруглённые углы есть только у крайнего
        сегмента. Положительные значения складываются от нуля вверх, отрицательные — вниз, поэтому
        баланс доходов и расходов читается правильно.
      </p>
    ),
  },
  thumbnail: () => (
    <StackedBarChart
      data={registrations}
      xKey="month"
      series={[{ key: 'students' }, { key: 'teachers' }, { key: 'admins' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      { id: 'stacked-bar-chart/Basic', title: { en: 'Absolute', ru: 'Абсолютные значения' } },
      { id: 'stacked-bar-chart/Percent', title: { en: 'Percent', ru: 'Проценты' } },
      {
        id: 'stacked-bar-chart/MixedSign',
        title: { en: 'Positive and negative parts', ru: 'Положительные и отрицательные части' },
      },
    ],
    styling: [
      {
        id: 'stacked-bar-chart/Styling',
        title: { en: 'Colours, radius and spacing', ru: 'Цвета, скругление и промежутки' },
      },
      {
        id: 'stacked-bar-chart/Horizontal',
        title: { en: 'Horizontal layout', ru: 'Горизонтальная ориентация' },
      },
    ],
    interaction: [
      {
        id: 'stacked-bar-chart/CustomTooltip',
        title: { en: 'Custom tooltip with a total', ru: 'Своя подсказка с итогом' },
        description: {
          en: (
            <p>
              <code>tooltip.render</code> receives the formatted rows and the active item;{' '}
              <code>sort: 'desc'</code> orders rows by value.
            </p>
          ),
          ru: (
            <p>
              <code>tooltip.render</code> получает отформатированные строки и активный элемент;{' '}
              <code>sort: 'desc'</code> упорядочивает строки по убыванию значения.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'stacked-bar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'stacked-bar-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'StackedBarChart props', ru: 'Пропсы StackedBarChart' },
      note: {
        en: 'All BarChart props except `stacked`.',
        ru: 'Все пропсы BarChart, кроме `stacked`.',
      },
      props: [
        {
          name: 'mode',
          type: "'absolute' | 'percent'",
          default: "'absolute'",
          description: {
            en: '`percent` normalises each category to 100 %.',
            ru: '`percent` нормирует каждую категорию к 100 %.',
          },
        },
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
