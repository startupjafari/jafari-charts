import { PieChart } from '@jafari/charts';
import { devices } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup, PIE_PROPS } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const pieChart: ChartDoc = {
  slug: 'pie-chart',
  component: 'PieChart',
  title: { en: 'Pie chart', ru: 'Круговая диаграмма' },
  group: 'Core',
  summary: {
    en: 'Part-to-whole for a handful of categories, with percentage labels.',
    ru: 'Доли целого для нескольких категорий, с процентными подписями.',
  },
  description: {
    en: (
      <p>
        Slices keep a small gap and rounded corners; percentage labels appear inside slices large
        enough to hold them, or outside with leader lines. Tiny shares read “&lt;1%” instead of
        “0%”. The legend shows each slice’s share and toggles slices. For more than five or six
        categories a bar chart is usually easier to read.
      </p>
    ),
    ru: (
      <p>
        Между секторами остаётся небольшой зазор, углы скруглены; процентные подписи появляются
        внутри секторов, в которые они помещаются, или снаружи с выносными линиями. Крошечные доли
        подписываются «&lt;1%», а не «0%». Легенда показывает долю каждого сектора и позволяет
        скрывать и показывать секторы. Если категорий больше пяти-шести, столбчатая диаграмма обычно
        читается легче.
      </p>
    ),
  },
  thumbnail: () => (
    <PieChart data={devices} labelKey="device" valueKey="share" {...THUMB_POLAR} labels={false} />
  ),
  sections: {
    usage: [
      { id: 'pie-chart/Basic', title: { en: 'Basic', ru: 'Базовый пример' } },
      { id: 'pie-chart/Outside', title: { en: 'Outside labels', ru: 'Подписи снаружи' } },
    ],
    styling: [
      {
        id: 'pie-chart/Styling',
        title: {
          en: 'Half pie, custom colours, sorted',
          ru: 'Полукруг, свои цвета, сортировка',
        },
      },
      {
        id: 'pie-chart/Classic',
        title: { en: 'Classic pie without gaps', ru: 'Классическая круговая без зазоров' },
      },
    ],
    interaction: [
      {
        id: 'pie-chart/Interaction',
        title: { en: 'Controlled legend and clicks', ru: 'Контролируемая легенда и нажатия' },
      },
    ],
    responsive: [
      {
        id: 'pie-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'pie-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: ITEM_KEYS,
  props: [{ title: { en: 'PieChart props', ru: 'Пропсы PieChart' }, props: PIE_PROPS }, baseGroup],
};
