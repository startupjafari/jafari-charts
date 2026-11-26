import { RadarChart } from '@jafari/charts';
import { profiles } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const radarChart: ChartDoc = {
  slug: 'radar-chart',
  component: 'RadarChart',
  title: { en: 'Radar chart', ru: 'Лепестковая диаграмма' },
  group: 'Advanced',
  summary: {
    en: 'Compare a few profiles across several metrics on radial spokes.',
    ru: 'Сравнение нескольких профилей по нескольким метрикам, отложенным на радиальных лучах.',
  },
  description: {
    en: (
      <p>
        Each data row is a metric (a spoke); each entry of <code>series</code> is a dataset drawn as
        a polygon. Rings sit at nice values; the scale starts at zero unless values are negative.
        Hovering a spoke shows every dataset’s value for that metric.
      </p>
    ),
    ru: (
      <p>
        Каждая строка данных — это метрика (луч), а каждая запись <code>series</code> — набор
        данных, который рисуется многоугольником. Кольца сетки проходят по круглым значениям; шкала
        начинается с нуля, если среди значений нет отрицательных. При наведении на луч показываются
        значения всех наборов данных для этой метрики.
      </p>
    ),
  },
  thumbnail: () => (
    <RadarChart
      data={profiles}
      labelKey="metric"
      series={[{ key: 'north' }, { key: 'south' }]}
      height={120}
      ticks={false}
      dots={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      { id: 'radar-chart/Basic', title: { en: 'One dataset', ru: 'Один набор данных' } },
      {
        id: 'radar-chart/Compare',
        title: { en: 'Comparing datasets', ru: 'Сравнение наборов данных' },
      },
    ],
    styling: [
      {
        id: 'radar-chart/Styling',
        title: {
          en: 'Circular grid, fills, shapes and start angle',
          ru: 'Круглая сетка, заливки, формы и начальный угол',
        },
      },
    ],
    interaction: [
      {
        id: 'radar-chart/Interaction',
        title: { en: 'Controlled active metric', ru: 'Контролируемая активная метрика' },
      },
    ],
    responsive: [
      {
        id: 'radar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'radar-chart/States', title: { en: 'Loading', ru: 'Загрузка' } }],
  },
  keyboard: [
    ['← →', { en: 'Previous / next metric (spoke)', ru: 'Предыдущая / следующая метрика (луч)' }],
    [
      '↑ ↓',
      {
        en: 'Focus one dataset at the metric',
        ru: 'Фокус на одном наборе данных в этой метрике',
      },
    ],
    ['Home End', { en: 'First / last metric', ru: 'Первая / последняя метрика' }],
    ['Enter', { en: 'Click (onClick)', ru: 'Нажатие (onClick)' }],
    ['Esc', { en: 'Clear', ru: 'Сбросить' }],
  ],
  props: [
    {
      title: { en: 'RadarChart props', ru: 'Пропсы RadarChart' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: { en: 'One row per metric (spoke).', ru: 'Одна строка на метрику (луч).' },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          required: true,
          description: { en: 'Field naming each metric.', ru: 'Поле с названием метрики.' },
        },
        {
          name: 'series',
          type: 'readonly { key; label?; color?; symbol?; format? }[]',
          required: true,
          description: {
            en: 'Datasets drawn as polygons.',
            ru: 'Наборы данных, которые рисуются многоугольниками.',
          },
        },
        {
          name: 'min',
          type: 'number',
          default: '0',
          description: {
            en: 'Value at the centre (a nice minimum for negative data).',
            ru: 'Значение в центре (для отрицательных данных — округлённый минимум).',
          },
        },
        {
          name: 'max',
          type: 'number',
          default: { en: 'nice maximum', ru: 'округлённый максимум' },
          description: { en: 'Value at the outer ring.', ru: 'Значение на внешнем кольце.' },
        },
        {
          name: 'levels',
          type: 'number',
          default: { en: '4–5 nice rings', ru: '4–5 колец по круглым значениям' },
          description: { en: 'Number of grid rings.', ru: 'Количество колец сетки.' },
        },
        {
          name: 'shape',
          type: "'polygon' | 'circle'",
          default: "'polygon'",
          description: { en: 'Grid ring shape.', ru: 'Форма колец сетки.' },
        },
        {
          name: 'dots',
          type: 'boolean',
          default: 'true',
          description: { en: 'Markers on every vertex.', ru: 'Маркеры в каждой вершине.' },
        },
        {
          name: 'fillOpacity',
          type: 'number',
          default: '0.14',
          description: {
            en: 'Polygon fill opacity.',
            ru: 'Непрозрачность заливки многоугольников.',
          },
        },
        {
          name: 'startAngle',
          type: 'number',
          default: '0',
          description: {
            en: "Angle of the first spoke, degrees clockwise from 12 o'clock.",
            ru: 'Угол первого луча в градусах, по часовой стрелке от отметки «12 часов».',
          },
        },
        {
          name: 'ticks',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Value labels along the first spoke.',
            ru: 'Подписи значений вдоль первого луча.',
          },
        },
        {
          name: 'tickFormatter',
          type: '(value: number) => string',
          description: { en: 'Formats ring labels.', ru: 'Форматирует подписи колец.' },
        },
        {
          name: 'valueFormatter',
          type: '(value: number, series: string) => string',
          description: {
            en: 'Formats values in tooltips and the table.',
            ru: 'Форматирует значения в подсказках и таблице данных.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: { en: 'Tooltip per metric.', ru: 'Подсказка для каждой метрики.' },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: { en: '2+ datasets', ru: 'от 2 наборов данных' },
          description: {
            en: 'Legend; items toggle datasets.',
            ru: 'Легенда; её элементы скрывают и показывают наборы данных.',
          },
        },
        {
          name: 'differentiate',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Marker shapes and dash patterns per dataset.',
            ru: 'Свои формы маркеров и типы штриховки для каждого набора данных.',
          },
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: {
            en: 'Controlled or initial hidden datasets.',
            ru: 'Скрытые наборы данных: контролируемый или начальный список.',
          },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: {
            en: 'Controlled active metric index.',
            ru: 'Контролируемый индекс активной метрики.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: RadarEvent<T>) => void',
          description: {
            en: 'Event with `datum`, `index`, `label`, `series`, `value`.',
            ru: 'Событие с `datum`, `index`, `label`, `series`, `value`.',
          },
        },
      ],
    },
    baseGroup,
  ],
};
