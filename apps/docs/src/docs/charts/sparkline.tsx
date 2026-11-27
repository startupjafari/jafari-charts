import { Sparkline } from '@startupjafari/charts';
import { dailyUsers } from '../../examples/data';
import { baseGroup, cartesianGroup } from '../props';
import type { ChartDoc } from '../types';

export const sparkline: ChartDoc = {
  slug: 'sparkline',
  component: 'Sparkline',
  title: { en: 'Sparkline', ru: 'Спарклайн', kk: 'Шағын график' },
  group: 'Core',
  summary: {
    en: 'A word-sized trend for KPI cards and tables: no axes, grid or legend.',
    ru: 'Тренд размером со слово для KPI-карточек и таблиц: без осей, сетки и легенды.',
    kk: 'KPI карточкалары мен кестелерге арналған сөз көлеміндей тренд: осьтерсіз, торсыз және шартты белгілерсіз.',
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
    kk: (
      <p>
        Шағын графиктер әдейі минималистік: қалқымалы кеңес, айқас сызық, анимация және жасырын
        деректер кестесі әдепкіде өшірулі (қолжетімді атау үшін <code>title</code> беріңіз). Әдепкі
        биіктік — 40 px. Сызықтық шағын графиктер деректер аралығына бейімделеді, ал аймақтық және
        бағаналы шағын графиктер нөлді қамтиды.
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
        title: {
          en: 'Line, area and bar',
          ru: 'Линия, область и столбцы',
          kk: 'Сызық, аймақ және бағаналар',
        },
      },
      {
        id: 'sparkline/KpiCards',
        title: { en: 'In a KPI card', ru: 'В KPI-карточке', kk: 'KPI карточкасында' },
      },
    ],
    styling: [
      {
        id: 'sparkline/Styling',
        title: {
          en: 'Colours, curves and markers',
          ru: 'Цвета, кривые и маркеры',
          kk: 'Түстер, қисықтар және маркерлер',
        },
      },
    ],
    interaction: [
      {
        id: 'sparkline/Tooltip',
        title: {
          en: 'Tooltip and crosshair on demand',
          ru: 'Подсказка и перекрестие по запросу',
          kk: 'Қажет кезде қалқымалы кеңес пен айқас сызық',
        },
      },
    ],
    responsive: [
      {
        id: 'sparkline/Responsive',
        title: { en: 'In a narrow table', ru: 'В узкой таблице', kk: 'Тар кестеде' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'sparkline/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next point (when the tooltip is enabled)',
        ru: 'Предыдущая / следующая точка (при включённой подсказке)',
        kk: 'Алдыңғы / келесі нүкте (қалқымалы кеңес қосулы болғанда)',
      },
    ],
    [
      'Home End',
      { en: 'First / last point', ru: 'Первая / последняя точка', kk: 'Бірінші / соңғы нүкте' },
    ],
    [
      'Esc',
      {
        en: 'Clear the active point',
        ru: 'Сбросить активную точку',
        kk: 'Белсенді нүктені алып тастау',
      },
    ],
  ],
  props: [
    {
      title: { en: 'Sparkline props', ru: 'Пропсы Sparkline', kk: 'Sparkline пропстары' },
      note: {
        en: 'All cartesian props except `xAxis`, `yAxis`, `grid` and `legend`, with different defaults.',
        ru: 'Все пропсы декартовых диаграмм, кроме `xAxis`, `yAxis`, `grid` и `legend`, — но с другими значениями по умолчанию.',
        kk: 'Декарттық диаграммалардың `xAxis`, `yAxis`, `grid` және `legend` пропстарынан басқа барлық пропстары — бірақ әдепкі мәндері басқа.',
      },
      props: [
        {
          name: 'variant',
          type: "'line' | 'area' | 'bar'",
          default: "'line'",
          description: { en: 'Mark type.', ru: 'Тип меток.', kk: 'Белгі түрі.' },
        },
        {
          name: 'height',
          type: 'number',
          default: '40',
          description: {
            en: 'Surface height, px.',
            ru: 'Высота области диаграммы, px.',
            kk: 'Диаграмма аймағының биіктігі, px.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'false',
          description: {
            en: 'Off by default.',
            ru: 'По умолчанию выключена.',
            kk: 'Әдепкіде өшірулі.',
          },
        },
        {
          name: 'crosshair',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Off by default.',
            ru: 'По умолчанию выключено.',
            kk: 'Әдепкіде өшірулі.',
          },
        },
        {
          name: 'animation',
          type: 'boolean | AnimationOptions',
          default: 'false',
          description: {
            en: 'Off by default.',
            ru: 'По умолчанию выключена.',
            kk: 'Әдепкіде өшірулі.',
          },
        },
        {
          name: 'accessibilityTable',
          type: 'boolean | number',
          default: 'false',
          description: {
            en: 'No hidden table by default; give the sparkline a `title`.',
            ru: 'По умолчанию скрытой таблицы нет; задайте спарклайну `title`.',
            kk: 'Әдепкіде жасырын кесте жоқ; шағын графикке `title` беріңіз.',
          },
        },
      ],
    },
    cartesianGroup,
    baseGroup,
  ],
};
