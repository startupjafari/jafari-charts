import { StackedAreaChart } from '@jafari/charts';
import { activity } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const stackedAreaChart: ChartDoc = {
  slug: 'stacked-area-chart',
  component: 'StackedAreaChart',
  title: { en: 'Stacked area chart', ru: 'Диаграмма с областями и накоплением' },
  group: 'Professional',
  summary: {
    en: 'Parts of a total over time, in absolute values or as a 100 % composition.',
    ru: 'Составные части целого во времени — в абсолютных значениях или в долях от 100 %.',
  },
  description: {
    en: (
      <p>
        Series stack in order. When the input is large, all layers are downsampled with the same
        indices so their boundaries stay aligned. The tooltip lists every layer at the active date.
      </p>
    ),
    ru: (
      <p>
        Ряды складываются в стек по порядку. На больших объёмах данных все слои прореживаются по
        одним и тем же индексам, поэтому их границы остаются согласованными. Подсказка перечисляет
        все слои на активную дату.
      </p>
    ),
  },
  thumbnail: () => (
    <StackedAreaChart
      data={activity}
      xKey="date"
      series={[{ key: 'students' }, { key: 'teachers' }, { key: 'staff' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      {
        id: 'stacked-area-chart/Basic',
        title: { en: 'Absolute', ru: 'Абсолютные значения' },
      },
      {
        id: 'stacked-area-chart/Percent',
        title: { en: 'Percent', ru: 'Проценты' },
        description: {
          en: (
            <p>
              <code>mode="percent"</code> normalises every x position to 100 %.
            </p>
          ),
          ru: (
            <p>
              <code>mode="percent"</code> нормирует каждую позицию по X к 100 %.
            </p>
          ),
        },
      },
    ],
    styling: [
      {
        id: 'stacked-area-chart/Styling',
        title: {
          en: 'Solid layers, colours, legend on top, sorted tooltip',
          ru: 'Сплошные слои, цвета, легенда сверху, сортировка в подсказке',
        },
      },
      {
        id: 'stacked-area-chart/Stepped',
        title: { en: 'Step curve without axes', ru: 'Ступенчатая кривая без осей' },
      },
    ],
    interaction: [
      {
        id: 'stacked-area-chart/Highlight',
        title: { en: 'Highlight and toggle series', ru: 'Выделение и переключение рядов' },
        description: {
          en: (
            <p>
              <code>highlightedSeries</code> fades the other layers; legend clicks update{' '}
              <code>hiddenSeries</code>.
            </p>
          ),
          ru: (
            <p>
              <code>highlightedSeries</code> приглушает остальные слои; нажатия в легенде обновляют{' '}
              <code>hiddenSeries</code>.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'stacked-area-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'stacked-area-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'StackedAreaChart props', ru: 'Пропсы StackedAreaChart' },
      props: [
        {
          name: 'mode',
          type: "'absolute' | 'percent'",
          default: "'absolute'",
          description: {
            en: '`percent` normalises each x position to 100 %.',
            ru: '`percent` нормирует каждую позицию по X к 100 %.',
          },
        },
        {
          name: 'gradient',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Gradient fill; `false` for flat layers.',
            ru: 'Градиентная заливка; `false` — сплошные слои.',
          },
        },
      ],
    },
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
