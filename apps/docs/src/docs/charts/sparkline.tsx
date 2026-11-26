import { Sparkline } from '@jafari/charts';
import { dailyUsers } from '../../examples/data';
import { baseGroup, cartesianGroup } from '../props';
import type { ChartDoc } from '../types';

export const sparkline: ChartDoc = {
  slug: 'sparkline',
  component: 'Sparkline',
  title: { en: 'Sparkline', ru: 'Спарклайн' },
  group: 'Core',
  summary: {
    en: 'A word-sized trend for KPI cards and tables: no axes, grid or legend.',
    ru: 'Тренд размером со слово для KPI-карточек и таблиц: без осей, сетки и легенды.',
  },
  description: {
    en: (
      <p>
        Sparklines are minimal by design: tooltip, crosshair, animation and the hidden data table
        are off by default (pass <code>title</code> for an accessible name). The default height is
        40 px. Line sparklines zoom to the data range; area and bar sparklines include zero.
      </p>
    ),
    ru: (
      <p>
        Спарклайны минималистичны намеренно: подсказка, перекрестие, анимация и скрытая таблица
        данных по умолчанию выключены (чтобы задать доступное имя, передайте <code>title</code>).
        Высота по умолчанию — 40 px. Линейные спарклайны подстраиваются под диапазон данных, а
        спарклайны с областью и столбцами включают ноль.
      </p>
    ),
  },
  thumbnail: () => (
    <div style={{ display: 'grid', gap: 10, padding: '18px 0' }}>
      <Sparkline data={dailyUsers.slice(-40)} xKey="date" yKey="users" height={36} />
      <Sparkline
        data={dailyUsers.slice(-24)}
        xKey="date"
        yKey="sessions"
        variant="bar"
        color="var(--jc-series-3)"
        height={36}
      />
    </div>
  ),
  sections: {
    usage: [
      {
        id: 'sparkline/Variants',
        title: { en: 'Line, area and bar', ru: 'Линия, область и столбцы' },
      },
      { id: 'sparkline/KpiCards', title: { en: 'In a KPI card', ru: 'В KPI-карточке' } },
    ],
    styling: [
      {
        id: 'sparkline/Styling',
        title: { en: 'Colours, curves and markers', ru: 'Цвета, кривые и маркеры' },
      },
    ],
    interaction: [
      {
        id: 'sparkline/Tooltip',
        title: {
          en: 'Tooltip and crosshair on demand',
          ru: 'Подсказка и перекрестие по запросу',
        },
      },
    ],
    responsive: [
      {
        id: 'sparkline/Responsive',
        title: { en: 'In a narrow table', ru: 'В узкой таблице' },
        width: 320,
      },
    ],
    empty: [{ id: 'sparkline/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next point (when the tooltip is enabled)',
        ru: 'Предыдущая / следующая точка (при включённой подсказке)',
      },
    ],
    ['Home End', { en: 'First / last point', ru: 'Первая / последняя точка' }],
    ['Esc', { en: 'Clear the active point', ru: 'Сбросить активную точку' }],
  ],
  props: [
    {
      title: { en: 'Sparkline props', ru: 'Пропсы Sparkline' },
      note: {
        en: 'All cartesian props except `xAxis`, `yAxis`, `grid` and `legend`, with different defaults.',
        ru: 'Все пропсы декартовых диаграмм, кроме `xAxis`, `yAxis`, `grid` и `legend`, — но с другими значениями по умолчанию.',
      },
      props: [
        {
          name: 'variant',
          type: "'line' | 'area' | 'bar'",
          default: "'line'",
          description: { en: 'Mark type.', ru: 'Тип меток.' },
        },
        {
          name: 'height',
          type: 'number',
          default: '40',
          description: { en: 'Surface height, px.', ru: 'Высота области диаграммы, px.' },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'false',
          description: { en: 'Off by default.', ru: 'По умолчанию выключена.' },
        },
        {
          name: 'crosshair',
          type: 'boolean',
          default: 'false',
          description: { en: 'Off by default.', ru: 'По умолчанию выключено.' },
        },
        {
          name: 'animation',
          type: 'boolean | AnimationOptions',
          default: 'false',
          description: { en: 'Off by default.', ru: 'По умолчанию выключена.' },
        },
        {
          name: 'accessibilityTable',
          type: 'boolean | number',
          default: 'false',
          description: {
            en: 'No hidden table by default; give the sparkline a `title`.',
            ru: 'По умолчанию скрытой таблицы нет; задайте спарклайну `title`.',
          },
        },
      ],
    },
    cartesianGroup,
    baseGroup,
  ],
};
