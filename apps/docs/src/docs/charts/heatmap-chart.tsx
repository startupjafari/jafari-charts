import { HeatmapChart } from '@jafari/charts';
import { sessionsByHour } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const heatmapChart: ChartDoc = {
  slug: 'heatmap-chart',
  component: 'HeatmapChart',
  title: { en: 'Heatmap', ru: 'Тепловая карта' },
  group: 'Advanced',
  summary: {
    en: 'A value for every pair of two categories, as a grid of coloured cells.',
    ru: 'Значение для каждого сочетания двух категорий в виде сетки цветных ячеек.',
  },
  description: {
    en: (
      <p>
        Columns come from <code>xKey</code>, rows from <code>yKey</code>; several rows for the same
        cell are summed and missing cells use the track colour. Values are quantised into colour
        steps (5 by default) on a sequential scale, or a diverging scale for signed data. All cells
        of a colour step are drawn as one path, so a large grid stays a handful of DOM nodes.
      </p>
    ),
    ru: (
      <p>
        Столбцы берутся из <code>xKey</code>, строки — из <code>yKey</code>; несколько строк данных
        для одной ячейки суммируются, а отсутствующие ячейки закрашиваются цветом подложки (track).
        Значения разбиваются на цветовые ступени (по умолчанию 5) последовательной шкалы, а для
        данных со знаком — расходящейся. Все ячейки одной цветовой ступени рисуются одним путём,
        поэтому даже большая сетка состоит всего из нескольких DOM-узлов.
      </p>
    ),
  },
  thumbnail: () => (
    <HeatmapChart
      data={sessionsByHour}
      xKey="hour"
      yKey="day"
      valueKey="sessions"
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'heatmap-chart/Basic',
        title: { en: 'Sequential scale', ru: 'Последовательная шкала' },
      },
      {
        id: 'heatmap-chart/Diverging',
        title: { en: 'Diverging scale with labels', ru: 'Расходящаяся шкала с подписями' },
      },
    ],
    styling: [
      {
        id: 'heatmap-chart/Styling',
        title: {
          en: 'Colour ramp, thresholds, gaps and radius',
          ru: 'Цветовая шкала, пороги, зазоры и скругление',
        },
      },
    ],
    interaction: [
      {
        id: 'heatmap-chart/Interaction',
        title: { en: 'Click a cell', ru: 'Нажатие на ячейку' },
      },
    ],
    responsive: [
      {
        id: 'heatmap-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'heatmap-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: [
    ['← →', { en: 'Previous / next column', ru: 'Предыдущий / следующий столбец' }],
    ['↑ ↓', { en: 'Previous / next row', ru: 'Предыдущая / следующая строка' }],
    ['Home End', { en: 'First / last cell', ru: 'Первая / последняя ячейка' }],
    [
      'Enter',
      { en: 'Click the active cell (onClick)', ru: 'Нажатие на активную ячейку (onClick)' },
    ],
    ['Esc', { en: 'Clear the active cell', ru: 'Сбросить активную ячейку' }],
  ],
  props: [
    {
      title: { en: 'HeatmapChart props', ru: 'Пропсы HeatmapChart' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: {
            en: 'One row per cell (duplicates are summed).',
            ru: 'Одна строка на ячейку (повторы суммируются).',
          },
        },
        {
          name: 'xKey',
          type: 'DimensionKey<T>',
          required: true,
          description: {
            en: 'Column category (strings, numbers or dates).',
            ru: 'Категория столбца (строки, числа или даты).',
          },
        },
        {
          name: 'yKey',
          type: 'DimensionKey<T>',
          required: true,
          description: { en: 'Row category.', ru: 'Категория строки.' },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: { en: 'Cell value.', ru: 'Значение ячейки.' },
        },
        {
          name: 'xCategories / yCategories',
          type: 'readonly AxisValue[]',
          description: {
            en: 'Column/row order and empty columns/rows (default: first appearance; numbers and dates sort).',
            ru: 'Порядок столбцов/строк и пустые столбцы/строки (по умолчанию — в порядке первого появления; числа и даты сортируются).',
          },
        },
        {
          name: 'colorScale',
          type: "'sequential' | 'diverging'",
          default: "'sequential'",
          description: {
            en: 'One hue, or two hues around `midpoint`.',
            ru: 'Один оттенок или два оттенка по обе стороны от `midpoint`.',
          },
        },
        {
          name: 'buckets',
          type: 'number',
          default: '5',
          description: { en: 'Number of colour steps.', ru: 'Количество цветовых ступеней.' },
        },
        {
          name: 'thresholds',
          type: 'readonly number[]',
          description: {
            en: 'Explicit ascending step boundaries (n thresholds → n + 1 steps).',
            ru: 'Явные границы ступеней по возрастанию (n порогов → n + 1 ступеней).',
          },
        },
        {
          name: 'domain',
          type: 'readonly [number, number]',
          default: { en: 'data extent', ru: 'диапазон данных' },
          description: {
            en: 'Value domain of the colour scale.',
            ru: 'Область значений цветовой шкалы.',
          },
        },
        {
          name: 'midpoint',
          type: 'number',
          default: '0',
          description: {
            en: 'Neutral value of the diverging scale.',
            ru: 'Нейтральная точка расходящейся шкалы.',
          },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1' },
          description: { en: 'Sequential hue.', ru: 'Оттенок последовательной шкалы.' },
        },
        {
          name: 'negativeColor / positiveColor',
          type: 'string',
          description: { en: 'Diverging hues.', ru: 'Оттенки расходящейся шкалы.' },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: {
            en: 'Concrete colour ramp, low → high.',
            ru: 'Явная цветовая шкала, от меньших значений к большим.',
          },
        },
        {
          name: 'emptyColor',
          type: 'string',
          default: { en: 'track token', ru: 'токен track' },
          description: { en: 'Fill of missing cells.', ru: 'Заливка отсутствующих ячеек.' },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Value labels inside cells where they fit.',
            ru: 'Подписи значений внутри ячеек, если они помещаются.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: { en: 'Formats values.', ru: 'Форматирует значения.' },
        },
        {
          name: 'xFormatter / yFormatter',
          type: '(value: AxisValue) => string',
          description: { en: 'Formats category labels.', ru: 'Форматирует подписи категорий.' },
        },
        {
          name: 'valueLabel',
          type: 'string',
          default: { en: "'Value'", ru: "'Значение' (для ru)" },
          description: {
            en: 'Name of the value in tooltips.',
            ru: 'Название значения в подсказках.',
          },
        },
        {
          name: 'gap',
          type: 'number',
          default: '2',
          description: { en: 'Gap between cells, px.', ru: 'Зазор между ячейками, px.' },
        },
        {
          name: 'cornerRadius',
          type: 'number',
          description: {
            en: 'Cell corner radius, px.',
            ru: 'Радиус скругления углов ячеек, px.',
          },
        },
        {
          name: 'xAxis / yAxis',
          type: 'boolean | { hidden?; maxLabelWidth?; title? }',
          default: 'true',
          description: {
            en: 'Category axes; long labels are truncated.',
            ru: 'Оси категорий; длинные подписи обрезаются.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: { en: 'Cell tooltip.', ru: 'Подсказка для ячейки.' },
        },
        {
          name: 'legend',
          type: "boolean | Omit<LegendOptions, 'render' | 'interactive'>",
          default: 'true',
          description: { en: 'Colour-scale legend.', ru: 'Легенда цветовой шкалы.' },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: {
            en: 'Controlled active datum index.',
            ru: 'Контролируемый индекс активной строки данных.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: HeatmapCellEvent<T>) => void',
          description: {
            en: 'Event with `datum`, `x`, `y`, labels, indices and `value`.',
            ru: 'Событие с `datum`, `x`, `y`, подписями, индексами и `value`.',
          },
        },
      ],
    },
    baseGroup,
  ],
};
