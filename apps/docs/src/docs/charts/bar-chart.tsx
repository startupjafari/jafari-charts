import { BarChart } from '@jafari/charts';
import { registrations } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const barChart: ChartDoc = {
  slug: 'bar-chart',
  component: 'BarChart',
  title: { en: 'Bar chart', ru: 'Столбчатая диаграмма' },
  group: 'Core',
  summary: {
    en: 'Compare values across categories or periods with rounded, crisp bars.',
    ru: 'Сравнение значений по категориям или периодам — чёткие столбцы со скруглёнными краями.',
  },
  description: {
    en: (
      <>
        <p>
          Only the data end of a bar is rounded, so the baseline stays flat. Negative values grow
          downwards from an emphasised zero line. Dates on the x axis become categories (bars need
          bands) with an inferred, thinned label format.
        </p>
        <p>
          All bars of a series are drawn as one batched <code>&lt;path&gt;</code>; hovering uses
          band inversion instead of per-bar DOM listeners, so 365 bars cost the same DOM as 12.
        </p>
      </>
    ),
    ru: (
      <>
        <p>
          Скругляется только конец столбца со стороны значения, поэтому базовая линия остаётся
          ровной. Отрицательные значения растут вниз от выделенной нулевой линии. Даты на оси X
          превращаются в категории (столбцам нужны полосы); формат подписей определяется
          автоматически, а лишние подписи пропускаются.
        </p>
        <p>
          Все столбцы ряда рисуются одним общим <code>&lt;path&gt;</code>; столбец под указателем
          находится обратным преобразованием шкалы полос, а не DOM-обработчиками на каждом столбце,
          поэтому 365 столбцов дают столько же DOM-узлов, сколько 12.
        </p>
      </>
    ),
  },
  thumbnail: () => <BarChart data={registrations} xKey="month" yKey="students" {...THUMB} />,
  sections: {
    usage: [
      { id: 'bar-chart/Basic', title: { en: 'Basic', ru: 'Базовый пример' } },
      {
        id: 'bar-chart/Negative',
        title: { en: 'Negative values with labels', ru: 'Отрицательные значения с подписями' },
      },
      {
        id: 'bar-chart/ManyBars',
        title: { en: 'Many bars over dates', ru: 'Много столбцов по датам' },
      },
    ],
    styling: [
      {
        id: 'bar-chart/Styling',
        title: {
          en: 'Radius, thickness, gaps and labels',
          ru: 'Скругление, толщина, промежутки и подписи',
        },
        description: {
          en: (
            <p>
              <code>barRadius</code>, <code>maxBarSize</code> and <code>categoryGap</code> shape the
              bars; hiding the y axis and grid in favour of labels makes a clean card chart.
            </p>
          ),
          ru: (
            <p>
              <code>barRadius</code>, <code>maxBarSize</code> и <code>categoryGap</code> задают
              форму столбцов; если скрыть ось Y и сетку и оставить подписи, получится лаконичная
              диаграмма для карточки.
            </p>
          ),
        },
      },
      {
        id: 'bar-chart/Theme',
        title: { en: 'Custom theme', ru: 'Своя тема' },
        description: {
          en: (
            <p>
              <code>createTheme</code> overrides tokens for one chart, per mode if needed. Here with{' '}
              <code>stacked</code> bars.
            </p>
          ),
          ru: (
            <p>
              <code>createTheme</code> переопределяет токены для одной диаграммы — при необходимости
              отдельно для светлого и тёмного режимов. В примере столбцы с накоплением (
              <code>stacked</code>).
            </p>
          ),
        },
      },
    ],
    interaction: [
      {
        id: 'bar-chart/Selection',
        title: { en: 'Click to select', ru: 'Выбор нажатием' },
        description: {
          en: (
            <p>
              <code>onClick</code> receives the datum; a <code>ChartReferenceLine</code> marks the
              selection.
            </p>
          ),
          ru: (
            <p>
              <code>onClick</code> получает строку данных; <code>ChartReferenceLine</code> отмечает
              выбранную категорию.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'bar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'bar-chart/States',
        title: { en: 'Empty, loading and error', ru: 'Нет данных, загрузка и ошибка' },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'BarChart props', ru: 'Пропсы BarChart' },
      props: [
        {
          name: 'layout',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: {
            en: '`horizontal` draws categories on the y axis.',
            ru: '`horizontal` размещает категории на оси Y.',
          },
        },
        {
          name: 'stacked',
          type: "boolean | 'absolute' | 'percent'",
          default: 'false',
          description: {
            en: 'Stack series (see also StackedBarChart).',
            ru: 'Складывает ряды в стек (см. также StackedBarChart).',
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
