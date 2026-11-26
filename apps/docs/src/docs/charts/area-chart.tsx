import { AreaChart } from '@jafari/charts';
import { dailyUsers } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const areaChart: ChartDoc = {
  slug: 'area-chart',
  component: 'AreaChart',
  title: { en: 'Area chart', ru: 'Диаграмма с областями' },
  group: 'Core',
  summary: {
    en: 'A line with a soft gradient fill — volume over time, at a glance.',
    ru: 'Линия с мягкой градиентной заливкой — динамика объёма во времени с первого взгляда.',
  },
  description: {
    en: (
      <p>
        The fill fades towards the baseline so overlapping series stay readable. Areas always grow
        from zero, including below it for negative values. Everything a <code>LineChart</code>{' '}
        accepts works here too, plus <code>gradient</code>.
      </p>
    ),
    ru: (
      <p>
        Заливка бледнеет к базовой линии, поэтому перекрывающиеся ряды остаются читаемыми. Области
        всегда строятся от нуля — для отрицательных значений вниз от него. Здесь работает всё, что
        принимает <code>LineChart</code>, а также <code>gradient</code>.
      </p>
    ),
  },
  thumbnail: () => <AreaChart data={dailyUsers} xKey="date" yKey="users" {...THUMB} />,
  sections: {
    usage: [
      { id: 'area-chart/Basic', title: { en: 'Basic', ru: 'Базовый пример' } },
      {
        id: 'area-chart/MultiSeries',
        title: { en: 'Overlapping series', ru: 'Перекрывающиеся ряды' },
        description: {
          en: <p>Series are drawn in order; the gradient keeps the back series visible.</p>,
          ru: <p>Ряды рисуются по порядку; благодаря градиенту задние ряды остаются видны.</p>,
        },
      },
      {
        id: 'area-chart/Negative',
        title: { en: 'Negative values and gaps', ru: 'Отрицательные значения и пропуски' },
      },
    ],
    styling: [
      {
        id: 'area-chart/Solid',
        title: {
          en: 'Solid fill, linear curve, markers',
          ru: 'Сплошная заливка, линейная кривая, маркеры',
        },
        description: {
          en: (
            <p>
              <code>gradient={'{false}'}</code> uses a flat translucent fill.
            </p>
          ),
          ru: (
            <p>
              <code>gradient={'{false}'}</code> включает ровную полупрозрачную заливку.
            </p>
          ),
        },
      },
      {
        id: 'area-chart/Step',
        title: {
          en: 'Step curve with a fixed value range',
          ru: 'Ступенчатая кривая и фиксированный диапазон значений',
        },
      },
    ],
    interaction: [
      {
        id: 'area-chart/Brush',
        title: { en: 'Brush selection', ru: 'Выделение диапазона (brush)' },
        description: {
          en: (
            <p>
              <code>brush</code> lets users drag a range; <code>onBrush</code> receives the range
              and the first/last data index.
            </p>
          ),
          ru: (
            <p>
              <code>brush</code> позволяет выделить диапазон перетаскиванием; <code>onBrush</code>{' '}
              получает диапазон и индексы первой и последней точки данных.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'area-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'area-chart/States',
        title: { en: 'Empty, loading and error', ru: 'Нет данных, загрузка и ошибка' },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'AreaChart props', ru: 'Пропсы AreaChart' },
      props: [
        {
          name: 'gradient',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Gradient fill fading towards the baseline; `false` for a flat fill.',
            ru: 'Градиентная заливка, бледнеющая к базовой линии; `false` — ровная заливка.',
          },
        },
      ],
    },
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};
