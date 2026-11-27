import { GaugeChart } from '@startupjafari/charts';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const gaugeChart: ChartDoc = {
  slug: 'gauge-chart',
  component: 'GaugeChart',
  title: { en: 'Gauge chart', ru: 'Шкала-индикатор (gauge)', kk: 'Шкала көрсеткіші' },
  group: 'Advanced',
  summary: {
    en: 'A single value against a range, with optional threshold bands and a needle.',
    ru: 'Одно значение на шкале диапазона — при желании с цветовыми диапазонами порогов и стрелкой.',
    kk: 'Диапазон шкаласындағы бір мән — қажет болса, шекті мәндердің түсті аралықтарымен және тілшемен.',
  },
  description: {
    en: (
      <p>
        The value arc takes the colour of the band it falls into (or <code>color</code>). With{' '}
        <code>needle</code>, the bands become the scale and a needle points at the value. Variants:
        semicircle, 270° arc and full ring.
      </p>
    ),
    ru: (
      <p>
        Дуга значения принимает цвет диапазона, в который попадает значение (или цвет из{' '}
        <code>color</code>). С <code>needle</code> цветовые диапазоны становятся шкалой, а на
        значение указывает стрелка. Варианты: полукруг, дуга 270° и полное кольцо.
      </p>
    ),
    kk: (
      <p>
        Мән доғасы мән түскен аралықтың түсін алады (немесе <code>color</code> түсін).{' '}
        <code>needle</code> қосылса, түсті аралықтар шкалаға айналады, ал мәнді тілше көрсетеді.
        Нұсқалары: жарты шеңбер, 270° доға және толық сақина.
      </p>
    ),
  },
  thumbnail: () => (
    <GaugeChart
      value={68}
      height={120}
      animation={false}
      accessibilityTable={false}
      scaleLabels={false}
      bands={[
        { to: 40, color: 'var(--jc-negative)' },
        { to: 75, color: 'var(--jc-warning)' },
        { to: 100, color: 'var(--jc-positive)' },
      ]}
    />
  ),
  sections: {
    usage: [
      {
        id: 'gauge-chart/Basic',
        title: {
          en: 'Threshold bands',
          ru: 'Цветовые диапазоны порогов',
          kk: 'Шекті мәндердің түсті аралықтары',
        },
      },
      {
        id: 'gauge-chart/Needle',
        title: { en: 'Needle on an arc', ru: 'Стрелка на дуге', kk: 'Доғадағы тілше' },
      },
    ],
    styling: [
      {
        id: 'gauge-chart/Styling',
        title: {
          en: 'Custom range, colour, full ring',
          ru: 'Свой диапазон, цвет, полное кольцо',
          kk: 'Жеке диапазон, түс, толық сақина',
        },
      },
    ],
    interaction: [
      {
        id: 'gauge-chart/Interaction',
        title: { en: 'Animated value', ru: 'Анимированное значение', kk: 'Анимациялы мән' },
      },
    ],
    responsive: [
      {
        id: 'gauge-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      { id: 'gauge-chart/States', title: { en: 'No value', ru: 'Нет значения', kk: 'Мән жоқ' } },
    ],
  },
  sectionNotes: {
    interaction: {
      en: (
        <p>
          The gauge shows one value, so it has no tooltip; the value is announced to screen readers
          and listed in the hidden data table with the range.
        </p>
      ),
      ru: (
        <p>
          Шкала-индикатор показывает одно значение, поэтому подсказки у неё нет; значение
          озвучивается скринридерами и вместе с диапазоном приводится в скрытой таблице данных.
        </p>
      ),
      kk: (
        <p>
          Шкала көрсеткіші бір ғана мәнді көрсетеді, сондықтан онда қалқымалы кеңес жоқ; мәнді экран
          оқу құралдары дауыстап оқиды, ал диапазонымен бірге ол жасырын деректер кестесінде
          беріледі.
        </p>
      ),
    },
  },
  keyboard: [
    [
      'Tab',
      {
        en: 'Focus the gauge; its value, minimum and maximum are announced',
        ru: 'Перевести фокус на шкалу; озвучиваются значение, минимум и максимум',
        kk: 'Шкалаға фокус қою; мән, ең аз және ең көп мәндер дауыстап оқылады',
      },
    ],
  ],
  props: [
    {
      title: { en: 'GaugeChart props', ru: 'Пропсы GaugeChart', kk: 'GaugeChart пропстары' },
      props: [
        {
          name: 'value',
          type: 'number',
          required: true,
          description: {
            en: 'Current value. `NaN` shows the empty state.',
            ru: 'Текущее значение. При `NaN` показывается состояние «нет данных».',
            kk: 'Ағымдағы мән. `NaN` болса, «Деректер жоқ» күйі көрсетіледі.',
          },
        },
        {
          name: 'min',
          type: 'number',
          default: '0',
          description: { en: 'Start of the scale.', ru: 'Начало шкалы.', kk: 'Шкаланың басы.' },
        },
        {
          name: 'max',
          type: 'number',
          default: '100',
          description: { en: 'End of the scale.', ru: 'Конец шкалы.', kk: 'Шкаланың соңы.' },
        },
        {
          name: 'bands',
          type: 'readonly { to: number; color: string; label?: string }[]',
          description: {
            en: 'Coloured ranges, ascending by `to`. The active band’s label is shown.',
            ru: 'Цветовые диапазоны в порядке возрастания `to`. Показывается подпись активного диапазона.',
            kk: '`to` мәні бойынша өсу ретімен берілген түсті аралықтар. Белсенді аралықтың жазуы көрсетіледі.',
          },
        },
        {
          name: 'variant',
          type: "'semi' | 'arc' | 'full'",
          default: "'semi'",
          description: {
            en: 'Semicircle, 270° arc or full ring.',
            ru: 'Полукруг, дуга 270° или полное кольцо.',
            kk: 'Жарты шеңбер, 270° доға немесе толық сақина.',
          },
        },
        {
          name: 'needle',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Needle over the band scale.',
            ru: 'Стрелка поверх шкалы из цветовых диапазонов.',
            kk: 'Түсті аралықтардан тұратын шкаланың үстіндегі тілше.',
          },
        },
        {
          name: 'color',
          type: 'string',
          description: {
            en: 'Value arc colour (default: band colour or series 1).',
            ru: 'Цвет дуги значения (по умолчанию — цвет диапазона или ряда 1).',
            kk: 'Мән доғасының түсі (әдепкі — аралықтың немесе 1-қатардың түсі).',
          },
        },
        {
          name: 'thickness',
          type: 'number',
          default: { en: '16 % of radius', ru: '16 % радиуса', kk: 'радиустың 16 %-ы' },
          description: {
            en: 'Arc thickness, px.',
            ru: 'Толщина дуги, px.',
            kk: 'Доғаның қалыңдығы, px.',
          },
        },
        {
          name: 'label',
          type: 'ReactNode',
          description: {
            en: 'Caption under the value.',
            ru: 'Подпись под значением.',
            kk: 'Мәннің астындағы жазу.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: {
            en: 'Formats value and scale labels.',
            ru: 'Форматирует значение и подписи шкалы.',
            kk: 'Мәнді және шкала жазуларын пішімдейді.',
          },
        },
        {
          name: 'scaleLabels',
          type: 'boolean',
          default: 'true (semi, arc)',
          description: {
            en: 'Min/max labels at the arc ends.',
            ru: 'Подписи минимума и максимума на концах дуги.',
            kk: 'Доғаның шеттеріндегі ең аз және ең көп мән жазулары.',
          },
        },
      ],
    },
    baseGroup,
  ],
};
